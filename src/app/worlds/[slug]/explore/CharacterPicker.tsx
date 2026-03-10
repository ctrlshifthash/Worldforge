'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { SELECTABLE_CHARACTERS, FANTASY_SELECTABLE, HUE_PRESETS, GK_FRAME, GK_COLS } from '@/lib/tileAtlas';

interface FantasySpriteEntry {
  index: number;
  key: string;
  label: string;
  image: HTMLImageElement;
}

interface CharacterPickerProps {
  npcTilemap: HTMLImageElement;
  fantasySprites: FantasySpriteEntry[];
  currentCharIndex: number;
  currentHueShift: number;
  currentName: string;
  onSelect: (charIndex: number, hueShift: number, displayName: string) => void;
  onClose: () => void;
}

export default function CharacterPicker({
  npcTilemap,
  fantasySprites,
  currentCharIndex,
  currentHueShift,
  currentName,
  onSelect,
  onClose,
}: CharacterPickerProps) {
  const [selectedIndex, setSelectedIndex] = useState(currentCharIndex >= 0 ? currentCharIndex : 0);
  const [hueShift, setHueShift] = useState(currentHueShift);
  const [displayName, setDisplayName] = useState(currentName || '');
  const canvasRefs = useRef<Map<number, HTMLCanvasElement>>(new Map());
  const fantasyCanvasRefs = useRef<Map<number, HTMLCanvasElement>>(new Map());
  const frameRef = useRef(0);

  const setCanvasRef = useCallback((idx: number, el: HTMLCanvasElement | null) => {
    if (el) canvasRefs.current.set(idx, el);
    else canvasRefs.current.delete(idx);
  }, []);

  const setFantasyCanvasRef = useCallback((idx: number, el: HTMLCanvasElement | null) => {
    if (el) fantasyCanvasRefs.current.set(idx, el);
    else fantasyCanvasRefs.current.delete(idx);
  }, []);

  // Pre-render hue-shifted tilemap once (no per-frame filter)
  const shiftedTilemapRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const c = document.createElement('canvas');
    c.width = npcTilemap.naturalWidth;
    c.height = npcTilemap.naturalHeight;
    const ctx = c.getContext('2d')!;
    if (hueShift !== 0) ctx.filter = `hue-rotate(${hueShift}deg)`;
    ctx.drawImage(npcTilemap, 0, 0);
    shiftedTilemapRef.current = c;
  }, [npcTilemap, hueShift]);

  // Draw fantasy sprite previews when hue changes
  useEffect(() => {
    for (const fs of fantasySprites) {
      const canvas = fantasyCanvasRefs.current.get(fs.index);
      if (!canvas) continue;
      const ctx = canvas.getContext('2d');
      if (!ctx) continue;
      ctx.clearRect(0, 0, 48, 56);
      if (hueShift !== 0) ctx.filter = `hue-rotate(${hueShift}deg)`;
      const img = fs.image;
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      const scale = Math.min(40 / iw, 48 / ih);
      const dw = iw * scale;
      const dh = ih * scale;
      ctx.drawImage(img, (48 - dw) / 2, (56 - dh) / 2 + 2, dw, dh);
      ctx.filter = 'none';
    }
  }, [fantasySprites, hueShift]);

  // Single shared animation loop for GuttyKreum previews
  useEffect(() => {
    let animId: number;
    let lastTime = 0;
    const FRAME_INTERVAL = 180;

    const draw = (time: number) => {
      if (time - lastTime >= FRAME_INTERVAL) {
        lastTime = time;
        frameRef.current = (frameRef.current + 1) % GK_COLS;
        const src = shiftedTilemapRef.current;
        if (!src) { animId = requestAnimationFrame(draw); return; }

        for (const [charIndex, canvas] of canvasRefs.current) {
          const ctx = canvas.getContext('2d');
          if (!ctx) continue;
          ctx.clearRect(0, 0, 48, 48);
          const sx = frameRef.current * GK_FRAME;
          const sy = (charIndex * 4 + 0) * GK_FRAME;
          ctx.drawImage(src, sx, sy, GK_FRAME, GK_FRAME, 8, 4, 32, 40);
        }
      }

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, [npcTilemap, hueShift]);

  const isFantasySelected = selectedIndex >= 100;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0,0,0,0.88)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={(e) => { if (e.target === e.currentTarget && currentCharIndex >= 0) onClose(); }}
    >
      <div
        style={{
          background: 'linear-gradient(180deg, #1e1e3a 0%, #151528 100%)',
          border: '2px solid #3a3a5c',
          borderRadius: 14,
          padding: '20px 24px 24px',
          maxWidth: 540,
          width: '92vw',
          maxHeight: '88vh',
          overflowY: 'auto',
          color: '#eee',
          boxShadow: '0 12px 48px rgba(0,0,0,0.6)',
        }}
      >
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: 18 }}>
          <h2 style={{
            fontSize: 13,
            color: '#ffd700',
            margin: 0,
            fontFamily: '"Press Start 2P", monospace',
            letterSpacing: 1,
          }}>
            Choose Your Character
          </h2>
          <div style={{ fontSize: 10, color: '#666', marginTop: 6, fontFamily: 'Inter, sans-serif' }}>
            Press C anytime to change
          </div>
        </div>

        {/* Name input */}
        <div style={{ marginBottom: 16 }}>
          <div style={{
            fontSize: 10,
            color: '#888',
            marginBottom: 6,
            fontFamily: '"Press Start 2P", monospace',
          }}>
            Name
          </div>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value.slice(0, 20))}
            placeholder="Enter your name..."
            maxLength={20}
            style={{
              width: '100%',
              padding: '8px 12px',
              fontSize: 13,
              fontFamily: 'Inter, sans-serif',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid #3a3a5c',
              borderRadius: 6,
              color: '#eee',
              outline: 'none',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = '#ffd700')}
            onBlur={(e) => (e.currentTarget.style.borderColor = '#3a3a5c')}
            onKeyDown={(e) => e.stopPropagation()}
          />
          <div style={{ fontSize: 9, color: '#444', marginTop: 4, textAlign: 'right', fontFamily: 'Inter, sans-serif' }}>
            {displayName.length}/20
          </div>
        </div>

        {/* Section label — Townsfolk */}
        <div style={{
          fontSize: 9,
          color: '#888',
          marginBottom: 6,
          fontFamily: '"Press Start 2P", monospace',
        }}>
          Townsfolk
        </div>

        {/* Character grid — 6 columns */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gap: 6,
            marginBottom: 14,
          }}
        >
          {SELECTABLE_CHARACTERS.map((ch) => (
            <div
              key={ch.index}
              onClick={() => setSelectedIndex(ch.index)}
              style={{
                cursor: 'pointer',
                textAlign: 'center',
                padding: '6px 2px 4px',
                borderRadius: 8,
                border: selectedIndex === ch.index
                  ? '2px solid #ffd700'
                  : '2px solid transparent',
                background: selectedIndex === ch.index
                  ? 'rgba(255,215,0,0.12)'
                  : 'rgba(255,255,255,0.04)',
                transition: 'all 0.12s',
              }}
            >
              <canvas
                ref={(el) => setCanvasRef(ch.index, el)}
                width={48}
                height={48}
                style={{
                  imageRendering: 'pixelated',
                  display: 'block',
                  margin: '0 auto',
                  width: 48,
                  height: 48,
                }}
              />
              <div style={{
                fontSize: 8,
                color: selectedIndex === ch.index ? '#ffd700' : '#888',
                marginTop: 2,
                fontFamily: 'Inter, sans-serif',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {ch.label}
              </div>
            </div>
          ))}
        </div>

        {/* Fantasy Heroes section */}
        {fantasySprites.length > 0 && (
          <>
            <div style={{ height: 1, background: '#333', margin: '0 0 12px' }} />
            <div style={{
              fontSize: 9,
              color: '#c89b3c',
              marginBottom: 6,
              fontFamily: '"Press Start 2P", monospace',
            }}>
              Fantasy Heroes
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: 6,
                marginBottom: 14,
              }}
            >
              {fantasySprites.map((fs) => (
                <div
                  key={fs.index}
                  onClick={() => setSelectedIndex(fs.index)}
                  style={{
                    cursor: 'pointer',
                    textAlign: 'center',
                    padding: '6px 2px 4px',
                    borderRadius: 8,
                    border: selectedIndex === fs.index
                      ? '2px solid #c89b3c'
                      : '2px solid transparent',
                    background: selectedIndex === fs.index
                      ? 'rgba(200,155,60,0.15)'
                      : 'rgba(255,255,255,0.04)',
                    transition: 'all 0.12s',
                  }}
                >
                  <canvas
                    ref={(el) => setFantasyCanvasRef(fs.index, el)}
                    width={48}
                    height={56}
                    style={{
                      imageRendering: 'pixelated',
                      display: 'block',
                      margin: '0 auto',
                      width: 48,
                      height: 56,
                    }}
                  />
                  <div style={{
                    fontSize: 8,
                    color: selectedIndex === fs.index ? '#c89b3c' : '#888',
                    marginTop: 2,
                    fontFamily: 'Inter, sans-serif',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {fs.label}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Divider */}
        <div style={{ height: 1, background: '#333', margin: '0 0 14px' }} />

        {/* Color section */}
        <div style={{ marginBottom: 18 }}>
          <div style={{
            fontSize: 10,
            color: '#888',
            marginBottom: 8,
            fontFamily: '"Press Start 2P", monospace',
          }}>
            Color
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 10, alignItems: 'center' }}>
            {HUE_PRESETS.map((preset) => (
              <div
                key={preset.value}
                onClick={() => setHueShift(preset.value)}
                title={preset.label}
                style={{
                  cursor: 'pointer',
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  background: preset.value === 0
                    ? 'linear-gradient(135deg, #999, #666)'
                    : `hsl(${preset.value}, 65%, 45%)`,
                  border: hueShift === preset.value
                    ? '3px solid #ffd700'
                    : '2px solid rgba(255,255,255,0.15)',
                  transition: 'border 0.12s, transform 0.12s',
                  transform: hueShift === preset.value ? 'scale(1.15)' : 'scale(1)',
                  boxShadow: hueShift === preset.value ? '0 0 8px rgba(255,215,0,0.3)' : 'none',
                }}
              />
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 9, color: '#555', fontFamily: 'Inter, sans-serif' }}>Fine tune</span>
            <input
              type="range"
              min={0}
              max={360}
              value={hueShift}
              onChange={(e) => setHueShift(Number(e.target.value))}
              style={{ flex: 1, accentColor: '#ffd700', height: 4 }}
            />
            <span style={{
              fontSize: 9,
              color: '#555',
              minWidth: 24,
              textAlign: 'right',
              fontFamily: 'Inter, sans-serif',
            }}>
              {hueShift}
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          {currentCharIndex >= 0 && (
            <button
              onClick={onClose}
              style={{
                padding: '8px 20px',
                fontSize: 10,
                background: 'transparent',
                color: '#666',
                border: '1px solid #444',
                borderRadius: 6,
                cursor: 'pointer',
                fontFamily: '"Press Start 2P", monospace',
                transition: 'color 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#aaa')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#666')}
            >
              Cancel
            </button>
          )}
          <button
            onClick={() => onSelect(selectedIndex, hueShift, displayName.trim() || 'Adventurer')}
            style={{
              padding: '8px 28px',
              fontSize: 10,
              background: isFantasySelected
                ? 'linear-gradient(180deg, #c89b3c, #a07828)'
                : 'linear-gradient(180deg, #ffd700, #e6b800)',
              color: '#1a1a2e',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontWeight: 'bold',
              fontFamily: '"Press Start 2P", monospace',
              boxShadow: isFantasySelected
                ? '0 2px 8px rgba(200,155,60,0.3)'
                : '0 2px 8px rgba(255,215,0,0.25)',
              transition: 'transform 0.1s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.04)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
