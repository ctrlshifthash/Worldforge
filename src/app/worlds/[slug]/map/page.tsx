import { notFound } from 'next/navigation';
import { getWorldBySlug, getEntities, getEventById, getEras, getMapRegions } from '@/lib/queries';
import { WorldMap } from './WorldMap';
import { EraScrubber } from '@/components/EraScrubber';
import { RegionDrawer } from './RegionDrawer';
import { getSession } from '@/lib/auth';

export default async function MapPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ eventId?: string; era?: string }>;
}) {
  const { slug } = await params;
  const { eventId, era: eraSlug } = await searchParams;
  const world = await getWorldBySlug(slug);
  if (!world) notFound();

  const session = await getSession();
  const isOwner = session?.sub === world.ownerId;

  const [entities, eras, regions] = await Promise.all([
    getEntities(world.id),
    getEras(world.id),
    getMapRegions(world.id),
  ]);

  // Find selected era for filtering
  const selectedEra = eraSlug ? eras.find((e) => e.slug === eraSlug) : null;

  // Filter entities by lifecycle if era is selected
  const filteredEntities = selectedEra
    ? entities.filter((e) => {
        const introduced = e.introducedEraId
          ? eras.find((era) => era.id === e.introducedEraId)
          : null;
        const retired = e.retiredEraId
          ? eras.find((era) => era.id === e.retiredEraId)
          : null;
        const existsYet = !introduced || introduced.sortOrder <= selectedEra.sortOrder;
        const stillExists = !retired || retired.sortOrder > selectedEra.sortOrder;
        return existsYet && stillExists;
      })
    : entities;

  // If eventId is provided, fetch the event and its linked entities
  const event = eventId ? await getEventById(eventId) : null;
  const highlightedEntityIds = event
    ? event.entityLinks.map((link) => link.entity.id)
    : [];

  const eventInfo = event
    ? {
        title: event.title,
        dateLabel: event.dateLabel,
        summary: event.summary,
        eraTitle: event.eraRef?.title || event.era,
        eraColor: event.eraRef?.color || '#FF6B2C',
        linkedEntities: event.entityLinks.map((link) => ({
          id: link.entity.id,
          title: link.entity.title,
          type: link.entity.type,
          accent: link.entity.accent,
        })),
      }
    : null;

  const locations = filteredEntities
    .filter((e) => e.type === 'LOCATION')
    .map((e) => ({
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
    }));

  const allEntities = filteredEntities.map((e) => ({
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
  }));

  // Build region data for rendering on the map
  const mapRegions = regions.map((r) => {
    const points: { x: number; y: number }[] = (() => {
      try { return JSON.parse(r.pointsJson); } catch { return []; }
    })();
    // Determine owner for selected era (or latest era)
    const territory = selectedEra
      ? r.territories.find((t) => t.era.id === selectedEra.id)
      : r.territories.sort((a, b) => (b.era.sortOrder || 0) - (a.era.sortOrder || 0))[0];
    return {
      id: r.id,
      title: r.title,
      points,
      color: territory?.entity.accent || r.color,
      ownerTitle: territory?.entity.title || null,
    };
  });

  const eraSegments = eras.map((e) => ({
    id: e.id,
    slug: e.slug,
    title: e.title,
    color: e.color,
    startLabel: e.startLabel,
    endLabel: e.endLabel,
    sortOrder: e.sortOrder,
  }));

  const regionInfo = regions.map((r) => ({
    id: r.id,
    title: r.title,
    color: r.color,
    territories: r.territories.map((t) => ({
      era: { id: t.era.id, title: t.era.title, color: t.era.color },
      entity: { id: t.entity.id, title: t.entity.title, accent: t.entity.accent },
    })),
  }));

  const factionEntities = entities
    .filter((e) => e.type === 'FACTION')
    .map((e) => ({ id: e.id, title: e.title, accent: e.accent }));

  return (
    <>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <p className="eyebrow">{world.title}{selectedEra ? ` — ${selectedEra.title}` : ''}</p>
            <h1 className="text-headline">World Map</h1>
            <p className="page-description">Bird&apos;s-eye view of your world. See entity locations, draw regions, and assign faction territories that change by era.</p>
          </div>
        </div>
        {eras.length > 0 && (
          <EraScrubber eras={eraSegments} basePath={`/worlds/${slug}/map`} />
        )}
      </div>

      <div className="map-layout">
        <WorldMap
          locations={locations}
          allEntities={allEntities}
          slug={slug}
          worldTitle={world.title}
          highlightedEntityIds={highlightedEntityIds}
          eventInfo={eventInfo}
          mapRegions={mapRegions}
        />
        {isOwner && (
          <RegionDrawer
            regions={regionInfo}
            eras={eraSegments.map((e) => ({ id: e.id, title: e.title, color: e.color }))}
            factions={factionEntities}
            slug={slug}
          />
        )}
      </div>
    </>
  );
}
