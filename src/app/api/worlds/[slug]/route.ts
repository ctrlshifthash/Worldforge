import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getWorldBySlug, updateWorld, deleteWorld } from '@/lib/queries';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const world = await getWorldBySlug(slug);

  if (!world) {
    return NextResponse.json({ error: 'World not found' }, { status: 404 });
  }

  return NextResponse.json({ world });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { slug } = await params;
  const world = await getWorldBySlug(slug);
  if (!world || world.ownerId !== session.sub) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const updated = await updateWorld(world.id, {
    title: body.title,
    tagline: body.tagline,
    description: body.description,
    visibility: body.visibility,
    coverGradient: body.coverGradient,
  });

  return NextResponse.json({ world: updated });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { slug } = await params;
  const world = await getWorldBySlug(slug);
  if (!world || world.ownerId !== session.sub) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await deleteWorld(world.id);
  return NextResponse.json({ ok: true });
}
