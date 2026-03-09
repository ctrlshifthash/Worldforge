'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState } from 'react';

interface EntityOption {
  id: string;
  title: string;
  type: string;
}

export function AddRelationForm({ entities }: { entities: EntityOption[] }) {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const form = new FormData(e.currentTarget);
    const fromId = form.get('from');
    const toId = form.get('to');

    if (fromId === toId) {
      setError('Cannot relate an entity to itself');
      setLoading(false);
      return;
    }

    const res = await fetch(`/api/worlds/${params.slug}/relations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fromEntityId: fromId,
        toEntityId: toId,
        label: form.get('label'),
      }),
    });

    if (res.ok) {
      setOpen(false);
      setLoading(false);
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || 'Failed to create relation');
      setLoading(false);
    }
  }

  if (entities.length < 2) return null;

  if (!open) {
    return (
      <button className="btn btn-primary" onClick={() => setOpen(true)}>
        + Add Connection
      </button>
    );
  }

  return (
    <div className="card" style={{ marginBottom: 24 }}>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: 16 }}>
        New Connection
      </h3>
      {error && <div className="form-error" style={{ marginBottom: 12 }}>{error}</div>}
      <form className="form-stack" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="field-group">
            <label className="field-label">From Entity</label>
            <select name="from" className="select" required>
              <option value="">Select entity...</option>
              {entities.map((e) => (
                <option key={e.id} value={e.id}>{e.title} ({e.type.toLowerCase()})</option>
              ))}
            </select>
          </div>
          <div className="field-group">
            <label className="field-label">To Entity</label>
            <select name="to" className="select" required>
              <option value="">Select entity...</option>
              {entities.map((e) => (
                <option key={e.id} value={e.id}>{e.title} ({e.type.toLowerCase()})</option>
              ))}
            </select>
          </div>
        </div>
        <div className="field-group">
          <label className="field-label">Connection</label>
          <input name="label" className="input" placeholder="e.g. allied with, rules over, member of" required />
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Add Connection'}
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
