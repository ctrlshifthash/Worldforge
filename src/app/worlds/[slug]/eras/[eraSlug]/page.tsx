import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getWorldBySlug, getEraBySlug, getEntitiesIntroducedInEra, getEntitiesRetiredInEra, getRelationsFormedInEra, getRelationsDissolvedInEra, getTerritoriesForEra } from '@/lib/queries';
import { ENTITY_COLORS, ENTITY_LABELS } from '@/lib/utils';

export default async function EraDetailPage({
  params,
}: {
  params: Promise<{ slug: string; eraSlug: string }>;
}) {
  const { slug, eraSlug } = await params;
  const world = await getWorldBySlug(slug);
  if (!world) notFound();

  const era = await getEraBySlug(world.id, eraSlug);
  if (!era) notFound();

  const [introduced, retired, relationsFormed, relationsDissolved, territories] = await Promise.all([
    getEntitiesIntroducedInEra(era.id),
    getEntitiesRetiredInEra(era.id),
    getRelationsFormedInEra(era.id),
    getRelationsDissolvedInEra(era.id),
    getTerritoriesForEra(era.id),
  ]);

  // Collect unique entities across all events in this era
  const entityMap = new Map<string, { id: string; slug: string; title: string; type: string; accent: string; roles: Set<string> }>();
  for (const event of era.events) {
    for (const link of event.entityLinks) {
      const existing = entityMap.get(link.entity.id);
      if (existing) {
        existing.roles.add(link.role);
      } else {
        entityMap.set(link.entity.id, {
          ...link.entity,
          roles: new Set([link.role]),
        });
      }
    }
  }
  const activeEntities = Array.from(entityMap.values());

  const hasChanges = introduced.length > 0 || retired.length > 0 || relationsFormed.length > 0 || relationsDissolved.length > 0 || territories.length > 0;

  return (
    <>
      {/* Era Header */}
      <div className="era-detail-header">
        <Link href={`/worlds/${slug}/eras`} className="btn btn-ghost btn-sm" style={{ marginBottom: 12 }}>
          &larr; All Eras
        </Link>
        <div className="era-detail-title-row">
          <div className="era-detail-color-bar" style={{ background: era.color }} />
          <div>
            <p className="eyebrow">{world.title}</p>
            <h1 className="text-headline">{era.title}</h1>
            {(era.startLabel || era.endLabel) && (
              <p className="text-body" style={{ opacity: 0.7 }}>
                {era.startLabel}{era.startLabel && era.endLabel && ' — '}{era.endLabel}
              </p>
            )}
          </div>
        </div>
        {era.description && (
          <p className="text-body" style={{ marginTop: 12, maxWidth: 640 }}>{era.description}</p>
        )}
      </div>

      {/* What Changed This Era */}
      {hasChanges && (
        <div className="era-changes" style={{ marginTop: 32 }}>
          <h2 className="text-title" style={{ marginBottom: 16 }}>What Changed</h2>

          <div className="era-changes-grid">
            {introduced.length > 0 && (
              <div className="era-change-section">
                <h4 className="era-change-label era-change-introduced">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
                  Introduced ({introduced.length})
                </h4>
                <div className="era-change-list">
                  {introduced.map((entity) => (
                    <Link key={entity.id} href={`/worlds/${slug}/entities/${entity.slug}`} className="era-change-item">
                      <span className="entity-dot" style={{ background: ENTITY_COLORS[entity.type as keyof typeof ENTITY_COLORS] || '#888' }} />
                      <span className="era-change-item-title">{entity.title}</span>
                      <span className="badge badge-small" style={{ color: entity.accent, borderColor: `${entity.accent}40` }}>
                        {ENTITY_LABELS[entity.type as keyof typeof ENTITY_LABELS] || entity.type}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {retired.length > 0 && (
              <div className="era-change-section">
                <h4 className="era-change-label era-change-retired">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/></svg>
                  Retired ({retired.length})
                </h4>
                <div className="era-change-list">
                  {retired.map((entity) => (
                    <Link key={entity.id} href={`/worlds/${slug}/entities/${entity.slug}`} className="era-change-item" style={{ opacity: 0.7 }}>
                      <span className="entity-dot" style={{ background: ENTITY_COLORS[entity.type as keyof typeof ENTITY_COLORS] || '#888' }} />
                      <span className="era-change-item-title">{entity.title}</span>
                      <span className="badge badge-small" style={{ color: entity.accent, borderColor: `${entity.accent}40` }}>
                        {ENTITY_LABELS[entity.type as keyof typeof ENTITY_LABELS] || entity.type}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {relationsFormed.length > 0 && (
              <div className="era-change-section">
                <h4 className="era-change-label era-change-formed">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                  Relationships Formed ({relationsFormed.length})
                </h4>
                <div className="era-change-list">
                  {relationsFormed.map((rel) => (
                    <div key={rel.id} className="era-change-item">
                      <Link href={`/worlds/${slug}/entities/${rel.fromEntity.slug}`} style={{ color: rel.fromEntity.accent }}>
                        {rel.fromEntity.title}
                      </Link>
                      <span className="era-change-arrow">{rel.label}</span>
                      <Link href={`/worlds/${slug}/entities/${rel.toEntity.slug}`} style={{ color: rel.toEntity.accent }}>
                        {rel.toEntity.title}
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {relationsDissolved.length > 0 && (
              <div className="era-change-section">
                <h4 className="era-change-label era-change-dissolved">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  Relationships Dissolved ({relationsDissolved.length})
                </h4>
                <div className="era-change-list">
                  {relationsDissolved.map((rel) => (
                    <div key={rel.id} className="era-change-item" style={{ opacity: 0.7 }}>
                      <Link href={`/worlds/${slug}/entities/${rel.fromEntity.slug}`} style={{ color: rel.fromEntity.accent }}>
                        {rel.fromEntity.title}
                      </Link>
                      <span className="era-change-arrow" style={{ textDecoration: 'line-through' }}>{rel.label}</span>
                      <Link href={`/worlds/${slug}/entities/${rel.toEntity.slug}`} style={{ color: rel.toEntity.accent }}>
                        {rel.toEntity.title}
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {territories.length > 0 && (
              <div className="era-change-section">
                <h4 className="era-change-label era-change-territory">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  Territory Control ({territories.length})
                </h4>
                <div className="era-change-list">
                  {territories.map((t) => (
                    <div key={t.id} className="era-change-item">
                      <span className="entity-dot" style={{ background: t.region.color }} />
                      <span className="era-change-item-title">{t.region.title}</span>
                      <span className="era-change-arrow">held by</span>
                      <Link href={`/worlds/${slug}/entities/${t.entity.slug}`} style={{ color: t.entity.accent }}>
                        {t.entity.title}
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Events in this era */}
      <div style={{ marginTop: 32, marginBottom: 32 }}>
        <h2 className="text-title" style={{ marginBottom: 16 }}>
          Events ({era.events.length})
        </h2>

        {era.events.length > 0 ? (
          <div className="timeline">
            {era.events.map((event) => (
              <div key={event.id} className="timeline-event">
                <div className="timeline-event-card">
                  <div className="timeline-event-date">{event.dateLabel}</div>
                  <h3>{event.title}</h3>
                  <p>{event.summary}</p>
                  {event.impact && (
                    <div className="timeline-event-impact">{event.impact}</div>
                  )}
                  {event.entityLinks.length > 0 && (
                    <div className="timeline-event-entities">
                      {event.entityLinks.map((link) => (
                        <Link
                          key={link.id}
                          href={`/worlds/${slug}/entities/${link.entity.slug}`}
                          className="badge"
                          style={{ borderColor: `${link.entity.accent}40`, color: link.entity.accent }}
                        >
                          {link.entity.title}
                          {link.role !== 'involved' && (
                            <span style={{ opacity: 0.6, marginLeft: 4, fontSize: '0.7rem' }}>({link.role})</span>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-small">No events recorded in this era.</p>
        )}
      </div>

      {/* Active entities during this era */}
      {activeEntities.length > 0 && (
        <div>
          <h2 className="text-title" style={{ marginBottom: 16 }}>
            Active Entities ({activeEntities.length})
          </h2>
          <div className="entity-grid">
            {activeEntities.map((entity) => (
              <Link
                key={entity.id}
                href={`/worlds/${slug}/entities/${entity.slug}`}
                className="entity-card"
              >
                <div className="entity-card-header">
                  <div className="entity-dot" style={{ background: ENTITY_COLORS[entity.type as keyof typeof ENTITY_COLORS] || '#888' }} />
                  <span className="badge" style={{ borderColor: `${entity.accent}40`, color: entity.accent }}>
                    {ENTITY_LABELS[entity.type as keyof typeof ENTITY_LABELS] || entity.type}
                  </span>
                </div>
                <h4>{entity.title}</h4>
                <div className="era-entity-roles">
                  {Array.from(entity.roles).map((role) => (
                    <span key={role} className="badge badge-small">{role}</span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
