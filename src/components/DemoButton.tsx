'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

const STORAGE_KEY = 'demo-world-slug';

const LOADING_STEPS = [
  'Generating terrain...',
  'Spawning entities...',
  'Building settlements...',
  'Forging history...',
  'Placing NPCs...',
  'Loading assets...',
];

export function DemoButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (loading) {
      intervalRef.current = setInterval(() => {
        setStepIndex((i) => (i + 1) % LOADING_STEPS.length);
      }, 800);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [loading]);

  async function handleClick() {
    setLoading(true);
    setStepIndex(0);

    // Check localStorage for existing demo world
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing) {
      const check = await fetch(`/api/worlds/${existing}`, { method: 'GET' });
      if (check.ok) {
        router.push(`/play/${existing}`);
        return;
      }
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

  if (loading) {
    return (
      <button className="btn btn-secondary btn-lg" disabled style={{ minWidth: 220, position: 'relative', overflow: 'hidden' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="demo-spinner" />
          {LOADING_STEPS[stepIndex]}
        </span>
      </button>
    );
  }

  return (
    <button
      className="btn btn-secondary btn-lg"
      onClick={handleClick}
    >
      Enter Demo World
    </button>
  );
}
