'use client';

import { useEffect, useRef } from 'react';

const WS_BASE = (process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001').replace(/^ws/, 'http');

export function OnlineCounts({ slugs }: { slugs: string[] }) {
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    async function poll() {
      try {
        const res = await fetch(`${WS_BASE}/rooms`, { cache: 'no-store' });
        if (!res.ok) return;
        const counts: Record<string, number> = await res.json();

        for (const slug of slugs) {
          const el = document.querySelector(`.discover-card-online[data-slug="${slug}"]`);
          if (!el) continue;
          const n = counts[slug] || 0;
          if (n > 0) {
            el.innerHTML = `<span class="online-dot"></span><strong>${n}</strong> online`;
            el.classList.add('has-online');
          } else {
            el.innerHTML = '';
            el.classList.remove('has-online');
          }
        }
      } catch {
        // WS server offline — no badges shown
      }
    }

    poll();
    const interval = setInterval(poll, 15000);

    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, [slugs]);

  return null;
}
