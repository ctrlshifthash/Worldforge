'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

export function ClaimWorldBanner({ slug, isLoggedIn }: { slug: string; isLoggedIn: boolean }) {
  const router = useRouter();
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);

  async function handleClaim() {
    setClaiming(true);
    const res = await fetch(`/api/worlds/${slug}/claim`, { method: 'POST' });
    if (res.ok) {
      setClaimed(true);
      router.refresh();
    }
    setClaiming(false);
  }

  if (claimed) {
    return (
      <div className="claim-banner claimed">
        This world is now yours. You can edit entities, build structures, and use AI storytelling.
      </div>
    );
  }

  if (isLoggedIn) {
    return (
      <div className="claim-banner">
        <div>
          <strong>This world has no owner.</strong> Claim it to edit, build, and grow it.
        </div>
        <button className="btn btn-primary btn-sm" onClick={handleClaim} disabled={claiming}>
          {claiming ? 'Claiming...' : 'Claim World'}
        </button>
      </div>
    );
  }

  return (
    <div className="claim-banner">
      <div>
        <strong>This world has no owner.</strong> Sign up to claim it and unlock editing, building, and AI storytelling.
      </div>
      <Link href="/register" className="btn btn-primary btn-sm">Sign Up</Link>
    </div>
  );
}
