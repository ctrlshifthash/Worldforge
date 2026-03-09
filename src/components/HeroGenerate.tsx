'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

const STEPS = [
  'Imagining your world...',
  'Creating characters & locations...',
  'Writing history...',
  'Forging connections...',
  'Building timeline...',
  'Saving to database...',
];

export function HeroGenerate() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  async function handleGenerate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const form = new FormData(e.currentTarget);
    const concept = (form.get('concept') as string) || '';

    let stepIndex = 0;
    setStatus(STEPS[0]);
    const stepTimer = setInterval(() => {
      stepIndex++;
      if (stepIndex < STEPS.length) {
        setStatus(STEPS[stepIndex]);
      }
    }, 1500);

    try {
      const res = await fetch('/api/worlds/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concept, visibility: 'PUBLIC' }),
      });

      clearInterval(stepTimer);

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Generation failed. Try again.');
        setLoading(false);
        setStatus('');
        return;
      }

      const data = await res.json();
      router.push(`/play/${data.world.slug}`);
    } catch {
      clearInterval(stepTimer);
      setError('Something went wrong. Try again.');
      setLoading(false);
      setStatus('');
    }
  }

  return (
    <div className="hero-generate">
      <form onSubmit={handleGenerate} className="hero-generate-form">
        <input
          name="concept"
          type="text"
          className="hero-generate-input"
          placeholder="Describe your world... e.g. a kingdom of sentient machines"
          disabled={loading}
          autoComplete="off"
        />
        <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
          {loading ? 'Generating...' : 'Generate World'}
        </button>
      </form>

      {loading && status && (
        <div className="hero-generate-status">
          <div className="spinner" />
          <p>{status}</p>
        </div>
      )}

      {error && (
        <p className="hero-generate-error">{error}</p>
      )}

      {!loading && (
        <p className="hero-generate-hint">
          Leave empty for a random world. No account needed.
        </p>
      )}
    </div>
  );
}
