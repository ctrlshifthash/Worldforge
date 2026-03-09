import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getWorldBySlug, getRelations, createRelation, deleteRelation } from '@/lib/queries';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const world = await getWorldBySlug(slug);
  if (!world) {
    return NextResponse.json({ error: 'World not found' }, { status: 404 });
  }

  const relations = await getRelations(world.id);
  return NextResponse.json({ relations });
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
  const relation = await createRelation({
    worldId: world.id,
    fromEntityId: body.fromEntityId,
    toEntityId: body.toEntityId,
    label: body.label || 'related to',
  });

  return NextResponse.json({ relation }, { status: 201 });
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const relationId = url.searchParams.get('id');
  if (!relationId) {
    return NextResponse.json({ error: 'Missing relation id' }, { status: 400 });
  }

  await deleteRelation(relationId);
  return NextResponse.json({ ok: true });
}
