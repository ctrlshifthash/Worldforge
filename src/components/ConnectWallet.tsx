'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePrivy } from '@privy-io/react-auth';

/**
 * Connect-wallet button for the navbar. Drives Privy login and bridges the
 * resulting access token to our server session (/api/auth/privy) so the rest
 * of the app recognizes the user. Shows the linked Solana address once connected.
 */
export function ConnectWallet() {
  const { ready, authenticated, user, login, logout, getAccessToken } = usePrivy();
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);
  const syncedFor = useRef<string | null>(null);

  // When Privy authenticates, exchange the token for our session cookie (once).
  useEffect(() => {
    if (!ready || !authenticated || !user) return;
    if (syncedFor.current === user.id) return;
    syncedFor.current = user.id;

    (async () => {
      setSyncing(true);
      try {
        const token = await getAccessToken();
        if (token) {
          await fetch('/api/auth/privy', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
          });
          router.refresh();
        }
      } finally {
        setSyncing(false);
      }
    })();
  }, [ready, authenticated, user, getAccessToken, router]);

  const handleLogout = async () => {
    await logout();
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    syncedFor.current = null;
    router.refresh();
  };

  if (!ready) {
    return <button className="btn btn-ghost btn-sm" disabled>…</button>;
  }

  if (!authenticated) {
    return (
      <button className="btn btn-primary btn-sm" onClick={login}>
        Connect Wallet
      </button>
    );
  }

  const solanaWallet = user?.linkedAccounts?.find(
    (a) => a.type === 'wallet' && 'chainType' in a && a.chainType === 'solana',
  ) as { address?: string } | undefined;
  const address = solanaWallet?.address ?? user?.wallet?.address ?? '';
  const short = address ? `${address.slice(0, 4)}…${address.slice(-4)}` : 'Wallet';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Link href="/dashboard/earnings" className="btn btn-ghost btn-sm" title="View earnings">
        💰 Earnings
      </Link>
      <button className="btn btn-ghost btn-sm" onClick={handleLogout} title="Disconnect" disabled={syncing}>
        {syncing ? 'Linking…' : short}
      </button>
    </div>
  );
}
