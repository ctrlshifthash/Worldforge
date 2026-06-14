/**
 * Play-to-earn economics — the single source of truth.
 *
 * Everything here is tunable. Money values are placeholders until the real
 * treasury / pool numbers are decided. See docs/play-to-earn.md.
 *
 * Secrets come from env (never commit them):
 *   HELIUS_RPC_URL          - Solana RPC for balance reads + sending payouts
 *   PAYOUT_TOKEN_MINT       - the SPL token players must hold to earn SOL
 *   PAYOUT_TOKEN_SUPPLY     - total token supply (for % ownership math)
 *   TREASURY_SECRET_KEY     - base58 secret key of the payout wallet
 *   NEXT_PUBLIC_PRIVY_APP_ID- Privy app id (client)
 *   PRIVY_APP_SECRET        - Privy app secret (server)
 */

export const PAYOUT = {
  /** Master switch. When false, no SOL ever moves (stub mode for local dev). */
  enabled: process.env.PAYOUTS_ENABLED === 'true',

  token: {
    mint: process.env.PAYOUT_TOKEN_MINT ?? '',
    /** Total supply, used to compute a wallet's % ownership. */
    totalSupply: Number(process.env.PAYOUT_TOKEN_SUPPLY ?? 1_000_000_000),
    /** Minimum % of supply a wallet must hold to earn SOL at all. Below this = coins only. */
    minHoldPercent: 0.001, // 0.001% — a dust floor; tune later
  },

  /** Multiplier caps once a wallet owns this % of supply (anti-whale). */
  multiplierCapPercent: 3.5,

  /**
   * Tier ladder by % of supply held. First matching tier (held >= minPercent,
   * < next tier) wins. multiplier applies to a quest's base SOL reward.
   */
  tiers: [
    { key: 'holder', label: 'Holder', minPercent: 0.001, multiplier: 1.0 },
    { key: 'bronze', label: 'Bronze', minPercent: 0.25, multiplier: 1.25 },
    { key: 'silver', label: 'Silver', minPercent: 0.5, multiplier: 1.5 },
    { key: 'gold', label: 'Gold', minPercent: 1.0, multiplier: 2.0 },
    { key: 'diamond', label: 'Diamond', minPercent: 2.0, multiplier: 3.0 },
  ] as const,

  /**
   * Per-quest rewards. baseSol is multiplied by the holder's tier multiplier.
   * baseCoins is what NON-holders earn instead (in-game currency, no real value).
   * Keys are the canonical questId reported by the game.
   */
  quests: {
    helena_firewood: { baseSol: 0.002, baseCoins: 15, label: 'Gather firewood' },
    marcus_survey: { baseSol: 0.003, baseCoins: 20, label: 'Survey 5 locations' },
    barton_orcs: { baseSol: 0.005, baseCoins: 25, label: 'Clear the orcs' },
    corwin_build: { baseSol: 0.002, baseCoins: 10, label: 'Build 10 structures' },
    marina_necklace: { baseSol: 0.003, baseCoins: 30, label: "Marina's lost necklace" },
  } as Record<string, { baseSol: number; baseCoins: number; label: string }>,

  claim: {
    /** Max claims per user per UTC day. */
    maxPerDay: 4,
    /** Minimum hours between two claims by the same user. */
    cooldownHours: 6,
    /** Reject claims below this (dust) and clamp a single claim to the max. */
    minSol: 0.001,
    // Per-CLAIM ceiling — kept well under the global daily pool (0.5) so no
    // single claim can drain the day's pool; still covers a full max-tier
    // player's total earnings in one claim.
    maxSol: 0.05,
  },

  pool: {
    /** Global ceiling on total SOL paid across ALL users per UTC day. */
    dailyCapSol: Number(process.env.PAYOUT_DAILY_CAP_SOL ?? 0.5),
  },

  antiFarm: {
    /** Account must be at least this old before its first claim (0 = first claim works immediately). */
    minAccountAgeHours: 0,
    /** Player must have completed at least this many quests before claiming. */
    minQuestsBeforeClaim: 1,
    /**
     * Reject if more than this many quest completions arrive within the window
     * (seconds) — implausibly fast = bot. e.g. 5 completions in 60s.
     */
    maxQuestsPerWindow: 5,
    velocityWindowSeconds: 60,
    /** Re-check token holding at claim time, not just at quest completion. */
    recheckHoldingOnClaim: true,
  },
} as const;

export type TierKey = (typeof PAYOUT.tiers)[number]['key'];

export interface TierResult {
  key: TierKey | 'none';
  label: string;
  multiplier: number;
  /** % of supply the wallet holds. */
  ownershipPercent: number;
  /** True if the wallet qualifies to earn SOL (holds >= min floor). */
  qualifies: boolean;
  /** True if ownership is at/over the multiplier cap. */
  capped: boolean;
}

/**
 * Resolve a wallet's tier from its token balance (raw token units, not %).
 * Pure function — no I/O — so it's trivially testable.
 */
export function resolveTier(tokenBalance: number): TierResult {
  const supply = PAYOUT.token.totalSupply || 1;
  const ownershipPercent = (tokenBalance / supply) * 100;

  if (ownershipPercent < PAYOUT.token.minHoldPercent) {
    return {
      key: 'none',
      label: 'Non-holder',
      multiplier: 0,
      ownershipPercent,
      qualifies: false,
      capped: false,
    };
  }

  // Cap ownership for multiplier purposes.
  const effectivePercent = Math.min(ownershipPercent, PAYOUT.multiplierCapPercent);
  const capped = ownershipPercent >= PAYOUT.multiplierCapPercent;

  // Highest tier whose threshold the wallet meets.
  let chosen: { key: TierKey; label: string; minPercent: number; multiplier: number } = PAYOUT.tiers[0];
  for (const tier of PAYOUT.tiers) {
    if (effectivePercent >= tier.minPercent) chosen = tier;
  }

  return {
    key: chosen.key,
    label: chosen.label,
    multiplier: chosen.multiplier,
    ownershipPercent,
    qualifies: true,
    capped,
  };
}
