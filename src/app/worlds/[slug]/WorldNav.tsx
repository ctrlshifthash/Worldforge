'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  path: string;
  hint: string;
  ownerOnly?: boolean;
  badgeKey?: string;
  dimKey?: string;
}

interface NavGroup {
  label?: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    items: [
      { label: 'Overview', path: '', hint: 'Your world at a glance' },
    ],
  },
  {
    label: 'Explore',
    items: [
      { label: 'Walk Around', path: '/explore', hint: 'Walk through your world in 2D' },
      { label: 'Map', path: '/map', hint: 'Bird\'s-eye view with regions and territories' },
      { label: 'Connections', path: '/graph', hint: 'See how everything in your world is linked' },
    ],
  },
  {
    label: 'Build',
    items: [
      { label: 'Entities', path: '/entities', hint: 'Characters, locations, factions, and more', dimKey: 'entityCount' },
      { label: 'Timeline', path: '/timeline', hint: 'Your world\'s history — major events by era' },
      { label: 'Eras', path: '/eras', hint: 'Time periods that divide your history', dimKey: 'eraCount' },
    ],
  },
  {
    label: 'AI & Activity',
    items: [
      { label: 'Story Queue', path: '/developments', hint: 'AI-generated story beats to review', ownerOnly: true, badgeKey: 'pendingCount' },
      { label: 'Activity Log', path: '/activity', hint: 'Record of all edits and actions' },
    ],
  },
  {
    items: [
      { label: 'Settings', path: '/settings', hint: 'World configuration and visibility', ownerOnly: true },
    ],
  },
];

export function WorldNav({
  slug,
  isOwner = false,
  entityCount = 0,
  eraCount = 0,
  pendingCount = 0,
}: {
  slug: string;
  isOwner?: boolean;
  entityCount?: number;
  eraCount?: number;
  pendingCount?: number;
}) {
  const pathname = usePathname();
  const basePath = `/worlds/${slug}`;

  const counts: Record<string, number> = {
    entityCount,
    eraCount,
    pendingCount,
  };

  return (
    <nav className="world-nav">
      {NAV_GROUPS.map((group, gi) => {
        const visibleItems = group.items.filter((item) => !item.ownerOnly || isOwner);
        if (visibleItems.length === 0) return null;

        return (
          <div key={gi} className="world-nav-group">
            {visibleItems.map((item) => {
              const href = basePath + item.path;
              const isActive =
                item.path === ''
                  ? pathname === basePath
                  : pathname.startsWith(href);

              const badge = item.badgeKey ? counts[item.badgeKey] || 0 : 0;
              const isDimmed = item.dimKey ? (counts[item.dimKey] || 0) === 0 : false;

              return (
                <Link
                  key={item.path}
                  href={href as never}
                  className={cn('world-nav-link', isActive && 'active', isDimmed && !isActive && 'dimmed')}
                  title={item.hint}
                >
                  {item.label}
                  {badge > 0 && <span className="world-nav-badge">{badge}</span>}
                </Link>
              );
            })}
          </div>
        );
      })}
    </nav>
  );
}
