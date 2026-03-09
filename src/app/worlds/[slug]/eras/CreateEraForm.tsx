'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export function CreateEraForm() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const [title, setTitle] = useState('');
  const [startLabel, setStartLabel] = useState('');
  const [endLabel, setEndLabel] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#FF6B2C');
  const [aiHint, setAiHint] = useState('');

  async function handleAiGenerate() {
    setAiLoading(true);
    try {
      const res = await fetch(`/api/worlds/${slug}/generate-single`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'era', hint: aiHint || undefined }),
      });
      if (res.ok) {
        const { result } = await res.json();
        if (result.title) setTitle(result.title);
        if (result.startLabel) setStartLabel(result.startLabel);
        if (result.endLabel) setEndLabel(result.endLabel);
        if (result.description) setDescription(result.description);
        if (result.color) setColor(result.color);
      }
    } finally {
      setAiLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    await fetch(`/api/worlds/${slug}/eras`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, startLabel, endLabel, color }),
    });

    setLoading(false);
    setOpen(false);
    setTitle('');
    setStartLabel('');
    setEndLabel('');
    setDescription('');
    setColor('#FF6B2C');
    router.refresh();
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn btn-primary">
        + New Era
      </button>
    );
  }

  return (
    <div className="modal-backdrop" onClick={() => setOpen(false)}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: 16 }}>Create Era</h2>

        {/* AI Assist */}
        <div className="ai-assist-bar" style={{ marginBottom: 16 }}>
          <div className="ai-assist-header">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
            <span>AI Assist</span>
          </div>
          <div className="ai-assist-body">
            <input
              className="input"
              placeholder="Optional: describe the era (or leave blank)"
              value={aiHint}
              onChange={(e) => setAiHint(e.target.value)}
            />
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleAiGenerate}
              disabled={aiLoading}
            >
              {aiLoading ? 'Generating...' : 'Generate'}
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="era-title">Title</label>
            <input id="era-title" className="input" required placeholder="e.g. The Golden Age" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label htmlFor="era-start">Start</label>
              <input id="era-start" className="input" placeholder="e.g. Year 0" value={startLabel} onChange={(e) => setStartLabel(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="era-end">End</label>
              <input id="era-end" className="input" placeholder="e.g. Year 50" value={endLabel} onChange={(e) => setEndLabel(e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="era-desc">Description</label>
            <textarea id="era-desc" className="input" rows={3} placeholder="Brief description of this era..." value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="era-color">Color</label>
            <input id="era-color" type="color" value={color} onChange={(e) => setColor(e.target.value)} style={{ width: 48, height: 36, padding: 2, background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer' }} />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
            <button type="button" onClick={() => setOpen(false)} className="btn btn-ghost">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Era'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
