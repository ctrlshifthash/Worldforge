import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getWorldBySlug, getEntities, createEntity } from '@/lib/queries';
import { ENTITY_COLORS } from '@/lib/utils';
import type { EntityType } from '@prisma/client';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const world = await getWorldBySlug(slug);

  if (!world) {
    return NextResponse.json({ error: 'World not found' }, { status: 404 });
  }

  const url = new URL(request.url);
  const type = url.searchParams.get('type') as EntityType | null;

  const entities = await getEntities(world.id, type || undefined);
  return NextResponse.json({ entities });
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
  const type = (body.type || 'CHARACTER') as EntityType;

  const entity = await createEntity({
    worldId: world.id,
    type,
    title: body.title || 'Untitled',
    summary: body.summary || '',
    content: body.content || '',
    accent: body.accent || ENTITY_COLORS[type] || '#c8a44e',
    facts: body.facts || [],
    tags: Array.isArray(body.tags)
      ? body.tags
      : String(body.tags || '')
          .split(',')
          .map((t: string) => t.trim())
          .filter(Boolean),
    userId: session.sub,
  });

  return NextResponse.json({ entity }, { status: 201 });
}
