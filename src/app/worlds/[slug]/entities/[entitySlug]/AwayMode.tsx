'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface SessionInfo {
  id: string;
  status: string;
  scope: string;
  personalityPrompt: string;
  constraints: string;
  frequency: string;
  _count: { developments: number };
}

const SCOPE_OPTIONS = [
  {
    value: 'SAFE',
    label: 'Safe',
    description: 'Quiet life — journals, travel, conversations. Nothing dramatic.',
  },
  {
    value: 'EXPANDED',
    label: 'Expanded',
    description: 'Some action — encounters, new relationships, minor conflicts.',
  },
  {
    value: 'ADVANCED',
    label: 'Advanced',
    description: 'Full drama — major events, faction shifts, bold twists.',
  },
] as const;

export function AwayMode({
  slug,
  entityId,
  entityTitle,
  existingSession,
  pendingCount,
}: {
  slug: string;
  entityId: string;
  entityTitle: string;
  existingSession: SessionInfo | null;
  pendingCount: number;
}) {
  const router = useRouter();
  const [showSetup, setShowSetup] = useState(false);
  const [personality, setPersonality] = useState(existingSession?.personalityPrompt || '');
  const [constraints, setConstraints] = useState(existingSession?.constraints || '');
  const [scope, setScope] = useState(existingSession?.scope || 'SAFE');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const handleEnable = async () => {
    setLoading(true);
    try {
      await fetch(`/api/worlds/${slug}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityId,
          personalityPrompt: personality,
          constraints,
          scope,
        }),
      });
      router.refresh();
    } finally {
      setLoading(false);
      setShowSetup(false);
    }
  };

  const handlePause = async () => {
    if (!existingSession) return;
    setLoading(true);
    try {
      await fetch(`/api/worlds/${slug}/sessions/${existingSession.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PAUSED' }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const handleResume = async () => {
    if (!existingSession) return;
    setLoading(true);
    try {
      await fetch(`/api/worlds/${slug}/sessions/${existingSession.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ACTIVE' }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const handleEnd = async () => {
    if (!existingSession) return;
    setLoading(true);
    try {
      await fetch(`/api/worlds/${slug}/sessions/${existingSession.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ENDED' }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!existingSession) return;
    setGenerating(true);
    try {
      const res = await fetch(`/api/worlds/${slug}/sessions/${existingSession.id}/generate`, {
        method: 'POST',
      });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setGenerating(false);
    }
  };

  // No session — show enable button
  if (!existingSession || existingSession.status === 'ENDED') {
    return (
      <div className="away-mode-section">
        <h4>AI Storytelling</h4>
        {!showSetup ? (
          <button className="btn btn-secondary btn-sm" onClick={() => setShowSetup(true)}>
            Start AI Storytelling
          </button>
        ) : (
          <div className="away-mode-setup">
            <div className="away-mode-field">
              <label>How should the AI write this character?</label>
              <span className="field-hint">Describe their personality, motivations, and voice.</span>
              <textarea
                className="input"
                placeholder={`e.g., "Cautious, intellectual, driven by duty but privately doubts..."`}
                value={personality}
                onChange={(e) => setPersonality(e.target.value)}
                rows={3}
              />
            </div>
            <div className="away-mode-field">
              <label>How much can the AI change?</label>
              <div className="scope-picker">
                {SCOPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`scope-option${scope === opt.value ? ' scope-option-active' : ''}`}
                    onClick={() => setScope(opt.value)}
                  >
                    <span className="scope-option-label">{opt.label}</span>
                    <span className="scope-option-desc">{opt.description}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="away-mode-field">
              <label>What should the AI never do?</label>
              <textarea
                className="input"
                placeholder="e.g., 'Never kill characters, stay within the city...'"
                value={constraints}
                onChange={(e) => setConstraints(e.target.value)}
                rows={3}
              />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary btn-sm" onClick={handleEnable} disabled={loading}>
                {loading ? 'Starting...' : 'Start'}
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowSetup(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Active or paused session
  return (
    <div className="away-mode-section">
      <h4>
        AI Storytelling
        <span className={`away-mode-status away-mode-status-${existingSession.status.toLowerCase()}`}>
          {existingSession.status === 'ACTIVE' ? 'ON' : existingSession.status}
        </span>
        <span className={`away-mode-scope away-mode-scope-${existingSession.scope.toLowerCase()}`}>
          {existingSession.scope.charAt(0) + existingSession.scope.slice(1).toLowerCase()}
        </span>
      </h4>

      {pendingCount > 0 && (
        <a href={`/worlds/${slug}/developments`} className="away-mode-pending-badge">
          {pendingCount} {pendingCount !== 1 ? 'stories' : 'story'} ready to review
        </a>
      )}

      {existingSession.status === 'ACTIVE' && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-primary btn-sm" onClick={handleGenerate} disabled={generating}>
            {generating ? 'Writing...' : 'Write Next Story'}
          </button>
          <button className="btn btn-ghost btn-sm" onClick={handlePause} disabled={loading}>
            Pause
          </button>
          <button className="btn btn-ghost btn-sm" onClick={handleEnd} disabled={loading}>
            Stop AI Storytelling
          </button>
        </div>
      )}

      {existingSession.status === 'PAUSED' && (
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={handleResume} disabled={loading}>
            Resume
          </button>
          <button className="btn btn-ghost btn-sm" onClick={handleEnd} disabled={loading}>
            Stop AI Storytelling
          </button>
        </div>
      )}
    </div>
  );
}
