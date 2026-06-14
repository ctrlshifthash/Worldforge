'use client';

/**
 * Touch controls for mobile/tablet. Each button dispatches the SAME synthetic
 * keyboard events the game already listens for, so there are zero changes to
 * game logic and the desktop/keyboard experience is identical. The whole
 * overlay is CSS-hidden unless the device has a coarse pointer (touch).
 */

function fire(type: 'keydown' | 'keyup', key: string) {
  window.dispatchEvent(new KeyboardEvent(type, { key, bubbles: true }));
}

/** Press-and-hold (movement, attack): key stays "down" until the finger lifts. */
function HoldButton({ k, label, cls }: { k: string; label: React.ReactNode; cls?: string }) {
  return (
    <button
      type="button"
      className={`mc-btn ${cls ?? ''}`}
      aria-label={cls}
      onPointerDown={(e) => {
        e.preventDefault();
        try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* noop */ }
        fire('keydown', k);
      }}
      onPointerUp={(e) => { e.preventDefault(); fire('keyup', k); }}
      onPointerCancel={() => fire('keyup', k)}
      onLostPointerCapture={() => fire('keyup', k)}
      onContextMenu={(e) => e.preventDefault()}
    >
      {label}
    </button>
  );
}

/** Tap (interact, menus, dialogue choices): a quick down→up. */
function TapButton({ k, label, cls }: { k: string; label: React.ReactNode; cls?: string }) {
  return (
    <button
      type="button"
      className={`mc-btn ${cls ?? ''}`}
      onPointerDown={(e) => {
        e.preventDefault();
        fire('keydown', k);
        window.setTimeout(() => fire('keyup', k), 130);
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {label}
    </button>
  );
}

export function MobileControls({ isOwner }: { isOwner?: boolean }) {
  return (
    <div className="mobile-controls">
      {/* Movement D-pad (bottom-left) */}
      <div className="mc-dpad">
        <HoldButton k="w" label="▲" cls="mc-up" />
        <HoldButton k="a" label="◀" cls="mc-left" />
        <HoldButton k="d" label="▶" cls="mc-right" />
        <HoldButton k="s" label="▼" cls="mc-down" />
      </div>

      {/* Action buttons (bottom-right) */}
      <div className="mc-actions">
        <TapButton k="e" label="E" cls="mc-interact" />
        <HoldButton k=" " label="⚔" cls="mc-attack" />
      </div>

      {/* Utility + dialogue choices (top-right) */}
      <div className="mc-util">
        <TapButton k="c" label="Char" />
        {isOwner && <TapButton k="b" label="Build" />}
        <div className="mc-choices">
          <TapButton k="1" label="1" />
          <TapButton k="2" label="2" />
          <TapButton k="3" label="3" />
        </div>
      </div>
    </div>
  );
}
