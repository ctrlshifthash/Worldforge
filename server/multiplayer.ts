import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';

const PORT = Number(process.env.PORT) || 3001;

// ─── Types ───

interface PlayerState {
  id: string;
  name: string;
  zone: string;
  x: number;
  y: number;
  dir: number;   // 0=down,1=left,2=right,3=up
  frame: number;
  charIndex: number; // GuttyKreum character index (0-16)
  hueShift: number;  // 0-360 color shift
}

interface RoomPlayer {
  ws: WebSocket;
  state: PlayerState;
}

// ─── State ───

// worldSlug → Map<playerId, RoomPlayer>
const rooms = new Map<string, Map<string, RoomPlayer>>();


// ─── HTTP server (health check for Railway/Render) ───

const httpServer = createServer((req, res) => {
  // CORS headers for preflight
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  if (req.url === '/health') {
    let totalPlayers = 0;
    for (const room of rooms.values()) totalPlayers += room.size;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', rooms: rooms.size, players: totalPlayers }));
  } else {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Worldforge Multiplayer Server');
  }
});

// ─── WebSocket server (attached to HTTP server) ───

const wss = new WebSocketServer({ server: httpServer });

wss.on('connection', (ws) => {
  let playerId = crypto.randomUUID();
  let currentRoom: string | null = null;

  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw.toString());

      switch (msg.type) {
        case 'join': {
          const worldSlug = msg.worldSlug;
          if (!worldSlug || typeof worldSlug !== 'string') return;

          currentRoom = worldSlug;
          if (!rooms.has(currentRoom)) rooms.set(currentRoom, new Map());


          const room = rooms.get(currentRoom)!;

          // Use client-provided charIndex if valid (0-16), otherwise auto-assign
          let charIndex: number;
          if (typeof msg.charIndex === 'number' && msg.charIndex >= 0 && msg.charIndex <= 16) {
            charIndex = msg.charIndex;
          } else {
            const usedIndices = new Set<number>();
            for (const p of room.values()) usedIndices.add(p.state.charIndex);
            charIndex = 0;
            for (let i = 0; i < 17; i++) {
              if (!usedIndices.has(i)) { charIndex = i; break; }
            }
          }

          const hueShift = typeof msg.hueShift === 'number'
            ? Math.max(0, Math.min(360, Math.round(msg.hueShift)))
            : 0;

          const state: PlayerState = {
            id: playerId,
            name: (msg.playerName || 'Adventurer').slice(0, 20),
            zone: msg.zone || 'hub',
            x: 50 * 16 + 8,
            y: 25 * 16 + 8,
            dir: 0,
            frame: 0,
            charIndex,
            hueShift,
          };

          room.set(playerId, { ws, state });

          // Send welcome with all current players in this room
          const players = Array.from(room.values())
            .filter((p) => p.state.id !== playerId)
            .map((p) => p.state);

          send(ws, { type: 'welcome', playerId, charIndex, hueShift, players });

          // Tell others someone joined
          broadcast(currentRoom, playerId, { type: 'player_join', player: state });

          console.log(`[${worldSlug}] ${state.name} joined (${room.size} players)`);
          break;
        }

        case 'move': {
          if (!currentRoom) return;
          const room = rooms.get(currentRoom);
          if (!room) return;
          const player = room.get(playerId);
          if (!player) return;

          player.state.x = msg.x;
          player.state.y = msg.y;
          player.state.dir = msg.dir ?? 0;
          player.state.frame = msg.frame ?? 0;
          if (msg.zone) player.state.zone = msg.zone;

          broadcast(currentRoom, playerId, {
            type: 'player_move',
            playerId,
            x: msg.x,
            y: msg.y,
            dir: msg.dir ?? 0,
            frame: msg.frame ?? 0,
            zone: player.state.zone,
          });
          break;
        }

        case 'chat': {
          if (!currentRoom) return;
          const room = rooms.get(currentRoom);
          const player = room?.get(playerId);
          if (!player) return;

          const message = (msg.message || '').slice(0, 200).trim();
          if (!message) return;

          // Broadcast to everyone including sender
          broadcast(currentRoom, null, {
            type: 'chat',
            playerId,
            playerName: player.state.name,
            message,
            zone: player.state.zone,
          });
          break;
        }

        case 'emote': {
          if (!currentRoom) return;
          const room = rooms.get(currentRoom);
          const player = room?.get(playerId);
          if (!player) return;

          broadcast(currentRoom, null, {
            type: 'emote',
            playerId,
            emote: (msg.emote || '').slice(0, 20),
            zone: player.state.zone,
          });
          break;
        }

        case 'attack': {
          if (!currentRoom) return;
          const room = rooms.get(currentRoom);
          const player = room?.get(playerId);
          if (!player) return;

          broadcast(currentRoom, playerId, {
            type: 'player_attack',
            playerId,
            x: msg.x,
            y: msg.y,
            dir: msg.dir ?? 0,
            zone: player.state.zone,
          });
          break;
        }

        case 'damage': {
          if (!currentRoom) return;
          broadcast(currentRoom, null, {
            type: 'player_damage',
            targetId: msg.targetId,
            attackerId: playerId,
            attackerName: rooms.get(currentRoom)?.get(playerId)?.state.name || 'Unknown',
            amount: msg.amount ?? 0,
          });
          break;
        }

        case 'death': {
          if (!currentRoom) return;
          broadcast(currentRoom, null, {
            type: 'player_death',
            playerId,
            killerId: msg.killerId,
            killerName: msg.killerName || 'Unknown',
          });
          break;
        }
      }
    } catch {
      // Ignore malformed messages
    }
  });

  ws.on('close', () => {
    if (currentRoom) {
      const room = rooms.get(currentRoom);
      if (room) {
        const player = room.get(playerId);
        if (player) {
          console.log(`[${currentRoom}] ${player.state.name} left (${room.size - 1} players)`);
        }
        room.delete(playerId);
        broadcast(currentRoom, null, { type: 'player_leave', playerId });
        if (room.size === 0) {
          rooms.delete(currentRoom);
        }
      }
    }
  });

  ws.on('error', () => {
    // Handled by close event
  });
});

// ─── Helpers ───

function send(ws: WebSocket, msg: unknown) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(msg));
  }
}

function broadcast(roomId: string, excludeId: string | null, msg: unknown) {
  const room = rooms.get(roomId);
  if (!room) return;
  const data = JSON.stringify(msg);
  for (const [id, { ws }] of room) {
    if (id !== excludeId && ws.readyState === WebSocket.OPEN) {
      ws.send(data);
    }
  }
}

// ─── Start ───

httpServer.listen(PORT, () => {
  console.log(`Multiplayer server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

// Log stats every 30 seconds
setInterval(() => {
  let totalPlayers = 0;
  for (const room of rooms.values()) totalPlayers += room.size;
  if (totalPlayers > 0) {
    console.log(`Rooms: ${rooms.size} | Players: ${totalPlayers}`);
  }
}, 30000);
