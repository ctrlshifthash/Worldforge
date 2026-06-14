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
    const kind = form.get('kind') === 'CUSTOM' ? 'CUSTOM' : 'CLASSIC';
    const dest = (slug: string) => (kind === 'CUSTOM' ? `/worlds/${slug}/editor` : `/worlds/${slug}`);

    if (useAI) {
      // One-shot AI generation — AI creates world name, description, AND all content
      const concept = form.get('concept') as string;
      const visibility = form.get('visibility') as string;

      const steps = [
        'Imagining your world...',
        'Creating characters & locations...',
        'Writing history...',
        'Forging connections...',
        'Building timeline...',
        'Saving to database...',
      ];
      let stepIndex = 0;
      setStatus(steps[0]);
      const stepTimer = setInterval(() => {
        stepIndex++;
        if (stepIndex < steps.length) {
          setStatus(steps[stepIndex]);
        }
      }, 1500);

      const res = await fetch('/api/worlds/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concept, visibility, kind }),
      });

      clearInterval(stepTimer);

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
      router.push(dest(data.world.slug));
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
          kind,
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
      router.push(dest(world.slug));
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
  const [kind, setKind] = useState<'CLASSIC' | 'CUSTOM'>('CLASSIC');

  const card = (active: boolean): React.CSSProperties => ({
    display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start', textAlign: 'left',
    padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
    border: active ? '2px solid #e8c86a' : '1px solid #2a2a32',
    background: active ? 'rgba(232,200,106,0.08)' : '#16161a',
  });

  return (
    <div className="modal-overlay" onClick={loading ? undefined : onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
        <div className="modal-header">
          <h2>Create a New World</h2>
          {!loading && <button className="modal-close" onClick={onClose}>✕</button>}
        </div>

        {error && <div className="form-error" style={{ marginBottom: 16 }}>{error}</div>}

        <form className="form-stack" onSubmit={onSubmit}>
          {/* World type chooser — Classic vs Custom */}
          <input type="hidden" name="kind" value={kind} />
          <div>
            <label className="field-label" style={{ marginBottom: 8, display: 'block' }}>World type</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button type="button" disabled={loading} onClick={() => setKind('CLASSIC')} style={card(kind === 'CLASSIC')}>
                <span style={{ fontSize: 20 }}>🏰</span>
                <strong style={{ fontSize: 13, color: '#fff' }}>Classic World</strong>
                <span style={{ fontSize: 11, color: '#9a9aa3', lineHeight: 1.4 }}>The built-in game — town, grassland orcs, seaside village, quests &amp; combat.</span>
              </button>
              <button type="button" disabled={loading} onClick={() => setKind('CUSTOM')} style={card(kind === 'CUSTOM')}>
                <span style={{ fontSize: 20 }}>🎨</span>
                <strong style={{ fontSize: 13, color: '#fff' }}>Custom World</strong>
                <span style={{ fontSize: 11, color: '#9a9aa3', lineHeight: 1.4 }}>Paint your own map tile by tile. Opens the map editor right after you create it.</span>
              </button>
            </div>
          </div>

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
