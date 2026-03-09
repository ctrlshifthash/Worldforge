'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function WorldSettingsPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'PRIVATE' | 'PUBLIC'>('PRIVATE');

  useEffect(() => {
    fetch(`/api/worlds/${params.slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.world) {
          setTitle(data.world.title);
          setTagline(data.world.tagline);
          setDescription(data.world.description);
          setVisibility(data.world.visibility);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.slug]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const res = await fetch(`/api/worlds/${params.slug}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, tagline, description, visibility }),
    });

    if (res.ok) {
      router.push(`/worlds/${params.slug}`);
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || 'Failed to save');
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    const res = await fetch(`/api/worlds/${params.slug}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      router.push('/dashboard');
      router.refresh();
    } else {
      setDeleting(false);
      setError('Failed to delete world');
    }
  }

  if (loading) {
    return (
      <div className="page-header">
        <p className="eyebrow">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <p className="eyebrow">World Settings</p>
        <h1 className="text-headline">Settings</h1>
      </div>

      {error && (
        <div className="form-error" style={{ marginBottom: 16 }}>{error}</div>
      )}

      <form className="entity-form" onSubmit={handleSave}>
        <div className="form-stack">
          <div className="field-group">
            <label className="field-label">World Name</label>
            <input
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="field-group">
            <label className="field-label">Tagline</label>
            <input
              className="input"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="A short description of your world"
              required
            />
          </div>

          <div className="field-group">
            <label className="field-label">Description</label>
            <textarea
              className="textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your world in detail..."
              rows={6}
            />
          </div>

          <div className="field-group">
            <label className="field-label">Visibility</label>
            <select
              className="select"
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as 'PRIVATE' | 'PUBLIC')}
            >
              <option value="PRIVATE">Private — Only you can see this world</option>
              <option value="PUBLIC">Public — Anyone can view and explore this world</option>
            </select>
            <span className="field-hint">
              Public worlds appear on the Discover page for everyone to browse.
            </span>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => router.back()}
            >
              Cancel
            </button>
          </div>
        </div>
      </form>

      {/* Danger Zone */}
      <div className="settings-danger">
        <h3>Danger Zone</h3>
        <p>Deleting a world is permanent. All entities, relations, events, and activity will be lost.</p>
        {!showDelete ? (
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => setShowDelete(true)}
          >
            Delete World
          </button>
        ) : (
          <div className="settings-danger-confirm">
            <p><strong>Are you sure?</strong> This cannot be undone.</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Yes, Delete Forever'}
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setShowDelete(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
