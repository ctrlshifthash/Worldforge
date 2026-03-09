'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const STORAGE_KEY = 'demo-world-slug';

export function DemoButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);

    // Check localStorage for existing demo world
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing) {
      // Verify it still exists
      const check = await fetch(`/api/worlds/${existing}`, { method: 'GET' });
      if (check.ok) {
        router.push(`/play/${existing}`);
        return;
      }
      // World was deleted, clear and create new
      localStorage.removeItem(STORAGE_KEY);
    }

    // Clone a fresh demo world
    const res = await fetch('/api/demo', { method: 'POST' });
    if (!res.ok) {
      setLoading(false);
      return;
    }

    const { slug } = await res.json();
    localStorage.setItem(STORAGE_KEY, slug);
    router.push(`/play/${slug}`);
  }

  return (
    <button
      className="btn btn-secondary btn-lg"
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? 'Creating world...' : 'Enter Demo World'}
    </button>
  );
}
