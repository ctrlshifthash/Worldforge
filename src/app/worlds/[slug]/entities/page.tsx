import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getWorldBySlug, getEntities } from '@/lib/queries';
import { ENTITY_COLORS, ENTITY_LABELS } from '@/lib/utils';
import { EntityFilters } from './EntityFilters';

export default async function EntitiesPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  const { slug } = await params;
  const { type } = await searchParams;
  const world = await getWorldBySlug(slug);
  if (!world) notFound();

  const entities = await getEntities(
    world.id,
    type ? (type.toUpperCase() as import('@prisma/client').EntityType) : undefined
  );

  return (
    <>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <p className="eyebrow">{world.title}</p>
            <h1 className="text-headline">Entities</h1>
            <p className="page-description">The people, places, groups, objects, creatures, and events that make up your world. Click any entity to see its full page.</p>
          </div>
          <Link href={`/worlds/${slug}/entities/new`} className="btn btn-primary">
            + New Entity
          </Link>
        </div>
      </div>

      <EntityFilters slug={slug} active={type?.toUpperCase()} />

      {entities.length > 0 ? (
        <div className="entity-grid">
          {entities.map((entity) => {
            const tags: string[] = JSON.parse(entity.tagsJson || '[]');
            return (
              <Link
                key={entity.id}
                href={`/worlds/${slug}/entities/${entity.slug}`}
                className="entity-card"
              >
                <div className="entity-card-header">
                  <div className="entity-dot" style={{ background: ENTITY_COLORS[entity.type] || '#888' }} />
                  <span
                    className="badge"
                    style={{
                      borderColor: `${ENTITY_COLORS[entity.type]}40`,
                      color: ENTITY_COLORS[entity.type],
                    }}
                  >
                    {ENTITY_LABELS[entity.type] || entity.type}
                  </span>
                </div>
                <h4>{entity.title}</h4>
                <p>{entity.summary}</p>
                {tags.length > 0 && (
                  <div className="entity-card-tags">
                    {tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="entity-tag">{tag}</span>
                    ))}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">◆</div>
          <h3>No entities found</h3>
          <p style={{ maxWidth: 480, marginBottom: 16 }}>
            {type
              ? 'No entities of this type yet. Click "+ New Entity" above to create one.'
              : 'Entities are the building blocks of your world — characters, locations, factions, items, and more. Start by creating your first one.'}
          </p>
          <Link href={`/worlds/${slug}/entities/new`} className="btn btn-primary">+ New Entity</Link>
        </div>
      )}
    </>
  );
}
