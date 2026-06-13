'use client';

import { useCallback, useEffect, useState } from 'react';

interface Summary {
  claimableSol: number;
  lifetimeSol: number;
  unclaimedCoins: number;
  questsCompleted: number;
  tier: { label: string; multiplier: number; ownershipPercent: number; qualifies: boolean; capped: boolean } | null;
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
  pool: { dailyCapSol: number; spentTodaySol: number; remainingSol: number };
}

const REASONS: Record<string, string> = {
  no_wallet: 'Link a Solana wallet to claim.',
  account_too_new: 'Your account is too new to claim yet.',
  not_enough_quests: 'Complete a few more quests before claiming.',
  daily_claim_limit: "You've hit today's claim limit.",
  cooldown: 'Still cooling down between claims.',
  no_longer_holding: 'You must hold the token to claim SOL.',
  pool_exhausted: "Today's reward pool is used up. Try again tomorrow.",
  below_min_or_capped: 'Not enough claimable SOL right now.',
  payout_failed: 'The payout failed to send. Your earnings are safe — try again.',
};

export default function EarningsPage() {
  const [data, setData] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch('/api/payouts/summary');
    if (res.ok) setData(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

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

  const canClaim =
    data.claimableSol >= data.claim.minSol &&
    data.claim.remainingToday > 0 &&
    !data.claim.nextClaimAt &&
    data.pool.remainingSol >= data.claim.minSol &&
    !!data.walletAddress &&
    (data.tier?.qualifies ?? false);

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

      <div style={panel}>
        <strong>Tier</strong>
        {data.tier && data.tier.qualifies ? (
          <p style={{ margin: '6px 0 0' }}>
            {data.tier.label} — <b>{data.tier.multiplier}×</b> multiplier ·{' '}
            {data.tier.ownershipPercent.toFixed(3)}% of supply
            {data.tier.capped && <span style={{ color: '#e8c86a' }}> (multiplier capped)</span>}
          </p>
        ) : (
          <p style={{ margin: '6px 0 0', color: '#c98' }}>
            Non-holder — earning in-game coins only. Hold the token to earn SOL.
          </p>
        )}
      </div>

      <div style={panel}>
        <strong>Daily reward pool</strong>
        <p style={{ margin: '6px 0 0', color: '#bbb' }}>
          {data.pool.remainingSol.toFixed(3)} / {data.pool.dailyCapSol} SOL remaining today
        </p>
      </div>

      <div style={panel}>
        <strong>Claim limits</strong>
        <p style={{ margin: '6px 0 0', color: '#bbb' }}>
          {data.claim.remainingToday} of {data.claim.maxPerDay} claims left today · one every{' '}
          {data.claim.cooldownHours}h
          {data.claim.nextClaimAt && (
            <> · next at {new Date(data.claim.nextClaimAt).toLocaleTimeString()}</>
          )}
        </p>
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
        {claiming ? 'Claiming…' : `Claim ${data.claimableSol.toFixed(4)} SOL`}
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
