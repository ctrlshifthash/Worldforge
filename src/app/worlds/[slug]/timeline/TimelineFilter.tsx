'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ENTITY_COLORS, ENTITY_LABELS } from '@/lib/utils';

interface FilterEntity {
  id: string;
  title: string;
  type: string;
}

export function TimelineFilter({
  entities,
  slug,
}: {
  entities: FilterEntity[];
  slug: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const followId = searchParams.get('follow');

  const handleChange = (entityId: string) => {
    if (entityId) {
      router.push(`/worlds/${slug}/timeline?follow=${entityId}`);
    } else {
      router.push(`/worlds/${slug}/timeline`);
    }
  };

  const followedEntity = followId ? entities.find((e) => e.id === followId) : null;

  return (
    <div className="timeline-filter">
      <label className="timeline-filter-label">Follow</label>
      <select
        className="timeline-filter-select"
        value={followId || ''}
        onChange={(e) => handleChange(e.target.value)}
      >
        <option value="">All entities</option>
        {entities.map((entity) => (
          <option key={entity.id} value={entity.id}>
            {entity.title} ({ENTITY_LABELS[entity.type]})
          </option>
        ))}
      </select>
      {followedEntity && (
        <button
          className="btn btn-ghost btn-sm timeline-filter-clear"
          onClick={() => handleChange('')}
        >
          Clear
        </button>
      )}
      {followedEntity && (
        <span
          className="entity-dot"
          style={{ background: ENTITY_COLORS[followedEntity.type], width: 8, height: 8 }}
        />
      )}
    </div>
  );
}
