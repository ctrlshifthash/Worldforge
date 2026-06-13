'use client';

import { useCallback, useEffect, useState } from 'react';

interface NextTier {
  key: string;
  label: string;
  multiplier: number;
  atTokens: number;
  tokensNeeded: number;
}

interface Summary {
  claimableSol: number;
  lifetimeSol: number;
  unclaimedCoins: number;
  questsCompleted: number;
  tier: { label: string; multiplier: number; ownershipPercent: number; qualifies: boolean; capped: boolean } | null;
  tokenBalance: number;
  tokenSupply: number;
  nextTier: NextTier | null;
  walletAddress: string | null;
  claim: {
    maxPerDay: number;
    usedToday: number;
    remainingToday: number;
    cooldownHours: number;
    nextClaimAt: string | null;
    minSol: number;
    maxSol: number;
  };
}

const REASONS: Record<string, string> = {
  no_wallet: 'Link a Solana wallet to claim.',
  account_too_new: 'Your account is too new to claim yet.',
  not_enough_quests: 'Complete a few more quests before claiming.',
  daily_claim_limit: "You've hit today's claim limit.",
  cooldown: 'Still cooling down between claims.',
  no_longer_holding: 'You must hold the token to claim SOL.',
  pool_exhausted: 'Payouts are paused for today. Try again tomorrow.',
  below_min_or_capped: 'Not enough claimable SOL right now.',
  payout_failed: 'The payout failed to send. Your earnings are safe — try again.',
};

function fmtTokens(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(2).replace(/\.?0+$/, '')}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(2).replace(/\.?0+$/, '')}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1).replace(/\.0$/, '')}K`;
  return Math.round(n).toLocaleString();
}

function fmtDuration(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h}h ${String(m).padStart(2, '0')}m ${String(sec).padStart(2, '0')}s`;
}

