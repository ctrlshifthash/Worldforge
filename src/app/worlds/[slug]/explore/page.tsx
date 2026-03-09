import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getWorldBySlug, getEntities, getEras } from '@/lib/queries';
import { ENTITY_LABELS } from '@/lib/utils';
import { EraScrubber } from '@/components/EraScrubber';

export default async function ExplorePage({
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

  const [allEntities, eras] = await Promise.all([
    getEntities(world.id),
    getEras(world.id),
  ]);

  // Filter entities by era lifecycle if an era is selected
  let entities = allEntities;
  const selectedEra = eraSlug ? eras.find((e) => e.slug === eraSlug) : null;

  if (selectedEra) {
    entities = allEntities.filter((e) => {
      // Entity must have been introduced at or before this era
      if (e.introducedEraId) {
        const introEra = eras.find((er) => er.id === e.introducedEraId);
        if (introEra && introEra.sortOrder > selectedEra.sortOrder) return false;
      }
      // Entity must not have been retired before this era
      if (e.retiredEraId) {
        const retiredEra = eras.find((er) => er.id === e.retiredEraId);
        if (retiredEra && retiredEra.sortOrder <= selectedEra.sortOrder) return false;
      }
      return true;
    });
  }

  const typeCounts: Record<string, number> = {};
  for (const e of entities) {
    typeCounts[e.type] = (typeCounts[e.type] || 0) + 1;
  }

  const locationCount = typeCounts['LOCATION'] || 0;
  const characterCount = typeCounts['CHARACTER'] || 0;

  const erasForScrubber = eras.map((e) => ({
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
      <div className="page-header" style={{ marginBottom: '12px' }}>
        <div className="page-header-row">
          <div>
            <p className="eyebrow">{world.title}</p>
            <h1 className="text-headline">Play</h1>
            <p className="page-description">Enter your world. Use WASD to move, SPACE to attack, E to interact.</p>
          </div>
        </div>
      </div>

      {eras.length >= 2 && (
        <EraScrubber eras={erasForScrubber} basePath={`/worlds/${slug}/explore`} />
      )}

      {selectedEra && (
        <p className="text-small" style={{ marginTop: 8, marginBottom: 4, color: 'var(--text-muted)' }}>
          Showing world as of <strong style={{ color: selectedEra.color }}>{selectedEra.title}</strong>
          {selectedEra.startLabel && ` (${selectedEra.startLabel}${selectedEra.endLabel ? ' — ' + selectedEra.endLabel : ''})`}
        </p>
      )}

      <div className="explore-landing">
        <div className="explore-landing-preview">
          <div className="explore-landing-gradient" style={{ background: world.coverGradient }} />
          <div className="explore-landing-overlay" />
          <div className="explore-landing-center">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" style={{ opacity: 0.4 }}>
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z" />
            </svg>
            <h2>{world.title}</h2>
            <p>{world.tagline}</p>

            <Link
              href={`/play/${slug}${eraSlug ? `?era=${eraSlug}` : ''}`}
              target="_blank"
              className="btn btn-primary btn-lg explore-enter-btn"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3" /></svg>
              Enter World
            </Link>
          </div>
        </div>

        <div className="explore-landing-info">
          <div className="explore-landing-stats">
            <div className="explore-landing-stat">
              <div className="explore-landing-stat-value">{entities.length}</div>
              <div className="explore-landing-stat-label">{selectedEra ? 'Active Entities' : 'Total Entities'}</div>
            </div>
            <div className="explore-landing-stat">
              <div className="explore-landing-stat-value">{locationCount}</div>
              <div className="explore-landing-stat-label">Locations</div>
            </div>
            <div className="explore-landing-stat">
              <div className="explore-landing-stat-value">{characterCount}</div>
              <div className="explore-landing-stat-label">Characters</div>
            </div>
          </div>

          <div className="explore-landing-details">
            <h3>What&apos;s in this world?</h3>
            <div className="explore-landing-types">
              {Object.entries(typeCounts).map(([type, count]) => (
                <div key={type} className="explore-landing-type-row">
                  <span>{(ENTITY_LABELS as Record<string, string>)[type] || type}</span>
                  <span className="explore-landing-type-count">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="explore-landing-controls">
            <h3>Controls</h3>
            <div className="explore-landing-control-list">
              <div className="explore-landing-control">
                <kbd>W A S D</kbd>
                <span>Move around</span>
              </div>
              <div className="explore-landing-control">
                <kbd>E</kbd>
                <span>Interact with entities</span>
              </div>
              <div className="explore-landing-control">
                <kbd>ESC</kbd>
                <span>Close inspect panel</span>
              </div>
              <div className="explore-landing-control">
                <kbd>P</kbd>
                <span>Open shop</span>
              </div>
              <div className="explore-landing-control">
                <kbd>B</kbd>
                <span>Open build menu (owner)</span>
              </div>
              <div className="explore-landing-control">
                <kbd>SPACE</kbd>
                <span>Attack enemies</span>
              </div>
              <div className="explore-landing-control">
                <kbd>?</kbd>
                <span>Open tutorial / help</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
