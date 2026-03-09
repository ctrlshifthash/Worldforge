import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getWorldBySlug, getDevelopments, getCharacterSessions } from '@/lib/queries';
import { ENTITY_COLORS } from '@/lib/utils';
import { timeAgo } from '@/lib/utils';

const TYPE_LABELS: Record<string, string> = {
  JOURNAL: 'Journal',
  ENCOUNTER: 'Encounter',
  TRAVEL: 'Travel',
  CONVERSATION: 'Conversation',
  DISCOVERY: 'Discovery',
  RUMOR: 'Rumor',
  RELATIONSHIP_SHIFT: 'Relationship',
  MINOR_EVENT: 'Minor Event',
};

export default async function DevelopmentsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { slug } = await params;
  const { status } = await searchParams;
  const world = await getWorldBySlug(slug);
  if (!world) notFound();

  const filterStatus = status === 'APPROVED' || status === 'REJECTED' || status === 'EDITED' ? status : undefined;
  const [developments, sessions] = await Promise.all([
    getDevelopments(world.id, filterStatus as never),
    getCharacterSessions(world.id),
  ]);

  const pendingDevs = developments.filter((d) => d.status === 'PENDING');
  const reviewedDevs = developments.filter((d) => d.status !== 'PENDING');
  const displayDevs = filterStatus ? developments : [...pendingDevs, ...reviewedDevs];

  const activeSessions = sessions.filter((s) => s.status === 'ACTIVE');

  return (
    <>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <p className="eyebrow">{world.title}</p>
            <h1 className="text-headline">Story Queue</h1>
            <p className="page-description">AI-written stories waiting for your review. Read each one, then approve or reject it. Approved stories become part of your world.</p>
          </div>
        </div>
        {activeSessions.length > 0 && (
          <div className="dev-active-sessions">
            <span className="dev-active-sessions-label">Characters with AI on:</span>
            {activeSessions.map((s) => (
              <span key={s.id} className="badge" style={{ borderColor: `${s.entity.accent}40`, color: s.entity.accent }}>
                {s.entity.title}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Filter tabs */}
      <div className="dev-filter-tabs">
        <Link
          href={`/worlds/${slug}/developments`}
          className={`dev-filter-tab ${!filterStatus ? 'active' : ''}`}
        >
          All{pendingDevs.length > 0 ? ` (${pendingDevs.length} pending)` : ''}
        </Link>
        <Link
          href={`/worlds/${slug}/developments?status=APPROVED`}
          className={`dev-filter-tab ${filterStatus === 'APPROVED' ? 'active' : ''}`}
        >
          Approved
        </Link>
        <Link
          href={`/worlds/${slug}/developments?status=REJECTED`}
          className={`dev-filter-tab ${filterStatus === 'REJECTED' ? 'active' : ''}`}
        >
          Rejected
        </Link>
      </div>

      {displayDevs.length > 0 ? (
        <div className="dev-list">
          {displayDevs.map((dev) => (
            <Link
              key={dev.id}
              href={`/worlds/${slug}/developments/${dev.id}`}
              className="dev-card"
            >
              <div className="dev-card-header">
                <span className="dev-type-badge" data-type={dev.type}>
                  {TYPE_LABELS[dev.type] || dev.type}
                </span>
                <span className={`dev-status-badge dev-status-${dev.status.toLowerCase()}`}>
                  {dev.status}
                </span>
              </div>
              <h3 className="dev-card-title">{dev.title}</h3>
              <p className="dev-card-preview">{dev.content.slice(0, 180)}{dev.content.length > 180 ? '...' : ''}</p>
              <div className="dev-card-footer">
                <span className="dev-card-character">
                  <span className="entity-dot" style={{ background: ENTITY_COLORS[dev.session.entity.type] || dev.session.entity.accent, width: 6, height: 6 }} />
                  {dev.session.entity.title}
                </span>
                {dev.dateLabel && <span className="dev-card-date">{dev.dateLabel}</span>}
                <span className="dev-card-time">{timeAgo(dev.createdAt)}</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">&#9998;</div>
          <h3>No AI stories yet</h3>
          <p style={{ maxWidth: 480, marginBottom: 20 }}>
            When you turn on AI storytelling for a character, the AI writes short stories about what they did — encounters, journal entries, discoveries. Those stories appear here for you to review.
          </p>
          <div className="empty-state-steps">
            <div className="empty-state-step">
              <span className="empty-state-step-num">1</span>
              <span>Go to any <strong>Character&apos;s</strong> page</span>
            </div>
            <div className="empty-state-step">
              <span className="empty-state-step-num">2</span>
              <span>Find <strong>AI Storytelling</strong> in the sidebar and turn it on</span>
            </div>
            <div className="empty-state-step">
              <span className="empty-state-step-num">3</span>
              <span>Click <strong>&ldquo;Write Next Story&rdquo;</strong> to generate one</span>
            </div>
            <div className="empty-state-step">
              <span className="empty-state-step-num">4</span>
              <span>Come back here to <strong>read, approve, or reject</strong> it</span>
            </div>
          </div>
          <Link href={`/worlds/${slug}/entities`} className="btn btn-primary" style={{ marginTop: 20 }}>
            Go to Entities
          </Link>
        </div>
      )}
    </>
  );
}
