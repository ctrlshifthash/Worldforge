import type { Metadata } from 'next';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { prisma } from '@/lib/prisma';
import { PAYOUT } from '@/lib/payouts/config';

// Live data — never prerender at build (and never needs the DB at build time).
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Leaderboard — Worldcraft',
  description: 'Top earners, most quests cleared, and the most-visited worlds on Worldcraft.',
};

type UserLite = { id: string; name: string | null; username: string | null; walletAddress: string | null };

function displayName(u?: UserLite): string {
  if (!u) return 'Player';
  if (u.username) return u.username;
  if (u.name) return u.name;
  if (u.walletAddress) return `${u.walletAddress.slice(0, 4)}…${u.walletAddress.slice(-4)}`;
  return 'Player';
}

const MEDAL = ['🥇', '🥈', '🥉'];

export default async function LeaderboardPage() {
  // Typed fetch helpers so the page can fall back to empty boards if the DB is down.
  const fetchEarners = () =>
    prisma.questCompletion.groupBy({
      by: ['userId'],
      where: { earnedSol: { gt: 0 } },
      _sum: { earnedSol: true },
      orderBy: { _sum: { earnedSol: 'desc' } },
      take: 10,
    });
  const fetchQuesters = () =>
    prisma.questCompletion.groupBy({
      by: ['userId'],
      _count: { userId: true },
      orderBy: { _count: { userId: 'desc' } },
      take: 10,
    });
  const fetchWorlds = () =>
    prisma.world.findMany({
      where: { visibility: 'PUBLIC' },
      orderBy: [{ visits: 'desc' }, { updatedAt: 'desc' }],
      take: 10,
      select: { slug: true, title: true, visits: true, _count: { select: { entities: true } } },
    });
  const fetchStats = async () => {
    const [worldCount, playerCount, questCount, visitAgg] = await Promise.all([
      prisma.world.count(),
      prisma.user.count(),
      prisma.questCompletion.count(),
      prisma.world.aggregate({ _sum: { visits: true } }),
    ]);
    return { worlds: worldCount, players: playerCount, quests: questCount, visits: visitAgg._sum.visits ?? 0 };
  };

  let earners: Awaited<ReturnType<typeof fetchEarners>> = [];
  let questers: Awaited<ReturnType<typeof fetchQuesters>> = [];
  let worlds: Awaited<ReturnType<typeof fetchWorlds>> = [];
  let stats = { worlds: 0, players: 0, quests: 0, visits: 0 };
  let users: UserLite[] = [];
  try {
    [earners, questers, worlds, stats] = await Promise.all([fetchEarners(), fetchQuesters(), fetchWorlds(), fetchStats()]);
    const ids = [...new Set([...earners.map((e) => e.userId), ...questers.map((q) => q.userId)])];
    if (ids.length) {
      users = await prisma.user.findMany({
        where: { id: { in: ids } },
        select: { id: true, name: true, username: true, walletAddress: true },
      });
    }
  } catch {
    /* DB unreachable — render empty boards instead of a 500 */
  }
  const byId = new Map(users.map((u) => [u.id, u]));

  return (
    <>
      <Navbar />
      <main className="page-container">
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 0' }}>
          <h1 style={{ fontSize: 36, margin: '0 0 6px', color: '#fff' }}>Leaderboard</h1>
          <p style={{ color: '#9a9aa3', margin: '0 0 22px' }}>
            Top earners, the most relentless questers, and the worlds everyone&apos;s exploring.
          </p>

          {/* Live platform stats — all real, straight from the database */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 26 }}>
            <Stat icon="🌍" label="Worlds created" value={stats.worlds.toLocaleString()} />
            <Stat icon="🧭" label="Worlds explored" value={`${stats.visits.toLocaleString()} visits`} />
            <Stat icon="⚔️" label="Quests completed" value={stats.quests.toLocaleString()} />
            <Stat icon="🧑‍🚀" label="Adventurers" value={stats.players.toLocaleString()} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 }}>
            {/* Top earners */}
            <Board title="💰 Top Earners" subtitle="Lifetime SOL earned (claimed + unclaimed)">
              {earners.length === 0 && <Empty>{`${PAYOUT.pool.dailyCapSol} SOL daily pool is live — be the first to claim it.`}</Empty>}
              {earners.map((e, i) => (
                <Row key={e.userId} rank={i} name={displayName(byId.get(e.userId))} value={`${(e._sum.earnedSol ?? 0).toFixed(4)} SOL`} />
              ))}
            </Board>

            {/* Most quests */}
            <Board title="⚔️ Most Quests Cleared" subtitle="Total quests completed">
              {questers.length === 0 && <Empty>Quests are waiting — be the first to clear one.</Empty>}
              {questers.map((q, i) => (
                <Row key={q.userId} rank={i} name={displayName(byId.get(q.userId))} value={`${q._count.userId}`} />
              ))}
            </Board>

            {/* Most-visited worlds */}
            <Board title="🌍 Most-Visited Worlds" subtitle="Public worlds by visits">
              {worlds.length === 0 && <Empty>No public worlds yet.</Empty>}
              {worlds.map((w, i) => (
                <Row
                  key={w.slug}
                  rank={i}
                  name={<Link href={`/play/${w.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>{w.title}</Link>}
                  value={`${w.visits} visits`}
                />
              ))}
            </Board>
          </div>

          <p style={{ color: '#666', fontSize: 13, marginTop: 24 }}>
            Updated live. Earnings reflect real on-chain rewards for token holders; non-holders earn in-game coins.
          </p>
        </div>
      </main>
    </>
  );
}

const panel: React.CSSProperties = {
  background: '#16161a',
  border: '1px solid #2a2a30',
  borderRadius: 14,
  padding: '18px 18px 12px',
};

function Board({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section style={panel}>
      <h2 style={{ fontSize: 17, margin: '0 0 2px', color: '#f0e6c8' }}>{title}</h2>
      <div style={{ fontSize: 12, color: '#7a7a83', marginBottom: 12 }}>{subtitle}</div>
      <div>{children}</div>
    </section>
  );
}

function Row({ rank, name, value }: { rank: number; name: React.ReactNode; value: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
        padding: '9px 8px',
        borderBottom: '1px solid #212126',
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        <span style={{ width: 24, textAlign: 'center', color: '#888', fontSize: 13 }}>{MEDAL[rank] ?? rank + 1}</span>
        <span style={{ color: '#dcdce2', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
      </span>
      <span style={{ color: '#e8c86a', fontWeight: 600, whiteSpace: 'nowrap' }}>{value}</span>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div style={{ color: '#888', fontSize: 14, padding: '8px 4px', lineHeight: 1.4 }}>{children}</div>;
}

function Stat({ icon, label, value, highlight }: { icon: string; label: string; value: string; highlight?: boolean }) {
  return (
    <div
      style={{
        background: highlight ? 'rgba(232,200,106,0.08)' : '#16161a',
        border: `1px solid ${highlight ? 'rgba(232,200,106,0.35)' : '#2a2a30'}`,
        borderRadius: 12,
        padding: '12px 14px',
      }}
    >
      <div style={{ fontSize: 18, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: highlight ? '#e8c86a' : '#fff', lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: 11, color: '#7a7a83', marginTop: 2 }}>{label}</div>
    </div>
  );
}
