import { notFound } from 'next/navigation';
import { getWorldBySlug, getDevelopment } from '@/lib/queries';
import { ENTITY_COLORS } from '@/lib/utils';
import { DevelopmentActions } from './DevelopmentActions';

const TYPE_LABELS: Record<string, string> = {
  JOURNAL: 'Journal Entry',
  ENCOUNTER: 'Encounter',
  TRAVEL: 'Travel Log',
  CONVERSATION: 'Conversation',
  DISCOVERY: 'Discovery',
  RUMOR: 'Rumor',
  RELATIONSHIP_SHIFT: 'Relationship Shift',
  MINOR_EVENT: 'Minor Event',
};

export default async function DevelopmentDetailPage({
  params,
}: {
  params: Promise<{ slug: string; developmentId: string }>;
}) {
  const { slug, developmentId } = await params;
  const world = await getWorldBySlug(slug);
  if (!world) notFound();

  const development = await getDevelopment(developmentId);
  if (!development) notFound();

  const proposedChanges = (() => {
    try { return JSON.parse(development.proposedChangesJson); } catch { return {}; }
  })();

  const hasProposedChanges =
    (proposedChanges.newRelations?.length > 0) ||
    (proposedChanges.newFacts?.length > 0) ||
    (proposedChanges.newTags?.length > 0);

  const paragraphs = development.content.split('\n\n').filter(Boolean);

  return (
    <>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <p className="eyebrow">
              <span className="entity-dot" style={{ background: ENTITY_COLORS[development.session.entity.type] || development.session.entity.accent, width: 8, height: 8 }} />
              {development.session.entity.title} &middot; {TYPE_LABELS[development.type] || development.type}
            </p>
            <h1 className="text-headline">{development.title}</h1>
          </div>
          <span className={`dev-status-badge dev-status-${development.status.toLowerCase()}`} style={{ fontSize: '0.85rem', padding: '4px 14px' }}>
            {development.status}
          </span>
        </div>
        {development.dateLabel && (
          <div style={{ fontSize: '0.82rem', color: 'var(--gold)', marginTop: 4 }}>
            {development.dateLabel}
            {development.era && (
              <span style={{ color: development.era.color, marginLeft: 8 }}>
                &middot; {development.era.title}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="dev-detail-layout">
        {/* Narrative content */}
        <div className="dev-detail-content">
          <div className="dev-narrative">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          {development.reviewNote && (
            <div className="dev-review-note">
              <h4>Review Note</h4>
              <p>{development.reviewNote}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="dev-detail-sidebar">
          {/* Proposed Changes */}
          {hasProposedChanges && (
            <div className="dev-sidebar-section">
              <h4>If you approve, this will be added to your world:</h4>

              {proposedChanges.newRelations?.length > 0 && (
                <div className="dev-proposed-group">
                  <div className="dev-proposed-label">New Connections</div>
                  {proposedChanges.newRelations.map((rel: { toEntitySlug: string; label: string }, i: number) => (
                    <div key={i} className="dev-proposed-item">
                      {development.session.entity.title} &rarr; {rel.toEntitySlug?.replace(/-/g, ' ')}: <em>{rel.label}</em>
                    </div>
                  ))}
                </div>
              )}

              {proposedChanges.newFacts?.length > 0 && (
                <div className="dev-proposed-group">
                  <div className="dev-proposed-label">New Facts</div>
                  {proposedChanges.newFacts.map((fact: { entitySlug: string; label: string; value: string }, i: number) => (
                    <div key={i} className="dev-proposed-item">
                      {fact.label}: {fact.value}
                    </div>
                  ))}
                </div>
              )}

              {proposedChanges.newTags?.length > 0 && (
                <div className="dev-proposed-group">
                  <div className="dev-proposed-label">New Tags</div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {proposedChanges.newTags.map((t: { tag: string }, i: number) => (
                      <span key={i} className="entity-tag">{t.tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          {development.status === 'PENDING' && (
            <DevelopmentActions developmentId={development.id} slug={slug} />
          )}
        </div>
      </div>
    </>
  );
}
