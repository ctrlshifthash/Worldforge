import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getWorldBySlug, getEntities, getEras, getEvents } from '@/lib/queries';

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
    return NextResponse.json({ error: 'AI generation not configured' }, { status: 500 });
  }

  const { slug } = await params;
  const world = await getWorldBySlug(slug);
  if (!world) {
    return NextResponse.json({ error: 'World not found' }, { status: 404 });
  }

  const body = await request.json();
  const { kind, hint, entityType } = body as {
    kind: 'entity' | 'event' | 'era';
    hint?: string;
    entityType?: string;
  };

  // Build world context summary
  const [entities, eras, events] = await Promise.all([
    getEntities(world.id),
    getEras(world.id),
    getEvents(world.id),
  ]);

  const worldCtx = [
    `World: "${world.title}"`,
    world.tagline ? `Tagline: "${world.tagline}"` : '',
    world.description ? `Description: "${world.description}"` : '',
    entities.length > 0 ? `Existing entities: ${entities.map((e) => `${e.title} (${e.type})`).join(', ')}` : '',
    eras.length > 0 ? `Existing eras: ${eras.map((e) => e.title).join(', ')}` : '',
    events.length > 0 ? `Existing events: ${events.slice(0, 10).map((e) => e.title).join(', ')}` : '',
  ].filter(Boolean).join('\n');

  let systemPrompt = '';

  if (kind === 'entity') {
    const typeLabel = entityType || 'CHARACTER';
    systemPrompt = `You are a worldbuilding assistant. Generate a single ${typeLabel} entity for a fictional world.

${worldCtx}

${hint ? `User guidance: ${hint}` : `Generate a ${typeLabel} that fits well with the existing world.`}

Return a JSON object with this exact structure (no markdown, no code fences, just raw JSON):
{
  "title": "Entity name",
  "summary": "One-line description",
  "content": "2-3 paragraphs of lore, separated by \\n\\n",
  "facts": [{"label": "Key", "value": "Value"}],
  "tags": ["tag1", "tag2"]
}

Make it rich, creative, and consistent with the existing world. Generate 3-5 facts and 2-4 tags.`;
  } else if (kind === 'event') {
    const eraNames = eras.map((e) => e.title);
    systemPrompt = `You are a worldbuilding assistant. Generate a single timeline event for a fictional world.

${worldCtx}

${hint ? `User guidance: ${hint}` : 'Generate a significant event that fits the existing world.'}

Return a JSON object with this exact structure (no markdown, no code fences, just raw JSON):
{
  "title": "Event name",
  "dateLabel": "When it happened (e.g. Year 312, Third Age)",
  "era": "Which era this belongs to"${eraNames.length > 0 ? ` (pick from: ${eraNames.join(', ')})` : ''},
  "summary": "What happened (2-3 sentences)",
  "impact": "How it changed the world (1-2 sentences)"
}

Make it dramatic and interconnected with existing entities and events.`;
  } else if (kind === 'era') {
    systemPrompt = `You are a worldbuilding assistant. Generate a single historical era for a fictional world.

${worldCtx}

${hint ? `User guidance: ${hint}` : 'Generate a new era that fits the existing world history.'}

Return a JSON object with this exact structure (no markdown, no code fences, just raw JSON):
{
  "title": "Era name",
  "description": "2-3 sentence description of this period",
  "startLabel": "When it starts (e.g. Year 0, The Dawn)",
  "endLabel": "When it ends (e.g. Year 340, The Collapse)",
  "color": "hex color (e.g. #9a4a4a)"
}

Make it evocative and consistent with the world's tone.`;
  } else {
    return NextResponse.json({ error: 'Invalid kind' }, { status: 400 });
  }

  const aiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://worldforge.app',
      'X-Title': 'Worldcraft',
    },
    body: JSON.stringify({
      model: 'anthropic/claude-sonnet-4',
      max_tokens: 2000,
      messages: [{ role: 'user', content: systemPrompt }],
    }),
  });

  if (!aiResponse.ok) {
    return NextResponse.json({ error: 'AI generation failed' }, { status: 500 });
  }

  const aiData = await aiResponse.json();
  const content = aiData.choices?.[0]?.message?.content;

  if (!content) {
    return NextResponse.json({ error: 'AI returned no content' }, { status: 500 });
  }

  try {
    let raw = content.trim();
    if (raw.startsWith('```')) {
      raw = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }
    const result = JSON.parse(raw);
    return NextResponse.json({ result });
  } catch {
    return NextResponse.json({ error: 'AI returned invalid JSON', raw: content }, { status: 500 });
  }
}
