import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getWorldBySlug, createEntity, createEvent, createRelation, createEra, createEventEntityLinks, getEras, logActivity } from '@/lib/queries';
import { ENTITY_COLORS, slugify } from '@/lib/utils';
import type { EntityType } from '@prisma/client';

const VALID_TYPES: EntityType[] = ['CHARACTER', 'LOCATION', 'FACTION', 'ARTIFACT', 'SPECIES', 'EVENT'];

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'AI generation not configured. Add OPENROUTER_API_KEY to .env' }, { status: 500 });
  }

  const { slug } = await params;
  const world = await getWorldBySlug(slug);
  if (!world) {
    return NextResponse.json({ error: 'World not found' }, { status: 404 });
  }

  const body = await request.json();
  const prompt = body.prompt || '';
  const worldContext = `World: "${world.title}"\nTagline: "${world.tagline}"\nDescription: "${world.description || 'None yet'}"`;

  const aiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://worldforge.app',
      'X-Title': 'Worldforge',
    },
    body: JSON.stringify({
      model: 'anthropic/claude-sonnet-4',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: `You are a worldbuilding assistant. Generate content for a fictional world.

${worldContext}

User request: ${prompt || 'Generate a full starter set of content for this world.'}

Return a JSON object with this exact structure (no markdown, no code fences, just raw JSON):
{
  "eras": [
    {
      "title": "Era name",
      "description": "Brief description of this historical period",
      "startLabel": "When it starts (e.g. Year 0)",
      "endLabel": "When it ends (e.g. Year 50)",
      "color": "hex color (e.g. #9a4a4a)"
    }
  ],
  "entities": [
    {
      "type": "CHARACTER" | "LOCATION" | "FACTION" | "ARTIFACT" | "SPECIES",
      "title": "Name",
      "summary": "One line description",
      "content": "2-3 paragraphs of lore",
      "facts": [{"label": "Key", "value": "Value"}],
      "tags": ["tag1", "tag2"]
    }
  ],
  "events": [
    {
      "title": "Event name",
      "dateLabel": "When (e.g. Year 312)",
      "era": "Era name (must match an era title exactly)",
      "summary": "What happened",
      "impact": "How it changed the world",
      "involvedEntities": ["Entity name (must match entity titles)"]
    }
  ],
  "relations": [
    {
      "fromTitle": "Entity name",
      "toTitle": "Entity name",
      "label": "relationship (e.g. allied with, rules over)"
    }
  ]
}

Generate 3-5 eras, 6-10 entities (mix of types), 4-6 timeline events (each assigned to an era), and 4-8 relations. Events should reference entities in involvedEntities. Make everything interconnected and rich with lore. All title references must match exactly.`,
        },
      ],
    }),
  });

  if (!aiResponse.ok) {
    const errData = await aiResponse.json().catch(() => ({}));
    return NextResponse.json(
      { error: errData.error?.message || `OpenRouter API error: ${aiResponse.status}` },
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
    if (raw.startsWith('```')) {
      raw = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }
    generated = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: 'AI returned invalid JSON', raw: content }, { status: 500 });
  }

  // Create eras (merge with existing)
  const existingEras = await getEras(world.id);
  const eraMap: Record<string, string> = {};
  for (const era of existingEras) {
    eraMap[era.title] = era.id;
  }
  let erasCreated = 0;
  let eraSortOrder = existingEras.length;

  for (const era of generated.eras || []) {
    if (!eraMap[era.title]) {
      try {
        const created = await createEra({
          worldId: world.id,
          title: era.title,
          description: era.description || '',
          sortOrder: ++eraSortOrder,
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
  }

  // Create entities
  const entityMap: Record<string, string> = {};
  const createdEntities = [];

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
      createdEntities.push(entity);
    } catch {
      // Skip duplicate slugs etc
    }
  }

  // Create events with era references and entity links
  const createdEvents = [];
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

      // Create EventEntityLinks
      const involvedEntityIds: string[] = [];
      if (Array.isArray(ev.involvedEntities)) {
        for (const name of ev.involvedEntities) {
          if (entityMap[name]) involvedEntityIds.push(entityMap[name]);
        }
      }
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

      createdEvents.push(event);
    } catch {
      // Skip errors
    }
  }

  // Create relations
  const createdRelations = [];
  for (const rel of generated.relations || []) {
    const fromId = entityMap[rel.fromTitle];
    const toId = entityMap[rel.toTitle];
    if (fromId && toId && fromId !== toId) {
      try {
        const relation = await createRelation({
          worldId: world.id,
          fromEntityId: fromId,
          toEntityId: toId,
          label: rel.label || 'related to',
        });
        createdRelations.push(relation);
      } catch {
        // Skip duplicates
      }
    }
  }

  await logActivity(world.id, session.sub, 'generated', `${erasCreated} eras, ${createdEntities.length} entities, ${createdEvents.length} events, ${createdRelations.length} relations using AI`);

  return NextResponse.json({
    eras: erasCreated,
    entities: createdEntities.length,
    events: createdEvents.length,
    relations: createdRelations.length,
  });
}
