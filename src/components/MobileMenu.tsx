'use client';

import { useState } from 'react';
import Link from 'next/link';

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/docs', label: 'Docs' },
  { href: '/play/everhold', label: 'Play' },
  { href: '/discover', label: 'Discover' },
  { href: '/leaderboard', label: 'Leaderboard' },
];

/**
 * Hamburger menu shown only on mobile (CSS-gated). Collapses the nav links into
 * a tappable dropdown so they don't overflow the bar on small screens.
 */
export function MobileMenu({ loggedIn }: { loggedIn: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="nav-mobile">
      <button
        className="nav-hamburger"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span style={{ transform: open ? 'translateY(6px) rotate(45deg)' : undefined }} />
        <span style={{ opacity: open ? 0 : 1 }} />
        <span style={{ transform: open ? 'translateY(-6px) rotate(-45deg)' : undefined }} />
      </button>

      {open && (
        <>
          <div className="nav-mobile-backdrop" onClick={() => setOpen(false)} />
          <nav className="nav-mobile-menu">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="nav-mobile-link" onClick={() => setOpen(false)}>
                {l.label}
              </Link>
            ))}
            {loggedIn && (
              <>
                <div className="nav-mobile-sep" />
                <Link href="/dashboard" className="nav-mobile-link" onClick={() => setOpen(false)}>Dashboard</Link>
                <Link href="/dashboard/earnings" className="nav-mobile-link" onClick={() => setOpen(false)}>💰 Earnings</Link>
              </>
            )}
          </nav>
        </>
      )}
    </div>
  );
}
