import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getWorldBySlug, getCharacterSessions, createCharacterSession, getActiveSessionForEntity, logActivity } from '@/lib/queries';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const world = await getWorldBySlug(slug);
  if (!world) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const sessions = await getCharacterSessions(world.id);
  return NextResponse.json(sessions);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { slug } = await params;
  const world = await getWorldBySlug(slug);
  if (!world) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await request.json();
  const { entityId, personalityPrompt, constraints, frequency, scope } = body;

  if (!entityId) {
    return NextResponse.json({ error: 'entityId is required' }, { status: 400 });
  }

  // Check no existing active session for this entity
  const existing = await getActiveSessionForEntity(entityId);
  if (existing) {
    return NextResponse.json({ error: 'This character already has an active session' }, { status: 409 });
  }

  const characterSession = await createCharacterSession({
    worldId: world.id,
    entityId,
    userId: session.sub,
    personalityPrompt: personalityPrompt || '',
    constraints: constraints || '',
    frequency: frequency || 'manual',
    scope: scope || 'SAFE',
  });

  await logActivity(world.id, session.sub, 'enabled away-mode', `for character session`);

  return NextResponse.json(characterSession);
}
