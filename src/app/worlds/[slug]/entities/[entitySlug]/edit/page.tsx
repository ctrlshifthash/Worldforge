'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function EditEntityPage() {
  const router = useRouter();
  const params = useParams<{ slug: string; entitySlug: string }>();
  const [loading, setLoading] = useState(false);
  const [entity, setEntity] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState({
    title: '',
    summary: '',
    content: '',
    facts: '',
    tags: '',
  });

  useEffect(() => {
    fetch(`/api/worlds/${params.slug}/entities?type=`)
      .then((r) => r.json())
      .then((data) => {
        const found = data.entities?.find(
          (e: { slug: string }) => e.slug === params.entitySlug
        );
        if (found) {
          setEntity(found);
          const content = JSON.parse(found.contentJson || '[]');
          const facts = JSON.parse(found.factsJson || '[]');
          const tags = JSON.parse(found.tagsJson || '[]');
          setForm({
            title: found.title,
            summary: found.summary,
            content: content.join('\n\n'),
            facts: facts.map((f: { label: string; value: string }) => `${f.label}: ${f.value}`).join('\n'),
            tags: tags.join(', '),
          });
        }
      });
  }, [params.slug, params.entitySlug]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!entity) return;
    setLoading(true);

    const facts: { label: string; value: string }[] = [];
    form.facts.split('\n').forEach((line) => {
      const [label, ...rest] = line.split(':');
      const value = rest.join(':').trim();
      if (label?.trim() && value) facts.push({ label: label.trim(), value });
    });

    const res = await fetch(`/api/worlds/${params.slug}/entities/${(entity as { id: string }).id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: form.title,
        summary: form.summary,
        content: form.content,
        facts,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      }),
    });

    if (res.ok) {
      const data = await res.json();
      router.push(`/worlds/${params.slug}/entities/${data.entity.slug}`);
      router.refresh();
    } else {
      setLoading(false);
    }
  }

  if (!entity) {
    return <div className="loading-page"><div className="spinner" /></div>;
  }

  return (
    <>
      <div className="page-header">
        <p className="eyebrow">Edit Entity</p>
        <h1 className="text-headline">{form.title || 'Edit'}</h1>
      </div>

      <form className="entity-form" onSubmit={handleSubmit}>
        <div className="form-stack">
          <div className="field-group">
            <label className="field-label">Entity Name</label>
            <input
              className="input"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>

          <div className="field-group">
            <label className="field-label">Summary</label>
            <input
              className="input"
              value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
              required
            />
          </div>

          <div className="field-group">
            <label className="field-label">Full Description</label>
            <textarea
              className="textarea"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={8}
            />
          </div>

          <div className="field-group">
            <label className="field-label">Properties</label>
            <textarea
              className="textarea"
              value={form.facts}
              onChange={(e) => setForm({ ...form, facts: e.target.value })}
              rows={4}
              style={{ minHeight: 80 }}
            />
            <span className="field-hint">One property per line: &quot;Label: Value&quot;</span>
          </div>

          <div className="field-group">
            <label className="field-label">Tags</label>
            <input
              className="input"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => router.back()}>
              Cancel
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
