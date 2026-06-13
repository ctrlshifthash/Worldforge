/**
 * Play-to-earn engine: record quest earnings, summarize, and process claims.
 *
 * This is the trusted, server-authoritative layer. The browser game *reports*
 * completions; this module decides what (if anything) they're worth, enforces
 * the once-per-quest rule, rate limits, the global daily pool cap, and the
 * anti-farm gates. See docs/play-to-earn.md.
 */
import { prisma } from '@/lib/prisma';
import { PAYOUT, resolveTier, type TierResult } from './config';
import { getTokenBalance, sendSol } from './solana';

/** UTC day key, "YYYY-MM-DD". */
function utcDay(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

export interface RecordResult {
  ok: boolean;
  reason?: string;
  rewardKind?: 'SOL' | 'COIN';
  earnedSol?: number;
  earnedCoins?: number;
  tier?: TierResult;
  alreadyCompleted?: boolean;
}

/**
 * Record a quest completion. Idempotent per (user, world, quest): a quest pays
 * exactly once per account, ever. Resolves the player's tier from live token
 * holdings and writes the earning snapshot.
 */
export async function recordQuestCompletion(params: {
  userId: string;
  worldId: string;
  questId: string;
}): Promise<RecordResult> {
  const { userId, worldId, questId } = params;

  const quest = PAYOUT.quests[questId];
  if (!quest) return { ok: false, reason: 'unknown_quest' };

  // Once-only: if already recorded, no-op (prevents grinding the same quest).
  const existing = await prisma.questCompletion.findUnique({
    where: { userId_worldId_questId: { userId, worldId, questId } },
  });
  if (existing) {
    return {
      ok: true,
      alreadyCompleted: true,
      rewardKind: existing.rewardKind as 'SOL' | 'COIN',
      earnedSol: existing.earnedSol,
      earnedCoins: existing.earnedCoins,
    };
  }

  // Anti-farm velocity gate: too many completions in a short window = bot.
  const windowStart = new Date(Date.now() - PAYOUT.antiFarm.velocityWindowSeconds * 1000);
  const recent = await prisma.questCompletion.count({
    where: { userId, completedAt: { gte: windowStart } },
  });
  if (recent >= PAYOUT.antiFarm.maxQuestsPerWindow) {
    return { ok: false, reason: 'rate_limited_velocity' };
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { ok: false, reason: 'no_user' };

  // Tier from live token balance. No wallet or no holdings => coins only.
  let tier: TierResult = resolveTier(0);
  if (user.walletAddress) {
    const balance = await getTokenBalance(user.walletAddress);
    tier = resolveTier(balance);
  }

  const rewardKind: 'SOL' | 'COIN' = tier.qualifies ? 'SOL' : 'COIN';
  const earnedSol = tier.qualifies ? quest.baseSol * tier.multiplier : 0;
  const earnedCoins = tier.qualifies ? 0 : quest.baseCoins;

  await prisma.questCompletion.create({
    data: {
      userId,
      worldId,
      questId,
      rewardKind,
      baseSol: quest.baseSol,
      multiplier: tier.multiplier,
      earnedSol,
      earnedCoins,
      status: 'EARNED',
    },
  });

  return { ok: true, rewardKind, earnedSol, earnedCoins, tier };
}

export interface EarningsSummary {
  claimableSol: number;
  lifetimeSol: number;
  unclaimedCoins: number;
  questsCompleted: number;
  tier: TierResult | null;
  walletAddress: string | null;
  claim: {
    maxPerDay: number;
    usedToday: number;
    remainingToday: number;
    cooldownHours: number;
    nextClaimAt: string | null; // ISO, null if claimable now
    minSol: number;
    maxSol: number;
  };
  pool: {
    dailyCapSol: number;
    spentTodaySol: number;
    remainingSol: number;
  };
}

export async function getEarningsSummary(userId: string): Promise<EarningsSummary> {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  const earned = await prisma.questCompletion.findMany({
    where: { userId, status: 'EARNED' },
    select: { earnedSol: true, earnedCoins: true },
  });
  const claimableSol = earned.reduce((s, c) => s + c.earnedSol, 0);
  const unclaimedCoins = earned.reduce((s, c) => s + c.earnedCoins, 0);

  const claimed = await prisma.questCompletion.aggregate({
    where: { userId, status: 'CLAIMED' },
    _sum: { earnedSol: true },
  });
  const lifetimeSol = (claimed._sum.earnedSol ?? 0) + claimableSol;

  const questsCompleted = await prisma.questCompletion.count({ where: { userId } });

  // Today's non-failed claims, for rate limiting + cooldown.
  const dayStart = new Date(`${utcDay()}T00:00:00.000Z`);
  const todaysClaims = await prisma.claim.findMany({
    where: { userId, createdAt: { gte: dayStart }, status: { not: 'FAILED' } },
    orderBy: { createdAt: 'desc' },
  });
  const usedToday = todaysClaims.length;
  const lastClaim = todaysClaims[0];
  let nextClaimAt: string | null = null;
  if (lastClaim) {
    const next = new Date(lastClaim.createdAt.getTime() + PAYOUT.claim.cooldownHours * 3600_000);
    if (next.getTime() > Date.now()) nextClaimAt = next.toISOString();
  }

  const payoutDay = await prisma.payoutDay.findUnique({ where: { date: utcDay() } });
  const spentTodaySol = payoutDay?.totalSol ?? 0;

  // Current tier for display (live read; falls back to non-holder).
  let tier: TierResult | null = null;
  if (user?.walletAddress) {
    tier = resolveTier(await getTokenBalance(user.walletAddress));
  }

  return {
    claimableSol,
    lifetimeSol,
    unclaimedCoins,
    questsCompleted,
    tier,
    walletAddress: user?.walletAddress ?? null,
    claim: {
      maxPerDay: PAYOUT.claim.maxPerDay,
      usedToday,
      remainingToday: Math.max(0, PAYOUT.claim.maxPerDay - usedToday),
      cooldownHours: PAYOUT.claim.cooldownHours,
      nextClaimAt,
      minSol: PAYOUT.claim.minSol,
      maxSol: PAYOUT.claim.maxSol,
    },
    pool: {
      dailyCapSol: PAYOUT.pool.dailyCapSol,
      spentTodaySol,
      remainingSol: Math.max(0, PAYOUT.pool.dailyCapSol - spentTodaySol),
    },
  };
}

export interface ClaimResult {
  ok: boolean;
  reason?: string;
  amountSol?: number;
  txSignature?: string;
  nextClaimAt?: string;
}

/**
 * Process a withdrawal. Enforces (in order): wallet present, account age,
 * minimum quests, daily claim count, cooldown, token holding re-check, dust
 * floor + per-claim ceiling, and the global daily pool cap (atomically).
 * On send failure everything is rolled back so no earnings or pool are burned.
 */
export async function processClaim(userId: string): Promise<ClaimResult> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { ok: false, reason: 'no_user' };
  if (!user.walletAddress) return { ok: false, reason: 'no_wallet' };

  // Account age gate.
  const ageHours = (Date.now() - user.createdAt.getTime()) / 3600_000;
  if (ageHours < PAYOUT.antiFarm.minAccountAgeHours) {
    return { ok: false, reason: 'account_too_new' };
  }

  // Minimum quests completed gate.
  const questsCompleted = await prisma.questCompletion.count({ where: { userId } });
  if (questsCompleted < PAYOUT.antiFarm.minQuestsBeforeClaim) {
    return { ok: false, reason: 'not_enough_quests' };
  }

  // Daily claim count + cooldown.
  const dayStart = new Date(`${utcDay()}T00:00:00.000Z`);
  const todaysClaims = await prisma.claim.findMany({
    where: { userId, createdAt: { gte: dayStart }, status: { not: 'FAILED' } },
    orderBy: { createdAt: 'desc' },
  });
  if (todaysClaims.length >= PAYOUT.claim.maxPerDay) {
    return { ok: false, reason: 'daily_claim_limit' };
  }
  if (todaysClaims[0]) {
    const next = new Date(todaysClaims[0].createdAt.getTime() + PAYOUT.claim.cooldownHours * 3600_000);
    if (next.getTime() > Date.now()) {
      return { ok: false, reason: 'cooldown', nextClaimAt: next.toISOString() };
    }
  }

  // Re-check token holding at claim time — must still qualify to receive SOL.
  if (PAYOUT.antiFarm.recheckHoldingOnClaim) {
    const tier = resolveTier(await getTokenBalance(user.walletAddress));
    if (!tier.qualifies) return { ok: false, reason: 'no_longer_holding' };
  }

  // Select EARNED SOL completions, oldest first, fitting the per-claim ceiling
  // (min of per-claim max and remaining pool for the day).
  const payoutDay = await prisma.payoutDay.findUnique({ where: { date: utcDay() } });
  const poolRemaining = PAYOUT.pool.dailyCapSol - (payoutDay?.totalSol ?? 0);
  const ceiling = Math.min(PAYOUT.claim.maxSol, poolRemaining);
  if (ceiling < PAYOUT.claim.minSol) return { ok: false, reason: 'pool_exhausted' };

  const earned = await prisma.questCompletion.findMany({
    where: { userId, status: 'EARNED', rewardKind: 'SOL', earnedSol: { gt: 0 } },
    orderBy: { completedAt: 'asc' },
  });

  const selected: typeof earned = [];
  let amount = 0;
  for (const c of earned) {
    if (amount + c.earnedSol > ceiling) continue; // can't split a completion
    selected.push(c);
    amount += c.earnedSol;
  }
  // Round to lamport precision to avoid float drift.
  amount = Math.round(amount * 1e9) / 1e9;

  if (amount < PAYOUT.claim.minSol || selected.length === 0) {
    return { ok: false, reason: 'below_min_or_capped' };
  }

  // Reserve the payout atomically: create Claim, mark completions CLAIMED, and
  // increment the day's pool — re-checking the cap inside the transaction so
  // concurrent claims can't overspend.
  let claimId: string;
  try {
    const today = utcDay();
    const result = await prisma.$transaction(async (tx) => {
      const day = await tx.payoutDay.upsert({
        where: { date: today },
        create: { date: today, totalSol: 0, claimCount: 0 },
        update: {},
      });
      if (day.totalSol + amount > PAYOUT.pool.dailyCapSol) {
        throw new Error('pool_exhausted');
      }
      const claim = await tx.claim.create({
        data: { userId, walletAddress: user.walletAddress as string, amountSol: amount, status: 'PENDING' },
      });
      await tx.questCompletion.updateMany({
        where: { id: { in: selected.map((c) => c.id) } },
        data: { status: 'CLAIMED', claimId: claim.id },
      });
      await tx.payoutDay.update({
        where: { date: today },
        data: { totalSol: { increment: amount }, claimCount: { increment: 1 } },
      });
      return claim.id;
    });
    claimId = result;
  } catch (err) {
    const reason = err instanceof Error && err.message === 'pool_exhausted' ? 'pool_exhausted' : 'reserve_failed';
    return { ok: false, reason };
  }

  // Send the SOL. On failure, roll everything back so nothing is burned.
  const send = await sendSol(user.walletAddress, amount);
  if (!send.ok) {
    await prisma.$transaction(async (tx) => {
      await tx.questCompletion.updateMany({
        where: { claimId },
        data: { status: 'EARNED', claimId: null },
      });
      await tx.payoutDay.update({
        where: { date: utcDay() },
        data: { totalSol: { decrement: amount }, claimCount: { decrement: 1 } },
      });
      await tx.claim.update({
        where: { id: claimId },
        data: { status: 'FAILED', error: send.error ?? 'send_failed' },
      });
    });
    return { ok: false, reason: 'payout_failed' };
  }

  await prisma.claim.update({
    where: { id: claimId },
    data: { status: 'SENT', txSignature: send.signature, sentAt: new Date() },
  });

  return { ok: true, amountSol: amount, txSignature: send.signature };
}
