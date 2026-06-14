'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { TILE_PALETTE, TILE_COLOR, WALKABLE_TILES, TILE, PLACEABLE_OBJECTS, PLACEABLE_ICON } from '@/lib/tiles';

const CELL = 14; // px per tile in the editor

type Tool = 'paint' | 'fill' | 'spawn' | 'object';

export function MapEditor({
  slug,
  worldTitle,
  initial,
  initialObjects = [],
}: {
  slug: string;
  worldTitle: string;
  initial: { width: number; height: number; tiles: number[]; spawnX: number; spawnY: number };
  initialObjects?: { tileX: number; tileY: number; itemType: string }[];
}) {
  const { width, height } = initial;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tilesRef = useRef<number[]>(initial.tiles.slice());
  const spawnRef = useRef<{ x: number; y: number }>({ x: initial.spawnX, y: initial.spawnY });
  // one object per tile, keyed "x,y" -> itemType
  const objectsRef = useRef<Map<string, string>>(new Map(initialObjects.map((o) => [`${o.tileX},${o.tileY}`, o.itemType])));
  const paintingRef = useRef(false);

  const [tileId, setTileId] = useState<number>(TILE.GRASS);
  const [objId, setObjId] = useState<string>(PLACEABLE_OBJECTS[0].id);
  const [tool, setTool] = useState<Tool>('paint');
  const [brush, setBrush] = useState(2);
  const [status, setStatus] = useState('');
  const [dirty, setDirty] = useState(false);

  // refs so the canvas handlers (bound once) read live values
  const tileIdRef = useRef(tileId); tileIdRef.current = tileId;
  const objIdRef = useRef(objId); objIdRef.current = objId;
  const toolRef = useRef(tool); toolRef.current = tool;
  const brushRef = useRef(brush); brushRef.current = brush;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const tiles = tilesRef.current;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        ctx.fillStyle = TILE_COLOR[tiles[y * width + x]] || '#000';
        ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
      }
    }
    // light grid
    ctx.strokeStyle = 'rgba(0,0,0,0.10)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= width; x++) { ctx.moveTo(x * CELL + 0.5, 0); ctx.lineTo(x * CELL + 0.5, height * CELL); }
    for (let y = 0; y <= height; y++) { ctx.moveTo(0, y * CELL + 0.5); ctx.lineTo(width * CELL, y * CELL + 0.5); }
    ctx.stroke();
    // placed objects (drawn as icons)
    ctx.font = `${CELL * 0.85}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const [key, itemType] of objectsRef.current) {
      const [ox, oy] = key.split(',').map(Number);
      ctx.fillText(PLACEABLE_ICON[itemType] || '❓', ox * CELL + CELL / 2, oy * CELL + CELL / 2 + 1);
    }
    // spawn marker
    const s = spawnRef.current;
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(s.x * CELL + CELL / 2, s.y * CELL + CELL / 2, CELL * 0.42, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#111';
    ctx.font = `bold ${CELL * 0.7}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⚑', s.x * CELL + CELL / 2, s.y * CELL + CELL / 2 + 1);
  }, [width, height]);

  useEffect(() => { draw(); }, [draw]);

  const cellAt = (e: React.PointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / (rect.width / width));
    const y = Math.floor((e.clientY - rect.top) / (rect.height / height));
    return { x, y };
  };

  const applyAt = (cx: number, cy: number) => {
    if (cx < 0 || cy < 0 || cx >= width || cy >= height) return;
    const tiles = tilesRef.current;
    const t = toolRef.current;
    if (t === 'spawn') {
      if (!WALKABLE_TILES.has(tiles[cy * width + cx])) { setStatus('Spawn must be on a walkable tile (grass/path/sand…).'); return; }
      spawnRef.current = { x: cx, y: cy };
      setStatus('');
    } else if (t === 'object') {
      const key = `${cx},${cy}`;
      if (objectsRef.current.has(key)) {
        objectsRef.current.delete(key); // click an existing object to remove it
      } else {
        if (!WALKABLE_TILES.has(tiles[cy * width + cx])) { setStatus('Objects can only go on walkable terrain.'); return; }
        objectsRef.current.set(key, objIdRef.current);
        setStatus('');
      }
    } else if (t === 'fill') {
      floodFill(tiles, width, height, cx, cy, tiles[cy * width + cx], tileIdRef.current);
    } else {
      const r = brushRef.current - 1;
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          const nx = cx + dx, ny = cy + dy;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
          tiles[ny * width + nx] = tileIdRef.current;
        }
      }
    }
    setDirty(true);
    draw();
  };

  const onDown = (e: React.PointerEvent) => {
    canvasRef.current?.setPointerCapture(e.pointerId);
    paintingRef.current = true;
    const { x, y } = cellAt(e);
    applyAt(x, y);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!paintingRef.current || toolRef.current === 'fill' || toolRef.current === 'spawn' || toolRef.current === 'object') return;
    const { x, y } = cellAt(e);
    applyAt(x, y);
  };
  const onUp = () => { paintingRef.current = false; };

  async function save() {
    setStatus('Saving…');
    try {
      const mapRes = await fetch(`/api/worlds/${slug}/map`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          width,
          height,
          tiles: tilesRef.current,
          spawnX: spawnRef.current.x,
          spawnY: spawnRef.current.y,
        }),
      });
      if (!mapRes.ok) { const d = await mapRes.json().catch(() => ({})); setStatus(d.error || 'Save failed'); return; }

      const objects = [...objectsRef.current.entries()].map(([key, itemType]) => {
        const [tileX, tileY] = key.split(',').map(Number);
        return { tileX, tileY, itemType };
      });
      const objRes = await fetch(`/api/worlds/${slug}/objects`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ objects }),
      });
      if (!objRes.ok) { const d = await objRes.json().catch(() => ({})); setStatus(d.error || 'Map saved, objects failed'); return; }

      setStatus('Saved ✓'); setDirty(false);
    } catch { setStatus('Save failed (network)'); }
  }

  function fillAll() {
    tilesRef.current = new Array(width * height).fill(tileIdRef.current);
    setDirty(true); draw();
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0d0d11', color: '#e8e8ee' }}>
      {/* Toolbar */}
      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: '#131318', borderBottom: '1px solid #26262e', padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Link href={`/worlds/${slug}`} style={{ color: '#9a9aa3', textDecoration: 'none', fontSize: 13 }}>← {worldTitle}</Link>
          <strong style={{ fontSize: 15 }}>Map Editor</strong>
          <span style={{ fontSize: 11, color: '#7a7a83' }}>{width}×{height}</span>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            {status && <span style={{ fontSize: 12, color: status.includes('✓') ? '#7ec85a' : '#e0a04a' }}>{status}</span>}
            <Link href={`/play/${slug}`} target="_blank" className="btn btn-ghost btn-sm">Play test</Link>
            <button onClick={save} className="btn btn-primary btn-sm" disabled={!dirty && status.includes('✓')}>
              {dirty ? 'Save map' : 'Saved'}
            </button>
          </div>
        </div>

        {/* Tools */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
          <ToolBtn active={tool === 'paint'} onClick={() => setTool('paint')}>🖌 Paint</ToolBtn>
          <ToolBtn active={tool === 'fill'} onClick={() => setTool('fill')}>🪣 Fill</ToolBtn>
          <ToolBtn active={tool === 'object'} onClick={() => setTool('object')}>🌳 Objects</ToolBtn>
          <ToolBtn active={tool === 'spawn'} onClick={() => setTool('spawn')}>⚑ Spawn</ToolBtn>
          <span style={{ width: 1, height: 20, background: '#2a2a32', margin: '0 4px' }} />
          <span style={{ fontSize: 11, color: '#7a7a83' }}>Brush</span>
          {[1, 2, 3].map((b) => (
            <ToolBtn key={b} active={brush === b} onClick={() => setBrush(b)}>{b}</ToolBtn>
          ))}
          <span style={{ width: 1, height: 20, background: '#2a2a32', margin: '0 4px' }} />
          <button onClick={fillAll} className="btn btn-ghost btn-sm" title="Fill the whole map with the selected tile">Fill all</button>
        </div>

        {/* Palette — terrain when painting/filling, objects when in Objects mode */}
        {tool === 'object' ? (
          <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
            {PLACEABLE_OBJECTS.map((o) => (
              <button
                key={o.id}
                onClick={() => setObjId(o.id)}
                title={o.label}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5, padding: '4px 8px', borderRadius: 6, cursor: 'pointer',
                  border: objId === o.id ? '2px solid #7ec85a' : '1px solid #2a2a32',
                  background: '#1a1a20', color: '#cfcfd6', fontSize: 11,
                }}
              >
                <span style={{ fontSize: 14 }}>{o.icon}</span>
                {o.label}
              </button>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
            {TILE_PALETTE.map((t) => (
              <button
                key={t.id}
                onClick={() => { setTileId(t.id); if (tool === 'spawn') setTool('paint'); }}
                title={t.label + (t.walkable ? '' : ' (blocks movement)')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px', borderRadius: 6, cursor: 'pointer',
                  border: tileId === t.id ? '2px solid #e8c86a' : '1px solid #2a2a32',
                  background: '#1a1a20', color: '#cfcfd6', fontSize: 11,
                }}
              >
                <span style={{ width: 14, height: 14, borderRadius: 3, background: t.color, border: '1px solid rgba(0,0,0,0.4)' }} />
                {t.label}
                {!t.walkable && <span style={{ fontSize: 9, color: '#a05a5a' }}>⛔</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Canvas */}
      <div style={{ padding: 16, overflow: 'auto' }}>
        <canvas
          ref={canvasRef}
          width={width * CELL}
          height={height * CELL}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerLeave={onUp}
          style={{ border: '1px solid #2a2a32', borderRadius: 6, cursor: tool === 'spawn' ? 'crosshair' : 'cell', touchAction: 'none', imageRendering: 'pixelated' }}
        />
        <p style={{ fontSize: 12, color: '#7a7a83', marginTop: 10, maxWidth: 720 }}>
          Pick a terrain and paint by clicking/dragging. <b>Fill</b> floods an area.
          <b> Objects</b> places trees, buildings &amp; props (click to add, click again to remove) — they
          render with the real tileset art in-game. <b>Spawn</b> sets where players start (walkable tile).
          Save, then <b>Play test</b>. Editor terrain is shown in simplified colors; in-game it uses the real tilesets.
        </p>
      </div>
    </div>
  );
}

function ToolBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '5px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 12,
        border: active ? '1px solid #e8c86a55' : '1px solid #2a2a32',
        background: active ? 'rgba(232,200,106,0.15)' : '#1a1a20',
        color: active ? '#e8c86a' : '#aaaab2',
      }}
    >
      {children}
    </button>
  );
}

function floodFill(tiles: number[], w: number, h: number, x: number, y: number, target: number, replacement: number) {
  if (target === replacement) return;
  const stack: [number, number][] = [[x, y]];
  while (stack.length) {
    const [cx, cy] = stack.pop()!;
    if (cx < 0 || cy < 0 || cx >= w || cy >= h) continue;
    const idx = cy * w + cx;
    if (tiles[idx] !== target) continue;
    tiles[idx] = replacement;
    stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
  }
}
