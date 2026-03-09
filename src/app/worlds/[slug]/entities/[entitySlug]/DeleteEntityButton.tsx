'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function DeleteEntityButton({
  slug,
  entityId,
  entityTitle,
}: {
  slug: string;
  entityId: string;
  entityTitle: string;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);

  async function handleDelete() {
    const res = await fetch(`/api/worlds/${slug}/entities/${entityId}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      router.push(`/worlds/${slug}/entities`);
      router.refresh();
    }
  }

  if (confirming) {
    return (
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <span className="text-small" style={{ color: '#e06060' }}>Delete &quot;{entityTitle}&quot;?</span>
        <button className="btn btn-danger btn-sm" onClick={handleDelete}>Yes, delete</button>
        <button className="btn btn-ghost btn-sm" onClick={() => setConfirming(false)}>Cancel</button>
      </div>
    );
  }

  return (
    <button className="btn btn-danger btn-sm" onClick={() => setConfirming(true)}>
      Delete
    </button>
  );
}
