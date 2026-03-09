import { notFound } from 'next/navigation';
import { getWorldBySlug, getEntities, getRelations, getEventById, getEras } from '@/lib/queries';
import { RelationshipGraph } from './RelationshipGraph';
import { AddRelationForm } from './AddRelationForm';
import { EraScrubber } from '@/components/EraScrubber';

export default async function GraphPage({
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

  const [entities, relations, eras] = await Promise.all([
    getEntities(world.id),
    getRelations(world.id),
    getEras(world.id),
  ]);

  // Find selected era for filtering
  const selectedEra = eraSlug ? eras.find((e) => e.slug === eraSlug) : null;

  // Filter entities by lifecycle
  const filteredEntities = selectedEra
    ? entities.filter((e) => {
        const introduced = e.introducedEraId ? eras.find((era) => era.id === e.introducedEraId) : null;
        const retired = e.retiredEraId ? eras.find((era) => era.id === e.retiredEraId) : null;
        const existsYet = !introduced || introduced.sortOrder <= selectedEra.sortOrder;
        const stillExists = !retired || retired.sortOrder > selectedEra.sortOrder;
        return existsYet && stillExists;
      })
    : entities;

  // Filter relations by lifecycle
  const filteredEntityIds = new Set(filteredEntities.map((e) => e.id));
  const filteredRelations = selectedEra
    ? relations.filter((r) => {
        // Both entities must exist in this era
        if (!filteredEntityIds.has(r.fromEntityId) || !filteredEntityIds.has(r.toEntityId)) return false;
        const formed = r.formedEraId ? eras.find((era) => era.id === r.formedEraId) : null;
        const dissolved = r.dissolvedEraId ? eras.find((era) => era.id === r.dissolvedEraId) : null;
        const existsYet = !formed || formed.sortOrder <= selectedEra.sortOrder;
        const stillExists = !dissolved || dissolved.sortOrder > selectedEra.sortOrder;
        return existsYet && stillExists;
      })
    : relations;

  // If eventId is provided, fetch the event and its linked entities
  const event = eventId ? await getEventById(eventId) : null;
  const highlightedNodeIds = event
    ? event.entityLinks.map((link) => link.entity.id)
    : [];

  const eventInfo = event
    ? {
        title: event.title,
        dateLabel: event.dateLabel,
        eraTitle: event.eraRef?.title || event.era,
        eraColor: event.eraRef?.color || '#FF6B2C',
      }
    : null;

  const nodes = filteredEntities.map((e) => ({
    id: e.id,
    slug: e.slug,
    title: e.title,
    type: e.type,
    accent: e.accent,
  }));

  const edges = filteredRelations.map((r) => ({
    id: r.id,
    source: r.fromEntityId,
    target: r.toEntityId,
    label: r.label,
  }));

  const entityOptions = entities.map((e) => ({
    id: e.id,
    title: e.title,
    type: e.type,
  }));

  const eraSegments = eras.map((e) => ({
    id: e.id,
    slug: e.slug,
    title: e.title,
    color: e.color,
    startLabel: e.startLabel,
    endLabel: e.endLabel,
    sortOrder: e.sortOrder,
  }));

  return (
    <>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <p className="eyebrow">{world.title}{selectedEra ? ` — ${selectedEra.title}` : ''}</p>
            <h1 className="text-headline">Connections</h1>
            <p className="page-description">See how everything in your world is linked. Hover over any entity to highlight its connections. Click to visit its page.</p>
          </div>
          <AddRelationForm entities={entityOptions} />
        </div>
        {eras.length > 0 && (
          <EraScrubber eras={eraSegments} basePath={`/worlds/${slug}/graph`} />
        )}
      </div>

      <RelationshipGraph
        nodes={nodes}
        edges={edges}
        slug={slug}
        highlightedNodeIds={highlightedNodeIds}
        eventInfo={eventInfo}
      />
    </>
  );
}
