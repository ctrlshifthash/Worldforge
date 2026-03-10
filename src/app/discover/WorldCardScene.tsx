'use client';

/* eslint-disable @next/next/no-img-element */

const GL = '/tilesets/grassland-v2/ERW - Grass Land 2.0 v1.9/ERW - Grass Land 2.0 v1.9';
const S = `${GL}/Props/Static props`;

// Pool of sprites to pick from — trees, structures, props
const SPRITE_POOL = [
  { src: `${S}/pine-tree-sprites/pine-tree_0.png`, h: 90, layer: 'back' as const },
  { src: `${S}/pine-tree-sprites/pine-tree_3.png`, h: 85, layer: 'back' as const },
  { src: `${S}/pine-tree-sprites/pine-tree_6.png`, h: 80, layer: 'back' as const },
  { src: `${S}/pine-tree-sprites/pine-tree_9.png`, h: 75, layer: 'back' as const },
  { src: `${S}/Cabin/cabin.png`, h: 70, layer: 'mid' as const },
  { src: `${S}/sheet2-sprites/watchtower - front.png`, h: 95, layer: 'mid' as const },
  { src: `${S}/sheet2-sprites/tent 1.png`, h: 55, layer: 'mid' as const },
  { src: `${S}/sheet1-sprites/lamp post 1 - lamp.png`, h: 60, layer: 'front' as const },
  { src: `${S}/sheet1-sprites/barrel 1.png`, h: 28, layer: 'front' as const },
  { src: `${S}/sheet1-sprites/waterwell - rope.png`, h: 40, layer: 'front' as const },
  { src: `${S}/sheet1-sprites/campfire 1.png`, h: 30, layer: 'front' as const },
  { src: `${S}/sheet1-sprites/sign 1.png`, h: 24, layer: 'front' as const },
  { src: `${S}/sheet1-sprites/rocks on grass - color scheme 1 - 5.png`, h: 24, layer: 'front' as const },
  { src: `${S}/sheet1-sprites/bush 1.png`, h: 30, layer: 'front' as const },
  { src: `${S}/sheet1-sprites/tree - color scheme 1 - 1.png`, h: 80, layer: 'back' as const },
  { src: `${S}/sheet2-sprites/throne.png`, h: 50, layer: 'mid' as const },
];

// Simple deterministic hash from slug
function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

// Seeded random from hash
function seeded(hash: number, i: number): number {
  const x = Math.sin(hash * 9301 + i * 49297) * 10000;
  return x - Math.floor(x);
}

interface PlacedSprite {
  src: string;
  left: number;   // percent
  bottom: number;  // percent
  height: number;  // px
  opacity: number;
  brightness: number;
}

function generateScene(slug: string): PlacedSprite[] {
  const h = hashStr(slug);
  const sprites: PlacedSprite[] = [];

  // Pick 2 back trees
  for (let i = 0; i < 2; i++) {
    const pool = SPRITE_POOL.filter(s => s.layer === 'back');
    const pick = pool[Math.floor(seeded(h, i) * pool.length)];
    sprites.push({
      src: pick.src,
      left: 5 + seeded(h, i + 10) * 80,
      bottom: 38 + seeded(h, i + 20) * 8,
      height: pick.h * (0.6 + seeded(h, i + 30) * 0.3),
      opacity: 0.3 + seeded(h, i + 40) * 0.15,
      brightness: 0.4 + seeded(h, i + 50) * 0.15,
    });
  }

  // Pick 1-2 mid items
  const midCount = seeded(h, 100) > 0.4 ? 2 : 1;
  for (let i = 0; i < midCount; i++) {
    const pool = SPRITE_POOL.filter(s => s.layer === 'mid');
    const pick = pool[Math.floor(seeded(h, i + 200) * pool.length)];
    sprites.push({
      src: pick.src,
      left: 15 + seeded(h, i + 210) * 60,
      bottom: 18 + seeded(h, i + 220) * 12,
      height: pick.h * (0.7 + seeded(h, i + 230) * 0.3),
      opacity: 0.45 + seeded(h, i + 240) * 0.15,
      brightness: 0.5 + seeded(h, i + 250) * 0.15,
    });
  }

  // Pick 1-2 front props
  const frontCount = seeded(h, 300) > 0.5 ? 2 : 1;
  for (let i = 0; i < frontCount; i++) {
    const pool = SPRITE_POOL.filter(s => s.layer === 'front');
    const pick = pool[Math.floor(seeded(h, i + 400) * pool.length)];
    sprites.push({
      src: pick.src,
      left: 10 + seeded(h, i + 410) * 70,
      bottom: 4 + seeded(h, i + 420) * 8,
      height: pick.h * (0.8 + seeded(h, i + 430) * 0.3),
      opacity: 0.5 + seeded(h, i + 440) * 0.2,
      brightness: 0.55 + seeded(h, i + 450) * 0.2,
    });
  }

  return sprites;
}

export function WorldCardScene({ slug }: { slug: string }) {
  const sprites = generateScene(slug);

  return (
    <div className="world-card-scene" aria-hidden="true">
      {sprites.map((s, i) => (
        <img
          key={i}
          src={s.src}
          alt=""
          className="world-card-sprite"
          style={{
            left: `${s.left}%`,
            bottom: `${s.bottom}%`,
            height: s.height,
            opacity: s.opacity,
            filter: `brightness(${s.brightness}) saturate(0.7)`,
          }}
        />
      ))}
    </div>
  );
}
