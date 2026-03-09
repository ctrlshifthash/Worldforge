'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState } from 'react';

interface EraOption {
  id: string;
  slug: string;
  title: string;
  color: string;
}

export function CreateEventForm({ eras }: { eras: EraOption[] }) {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [dateLabel, setDateLabel] = useState('');
  const [eraId, setEraId] = useState('');
  const [eraCustom, setEraCustom] = useState('');
  const [summary, setSummary] = useState('');
  const [impact, setImpact] = useState('');
  const [aiHint, setAiHint] = useState('');

  async function handleAiGenerate() {
    setAiLoading(true);
    try {
      const res = await fetch(`/api/worlds/${params.slug}/generate-single`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'event', hint: aiHint || undefined }),
      });
      if (res.ok) {
        const { result } = await res.json();
        if (result.title) setTitle(result.title);
        if (result.dateLabel) setDateLabel(result.dateLabel);
        if (result.summary) setSummary(result.summary);
        if (result.impact) setImpact(result.impact);
        if (result.era) {
          const match = eras.find((e) => e.title === result.era);
          if (match) {
            setEraId(match.id);
          } else {
            setEraCustom(result.era);
          }
        }
      }
    } finally {
      setAiLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const selectedEra = eras.find((era) => era.id === eraId);

    const res = await fetch(`/api/worlds/${params.slug}/timeline`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        dateLabel,
        era: selectedEra?.title || eraCustom || 'Unknown Era',
        eraId: eraId || undefined,
        summary,
        impact,
      }),
    });

    if (res.ok) {
      setOpen(false);
      setLoading(false);
      setTitle('');
      setDateLabel('');
      setEraId('');
      setEraCustom('');
      setSummary('');
      setImpact('');
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || 'Failed to create event');
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button className="btn btn-primary" onClick={() => setOpen(true)}>
        + New Event
      </button>
    );
  }

  return (
    <div className="card" style={{ marginBottom: 24 }}>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: 16 }}>
        New Timeline Event
      </h3>

      {/* AI Assist */}
      <div className="ai-assist-bar" style={{ marginBottom: 16 }}>
        <div className="ai-assist-header">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
          <span>AI Assist</span>
        </div>
        <div className="ai-assist-body">
          <input
            className="input"
            placeholder="Optional: describe the event (or leave blank)"
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

      {error && <div className="form-error" style={{ marginBottom: 12 }}>{error}</div>}
      <form className="form-stack" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="field-group">
            <label className="field-label">Event Title</label>
            <input className="input" placeholder="e.g. The Great Sundering" required autoFocus value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="field-group">
            <label className="field-label">Date</label>
            <input className="input" placeholder="e.g. Year 312, Third Age" required value={dateLabel} onChange={(e) => setDateLabel(e.target.value)} />
          </div>
        </div>
        <div className="field-group">
          <label className="field-label">Era</label>
          {eras.length > 0 ? (
            <select className="input" required value={eraId} onChange={(e) => setEraId(e.target.value)}>
              <option value="">Select an era...</option>
              {eras.map((era) => (
                <option key={era.id} value={era.id}>
                  {era.title}
                </option>
              ))}
            </select>
          ) : (
            <input className="input" placeholder="e.g. The Age of Ruin" required value={eraCustom} onChange={(e) => setEraCustom(e.target.value)} />
          )}
        </div>
        <div className="field-group">
          <label className="field-label">Summary</label>
          <textarea className="textarea" placeholder="What happened?" rows={3} required value={summary} onChange={(e) => setSummary(e.target.value)} />
        </div>
        <div className="field-group">
          <label className="field-label">Impact</label>
          <textarea className="textarea" placeholder="How did this change the world?" rows={2} value={impact} onChange={(e) => setImpact(e.target.value)} />
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Add Event'}
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
