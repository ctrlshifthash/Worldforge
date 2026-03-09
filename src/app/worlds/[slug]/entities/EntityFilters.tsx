'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ENTITY_COLORS, ENTITY_LABELS } from '@/lib/utils';

const TYPES = ['CHARACTER', 'LOCATION', 'FACTION', 'ARTIFACT', 'SPECIES', 'EVENT'];

export function EntityFilters({ slug, active }: { slug: string; active?: string }) {
  return (
    <div className="entity-filters">
      <Link
        href={`/worlds/${slug}/entities`}
        className={cn('entity-filter', !active && 'active')}
      >
        All
      </Link>
      {TYPES.map((type) => (
        <Link
          key={type}
          href={`/worlds/${slug}/entities?type=${type.toLowerCase()}`}
          className={cn('entity-filter', active === type && 'active')}
        >
          <span
            className="entity-dot"
            style={{ background: ENTITY_COLORS[type], width: 8, height: 8 }}
          />
          {ENTITY_LABELS[type]}
        </Link>
      ))}
    </div>
  );
}
