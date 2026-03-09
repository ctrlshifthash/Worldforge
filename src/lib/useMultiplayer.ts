'use client';

import { useEffect, useRef, useCallback } from 'react';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';

// ─── Types ───

export interface RemotePlayer {
  id: string;
  name: string;
  zone: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  dir: number;   // 0=down,1=left,2=right,3=up
  frame: number;
  charIndex: number;
  hueShift: number;
}

export interface ChatMessage {
  playerId: string;
  playerName: string;
  message: string;
  time: number;
}

// ─── Hook ───

export function useMultiplayer(
  worldSlug: string,
  playerName: string,
  charIndex: number,
  hueShift: number
) {
  const wsRef = useRef<WebSocket | null>(null);
  const playersRef = useRef<Map<string, RemotePlayer>>(new Map());
  const myIdRef = useRef('');
  const myCharIndexRef = useRef(0);
  const myHueShiftRef = useRef(0);
  const connectedRef = useRef(false);
  const chatRef = useRef<ChatMessage[]>([]);
  const onlineCountRef = useRef(0);

  // Track last sent state for throttling
  const lastSentRef = useRef({ x: 0, y: 0, dir: 0, zone: '', time: 0 });

  // Store latest charIndex/hueShift in refs so the effect doesn't re-run
  const charIndexRef = useRef(charIndex);
  const hueShiftRef = useRef(hueShift);
  charIndexRef.current = charIndex;
  hueShiftRef.current = hueShift;

  useEffect(() => {
    let ws: WebSocket;
    try {
      ws = new WebSocket(WS_URL);
    } catch {
      // WS server not running — multiplayer disabled
      return;
    }
    wsRef.current = ws;

    ws.onopen = () => {
      connectedRef.current = true;
      ws.send(JSON.stringify({
        type: 'join',
        worldSlug,
        playerName,
        zone: 'hub',
        charIndex: charIndexRef.current,
        hueShift: hueShiftRef.current,
      }));
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);

        switch (msg.type) {
          case 'welcome':
            myIdRef.current = msg.playerId;
            myCharIndexRef.current = msg.charIndex;
            myHueShiftRef.current = msg.hueShift ?? 0;
            playersRef.current.clear();
            for (const p of msg.players || []) {
              playersRef.current.set(p.id, {
                ...p,
                targetX: p.x,
                targetY: p.y,
                hueShift: p.hueShift ?? 0,
              });
            }
            onlineCountRef.current = playersRef.current.size + 1;
            break;

          case 'player_join':
            if (msg.player) {
              playersRef.current.set(msg.player.id, {
                ...msg.player,
                targetX: msg.player.x,
                targetY: msg.player.y,
                hueShift: msg.player.hueShift ?? 0,
              });
              onlineCountRef.current = playersRef.current.size + 1;
            }
            break;

          case 'player_leave':
            playersRef.current.delete(msg.playerId);
            onlineCountRef.current = playersRef.current.size + 1;
            break;

          case 'player_move': {
            const rp = playersRef.current.get(msg.playerId);
            if (rp) {
              rp.targetX = msg.x;
              rp.targetY = msg.y;
              rp.dir = msg.dir;
              rp.frame = msg.frame;
              if (msg.zone) rp.zone = msg.zone;
            }
            break;
          }

          case 'chat':
            chatRef.current.push({
              playerId: msg.playerId,
              playerName: msg.playerName,
              message: msg.message,
              time: Date.now(),
            });
            if (chatRef.current.length > 50) {
              chatRef.current = chatRef.current.slice(-50);
            }
            break;
        }
      } catch {
        // Ignore parse errors
      }
    };

    ws.onerror = () => {
      connectedRef.current = false;
    };

    ws.onclose = () => {
      connectedRef.current = false;
      playersRef.current.clear();
      onlineCountRef.current = 0;
    };

    return () => {
      ws.close();
      connectedRef.current = false;
      playersRef.current.clear();
    };
  }, [worldSlug, playerName]);

  // Send position update (throttled: max ~15/sec, only on change)
  const sendMove = useCallback((x: number, y: number, dir: number, frame: number, zone: string) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    const now = Date.now();
    const last = lastSentRef.current;

    // Throttle to 66ms intervals
    if (now - last.time < 66) return;
    // Skip if nothing changed
    if (Math.abs(last.x - x) < 0.5 && Math.abs(last.y - y) < 0.5 && last.dir === dir && last.zone === zone) return;

    lastSentRef.current = { x, y, dir, zone, time: now };
    ws.send(JSON.stringify({ type: 'move', x, y, dir, frame, zone }));
  }, []);

  const sendChat = useCallback((message: string) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({ type: 'chat', message: message.slice(0, 200) }));
  }, []);

  // Interpolate remote player positions (call each frame)
  const interpolatePlayers = useCallback((dt: number) => {
    const lerpSpeed = 10; // Higher = snappier
    for (const rp of playersRef.current.values()) {
      rp.x += (rp.targetX - rp.x) * Math.min(lerpSpeed * dt, 1);
      rp.y += (rp.targetY - rp.y) * Math.min(lerpSpeed * dt, 1);
    }
  }, []);

  return {
    playersRef,
    myIdRef,
    myCharIndexRef,
    myHueShiftRef,
    connectedRef,
    chatRef,
    onlineCountRef,
    sendMove,
    sendChat,
    interpolatePlayers,
  };
}
