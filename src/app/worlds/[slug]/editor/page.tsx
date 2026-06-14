import { notFound } from 'next/navigation';
import { getWorldBySlug, getWorldMap } from '@/lib/queries';
import { getSession } from '@/lib/auth';
import { MapEditor } from './MapEditor';
import { DEFAULT_MAP_W, DEFAULT_MAP_H, makeBlankTiles } from '@/lib/tiles';

export const dynamic = 'force-dynamic';

export default async function EditorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const world = await getWorldBySlug(slug);
  if (!world) notFound();

  // The editor only exists for CUSTOM worlds, and only the owner may paint.
  if (world.kind !== 'CUSTOM') notFound();
  const session = await getSession();
  const isOwner = world.ownerId ? world.ownerId === session?.sub : true; // null-owner demo worlds: open
  if (!isOwner) notFound();

  const map = await getWorldMap(world.id);
  const initial = map
    ? {
        width: map.width,
        height: map.height,
        tiles: JSON.parse(map.tilesJson) as number[],
        spawnX: map.spawnX,
        spawnY: map.spawnY,
      }
    : { width: DEFAULT_MAP_W, height: DEFAULT_MAP_H, tiles: makeBlankTiles(), spawnX: 30, spawnY: 22 };

  return <MapEditor slug={slug} worldTitle={world.title} initial={initial} />;
}
