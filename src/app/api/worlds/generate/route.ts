import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { createWorld, createEntity, createEvent, createRelation, createEra, createEventEntityLinks, logActivity } from '@/lib/queries';
import { ENTITY_COLORS, slugify } from '@/lib/utils';
import { prisma } from '@/lib/prisma';
import { getTokenBalance } from '@/lib/payouts/solana';
import { resolveTier } from '@/lib/payouts/config';
import type { EntityType } from '@prisma/client';

const VALID_TYPES: EntityType[] = ['CHARACTER', 'LOCATION', 'FACTION', 'ARTIFACT', 'SPECIES', 'EVENT'];

// Holder perk: token holders get bigger, higher-quality world generation that
// scales with their tier. Non-holders get the standard size on the fast model.
function genPlan(tierKey: string, qualifies: boolean) {
  if (!qualifies) return { model: 'google/gemini-2.5-flash', eras: 2, entities: 4, events: 3, relations: 3, maxTokens: 4000 };
  switch (tierKey) {
    case 'diamond': return { model: 'anthropic/claude-sonnet-4', eras: 4, entities: 12, events: 8, relations: 9, maxTokens: 8000 };
    case 'gold':    return { model: 'anthropic/claude-sonnet-4', eras: 3, entities: 10, events: 6, relations: 7, maxTokens: 7000 };
    case 'silver':  return { model: 'anthropic/claude-sonnet-4', eras: 3, entities: 8,  events: 5, relations: 6, maxTokens: 6000 };
    case 'bronze':  return { model: 'google/gemini-2.5-flash',   eras: 3, entities: 7,  events: 4, relations: 5, maxTokens: 5500 };
    default:        return { model: 'google/gemini-2.5-flash',   eras: 2, entities: 6,  events: 4, relations: 4, maxTokens: 5000 }; // holder
  }
}

