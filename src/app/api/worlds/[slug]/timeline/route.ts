import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getWorldBySlug, getEvents, createEvent } from '@/lib/queries';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const world = await getWorldBySlug(slug);
  if (!world) {
    return NextResponse.json({ error: 'World not found' }, { status: 404 });
  }

  const events = await getEvents(world.id);
  return NextResponse.json({ events });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { slug } = await params;
  const world = await getWorldBySlug(slug);
  if (!world) {
    return NextResponse.json({ error: 'World not found' }, { status: 404 });
  }

  const body = await request.json();

  // Get current max sortOrder
  const existing = await getEvents(world.id);
  const maxSort = existing.length > 0
    ? Math.max(...existing.map((e) => e.sortOrder))
    : 0;

  const event = await createEvent({
    worldId: world.id,
    title: body.title || 'Untitled Event',
    dateLabel: body.dateLabel || '',
    era: body.era || 'Unknown Era',
    eraId: body.eraId || undefined,
    summary: body.summary || '',
    impact: body.impact || '',
    sortOrder: body.sortOrder ?? maxSort + 1,
    linkedEntitySlugs: body.linkedEntitySlugs || '',
    linkedEntityId: body.linkedEntityId || undefined,
  });

  return NextResponse.json({ event }, { status: 201 });
}
