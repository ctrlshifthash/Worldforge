import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Navbar } from '@/components/Navbar';
import { WorldCardScene } from './WorldCardScene';
import { OnlineCounts } from './OnlineCounts';

// Render on-demand (request time), not at build — so the build never needs a
// live DB connection and can't fail when the database is briefly unreachable.
export const dynamic = 'force-dynamic';

export default async function DiscoverPage() {
  const worlds = await prisma.world.findMany({
    where: { visibility: 'PUBLIC' },
    include: {
      owner: { select: { id: true, name: true, username: true, avatar: true } },
      _count: { select: { entities: true, events: true, members: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });

  const slugs = worlds.map(w => w.slug);

  return (
    <>
      <Navbar />
      <OnlineCounts slugs={slugs} />
      <div className="page-container">
        <div className="discover-header">
          <div>
            <p className="eyebrow">Community</p>
            <h1 className="text-headline">Discover Worlds</h1>
            <p className="discover-subtitle">
              Explore worlds created by the community. Click any world to explore it — no account needed.
            </p>
          </div>
        </div>

        {worlds.length === 0 ? (
          <div className="discover-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z" /></svg>
            <h3>No public worlds yet</h3>
            <p>Be the first to share your world with the community!</p>
            <Link href="/register" className="btn btn-primary">Create Account</Link>
          </div>
        ) : (
          <div className="discover-grid">
            {worlds.map((world) => (
              <div key={world.id} className="discover-card">
                <div className="world-card-bg" style={{ background: world.coverGradient }} />
                <WorldCardScene slug={world.slug} />
                <div className="world-card-overlay" />
                <div className="discover-card-content">
                  <div className="discover-card-top">
                    <h3>{world.title}</h3>
                    <p className="discover-card-tagline">{world.tagline}</p>
                  </div>

                  <div className="discover-card-meta">
                    <div className="discover-card-author">
                      <div className="discover-card-avatar">
                        {world.owner?.name?.charAt(0)?.toUpperCase() ?? '?'}
                      </div>
                      <span>{world.owner?.name ?? 'Anonymous Creator'}</span>
                    </div>
                    <div className="discover-card-stats">
                      <span><strong>{world._count.entities}</strong> entities</span>
                      <span><strong>{world._count.events}</strong> events</span>
                      <span className="discover-card-online" data-slug={world.slug} />
                    </div>
                  </div>

                  <div className="discover-card-actions">
                    <Link href={`/worlds/${world.slug}`} className="btn btn-ghost btn-sm">
                      View Details
                    </Link>
                    <Link href={`/play/${world.slug}`} target="_blank" className="btn btn-primary btn-sm">
                      Enter World
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
