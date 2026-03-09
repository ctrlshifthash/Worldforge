import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getWorldBySlug, getEras, createEra } from '@/lib/queries';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const world = await getWorldBySlug(slug);
  if (!world) {
    return NextResponse.json({ error: 'World not found' }, { status: 404 });
  }

  const eras = await getEras(world.id);
  return NextResponse.json({ eras });
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
  const existing = await getEras(world.id);
  const maxSort = existing.length > 0
    ? Math.max(...existing.map((e) => e.sortOrder))
    : 0;

  const era = await createEra({
    worldId: world.id,
    title: body.title || 'Untitled Era',
    description: body.description || '',
    sortOrder: body.sortOrder ?? maxSort + 1,
    startLabel: body.startLabel || '',
    endLabel: body.endLabel || '',
    color: body.color || '#FF6B2C',
  });

  return NextResponse.json({ era }, { status: 201 });
}