export default function EarningsPage() {
  const [data, setData] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const load = useCallback(async () => {
    const res = await fetch('/api/payouts/summary');
    if (res.ok) setData(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Tick every second so the cooldown counts down live.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Refresh once the cooldown actually ends.
  useEffect(() => {
    if (!data?.claim.nextClaimAt) return;
    const ms = new Date(data.claim.nextClaimAt).getTime() - Date.now();
    if (ms <= 0) return;
    const t = setTimeout(() => load(), ms + 500);
    return () => clearTimeout(t);
  }, [data?.claim.nextClaimAt, load]);

  const claim = useCallback(async () => {
    setClaiming(true);
    setMsg(null);
    const res = await fetch('/api/payouts/claim', { method: 'POST' });
    const body = await res.json().catch(() => ({}));
    if (res.ok && body.ok) {
      setMsg(`Sent ${body.amountSol} SOL${body.txSignature ? ` (tx ${body.txSignature.slice(0, 10)}…)` : ''}`);
    } else {
      setMsg(REASONS[body.reason] ?? 'Could not claim right now.');
    }
    setClaiming(false);
    load();
  }, [load]);

  if (loading) return <p style={{ color: '#aaa' }}>Loading earnings…</p>;
  if (!data) return <p style={{ color: '#aaa' }}>Sign in to view earnings.</p>;

  const nextMs = data.claim.nextClaimAt ? new Date(data.claim.nextClaimAt).getTime() : 0;
  const remainingMs = Math.max(0, nextMs - now);
  const onCooldown = remainingMs > 0;
  const ownershipPct = data.tokenSupply ? (data.tokenBalance / data.tokenSupply) * 100 : 0;

  const canClaim =
    !!data.walletAddress &&
    (data.tier?.qualifies ?? false) &&
    data.claimableSol >= data.claim.minSol &&
    data.claim.remainingToday > 0 &&
    !onCooldown;

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', color: '#e8e8e8' }}>
      <h1 style={{ fontSize: 28, marginBottom: 4 }}>Earnings</h1>
      <p style={{ color: '#999', marginBottom: 24 }}>
        Hold the token to earn SOL for quests. Non-holders earn in-game coins only.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <Card label="Claimable" value={`${data.claimableSol.toFixed(4)} SOL`} accent="#e8c86a" />
        <Card label="Lifetime earned" value={`${data.lifetimeSol.toFixed(4)} SOL`} />
        <Card label="In-game coins (unclaimed)" value={`${data.unclaimedCoins}`} />
        <Card label="Quests completed" value={`${data.questsCompleted}`} />
      </div>

      {/* Holdings & tier */}
      <div style={panel}>
        <strong>Your holdings &amp; tier</strong>
        {!data.walletAddress ? (
          <p style={{ margin: '8px 0 0', color: '#c98' }}>
            Link a Solana wallet (top-right) to see your tier and start earning SOL.
          </p>
        ) : (
          <>
            <p style={{ margin: '8px 0 4px' }}>
              You hold <b style={{ color: '#e8c86a' }}>{fmtTokens(data.tokenBalance)}</b> tokens
              {' '}<span style={{ color: '#888' }}>({ownershipPct.toFixed(3)}% of supply)</span>
            </p>
            {data.tier?.qualifies ? (
              <p style={{ margin: '0 0 4px' }}>
                Tier: <b>{data.tier.label}</b> — <b>{data.tier.multiplier}×</b> rewards
                {data.tier.capped && <span style={{ color: '#e8c86a' }}> (multiplier maxed)</span>}
              </p>
            ) : (
              <p style={{ margin: '0 0 4px', color: '#c98' }}>
                Tier: Non-holder — quests pay in-game coins, not SOL.
              </p>
            )}
            {data.nextTier ? (
              <p style={{ margin: 0, color: '#bbb', fontSize: 14 }}>
                Hold <b>{fmtTokens(data.nextTier.tokensNeeded)}</b> more
                {' '}({fmtTokens(data.nextTier.atTokens)} total) to reach{' '}
                <b>{data.nextTier.label}</b> at {data.nextTier.multiplier}×.
              </p>
            ) : (
              <p style={{ margin: 0, color: '#7ad77a', fontSize: 14 }}>
                You&apos;re at the top tier — maximum multiplier.
              </p>
            )}
          </>
        )}
      </div>

      {/* Claims */}
      <div style={panel}>
        <strong>Claims</strong>
        <p style={{ margin: '8px 0 4px', color: '#bbb' }}>
          {data.claim.remainingToday} of {data.claim.maxPerDay} claims left today · one every{' '}
          {data.claim.cooldownHours} hours
        </p>
        {onCooldown ? (
          <p style={{ margin: 0, color: '#e8c86a', fontVariantNumeric: 'tabular-nums' }}>
            Next claim in <b>{fmtDuration(remainingMs)}</b>
          </p>
        ) : data.claim.remainingToday > 0 ? (
          <p style={{ margin: 0, color: '#7ad77a' }}>You can claim now.</p>
        ) : (
          <p style={{ margin: 0, color: '#c98' }}>Daily limit reached — resets at 00:00 UTC.</p>
        )}
      </div>

      <button
        onClick={claim}
        disabled={!canClaim || claiming}
        style={{
          marginTop: 12,
          width: '100%',
          padding: '14px 0',
          fontSize: 16,
          fontWeight: 600,
          borderRadius: 10,
          border: 'none',
          cursor: canClaim && !claiming ? 'pointer' : 'not-allowed',
          background: canClaim && !claiming ? '#e8c86a' : '#444',
          color: canClaim && !claiming ? '#1a1a1a' : '#888',
        }}
      >
        {claiming
          ? 'Claiming…'
          : onCooldown
            ? `Claim again in ${fmtDuration(remainingMs)}`
            : `Claim ${data.claimableSol.toFixed(4)} SOL`}
      </button>

      {msg && <p style={{ marginTop: 12, color: '#bbb' }}>{msg}</p>}
    </div>
  );
}

const panel: React.CSSProperties = {
  background: '#1c1c1f',
  border: '1px solid #2c2c30',
  borderRadius: 10,
  padding: 16,
  marginBottom: 12,
};

function Card({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div style={panel}>
      <div style={{ color: '#999', fontSize: 13 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: accent ?? '#e8e8e8', marginTop: 4 }}>{value}</div>
    </div>
  );
}
