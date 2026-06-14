import { notFound } from 'next/navigation';
import { getWorldBySlug, getEntities, getEras, ensureWorldQuests } from '@/lib/queries';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { WorldExplore } from '@/app/worlds/[slug]/explore/WorldExplore';

export default async function PlayPage({
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

  const session = await getSession();
  const isOwner = session && world.ownerId ? world.ownerId === session.sub : false;

  // Private worlds are only accessible by the owner (demo worlds with null owner are always accessible)
  if (world.visibility === 'PRIVATE' && world.ownerId !== null && !isOwner) {
    notFound();
  }

  // Count a visit (best-effort, non-blocking) — powers the leaderboard.
  prisma.world.update({ where: { id: world.id }, data: { visits: { increment: 1 } } }).catch(() => {});

  const [allEntities, eras, quests] = await Promise.all([
    getEntities(world.id),
    getEras(world.id),
    ensureWorldQuests(world.id),
  ]);

  // Filter entities by era lifecycle if an era is selected
  let entities = allEntities;
  const selectedEra = eraSlug ? eras.find((e) => e.slug === eraSlug) : null;

  if (selectedEra) {
    entities = allEntities.filter((e) => {
      if (e.introducedEraId) {
        const introEra = eras.find((er) => er.id === e.introducedEraId);
        if (introEra && introEra.sortOrder > selectedEra.sortOrder) return false;
      }
      if (e.retiredEraId) {
        const retiredEra = eras.find((er) => er.id === e.retiredEraId);
        if (retiredEra && retiredEra.sortOrder <= selectedEra.sortOrder) return false;
      }
      return true;
    });
  }

  const mappedEntities = entities.map((e) => ({
    id: e.id,
    slug: e.slug,
    title: e.title,
    type: e.type,
    summary: e.summary,
    accent: e.accent,
    mapX: e.mapX,
    mapY: e.mapY,
    tags: (() => {
      try { return JSON.parse(e.tagsJson) as string[]; } catch { return []; }
    })(),
    facts: (() => {
      try { return JSON.parse(e.factsJson) as { label: string; value: string }[]; } catch { return []; }
    })(),
  }));

  // Determine player name for multiplayer
  let playerName = 'Adventurer';
  if (session) {
    // Try to get username from session
    const user = await prisma.user.findUnique({ where: { id: session.sub }, select: { username: true, name: true } });
    if (user) playerName = user.username || user.name || 'Adventurer';
  }

  return (
    <>
      <WorldExplore
        entities={mappedEntities}
        slug={slug}
        worldTitle={world.title}
        eraLabel={selectedEra?.title}
        fullscreen
        isOwner={isOwner}
        worldId={world.id}
        playerName={playerName}
        quests={quests.map((q) => ({
          id: q.id,
          title: q.title,
          objective: q.objective,
          narrative: q.narrative,
          kind: q.kind,
          targetName: q.targetName,
          rewardCoins: q.rewardCoins,
        }))}
      />
      {/* In-game shortcut to claim earned SOL (opens the Earnings dashboard) */}
      <a
        href="/dashboard/earnings"
        target="_blank"
        rel="noopener noreferrer"
        title="Claim the SOL you've earned from quests"
        style={{
          position: 'fixed',
          top: 12,
          right: 12,
          zIndex: 40,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '8px 14px',
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 700,
          color: '#1a1a1a',
          background: 'linear-gradient(180deg, #ffd700, #e6b800)',
          border: '1px solid #b8901f',
          boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
          textDecoration: 'none',
        }}
      >
        💰 Claim SOL
      </a>
    </>
  );
}
