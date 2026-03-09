'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function CreateWorldButton({ isCard }: { isCard?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const form = new FormData(e.currentTarget);
    const useAI = form.get('useAI') === 'on';

    if (useAI) {
      // One-shot AI generation — AI creates world name, description, AND all content
      const concept = form.get('concept') as string;
      const visibility = form.get('visibility') as string;

      setStatus('AI is building your world — generating name, lore, entities, events, and relations... This may take 20-40 seconds.');

      const res = await fetch('/api/worlds/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concept, visibility }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'AI generation failed');
        setLoading(false);
        setStatus('');
        return;
      }

      const data = await res.json();
      setOpen(false);
      setLoading(false);
      setStatus('');
      router.push(`/worlds/${data.world.slug}`);
      router.refresh();
    } else {
      // Manual creation — user provides all details
      setStatus('Creating world...');

      const res = await fetch('/api/worlds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.get('title'),
          tagline: form.get('tagline'),
          description: form.get('description'),
          visibility: form.get('visibility'),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to create world');
        setLoading(false);
        setStatus('');
        return;
      }

      const { world } = await res.json();
      setOpen(false);
      setLoading(false);
      setStatus('');
      router.push(`/worlds/${world.slug}`);
      router.refresh();
    }
  }

  if (isCard) {
    return (
      <>
        <button className="create-world-card" onClick={() => setOpen(true)}>
          <div className="create-world-icon">+</div>
          <span style={{ fontWeight: 500 }}>Create New World</span>
        </button>
        {open && <Modal onSubmit={handleSubmit} loading={loading} status={status} error={error} onClose={() => setOpen(false)} />}
      </>
    );
  }

  return (
    <>
      <button className="btn btn-primary" onClick={() => setOpen(true)}>+ New World</button>
      {open && <Modal onSubmit={handleSubmit} loading={loading} status={status} error={error} onClose={() => setOpen(false)} />}
    </>
  );
}

function Modal({ onSubmit, loading, status, error, onClose }: {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  loading: boolean;
  status: string;
  error: string;
  onClose: () => void;
}) {
  const [useAI, setUseAI] = useState(true);

  return (
    <div className="modal-overlay" onClick={loading ? undefined : onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
        <div className="modal-header">
          <h2>Create a New World</h2>
          {!loading && <button className="modal-close" onClick={onClose}>✕</button>}
        </div>

        {error && <div className="form-error" style={{ marginBottom: 16 }}>{error}</div>}

        <form className="form-stack" onSubmit={onSubmit}>
          {/* AI toggle at the top */}
          <div className="create-ai-toggle">
            <label className="create-ai-label">
              <input
                type="checkbox"
                name="useAI"
                checked={useAI}
                onChange={(e) => setUseAI(e.target.checked)}
                disabled={loading}
              />
              <span className="create-ai-check" />
              <div>
                <strong>Generate with AI</strong>
                <span>AI creates everything — world name, lore, entities, timeline, and relationships</span>
              </div>
            </label>
          </div>

          {useAI ? (
            <>
              {/* AI mode: just concept + visibility */}
              <div className="field-group">
                <label className="field-label">Describe your world concept</label>
                <textarea
                  name="concept"
                  className="textarea"
                  placeholder="e.g. A dark fantasy world with warring kingdoms, ancient magic, 3 main factions, legendary artifacts, and a prophesied hero destined to unite them"
                  rows={4}
                  disabled={loading}
                  autoFocus
                />
                <span className="field-hint">Leave empty for a completely random world. The more detail you give, the better the result.</span>
              </div>
              <div className="field-group">
                <label className="field-label">Visibility</label>
                <select name="visibility" className="select" disabled={loading}>
                  <option value="PRIVATE">Private — Only you can see this world</option>
                  <option value="PUBLIC">Public — Anyone can view and explore</option>
                </select>
              </div>
            </>
          ) : (
            <>
              {/* Manual mode: all fields */}
              <div className="field-group">
                <label className="field-label">World Name</label>
                <input name="title" className="input" placeholder="e.g. The Shattered Isles" required autoFocus disabled={loading} />
              </div>
              <div className="field-group">
                <label className="field-label">Tagline</label>
                <input name="tagline" className="input" placeholder="A brief hook for your world" required disabled={loading} />
              </div>
              <div className="field-group">
                <label className="field-label">Description</label>
                <textarea name="description" className="textarea" placeholder="Describe your world — its setting, tone, key themes..." rows={3} disabled={loading} />
              </div>
              <div className="field-group">
                <label className="field-label">Visibility</label>
                <select name="visibility" className="select" disabled={loading}>
                  <option value="PRIVATE">Private — Only you can see this world</option>
                  <option value="PUBLIC">Public — Anyone can view and explore</option>
                </select>
              </div>
            </>
          )}

          {loading && status && (
            <div className="generate-loading">
              <div className="spinner" />
              <p>{status}</p>
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Working...' : useAI ? 'Generate World' : 'Create World'}
            </button>
            {!loading && (
              <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
