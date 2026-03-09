'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState } from 'react';
import { ENTITY_COLORS } from '@/lib/utils';

const TYPES = [
  { value: 'CHARACTER', label: 'Character' },
  { value: 'LOCATION', label: 'Location' },
  { value: 'FACTION', label: 'Faction' },
  { value: 'ARTIFACT', label: 'Artifact' },
  { value: 'SPECIES', label: 'Species' },
  { value: 'EVENT', label: 'Event' },
];

export default function NewEntityPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [type, setType] = useState('CHARACTER');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [facts, setFacts] = useState('');
  const [tags, setTags] = useState('');
  const [aiHint, setAiHint] = useState('');

  async function handleAiGenerate() {
    setAiLoading(true);
    try {
      const res = await fetch(`/api/worlds/${params.slug}/generate-single`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'entity',
          entityType: type,
          hint: aiHint || undefined,
        }),
      });
      if (res.ok) {
        const { result } = await res.json();
        if (result.title) setTitle(result.title);
        if (result.summary) setSummary(result.summary);
        if (result.content) setContent(result.content);
        if (Array.isArray(result.facts)) {
          setFacts(result.facts.map((f: { label: string; value: string }) => `${f.label}: ${f.value}`).join('\n'));
        }
        if (Array.isArray(result.tags)) {
          setTags(result.tags.join(', '));
        }
      }
    } finally {
      setAiLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const parsedFacts: { label: string; value: string }[] = [];
    facts.split('\n').forEach((line) => {
      const [label, value] = line.split(':').map((s) => s.trim());
      if (label && value) parsedFacts.push({ label, value });
    });

    const res = await fetch(`/api/worlds/${params.slug}/entities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        type,
        summary,
        content,
        accent: ENTITY_COLORS[type] || '#FF6B2C',
        facts: parsedFacts,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
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

  return (
    <>
      <div className="page-header">
        <p className="eyebrow">New Entity</p>
        <h1 className="text-headline">Create Entity</h1>
      </div>

      {/* AI Assist */}
      <div className="ai-assist-bar">
        <div className="ai-assist-header">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
          <span>AI Assist</span>
          <span className="ai-assist-hint">Let AI fill in the form for you — you can edit everything after</span>
        </div>
        <div className="ai-assist-body">
          <input
            className="input"
            placeholder={`Optional: describe what kind of ${TYPES.find(t => t.value === type)?.label.toLowerCase()} you want (or leave blank for a surprise)`}
            value={aiHint}
            onChange={(e) => setAiHint(e.target.value)}
          />
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleAiGenerate}
            disabled={aiLoading}
          >
            {aiLoading ? 'Generating...' : 'Generate with AI'}
          </button>
        </div>
      </div>

      <form className="entity-form" onSubmit={handleSubmit}>
        <div className="form-stack">
          <div className="form-row">
            <div className="field-group">
              <label className="field-label">Entity Name</label>
              <input
                className="input"
                placeholder="e.g. Aurelian Vale"
                required
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="field-group">
              <label className="field-label">Type</label>
              <select
                className="select"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                {TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="field-group">
            <label className="field-label">Summary</label>
            <input
              className="input"
              placeholder="A brief one-line description"
              required
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
          </div>

          <div className="field-group">
            <label className="field-label">Full Description</label>
            <textarea
              className="textarea"
              placeholder="Write the lore for this entity. Use blank lines to separate paragraphs."
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <div className="field-group">
            <label className="field-label">Properties</label>
            <textarea
              className="textarea"
              placeholder={"Key: Value (one per line)\ne.g. Title: Last Cartographer\nAllegiance: Tide Council"}
              rows={4}
              style={{ minHeight: 80 }}
              value={facts}
              onChange={(e) => setFacts(e.target.value)}
            />
            <span className="field-hint">One property per line in &quot;Label: Value&quot; format</span>
          </div>

          <div className="field-group">
            <label className="field-label">Tags</label>
            <input
              className="input"
              placeholder="Comma-separated tags, e.g. noble, cartographer, exile"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Entity'}
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
    </>
  );
}
