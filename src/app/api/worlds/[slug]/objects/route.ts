import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getWorldBySlug, getWorldMap, replaceZoneObjects } from '@/lib/queries';
import { PLACEABLE_IDS, WALKABLE_TILES } from '@/lib/tiles';

const MAX_OBJECTS = 600;

// Bulk-replace a CUSTOM world's placed objects (used by the map editor).
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const session = await getSession();
  const { slug } = await params;
  const world = await getWorldBySlug(slug);
  if (!world) return NextResponse.json({ error: 'World not found' }, { status: 404 });
  if (world.ownerId !== null) {
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (world.ownerId !== session.sub) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (world.kind !== 'CUSTOM') return NextResponse.json({ error: 'Not a custom world' }, { status: 400 });

  const body = await request.json().catch(() => null);
  const objects = body?.objects;
  if (!Array.isArray(objects)) return NextResponse.json({ error: 'objects must be an array' }, { status: 400 });
  if (objects.length > MAX_OBJECTS) return NextResponse.json({ error: `Too many objects (max ${MAX_OBJECTS})` }, { status: 400 });

  const map = await getWorldMap(world.id);
  if (!map) return NextResponse.json({ error: 'Paint and save a map first' }, { status: 400 });
  const tiles = JSON.parse(map.tilesJson) as number[];

  // Validate each object: known itemType, in bounds, on a walkable tile.
  const seen = new Set<string>();
  const clean: { tileX: number; tileY: number; itemType: string; rotation: number }[] = [];
  for (const o of objects) {
    const tileX = Number(o?.tileX), tileY = Number(o?.tileY);
    if (!PLACEABLE_IDS.has(o?.itemType)) return NextResponse.json({ error: `Unknown item: ${o?.itemType}` }, { status: 400 });
    if (!Number.isInteger(tileX) || !Number.isInteger(tileY) || tileX < 0 || tileY < 0 || tileX >= map.width || tileY >= map.height) {
      return NextResponse.json({ error: 'Object out of bounds' }, { status: 400 });
    }
    if (!WALKABLE_TILES.has(tiles[tileY * map.width + tileX])) {
      return NextResponse.json({ error: 'Objects must sit on walkable terrain' }, { status: 400 });
    }
    const key = `${tileX},${tileY}`;
    if (seen.has(key)) continue; // de-dupe one object per tile
    seen.add(key);
    clean.push({ tileX, tileY, itemType: o.itemType, rotation: 0 });
  }

  const saved = await replaceZoneObjects(world.id, 'custom', clean, session?.sub || 'owner');
  return NextResponse.json({ count: saved.length });
}
