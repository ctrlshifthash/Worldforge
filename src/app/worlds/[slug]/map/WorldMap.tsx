'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createNoise2D } from 'simplex-noise';
import { ENTITY_COLORS, ENTITY_LABELS } from '@/lib/utils';
import Link from 'next/link';

// ─── Types ───

interface MapLocation {
  id: string;
  slug: string;
  title: string;
  type: string;
  summary: string;
  accent: string;
  mapX: number;
  mapY: number;
  tags: string[];
}

interface Camera {
  x: number;
  y: number;
  zoom: number;
}

interface EventInfo {
  title: string;
  dateLabel: string;
  summary: string;
  eraTitle: string;
  eraColor: string;
  linkedEntities: { id: string; title: string; type: string; accent: string }[];
}

interface MapRegionData {
  id: string;
  title: string;
  points: { x: number; y: number }[];
  color: string;
  ownerTitle: string | null;
}

// ─── Seeded PRNG (mulberry32) ───

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) || 1;
}

function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─── Terrain Color Palette ───

interface TerrainColor {
  threshold: number;
  r: number;
  g: number;
  b: number;
}

const TERRAIN_COLORS: TerrainColor[] = [
  { threshold: 0.28, r: 8,   g: 18,  b: 38  },
  { threshold: 0.35, r: 12,  g: 28,  b: 52  },
  { threshold: 0.42, r: 18,  g: 42,  b: 72  },
  { threshold: 0.46, r: 28,  g: 58,  b: 78  },
  { threshold: 0.48, r: 52,  g: 78,  b: 72  },
  { threshold: 0.52, r: 62,  g: 92,  b: 68  },
  { threshold: 0.58, r: 48,  g: 82,  b: 52  },
  { threshold: 0.65, r: 36,  g: 68,  b: 40  },
  { threshold: 0.72, r: 28,  g: 54,  b: 32  },
  { threshold: 0.78, r: 72,  g: 66,  b: 52  },
  { threshold: 0.84, r: 88,  g: 80,  b: 66  },
  { threshold: 0.90, r: 100, g: 94,  b: 82  },
  { threshold: 1.00, r: 140, g: 136, b: 128 },
];

function getTerrainColor(height: number): [number, number, number] {
  for (const tc of TERRAIN_COLORS) {
    if (height <= tc.threshold) return [tc.r, tc.g, tc.b];
  }
  return [140, 136, 128];
}

// ─── Terrain Generator ───

const MAP_W = 1200;
const MAP_H = 800;
const TILE_SIZE = 2;

function generateTerrain(worldSlug: string): ImageData {
  const rng = mulberry32(hashString(worldSlug));
  const noise2D = createNoise2D(rng);

  const tilesX = Math.ceil(MAP_W / TILE_SIZE);
  const tilesY = Math.ceil(MAP_H / TILE_SIZE);

  const canvas = document.createElement('canvas');
  canvas.width = MAP_W;
  canvas.height = MAP_H;
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.createImageData(MAP_W, MAP_H);
  const data = imageData.data;

  for (let ty = 0; ty < tilesY; ty++) {
    for (let tx = 0; tx < tilesX; tx++) {
      const nx = tx / tilesX;
      const ny = ty / tilesY;

      let height = 0;
      height += 0.50 * (noise2D(nx * 3.0, ny * 3.0) * 0.5 + 0.5);
      height += 0.25 * (noise2D(nx * 6.0, ny * 6.0) * 0.5 + 0.5);
      height += 0.12 * (noise2D(nx * 12.0, ny * 12.0) * 0.5 + 0.5);
      height += 0.06 * (noise2D(nx * 24.0, ny * 24.0) * 0.5 + 0.5);

      const cx = (nx - 0.5) * 2;
      const cy = (ny - 0.5) * 2;
      const distFromCenter = Math.sqrt(cx * cx + cy * cy);
      const edgeFade = Math.max(0, 1 - distFromCenter * 0.85);
      height *= edgeFade;
      height = height * 0.92 + 0.04;

      const [r, g, b] = getTerrainColor(height);

      for (let py = ty * TILE_SIZE; py < Math.min((ty + 1) * TILE_SIZE, MAP_H); py++) {
        for (let px = tx * TILE_SIZE; px < Math.min((tx + 1) * TILE_SIZE, MAP_W); px++) {
          const i = (py * MAP_W + px) * 4;
          data[i] = r;
          data[i + 1] = g;
          data[i + 2] = b;
          data[i + 3] = 255;
        }
      }
    }
  }

  return imageData;
}

