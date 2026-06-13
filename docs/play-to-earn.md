# Worldforge Play-to-Earn — Architecture & Economics

Status: **in progress**. Numbers below are **placeholder defaults** living in
`src/lib/payouts/config.ts`. Tune them there — nothing in the code hard-codes economics.

## What we're building

Players complete quests. **Token holders** earn real **SOL**; **non-holders** earn
in-game coins only. Earnings accrue server-side and are paid out via a **Claim/Withdraw**
button to the player's Privy-linked Solana wallet. Payouts are bounded by per-user rate
limits and a global daily treasury pool.

## The hard truth about trust (read this)

Today, quests complete **entirely in the browser** and rewards live only in `localStorage`.
A browser game is client-authoritative: we cannot *cryptographically* prove a quest was
really completed — a determined cheater can forge the "I finished quest X" message.

We do **not** try to make cheating impossible (that needs full server-side game
simulation — out of scope). Instead we **bound the blast radius** so cheating isn't
profitable:

1. **Each quest pays exactly once per account, ever** (DB unique constraint). No grinding
   the same quest for money.
2. **Earning requires holding the token** — capital at risk. Sybil wallets each need their
   own funded token balance.
3. **Low base SOL per quest**, hard **daily global pool cap**, and **4 claims/day, 6h apart**
   per user. Worst-case daily loss is capped no matter what.
4. **Anti-farm gates** (account age, playtime, quest-completion velocity, wallet re-check at
   claim time) reject the cheap automated cases.

This is the standard, honest model for play-to-earn on a web client. Anything stronger means
moving gameplay onto the server.

## Identity & auth

- **Privy replaces email/password** as the sole login. Privy DID (`privyId`) becomes the
  canonical user identity; the linked Solana **wallet address** is what we pay and what we
  check token holdings against.
- One wallet ↔ one account (`walletAddress @unique`). One Privy account ↔ one user.

## Tiers & multiplier (placeholder — tune in config)

Multiplier scales with **% of total token supply held per wallet**, checked live via Helius
at quest-completion and re-checked at claim time. The multiplier **caps at 3.5% ownership** —
holding more than 3.5% gives no extra multiplier (anti-whale).

| Tier      | Supply held        | Multiplier |
|-----------|--------------------|------------|
| Non-holder| below min floor    | coins only, 0 SOL |
| Holder    | floor – 0.25%      | 1.0×       |
| Bronze    | 0.25% – 0.5%       | 1.25×      |
| Silver    | 0.5% – 1%          | 1.5×       |
| Gold      | 1% – 2%            | 2.0×       |
| Diamond   | 2% – 3.5%          | 3.0×       |
| (cap)     | > 3.5%             | 3.0× (no further increase) |

`earnedSol = quest.baseSol × tierMultiplier`. Non-holders get `quest.baseCoins` instead.

> Known trade-off: the 3.5% cap can incentivize a large holder to split across wallets to
> keep full multiplier on each. Splitting still costs them: a separate game account, separate
> playtime, and they're subject to the same per-account quest-once rule and daily caps. We
> accept this; document it so it's a decision, not a surprise.

## Claim rules

- **4 claims per user per UTC day**, each at least **6 hours** after the previous.
- **Per-claim min/max** SOL (dust floor + a single-claim ceiling).
- **Global daily pool cap**: once total SOL paid across all users hits the cap for the UTC
  day, further claims are rejected until the next day. Enforced atomically in a DB
  transaction so concurrent claims can't overspend.
- **Wallet re-checked at claim time**: must still hold the token, else SOL claim is blocked
  (earnings stay as pending but won't pay until holding is restored — tunable).

## Anti-farming policy (defaults in config)

- Quest pays once per account (unique `[userId, worldId, questId]`).
- Minimum **account age** before first claim (e.g. 24h).
- Minimum **playtime / quests completed** before first claim.
- **Quest-completion velocity** check — reject batches completed implausibly fast (bot signal).
- Per-user daily claim count + cooldown (4 / 6h).
- Global daily pool cap.
- Wallet uniqueness; wallet must hold token at claim time.
- All claims and quest completions are logged for audit / clawback.

## Data model (Prisma additions)

- `User`: `+ privyId?`, `+ walletAddress?`, `passwordHash` → optional (Privy migration).
- `QuestCompletion`: userId, worldId, questId, baseSol, baseCoins, multiplier, rewardKind,
  earnedSol, earnedCoins, status (EARNED|CLAIMED|VOID), completedAt. Unique [userId,worldId,questId].
- `Claim`: userId, walletAddress, amountSol, status (PENDING|SENT|FAILED), txSignature,
  createdAt, sentAt, error.
- `PayoutDay`: date (UTC, unique), totalSol, claimCount — the global-cap ledger.

## API surface

- `POST /api/quests/complete` — game reports a completion; server validates (once-only,
  anti-farm), computes tier+reward, writes `QuestCompletion` as EARNED.
- `GET  /api/payouts/summary` — dashboard data: claimable SOL, lifetime earned, tier &
  multiplier, today's claim count + next-claim time, pool remaining today.
- `POST /api/payouts/claim` — validates rate limit + pool + wallet holding, marks
  completions CLAIMED, sends SOL from treasury, records `Claim`.

## Secrets / config needed from you (deferred)

- Privy **App ID** (public) + **App Secret** (server).
- Helius **RPC URL** (token-balance reads + sending transactions).
- Token **mint address** (the Solscan link) + total supply.
- Treasury wallet **private key** (signs payouts) + funded SOL **pool size / daily cap**.
- Final economics: base SOL per quest, tier breakpoints, claim min/max, account-age gate.

Until these arrive, Solana reads/transfers run in a guarded **stub mode** (no real funds move)
so the full flow is testable locally.
