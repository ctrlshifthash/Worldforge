import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getWorldBySlug, getEvents, getEras, getEntities } from '@/lib/queries';
import { CreateEventForm } from './CreateEventForm';
import { TimelineFilter } from './TimelineFilter';

export default async function TimelinePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ follow?: string }>;
}) {
  const { slug } = await params;
  const { follow } = await searchParams;
  const world = await getWorldBySlug(slug);
  if (!world) notFound();

  const [allEvents, eras, entities] = await Promise.all([
    getEvents(world.id),
    getEras(world.id),
    getEntities(world.id),
  ]);

  // Filter events by followed entity if applicable
  const events = follow
    ? allEvents.filter((event) =>
        event.entityLinks?.some((link) => link.entity.id === follow)
      )
    : allEvents;

  const followedEntity = follow ? entities.find((e) => e.id === follow) : null;

  // Group events by era (prefer eraRef object, fallback to era string)
  const eraGroups: { id: string | null; slug: string | null; title: string; color: string; startLabel: string; endLabel: string; events: typeof events }[] = [];
  const eraMap = new Map<string, typeof eraGroups[0]>();

  for (const event of events) {
    const eraKey = event.eraRef?.id || event.era || 'Unknown Era';
    let group = eraMap.get(eraKey);
    if (!group) {
      group = {
        id: event.eraRef?.id || null,
        slug: event.eraRef?.slug || null,
        title: event.eraRef?.title || event.era || 'Unknown Era',
        color: event.eraRef?.color || '#c8a44e',
        startLabel: event.eraRef?.startLabel || '',
        endLabel: event.eraRef?.endLabel || '',
        events: [],
      };
      eraMap.set(eraKey, group);
      eraGroups.push(group);
    }
    group.events.push(event);
  }

  const eraOptions = eras.map((e) => ({ id: e.id, slug: e.slug, title: e.title, color: e.color }));

  const filterEntities = entities.map((e) => ({ id: e.id, title: e.title, type: e.type }));

  return (
    <>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <p className="eyebrow">{world.title}</p>
            <h1 className="text-headline">
              {followedEntity ? `${followedEntity.title}'s Timeline` : 'Timeline'}
            </h1>
            <p className="page-description">
              {followedEntity
                ? `Events involving ${followedEntity.title}, grouped by era.`
                : 'Your world\u2019s history \u2014 major events grouped by era. Click any event to see it on the map or connections view.'}
            </p>
          </div>
          <CreateEventForm eras={eraOptions} />
        </div>
        <TimelineFilter entities={filterEntities} slug={slug} />
      </div>

      {events.length > 0 ? (
        <div className="timeline">
          {eraGroups.map((eraGroup) => (
            <div key={eraGroup.id || eraGroup.title} className="timeline-era">
              {eraGroup.slug ? (
                <Link
                  href={`/worlds/${slug}/eras/${eraGroup.slug}`}
                  className="timeline-era-label-colored"
                  style={{ color: eraGroup.color, borderColor: `${eraGroup.color}40` }}
                >
                  <span style={{ position: 'absolute', left: 14, width: 12, height: 12, borderRadius: '50%', background: eraGroup.color, boxShadow: `0 0 12px ${eraGroup.color}40` }} />
                  {eraGroup.title}
                  {(eraGroup.startLabel || eraGroup.endLabel) && (
                    <span className="timeline-era-dates">
                      {eraGroup.startLabel}{eraGroup.startLabel && eraGroup.endLabel && ' — '}{eraGroup.endLabel}
                    </span>
                  )}
                </Link>
              ) : (
                <div className="timeline-era-label">{eraGroup.title}</div>
              )}

              {eraGroup.events.map((event) => (
                <div key={event.id} className="timeline-event">
                  <div className="timeline-event-card">
                    <div className="timeline-event-date">
                      {event.dateLabel}
                      {event.source === 'development' && (
                        <span className="event-ai-badge">AI</span>
                      )}
                    </div>
                    <h3>{event.title}</h3>
                    <p>{event.summary}</p>
                    {event.impact && (
                      <div className="timeline-event-impact">{event.impact}</div>
                    )}
                    {/* Entity links — prefer EntityLinks, fallback to CSV slugs */}
                    {event.entityLinks && event.entityLinks.length > 0 ? (
                      <div className="timeline-event-entities">
                        {event.entityLinks.map((link) => (
                          <Link
                            key={link.id}
                            href={`/worlds/${slug}/entities/${link.entity.slug}`}
                            className="badge"
                            style={{ borderColor: `${link.entity.accent}40`, color: link.entity.accent }}
                          >
                            {link.entity.title}
                          </Link>
                        ))}
                      </div>
                    ) : event.linkedEntitySlugs ? (
                      <div className="timeline-event-entities">
                        {event.linkedEntitySlugs.split(',').map((s: string) => s.trim()).filter(Boolean).map((entitySlug) => (
                          <Link
                            key={entitySlug}
                            href={`/worlds/${slug}/entities/${entitySlug}`}
                            className="badge"
                          >
                            {entitySlug.replace(/-/g, ' ')}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                    {/* Action buttons */}
                    <div className="timeline-event-actions">
                      <Link
                        href={`/worlds/${slug}/map?eventId=${event.id}`}
                        className="btn btn-ghost btn-sm"
                      >
                        Show on Map
                      </Link>
                      <Link
                        href={`/worlds/${slug}/graph?eventId=${event.id}`}
                        className="btn btn-ghost btn-sm"
                      >
                        Show in Connections
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">&#9203;</div>
          <h3>No timeline events</h3>
          <p style={{ maxWidth: 480, marginBottom: 16 }}>
            The timeline is your world&apos;s history — a list of major events grouped by era. Wars, coronations,
            disasters, discoveries. Each event has a date, summary, and description of how it changed the world.
            You can link events to entities and view them on the Map or Connections page.
          </p>
          <p className="text-small">
            Click <strong>&ldquo;+ New Event&rdquo;</strong> above to add one — or use the AI assist to generate one automatically.
          </p>
        </div>
      )}
    </>
  );
}
