import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { getWorlds } from '@/lib/queries';
import { CreateWorldButton } from './CreateWorldButton';

export default async function DashboardPage() {
  const session = await getSession();
  const worlds = await getWorlds(session?.sub);

  const totalEntities = worlds.reduce((sum, w) => sum + w._count.entities, 0);
  const totalEvents = worlds.reduce((sum, w) => sum + w._count.events, 0);

  return (
    <>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <p className="eyebrow">Dashboard</p>
            <h1 className="text-headline">Your Worlds</h1>
          </div>
          <CreateWorldButton />
        </div>
      </div>

      <Link
        href="/dashboard/earnings"
        className="card"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          marginBottom: 20,
          textDecoration: 'none',
          borderColor: 'var(--gold-dim)',
          background: 'linear-gradient(90deg, rgba(232,200,106,0.10), rgba(232,200,106,0.02))',
        }}
      >
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--gold)' }}>
            💰 Earnings &amp; Claims
          </div>
          <div className="text-small">Claim the real SOL you&apos;ve earned from quests — up to 4 times a day, 6 hours apart.</div>
        </div>
        <span className="btn btn-primary btn-sm">Open Earnings →</span>
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700 }}>{worlds.length}</div>
          <div className="text-small">Active Worlds</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700 }}>{totalEntities}</div>
          <div className="text-small">Total Entities</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700 }}>{totalEvents}</div>
          <div className="text-small">Timeline Events</div>
        </div>
      </div>

      <div className="worlds-grid">
        {worlds.map((world) => (
          <Link key={world.id} href={`/worlds/${world.slug}`} className="world-card">
            <div className="world-card-bg" style={{ background: world.coverGradient }} />
            <div className="world-card-overlay" />
            <div className="world-card-content">
              <div className="world-card-visibility">
                <span className="badge" style={world.visibility === 'PUBLIC' ? { borderColor: 'var(--gold-dim)', color: 'var(--gold)' } : {}}>
                  {world.visibility === 'PUBLIC' ? 'Public' : 'Private'}
                </span>
              </div>
              <h3>{world.title}</h3>
              <p>{world.tagline}</p>
              <div className="world-card-stats">
                <span className="world-card-stat"><strong>{world._count.entities}</strong> entities</span>
                <span className="world-card-stat"><strong>{world._count.events}</strong> events</span>
                <span className="world-card-stat"><strong>{world._count.members}</strong> members</span>
              </div>
            </div>
          </Link>
        ))}
        <CreateWorldButton isCard />
      </div>
    </>
  );
}
