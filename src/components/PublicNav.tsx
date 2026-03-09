'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export function PublicNav() {
  const [session, setSession] = useState<{ name: string } | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.user) setSession(data.user);
      })
      .catch(() => {});
  }, []);

  return (
    <nav className="landing-nav">
      <Link href="/" className="nav-logo">
        <span className="nav-logo-mark">W</span>
        Worldforge
      </Link>

      <div className="nav-links">
        <Link href="/discover" className="nav-text-link">
          Discover
        </Link>
        {session ? (
          <Link href="/dashboard" className="btn btn-primary btn-sm">
            Dashboard
          </Link>
        ) : (
          <>
            <Link href="/login" className="btn btn-ghost btn-sm">
              Sign In
            </Link>
            <Link href="/register" className="btn btn-primary btn-sm">
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
