import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getWorldBySlug, getMapRegions, createMapRegion, deleteMapRegion, setTerritoryOwner } from '@/lib/queries';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const world = await getWorldBySlug(slug);
  if (!world) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const regions = await getMapRegions(world.id);
  return NextResponse.json(regions);
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
  const { title, description, pointsJson, color } = body;

  if (!title || !pointsJson) {
    return NextResponse.json({ error: 'Title and points are required' }, { status: 400 });
  }

  const region = await createMapRegion({
    worldId: world.id,
    title,
    description,
    pointsJson,
    color,
  });

  return NextResponse.json(region);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  await deleteMapRegion(id);
  return NextResponse.json({ ok: true });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { regionId, eraId, entityId } = body;

  if (!regionId || !eraId || !entityId) {
    return NextResponse.json({ error: 'regionId, eraId, and entityId are required' }, { status: 400 });
  }

  const record = await setTerritoryOwner({ regionId, eraId, entityId });
  return NextResponse.json(record);
}
