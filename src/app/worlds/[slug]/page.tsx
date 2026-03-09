import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getWorldBySlug, getEntities, getActivity, getEvents, getEras, getCharacterSessions, getPendingDevelopmentCount, getRecentWorldDevelopments } from '@/lib/queries';
import { ENTITY_COLORS, ENTITY_LABELS, timeAgo } from '@/lib/utils';
import { GenerateWorld } from './GenerateWorld';

export default async function WorldOverviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const world = await getWorldBySlug(slug);
  if (!world) notFound();

  const [entities, activity, events, eras, sessions, pendingDevCount, recentCanon] = await Promise.all([
    getEntities(world.id),
    getActivity(world.id, 8),
    getEvents(world.id),
    getEras(world.id),
    getCharacterSessions(world.id),
    getPendingDevelopmentCount(world.id),
    getRecentWorldDevelopments(world.id, 5),
  ]);

  const recentEntities = entities.slice(0, 6);
  const activeSessions = sessions.filter((s) => s.status === 'ACTIVE');
  const characterCount = entities.filter((e) => e.type === 'CHARACTER').length;
  const locationCount = entities.filter((e) => e.type === 'LOCATION').length;
  const factionCount = entities.filter((e) => e.type === 'FACTION').length;

  return (
    <>
      {/* World Hero */}
      <div className="world-hero">
        <div className="world-hero-bg" style={{ background: world.coverGradient }} />
        <div className="world-hero-overlay" />
        <div className="world-hero-content">
          <p className="eyebrow">{world.visibility === 'PUBLIC' ? 'Public World' : 'Private World'}</p>
          <h1>{world.title}</h1>
          <p className="world-hero-tagline">{world.tagline}</p>
          <div className="world-stats">
            <div className="world-stat">
              <span className="world-stat-value">{world._count.entities}</span>
              <span className="world-stat-label">Entities</span>
            </div>
            <div className="world-stat">
              <span className="world-stat-value">{world._count.events}</span>
              <span className="world-stat-label">Events</span>
            </div>
            <div className="world-stat">
              <span className="world-stat-value">{world._count.relations}</span>
              <span className="world-stat-label">Connections</span>
            </div>
            <div className="world-stat">
              <span className="world-stat-value">{eras.length}</span>
              <span className="world-stat-label">Eras</span>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      {world.description ? (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: 8 }}>About this World</h3>
          <p className="text-body">{world.description}</p>
        </div>
      ) : (
        <div className="card" style={{ marginBottom: 24, borderStyle: 'dashed' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: 4 }}>About this World</h3>
              <p className="text-small">Add a description to tell visitors what your world is about.</p>
            </div>
            <Link href={`/worlds/${slug}/settings`} className="btn btn-secondary btn-sm">Edit Details</Link>
          </div>
        </div>
      )}

      {/* Active Character Sessions & Pending Developments */}
      {(activeSessions.length > 0 || pendingDevCount > 0) && (
        <div className="card" style={{ marginBottom: 24, borderColor: 'var(--gold-dim)' }}>
          <div className="page-header-row" style={{ marginBottom: 12 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem' }}>AI Characters</h3>
            <Link href={`/worlds/${slug}/developments`} className="btn btn-ghost btn-sm">
              Review Stories{pendingDevCount > 0 ? ` (${pendingDevCount})` : ''}
            </Link>
          </div>
          {activeSessions.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: pendingDevCount > 0 ? 12 : 0 }}>
              {activeSessions.map((s) => (
                <Link
                  key={s.id}
                  href={`/worlds/${slug}/entities/${s.entity.slug}`}
                  className="badge"
                  style={{ borderColor: `${s.entity.accent}40`, color: s.entity.accent }}
                >
                  {s.entity.title} — AI is writing their story
                </Link>
              ))}
            </div>
          )}
          {pendingDevCount > 0 && (
            <p className="text-small" style={{ color: 'var(--gold)' }}>
              {pendingDevCount} AI-generated {pendingDevCount !== 1 ? 'stories' : 'story'} awaiting your review
            </p>
          )}
        </div>
      )}

      {/* Recent World Events (canonized developments) */}
      {recentCanon.length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="page-header-row" style={{ marginBottom: 12 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem' }}>Latest Character Stories</h3>
          </div>
          <div className="world-changelog">
            {recentCanon.map((dev) => (
              <Link
                key={dev.id}
                href={`/worlds/${slug}/entities/${dev.session.entity.slug}`}
                className="world-changelog-entry"
              >
                <span
                  className="entity-dot"
                  style={{ background: dev.session.entity.accent, width: 8, height: 8 }}
                />
                <span className="world-changelog-name">{dev.session.entity.title}</span>
                <span className="world-changelog-title">{dev.title}</span>
                <span className="world-changelog-type" data-type={dev.type.toLowerCase()}>
                  {dev.type.replace('_', ' ').toLowerCase()}
                </span>
                <span className="world-changelog-time">{dev.canonizedAt ? timeAgo(dev.canonizedAt) : ''}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Getting Started (shown when world is mostly empty) */}
      {entities.length === 0 && events.length === 0 && (
        <div className="overview-getting-started">
          <h2 className="text-title" style={{ marginBottom: 8 }}>Get Started</h2>
          <p className="text-body" style={{ marginBottom: 24 }}>Your world is empty. Generate content with AI or build it manually.</p>

          <div style={{ marginBottom: 24 }}>
            <GenerateWorld />
          </div>

          <div className="divider" />
          <p className="text-small" style={{ marginBottom: 16 }}>Or build manually:</p>
          <div className="overview-steps">
            <Link href={`/worlds/${slug}/settings`} className="overview-step card card-interactive">
              <div className="overview-step-number">1</div>
              <div>
                <h4>Set up your world</h4>
                <p className="text-small">Add a description, set visibility, and configure your world details.</p>
              </div>
            </Link>
            <Link href={`/worlds/${slug}/entities/new`} className="overview-step card card-interactive">
              <div className="overview-step-number">2</div>
              <div>
                <h4>Create entities</h4>
                <p className="text-small">Add characters, locations, factions, artifacts, and species.</p>
              </div>
            </Link>
            <Link href={`/worlds/${slug}/timeline`} className="overview-step card card-interactive">
              <div className="overview-step-number">3</div>
              <div>
                <h4>Build your timeline</h4>
                <p className="text-small">Record key events and shape your world&apos;s history.</p>
              </div>
            </Link>
            <Link href={`/worlds/${slug}/explore`} className="overview-step card card-interactive">
              <div className="overview-step-number">4</div>
              <div>
                <h4>Explore your world</h4>
                <p className="text-small">Walk through your world in an interactive 2D environment.</p>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* ─── Feature Hub ─── */}
      {(entities.length > 0 || events.length > 0) && (
        <div className="overview-hub">
          <h2 className="text-title" style={{ marginBottom: 16 }}>Your World at a Glance</h2>
          <p className="text-body" style={{ marginBottom: 24, maxWidth: 600 }}>
            Each section gives you a different lens into your world. Click any card to jump in.
          </p>
          <div className="overview-hub-grid">
            <Link href={`/worlds/${slug}/explore`} className="overview-hub-card">
              <div className="overview-hub-icon" style={{ color: '#7B61FF' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 12h18M12 3v18"/></svg>
              </div>
              <div>
                <h4>Play</h4>
                <p>Enter your world. Explore, fight enemies, talk to NPCs, complete quests, and build structures.</p>
              </div>
            </Link>

            <Link href={`/worlds/${slug}/map`} className="overview-hub-card">
              <div className="overview-hub-icon" style={{ color: '#E84393' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              </div>
              <div>
                <h4>Map</h4>
                <p>Bird&apos;s-eye view of your world. Draw regions, assign faction territories per era, and see how borders change over time.</p>
              </div>
            </Link>

            <Link href={`/worlds/${slug}/graph`} className="overview-hub-card">
              <div className="overview-hub-icon" style={{ color: '#0984E3' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="12" cy="18" r="2.5"/><path d="M8 7.5l3 8M16 7.5l-3 8M8.5 6h7"/></svg>
              </div>
              <div>
                <h4>Connections</h4>
                <p>See how everything in your world is connected — alliances, rivalries, origins. Hover to highlight connections. Filter by era to see how relationships changed over time.</p>
              </div>
            </Link>

            <Link href={`/worlds/${slug}/entities`} className="overview-hub-card">
              <div className="overview-hub-icon" style={{ color: '#FF6B2C' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="8" r="4"/><path d="M5 20a7 7 0 0 1 14 0"/></svg>
              </div>
              <div>
                <h4>Entities</h4>
                <p>{characterCount} character{characterCount !== 1 ? 's' : ''}, {locationCount} location{locationCount !== 1 ? 's' : ''}, {factionCount} faction{factionCount !== 1 ? 's' : ''}, and more. Each entity has lore, facts, tags, history, and connections.</p>
              </div>
            </Link>

            <Link href={`/worlds/${slug}/timeline`} className="overview-hub-card">
              <div className="overview-hub-icon" style={{ color: '#36B37E' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 12h4l3-9 4 18 3-9h4"/></svg>
              </div>
              <div>
                <h4>Timeline</h4>
                <p>{events.length} event{events.length !== 1 ? 's' : ''} across {eras.length} era{eras.length !== 1 ? 's' : ''}. See your world&apos;s full history. Click any event to show it on the map or graph.</p>
              </div>
            </Link>

            <Link href={`/worlds/${slug}/eras`} className="overview-hub-card">
              <div className="overview-hub-icon" style={{ color: '#F39C12' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="9"/></svg>
              </div>
              <div>
                <h4>Eras</h4>
                <p>Time periods that divide your history. Each era has its own color, date range, and events. Use the era filter on the map and connections view to filter by time period.</p>
              </div>
            </Link>

            <Link href={`/worlds/${slug}/developments`} className="overview-hub-card">
              <div className="overview-hub-icon" style={{ color: '#36B37E' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              </div>
              <div>
                <h4>Story Queue</h4>
                <p>AI-generated stories from characters with AI Storytelling on. Read them, then approve or reject. Approved stories become part of your world&apos;s official history{pendingDevCount > 0 ? ` — ${pendingDevCount} pending now` : ''}.</p>
              </div>
            </Link>

            <Link href={`/worlds/${slug}/activity`} className="overview-hub-card">
              <div className="overview-hub-icon" style={{ color: '#7a7a7a' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              </div>
              <div>
                <h4>Activity Log</h4>
                <p>Full log of every creation, edit, and generation — with timestamps and who did what.</p>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* Recent Entities */}
      <div style={{ marginBottom: 32 }}>
        <div className="page-header-row" style={{ marginBottom: 16 }}>
          <h2 className="text-title">Recent Entities</h2>
          <Link href={`/worlds/${slug}/entities`} className="btn btn-ghost btn-sm">View all</Link>
        </div>

        {recentEntities.length > 0 ? (
          <div className="entity-grid">
            {recentEntities.map((entity) => (
              <Link
                key={entity.id}
                href={`/worlds/${slug}/entities/${entity.slug}`}
                className="entity-card"
              >
                <div className="entity-card-header">
                  <div className="entity-dot" style={{ background: ENTITY_COLORS[entity.type] || '#888' }} />
                  <span className="badge" style={{ borderColor: `${ENTITY_COLORS[entity.type]}40`, color: ENTITY_COLORS[entity.type] }}>
                    {ENTITY_LABELS[entity.type] || entity.type}
                  </span>
                </div>
                <h4>{entity.title}</h4>
                <p>{entity.summary}</p>
              </Link>
            ))}
          </div>
        ) : (
          entities.length === 0 && events.length > 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">&#9670;</div>
              <h3>No entities yet</h3>
              <p style={{ maxWidth: 480 }}>Entities are the building blocks of your world — characters, locations, factions, items, and more. Create your first one to get started.</p>
              <Link href={`/worlds/${slug}/entities/new`} className="btn btn-primary">Create First Entity</Link>
            </div>
          )
        )}
      </div>

      {/* Activity & Members */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Activity */}
        <div className="card">
          <div className="page-header-row" style={{ marginBottom: 16 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem' }}>Recent Activity</h3>
            <Link href={`/worlds/${slug}/activity`} className="btn btn-ghost btn-sm">View all</Link>
          </div>
          {activity.length > 0 ? (
            <div className="activity-feed">
              {activity.slice(0, 5).map((item) => (
                <div key={item.id} className="activity-item">
                  <div className="activity-avatar">
                    {item.user.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="activity-body">
                    <div className="activity-text">
                      <strong>{item.user.name}</strong> {item.action} {item.target}
                    </div>
                  </div>
                  <span className="activity-time">{timeAgo(item.createdAt)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-small">No activity recorded yet.</p>
          )}
        </div>

        {/* Members */}
        <div className="card">
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: 16 }}>Members</h3>
          <div style={{ display: 'grid', gap: 12 }}>
            {world.members.map((member) => (
              <div key={member.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="sidebar-avatar" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>
                  {member.user.name?.charAt(0)?.toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 500 }}>{member.user.name}</div>
                  <div className="text-small">@{member.user.username}</div>
                </div>
                <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>{member.role}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
