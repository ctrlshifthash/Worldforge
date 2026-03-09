import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getWorldBySlug, updateEntity, deleteEntity } from '@/lib/queries';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string; entityId: string }> }
) {
  const { slug, entityId } = await params;
  const world = await getWorldBySlug(slug);
  if (!world) {
    return NextResponse.json({ error: 'World not found' }, { status: 404 });
  }

  const entity = await prisma.entity.findUnique({
    where: { id: entityId },
    include: {
      relationsFrom: {
        include: { toEntity: { select: { id: true, slug: true, title: true, type: true, accent: true } } },
      },
      relationsTo: {
        include: { fromEntity: { select: { id: true, slug: true, title: true, type: true, accent: true } } },
      },
    },
  });

  if (!entity || entity.worldId !== world.id) {
    return NextResponse.json({ error: 'Entity not found' }, { status: 404 });
  }

  return NextResponse.json({ entity });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string; entityId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { slug, entityId } = await params;
  const world = await getWorldBySlug(slug);
  if (!world) {
    return NextResponse.json({ error: 'World not found' }, { status: 404 });
  }

  const body = await request.json();
  const entity = await updateEntity(entityId, {
    ...body,
    userId: session.sub,
    worldId: world.id,
  });

  return NextResponse.json({ entity });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string; entityId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { slug, entityId } = await params;
  const world = await getWorldBySlug(slug);
  if (!world) {
    return NextResponse.json({ error: 'World not found' }, { status: 404 });
  }

  const entity = await prisma.entity.findUnique({ where: { id: entityId } });
  if (!entity || entity.worldId !== world.id) {
    return NextResponse.json({ error: 'Entity not found' }, { status: 404 });
  }

  await deleteEntity(entityId, world.id, session.sub, entity.title);
  return NextResponse.json({ ok: true });
}
