import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getWorldBySlug, getPlacedObjects, createPlacedObject, deletePlacedObject, updatePlacedObjectCollect } from '@/lib/queries';

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
  const zone = url.searchParams.get('zone') || undefined;

  const objects = await getPlacedObjects(world.id, zone);
  return NextResponse.json({ objects });
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
  if (world.ownerId !== session.sub) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { zone, tileX, tileY, itemType, rotation } = await request.json();
  if (!zone || tileX == null || tileY == null || !itemType) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  try {
    const obj = await createPlacedObject({
      worldId: world.id,
      zone,
      tileX,
      tileY,
      itemType,
      rotation: typeof rotation === 'number' ? rotation : 0,
      placedBy: session.sub,
    });
    return NextResponse.json({ object: obj }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    if (msg.includes('Unique constraint')) {
      return NextResponse.json({ error: 'Tile already occupied' }, { status: 409 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
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
  if (world.ownerId !== session.sub) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await request.json();
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  try {
    await deletePlacedObject(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Object not found' }, { status: 404 });
  }
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
  if (!world) {
    return NextResponse.json({ error: 'World not found' }, { status: 404 });
  }
  if (world.ownerId !== session.sub) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await request.json();
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  try {
    const obj = await updatePlacedObjectCollect(id);
    return NextResponse.json({ success: true, collectedAt: obj.lastCollectedAt });
  } catch {
    return NextResponse.json({ error: 'Object not found' }, { status: 404 });
  }
}
