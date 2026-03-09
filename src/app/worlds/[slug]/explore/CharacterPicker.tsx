'use client';

import { useEffect, useRef, useState } from 'react';
import { SELECTABLE_CHARACTERS, HUE_PRESETS, GK_FRAME, GK_COLS } from '@/lib/tileAtlas';

interface CharacterPickerProps {
  npcTilemap: HTMLImageElement;
  currentCharIndex: number;
  currentHueShift: number;
  onSelect: (charIndex: number, hueShift: number) => void;
  onClose: () => void;
}

// Individual animated character preview
function CharPreview({
  tilemap,
  charIndex,
  hueShift,
  selected,
  onClick,
  label,
}: {
  tilemap: HTMLImageElement;
  charIndex: number;
  hueShift: number;
  selected: boolean;
  onClick: () => void;
  label: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let animId: number;
    let tick = 0;

    const draw = () => {
      tick++;
      if (tick % 12 === 0) frameRef.current = (frameRef.current + 1) % GK_COLS;

      ctx.clearRect(0, 0, 64, 64);

      // Apply hue shift
      if (hueShift !== 0) {
        ctx.filter = `hue-rotate(${hueShift}deg)`;
      } else {
        ctx.filter = 'none';
      }

      const sx = frameRef.current * GK_FRAME;
      const sy = (charIndex * 4 + 0) * GK_FRAME; // direction 0 = down (facing camera)
      ctx.drawImage(tilemap, sx, sy, GK_FRAME, GK_FRAME, 16, 12, 32, 40);

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, [tilemap, charIndex, hueShift]);

  return (
    <div
      onClick={onClick}
      style={{
        cursor: 'pointer',
        textAlign: 'center',
        padding: 6,
        borderRadius: 8,
        border: selected ? '2px solid #ffd700' : '2px solid rgba(255,255,255,0.1)',
        background: selected ? 'rgba(255,215,0,0.15)' : 'rgba(255,255,255,0.05)',
        transition: 'border 0.15s, background 0.15s',
      }}
    >
      <canvas
        ref={canvasRef}
        width={64}
        height={64}
        style={{ imageRendering: 'pixelated', display: 'block', margin: '0 auto' }}
      />
      <div style={{ fontSize: 10, color: '#ccc', marginTop: 2, whiteSpace: 'nowrap' }}>{label}</div>
    </div>
  );
}

export default function CharacterPicker({
  npcTilemap,
  currentCharIndex,
  currentHueShift,
  onSelect,
  onClose,
}: CharacterPickerProps) {
  const [selectedIndex, setSelectedIndex] = useState(currentCharIndex >= 0 ? currentCharIndex : 0);
  const [hueShift, setHueShift] = useState(currentHueShift);

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
        fontFamily: '"Press Start 2P", monospace',
      }}
    >
      <div
        style={{
          background: '#1a1a2e',
          border: '2px solid #333',
          borderRadius: 12,
          padding: '24px 28px',
          maxWidth: 620,
          width: '95vw',
          maxHeight: '90vh',
          overflowY: 'auto',
          color: '#eee',
        }}
      >
        {/* Title */}
        <h2 style={{ textAlign: 'center', fontSize: 14, color: '#ffd700', margin: '0 0 16px' }}>
          Choose Your Character
        </h2>

        {/* Character grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
            gap: 6,
            marginBottom: 20,
          }}
        >
          {SELECTABLE_CHARACTERS.map((ch) => (
            <CharPreview
              key={ch.index}
              tilemap={npcTilemap}
              charIndex={ch.index}
              hueShift={hueShift}
              selected={selectedIndex === ch.index}
              onClick={() => setSelectedIndex(ch.index)}
              label={ch.label}
            />
          ))}
        </div>

        {/* Color section */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: '#aaa', marginBottom: 8 }}>Color Variant</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
            {HUE_PRESETS.map((preset) => (
              <div
                key={preset.value}
                onClick={() => setHueShift(preset.value)}
                title={preset.label}
                style={{
                  cursor: 'pointer',
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: preset.value === 0
                    ? '#888'
                    : `hsl(${preset.value}, 70%, 50%)`,
                  border: hueShift === preset.value
                    ? '3px solid #ffd700'
                    : '2px solid rgba(255,255,255,0.2)',
                  transition: 'border 0.15s',
                }}
              />
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 9, color: '#888' }}>Fine tune:</span>
            <input
              type="range"
              min={0}
              max={360}
              value={hueShift}
              onChange={(e) => setHueShift(Number(e.target.value))}
              style={{ flex: 1, accentColor: '#ffd700' }}
            />
            <span style={{ fontSize: 9, color: '#888', minWidth: 28 }}>{hueShift}</span>
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
                background: '#333',
                color: '#aaa',
                border: '1px solid #555',
                borderRadius: 6,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Cancel
            </button>
          )}
          <button
            onClick={() => onSelect(selectedIndex, hueShift)}
            style={{
              padding: '8px 24px',
              fontSize: 10,
              background: '#ffd700',
              color: '#1a1a2e',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontWeight: 'bold',
              fontFamily: 'inherit',
            }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
