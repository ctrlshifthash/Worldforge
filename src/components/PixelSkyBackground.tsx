'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

// Seeded random for deterministic star/particle placement
function sr(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

const STAR_COUNT = 150;
const STARS: { x: number; y: number; size: number; delay: number; dur: number }[] = [];
for (let i = 0; i < STAR_COUNT; i++) {
  STARS.push({
    x: sr(i * 1.1) * 100,
    y: sr(i * 2.3) * 100,
    size: sr(i * 3.7) < 0.25 ? 2 : 1,
    delay: sr(i * 5.1) * 8,
    dur: 2 + sr(i * 7.3) * 4,
  });
}

const CLOUDS = [
  { x: 10, y: 12, w: 80, h: 20, speed: 48, layer: 1 },
  { x: 40, y: 22, w: 60, h: 16, speed: 58, layer: 1 },
  { x: 70, y: 8, w: 90, h: 24, speed: 40, layer: 2 },
  { x: -15, y: 30, w: 70, h: 18, speed: 62, layer: 2 },
  { x: 85, y: 18, w: 55, h: 14, speed: 52, layer: 1 },
  { x: 25, y: 36, w: 75, h: 20, speed: 44, layer: 2 },
];

const PARTICLE_COUNT = 20;
const PARTICLES: { x: number; y: number; delay: number; dur: number; type: 'firefly' | 'dust' }[] = [];
for (let i = 0; i < PARTICLE_COUNT; i++) {
  PARTICLES.push({
    x: sr(i * 11.1) * 100,
    y: sr(i * 13.3) * 100,
    delay: sr(i * 17.7) * 10,
    dur: 3 + sr(i * 19.1) * 5,
    type: sr(i * 23.3) < 0.5 ? 'firefly' : 'dust',
  });
}

const MARKETING_PATHS = ['/', '/about', '/how-it-works'];

export function PixelSkyBackground() {
  const pathname = usePathname();
  const rafRef = useRef(0);

  useEffect(() => {
    function onScroll() {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        const docH = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docH > 0 ? Math.min(window.scrollY / docH, 1) : 0;
        document.documentElement.style.setProperty('--sky-scroll', String(progress));
        rafRef.current = 0;
      });
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  if (!MARKETING_PATHS.includes(pathname)) return null;

  return (
    <div className="pixel-sky" aria-hidden="true">
      <div className="pixel-sky-gradient" />

      <div className="pixel-sky-stars">
        {STARS.map((s, i) => (
          <span
            key={i}
            className="pixel-star"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: s.size,
              height: s.size,
              animationDelay: `${s.delay}s`,
              animationDuration: `${s.dur}s`,
            }}
          />
        ))}
      </div>

      <div className="pixel-sky-clouds">
        {CLOUDS.map((c, i) => (
          <div
            key={i}
            className={`pixel-cloud pixel-cloud-layer-${c.layer}`}
            style={{
              left: `${c.x}%`,
              top: `${c.y}%`,
              width: c.w,
              height: c.h,
              animationDuration: `${c.speed}s`,
              animationDelay: `${i * -8}s`,
            }}
          />
        ))}
      </div>

      <div className="pixel-sky-fireflies">
        {PARTICLES.filter(p => p.type === 'firefly').map((p, i) => (
          <span
            key={i}
            className="pixel-particle pixel-particle-firefly"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.dur}s`,
            }}
          />
        ))}
      </div>

      <div className="pixel-sky-dust">
        {PARTICLES.filter(p => p.type === 'dust').map((p, i) => (
          <span
            key={i}
            className="pixel-particle pixel-particle-dust"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.dur}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
