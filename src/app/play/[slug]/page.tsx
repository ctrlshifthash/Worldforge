import { notFound } from 'next/navigation';
import { getWorldBySlug, getEntities, getEras } from '@/lib/queries';
import { getSession } from '@/lib/auth';
import { WorldExplore } from '@/app/worlds/[slug]/explore/WorldExplore';

export default async function PlayPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ era?: string }>;
}) {
  const { slug } = await params;
  const { era: eraSlug } = await searchParams;
  const world = await getWorldBySlug(slug);
  if (!world) notFound();

  const session = await getSession();
  const isOwner = world.ownerId === null ? true : (session ? world.ownerId === session.sub : false);

  const [allEntities, eras] = await Promise.all([
    getEntities(world.id),
    getEras(world.id),
  ]);

  // Filter entities by era lifecycle if an era is selected
  let entities = allEntities;
  const selectedEra = eraSlug ? eras.find((e) => e.slug === eraSlug) : null;

  if (selectedEra) {
    entities = allEntities.filter((e) => {
      if (e.introducedEraId) {
        const introEra = eras.find((er) => er.id === e.introducedEraId);
        if (introEra && introEra.sortOrder > selectedEra.sortOrder) return false;
      }
      if (e.retiredEraId) {
        const retiredEra = eras.find((er) => er.id === e.retiredEraId);
        if (retiredEra && retiredEra.sortOrder <= selectedEra.sortOrder) return false;
      }
      return true;
    });
  }

  const mappedEntities = entities.map((e) => ({
    id: e.id,
    slug: e.slug,
    title: e.title,
    type: e.type,
    summary: e.summary,
    accent: e.accent,
    mapX: e.mapX,
    mapY: e.mapY,
    tags: (() => {
      try { return JSON.parse(e.tagsJson) as string[]; } catch { return []; }
    })(),
    facts: (() => {
      try { return JSON.parse(e.factsJson) as { label: string; value: string }[]; } catch { return []; }
    })(),
  }));

  return (
    <WorldExplore
      entities={mappedEntities}
      slug={slug}
      worldTitle={world.title}
      eraLabel={selectedEra?.title}
      fullscreen
      isOwner={isOwner}
      worldId={world.id}
    />
  );
}
