import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getWorldBySlug, getWorldMap, saveWorldMap } from '@/lib/queries';
import { TILE, WALKABLE_TILES, MAX_MAP_W, MAX_MAP_H } from '@/lib/tiles';

const VALID_TILE_IDS = new Set<number>(Object.values(TILE));

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const world = await getWorldBySlug(slug);
  if (!world) return NextResponse.json({ error: 'World not found' }, { status: 404 });
  const map = await getWorldMap(world.id);
  return NextResponse.json({ map });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const session = await getSession();
  const { slug } = await params;
  const world = await getWorldBySlug(slug);
  if (!world) return NextResponse.json({ error: 'World not found' }, { status: 404 });

  // Only the owner can edit (demo/owned worlds with null owner: anyone).
  if (world.ownerId !== null) {
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (world.ownerId !== session.sub) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (world.kind !== 'CUSTOM') {
    return NextResponse.json({ error: 'This world is not a custom world' }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const width = Number(body?.width);
  const height = Number(body?.height);
  const tiles = body?.tiles;
  const spawnX = Number(body?.spawnX);
  const spawnY = Number(body?.spawnY);

  // Validate dimensions + tile grid.
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 10 || height < 10 || width > MAX_MAP_W || height > MAX_MAP_H) {
    return NextResponse.json({ error: 'Invalid map dimensions' }, { status: 400 });
  }
  if (!Array.isArray(tiles) || tiles.length !== width * height) {
    return NextResponse.json({ error: 'Tile array length must equal width * height' }, { status: 400 });
  }
  for (const t of tiles) {
    if (!VALID_TILE_IDS.has(t)) {
      return NextResponse.json({ error: 'Invalid tile id in map' }, { status: 400 });
    }
  }
  // Spawn must be in bounds and on a walkable tile (so players don't spawn in water).
  if (!Number.isInteger(spawnX) || !Number.isInteger(spawnY) || spawnX < 0 || spawnY < 0 || spawnX >= width || spawnY >= height) {
    return NextResponse.json({ error: 'Spawn point out of bounds' }, { status: 400 });
  }
  if (!WALKABLE_TILES.has(tiles[spawnY * width + spawnX])) {
    return NextResponse.json({ error: 'Spawn point must be on a walkable tile' }, { status: 400 });
  }

  const map = await saveWorldMap(world.id, {
    width,
    height,
    tilesJson: JSON.stringify(tiles),
    spawnX,
    spawnY,
  });
  return NextResponse.json({ map });
}
