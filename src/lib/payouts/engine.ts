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
import { getTokenBalance, sendSol, getSignatureSucceeded } from './solana';

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

export interface NextTierInfo {
  key: string;
  label: string;
  multiplier: number;
  atTokens: number; // token balance needed to reach this tier
  tokensNeeded: number; // how many more tokens from the current balance
}

/** Next tier above the wallet's current holdings, or null if already at the top. */
function computeNextTier(balance: number): NextTierInfo | null {
  const supply = PAYOUT.token.totalSupply || 1;
  const pct = (balance / supply) * 100;
  for (const t of PAYOUT.tiers) {
    if (t.minPercent > pct) {
      const atTokens = Math.ceil((t.minPercent / 100) * supply);
      return {
        key: t.key,
        label: t.label,
        multiplier: t.multiplier,
        atTokens,
        tokensNeeded: Math.max(0, atTokens - balance),
      };
    }
  }
  return null;
}

export interface ClaimSummary {
  id: string;
  amountSol: number;
  status: string; // PENDING | SENT | FAILED
  txSignature: string | null;
  createdAt: string; // ISO
}

export interface EarningsSummary {
  claimableSol: number;
  lifetimeSol: number;
  unclaimedCoins: number;
  questsCompleted: number;
  tier: TierResult | null;
  tokenBalance: number; // tokens the connected wallet holds
  tokenSupply: number;
  nextTier: NextTierInfo | null;
  walletAddress: string | null;
  recentClaims: ClaimSummary[];
  // NOTE: the global daily pool is intentionally NOT exposed here — it is
  // enforced server-side at claim time but isn't shown to players.
  claim: {
    maxPerDay: number;
    usedToday: number;
    remainingToday: number;
    cooldownHours: number;
    nextClaimAt: string | null; // ISO, null if claimable now
    minSol: number;
    maxSol: number;
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

  // Current holdings + tier (live on-chain read once a mint is configured).
  let tokenBalance = 0;
  let tier: TierResult | null = null;
  let nextTier: NextTierInfo | null = null;
  if (user?.walletAddress) {
    tokenBalance = await getTokenBalance(user.walletAddress);
    tier = resolveTier(tokenBalance);
    nextTier = computeNextTier(tokenBalance);
  }

  // Recent claim history (for transparency on the dashboard).
  const claimRows = await prisma.claim.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: { id: true, amountSol: true, status: true, txSignature: true, createdAt: true },
  });
  const recentClaims = claimRows.map((c) => ({
    id: c.id,
    amountSol: c.amountSol,
    status: c.status,
    txSignature: c.txSignature,
    createdAt: c.createdAt.toISOString(),
  }));

  return {
    claimableSol,
    lifetimeSol,
    unclaimedCoins,
    questsCompleted,
    tier,
    tokenBalance,
    tokenSupply: PAYOUT.token.totalSupply,
    nextTier,
    walletAddress: user?.walletAddress ?? null,
    recentClaims,
    claim: {
      maxPerDay: PAYOUT.claim.maxPerDay,
      usedToday,
      remainingToday: Math.max(0, PAYOUT.claim.maxPerDay - usedToday),
      cooldownHours: PAYOUT.claim.cooldownHours,
      nextClaimAt,
      minSol: PAYOUT.claim.minSol,
      maxSol: PAYOUT.claim.maxSol,
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

  // Reserve the payout atomically. Inside ONE transaction we: read the day's
  // pool, select EARNED SOL completions within the per-claim ceiling, mark them
  // CLAIMED with a STATUS GUARD (so a concurrent claim can't grab the same
  // rows), compute the real amount from the rows this claim actually took, and
  // enforce the daily cap on the post-increment total (so concurrent claims
  // can't overspend it). Any throw rolls the whole thing back.
  let claimId: string;
  let amount: number;
  try {
    const today = utcDay();
    const result = await prisma.$transaction(async (tx) => {
      const day0 = await tx.payoutDay.upsert({
        where: { date: today },
        create: { date: today, totalSol: 0, claimCount: 0 },
        update: {},
      });
      const ceiling = Math.min(PAYOUT.claim.maxSol, PAYOUT.pool.dailyCapSol - day0.totalSol);
      if (ceiling < PAYOUT.claim.minSol) throw new Error('pool_exhausted');

      const earned = await tx.questCompletion.findMany({
        where: { userId, status: 'EARNED', rewardKind: 'SOL', earnedSol: { gt: 0 } },
        orderBy: { completedAt: 'asc' },
      });
      const selectedIds: string[] = [];
      let sum = 0;
      for (const c of earned) {
        if (sum + c.earnedSol > ceiling) continue; // can't split a completion
        selectedIds.push(c.id);
        sum += c.earnedSol;
      }
      if (selectedIds.length === 0) throw new Error('below_min_or_capped');

      const claim = await tx.claim.create({
        data: { userId, walletAddress: user.walletAddress as string, amountSol: 0, status: 'PENDING' },
      });
      // Status guard: only rows still EARNED get taken, so two concurrent claims
      // can never pay out the same earnings.
      await tx.questCompletion.updateMany({
        where: { id: { in: selectedIds }, status: 'EARNED' },
        data: { status: 'CLAIMED', claimId: claim.id },
      });
      // The true amount is the sum of rows THIS claim actually took.
      const taken = await tx.questCompletion.findMany({
        where: { claimId: claim.id },
        select: { earnedSol: true },
      });
      const realAmount = Math.round(taken.reduce((s, r) => s + r.earnedSol, 0) * 1e9) / 1e9;
      if (realAmount < PAYOUT.claim.minSol) throw new Error('below_min_or_capped');

      await tx.claim.update({ where: { id: claim.id }, data: { amountSol: realAmount } });
      const dayAfter = await tx.payoutDay.update({
        where: { date: today },
        data: { totalSol: { increment: realAmount }, claimCount: { increment: 1 } },
      });
      if (dayAfter.totalSol > PAYOUT.pool.dailyCapSol + 1e-9) throw new Error('pool_exhausted');

      return { claimId: claim.id, amount: realAmount };
    });
    claimId = result.claimId;
    amount = result.amount;
  } catch (err) {
    const msg = err instanceof Error ? err.message : '';
    const reason = msg === 'pool_exhausted' || msg === 'below_min_or_capped' ? msg : 'reserve_failed';
    return { ok: false, reason };
  }

  // Send the SOL.
  const send = await sendSol(user.walletAddress, amount);

  // Success — or it failed to confirm but actually landed on-chain (the
  // "did it land?" case). Verifying the signature avoids a double-pay on retry.
  if (send.ok || (send.signature && (await getSignatureSucceeded(send.signature)))) {
    await prisma.claim.update({
      where: { id: claimId },
      data: { status: 'SENT', txSignature: send.signature, sentAt: new Date() },
    });
    return { ok: true, amountSol: amount, txSignature: send.signature };
  }

  // Truly failed — roll everything back so no earnings or pool are burned.
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
