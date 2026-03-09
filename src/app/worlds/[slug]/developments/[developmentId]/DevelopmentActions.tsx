'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function DevelopmentActions({
  developmentId,
  slug,
}: {
  developmentId: string;
  slug: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [reviewNote, setReviewNote] = useState('');

  const handleAction = async (status: 'APPROVED' | 'REJECTED' | 'EDITED') => {
    setLoading(true);
    try {
      await fetch(`/api/worlds/${slug}/developments/${developmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reviewNote: reviewNote || undefined }),
      });
      router.push(`/worlds/${slug}/developments`);
      router.refresh();
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="dev-sidebar-section">
      <h4>Your Decision</h4>
      <textarea
        className="input"
        placeholder="Add a note about your decision (optional)..."
        value={reviewNote}
        onChange={(e) => setReviewNote(e.target.value)}
        rows={3}
        style={{ fontSize: '0.82rem', marginBottom: 12 }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button
          className="btn btn-primary"
          onClick={() => handleAction('APPROVED')}
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Approve'}
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => handleAction('EDITED')}
          disabled={loading}
        >
          Approve with Note
        </button>
        <button
          className="btn btn-ghost"
          onClick={() => handleAction('REJECTED')}
          disabled={loading}
        >
          Reject
        </button>
      </div>
    </div>
  );
}
