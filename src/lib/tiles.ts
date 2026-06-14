// Shared terrain tile types. These ids MUST match the engine's tile rendering
// (the `T` map in WorldExplore.tsx) so painted maps render correctly in-game.

export const TILE = {
  DEEP_WATER: 0,
  WATER: 1,
  SHALLOW: 2,
  SHORE: 3,
  SAND: 4,
  GRASS: 5,
  GRASS_DARK: 6,
  FOREST: 7,
  DENSE_FOREST: 8,
  HILLS: 9,
  ROCK: 10,
  PATH: 11,
  COBBLE: 12,
} as const;

export type TileId = (typeof TILE)[keyof typeof TILE];

// Tiles a player can walk on (everything else blocks movement).
export const WALKABLE_TILES: ReadonlySet<number> = new Set([
  TILE.SHORE, TILE.SAND, TILE.GRASS, TILE.GRASS_DARK, TILE.HILLS, TILE.PATH, TILE.COBBLE,
]);

export const DEFAULT_MAP_W = 60;
export const DEFAULT_MAP_H = 45;
export const MAX_MAP_W = 100;
export const MAX_MAP_H = 75;

// A fresh blank canvas — all grass.
export function makeBlankTiles(w: number = DEFAULT_MAP_W, h: number = DEFAULT_MAP_H, fill: number = TILE.GRASS): number[] {
  return new Array(w * h).fill(fill);
}

// Editor palette: ordered, with a representative swatch color. The editor paints
// with these colors for speed/clarity; the in-game world renders the real
// tileset sprites for the same tile ids.
export const TILE_PALETTE: { id: number; label: string; color: string; walkable: boolean }[] = [
  { id: TILE.GRASS, label: 'Grass', color: '#5a8a3c', walkable: true },
  { id: TILE.GRASS_DARK, label: 'Dark Grass', color: '#3f6b2c', walkable: true },
  { id: TILE.PATH, label: 'Path', color: '#b39a6a', walkable: true },
  { id: TILE.COBBLE, label: 'Cobble', color: '#8a8a82', walkable: true },
  { id: TILE.SAND, label: 'Sand', color: '#d9c48f', walkable: true },
  { id: TILE.SHORE, label: 'Shore', color: '#c2b27a', walkable: true },
  { id: TILE.HILLS, label: 'Hills', color: '#7a8a5c', walkable: true },
  { id: TILE.SHALLOW, label: 'Shallows', color: '#5fb0c4', walkable: false },
  { id: TILE.WATER, label: 'Water', color: '#3a78b0', walkable: false },
  { id: TILE.DEEP_WATER, label: 'Deep Water', color: '#244e84', walkable: false },
  { id: TILE.FOREST, label: 'Forest', color: '#356b2c', walkable: false },
  { id: TILE.DENSE_FOREST, label: 'Dense Forest', color: '#244e1c', walkable: false },
  { id: TILE.ROCK, label: 'Rock', color: '#6a6a64', walkable: false },
];

export const TILE_COLOR: Record<number, string> = Object.fromEntries(
  TILE_PALETTE.map((t) => [t.id, t.color]),
);

// Objects placeable in the map editor. The `id` MUST match a BUILD_ITEMS id in
// the engine so the placed object renders with its real tileset sprite in-game.
// The editor shows the icon; the game draws the actual sprite.
export const PLACEABLE_OBJECTS: { id: string; label: string; icon: string }[] = [
  { id: 'oak_tree', label: 'Oak Tree', icon: '🌳' },
  { id: 'pine_tree', label: 'Pine Tree', icon: '🌲' },
  { id: 'dead_tree', label: 'Dead Tree', icon: '🥀' },
  { id: 'bush', label: 'Bush', icon: '🌿' },
  { id: 'wildflowers', label: 'Wildflowers', icon: '🌼' },
  { id: 'sunflowers', label: 'Sunflowers', icon: '🌻' },
  { id: 'mushrooms', label: 'Mushrooms', icon: '🍄' },
  { id: 'rock', label: 'Boulder', icon: '🪨' },
  { id: 'well', label: 'Water Well', icon: '⛲' },
  { id: 'lamp_post', label: 'Lamp Post', icon: '🏮' },
  { id: 'sign_post', label: 'Sign Post', icon: '🪧' },
  { id: 'campfire', label: 'Campfire', icon: '🔥' },
  { id: 'cabin', label: 'Cabin', icon: '🏠' },
  { id: 'watchtower', label: 'Watchtower', icon: '🗼' },
  { id: 'fence', label: 'Fence', icon: '🚧' },
  { id: 'wall', label: 'Stone Wall', icon: '🧱' },
  { id: 'bridge', label: 'Bridge', icon: '🌉' },
  { id: 'barrel', label: 'Barrel', icon: '🛢️' },
  { id: 'crate', label: 'Crate', icon: '📦' },
  { id: 'market_stall', label: 'Market Stall', icon: '🏪' },
  { id: 'garden', label: 'Garden', icon: '🌱' },
  { id: 'altar', label: 'Stone Altar', icon: '⛩️' },
  { id: 'war_banner', label: 'War Banner', icon: '🚩' },
  { id: 'stone_gate', label: 'Stone Gate', icon: '🚪' },
];

export const PLACEABLE_IDS: ReadonlySet<string> = new Set(PLACEABLE_OBJECTS.map((o) => o.id));
export const PLACEABLE_ICON: Record<string, string> = Object.fromEntries(
  PLACEABLE_OBJECTS.map((o) => [o.id, o.icon]),
);