// ─── Component ───

export function WorldMap({
  locations,
  allEntities,
  slug,
  worldTitle,
  highlightedEntityIds = [],
  eventInfo = null,
  mapRegions = [],
}: {
  locations: MapLocation[];
  allEntities: MapLocation[];
  slug: string;
  worldTitle: string;
  highlightedEntityIds?: string[];
  eventInfo?: EventInfo | null;
  mapRegions?: MapRegionData[];
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const terrainRef = useRef<HTMLCanvasElement | null>(null);
  const router = useRouter();
  const isHighlightMode = highlightedEntityIds.length > 0;

  // Compute initial camera position: center on highlighted entities if any
  const getInitialCamera = useCallback((): Camera => {
    if (highlightedEntityIds.length > 0) {
      const highlighted = locations.filter((l) => highlightedEntityIds.includes(l.id));
      if (highlighted.length > 0) {
        const avgX = highlighted.reduce((sum, l) => sum + (l.mapX / 100) * MAP_W, 0) / highlighted.length;
        const avgY = highlighted.reduce((sum, l) => sum + (l.mapY / 100) * MAP_H, 0) / highlighted.length;
        return { x: avgX, y: avgY, zoom: 1.5 };
      }
    }
    return { x: MAP_W / 2, y: MAP_H / 2, zoom: 1 };
  }, [highlightedEntityIds, locations]);

  const [camera, setCamera] = useState<Camera>(getInitialCamera);
  const [hoveredLocation, setHoveredLocation] = useState<MapLocation | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [canvasSize, setCanvasSize] = useState({ w: 900, h: 600 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, camX: 0, camY: 0 });
  const [terrainReady, setTerrainReady] = useState(false);
  const pulseRef = useRef(0);

  // Generate terrain on mount
  useEffect(() => {
    const offscreen = document.createElement('canvas');
    offscreen.width = MAP_W;
    offscreen.height = MAP_H;
    const ctx = offscreen.getContext('2d')!;
    const terrainData = generateTerrain(slug);
    ctx.putImageData(terrainData, 0, 0);

    const vg = ctx.createRadialGradient(MAP_W / 2, MAP_H / 2, MAP_W * 0.25, MAP_W / 2, MAP_H / 2, MAP_W * 0.65);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,0.4)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, MAP_W, MAP_H);

    terrainRef.current = offscreen;
    setTerrainReady(true);
  }, [slug]);

  // Resize observer
  useEffect(() => {
    const container = canvasRef.current?.parentElement;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    setCanvasSize({ w: rect.width, h: rect.height });

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setCanvasSize({ w: entry.contentRect.width, h: entry.contentRect.height });
      }
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  // Render loop
  useEffect(() => {
    if (!terrainReady || !canvasRef.current || !terrainRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    let animId: number;

    const render = () => {
      pulseRef.current += 0.03;
      const pulse = Math.sin(pulseRef.current) * 0.5 + 0.5;

      const { w, h } = canvasSize;
      canvas.width = w * window.devicePixelRatio;
      canvas.height = h * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

      // Clear
      ctx.fillStyle = '#040810';
      ctx.fillRect(0, 0, w, h);

      // Apply camera transform
      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.scale(camera.zoom, camera.zoom);
      ctx.translate(-camera.x, -camera.y);

      // Draw terrain
      ctx.drawImage(terrainRef.current!, 0, 0);

      // Dim terrain in highlight mode
      if (isHighlightMode) {
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(0, 0, MAP_W, MAP_H);
      }

      // Draw grid lines (subtle)
      ctx.strokeStyle = 'rgba(200,164,78,0.06)';
      ctx.lineWidth = 0.5;
      for (let gx = 0; gx <= MAP_W; gx += 100) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, MAP_H);
        ctx.stroke();
      }
      for (let gy = 0; gy <= MAP_H; gy += 100) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(MAP_W, gy);
        ctx.stroke();
      }

      // Draw map regions (territory polygons)
      for (const region of mapRegions) {
        if (region.points.length < 3) continue;
        ctx.beginPath();
        const firstPt = region.points[0];
        ctx.moveTo((firstPt.x / 100) * MAP_W, (firstPt.y / 100) * MAP_H);
        for (let i = 1; i < region.points.length; i++) {
          ctx.lineTo((region.points[i].x / 100) * MAP_W, (region.points[i].y / 100) * MAP_H);
        }
        ctx.closePath();
        ctx.fillStyle = region.color + '18';
        ctx.fill();
        ctx.strokeStyle = region.color + '50';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Region label
        const cx = region.points.reduce((s, p) => s + p.x, 0) / region.points.length;
        const cy = region.points.reduce((s, p) => s + p.y, 0) / region.points.length;
        const labelX = (cx / 100) * MAP_W;
        const labelY = (cy / 100) * MAP_H;
        ctx.fillStyle = region.color + '80';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(region.title, labelX, labelY);
        if (region.ownerTitle) {
          ctx.fillStyle = region.color + '50';
          ctx.font = '8px sans-serif';
          ctx.fillText(region.ownerTitle, labelX, labelY + 12);
        }
      }

      // Draw location markers
      for (const loc of locations) {
        const lx = (loc.mapX / 100) * MAP_W;
        const ly = (loc.mapY / 100) * MAP_H;
        const isHovered = hoveredLocation?.id === loc.id;
        const isHighlighted = highlightedEntityIds.includes(loc.id);
        const isDimmed = isHighlightMode && !isHighlighted;
        const color = ENTITY_COLORS[loc.type] || loc.accent;
        const markerSize = isHovered ? 12 : isHighlighted ? 10 : 8;

        // Save context for dimming
        ctx.save();
        if (isDimmed) {
          ctx.globalAlpha = 0.2;
        }

        // Pulsing glow ring for highlighted markers
        if (isHighlighted) {
          const ringRadius = markerSize + 8 + pulse * 6;
          const ringAlpha = 0.4 + pulse * 0.3;
          ctx.strokeStyle = `rgba(200,164,78,${ringAlpha})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(lx, ly, ringRadius, 0, Math.PI * 2);
          ctx.stroke();

          // Second outer ring
          const outerRadius = markerSize + 16 + pulse * 10;
          ctx.strokeStyle = `rgba(200,164,78,${ringAlpha * 0.4})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(lx, ly, outerRadius, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Glow
        const glowSize = isHighlighted ? markerSize * 5 : markerSize * 3;
        const glow = ctx.createRadialGradient(lx, ly, 0, lx, ly, glowSize);
        glow.addColorStop(0, (isHighlighted ? '#c8a44e' : color) + '40');
        glow.addColorStop(1, (isHighlighted ? '#c8a44e' : color) + '00');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(lx, ly, glowSize, 0, Math.PI * 2);
        ctx.fill();

        // Pulse ring for hovered
        if (isHovered) {
          ctx.strokeStyle = color + '60';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(lx, ly, markerSize + 6, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Pin shadow
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.beginPath();
        ctx.arc(lx + 1, ly + 1, markerSize, 0, Math.PI * 2);
        ctx.fill();

        // Pin body
        ctx.fillStyle = isHighlighted ? '#c8a44e' : color;
        ctx.strokeStyle = isHovered || isHighlighted ? '#fff' : 'rgba(255,255,255,0.3)';
        ctx.lineWidth = isHovered || isHighlighted ? 2 : 1;
        ctx.beginPath();
        ctx.arc(lx, ly, markerSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Inner highlight
        const innerGlow = ctx.createRadialGradient(lx - 2, ly - 2, 0, lx, ly, markerSize);
        innerGlow.addColorStop(0, 'rgba(255,255,255,0.3)');
        innerGlow.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = innerGlow;
        ctx.beginPath();
        ctx.arc(lx, ly, markerSize, 0, Math.PI * 2);
        ctx.fill();

        // Label
        const labelSize = Math.max(10, 12 / camera.zoom);
        ctx.font = `600 ${labelSize}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        const textMetrics = ctx.measureText(loc.title);
        const labelY = ly + markerSize + 6;
        const labelPadX = 6;
        const labelPadY = 3;
        ctx.fillStyle = 'rgba(6,6,8,0.8)';
        ctx.beginPath();
        ctx.roundRect(
          lx - textMetrics.width / 2 - labelPadX,
          labelY - labelPadY,
          textMetrics.width + labelPadX * 2,
          labelSize + labelPadY * 2,
          4
        );
        ctx.fill();

        ctx.strokeStyle = isHovered || isHighlighted ? (isHighlighted ? '#c8a44e80' : color + '80') : 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 0.5;
        ctx.stroke();

        ctx.fillStyle = isHovered || isHighlighted ? '#fff' : '#b0ada0';
        ctx.fillText(loc.title, lx, labelY);

        const typeLabel = ENTITY_LABELS[loc.type] || loc.type;
        ctx.font = `500 ${Math.max(8, 9 / camera.zoom)}px Inter, sans-serif`;
        ctx.fillStyle = (isHighlighted ? '#c8a44e' : color) + 'aa';
        ctx.fillText(typeLabel, lx, labelY + labelSize + 4);

        ctx.restore();
      }

      // Draw connections between nearby locations (subtle lines)
      ctx.strokeStyle = 'rgba(200,164,78,0.08)';
      ctx.lineWidth = 0.5;
      ctx.setLineDash([4, 8]);
      for (let i = 0; i < locations.length; i++) {
        for (let j = i + 1; j < locations.length; j++) {
          const a = locations[i];
          const b = locations[j];
          const ax = (a.mapX / 100) * MAP_W;
          const ay = (a.mapY / 100) * MAP_H;
          const bx = (b.mapX / 100) * MAP_W;
          const by = (b.mapY / 100) * MAP_H;
          const dist = Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2);
          if (dist < 350) {
            // In highlight mode, only show connections between highlighted entities
            if (isHighlightMode) {
              const aHighlighted = highlightedEntityIds.includes(a.id);
              const bHighlighted = highlightedEntityIds.includes(b.id);
              if (aHighlighted && bHighlighted) {
                ctx.strokeStyle = 'rgba(200,164,78,0.3)';
                ctx.lineWidth = 1;
              } else {
                ctx.strokeStyle = 'rgba(200,164,78,0.03)';
                ctx.lineWidth = 0.5;
              }
            }
            ctx.beginPath();
            ctx.moveTo(ax, ay);
            ctx.lineTo(bx, by);
            ctx.stroke();
          }
        }
      }
      ctx.setLineDash([]);

      ctx.restore();

      // Compass rose (top-right)
      const compassX = w - 60;
      const compassY = 60;
      ctx.save();
      ctx.strokeStyle = 'rgba(200,164,78,0.3)';
      ctx.fillStyle = 'rgba(200,164,78,0.6)';
      ctx.lineWidth = 1;

      ctx.beginPath();
      ctx.arc(compassX, compassY, 24, 0, Math.PI * 2);
      ctx.stroke();

      ctx.font = '600 10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('N', compassX, compassY - 32);
      ctx.fillStyle = 'rgba(200,164,78,0.3)';
      ctx.fillText('S', compassX, compassY + 32);
      ctx.fillText('E', compassX + 32, compassY);
      ctx.fillText('W', compassX - 32, compassY);

      ctx.fillStyle = 'rgba(200,164,78,0.5)';
      ctx.beginPath();
      ctx.moveTo(compassX, compassY - 18);
      ctx.lineTo(compassX - 5, compassY);
      ctx.lineTo(compassX + 5, compassY);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = 'rgba(200,164,78,0.2)';
      ctx.beginPath();
      ctx.moveTo(compassX, compassY + 18);
      ctx.lineTo(compassX - 5, compassY);
      ctx.lineTo(compassX + 5, compassY);
      ctx.closePath();
      ctx.fill();

      ctx.restore();

      // Coordinates display (bottom-left)
      const worldX = ((camera.x / MAP_W) * 100).toFixed(0);
      const worldY = ((camera.y / MAP_H) * 100).toFixed(0);
      ctx.font = '500 11px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(200,164,78,0.4)';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillText(`${worldX}, ${worldY}  zoom ${camera.zoom.toFixed(1)}x`, 16, h - 16);

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [terrainReady, canvasSize, camera, hoveredLocation, locations, slug, isHighlightMode, highlightedEntityIds]);

  // Screen coords → world coords
  const screenToWorld = useCallback(
    (screenX: number, screenY: number) => {
      const { w, h } = canvasSize;
      const wx = (screenX - w / 2) / camera.zoom + camera.x;
      const wy = (screenY - h / 2) / camera.zoom + camera.y;
      return { wx, wy };
    },
    [camera, canvasSize]
  );

  // Hit test
  const hitTest = useCallback(
    (screenX: number, screenY: number): MapLocation | null => {
      const { wx, wy } = screenToWorld(screenX, screenY);
      const hitRadius = 16 / camera.zoom;

      for (const loc of locations) {
        const lx = (loc.mapX / 100) * MAP_W;
        const ly = (loc.mapY / 100) * MAP_H;
        const dist = Math.sqrt((wx - lx) ** 2 + (wy - ly) ** 2);
        if (dist < hitRadius) return loc;
      }
      return null;
    },
    [locations, camera, screenToWorld]
  );

  // Mouse handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      setIsDragging(true);
      dragStartRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        camX: camera.x,
        camY: camera.y,
      };
    },
    [camera]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      setMousePos({ x: sx, y: sy });

      if (isDragging) {
        const dx = (sx - dragStartRef.current.x) / camera.zoom;
        const dy = (sy - dragStartRef.current.y) / camera.zoom;
        setCamera((prev) => ({
          ...prev,
          x: Math.max(0, Math.min(MAP_W, dragStartRef.current.camX - dx)),
          y: Math.max(0, Math.min(MAP_H, dragStartRef.current.camY - dy)),
        }));
      } else {
        const hit = hitTest(sx, sy);
        setHoveredLocation(hit);
        if (canvasRef.current) {
          canvasRef.current.style.cursor = hit ? 'pointer' : isDragging ? 'grabbing' : 'grab';
        }
      }
    },
    [isDragging, camera, hitTest]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      const hit = hitTest(sx, sy);
      if (hit) {
        router.push(`/worlds/${slug}/entities/${hit.slug}`);
      }
    },
    [hitTest, router, slug]
  );

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = e.deltaY > 0 ? 0.9 : 1.1;
    setCamera((prev) => ({
      ...prev,
      zoom: Math.max(0.4, Math.min(4, prev.zoom * zoomDelta)),
    }));
  }, []);

  // Touch handlers for mobile
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        setIsDragging(true);
        dragStartRef.current = {
          x: touch.clientX - rect.left,
          y: touch.clientY - rect.top,
          camX: camera.x,
          camY: camera.y,
        };
      }
    },
    [camera]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 1 && isDragging) {
        const touch = e.touches[0];
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        const sx = touch.clientX - rect.left;
        const sy = touch.clientY - rect.top;
        const dx = (sx - dragStartRef.current.x) / camera.zoom;
        const dy = (sy - dragStartRef.current.y) / camera.zoom;
        setCamera((prev) => ({
          ...prev,
          x: Math.max(0, Math.min(MAP_W, dragStartRef.current.camX - dx)),
          y: Math.max(0, Math.min(MAP_H, dragStartRef.current.camY - dy)),
        }));
      }
    },
    [isDragging, camera]
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Entity type legend items
  const entityTypes = [...new Set(locations.map((l) => l.type))];

  return (
    <div className="map-container">
      <canvas
        ref={canvasRef}
        className="map-canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleClick}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      />

      {/* Hover tooltip */}
      {hoveredLocation && !isDragging && (
        <div
          className="map-tooltip"
          style={{
            left: mousePos.x + 20,
            top: mousePos.y - 10,
          }}
        >
          <div className="map-tooltip-header">
            <span
              className="entity-dot"
              style={{ background: ENTITY_COLORS[hoveredLocation.type] || hoveredLocation.accent }}
            />
            <span className="map-tooltip-type">
              {ENTITY_LABELS[hoveredLocation.type]}
            </span>
          </div>
          <h4 className="map-tooltip-title">{hoveredLocation.title}</h4>
          <p className="map-tooltip-summary">{hoveredLocation.summary}</p>
          {hoveredLocation.tags.length > 0 && (
            <div className="map-tooltip-tags">
              {hoveredLocation.tags.slice(0, 4).map((tag) => (
                <span key={tag} className="entity-tag">{tag}</span>
              ))}
            </div>
          )}
          <div className="map-tooltip-hint">Click to view details</div>
        </div>
      )}

      {/* Event info overlay */}
      {eventInfo && (
        <div className="map-event-overlay">
          <div className="map-event-overlay-era" style={{ color: eventInfo.eraColor }}>
            {eventInfo.eraTitle} &middot; {eventInfo.dateLabel}
          </div>
          <h3 className="map-event-overlay-title">{eventInfo.title}</h3>
          <p className="map-event-overlay-summary">{eventInfo.summary}</p>
          {eventInfo.linkedEntities.length > 0 && (
            <div className="map-event-overlay-entities">
              {eventInfo.linkedEntities.map((entity) => (
                <span
                  key={entity.id}
                  className="badge"
                  style={{ borderColor: `${entity.accent}40`, color: entity.accent }}
                >
                  {entity.title}
                </span>
              ))}
            </div>
          )}
          <Link href={`/worlds/${slug}/timeline`} className="btn btn-ghost btn-sm" style={{ marginTop: 8 }}>
            &larr; Back to Timeline
          </Link>
        </div>
      )}

      {/* Legend */}
      <div className="map-legend">
        <div className="map-legend-title">{worldTitle}</div>
        {entityTypes.map((type) => (
          <div key={type} className="graph-legend-item">
            <span
              className="entity-dot"
              style={{ background: ENTITY_COLORS[type], width: 8, height: 8 }}
            />
            {ENTITY_LABELS[type]}
          </div>
        ))}
        <div className="map-legend-count">
          {locations.length} location{locations.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Controls hint */}
      <div className="map-controls">
        <span>Scroll to zoom</span>
        <span>Drag to pan</span>
        <span>Click marker for details</span>
      </div>

      {/* Minimap */}
      <div className="map-minimap">
        <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="map-minimap-svg">
          <rect
            x={camera.x - canvasSize.w / 2 / camera.zoom}
            y={camera.y - canvasSize.h / 2 / camera.zoom}
            width={canvasSize.w / camera.zoom}
            height={canvasSize.h / camera.zoom}
            fill="none"
            stroke="rgba(200,164,78,0.5)"
            strokeWidth={4}
          />
          {locations.map((loc) => (
            <circle
              key={loc.id}
              cx={(loc.mapX / 100) * MAP_W}
              cy={(loc.mapY / 100) * MAP_H}
              r={8}
              fill={highlightedEntityIds.includes(loc.id) ? '#c8a44e' : (ENTITY_COLORS[loc.type] || loc.accent)}
              opacity={isHighlightMode && !highlightedEntityIds.includes(loc.id) ? 0.2 : 1}
            />
          ))}
        </svg>
      </div>

      {/* Loading state */}
      {!terrainReady && (
        <div className="map-loading">
          <div className="spinner" />
          <p>Generating terrain...</p>
        </div>
      )}
    </div>
  );
}
