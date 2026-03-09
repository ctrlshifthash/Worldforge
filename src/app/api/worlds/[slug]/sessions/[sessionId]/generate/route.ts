import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getCharacterSession, getWorldBySlug, getEntities, getEvents, getEras, getCanonizedDevelopments, createDevelopment, updateCharacterSession, logActivity } from '@/lib/queries';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ slug: string; sessionId: string }> }
) {
  const auth = await getSession();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'AI generation not configured' }, { status: 500 });
  }

  const { slug, sessionId } = await params;
  const world = await getWorldBySlug(slug);
  if (!world) return NextResponse.json({ error: 'World not found' }, { status: 404 });

  const charSession = await getCharacterSession(sessionId);
  if (!charSession) return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  if (charSession.status !== 'ACTIVE') {
    return NextResponse.json({ error: 'Session is not active' }, { status: 400 });
  }

  const entity = charSession.entity;
  const [entities, events, eras, canonHistory] = await Promise.all([
    getEntities(world.id),
    getEvents(world.id),
    getEras(world.id),
    getCanonizedDevelopments(entity.id),
  ]);

  const currentEra = eras[eras.length - 1];
  const recentEvents = events.slice(-8);
  const otherCharacters = entities.filter((e) => e.type === 'CHARACTER' && e.id !== entity.id).slice(0, 10);
  const locations = entities.filter((e) => e.type === 'LOCATION').slice(0, 10);
  const factions = entities.filter((e) => e.type === 'FACTION').slice(0, 6);

  // Build relations context
  const relations = [
    ...entity.relationsFrom.map((r) => `${entity.title} → ${r.toEntity.title}: ${r.label}`),
    ...entity.relationsTo.map((r) => `${r.fromEntity.title} → ${entity.title}: ${r.label}`),
  ].join('\n');

  // Previous developments for continuity
  const previousDevs = charSession.developments
    .map((d) => `[${d.type}] ${d.title}: ${d.content.slice(0, 200)}...`)
    .join('\n\n');

  const contentParagraphs = (() => {
    try { return JSON.parse(entity.contentJson).join('\n\n'); } catch { return ''; }
  })();
  const facts = (() => {
    try { return JSON.parse(entity.factsJson).map((f: { label: string; value: string }) => `${f.label}: ${f.value}`).join(', '); } catch { return ''; }
  })();

  const prompt = `You are a character continuation engine for a worldbuilding platform. You are acting as "${entity.title}" inside the world "${world.title}".

WORLD CONTEXT:
${world.title} — ${world.tagline}
${world.description}

CURRENT ERA: ${currentEra?.title || 'Unknown'} (${currentEra?.startLabel || '?'} — ${currentEra?.endLabel || '?'})
${currentEra?.description || ''}

CHARACTER PROFILE:
Name: ${entity.title}
Summary: ${entity.summary}
Lore: ${contentParagraphs}
Facts: ${facts}

RELATIONSHIPS:
${relations || 'None established'}

RECENT WORLD EVENTS:
${recentEvents.map((e) => `- ${e.dateLabel}: ${e.title} — ${e.summary}`).join('\n') || 'None'}

OTHER CHARACTERS:
${otherCharacters.map((c) => `- ${c.title}: ${c.summary}`).join('\n') || 'None'}

LOCATIONS:
${locations.map((l) => `- ${l.title}: ${l.summary}`).join('\n') || 'None'}

FACTIONS:
${factions.map((f) => `- ${f.title}: ${f.summary}`).join('\n') || 'None'}

${canonHistory.length > 0 ? `OFFICIAL CANON HISTORY (approved developments — this is what has actually happened to this character):\n${canonHistory.slice(-10).map((d) => `[${d.type}] "${d.title}" (${d.dateLabel || 'undated'}): ${d.content.slice(0, 300)}...`).join('\n\n')}\n` : ''}
${charSession.contextSummary ? `PREVIOUS SESSION CONTEXT:\n${charSession.contextSummary}\n` : ''}
${previousDevs ? `RECENT DEVELOPMENTS (pending/unreviewed):\n${previousDevs}\n` : ''}
CREATOR'S PERSONALITY GUIDANCE:
${charSession.personalityPrompt || 'No specific guidance provided.'}

CREATOR'S CONSTRAINTS:
${charSession.constraints || 'No specific constraints.'}

INSTRUCTIONS:
Generate ONE development entry for this character. This should feel like a natural continuation of their story — something they did, witnessed, thought about, or encountered.

${charSession.scope === 'SAFE' ? `AUTONOMY LEVEL: SAFE
Only generate safe, non-destructive developments: journals, travel logs, conversations, discoveries, or rumors. Do NOT propose new relationships or world-changing events. Keep proposedChanges to facts and tags only (no newRelations). Write something that enriches the world without making any changes to the world state.
Choose one type: JOURNAL, TRAVEL, CONVERSATION, DISCOVERY, or RUMOR.` : charSession.scope === 'ADVANCED' ? `AUTONOMY LEVEL: ADVANCED (Author Mode)
You have broad creative freedom. You may propose larger changes: faction movements, territory disputes, major discoveries, death, betrayal, shifting alliances. Be bold but consistent with established lore. Propose multiple changes if the narrative warrants it (up to 3-4 items).
Choose one type: JOURNAL, ENCOUNTER, TRAVEL, CONVERSATION, DISCOVERY, RUMOR, RELATIONSHIP_SHIFT, or MINOR_EVENT.` : `AUTONOMY LEVEL: EXPANDED
You may generate encounters, relationship shifts, minor events, and local conflicts. You can propose new relations, facts, and tags. Keep changes moderate — alliances, rivalries, and small events are fine, but avoid world-shattering developments.
Choose one type: JOURNAL, ENCOUNTER, TRAVEL, CONVERSATION, DISCOVERY, RUMOR, RELATIONSHIP_SHIFT, or MINOR_EVENT.`}

Return ONLY a JSON object (no markdown fences):
{
  "type": "JOURNAL",
  "title": "Short title for this entry",
  "dateLabel": "In-world date (e.g. Year 30, Late Autumn)",
  "content": "The narrative text. 2-4 paragraphs. Write in first person for JOURNAL type, third person for others. Reference real entities, locations, and events from the world context. Make it feel authentic to the character.",
  "contextUpdate": "1-2 sentences summarizing what happened for continuity tracking.",
  "proposedChanges": {
    "newRelations": [{"toEntitySlug": "entity-slug", "label": "relationship label"}],
    "newFacts": [{"entitySlug": "entity-slug", "label": "Fact name", "value": "Fact value"}],
    "newTags": [{"entitySlug": "entity-slug", "tag": "new tag"}]
  }
}

${charSession.scope === 'SAFE' ? 'Keep proposedChanges minimal — only facts or tags, no newRelations. Most developments should have empty proposed changes.' : charSession.scope === 'ADVANCED' ? 'Propose changes that meaningfully advance the story. 1-4 items in proposedChanges is fine.' : 'Keep proposedChanges minimal — 0-2 items total. Most developments should have empty proposed changes.'} Only suggest changes that genuinely follow from the narrative. Never invent new characters or locations that don't exist in the world context. Never contradict established lore.`;

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
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
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
  const rawContent = aiData.choices?.[0]?.message?.content;
  if (!rawContent) {
    return NextResponse.json({ error: 'AI returned no content' }, { status: 500 });
  }

  let generated;
  try {
    let raw = rawContent.trim();
    if (raw.startsWith('```')) {
      raw = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }
    generated = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: 'AI returned invalid JSON', raw: rawContent }, { status: 500 });
  }

  const validTypes = ['JOURNAL', 'ENCOUNTER', 'TRAVEL', 'CONVERSATION', 'DISCOVERY', 'RUMOR', 'RELATIONSHIP_SHIFT', 'MINOR_EVENT'];
  const devType = validTypes.includes(generated.type) ? generated.type : 'JOURNAL';

  const development = await createDevelopment({
    sessionId,
    type: devType,
    title: generated.title || 'Untitled Development',
    content: generated.content || '',
    dateLabel: generated.dateLabel || '',
    eraId: currentEra?.id,
    proposedChangesJson: JSON.stringify(generated.proposedChanges || {}),
  });

  // Update session context and last generated time
  await updateCharacterSession(sessionId, {
    contextSummary: generated.contextUpdate
      ? `${charSession.contextSummary}\n${generated.contextUpdate}`.trim()
      : charSession.contextSummary,
    lastGeneratedAt: new Date(),
  });

  await logActivity(world.id, auth.sub, 'AI generated', `development "${generated.title}" for ${entity.title}`);

  return NextResponse.json(development);
}
