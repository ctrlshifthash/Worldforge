'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState } from 'react';

export function GenerateWorld() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ entities: number; events: number; relations: number } | null>(null);

  async function handleGenerate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    const form = new FormData(e.currentTarget);
    const prompt = form.get('prompt') as string;

    const res = await fetch(`/api/worlds/${params.slug}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    if (res.ok) {
      const data = await res.json();
      setResult(data);
      setLoading(false);
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || 'Generation failed');
      setLoading(false);
    }
  }

  if (result) {
    return (
      <div className="generate-world-card">
        <div className="generate-success">
          <h3>World Generated!</h3>
          <p>Created <strong>{result.entities}</strong> entities, <strong>{result.events}</strong> timeline events, and <strong>{result.relations}</strong> relationships.</p>
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button className="btn btn-primary btn-sm" onClick={() => { setResult(null); setOpen(false); }}>
              Done
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => { setResult(null); }}>
              Generate More
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!open) {
    return (
      <button className="btn btn-primary" onClick={() => setOpen(true)}>
        Generate with AI
      </button>
    );
  }

  return (
    <div className="generate-world-card">
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', marginBottom: 8 }}>
        AI World Generator
      </h3>
      <p className="text-small" style={{ marginBottom: 16 }}>
        Describe what kind of world you want and AI will generate entities, timeline events, and relationships.
      </p>
      {error && <div className="form-error" style={{ marginBottom: 12 }}>{error}</div>}
      <form onSubmit={handleGenerate}>
        <div className="field-group" style={{ marginBottom: 16 }}>
          <textarea
            name="prompt"
            className="textarea"
            placeholder="e.g. A dark fantasy world with warring kingdoms, ancient magic, and a looming threat from the north. Include political factions, key historical figures, and legendary artifacts."
            rows={4}
            disabled={loading}
          />
          <span className="field-hint">Leave empty to auto-generate based on your world&apos;s title and description.</span>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Generating...' : 'Generate World Content'}
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </button>
        </div>
      </form>
      {loading && (
        <div className="generate-loading">
          <div className="spinner" />
          <p>AI is crafting your world... This may take 15-30 seconds.</p>
        </div>
      )}
    </div>
  );
}