export async function POST(request: Request) {
 try {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'AI generation not configured. Add OPENROUTER_API_KEY to .env' }, { status: 500 });
  }

  const body = await request.json();
  const concept = body.concept || 'A unique and interesting fantasy world';
  const visibility = body.visibility === 'PUBLIC' ? 'PUBLIC' : 'PRIVATE';

  // Holder perk: generation size/quality scales with the user's token tier.
  const genUser = await prisma.user.findUnique({ where: { id: session.sub }, select: { walletAddress: true } });
  let genTier = resolveTier(0);
  if (genUser?.walletAddress) {
    try { genTier = resolveTier(await getTokenBalance(genUser.walletAddress)); } catch { /* RPC down -> standard */ }
  }
  const plan = genPlan(genTier.key, genTier.qualifies);

  const aiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://worldforge.app',
      'X-Title': 'Worldcraft',
    },
    body: JSON.stringify({
      model: plan.model,
      max_tokens: plan.maxTokens,
      messages: [
        {
          role: 'user',
          content: `Generate a fictional world based on: "${concept}"

Return ONLY a JSON object (no markdown, no code fences):
{"world":{"title":"2-4 word name","tagline":"One sentence","description":"2 sentences"},"eras":[{"title":"Era name","description":"Brief desc","startLabel":"Year 0","endLabel":"Year 50","color":"#hex"}],"entities":[{"type":"CHARACTER|LOCATION|FACTION|ARTIFACT|SPECIES","title":"Name","summary":"One line","content":"1 paragraph of lore","facts":[{"label":"Key","value":"Val"}],"tags":["tag1"]}],"events":[{"title":"Event","dateLabel":"Year X","era":"Era name (exact match)","summary":"What happened","impact":"Effect","involvedEntities":["Entity name (exact match)"]}],"relations":[{"fromTitle":"Entity (exact)","toTitle":"Entity (exact)","label":"relationship"}]}

Generate exactly: ${plan.eras} eras, ${plan.entities} entities (mix of types), ${plan.events} events, ${plan.relations} relations. Keep lore concise. All title references must match exactly.`,
        },
      ],
    }),
  });

  if (!aiResponse.ok) {
    const errData = await aiResponse.json().catch(() => ({}));
    return NextResponse.json(
      { error: errData.error?.message || `AI API error: ${aiResponse.status}` },
      { status: 500 }
    );
  }

  const aiData = await aiResponse.json();
  const content = aiData.choices?.[0]?.message?.content;

  if (!content) {
    return NextResponse.json({ error: 'AI returned no content' }, { status: 500 });
  }

  let generated;
  try {
    let raw = content.trim();
    // Strip markdown code fences
    if (raw.startsWith('```')) {
      raw = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }
    // Extract JSON object if surrounded by other text
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      raw = jsonMatch[0];
    }
    generated = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: 'AI returned invalid JSON' }, { status: 500 });
  }

  // Create the world
  const worldData = generated.world || {};
  const world = await createWorld({
    title: worldData.title || 'Untitled World',
    tagline: worldData.tagline || 'A new world takes shape.',
    description: worldData.description || '',
    visibility: visibility as 'PUBLIC' | 'PRIVATE',
    ownerId: session.sub,
  });

  // Create eras
  const eraMap: Record<string, string> = {};
  let erasCreated = 0;
  let eraSortOrder = 1;

  for (const era of generated.eras || []) {
    try {
      const created = await createEra({
        worldId: world.id,
        title: era.title,
        description: era.description || '',
        sortOrder: eraSortOrder++,
        startLabel: era.startLabel || '',
        endLabel: era.endLabel || '',
        color: era.color || '#FF6B2C',
      });
      eraMap[era.title] = created.id;
      erasCreated++;
    } catch {
      // Skip duplicate slugs
    }
  }

  // Create entities
  const entityMap: Record<string, string> = {};
  let entitiesCreated = 0;

  for (const e of generated.entities || []) {
    const type = VALID_TYPES.includes(e.type) ? e.type : 'CHARACTER';
    try {
      const entity = await createEntity({
        worldId: world.id,
        type: type as EntityType,
        title: e.title,
        summary: e.summary || '',
        content: e.content || '',
        accent: ENTITY_COLORS[type] || '#FF6B2C',
        facts: Array.isArray(e.facts) ? e.facts : [],
        tags: Array.isArray(e.tags) ? e.tags : [],
        userId: session.sub,
      });
      entityMap[e.title] = entity.id;
      entitiesCreated++;
    } catch {
      // Skip duplicate slugs
    }
  }

  // Create events with era references and entity links
  let eventsCreated = 0;
  let sortOrder = 1;
  for (const ev of generated.events || []) {
    try {
      const eraId = eraMap[ev.era] || undefined;
      const linkedSlugs: string[] = [];
      for (const title of Object.keys(entityMap)) {
        if (ev.summary?.includes(title) || ev.title?.includes(title)) {
          linkedSlugs.push(slugify(title));
        }
      }

      const event = await createEvent({
        worldId: world.id,
        title: ev.title,
        dateLabel: ev.dateLabel || '',
        era: ev.era || 'Unknown Era',
        eraId,
        summary: ev.summary || '',
        impact: ev.impact || '',
        sortOrder: sortOrder++,
        linkedEntitySlugs: linkedSlugs.join(','),
      });

      // Create EventEntityLinks from involvedEntities or auto-detect
      const involvedEntityIds: string[] = [];
      if (Array.isArray(ev.involvedEntities)) {
        for (const name of ev.involvedEntities) {
          if (entityMap[name]) involvedEntityIds.push(entityMap[name]);
        }
      }
      // Also auto-detect mentions in title/summary
      for (const [title, id] of Object.entries(entityMap)) {
        if (!involvedEntityIds.includes(id) && (ev.summary?.includes(title) || ev.title?.includes(title))) {
          involvedEntityIds.push(id);
        }
      }
      if (involvedEntityIds.length > 0) {
        await createEventEntityLinks(
          involvedEntityIds.map((eid) => ({ eventId: event.id, entityId: eid }))
        );
      }

      eventsCreated++;
    } catch {
      // Skip
    }
  }

  // Create relations
  let relationsCreated = 0;
  for (const rel of generated.relations || []) {
    const fromId = entityMap[rel.fromTitle];
    const toId = entityMap[rel.toTitle];
    if (fromId && toId && fromId !== toId) {
      try {
        await createRelation({
          worldId: world.id,
          fromEntityId: fromId,
          toEntityId: toId,
          label: rel.label || 'related to',
        });
        relationsCreated++;
      } catch {
        // Skip
      }
    }
  }

  await logActivity(world.id, session.sub, 'generated', `world with ${erasCreated} eras, ${entitiesCreated} entities, ${eventsCreated} events, ${relationsCreated} relations using AI`);

  return NextResponse.json({
    world: { slug: world.slug, title: world.title },
    eras: erasCreated,
    entities: entitiesCreated,
    events: eventsCreated,
    relations: relationsCreated,
  });
 } catch (err) {
   console.error('[worlds/generate] failed:', err);
   return NextResponse.json(
     { error: err instanceof Error ? err.message : 'World generation failed' },
     { status: 500 },
   );
 }
}
