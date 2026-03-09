'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { ENTITY_COLORS } from '@/lib/utils';
import { useGameAssets, GameAssets } from './useGameAssets';
import { useMultiplayer } from '@/lib/useMultiplayer';
import CharacterPicker from './CharacterPicker';
import { createHueShiftedCanvas } from '@/lib/hueShiftCanvas';
import {
  TERRAIN_COLORS,
  COBBLESTONE_TILE,
  COBBLESTONE_GREY_TILE,
  TREE_SPRITES,
  BUSH_SPRITES,
  ROCK_SPRITES,
  GRASS_DETAIL_SPRITES,
  HOUSE_SPRITES,
  LARGE_HOUSE_SPRITES,
  MARKET_STALL,
  BARREL,
  SACK,
  CRATE,
  LOG_SPRITE,
  STUMP_SPRITE,
  PLAYER_FRAME_W,
  PLAYER_FRAME_H,
  PLAYER_WALK_FRAMES,
  PLAYER_ROWS,
  NPC_TALL_FRAME_W,
  NPC_TALL_FRAME_H,
  NPC_SMALL_FRAME_W,
  NPC_SMALL_FRAME_H,
  VEGETABLE_STALL_SPRITE,
  VILLAGE_TREE_SPRITES,
  VILLAGE_BUSH_SPRITES,
  BOULDER_SPRITES,
  BENCH_SPRITE,
  LOG_PILE_SPRITE,
  SIGN_SPRITE,
  CAVE_SPRITE,
  MUSHROOM_SPRITE,
  SHORE_ROCK_SPRITES,
  MARKET_CANOPY_SPRITES,
  BARREL_GROUP,
  FOOD_SPRITES,
  MARKET_SIGN_SPRITES,
  WELL_SPRITE,
  CAMPFIRE_SPRITE,
  LANDING_STAGE_SPRITE,
  WATER_LILY_SPRITE,
  WOODEN_FENCE_SPRITE,
  TENT_SPRITE,
  FRUIT_TREE_SPRITES,
  SIGN_POST_SPRITES,
  CRATE_PILE_SPRITE,
  FENCE_H_SPRITE,
  BRIDGE_PLANK_SPRITE,
  MARBLE_FENCE_SPRITE,
  MARBLE_PILLAR_SPRITE,
  GRASSLAND_TERRAIN_COLORS,
  GL_PINE_SPRITES,
  GL_PINE_SMALL,
  GL_VENDOR_FW,
  GL_VENDOR_FH,
  GL_ORC_W_FW,
  GL_ORC_W_FH,
  GL_ORC_W_FRAMES,
  GL_ORC_M_FW,
  GL_ORC_M_FH,
  GL_ORC_M_FRAMES,
  GL_FIRE_FW,
  GL_FIRE_FH,
  GL_FIRE_FRAMES,
  GL_SHRINE,
  GL_FLAG_FW,
  GL_FLAG_FH,
  GL_FLAG_FRAMES,
  GL_DUMMY_FW,
  GL_DUMMY_FH,
  GL_BUTTERFLY_FW,
  GL_BUTTERFLY_FH,
  GL_BUTTERFLY_FRAMES,
  GL_ANIM_LAMP_FW,
  GL_ANIM_LAMP_FH,
  GL_ANIM_LAMP_FRAMES,
  GL_CHIMNEY_FW,
  GL_CHIMNEY_FH,
  GL_CHIMNEY_FRAMES,
  GL_BIRD_FW,
  GL_BIRD_FH,
  GL_BIRD_FRAMES,
  GL_DUCK_FW,
  GL_DUCK_FH,
  GL_DUCK_FRAMES,
  GL_FROG_FW,
  GL_FROG_FH,
  GL_FROG_FRAMES,
  GL_CHEST_OPEN_FW,
  GL_CHEST_OPEN_FH,
  GL_CHEST_OPEN_FRAMES,
  GL_CHEST_CLOSE_FW,
  GL_CHEST_CLOSE_FH,
  GL_CHEST_CLOSE_FRAMES,
  GL_CAMPFIRE_SMOKE_FW,
  GL_CAMPFIRE_SMOKE_FH,
  GL_CAMPFIRE_SMOKE_FRAMES,
  GL_FLIES_FW,
  GL_FLIES_FH,
  GL_FLIES_FRAMES,
  GL_NATURE_FW,
  GL_NATURE_FH,
  GL_NATURE_FRAMES,
  GL_FLAG2_FW,
  GL_FLAG2_FH,
  GL_FLAG2_FRAMES,
  GL_ORC_W_ATK_FRAMES,
  GL_ORC_W_HURT_FRAMES,
  GL_ORC_W_DEATH_FRAMES,
  GL_ORC_M_ATK_FRAMES,
  GL_ORC_M_HURT_FRAMES,
  GL_ORC_M_DEATH_FRAMES,
  VILLAGE_TERRAIN_COLORS,
  SV_WATER_DEEP_TILE,
  SV_WATER_SHALLOW_TILE,
  SV_WATER_SHORE_TILE,
  SV_ROCK_FW,
  SV_ROCK_FH,
  SV_ROCK_FRAMES,
  SV_LILY2_FW,
  SV_LILY2_FH,
  SV_LILY2_FRAMES,
  SV_LILY3_FW,
  SV_LILY3_FH,
  SV_LILY3_FRAMES,
  SV_STONE_TILE,
  SV_WOOD_PATH_TILE,
  GK_FRAME,
  GK_COLS,
  GK_CHAR_INDEX,
  GK_DIR_ROW,
  SHEEP_FW,
  SHEEP_FH,
  SHEEP_COLS,
  WARRIOR_FW,
  WARRIOR_FH,
} from '@/lib/tileAtlas';

// ─── Types ───

interface WorldEntity {
  id: string;
  slug: string;
  title: string;
  type: string;
  summary: string;
  accent: string;
  mapX: number;
  mapY: number;
  tags: string[];
  facts: { label: string; value: string }[];
}

// Tile type IDs for the zone map
const T = {
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

type TileId = typeof T[keyof typeof T];

const TILE_ID_NAMES: Record<number, string> = {
  [T.DEEP_WATER]: 'deep_water',
  [T.WATER]: 'water',
  [T.SHALLOW]: 'shallow',
  [T.SHORE]: 'shore',
  [T.SAND]: 'sand',
  [T.GRASS]: 'grass',
  [T.GRASS_DARK]: 'grass_dark',
  [T.FOREST]: 'forest',
  [T.DENSE_FOREST]: 'dense_forest',
  [T.HILLS]: 'hills',
  [T.ROCK]: 'rock',
  [T.PATH]: 'path',
  [T.COBBLE]: 'cobblestone',
};

const WALKABLE: Set<number> = new Set([T.SHORE, T.SAND, T.GRASS, T.GRASS_DARK, T.HILLS, T.PATH, T.COBBLE]);

interface Player {
  x: number;
  y: number;
  facing: 'up' | 'down' | 'left' | 'right';
  moving: boolean;
  animFrame: number;
  animTimer: number;
}

interface PlacedEntity {
  entity: WorldEntity;
  tileX: number;
  tileY: number;
}

// Ambient NPCs drawn from new sprite packs
interface AmbientNpc {
  id: string;
  name: string;
  x: number; y: number;
  tx: number; ty: number; // target position
  charKey: string; // GK_CHAR_INDEX key (e.g. 'FemaleBaker')
  facing: 'down' | 'left' | 'right' | 'up';
  animFrame: number;
  idleTimer: number; // seconds remaining idle
  zone: 'hub' | 'grassland' | 'village';
  label?: string; // name shown on hover
}

interface AmbientSheep {
  id: string;
  x: number; y: number;
  tx: number; ty: number;
  variant: 'white' | 'brown';
  facing: 'down' | 'left' | 'right' | 'up';
  animFrame: number;
  idleTimer: number;
  zone: 'hub' | 'grassland' | 'village';
}

interface WarriorGuard {
  id: string;
  name: string;
  x: number; y: number;
  facing: 'left' | 'right';
  zone: 'hub' | 'grassland' | 'village';
}

interface AmbientSpeechState {
  text: string;
  timer: number;
  cooldown: number;
}

interface AmbientSpeaker {
  id: string;
  name: string;
  x: number;
  y: number;
  zone: 'hub' | 'grassland' | 'village';
  voice: string;
}

// ─── Constants ───

const TILE_SIZE = 32;
const PLAYER_SPEED = 5;
const INTERACT_RANGE = 3;
const ANIM_FRAME_DURATION = 0.12;
const MAX_HEALTH = 100;
const MAX_STAMINA = 100;
const AMBIENT_SPEECH_DURATION = 3.2;
const AMBIENT_SPEECH_MIN_COOLDOWN = 10;
const AMBIENT_SPEECH_MAX_COOLDOWN = 18;

const AMBIENT_SPEECH_LINES: Record<string, string[]> = {
  merchant_food: [
    'Fresh bread, still warm.',
    'Berry pies go fast today.',
    'Food keeps a builder going.',
  ],
  merchant_trade: [
    'Bring coin, leave stronger.',
    'Good tools cost less than bad luck.',
    'Trade keeps this town alive.',
  ],
  elder: [
    'A town grows one promise at a time.',
    'The north remembers careless travelers.',
    'Builders shape more than roads.',
  ],
  marina: [
    'The sea keeps all our secrets.',
    'If you see a glint, tell me first.',
    'One day I will sail farther north.',
  ],
  grandma: [
    'Soup fixes more than bruises.',
    'Sit a moment. The town can wait.',
    'Kindness grows faster than stone.',
  ],
  villager: [
    'The market feels busier every day.',
    'I heard something moved in the ruins.',
    'Someone should fix the north road.',
  ],
  baker: [
    'Flour, water, fire. The holy trinity.',
    'Nothing beats fresh bread at dawn.',
    'I trade gossip for pie slices.',
  ],
  dockhand: [
    'The tide brings work and trouble.',
    'Crates in, coin out.',
    'Storm clouds mean long nights.',
  ],
  youth: [
    'I want to see the Grasslands myself.',
    'Tom swears the sheep understand him.',
    'Every road feels like a dare.',
  ],
  traditional: [
    'Roads are safer when guards stay paid.',
    'A sturdy fence beats a sharp sword.',
    'North paths always ask for trouble.',
  ],
  maid: [
    'The square looks better when it is busy.',
    'Builders make the best customers.',
    'Someone keeps leaving muddy boots inside.',
  ],
  student: [
    'I sketch every new building I see.',
    'One good map can save a week.',
    'I want to learn from Elder Rowan.',
  ],
  elder_woman: [
    'The land listens if you slow down.',
    'Growth should feel earned.',
    'A town with no stories is just timber.',
  ],
  punk: [
    'North of here? I would bring a blade.',
    'Rules are easier when walls are tall.',
    'I only trust roads with exits.',
  ],
  student_village: [
    'Marina says the sea glows at dusk.',
    'I want to build a better dock someday.',
    'The witch knows more than she says.',
  ],
  youth_village: [
    'The market smells like fish and luck.',
    'Bandits used to scare me. Used to.',
    'I know every alley in this village.',
  ],
  shiba: ['Woof.', 'Ruff!', '*happy bark*'],
  guard: [
    'Northern Pass stays watched.',
    'Bandits hate a ready guard.',
    'Stay sharp beyond the gate.',
    'Seven orcs. Two of us. Bad odds.',
    'The shaman is the dangerous one.',
    'Shrine power could turn the tide.',
    'No one passes without our say.',
  ],
  sheep: ['Baa.', '*soft bleat*', 'Maa.'],
};

const AMBIENT_CHATTER: Array<{ a: string; b: string; lines: [string, string][] }> = [
  { a: 'food_merchant', b: 'gen_merchant', lines: [['Fish sold out again?', 'Only to the early ones.'], ['Got any maps left?', 'Enough for brave fools.']] },
  { a: 'elder', b: 'grandma', lines: [['The town grows well.', 'So long as they keep eating.']] },
  { a: 'marina', b: 'villager', lines: [['Seen anything shiny by the shore?', 'Only trouble and gulls.']] },
  { a: 'guard_north_1', b: 'guard_north_2', lines: [['Quiet watch so far.', 'Too quiet for my taste.']] },
  { a: 'village_student', b: 'village_youth', lines: [['Think the witch is watching us?', 'She is always watching us.']] },
];

function nextAmbientCooldown() {
  return AMBIENT_SPEECH_MIN_COOLDOWN + Math.random() * (AMBIENT_SPEECH_MAX_COOLDOWN - AMBIENT_SPEECH_MIN_COOLDOWN);
}

function renderAmbientSpeechBubble(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: string,
  tone: string,
) {
  ctx.font = '600 9px Inter, sans-serif';
  ctx.textAlign = 'center';
  const maxWidth = 140;
  let display = text;
  while (ctx.measureText(display).width > maxWidth && display.length > 4) {
    display = `${display.slice(0, -2)}…`;
  }
  const tm = ctx.measureText(display);
  const boxW = tm.width + 18;
  const boxH = 22;
  const bx = x - boxW / 2;
  const by = y - 34;

  ctx.fillStyle = 'rgba(6,6,8,0.88)';
  ctx.beginPath();
  ctx.roundRect(bx, by, boxW, boxH, 7);
  ctx.fill();
  ctx.strokeStyle = `${tone}66`;
  ctx.lineWidth = 1.2;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x - 5, by + boxH - 1);
  ctx.lineTo(x, by + boxH + 6);
  ctx.lineTo(x + 5, by + boxH - 1);
  ctx.closePath();
  ctx.fillStyle = 'rgba(6,6,8,0.88)';
  ctx.fill();
  ctx.strokeStyle = `${tone}66`;
  ctx.stroke();

  ctx.fillStyle = tone;
  ctx.fillText(display, x, by + 14);
}

// ─── Merchant shop ───

const MERCHANT_POS = { x: 58, y: 41 };
const MERCHANT_RANGE = 2.5;
const GL_VENDOR_POS = { x: 40, y: 47 };
const FADE_SPEED = 2.0; // 0.5s per fade direction

type ItemEffect = 'speed' | 'sight' | 'gold_find' | 'reveal' | 'stamina' | 'heal' | 'strength' | 'defense';

interface ShopItem {
  id: string;
  name: string;
  price: number;
  description: string;
  color: string;
  effect: ItemEffect;
  duration: number; // seconds, 0 = instant
  effectLabel: string; // short buff description
  healAmount?: number; // instant HP restore
}

const SHOP_ITEMS: ShopItem[] = [
  { id: 'bread', name: 'Bread', price: 5, description: 'Restores 25 HP instantly.', color: '#d4a44e', effect: 'heal', duration: 0, effectLabel: '+25 HP', healAmount: 25 },
  { id: 'apple', name: 'Apple', price: 3, description: 'Restores 15 HP instantly.', color: '#c44040', effect: 'heal', duration: 0, effectLabel: '+15 HP', healAmount: 15 },
  { id: 'potion', name: 'Elixir of Fortune', price: 15, description: 'Doubles gold found for 45s.', color: '#40c080', effect: 'gold_find', duration: 45, effectLabel: '2x Gold Find' },
  { id: 'map_frag', name: 'Map Fragment', price: 25, description: 'Reveals far-off entities on the HUD.', color: '#80a0d0', effect: 'reveal', duration: 60, effectLabel: 'Entity Radar' },
  { id: 'torch', name: 'Torch', price: 8, description: 'See further in all directions for 40s.', color: '#e8a030', effect: 'sight', duration: 40, effectLabel: 'Far Sight' },
];

interface ActiveBuff {
  effect: ItemEffect;
  label: string;
  remaining: number; // seconds left
  color: string;
}

// ─── World Building system ───

interface BuildableItem {
  id: string;
  name: string;
  cost: { wood: number; stone: number; gold: number };
  description: string;
  color: string;
  category: 'structures' | 'props' | 'decoration' | 'functional';
  spriteKey: keyof GameAssets;
  drawW: number;
  drawH: number;
  tileW: number;
  tileH: number;
  rotatable?: boolean;
  tier?: 1 | 2 | 3 | 4 | 5 | 6;
  income?: { gold?: number; wood?: number; stone?: number };
  effect?: string;
  population?: number;
  unlockMethod?: 'progression' | 'purchase';
  unlockPrice?: number;
}

/** Get effective tile/draw dimensions based on rotation (0-3). Rotations 1 & 3 swap W/H. */
function getRotatedDims(item: BuildableItem, rot: number): { tw: number; th: number; dw: number; dh: number } {
  if (rot === 1 || rot === 3) return { tw: item.tileH, th: item.tileW, dw: item.drawH, dh: item.drawW };
  return { tw: item.tileW, th: item.tileH, dw: item.drawW, dh: item.drawH };
}

// Tier info for display across HUD, help panel, and build menu
const TIER_INFO: { tier: number; name: string; color: string; req: string; nextReq: string }[] = [
  { tier: 1, name: 'Novice', color: '#a0a098', req: 'Starting tier', nextReq: 'Defeat 3 Orc Warriors at the Stronghold' },
  { tier: 2, name: 'Builder II', color: '#8ab060', req: 'Defeated 3 Orc Warriors', nextReq: 'Kill all 7 orcs in the Grassland Stronghold' },
  { tier: 3, name: 'Builder III', color: '#80b8e0', req: 'Cleared the Grassland Stronghold', nextReq: 'Open the Shrine Chest in the Grassland' },
  { tier: 4, name: 'Master Builder', color: '#d4a44e', req: 'Collected the Grassland reward', nextReq: "Complete Marina's Lost Necklace quest in the Village" },
  { tier: 5, name: 'Architect', color: '#c080d0', req: "Returned Marina's Necklace", nextReq: 'Open the reward chest at the Village waterfront' },
  { tier: 6, name: 'Worldshaper', color: '#e8c86a', req: 'Completed both zones', nextReq: '' },
];

const BUILD_ITEMS: BuildableItem[] = [
  // ── Structures ──
  { id: 'fence', name: 'Fence', category: 'structures', cost: { wood: 5, stone: 0, gold: 0 }, description: 'A short wooden fence section.', color: '#a08050', spriteKey: 'glFence', drawW: 48, drawH: 32, tileW: 1, tileH: 1, rotatable: true, tier: 1 },
  { id: 'fence_gate', name: 'Fence Gate', category: 'structures', cost: { wood: 8, stone: 0, gold: 0 }, description: 'A wooden gate to walk through.', color: '#a08050', spriteKey: 'glFenceGate', drawW: 64, drawH: 40, tileW: 2, tileH: 1, rotatable: true, tier: 2, unlockMethod: 'purchase', unlockPrice: 15 },
  { id: 'campfire', name: 'Campfire', category: 'structures', cost: { wood: 8, stone: 3, gold: 0 }, description: 'Heals nearby allies over time.', color: '#e8a030', spriteKey: 'glCampfire', drawW: 52, drawH: 48, tileW: 1, tileH: 1, tier: 3, effect: 'heal_aura', unlockMethod: 'purchase', unlockPrice: 20 },
  { id: 'barricade', name: 'Barricade', category: 'structures', cost: { wood: 10, stone: 0, gold: 0 }, description: 'A spiked wooden barricade.', color: '#8a6a40', spriteKey: 'glBarricade', drawW: 64, drawH: 40, tileW: 2, tileH: 1, rotatable: true, tier: 3 },
  { id: 'tent1', name: 'Canvas Tent', category: 'structures', cost: { wood: 12, stone: 0, gold: 5 }, description: 'A simple canvas tent. +1 population.', color: '#c8b88a', spriteKey: 'glTent1', drawW: 64, drawH: 64, tileW: 2, tileH: 2, tier: 3, population: 1 },
  { id: 'cabin', name: 'Small Cabin', category: 'structures', cost: { wood: 25, stone: 10, gold: 15 }, description: 'A small wooden cabin. +1 population.', color: '#6a8a4e', spriteKey: 'glCabin', drawW: 96, drawH: 80, tileW: 3, tileH: 2, tier: 4, population: 1 },
  { id: 'watchtower', name: 'Watchtower', category: 'structures', cost: { wood: 20, stone: 12, gold: 10 }, description: 'Reveals nearby enemies off-screen.', color: '#5a7a4a', spriteKey: 'glWatchtower', drawW: 64, drawH: 96, tileW: 2, tileH: 2, tier: 4, effect: 'reveal_enemies' },
  { id: 'wall', name: 'Stone Wall', category: 'structures', cost: { wood: 0, stone: 15, gold: 5 }, description: 'A reinforced stone wall segment.', color: '#707068', spriteKey: 'glStrongWall', drawW: 96, drawH: 48, tileW: 3, tileH: 1, rotatable: true, tier: 5 },
  { id: 'tent2', name: 'Large Tent', category: 'structures', cost: { wood: 18, stone: 0, gold: 8 }, description: 'A spacious war tent. +1 population.', color: '#906848', spriteKey: 'glTent2', drawW: 96, drawH: 72, tileW: 3, tileH: 2, tier: 5, population: 1 },
  // ── Props ──
  { id: 'barrel', name: 'Barrel', category: 'props', cost: { wood: 3, stone: 0, gold: 0 }, description: 'A sturdy wooden barrel.', color: '#8b6c3e', spriteKey: 'glBarrel', drawW: 32, drawH: 32, tileW: 1, tileH: 1, tier: 1 },
  { id: 'crate', name: 'Crate', category: 'props', cost: { wood: 3, stone: 0, gold: 0 }, description: 'A wooden supply crate.', color: '#9a7d4e', spriteKey: 'glCrate', drawW: 32, drawH: 32, tileW: 1, tileH: 1, tier: 1 },
  { id: 'wood_logs', name: 'Wood Logs', category: 'props', cost: { wood: 4, stone: 0, gold: 0 }, description: 'A stack of cut logs.', color: '#a08050', spriteKey: 'glWoodLogBig', drawW: 56, drawH: 32, tileW: 2, tileH: 1, rotatable: true, tier: 1 },
  { id: 'spikes', name: 'Spikes', category: 'props', cost: { wood: 6, stone: 2, gold: 0 }, description: 'Sharpened wooden spikes.', color: '#8a6a40', spriteKey: 'glSpike', drawW: 32, drawH: 40, tileW: 1, tileH: 1, tier: 2 },
  { id: 'table', name: 'Wooden Table', category: 'props', cost: { wood: 6, stone: 0, gold: 0 }, description: 'A rustic wooden table.', color: '#7a5c3e', spriteKey: 'glWoodenTable', drawW: 48, drawH: 36, tileW: 1, tileH: 1, rotatable: true, tier: 2 },
  { id: 'weapon_rack', name: 'Weapon Rack', category: 'props', cost: { wood: 8, stone: 0, gold: 5 }, description: 'Display your weapons proudly.', color: '#6a4a3a', spriteKey: 'glWeaponRack', drawW: 40, drawH: 48, tileW: 1, tileH: 1, rotatable: true, tier: 3, unlockMethod: 'purchase', unlockPrice: 15 },
  { id: 'well', name: 'Water Well', category: 'props', cost: { wood: 8, stone: 10, gold: 0 }, description: 'Interact to heal +15 HP.', color: '#607060', spriteKey: 'glWaterwell', drawW: 40, drawH: 48, tileW: 1, tileH: 1, tier: 3, effect: 'well_heal' },
  { id: 'bridge', name: 'Stone Bridge', category: 'props', cost: { wood: 5, stone: 15, gold: 5 }, description: 'A short stone bridge section.', color: '#707068', spriteKey: 'glStoneBridge', drawW: 64, drawH: 40, tileW: 2, tileH: 1, rotatable: true, tier: 5, unlockMethod: 'purchase', unlockPrice: 25 },
  // ── Decoration ──
  { id: 'sign_post', name: 'Sign Post', category: 'decoration', cost: { wood: 4, stone: 0, gold: 0 }, description: 'A wooden sign post.', color: '#b09060', spriteKey: 'glSign', drawW: 32, drawH: 48, tileW: 1, tileH: 1, tier: 1 },
  { id: 'pine_tree', name: 'Pine Tree', category: 'decoration', cost: { wood: 2, stone: 0, gold: 0 }, description: 'A tall evergreen pine tree.', color: '#3a6a30', spriteKey: 'glPineTree', drawW: 48, drawH: 80, tileW: 1, tileH: 1, tier: 1 },
  { id: 'bush', name: 'Bush', category: 'decoration', cost: { wood: 1, stone: 0, gold: 0 }, description: 'A leafy green bush.', color: '#4a7a40', spriteKey: 'glBush', drawW: 36, drawH: 28, tileW: 1, tileH: 1, tier: 1 },
  { id: 'wildflowers', name: 'Wildflowers', category: 'decoration', cost: { wood: 1, stone: 0, gold: 0 }, description: 'A patch of wild flowers.', color: '#c080a0', spriteKey: 'glFlower1', drawW: 32, drawH: 28, tileW: 1, tileH: 1, tier: 1 },
  { id: 'mushrooms', name: 'Red Mushrooms', category: 'decoration', cost: { wood: 1, stone: 0, gold: 0 }, description: 'A cluster of red mushrooms.', color: '#c04040', spriteKey: 'glMushroom1', drawW: 32, drawH: 28, tileW: 1, tileH: 1, tier: 1 },
  { id: 'lamp_post', name: 'Lamp Post', category: 'decoration', cost: { wood: 4, stone: 3, gold: 0 }, description: 'An oil lamp on a post.', color: '#d8b060', spriteKey: 'glLampPost', drawW: 32, drawH: 64, tileW: 1, tileH: 1, tier: 2 },
  { id: 'rock', name: 'Boulder', category: 'decoration', cost: { wood: 0, stone: 5, gold: 0 }, description: 'A large mossy boulder.', color: '#6a6a62', spriteKey: 'glRock1', drawW: 40, drawH: 36, tileW: 1, tileH: 1, tier: 2 },
  { id: 'sunflowers', name: 'Sunflowers', category: 'decoration', cost: { wood: 1, stone: 0, gold: 0 }, description: 'Bright yellow sunflowers.', color: '#d8c040', spriteKey: 'glFlower2', drawW: 32, drawH: 28, tileW: 1, tileH: 1, tier: 2 },
  { id: 'dead_tree', name: 'Dead Tree', category: 'decoration', cost: { wood: 3, stone: 0, gold: 0 }, description: 'A weathered dead tree.', color: '#6a5a40', spriteKey: 'glDeadTree', drawW: 48, drawH: 72, tileW: 1, tileH: 1, tier: 3 },
  { id: 'bone_trophy', name: 'Bone Trophy', category: 'decoration', cost: { wood: 0, stone: 5, gold: 5 }, description: 'A large bone from a fallen beast.', color: '#c8c0a0', spriteKey: 'glBoneBig', drawW: 48, drawH: 40, tileW: 1, tileH: 1, tier: 3, unlockMethod: 'purchase', unlockPrice: 15 },
  { id: 'oak_tree', name: 'Oak Tree', category: 'decoration', cost: { wood: 3, stone: 0, gold: 0 }, description: 'A broad green oak tree.', color: '#4a8a30', spriteKey: 'glTree2', drawW: 48, drawH: 80, tileW: 1, tileH: 1, tier: 4 },
  { id: 'altar', name: 'Stone Altar', category: 'decoration', cost: { wood: 0, stone: 10, gold: 15 }, description: 'Interact to cleanse and heal.', color: '#8080a0', spriteKey: 'glAltar', drawW: 48, drawH: 48, tileW: 1, tileH: 1, tier: 4, effect: 'altar_cleanse' },
  { id: 'stone_gate', name: 'Stone Gate', category: 'decoration', cost: { wood: 8, stone: 15, gold: 10 }, description: 'An imposing stone gateway.', color: '#707068', spriteKey: 'glStrongGateL', drawW: 32, drawH: 64, tileW: 1, tileH: 2, tier: 4, unlockMethod: 'purchase', unlockPrice: 25 },
  { id: 'war_banner', name: 'War Banner', category: 'decoration', cost: { wood: 5, stone: 0, gold: 3 }, description: 'A proud war banner.', color: '#c04040', spriteKey: 'glEnemyFlag', drawW: 32, drawH: 64, tileW: 1, tileH: 1, tier: 5, unlockMethod: 'purchase', unlockPrice: 10 },
  { id: 'victory_banner', name: 'Victory Banner', category: 'decoration', cost: { wood: 5, stone: 0, gold: 5 }, description: 'A banner of conquest.', color: '#4060c0', spriteKey: 'glEnemyFlag2', drawW: 32, drawH: 64, tileW: 1, tileH: 1, tier: 6, unlockMethod: 'purchase', unlockPrice: 35 },
  { id: 'dragon_fossil', name: 'Dragon Fossil', category: 'decoration', cost: { wood: 0, stone: 25, gold: 30 }, description: 'A massive fossilized dragon skull.', color: '#a09878', spriteKey: 'glDragonFossil', drawW: 96, drawH: 80, tileW: 3, tileH: 2, tier: 6, unlockMethod: 'purchase', unlockPrice: 50 },
  // ── Functional (income & utility) ──
  { id: 'market_stall', name: 'Market Stall', category: 'functional', cost: { wood: 12, stone: 4, gold: 0 }, description: 'Generates 2 gold per minute.', color: '#d8a040', spriteKey: 'vegetableStall', drawW: 64, drawH: 48, tileW: 2, tileH: 1, tier: 1, income: { gold: 2 } },
  { id: 'garden', name: 'Garden', category: 'functional', cost: { wood: 4, stone: 1, gold: 0 }, description: 'Generates 1 gold per minute.', color: '#5a9a40', spriteKey: 'glVegetation', drawW: 32, drawH: 24, tileW: 1, tileH: 1, tier: 1, income: { gold: 1 } },
  { id: 'food_stall', name: 'Food Stall', category: 'functional', cost: { wood: 6, stone: 2, gold: 0 }, description: 'Generates 1 gold per minute. +25% near inns.', color: '#c8a060', spriteKey: 'market', drawW: 48, drawH: 48, tileW: 1, tileH: 1, tier: 2, income: { gold: 1 } },
  { id: 'woodpile', name: 'Lumber Pile', category: 'functional', cost: { wood: 8, stone: 2, gold: 0 }, description: 'Generates 1 wood per minute.', color: '#8b6c3e', spriteKey: 'glWoodLogMed', drawW: 40, drawH: 28, tileW: 1, tileH: 1, tier: 2, income: { wood: 1 } },
  { id: 'stone_quarry', name: 'Stone Quarry', category: 'functional', cost: { wood: 3, stone: 10, gold: 0 }, description: 'Generates 1 stone per minute.', color: '#808078', spriteKey: 'glRock2', drawW: 40, drawH: 36, tileW: 1, tileH: 1, tier: 3, income: { stone: 1 } },
  { id: 'training_dummy', name: 'Training Dummy', category: 'functional', cost: { wood: 10, stone: 5, gold: 0 }, description: 'Interact for +20% damage buff.', color: '#a08060', spriteKey: 'glDummy', drawW: 40, drawH: 56, tileW: 1, tileH: 1, tier: 3, effect: 'training_buff' },
  { id: 'storage_chest', name: 'Storage Chest', category: 'functional', cost: { wood: 12, stone: 8, gold: 10 }, description: 'Increases resource caps by +50.', color: '#8a7040', spriteKey: 'glChestClose', drawW: 32, drawH: 32, tileW: 1, tileH: 1, tier: 3, effect: 'storage_cap', unlockMethod: 'purchase', unlockPrice: 30 },
  { id: 'lumber_yard', name: 'Lumber Yard', category: 'functional', cost: { wood: 15, stone: 5, gold: 10 }, description: 'Generates 2 wood per minute. +25% near forests.', color: '#8b6c3e', spriteKey: 'glWoodLogBig', drawW: 56, drawH: 36, tileW: 2, tileH: 1, tier: 4, income: { wood: 2 } },
  { id: 'stone_yard', name: 'Stone Yard', category: 'functional', cost: { wood: 5, stone: 18, gold: 10 }, description: 'Generates 2 stone per minute. +25% near rocks.', color: '#808078', spriteKey: 'glRock1', drawW: 40, drawH: 36, tileW: 1, tileH: 1, tier: 4, income: { stone: 2 } },
  { id: 'forge', name: 'Forge', category: 'functional', cost: { wood: 12, stone: 10, gold: 20 }, description: 'Interact for +25% dmg buff (45s, 90s cd).', color: '#c06030', spriteKey: 'glTrunk2', drawW: 40, drawH: 28, tileW: 1, tileH: 1, tier: 4, effect: 'forge_buff' },
  { id: 'inn', name: 'Inn', category: 'functional', cost: { wood: 20, stone: 10, gold: 15 }, description: 'Generates 3 gold per minute.', color: '#a08060', spriteKey: 'houses', drawW: 64, drawH: 56, tileW: 2, tileH: 1, tier: 5, income: { gold: 3 } },
  { id: 'healing_shrine', name: 'Healing Shrine', category: 'functional', cost: { wood: 10, stone: 15, gold: 20 }, description: 'Heals +3 HP/s in a 2.5 tile radius.', color: '#80a0c0', spriteKey: 'glShrine', drawW: 48, drawH: 56, tileW: 1, tileH: 1, tier: 5, effect: 'heal_shrine', unlockMethod: 'purchase', unlockPrice: 40 },
  { id: 'warehouse', name: 'Warehouse', category: 'functional', cost: { wood: 15, stone: 10, gold: 15 }, description: 'Increases all resource caps by +100.', color: '#8a7040', spriteKey: 'glTrunk1', drawW: 40, drawH: 28, tileW: 1, tileH: 1, tier: 5, effect: 'warehouse_cap' },
  { id: 'trade_wagon', name: 'Trade Wagon', category: 'functional', cost: { wood: 20, stone: 8, gold: 35 }, description: 'Generates 3 gold per minute.', color: '#b08030', spriteKey: 'glCarriage', drawW: 80, drawH: 48, tileW: 2, tileH: 1, tier: 5, income: { gold: 3 } },
  { id: 'town_hall', name: 'Town Hall', category: 'functional', cost: { wood: 30, stone: 20, gold: 40 }, description: 'Boosts all income +10% (zone-wide).', color: '#b09060', spriteKey: 'houses', drawW: 96, drawH: 80, tileW: 3, tileH: 2, tier: 6, effect: 'town_hall_boost' },
  { id: 'throne', name: 'Throne', category: 'functional', cost: { wood: 15, stone: 20, gold: 50 }, description: 'Boosts all income buildings +15%.', color: '#c8a040', spriteKey: 'glThrone', drawW: 48, drawH: 56, tileW: 1, tileH: 1, tier: 6, effect: 'throne_boost' },
  // ── Large Buildings (3×3, 4×3) ──
  { id: 'large_house', name: 'Large House', category: 'structures', cost: { wood: 30, stone: 15, gold: 20 }, description: 'A spacious house. +2 population.', color: '#7a9a5e', spriteKey: 'houses', drawW: 96, drawH: 112, tileW: 3, tileH: 3, tier: 4, population: 2 },
  { id: 'granary', name: 'Granary', category: 'functional', cost: { wood: 18, stone: 10, gold: 10 }, description: 'Increases all resource caps by +150.', color: '#9a8050', spriteKey: 'glCrate', drawW: 96, drawH: 80, tileW: 3, tileH: 2, tier: 3, effect: 'granary_cap' },
  { id: 'barracks', name: 'Barracks', category: 'functional', cost: { wood: 25, stone: 20, gold: 25 }, description: '+15% damage zone-wide. +2 population.', color: '#7a6a50', spriteKey: 'glTent2', drawW: 96, drawH: 112, tileW: 3, tileH: 3, tier: 4, effect: 'barracks_buff', population: 2 },
  { id: 'temple', name: 'Temple', category: 'functional', cost: { wood: 20, stone: 30, gold: 35 }, description: 'Passive +2 HP/s regen zone-wide.', color: '#8888b0', spriteKey: 'glShrine', drawW: 96, drawH: 112, tileW: 3, tileH: 3, tier: 5, effect: 'heal_zone', unlockMethod: 'purchase', unlockPrice: 45 },
  { id: 'inn_lodge', name: "Travelers Lodge", category: 'functional', cost: { wood: 40, stone: 20, gold: 35 }, description: '+5 gold/min, heals nearby. +3 pop.', color: '#a08868', spriteKey: 'houses', drawW: 128, drawH: 112, tileW: 4, tileH: 3, tier: 5, income: { gold: 5 }, population: 3, effect: 'heal_aura' },
  { id: 'merchant_hall', name: 'Merchant Hall', category: 'functional', cost: { wood: 35, stone: 25, gold: 40 }, description: '+25% gold income zone-wide.', color: '#c8a048', spriteKey: 'houses', drawW: 128, drawH: 112, tileW: 4, tileH: 3, tier: 5, effect: 'merchant_hall_boost', unlockMethod: 'purchase', unlockPrice: 50 },
  { id: 'manor', name: "Lord's Manor", category: 'structures', cost: { wood: 50, stone: 30, gold: 60 }, description: '+5 population, +10% all income.', color: '#8a7a60', spriteKey: 'houses', drawW: 128, drawH: 112, tileW: 4, tileH: 3, tier: 6, population: 5, effect: 'manor_boost', unlockMethod: 'purchase', unlockPrice: 60 },
];

// ── Scattered gold coins across all zones (walk-over to collect) ──
const GOLD_COINS: { id: string; zone: string; x: number; y: number; gold: number; label: string }[] = [
  // Hub coins (~30g total — enough to buy a few Tier 1 items)
  { id: 'hub_c1', zone: 'hub', x: 52, y: 25, gold: 3, label: 'Found a few coins on the path.' },
  { id: 'hub_c2', zone: 'hub', x: 60, y: 35, gold: 5, label: 'A small pouch left behind.' },
  { id: 'hub_c3', zone: 'hub', x: 38, y: 42, gold: 3, label: 'Coins glinting in the grass.' },
  { id: 'hub_c4', zone: 'hub', x: 48, y: 55, gold: 4, label: 'Someone dropped these.' },
  { id: 'hub_c5', zone: 'hub', x: 25, y: 38, gold: 3, label: 'Hidden under a bush.' },
  { id: 'hub_c6', zone: 'hub', x: 70, y: 50, gold: 5, label: 'A traveler\'s forgotten stash.' },
  { id: 'hub_c7', zone: 'hub', x: 85, y: 40, gold: 4, label: 'Tucked behind a rock.' },
  { id: 'hub_c8', zone: 'hub', x: 44, y: 70, gold: 3, label: 'Loose change near the ruins.' },
  // Grassland coins (~20g total — reward for exploring before combat)
  { id: 'gl_c1', zone: 'grassland', x: 10, y: 20, gold: 4, label: 'Old coins in the tall grass.' },
  { id: 'gl_c2', zone: 'grassland', x: 30, y: 12, gold: 5, label: 'A fallen adventurer\'s purse.' },
  { id: 'gl_c3', zone: 'grassland', x: 50, y: 35, gold: 4, label: 'Coins scattered on the trail.' },
  { id: 'gl_c4', zone: 'grassland', x: 25, y: 45, gold: 3, label: 'Glinting in the mud.' },
  { id: 'gl_c5', zone: 'grassland', x: 70, y: 18, gold: 4, label: 'Hidden near the tree roots.' },
  // Village coins (~15g total — small finds while exploring)
  { id: 'sv_c1', zone: 'village', x: 8, y: 10, gold: 3, label: 'Dropped near the fountain.' },
  { id: 'sv_c2', zone: 'village', x: 20, y: 20, gold: 4, label: 'Left on a windowsill.' },
  { id: 'sv_c3', zone: 'village', x: 30, y: 8, gold: 5, label: 'A merchant\'s loose coins.' },
  { id: 'sv_c4', zone: 'village', x: 15, y: 25, gold: 3, label: 'Shining between cobblestones.' },
  // Hidden coins — reward off-path exploration in empty areas
  { id: 'hub_c9',  zone: 'hub', x: 22, y: 60, gold: 5, label: 'Hidden in the lakeside reeds.' },
  { id: 'hub_c10', zone: 'hub', x: 100, y: 50, gold: 4, label: 'Wedged between dock planks.' },
  { id: 'hub_c11', zone: 'hub', x: 57, y: 29, gold: 3, label: 'Left by a traveler at the waystation.' },
  { id: 'gl_c6', zone: 'grassland', x: 19, y: 37, gold: 5, label: 'Shining at the pond\'s edge.' },
  { id: 'gl_c7', zone: 'grassland', x: 61, y: 29, gold: 4, label: 'Tucked under an overlook boulder.' },
  { id: 'sv_c5', zone: 'village', x: 35, y: 14, gold: 5, label: 'Hidden behind the eastern trees.' },
  { id: 'sv_c6', zone: 'village', x: 3,  y: 24, gold: 4, label: 'Washed up on the shore.' },
];

const FORAGE_SPOTS: { id: string; zone: string; x: number; y: number; resource: 'wood' | 'stone'; amount: number; label: string }[] = [
  // Hub spots (6)
  { id: 'hub_forest', zone: 'hub', x: 22, y: 30, resource: 'wood', amount: 3, label: 'Gathered wood from the forest.' },
  { id: 'hub_park', zone: 'hub', x: 45, y: 65, resource: 'wood', amount: 2, label: 'Collected fallen branches.' },
  { id: 'hub_rocks', zone: 'hub', x: 44, y: 76, resource: 'stone', amount: 3, label: 'Chipped stone from the rocky hills.' },
  { id: 'hub_river', zone: 'hub', x: 56, y: 63, resource: 'stone', amount: 2, label: 'Gathered river stones.' },
  { id: 'hub_dock_wood', zone: 'hub', x: 90, y: 48, resource: 'wood', amount: 3, label: 'Found usable timber near the docks.' },
  { id: 'hub_rubble', zone: 'hub', x: 40, y: 80, resource: 'stone', amount: 3, label: 'Gathered stone from the ruins.' },
  // Grassland spots (4)
  { id: 'gl_deadforest', zone: 'grassland', x: 20, y: 14, resource: 'wood', amount: 4, label: 'Salvaged dead wood from the forest.' },
  { id: 'gl_overlook', zone: 'grassland', x: 60, y: 29, resource: 'stone', amount: 4, label: 'Chipped stone from the rocky overlook.' },
  { id: 'gl_stream', zone: 'grassland', x: 35, y: 40, resource: 'stone', amount: 2, label: 'Collected smooth stream pebbles.' },
  { id: 'gl_logs', zone: 'grassland', x: 12, y: 32, resource: 'wood', amount: 3, label: 'Gathered logs from the clearing.' },
  // Village spots (4)
  { id: 'sv_driftwood', zone: 'village', x: 5, y: 18, resource: 'wood', amount: 2, label: 'Collected driftwood from the shore.' },
  { id: 'sv_shells', zone: 'village', x: 32, y: 22, resource: 'stone', amount: 2, label: 'Gathered shells and pebbles.' },
  { id: 'sv_crates', zone: 'village', x: 25, y: 5, resource: 'wood', amount: 3, label: 'Salvaged planks from old crates.' },
  { id: 'sv_rocks', zone: 'village', x: 12, y: 15, resource: 'stone', amount: 3, label: 'Chipped stone from the village wall.' },
  // Near new interactable structures
  { id: 'hub_hermit_wood', zone: 'hub', x: 37, y: 60, resource: 'wood', amount: 3, label: 'Gathered firewood from the hermit\'s woodpile.' },
  { id: 'hub_waystation_stone', zone: 'hub', x: 58, y: 29, resource: 'stone', amount: 2, label: 'Chipped stone from the waystation wall.' },
  { id: 'hub_coast_wood', zone: 'hub', x: 84, y: 42, resource: 'wood', amount: 2, label: 'Salvaged driftwood near the cottage.' },
];

interface PlacedWorldObject {
  id: string;
  zone: string;
  tileX: number;
  tileY: number;
  itemType: string;
  rotation: number;
  lastCollectedAt?: string;
}

// ─── Combat system ───

type OrcAIState = 'idle' | 'chase' | 'attack' | 'hurt' | 'dead';

interface OrcInstance {
  id: number;
  homeX: number;
  homeY: number;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  state: OrcAIState;
  stateTimer: number;
  facing: 'left' | 'right';
  variant: 1 | 2;
  kind: 'warrior' | 'mage';
  damage: number;
  attackCooldown: number;
  hurtTimer: number;
  deathFrame: number;
  animFrame: number;
}

interface DamageNumber {
  x: number;
  y: number;
  text: string;
  color: string;
  timer: number;
}

const ORC_AGGRO_RANGE = 4;
const ORC_ATTACK_RANGE = 1.5;
const ORC_LEASH_RANGE = 8;
const ORC_CHASE_SPEED = 2;
const ORC_ATK_COOLDOWN = 1.2;
const ORC_HURT_DURATION = 0.3;
const PLAYER_ATK_COOLDOWN = 0.5;
const PLAYER_ATK_RANGE = 1.5;
const PLAYER_ATK_DAMAGE = 15;

function initOrcs(): OrcInstance[] {
  return [
    { id: 0, homeX: 35, homeY: 14, x: 35, y: 14, hp: 60, maxHp: 60, state: 'idle', stateTimer: 0, facing: 'left',  variant: 1, kind: 'warrior', damage: 8,  attackCooldown: 0.2, hurtTimer: 0, deathFrame: 0, animFrame: 0 },
    { id: 1, homeX: 45, homeY: 14, x: 45, y: 14, hp: 60, maxHp: 60, state: 'idle', stateTimer: 0, facing: 'right', variant: 2, kind: 'warrior', damage: 8,  attackCooldown: 0.5, hurtTimer: 0, deathFrame: 0, animFrame: 0 },
    { id: 2, homeX: 37, homeY: 17, x: 37, y: 17, hp: 60, maxHp: 60, state: 'idle', stateTimer: 0, facing: 'left',  variant: 1, kind: 'warrior', damage: 8,  attackCooldown: 0.8, hurtTimer: 0, deathFrame: 0, animFrame: 0 },
    { id: 3, homeX: 43, homeY: 17, x: 43, y: 17, hp: 60, maxHp: 60, state: 'idle', stateTimer: 0, facing: 'right', variant: 2, kind: 'warrior', damage: 8,  attackCooldown: 0.3, hurtTimer: 0, deathFrame: 0, animFrame: 0 },
    { id: 4, homeX: 33, homeY: 12, x: 33, y: 12, hp: 60, maxHp: 60, state: 'idle', stateTimer: 0, facing: 'left',  variant: 2, kind: 'warrior', damage: 10, attackCooldown: 0.6, hurtTimer: 0, deathFrame: 0, animFrame: 0 },
    { id: 5, homeX: 47, homeY: 12, x: 47, y: 12, hp: 60, maxHp: 60, state: 'idle', stateTimer: 0, facing: 'right', variant: 1, kind: 'warrior', damage: 10, attackCooldown: 0.4, hurtTimer: 0, deathFrame: 0, animFrame: 0 },
    { id: 6, homeX: 40, homeY: 10, x: 40, y: 10, hp: 90, maxHp: 90, state: 'idle', stateTimer: 0, facing: 'left',  variant: 1, kind: 'mage',    damage: 12, attackCooldown: 0.1, hurtTimer: 0, deathFrame: 0, animFrame: 0 },
  ];
}

const GL_SHOP_ITEMS: ShopItem[] = [
  { id: 'health_pot', name: 'Health Potion', price: 10, description: 'Restores 30 HP instantly.', color: '#c04040', effect: 'heal', duration: 0, effectLabel: '+30 HP', healAmount: 30 },
  { id: 'str_tonic', name: 'Strength Tonic', price: 20, description: '+50% melee damage for 30s.', color: '#d08030', effect: 'strength', duration: 30, effectLabel: '+50% Damage' },
  { id: 'iron_shield', name: 'Iron Shield', price: 25, description: '-30% damage taken for 45s.', color: '#6080b0', effect: 'defense', duration: 45, effectLabel: '-30% Damage' },
];

// ─── Summer Village zone ───

const SV_W = 40;
const SV_H = 30;

interface VillageNPC {
  id: string;
  x: number;
  y: number;
  name: string;
  spriteKey: 'oldMan' | 'oldWoman' | 'youngMan' | 'youngWoman' | 'merchant' | 'merchantGeneral';
  facing: 'down' | 'left' | 'right' | 'up';
  kind: 'tall' | 'small';
  animFrame: number;
  patrolPath: { x: number; y: number }[] | null;
  patrolIdx: number;
  patrolTimer: number;
}

function initVillageNPCs(): VillageNPC[] {
  return [
    { id: 'food_merchant', x: 26, y: 9, name: 'Fiona', spriteKey: 'merchant', facing: 'down', kind: 'small', animFrame: 0, patrolPath: null, patrolIdx: 0, patrolTimer: 0 },
    { id: 'gen_merchant', x: 30, y: 9, name: 'Gerald', spriteKey: 'merchantGeneral', facing: 'down', kind: 'small', animFrame: 0, patrolPath: null, patrolIdx: 0, patrolTimer: 0 },
    { id: 'elder', x: 10, y: 5, name: 'Elder Rowan', spriteKey: 'oldMan', facing: 'right', kind: 'tall', animFrame: 0, patrolPath: null, patrolIdx: 0, patrolTimer: 0 },
    { id: 'marina', x: 20, y: 7, name: 'Marina', spriteKey: 'youngWoman', facing: 'down', kind: 'tall', animFrame: 0, patrolPath: null, patrolIdx: 0, patrolTimer: 0 },
    { id: 'villager', x: 15, y: 11, name: 'Tom', spriteKey: 'youngMan', facing: 'right', kind: 'tall', animFrame: 0, patrolPath: [{ x: 15, y: 11 }, { x: 22, y: 11 }, { x: 22, y: 14 }, { x: 15, y: 14 }], patrolIdx: 0, patrolTimer: 0 },
    { id: 'grandma', x: 8, y: 3, name: 'Nana Rose', spriteKey: 'oldWoman', facing: 'down', kind: 'tall', animFrame: 0, patrolPath: null, patrolIdx: 0, patrolTimer: 0 },
  ];
}

const SV_FOOD_SHOP_ITEMS: ShopItem[] = [
  { id: 'sv_bread', name: 'Bread', price: 5, description: 'Restores 10 HP instantly.', color: '#d4a44e', effect: 'heal', duration: 0, effectLabel: '+10 HP', healAmount: 10 },
  { id: 'sv_fish', name: 'Grilled Fish', price: 12, description: 'Restores 25 HP instantly.', color: '#60a8c0', effect: 'heal', duration: 0, effectLabel: '+25 HP', healAmount: 25 },
  { id: 'sv_pie', name: 'Berry Pie', price: 20, description: 'Restores 40 HP instantly.', color: '#a04080', effect: 'heal', duration: 0, effectLabel: '+40 HP', healAmount: 40 },
];

const SV_GEN_SHOP_ITEMS: ShopItem[] = [
  { id: 'sv_map', name: 'Map Scroll', price: 15, description: 'Reveals all POI labels for 60s.', color: '#c0a060', effect: 'reveal', duration: 60, effectLabel: 'POI Reveal' },
  { id: 'sv_charm', name: 'Lucky Charm', price: 25, description: '+25% gold drops for 60s.', color: '#d0c040', effect: 'gold_find', duration: 60, effectLabel: '+25% Gold' },
  { id: 'sv_pack', name: "Traveler's Pack", price: 18, description: '+15 HP and +10% speed for 30s.', color: '#80a060', effect: 'speed', duration: 30, effectLabel: '+Speed', healAmount: 15 },
];

// Witch NPC — fortune teller in village
const SV_WITCH_POS = { x: 5, y: 22 };
const SV_WITCH_RANGE = 2.5;
const SV_WITCH_FORTUNES = [
  "I see a hermit's dwelling west of the hub lake... a jar of gold sits untouched on the shelf.",
  "The grassland stream hides smooth stones of value. Walk its banks and look carefully.",
  "A ruined cart in the northern grasslands holds a coin pouch. The previous owner won't be needing it.",
  "The dark cave entrance... something glints just inside. An explorer's stash, long forgotten.",
  "Search near the village well for something that sparkles. Marina might know more.",
  "Build beyond twenty structures and the land itself will celebrate your name with bounty.",
  "The ancient ruins drain life from the reckless \u2014 but the scholar Oswald knows their true purpose.",
];
const SV_WITCH_SHOP: ShopItem[] = [
  { id: 'witch_shield', name: 'Barrier Hex', price: 30, description: '-30% damage taken for 60s.', color: '#9060c0', effect: 'defense', duration: 60, effectLabel: '-30% Dmg Taken' },
  { id: 'witch_sight', name: 'Third Eye', price: 20, description: 'Reveals all entities for 90s.', color: '#60c0a0', effect: 'reveal', duration: 90, effectLabel: 'All-Seeing' },
  { id: 'witch_vigor', name: 'Vigor Brew', price: 15, description: 'Restores 50 HP instantly.', color: '#c06080', effect: 'heal', duration: 0, effectLabel: '+50 HP', healAmount: 50 },
];

// Necklace quest search spots (tile coords)
const SV_SEARCH_SPOTS = [
  { x: 34, y: 19, label: 'Waterfront rocks' },
  { x: 18, y: 7, label: 'Near the well' },
  { x: 13, y: 3, label: 'Behind the house' },
];
const SV_NECKLACE_SPOT = 2; // behind the house

// ─── Village wildlife ───

type AnimalKind = 'duck' | 'frog' | 'bird' | 'butterfly';
type AnimalState = 'idle' | 'wander' | 'flee' | 'dead';

interface VillageAnimal {
  id: number;
  kind: AnimalKind;
  homeX: number; homeY: number;
  x: number; y: number;
  hp: number; maxHp: number;
  state: AnimalState;
  stateTimer: number;
  facing: 'left' | 'right';
  animFrame: number;
  wanderTarget: { x: number; y: number } | null;
  respawnTimer: number;
  loot: number;
  speed: number;
  fleeSpeed: number;
}

const SV_ANIMAL_FLEE_RANGE = 3;
const SV_ANIMAL_FLEE_DURATION = 2.5;
const SV_ANIMAL_RESPAWN_TIME = 30;
const SV_ANIMAL_WANDER_PAUSE = 3;

function makeAnimal(id: number, kind: AnimalKind, x: number, y: number): VillageAnimal {
  const stats: Record<AnimalKind, { hp: number; speed: number; fleeSpeed: number; loot: number }> = {
    duck:      { hp: 8,  speed: 1.0, fleeSpeed: 2.0, loot: 3 },
    frog:      { hp: 5,  speed: 0.6, fleeSpeed: 1.5, loot: 2 },
    bird:      { hp: 6,  speed: 2.0, fleeSpeed: 3.5, loot: 3 },
    butterfly: { hp: 3,  speed: 1.5, fleeSpeed: 2.5, loot: 1 },
  };
  const s = stats[kind];
  return {
    id, kind, homeX: x, homeY: y, x, y,
    hp: s.hp, maxHp: s.hp,
    state: 'idle', stateTimer: Math.random() * SV_ANIMAL_WANDER_PAUSE,
    facing: Math.random() > 0.5 ? 'right' : 'left',
    animFrame: Math.random() * 10,
    wanderTarget: null, respawnTimer: 0,
    loot: s.loot, speed: s.speed, fleeSpeed: s.fleeSpeed,
  };
}

function initVillageAnimals(): VillageAnimal[] {
  return [
    // Ducks — waterfront shore
    makeAnimal(0, 'duck', 16, 21), makeAnimal(1, 'duck', 24, 22), makeAnimal(2, 'duck', 30, 21),
    // Frogs — near water edge
    makeAnimal(3, 'frog', 12, 23), makeAnimal(4, 'frog', 28, 23), makeAnimal(5, 'frog', 20, 22),
    // Birds — trees/nature corner
    makeAnimal(6, 'bird', 34, 4), makeAnimal(7, 'bird', 6, 6), makeAnimal(8, 'bird', 28, 3),
    // Butterflies — flowers/village square
    makeAnimal(9, 'butterfly', 18, 10), makeAnimal(10, 'butterfly', 25, 12), makeAnimal(11, 'butterfly', 14, 8),
  ];
}

// ─── Village bandits (reuse OrcInstance) ───

const SV_BANDIT_AGGRO = 5;
const SV_BANDIT_ATTACK_RANGE = 1.5;
const SV_BANDIT_LEASH = 8;
const SV_BANDIT_CHASE_SPEED = 2.2;
const SV_BANDIT_ATK_COOLDOWN = 1.0;

function initVillageBandits(): OrcInstance[] {
  return [
    // East forest edge — 2 warriors
    { id: 100, homeX: 36, homeY: 16, x: 36, y: 16, hp: 50, maxHp: 50, state: 'idle', stateTimer: 0, facing: 'left',  variant: 2, kind: 'warrior', damage: 7, attackCooldown: 0.3, hurtTimer: 0, deathFrame: 0, animFrame: 0 },
    { id: 101, homeX: 34, homeY: 19, x: 34, y: 19, hp: 50, maxHp: 50, state: 'idle', stateTimer: 0, facing: 'left',  variant: 1, kind: 'warrior', damage: 7, attackCooldown: 0.6, hurtTimer: 0, deathFrame: 0, animFrame: 0 },
    // North forest edge — 1 warrior
    { id: 102, homeX: 20, homeY: 2, x: 20, y: 2, hp: 50, maxHp: 50, state: 'idle', stateTimer: 0, facing: 'right', variant: 2, kind: 'warrior', damage: 8, attackCooldown: 0.4, hurtTimer: 0, deathFrame: 0, animFrame: 0 },
    // West entry — 1 mage (boss-like)
    { id: 103, homeX: 5, homeY: 16, x: 5, y: 16, hp: 70, maxHp: 70, state: 'idle', stateTimer: 0, facing: 'right', variant: 1, kind: 'mage', damage: 10, attackCooldown: 0.2, hurtTimer: 0, deathFrame: 0, animFrame: 0 },
  ];
}

// ─── Zone-based world: 140 × 105 ───

const W = 140;
const H = 105;

interface ZoneInfo {
  name: string;
  cx: number; cy: number;
  rx: number; ry: number;
}

const ZONES: ZoneInfo[] = [
  { name: 'Town Square', cx: 55, cy: 42, rx: 7, ry: 5 },
  { name: 'Western Forest', cx: 14, cy: 30, rx: 14, ry: 12 },
  { name: 'Forest Clearing', cx: 22, cy: 30, rx: 5, ry: 4 },
  { name: 'Northern Highlands', cx: 58, cy: 10, rx: 12, ry: 8 },
  { name: 'Ancient Ruins', cx: 42, cy: 78, rx: 10, ry: 8 },
  { name: 'Lakeshore', cx: 24, cy: 64, rx: 12, ry: 10 },
  { name: 'Docks', cx: 96, cy: 42, rx: 5, ry: 4 },
  { name: 'Eastern Shore', cx: 105, cy: 45, rx: 15, ry: 40 },
  { name: 'Lakeside Shrine', cx: 28, cy: 62, rx: 3, ry: 2 },
  { name: 'Farmstead', cx: 55, cy: 62, rx: 5, ry: 4 },
  { name: 'Harbor', cx: 96, cy: 48, rx: 4, ry: 4 },
];

function ellipseDist(x: number, y: number, cx: number, cy: number, rx: number, ry: number): number {
  return Math.sqrt(((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2);
}

function getZoneName(x: number, y: number): string {
  let best = '';
  let bestD = Infinity;
  for (const z of ZONES) {
    const d = ellipseDist(x, y, z.cx, z.cy, z.rx, z.ry);
    if (d < 1.0 && d < bestD) { bestD = d; best = z.name; }
  }
  return best || 'Wilderness';
}

function getGrasslandZoneName(x: number, y: number): string {
  if (ellipseDist(x, y, 40, 12, 9, 6) < 0.9) return 'Orc Stronghold';
  if (ellipseDist(x, y, 40, 47, 5, 4) < 0.8) return 'Vendor Camp';
  if (ellipseDist(x, y, 60, 28, 4, 3) < 0.9) return 'Rocky Overlook';
  if (ellipseDist(x, y, 20, 32, 4, 3) < 0.8) return 'Forest Clearing';
  if (ellipseDist(x, y, 62, 22, 4, 3) < 0.9) return 'Dark Cave';
  if (ellipseDist(x, y, 18, 8, 4, 3) < 0.9) return 'Ruined Cart';
  const scy = streamCenterY(x);
  if (Math.abs(y - scy) < 3 && x > 10 && x < 70) return 'Stream Crossing';
  if (x < 18) return 'Pine Forest';
  if (x > 55) return 'Rocky Hills';
  if (ellipseDist(x, y, 18, 38, 4, 3) < 1.0) return 'Frog Pond';
  return 'Northern Grasslands';
}

function computeTile(x: number, y: number): TileId {
  const h = tileHash(x, y);

  // East coast — curved shoreline
  const coastX = 100 + Math.sin(y * 0.15) * 4 + Math.cos(y * 0.07 + 2) * 3;
  const cd = x - coastX;
  if (cd > 10) return T.DEEP_WATER;
  if (cd > 7) return T.WATER;
  if (cd > 4) return T.SHALLOW;
  if (cd > 2) return T.SHORE;
  if (cd > 0) return T.SAND;

  // Lake (southwest)
  const ld = ellipseDist(x, y, 24, 64, 9, 7);
  if (ld < 0.45) return T.DEEP_WATER;
  if (ld < 0.65) return T.WATER;
  if (ld < 0.8) return T.SHALLOW;
  if (ld < 0.9) return T.SHORE;
  if (ld < 1.0) return T.SAND;

  // Northern Highlands
  const hd = ellipseDist(x, y, 58, 10, 12, 8);
  if (hd < 0.35) return h < 0.3 ? T.ROCK : T.HILLS;
  if (hd < 0.65) return T.HILLS;
  if (hd < 0.85) return h < 0.3 ? T.HILLS : T.GRASS_DARK;

  // Western Forest — with clearing
  const clr = ellipseDist(x, y, 22, 30, 5, 4);
  if (clr < 0.7) return T.GRASS_DARK; // walkable clearing
  const fd = ellipseDist(x, y, 14, 30, 14, 12);
  if (fd < 0.3) return h < 0.35 ? T.DENSE_FOREST : T.FOREST;
  if (fd < 0.55) return h < 0.4 ? T.FOREST : T.GRASS_DARK;
  if (fd < 0.8) return h < 0.15 ? T.FOREST : T.GRASS_DARK;

  // Ancient Ruins (south)
  const rd = ellipseDist(x, y, 42, 78, 10, 8);
  if (rd < 0.35) return h < 0.3 ? T.ROCK : T.HILLS;
  if (rd < 0.6) return T.HILLS;
  if (rd < 0.85) return h < 0.3 ? T.HILLS : T.GRASS_DARK;

  // World borders (N, S, W edges — east is coast)
  const borderN = y / 4;
  const borderS = (H - 1 - y) / 4;
  const borderW = x / 4;
  const borderMin = Math.min(borderN, borderS, borderW);
  if (borderMin < 0.6) return T.DENSE_FOREST;
  if (borderMin < 1.2) return h < 0.4 ? T.DENSE_FOREST : T.FOREST;
  if (borderMin < 1.8) return h < 0.3 ? T.FOREST : T.GRASS_DARK;

  // Default grass with variation
  if (h < 0.12) return T.GRASS_DARK;
  return T.GRASS;
}

function carvePath(map: TileId[][], x1: number, y1: number, x2: number, y2: number, width: number) {
  const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
  for (let i = 0; i <= steps; i++) {
    const t = steps > 0 ? i / steps : 0;
    const cx = Math.round(x1 + (x2 - x1) * t);
    const cy = Math.round(y1 + (y2 - y1) * t);
    for (let dy = -width; dy <= width; dy++) {
      for (let dx = -width; dx <= width; dx++) {
        if (dx * dx + dy * dy > (width + 0.5) * (width + 0.5)) continue;
        const tx = cx + dx, ty = cy + dy;
        if (tx >= 0 && tx < W && ty >= 0 && ty < H) {
          const tile = map[ty][tx];
          if (tile !== T.DEEP_WATER && tile !== T.WATER && tile !== T.SHALLOW && tile !== T.SHORE) {
            map[ty][tx] = T.PATH;
          }
        }
      }
    }
  }
}

function buildWorldMap(): TileId[][] {
  // Base terrain from zones
  const map: TileId[][] = [];
  for (let y = 0; y < H; y++) {
    map[y] = [];
    for (let x = 0; x < W; x++) {
      map[y][x] = computeTile(x, y);
    }
  }

  // Carve roads connecting areas
  carvePath(map, 55, 42, 28, 35, 1); // Town → Forest edge
  carvePath(map, 28, 35, 22, 30, 0); // Forest edge → Clearing
  carvePath(map, 55, 42, 56, 15, 1); // Town → Highlands
  carvePath(map, 55, 42, 95, 42, 1); // Town → Coast / Docks
  carvePath(map, 55, 42, 45, 72, 1); // Town → Ruins
  carvePath(map, 48, 56, 30, 62, 0); // Branch toward lake
  carvePath(map, 55, 48, 55, 62, 0); // Town south → Farmstead
  carvePath(map, 96, 45, 96, 52, 0); // Docks → Harbor south

  // Paint town cobblestone
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const d = ellipseDist(x, y, 55, 42, 6, 5);
      if (d < 0.9) {
        const tile = map[y][x];
        if (tile !== T.DEEP_WATER && tile !== T.WATER && tile !== T.SHALLOW) {
          map[y][x] = T.COBBLE;
        }
      }
    }
  }

  // Paint docks cobblestone
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const d = ellipseDist(x, y, 96, 42, 4, 3.5);
      if (d < 0.9) {
        const tile = map[y][x];
        if (tile !== T.DEEP_WATER && tile !== T.WATER && tile !== T.SHALLOW && tile !== T.SHORE) {
          map[y][x] = T.COBBLE;
        }
      }
    }
  }

  // Farmstead cobblestone
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const d = ellipseDist(x, y, 55, 62, 4, 3);
      if (d < 0.75) {
        const tile = map[y][x];
        if (tile !== T.DEEP_WATER && tile !== T.WATER && tile !== T.SHALLOW) {
          map[y][x] = T.COBBLE;
        }
      }
    }
  }

  // Harbor cobblestone (south extension of docks)
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const d = ellipseDist(x, y, 96, 48, 3, 3);
      if (d < 0.8) {
        const tile = map[y][x];
        if (tile !== T.DEEP_WATER && tile !== T.WATER && tile !== T.SHALLOW && tile !== T.SHORE) {
          map[y][x] = T.COBBLE;
        }
      }
    }
  }

  // Shrine island in the lake — small 3×3 island with sand perimeter
  for (let iy = 61; iy <= 63; iy++) {
    for (let ix = 27; ix <= 29; ix++) {
      map[iy][ix] = (ix === 28 && iy === 62) ? T.SAND : T.SHORE;
    }
  }
  // Bridge causeway from island east edge to lake shore
  map[62][30] = T.PATH;
  map[62][31] = T.PATH;

  return map;
}

// ─── Deterministic hash ───

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) || 1;
}

function tileHash(x: number, y: number): number {
  let h = x * 374761393 + y * 668265263;
  h = (h ^ (h >> 13)) * 1274126177;
  h = h ^ (h >> 16);
  return (h >>> 0) / 4294967296;
}

// ─── Pre-render terrain ───

function prerenderTerrain(map: TileId[][], ga: GameAssets): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = W * TILE_SIZE;
  canvas.height = H * TILE_SIZE;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const tileId = map[y][x];
      const px = x * TILE_SIZE;
      const py = y * TILE_SIZE;
      const name = TILE_ID_NAMES[tileId] || 'grass';

      if (tileId === T.COBBLE) {
        // Grey cobblestone for docks/harbor, mixed variation in town
        const isDocks = ellipseDist(x, y, 96, 42, 5, 4) < 1.0 || ellipseDist(x, y, 96, 48, 4, 4) < 1.0;
        const wellDist = Math.sqrt((x - 55) ** 2 + (y - 42) ** 2);
        const isPlaza = wellDist < 3;
        const h0 = tileHash(x, y);
        const useGrey = isDocks || isPlaza || h0 < 0.15;
        if (useGrey) {
          const cs = COBBLESTONE_GREY_TILE;
          ctx.drawImage(ga.cobblestoneGrey, cs.sx, cs.sy, cs.sw, cs.sh, px, py, TILE_SIZE, TILE_SIZE);
        } else {
          const cs = COBBLESTONE_TILE;
          ctx.drawImage(ga.cobblestone, cs.sx, cs.sy, cs.sw, cs.sh, px, py, TILE_SIZE, TILE_SIZE);
        }
      } else {
        // Solid color fill
        ctx.fillStyle = TERRAIN_COLORS[name] || '#7cc850';
        ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);

        // Subtle per-tile variation to reduce flatness
        const h = tileHash(x, y);
        if (h < 0.25) {
          ctx.fillStyle = 'rgba(255,255,255,0.03)';
          ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
        } else if (h > 0.75) {
          ctx.fillStyle = 'rgba(0,0,0,0.03)';
          ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
        }

        // Water wave texture
        if (tileId === T.WATER || tileId === T.DEEP_WATER || tileId === T.SHALLOW) {
          ctx.fillStyle = 'rgba(255,255,255,0.06)';
          const waveY = py + 8 + (h * 16);
          ctx.fillRect(px + 4, waveY, TILE_SIZE - 8, 1);
          ctx.fillRect(px + 8, waveY + 8, TILE_SIZE - 16, 1);
        }

        // Shore edge highlight
        if (tileId === T.SHORE || tileId === T.SAND) {
          ctx.fillStyle = 'rgba(255,255,240,0.06)';
          ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
        }

        // Path texture: subtle lines
        if (tileId === T.PATH) {
          ctx.fillStyle = 'rgba(0,0,0,0.04)';
          ctx.fillRect(px, py + 4, TILE_SIZE, 2);
          ctx.fillRect(px, py + TILE_SIZE - 6, TILE_SIZE, 2);
        }
      }
    }
  }

  return canvas;
}

// ─── Pre-render decorations ───

function prerenderDecorations(map: TileId[][], entityPositions: Set<string>, placedEntities: PlacedEntity[], ga: GameAssets): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = W * TILE_SIZE;
  canvas.height = H * TILE_SIZE;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;

  const items: { x: number; y: number; draw: () => void }[] = [];

  // Helper: check if tile at (tx,ty) is cobblestone
  const isCobble = (tx: number, ty: number) => map[ty]?.[tx] === T.COBBLE;

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const tileId = map[y][x];
      const h = tileHash(x, y);
      const h2 = tileHash(x + 500, y + 500);
      const px = x * TILE_SIZE;
      const py = y * TILE_SIZE;

      if (entityPositions.has(`${x},${y}`)) continue;

      // Two exclusion zones: tight (1 tile) for small props, wide (3 tiles) for large objects
      let nearTight = false, nearWide = false;
      for (let dy = -1; dy <= 1 && !nearTight; dy++)
        for (let dx = -1; dx <= 1 && !nearTight; dx++)
          if (entityPositions.has(`${x + dx},${y + dy}`)) nearTight = true;
      if (!nearTight)
        for (let dy = -3; dy <= 3 && !nearWide; dy++)
          for (let dx = -3; dx <= 3 && !nearWide; dx++)
            if (entityPositions.has(`${x + dx},${y + dy}`)) nearWide = true;

      // ── Forest / Dense Forest ──
      if (tileId === T.FOREST || tileId === T.DENSE_FOREST) {
        const density = tileId === T.DENSE_FOREST ? 0.4 : 0.25;
        if (h < density && !nearWide) {
          const si = Math.floor(h2 * 100) % TREE_SPRITES.length;
          const src = TREE_SPRITES[si];
          const ox = (h2 * 10 - 5) | 0;
          const oy = (h * 6 - 3) | 0;
          items.push({ x, y, draw: () => {
            ctx.fillStyle = 'rgba(0,0,0,0.1)';
            ctx.beginPath();
            ctx.ellipse(px + ox + 16, py + oy + 28, 16, 5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.drawImage(ga.assets, src.sx, src.sy, src.sw, src.sh,
              px + ox - 24, py + oy - 64, 64, 88);
          }});
        } else if (h < density + 0.12 && !nearWide) {
          const si = Math.floor(h2 * 100) % BUSH_SPRITES.length;
          const src = BUSH_SPRITES[si];
          items.push({ x, y, draw: () => {
            ctx.drawImage(ga.assets, src.sx, src.sy, src.sw, src.sh, px + 4, py + 8, 24, 20);
          }});
        } else if (h > 0.85 && h < 0.88) {
          items.push({ x, y, draw: () => {
            ctx.drawImage(ga.nature, MUSHROOM_SPRITE.sx, MUSHROOM_SPRITE.sy, MUSHROOM_SPRITE.sw, MUSHROOM_SPRITE.sh,
              px + 8, py + 14, 16, 12);
          }});
        } else if (h > 0.88 && h < 0.91 && !nearTight) {
          items.push({ x, y, draw: () => {
            ctx.drawImage(ga.assets, STUMP_SPRITE.sx, STUMP_SPRITE.sy, STUMP_SPRITE.sw, STUMP_SPRITE.sh, px + 2, py + 8, 28, 22);
          }});
        }

      // ── Grass / Dark Grass ──
      } else if (tileId === T.GRASS || tileId === T.GRASS_DARK) {
        // Grass detail sprites (flowers, small grass tufts)
        if (h < 0.15) {
          const si = Math.floor(h2 * 100) % GRASS_DETAIL_SPRITES.length;
          const src = GRASS_DETAIL_SPRITES[si];
          items.push({ x, y, draw: () => {
            ctx.drawImage(ga.assets, src.sx, src.sy, src.sw, src.sh,
              px + (h * 16) | 0, py + (h2 * 16) | 0, 12, 12);
          }});
        }
        // Fruit trees near settlement (grass_dark tiles near cobble border)
        if (tileId === T.GRASS_DARK && h > 0.91 && h <= 0.95 && !nearWide) {
          const adjCobble = isCobble(x - 1, y) || isCobble(x + 1, y) || isCobble(x, y - 1) || isCobble(x, y + 1);
          if (!adjCobble) {
            const si = Math.floor(h2 * 100) % FRUIT_TREE_SPRITES.length;
            const src = FRUIT_TREE_SPRITES[si];
            items.push({ x, y, draw: () => {
              ctx.fillStyle = 'rgba(0,0,0,0.08)';
              ctx.beginPath();
              ctx.ellipse(px + 16, py + 26, 14, 5, 0, 0, Math.PI * 2);
              ctx.fill();
              ctx.drawImage(ga.assets, src.sx, src.sy, src.sw, src.sh, px - 16, py - 44, 56, 68);
            }});
          }
        }
        // Village trees near settlement
        if (tileId === T.GRASS_DARK && h > 0.95 && !nearWide) {
          const adjCobble = isCobble(x - 1, y) || isCobble(x + 1, y) || isCobble(x, y - 1) || isCobble(x, y + 1);
          if (!adjCobble) {
            const si = Math.floor(h2 * 100) % VILLAGE_TREE_SPRITES.length;
            const src = VILLAGE_TREE_SPRITES[si];
            items.push({ x, y, draw: () => {
              ctx.fillStyle = 'rgba(0,0,0,0.08)';
              ctx.beginPath();
              ctx.ellipse(px + 16, py + 28, 18, 6, 0, 0, Math.PI * 2);
              ctx.fill();
              ctx.drawImage(ga.nature, src.sx, src.sy, src.sw, src.sh, px - 20, py - 60, 64, 88);
            }});
          }
        }
        // Lone plains trees (scattered)
        if (h > 0.96 && !nearWide) {
          const si = Math.floor(h2 * 100) % TREE_SPRITES.length;
          const src = TREE_SPRITES[si];
          items.push({ x, y, draw: () => {
            ctx.fillStyle = 'rgba(0,0,0,0.1)';
            ctx.beginPath();
            ctx.ellipse(px + 16, py + 28, 16, 5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.drawImage(ga.assets, src.sx, src.sy, src.sw, src.sh, px - 24, py - 64, 64, 88);
          }});
        }
        // Bushes — mix plains and village variants
        if (h > 0.85 && h <= 0.91 && !nearWide) {
          if (h2 < 0.5) {
            const si = Math.floor(h2 * 100) % BUSH_SPRITES.length;
            const src = BUSH_SPRITES[si];
            items.push({ x, y, draw: () => {
              ctx.drawImage(ga.assets, src.sx, src.sy, src.sw, src.sh, px + 4, py + 8, 24, 20);
            }});
          } else {
            const si = Math.floor(h2 * 100) % VILLAGE_BUSH_SPRITES.length;
            const src = VILLAGE_BUSH_SPRITES[si];
            items.push({ x, y, draw: () => {
              ctx.drawImage(ga.nature, src.sx, src.sy, src.sw, src.sh, px + 4, py + 6, 26, 22);
            }});
          }
        }

      // ── Hills / Rock ──
      } else if (tileId === T.HILLS || tileId === T.ROCK) {
        if (h < 0.15 && !nearWide) {
          const si = Math.floor(h2 * 100) % BOULDER_SPRITES.length;
          const src = BOULDER_SPRITES[si];
          items.push({ x, y, draw: () => {
            ctx.fillStyle = 'rgba(0,0,0,0.08)';
            ctx.beginPath();
            ctx.ellipse(px + 16, py + 24, 14, 4, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.drawImage(ga.nature, src.sx, src.sy, src.sw, src.sh, px - 4, py - 4, 36, 32);
          }});
        } else if (h < 0.28 && !nearWide) {
          const si = Math.floor(h2 * 100) % ROCK_SPRITES.length;
          const src = ROCK_SPRITES[si];
          items.push({ x, y, draw: () => {
            ctx.drawImage(ga.assets, src.sx, src.sy, src.sw, src.sh, px + 2, py + 10, 24, 18);
          }});
        }

      // ── Water — lily pads ──
      } else if (tileId === T.SHALLOW || tileId === T.WATER) {
        // Water lilies on lake surface (denser near edges)
        const lakeD = ellipseDist(x, y, 24, 64, 9, 7);
        const isLakeEdge = lakeD > 0.5 && lakeD < 0.95;
        const lilyThreshold = isLakeEdge ? 0.14 : 0.06;
        if (lakeD < 0.95 && h < lilyThreshold) {
          const s = WATER_LILY_SPRITE;
          items.push({ x, y, draw: () => {
            ctx.drawImage(ga.waterLily, s.sx, s.sy, s.sw, s.sh,
              px + (h2 * 8) | 0, py + (h * 8) | 0, 22, 18);
          }});
        }
        // Water lilies along eastern coast shallows
        const coastX = 100 + Math.sin(y * 0.15) * 4 + Math.cos(y * 0.07 + 2) * 3;
        const coastD = x - coastX;
        if (coastD > 2 && coastD < 6 && tileId === T.SHALLOW && h < 0.06) {
          const s = WATER_LILY_SPRITE;
          items.push({ x, y, draw: () => {
            ctx.drawImage(ga.waterLily, s.sx, s.sy, s.sw, s.sh,
              px + (h2 * 6) | 0, py + (h * 6) | 0, 20, 16);
          }});
        }
        // Shore rocks in shallow water near lake edge
        if (isLakeEdge && h > 0.88 && h < 0.93) {
          const si = Math.floor(h2 * 100) % SHORE_ROCK_SPRITES.length;
          const src = SHORE_ROCK_SPRITES[si];
          items.push({ x, y, draw: () => {
            ctx.globalAlpha = 0.7;
            ctx.drawImage(ga.nature, src.sx, src.sy, src.sw, src.sh,
              px + (h2 * 10) | 0, py + (h * 10) | 0, 12, 10);
            ctx.globalAlpha = 1;
          }});
        }

      // ── Sand / Shore — coastal detail ──
      } else if (tileId === T.SAND || tileId === T.SHORE) {
        if (h < 0.14) {
          const si = Math.floor(h2 * 100) % SHORE_ROCK_SPRITES.length;
          const src = SHORE_ROCK_SPRITES[si];
          items.push({ x, y, draw: () => {
            ctx.drawImage(ga.nature, src.sx, src.sy, src.sw, src.sh,
              px + (h2 * 12) | 0, py + (h * 14) | 0, 14, 12);
          }});
        }
        // Driftwood on shore
        if (tileId === T.SHORE && h > 0.92) {
          items.push({ x, y, draw: () => {
            ctx.globalAlpha = 0.7;
            ctx.drawImage(ga.assets, LOG_SPRITE.sx, LOG_SPRITE.sy, LOG_SPRITE.sw, LOG_SPRITE.sh, px - 8, py + 8, 48, 18);
            ctx.globalAlpha = 1;
          }});
        }
        // Lake shore — extra grass detail on sand tiles bordering water
        const lakeD2 = ellipseDist(x, y, 24, 64, 9, 7);
        if (lakeD2 > 0.85 && lakeD2 < 1.05 && h > 0.75 && h < 0.82) {
          const si = Math.floor(h2 * 100) % GRASS_DETAIL_SPRITES.length;
          const src = GRASS_DETAIL_SPRITES[si];
          items.push({ x, y, draw: () => {
            ctx.drawImage(ga.assets, src.sx, src.sy, src.sw, src.sh,
              px + (h * 14) | 0, py + (h2 * 14) | 0, 10, 10);
          }});
        }

      // ── Settlement (cobblestone) — dense props ──
      } else if (tileId === T.COBBLE) {
        const townD = ellipseDist(x, y, 55, 42, 6, 5);
        const isDocks = ellipseDist(x, y, 96, 42, 5, 4) < 1.0 || ellipseDist(x, y, 96, 48, 4, 4) < 1.0;
        const inTown = townD < 1.0;
        const P = inTown ? 1.5 : 1.0; // boost prop density inside town

        if (h < 0.025 * P && !nearTight) {
          // Barrel groups
          items.push({ x, y, draw: () => {
            ctx.drawImage(ga.market, BARREL_GROUP.sx, BARREL_GROUP.sy, BARREL_GROUP.sw, BARREL_GROUP.sh,
              px - 2, py + 2, 36, 30);
          }});
        } else if (h < 0.05 * P && !nearTight) {
          items.push({ x, y, draw: () => {
            ctx.drawImage(ga.market, BARREL.sx, BARREL.sy, BARREL.sw, BARREL.sh, px + 4, py + 4, 24, 24);
          }});
        } else if (h < 0.07 * P && !nearTight) {
          items.push({ x, y, draw: () => {
            ctx.drawImage(ga.market, CRATE.sx, CRATE.sy, CRATE.sw, CRATE.sh, px + 6, py + 4, 20, 24);
          }});
        } else if (h < 0.09 * P && !nearTight) {
          items.push({ x, y, draw: () => {
            ctx.drawImage(ga.market, SACK.sx, SACK.sy, SACK.sw, SACK.sh, px + 6, py + 6, 20, 20);
          }});
        } else if (h < 0.105 * P && !nearTight) {
          // Benches
          items.push({ x, y, draw: () => {
            ctx.drawImage(ga.nature, BENCH_SPRITE.sx, BENCH_SPRITE.sy, BENCH_SPRITE.sw, BENCH_SPRITE.sh,
              px - 4, py + 10, 40, 18);
          }});
        } else if (h < 0.12 * P && !nearTight) {
          // Food items
          const si = Math.floor(h2 * 100) % FOOD_SPRITES.length;
          const src = FOOD_SPRITES[si];
          items.push({ x, y, draw: () => {
            ctx.drawImage(ga.market, src.sx, src.sy, src.sw, src.sh, px + 8, py + 10, 16, 16);
          }});
        } else if (h < 0.135 * P && !nearTight) {
          // Log piles
          items.push({ x, y, draw: () => {
            ctx.drawImage(ga.nature, LOG_PILE_SPRITE.sx, LOG_PILE_SPRITE.sy, LOG_PILE_SPRITE.sw, LOG_PILE_SPRITE.sh,
              px - 2, py + 6, 36, 22);
          }});
        } else if (h < 0.15 * P && !nearTight) {
          // Crate piles
          items.push({ x, y, draw: () => {
            ctx.drawImage(ga.assets, CRATE_PILE_SPRITE.sx, CRATE_PILE_SPRITE.sy, CRATE_PILE_SPRITE.sw, CRATE_PILE_SPRITE.sh,
              px + 2, py + 4, 28, 22);
          }});
        } else if (h < 0.16 * P && !nearTight && !isDocks) {
          // Market sign boards (town only)
          const si = Math.floor(h2 * 100) % MARKET_SIGN_SPRITES.length;
          const src = MARKET_SIGN_SPRITES[si];
          items.push({ x, y, draw: () => {
            ctx.drawImage(ga.market, src.sx, src.sy, src.sw, src.sh, px - 4, py + 8, 36, 18);
          }});
        }

      // ── Path — signposts and edges ──
      } else if (tileId === T.PATH) {
        const townD = ellipseDist(x, y, 55, 42, 6, 5);
        // Sign posts near town exits and at path forks
        if (h < 0.025 && townD > 0.9 && townD < 1.5 && !nearTight) {
          const si = Math.floor(h2 * 100) % SIGN_POST_SPRITES.length;
          const src = SIGN_POST_SPRITES[si];
          items.push({ x, y, draw: () => {
            ctx.drawImage(ga.assets, src.sx, src.sy, src.sw, src.sh, px + 4, py - 20, 24, 36);
          }});
        }
        // Nature sign (village style) farther from town
        if (h > 0.975 && townD > 1.5 && !nearTight) {
          items.push({ x, y, draw: () => {
            ctx.drawImage(ga.nature, SIGN_SPRITE.sx, SIGN_SPRITE.sy, SIGN_SPRITE.sw, SIGN_SPRITE.sh,
              px + 6, py - 16, 20, 36);
          }});
        }
        // Grass details along path edges
        if (h > 0.85 && h < 0.88) {
          const si = Math.floor(h2 * 100) % GRASS_DETAIL_SPRITES.length;
          const src = GRASS_DETAIL_SPRITES[si];
          items.push({ x, y, draw: () => {
            ctx.drawImage(ga.assets, src.sx, src.sy, src.sw, src.sh, px + 2, py + 2, 10, 10);
          }});
        }
      }
    }
  }

  // ══════════════════════════════════════════════════════════
  //  Fixed landmarks — intentional compositions per area
  // ══════════════════════════════════════════════════════════

  // Helper: place a fixed item if tile is free of entities
  const fix = (fx: number, fy: number, drawFn: () => void) => {
    if (!entityPositions.has(`${fx},${fy}`))
      items.push({ x: fx, y: fy, draw: drawFn });
  };

  // ══════════════════════════════════════════════════════════
  //  Town Square — Dense Village Hub
  // ══════════════════════════════════════════════════════════

  // ── Central well plaza (focal point) ──
  fix(55, 42, () => {
    // Warm ambient glow
    ctx.fillStyle = 'rgba(200,164,78,0.05)';
    ctx.beginPath();
    ctx.arc(55 * TILE_SIZE + 16, 42 * TILE_SIZE + 16, 38, 0, Math.PI * 2);
    ctx.fill();
    // Ground shadow
    ctx.fillStyle = 'rgba(0,0,0,0.16)';
    ctx.beginPath();
    ctx.ellipse(55 * TILE_SIZE + 16, 42 * TILE_SIZE + 30, 22, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    // Well sprite (bigger, more prominent)
    ctx.drawImage(ga.well, WELL_SPRITE.sx, WELL_SPRITE.sy, WELL_SPRITE.sw, WELL_SPRITE.sh,
      55 * TILE_SIZE - 16, 42 * TILE_SIZE - 18, TILE_SIZE * 2.2, TILE_SIZE * 1.9);
  });
  // "Town Square" label
  items.push({ x: 55, y: 42, draw: () => {
    ctx.font = '600 9px Inter, sans-serif';
    ctx.textAlign = 'center';
    const lbl = 'Town Square';
    const lm = ctx.measureText(lbl);
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.beginPath();
    ctx.roundRect(55 * TILE_SIZE + 16 - lm.width / 2 - 5, 42 * TILE_SIZE + TILE_SIZE + 10, lm.width + 10, 13, 3);
    ctx.fill();
    ctx.fillStyle = 'rgba(200,164,78,0.8)';
    ctx.fillText(lbl, 55 * TILE_SIZE + 16, 42 * TILE_SIZE + TILE_SIZE + 20);
  }});

  // 4 symmetric benches around the well
  [[54, 41], [56, 41], [54, 43], [56, 43]].forEach(([bx, by]) => {
    fix(bx, by, () => {
      ctx.drawImage(ga.nature, BENCH_SPRITE.sx, BENCH_SPRITE.sy, BENCH_SPRITE.sw, BENCH_SPRITE.sh,
        bx * TILE_SIZE - 4, by * TILE_SIZE + 10, 40, 18);
    });
  });

  // Campfire west of well for evening ambiance
  items.push({ x: 53, y: 42, draw: () => {
    ctx.drawImage(ga.campfire, CAMPFIRE_SPRITE.sx, CAMPFIRE_SPRITE.sy, CAMPFIRE_SPRITE.sw, CAMPFIRE_SPRITE.sh,
      53 * TILE_SIZE + 4, 42 * TILE_SIZE + 4, TILE_SIZE - 8, TILE_SIZE - 8);
  }});

  // ── Perimeter trees (framing the town at corners) ──
  [[49, 38], [61, 38], [49, 46], [61, 46]].forEach(([tx, ty]) => {
    const si = tileHash(tx, ty) < 0.5 ? 0 : 1;
    const src = VILLAGE_TREE_SPRITES[si];
    items.push({ x: tx, y: ty, draw: () => {
      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      ctx.beginPath();
      ctx.ellipse(tx * TILE_SIZE + 16, ty * TILE_SIZE + 28, 20, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.drawImage(ga.nature, src.sx, src.sy, src.sw, src.sh,
        tx * TILE_SIZE - 20, ty * TILE_SIZE - 60, 64, 88);
    }});
  });

  // Street trees along north and south roads for shade
  [[52, 38], [58, 38], [52, 46], [58, 46]].forEach(([tx, ty]) => {
    const si = tileHash(tx + 7, ty + 7) < 0.5 ? 0 : 1;
    const src = VILLAGE_TREE_SPRITES[si];
    items.push({ x: tx, y: ty, draw: () => {
      ctx.fillStyle = 'rgba(0,0,0,0.08)';
      ctx.beginPath();
      ctx.ellipse(tx * TILE_SIZE + 16, ty * TILE_SIZE + 28, 18, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.drawImage(ga.nature, src.sx, src.sy, src.sw, src.sh,
        tx * TILE_SIZE - 20, ty * TILE_SIZE - 60, 64, 88);
    }});
  });

  // ── Wooden fences defining town border ──
  // North edge (with marble gate at center)
  [50, 52, 58, 60].forEach(fx => {
    fix(fx, 37, () => {
      ctx.drawImage(ga.woodenFence, WOODEN_FENCE_SPRITE.sx, WOODEN_FENCE_SPRITE.sy, WOODEN_FENCE_SPRITE.sw, WOODEN_FENCE_SPRITE.sh,
        fx * TILE_SIZE - 8, 37 * TILE_SIZE + 4, 48, 24);
    });
  });
  // North gate — marble pillars with warm glow
  [[54, 37], [56, 37]].forEach(([gx, gy]) => {
    fix(gx, gy, () => {
      ctx.fillStyle = 'rgba(200,140,50,0.06)';
      ctx.beginPath();
      ctx.arc(gx * TILE_SIZE + 16, gy * TILE_SIZE + 16, 20, 0, Math.PI * 2);
      ctx.fill();
      const ms = MARBLE_PILLAR_SPRITE;
      ctx.drawImage(ga.marbleFence, ms.sx, ms.sy, ms.sw, ms.sh,
        gx * TILE_SIZE + 6, gy * TILE_SIZE - 16, 18, 52);
    });
  });
  // South edge (with marble gate at center)
  [50, 52, 58, 60].forEach(fx => {
    fix(fx, 47, () => {
      ctx.drawImage(ga.woodenFence, WOODEN_FENCE_SPRITE.sx, WOODEN_FENCE_SPRITE.sy, WOODEN_FENCE_SPRITE.sw, WOODEN_FENCE_SPRITE.sh,
        fx * TILE_SIZE - 8, 47 * TILE_SIZE + 4, 48, 24);
    });
  });
  // South gate — marble pillars with warm glow
  [[54, 47], [56, 47]].forEach(([gx, gy]) => {
    fix(gx, gy, () => {
      ctx.fillStyle = 'rgba(200,140,50,0.06)';
      ctx.beginPath();
      ctx.arc(gx * TILE_SIZE + 16, gy * TILE_SIZE + 16, 20, 0, Math.PI * 2);
      ctx.fill();
      const ms = MARBLE_PILLAR_SPRITE;
      ctx.drawImage(ga.marbleFence, ms.sx, ms.sy, ms.sw, ms.sh,
        gx * TILE_SIZE + 6, gy * TILE_SIZE - 16, 18, 52);
    });
  });

  // ── Market Quarter: northeast (57-60, 40-43) ──
  // Tight canopy stall cluster
  [
    { x: 57, y: 40, ci: 0 }, // green canopy
    { x: 59, y: 40, ci: 1 }, // red canopy
    { x: 57, y: 42, ci: 2 }, // blue canopy
  ].forEach(({ x: sx, y: sy, ci }) => {
    fix(sx, sy, () => {
      const canopy = MARKET_CANOPY_SPRITES[ci];
      // Stall legs
      ctx.drawImage(ga.market, MARKET_STALL.sx, MARKET_STALL.sy, MARKET_STALL.sw, MARKET_STALL.sh,
        sx * TILE_SIZE - 10, sy * TILE_SIZE, TILE_SIZE * 2, TILE_SIZE * 1.3);
      // Canopy roof
      ctx.drawImage(ga.market, canopy.sx, canopy.sy, canopy.sw, canopy.sh,
        sx * TILE_SIZE - 14, sy * TILE_SIZE - 26, TILE_SIZE * 2.5, TILE_SIZE * 1.5);
    });
  });

  // Merchant NPC with their own stall + canopy
  fix(58, 41, () => {
    // Stall behind the merchant
    const canopy = MARKET_CANOPY_SPRITES[0];
    ctx.drawImage(ga.market, MARKET_STALL.sx, MARKET_STALL.sy, MARKET_STALL.sw, MARKET_STALL.sh,
      58 * TILE_SIZE - 10, 41 * TILE_SIZE - 4, TILE_SIZE * 2, TILE_SIZE * 1.3);
    ctx.drawImage(ga.market, canopy.sx, canopy.sy, canopy.sw, canopy.sh,
      58 * TILE_SIZE - 14, 41 * TILE_SIZE - 30, TILE_SIZE * 2.5, TILE_SIZE * 1.5);
    // Merchant shadow
    ctx.fillStyle = 'rgba(0,0,0,0.14)';
    ctx.beginPath();
    ctx.ellipse(58 * TILE_SIZE + 16, 41 * TILE_SIZE + TILE_SIZE - 2, 8, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    // Merchant sprite (in front of stall)
    ctx.drawImage(ga.merchant, 0, 0, NPC_SMALL_FRAME_W, NPC_SMALL_FRAME_H,
      58 * TILE_SIZE + 4, 41 * TILE_SIZE + 2, TILE_SIZE - 8, TILE_SIZE - 4);
    // Label
    ctx.font = '600 9px Inter, sans-serif';
    ctx.textAlign = 'center';
    const lbl = 'Merchant';
    const lm = ctx.measureText(lbl);
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.beginPath();
    ctx.roundRect(58 * TILE_SIZE + 16 - lm.width / 2 - 4, 41 * TILE_SIZE + TILE_SIZE + 4, lm.width + 8, 12, 3);
    ctx.fill();
    ctx.fillStyle = '#e8c86a';
    ctx.fillText(lbl, 58 * TILE_SIZE + 16, 41 * TILE_SIZE + TILE_SIZE + 13);
  });

  // Market props: dense goods around stalls
  fix(59, 41, () => {
    ctx.drawImage(ga.market, BARREL_GROUP.sx, BARREL_GROUP.sy, BARREL_GROUP.sw, BARREL_GROUP.sh,
      59 * TILE_SIZE + 2, 41 * TILE_SIZE + 2, 32, 26);
  });
  fix(60, 40, () => {
    ctx.drawImage(ga.market, BARREL.sx, BARREL.sy, BARREL.sw, BARREL.sh,
      60 * TILE_SIZE + 2, 40 * TILE_SIZE + 4, 22, 22);
    ctx.drawImage(ga.market, CRATE.sx, CRATE.sy, CRATE.sw, CRATE.sh,
      60 * TILE_SIZE + 14, 40 * TILE_SIZE + 16, 18, 14);
  });
  fix(60, 42, () => {
    ctx.drawImage(ga.assets, CRATE_PILE_SPRITE.sx, CRATE_PILE_SPRITE.sy, CRATE_PILE_SPRITE.sw, CRATE_PILE_SPRITE.sh,
      60 * TILE_SIZE + 2, 42 * TILE_SIZE + 4, 28, 22);
  });
  fix(58, 40, () => {
    FOOD_SPRITES.forEach((src, i) => {
      ctx.drawImage(ga.market, src.sx, src.sy, src.sw, src.sh,
        58 * TILE_SIZE + 2 + i * 12, 40 * TILE_SIZE + 14, 12, 12);
    });
  });
  fix(59, 43, () => {
    ctx.drawImage(ga.market, SACK.sx, SACK.sy, SACK.sw, SACK.sh,
      59 * TILE_SIZE + 4, 43 * TILE_SIZE + 4, 22, 22);
    ctx.drawImage(ga.market, CRATE.sx, CRATE.sy, CRATE.sw, CRATE.sh,
      59 * TILE_SIZE + 18, 43 * TILE_SIZE + 10, 14, 16);
  });
  fix(58, 43, () => {
    ctx.drawImage(ga.market, BARREL.sx, BARREL.sy, BARREL.sw, BARREL.sh,
      58 * TILE_SIZE + 4, 43 * TILE_SIZE + 6, 20, 20);
  });
  // Market signs
  fix(56, 40, () => {
    const src = MARKET_SIGN_SPRITES[0];
    ctx.drawImage(ga.market, src.sx, src.sy, src.sw, src.sh,
      56 * TILE_SIZE - 2, 40 * TILE_SIZE + 8, 36, 18);
  });
  fix(60, 43, () => {
    const src = MARKET_SIGN_SPRITES[1];
    ctx.drawImage(ga.market, src.sx, src.sy, src.sw, src.sh,
      60 * TILE_SIZE + 2, 43 * TILE_SIZE + 8, 36, 18);
  });

  // Vegetable stall (village plus asset)
  fix(57, 43, () => {
    ctx.drawImage(ga.vegetableStall,
      VEGETABLE_STALL_SPRITE.sx, VEGETABLE_STALL_SPRITE.sy,
      VEGETABLE_STALL_SPRITE.sw, VEGETABLE_STALL_SPRITE.sh,
      57 * TILE_SIZE - 8, 43 * TILE_SIZE - 16, 48, 56);
  });

  // ── West side props (along house frontage) ──
  fix(50, 40, () => {
    ctx.drawImage(ga.market, BARREL_GROUP.sx, BARREL_GROUP.sy, BARREL_GROUP.sw, BARREL_GROUP.sh,
      50 * TILE_SIZE + 2, 40 * TILE_SIZE + 4, 30, 26);
  });
  fix(50, 42, () => {
    ctx.drawImage(ga.nature, LOG_PILE_SPRITE.sx, LOG_PILE_SPRITE.sy, LOG_PILE_SPRITE.sw, LOG_PILE_SPRITE.sh,
      50 * TILE_SIZE - 2, 42 * TILE_SIZE + 6, 36, 22);
  });
  fix(50, 43, () => {
    ctx.drawImage(ga.market, CRATE.sx, CRATE.sy, CRATE.sw, CRATE.sh,
      50 * TILE_SIZE + 6, 43 * TILE_SIZE + 4, 20, 24);
  });
  fix(52, 41, () => {
    ctx.drawImage(ga.market, BARREL.sx, BARREL.sy, BARREL.sw, BARREL.sh,
      52 * TILE_SIZE + 4, 41 * TILE_SIZE + 4, 22, 22);
  });
  fix(52, 44, () => {
    ctx.drawImage(ga.nature, BENCH_SPRITE.sx, BENCH_SPRITE.sy, BENCH_SPRITE.sw, BENCH_SPRITE.sh,
      52 * TILE_SIZE - 4, 44 * TILE_SIZE + 10, 40, 18);
  });

  // ── East side (right of market) ──
  fix(61, 41, () => {
    ctx.drawImage(ga.nature, BENCH_SPRITE.sx, BENCH_SPRITE.sy, BENCH_SPRITE.sw, BENCH_SPRITE.sh,
      61 * TILE_SIZE - 4, 41 * TILE_SIZE + 10, 40, 18);
  });
  fix(61, 43, () => {
    ctx.drawImage(ga.market, BARREL.sx, BARREL.sy, BARREL.sw, BARREL.sh,
      61 * TILE_SIZE + 2, 43 * TILE_SIZE + 4, 22, 22);
  });

  // ── South entrance ──
  fix(53, 45, () => {
    const src = SIGN_POST_SPRITES[0];
    ctx.drawImage(ga.assets, src.sx, src.sy, src.sw, src.sh,
      53 * TILE_SIZE + 4, 45 * TILE_SIZE - 18, 24, 36);
  });
  fix(57, 45, () => {
    const src = SIGN_POST_SPRITES[1];
    ctx.drawImage(ga.assets, src.sx, src.sy, src.sw, src.sh,
      57 * TILE_SIZE + 4, 45 * TILE_SIZE - 18, 24, 36);
  });
  fix(55, 46, () => {
    ctx.drawImage(ga.nature, BENCH_SPRITE.sx, BENCH_SPRITE.sy, BENCH_SPRITE.sw, BENCH_SPRITE.sh,
      55 * TILE_SIZE - 4, 46 * TILE_SIZE + 10, 40, 18);
  });

  // ── Additional town detail for density ──
  // Food display near west houses
  fix(53, 40, () => {
    FOOD_SPRITES.slice(0, 2).forEach((src, i) => {
      ctx.drawImage(ga.market, src.sx, src.sy, src.sw, src.sh,
        53 * TILE_SIZE + 4 + i * 14, 40 * TILE_SIZE + 14, 12, 12);
    });
  });
  fix(53, 44, () => {
    ctx.drawImage(ga.market, SACK.sx, SACK.sy, SACK.sw, SACK.sh,
      53 * TILE_SIZE + 4, 44 * TILE_SIZE + 6, 20, 20);
  });
  // Log seat near campfire
  fix(52, 42, () => {
    ctx.drawImage(ga.assets, LOG_SPRITE.sx, LOG_SPRITE.sy, LOG_SPRITE.sw, LOG_SPRITE.sh,
      52 * TILE_SIZE - 4, 42 * TILE_SIZE + 8, 40, 18);
  });
  // North side details
  fix(55, 39, () => {
    ctx.drawImage(ga.nature, BENCH_SPRITE.sx, BENCH_SPRITE.sy, BENCH_SPRITE.sw, BENCH_SPRITE.sh,
      55 * TILE_SIZE - 4, 39 * TILE_SIZE + 10, 40, 18);
  });
  fix(53, 39, () => {
    ctx.drawImage(ga.market, BARREL.sx, BARREL.sy, BARREL.sw, BARREL.sh,
      53 * TILE_SIZE + 4, 39 * TILE_SIZE + 4, 22, 22);
  });

  // ── Decorative houses — non-entity buildings lining town edges ──
  [
    { hx: 49, hy: 41, variant: 0, large: false },
    { hx: 49, hy: 44, variant: 1, large: false },
    { hx: 61, hy: 40, variant: 2, large: false },
    { hx: 61, hy: 44, variant: 0, large: true },
  ].forEach(({ hx, hy, variant, large }) => {
    const sprites = large ? LARGE_HOUSE_SPRITES : HOUSE_SPRITES;
    const src = sprites[variant % sprites.length];
    const dw = large ? TILE_SIZE * 4 : TILE_SIZE * 3;
    const dh = large ? TILE_SIZE * 4 : TILE_SIZE * 3;
    fix(hx, hy, () => {
      ctx.fillStyle = large ? 'rgba(0,0,0,0.14)' : 'rgba(0,0,0,0.12)';
      ctx.beginPath();
      ctx.ellipse(hx * TILE_SIZE + TILE_SIZE / 2, hy * TILE_SIZE + TILE_SIZE + 4,
        dw / 2 - 10, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.drawImage(ga.houses, src.sx, src.sy, src.sw, src.sh,
        hx * TILE_SIZE - (large ? TILE_SIZE * 1.5 : TILE_SIZE),
        hy * TILE_SIZE - dh + TILE_SIZE + 10, dw, dh);
    });
  });

  // ── West border fences (between decorative houses) ──
  [42, 43].forEach(fy => {
    fix(49, fy, () => {
      ctx.drawImage(ga.woodenFence, WOODEN_FENCE_SPRITE.sx, WOODEN_FENCE_SPRITE.sy,
        WOODEN_FENCE_SPRITE.sw, WOODEN_FENCE_SPRITE.sh,
        49 * TILE_SIZE - 8, fy * TILE_SIZE + 4, 48, 24);
    });
  });

  // ── Notice board at town center (north of well) ──
  fix(55, 40, () => {
    ctx.drawImage(ga.nature, SIGN_SPRITE.sx, SIGN_SPRITE.sy, SIGN_SPRITE.sw, SIGN_SPRITE.sh,
      55 * TILE_SIZE + 4, 40 * TILE_SIZE - 18, 24, 40);
    ctx.font = '600 8px Inter, sans-serif';
    ctx.textAlign = 'center';
    const nbl = 'Notice Board';
    const nbm = ctx.measureText(nbl);
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.roundRect(55 * TILE_SIZE + 16 - nbm.width / 2 - 4, 40 * TILE_SIZE + 22, nbm.width + 8, 11, 3);
    ctx.fill();
    ctx.fillStyle = 'rgba(200,164,78,0.7)';
    ctx.fillText(nbl, 55 * TILE_SIZE + 16, 40 * TILE_SIZE + 30);
  });

  // ── Docks: cargo and piers (94-99, 40-44) ──
  const ls = LANDING_STAGE_SPRITE;
  [{ x: 98, y: 43 }, { x: 98, y: 41 }].forEach(pos => {
    items.push({ x: pos.x, y: pos.y, draw: () => {
      ctx.drawImage(ga.landingStage, ls.sx, ls.sy, ls.sw, ls.sh,
        pos.x * TILE_SIZE - 8, pos.y * TILE_SIZE - 4, TILE_SIZE * 2.5, TILE_SIZE * 1.6);
    }});
  });
  // Cargo cluster on the inland side of docks
  fix(94, 41, () => {
    ctx.drawImage(ga.market, BARREL_GROUP.sx, BARREL_GROUP.sy, BARREL_GROUP.sw, BARREL_GROUP.sh,
      94 * TILE_SIZE - 2, 41 * TILE_SIZE + 2, 36, 30);
  });
  fix(94, 43, () => {
    ctx.drawImage(ga.assets, CRATE_PILE_SPRITE.sx, CRATE_PILE_SPRITE.sy, CRATE_PILE_SPRITE.sw, CRATE_PILE_SPRITE.sh,
      94 * TILE_SIZE + 2, 43 * TILE_SIZE + 4, 28, 22);
  });
  fix(95, 42, () => {
    ctx.drawImage(ga.market, BARREL.sx, BARREL.sy, BARREL.sw, BARREL.sh,
      95 * TILE_SIZE + 2, 42 * TILE_SIZE + 2, 24, 24);
    ctx.drawImage(ga.market, SACK.sx, SACK.sy, SACK.sw, SACK.sh,
      95 * TILE_SIZE + 18, 42 * TILE_SIZE + 8, 16, 16);
  });
  fix(97, 40, () => {
    ctx.drawImage(ga.market, CRATE.sx, CRATE.sy, CRATE.sw, CRATE.sh,
      97 * TILE_SIZE + 4, 40 * TILE_SIZE + 4, 22, 26);
  });
  // ── Docks South Gate — Seaside Village entrance ──
  // Wooden fence wings on left and right of gate opening
  [91, 92, 93].forEach(fx => {
    fix(fx, 45, () => {
      ctx.drawImage(ga.woodenFence, WOODEN_FENCE_SPRITE.sx, WOODEN_FENCE_SPRITE.sy, WOODEN_FENCE_SPRITE.sw, WOODEN_FENCE_SPRITE.sh,
        fx * TILE_SIZE - 8, 45 * TILE_SIZE + 2, 48, 24);
    });
  });
  [99, 100, 101].forEach(fx => {
    fix(fx, 45, () => {
      ctx.drawImage(ga.woodenFence, WOODEN_FENCE_SPRITE.sx, WOODEN_FENCE_SPRITE.sy, WOODEN_FENCE_SPRITE.sw, WOODEN_FENCE_SPRITE.sh,
        fx * TILE_SIZE - 8, 45 * TILE_SIZE + 2, 48, 24);
    });
  });
  // Marble pillars flanking the gate opening at x=95 and x=97
  [[95, 45], [97, 45]].forEach(([gx, gy]) => {
    fix(gx, gy, () => {
      ctx.fillStyle = 'rgba(120,180,200,0.06)';
      ctx.beginPath();
      ctx.arc(gx * TILE_SIZE + 16, gy * TILE_SIZE + 16, 20, 0, Math.PI * 2);
      ctx.fill();
      const ms = MARBLE_PILLAR_SPRITE;
      ctx.drawImage(ga.marbleFence, ms.sx, ms.sy, ms.sw, ms.sh,
        gx * TILE_SIZE + 6, gy * TILE_SIZE - 16, 18, 52);
    });
  });
  // "Seaside Village" label below gate
  items.push({ x: 96, y: 45, draw: () => {
    ctx.font = '600 9px Inter, sans-serif';
    ctx.textAlign = 'center';
    const lbl = 'Seaside Village';
    const lm = ctx.measureText(lbl);
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.beginPath();
    ctx.roundRect(96 * TILE_SIZE + 16 - lm.width / 2 - 5, 45 * TILE_SIZE + TILE_SIZE + 8, lm.width + 10, 13, 3);
    ctx.fill();
    ctx.fillStyle = 'rgba(120,180,200,0.8)';
    ctx.fillText(lbl, 96 * TILE_SIZE + 16, 45 * TILE_SIZE + TILE_SIZE + 18);
  }});
  // Signpost at gate
  fix(96, 46, () => {
    const src = SIGN_POST_SPRITES[0];
    ctx.drawImage(ga.assets, src.sx, src.sy, src.sw, src.sh,
      96 * TILE_SIZE + 4, 46 * TILE_SIZE - 20, 24, 36);
  });

  // ── Forest Clearing: campsite (19-24, 28-33) ──
  // Tent
  items.push({ x: 19, y: 29, draw: () => {
    ctx.drawImage(ga.assets, TENT_SPRITE.sx, TENT_SPRITE.sy, TENT_SPRITE.sw, TENT_SPRITE.sh,
      19 * TILE_SIZE - 8, 29 * TILE_SIZE - 12, TILE_SIZE * 3, TILE_SIZE * 2);
  }});
  // Campfire
  items.push({ x: 21, y: 31, draw: () => {
    ctx.drawImage(ga.campfire, CAMPFIRE_SPRITE.sx, CAMPFIRE_SPRITE.sy, CAMPFIRE_SPRITE.sw, CAMPFIRE_SPRITE.sh,
      21 * TILE_SIZE + 2, 31 * TILE_SIZE + 2, TILE_SIZE - 4, TILE_SIZE - 4);
  }});
  // Log seats around campfire
  fix(20, 32, () => {
    ctx.drawImage(ga.assets, LOG_SPRITE.sx, LOG_SPRITE.sy, LOG_SPRITE.sw, LOG_SPRITE.sh,
      20 * TILE_SIZE - 4, 32 * TILE_SIZE + 6, 40, 18);
  });
  fix(23, 31, () => {
    ctx.drawImage(ga.assets, STUMP_SPRITE.sx, STUMP_SPRITE.sy, STUMP_SPRITE.sw, STUMP_SPRITE.sh,
      23 * TILE_SIZE + 2, 31 * TILE_SIZE + 8, 28, 22);
  });
  // Supplies near tent
  fix(20, 29, () => {
    ctx.drawImage(ga.market, BARREL.sx, BARREL.sy, BARREL.sw, BARREL.sh,
      20 * TILE_SIZE + 4, 29 * TILE_SIZE + 4, 22, 22);
  });
  fix(18, 30, () => {
    ctx.drawImage(ga.nature, LOG_PILE_SPRITE.sx, LOG_PILE_SPRITE.sy, LOG_PILE_SPRITE.sw, LOG_PILE_SPRITE.sh,
      18 * TILE_SIZE - 2, 30 * TILE_SIZE + 6, 36, 22);
  });
  // Sign at clearing entrance
  fix(24, 30, () => {
    const src = SIGN_POST_SPRITES[0];
    ctx.drawImage(ga.assets, src.sx, src.sy, src.sw, src.sh,
      24 * TILE_SIZE + 4, 30 * TILE_SIZE - 20, 24, 36);
  });

  // ── Ancient Ruins: cave + scattered rubble (38-46, 76-82) ──
  // Cave entrance
  items.push({ x: 38, y: 80, draw: () => {
    ctx.drawImage(ga.nature, CAVE_SPRITE.sx, CAVE_SPRITE.sy, CAVE_SPRITE.sw, CAVE_SPRITE.sh,
      38 * TILE_SIZE - 16, 80 * TILE_SIZE - 24, TILE_SIZE * 4, TILE_SIZE * 2.5);
  }});
  // Campfire at excavation camp
  items.push({ x: 44, y: 79, draw: () => {
    ctx.drawImage(ga.campfire, CAMPFIRE_SPRITE.sx, CAMPFIRE_SPRITE.sy, CAMPFIRE_SPRITE.sw, CAMPFIRE_SPRITE.sh,
      44 * TILE_SIZE + 2, 79 * TILE_SIZE + 2, TILE_SIZE - 4, TILE_SIZE - 4);
  }});
  // Scattered boulders as ruin rubble
  const ruinBoulders = [
    { x: 40, y: 77 }, { x: 43, y: 77 }, { x: 45, y: 80 },
    { x: 39, y: 82 }, { x: 42, y: 81 },
  ];
  ruinBoulders.forEach((pos, i) => {
    const src = BOULDER_SPRITES[i % BOULDER_SPRITES.length];
    fix(pos.x, pos.y, () => {
      ctx.fillStyle = 'rgba(0,0,0,0.06)';
      ctx.beginPath();
      ctx.ellipse(pos.x * TILE_SIZE + 16, pos.y * TILE_SIZE + 24, 14, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.drawImage(ga.nature, src.sx, src.sy, src.sw, src.sh,
        pos.x * TILE_SIZE - 4, pos.y * TILE_SIZE - 4, 36, 32);
    });
  });
  // Broken pillars (stumps)
  fix(41, 78, () => {
    ctx.drawImage(ga.assets, STUMP_SPRITE.sx, STUMP_SPRITE.sy, STUMP_SPRITE.sw, STUMP_SPRITE.sh,
      41 * TILE_SIZE + 2, 78 * TILE_SIZE + 8, 28, 22);
  });
  fix(39, 79, () => {
    ctx.drawImage(ga.assets, STUMP_SPRITE.sx, STUMP_SPRITE.sy, STUMP_SPRITE.sw, STUMP_SPRITE.sh,
      39 * TILE_SIZE + 2, 79 * TILE_SIZE + 8, 28, 22);
  });
  // Excavation supplies near ruins campfire
  fix(45, 79, () => {
    ctx.drawImage(ga.market, CRATE.sx, CRATE.sy, CRATE.sw, CRATE.sh,
      45 * TILE_SIZE + 6, 79 * TILE_SIZE + 4, 20, 24);
  });
  fix(44, 78, () => {
    ctx.drawImage(ga.assets, CRATE_PILE_SPRITE.sx, CRATE_PILE_SPRITE.sy, CRATE_PILE_SPRITE.sw, CRATE_PILE_SPRITE.sh,
      44 * TILE_SIZE + 2, 78 * TILE_SIZE + 4, 28, 22);
  });

  // ── Lakeside Shrine: bridge crossing + marble fence enclosure (27-31, 61-63) ──
  // Bridge planks spanning tiles 30-31 at y=62
  items.push({ x: 30, y: 62, draw: () => {
    const bs = BRIDGE_PLANK_SPRITE;
    ctx.drawImage(ga.bridge, bs.sx, bs.sy, bs.sw, bs.sh,
      30 * TILE_SIZE - 6, 62 * TILE_SIZE - 12, TILE_SIZE * 2.8, TILE_SIZE * 1.7);
  }});
  // Marble pillars flanking the bridge entrance (east side of island)
  fix(29, 61, () => {
    const ms = MARBLE_PILLAR_SPRITE;
    ctx.drawImage(ga.marbleFence, ms.sx, ms.sy, ms.sw, ms.sh,
      29 * TILE_SIZE + 6, 61 * TILE_SIZE - 16, 18, 52);
  });
  fix(29, 63, () => {
    const ms = MARBLE_PILLAR_SPRITE;
    ctx.drawImage(ga.marbleFence, ms.sx, ms.sy, ms.sw, ms.sh,
      29 * TILE_SIZE + 6, 63 * TILE_SIZE - 8, 18, 52);
  });
  // Marble fence along the west side (back of shrine)
  fix(27, 61, () => {
    const mf = MARBLE_FENCE_SPRITE;
    ctx.drawImage(ga.marbleFence, mf.sx, mf.sy, mf.sw, mf.sh,
      27 * TILE_SIZE - 6, 61 * TILE_SIZE + 2, 44, 28);
  });
  fix(27, 63, () => {
    const mf = MARBLE_FENCE_SPRITE;
    ctx.drawImage(ga.marbleFence, mf.sx, mf.sy, mf.sw, mf.sh,
      27 * TILE_SIZE - 6, 63 * TILE_SIZE + 2, 44, 28);
  });
  // West pillar (back center)
  fix(27, 62, () => {
    const ms = MARBLE_PILLAR_SPRITE;
    ctx.drawImage(ga.marbleFence, ms.sx, ms.sy, ms.sw, ms.sh,
      27 * TILE_SIZE - 2, 62 * TILE_SIZE - 12, 18, 52);
  });
  // Sacred stone at shrine center — boulder with golden aura
  fix(28, 62, () => {
    // Outer glow
    ctx.fillStyle = 'rgba(200,164,78,0.06)';
    ctx.beginPath();
    ctx.arc(28 * TILE_SIZE + 16, 62 * TILE_SIZE + 16, 28, 0, Math.PI * 2);
    ctx.fill();
    // Inner glow
    ctx.fillStyle = 'rgba(200,164,78,0.14)';
    ctx.beginPath();
    ctx.arc(28 * TILE_SIZE + 16, 62 * TILE_SIZE + 16, 18, 0, Math.PI * 2);
    ctx.fill();
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    ctx.beginPath();
    ctx.ellipse(28 * TILE_SIZE + 16, 62 * TILE_SIZE + 24, 16, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    // Stone
    const src = BOULDER_SPRITES[0];
    ctx.drawImage(ga.nature, src.sx, src.sy, src.sw, src.sh,
      28 * TILE_SIZE - 2, 62 * TILE_SIZE - 2, 38, 34);
  });
  // Water lilies clustered around the shrine island
  const shrineLilies = [
    { x: 26, y: 61 }, { x: 26, y: 63 }, { x: 30, y: 61 },
    { x: 30, y: 63 }, { x: 27, y: 60 }, { x: 29, y: 64 },
  ];
  shrineLilies.forEach(pos => {
    const s = WATER_LILY_SPRITE;
    const lh = tileHash(pos.x, pos.y);
    items.push({ x: pos.x, y: pos.y, draw: () => {
      ctx.drawImage(ga.waterLily, s.sx, s.sy, s.sw, s.sh,
        pos.x * TILE_SIZE + (lh * 10) | 0, pos.y * TILE_SIZE + (lh * 8) | 0, 22, 18);
    }});
  });
  // Shrine label (pre-rendered since it's a fixed landmark)
  items.push({ x: 28, y: 62, draw: () => {
    ctx.font = '600 9px Inter, sans-serif';
    ctx.textAlign = 'center';
    const lbl = 'Shrine';
    const lm = ctx.measureText(lbl);
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.beginPath();
    ctx.roundRect(28 * TILE_SIZE + 16 - lm.width / 2 - 5, 62 * TILE_SIZE + TILE_SIZE + 8, lm.width + 10, 13, 3);
    ctx.fill();
    ctx.fillStyle = 'rgba(200,164,78,0.8)';
    ctx.fillText(lbl, 28 * TILE_SIZE + 16, 62 * TILE_SIZE + TILE_SIZE + 18);
  }});

  // ── Farmstead: fenced settlement south of town (52-58, 59-65) ──
  // Wooden fences along north and south edges
  [52, 55, 58].forEach(fx => {
    fix(fx, 59, () => {
      ctx.drawImage(ga.woodenFence, WOODEN_FENCE_SPRITE.sx, WOODEN_FENCE_SPRITE.sy, WOODEN_FENCE_SPRITE.sw, WOODEN_FENCE_SPRITE.sh,
        fx * TILE_SIZE - 8, 59 * TILE_SIZE + 2, 48, 24);
    });
    fix(fx, 65, () => {
      ctx.drawImage(ga.woodenFence, WOODEN_FENCE_SPRITE.sx, WOODEN_FENCE_SPRITE.sy, WOODEN_FENCE_SPRITE.sw, WOODEN_FENCE_SPRITE.sh,
        fx * TILE_SIZE - 8, 65 * TILE_SIZE + 2, 48, 24);
    });
  });
  // Farmstead supplies
  fix(53, 61, () => {
    ctx.drawImage(ga.market, BARREL_GROUP.sx, BARREL_GROUP.sy, BARREL_GROUP.sw, BARREL_GROUP.sh,
      53 * TILE_SIZE - 2, 61 * TILE_SIZE + 2, 36, 30);
  });
  fix(57, 63, () => {
    ctx.drawImage(ga.assets, CRATE_PILE_SPRITE.sx, CRATE_PILE_SPRITE.sy, CRATE_PILE_SPRITE.sw, CRATE_PILE_SPRITE.sh,
      57 * TILE_SIZE + 2, 63 * TILE_SIZE + 4, 28, 22);
  });
  fix(54, 63, () => {
    ctx.drawImage(ga.nature, BENCH_SPRITE.sx, BENCH_SPRITE.sy, BENCH_SPRITE.sw, BENCH_SPRITE.sh,
      54 * TILE_SIZE - 4, 63 * TILE_SIZE + 10, 40, 18);
  });
  // Campfire in farmstead yard
  items.push({ x: 56, y: 64, draw: () => {
    ctx.drawImage(ga.campfire, CAMPFIRE_SPRITE.sx, CAMPFIRE_SPRITE.sy, CAMPFIRE_SPRITE.sw, CAMPFIRE_SPRITE.sh,
      56 * TILE_SIZE + 2, 64 * TILE_SIZE + 2, TILE_SIZE - 4, TILE_SIZE - 4);
  }});
  fix(57, 64, () => {
    ctx.drawImage(ga.assets, LOG_SPRITE.sx, LOG_SPRITE.sy, LOG_SPRITE.sw, LOG_SPRITE.sh,
      57 * TILE_SIZE - 4, 64 * TILE_SIZE + 6, 40, 18);
  });
  // Sign at farmstead entrance
  fix(55, 59, () => {
    const src = SIGN_POST_SPRITES[1];
    ctx.drawImage(ga.assets, src.sx, src.sy, src.sw, src.sh,
      55 * TILE_SIZE + 4, 59 * TILE_SIZE - 20, 24, 36);
  });

  // ── Harbor: extended docks south (94-99, 46-52) ──
  // Additional pier
  items.push({ x: 98, y: 49, draw: () => {
    ctx.drawImage(ga.landingStage, ls.sx, ls.sy, ls.sw, ls.sh,
      98 * TILE_SIZE - 8, 49 * TILE_SIZE - 4, TILE_SIZE * 2.5, TILE_SIZE * 1.6);
  }});
  // Fish market canopy
  fix(95, 49, () => {
    const canopy = MARKET_CANOPY_SPRITES[1];
    ctx.drawImage(ga.market, MARKET_STALL.sx, MARKET_STALL.sy, MARKET_STALL.sw, MARKET_STALL.sh,
      95 * TILE_SIZE - 16, 49 * TILE_SIZE - 4, TILE_SIZE * 2.5, TILE_SIZE * 1.5);
    ctx.drawImage(ga.market, canopy.sx, canopy.sy, canopy.sw, canopy.sh,
      95 * TILE_SIZE - 20, 49 * TILE_SIZE - 32, TILE_SIZE * 3, TILE_SIZE * 1.8);
  });
  // Harbor cargo
  fix(94, 48, () => {
    ctx.drawImage(ga.market, BARREL_GROUP.sx, BARREL_GROUP.sy, BARREL_GROUP.sw, BARREL_GROUP.sh,
      94 * TILE_SIZE - 2, 48 * TILE_SIZE + 2, 36, 30);
  });
  fix(94, 50, () => {
    ctx.drawImage(ga.assets, CRATE_PILE_SPRITE.sx, CRATE_PILE_SPRITE.sy, CRATE_PILE_SPRITE.sw, CRATE_PILE_SPRITE.sh,
      94 * TILE_SIZE + 2, 50 * TILE_SIZE + 4, 28, 22);
  });
  fix(97, 47, () => {
    ctx.drawImage(ga.market, CRATE.sx, CRATE.sy, CRATE.sw, CRATE.sh,
      97 * TILE_SIZE + 4, 47 * TILE_SIZE + 4, 22, 26);
  });
  // Harbor fences along south edge
  [93, 95, 97].forEach(fx => {
    fix(fx, 52, () => {
      ctx.drawImage(ga.woodenFence, WOODEN_FENCE_SPRITE.sx, WOODEN_FENCE_SPRITE.sy, WOODEN_FENCE_SPRITE.sw, WOODEN_FENCE_SPRITE.sh,
        fx * TILE_SIZE - 8, 52 * TILE_SIZE + 2, 48, 24);
    });
  });
  // Food display at fish market
  fix(96, 49, () => {
    FOOD_SPRITES.forEach((src, i) => {
      ctx.drawImage(ga.market, src.sx, src.sy, src.sw, src.sh,
        96 * TILE_SIZE + 2 + i * 12, 49 * TILE_SIZE + 12, 14, 14);
    });
  });

  // ── Roadside rest stops ──
  // Forest road midpoint
  fix(38, 37, () => {
    ctx.drawImage(ga.nature, BENCH_SPRITE.sx, BENCH_SPRITE.sy, BENCH_SPRITE.sw, BENCH_SPRITE.sh,
      38 * TILE_SIZE - 4, 37 * TILE_SIZE + 10, 40, 18);
  });
  fix(39, 37, () => {
    ctx.drawImage(ga.market, BARREL.sx, BARREL.sy, BARREL.sw, BARREL.sh,
      39 * TILE_SIZE + 4, 37 * TILE_SIZE + 4, 22, 22);
  });
  // Coast road midpoint
  fix(76, 42, () => {
    ctx.drawImage(ga.nature, BENCH_SPRITE.sx, BENCH_SPRITE.sy, BENCH_SPRITE.sw, BENCH_SPRITE.sh,
      76 * TILE_SIZE - 4, 42 * TILE_SIZE + 10, 40, 18);
  });
  fix(77, 42, () => {
    const src = SIGN_POST_SPRITES[2];
    ctx.drawImage(ga.assets, src.sx, src.sy, src.sw, src.sh,
      77 * TILE_SIZE + 4, 42 * TILE_SIZE - 20, 24, 36);
  });
  // Ruins road waypoint
  items.push({ x: 50, y: 56, draw: () => {
    ctx.drawImage(ga.campfire, CAMPFIRE_SPRITE.sx, CAMPFIRE_SPRITE.sy, CAMPFIRE_SPRITE.sw, CAMPFIRE_SPRITE.sh,
      50 * TILE_SIZE + 2, 56 * TILE_SIZE + 2, TILE_SIZE - 4, TILE_SIZE - 4);
  }});
  fix(51, 56, () => {
    ctx.drawImage(ga.assets, LOG_SPRITE.sx, LOG_SPRITE.sy, LOG_SPRITE.sw, LOG_SPRITE.sh,
      51 * TILE_SIZE - 4, 56 * TILE_SIZE + 6, 40, 18);
  });

  // ── Outlying structures — sparse buildings along roads ──

  // Coast road cottage — small house between the rest stop and docks
  fix(83, 41, () => {
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.beginPath();
    ctx.ellipse(83 * TILE_SIZE + TILE_SIZE / 2, 41 * TILE_SIZE + TILE_SIZE + 4,
      TILE_SIZE * 1.2, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    const src = HOUSE_SPRITES[1];
    ctx.drawImage(ga.houses, src.sx, src.sy, src.sw, src.sh,
      83 * TILE_SIZE - TILE_SIZE, 41 * TILE_SIZE - TILE_SIZE * 2 + 10, TILE_SIZE * 3, TILE_SIZE * 3);
  });
  fix(84, 42, () => {
    ctx.drawImage(ga.market, BARREL.sx, BARREL.sy, BARREL.sw, BARREL.sh,
      84 * TILE_SIZE + 4, 42 * TILE_SIZE + 4, 22, 22);
  });
  fix(82, 42, () => {
    ctx.drawImage(ga.woodenFence, WOODEN_FENCE_SPRITE.sx, WOODEN_FENCE_SPRITE.sy,
      WOODEN_FENCE_SPRITE.sw, WOODEN_FENCE_SPRITE.sh,
      82 * TILE_SIZE - 8, 42 * TILE_SIZE + 4, 48, 24);
  });

  // Lakeside hermit hut — small cottage near the branch path toward the lake
  fix(38, 59, () => {
    ctx.fillStyle = 'rgba(0,0,0,0.10)';
    ctx.beginPath();
    ctx.ellipse(38 * TILE_SIZE + TILE_SIZE / 2, 59 * TILE_SIZE + TILE_SIZE + 4,
      TILE_SIZE * 1.1, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    const src = HOUSE_SPRITES[0];
    ctx.drawImage(ga.houses, src.sx, src.sy, src.sw, src.sh,
      38 * TILE_SIZE - TILE_SIZE, 59 * TILE_SIZE - TILE_SIZE * 2 + 10, TILE_SIZE * 3, TILE_SIZE * 3);
  });
  fix(39, 60, () => {
    ctx.drawImage(ga.nature, LOG_PILE_SPRITE.sx, LOG_PILE_SPRITE.sy, LOG_PILE_SPRITE.sw, LOG_PILE_SPRITE.sh,
      39 * TILE_SIZE - 2, 60 * TILE_SIZE + 6, 36, 22);
  });
  fix(37, 60, () => {
    ctx.drawImage(ga.market, CRATE.sx, CRATE.sy, CRATE.sw, CRATE.sh,
      37 * TILE_SIZE + 6, 60 * TILE_SIZE + 4, 20, 24);
  });

  // Northern waystation — small shelter on the highlands road
  fix(57, 28, () => {
    ctx.fillStyle = 'rgba(0,0,0,0.10)';
    ctx.beginPath();
    ctx.ellipse(57 * TILE_SIZE + TILE_SIZE / 2, 28 * TILE_SIZE + TILE_SIZE + 4,
      TILE_SIZE * 1.1, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    const src = HOUSE_SPRITES[2];
    ctx.drawImage(ga.houses, src.sx, src.sy, src.sw, src.sh,
      57 * TILE_SIZE - TILE_SIZE, 28 * TILE_SIZE - TILE_SIZE * 2 + 10, TILE_SIZE * 3, TILE_SIZE * 3);
  });
  fix(58, 29, () => {
    const src = SIGN_POST_SPRITES[1];
    ctx.drawImage(ga.assets, src.sx, src.sy, src.sw, src.sh,
      58 * TILE_SIZE + 4, 29 * TILE_SIZE - 20, 24, 36);
  });
  fix(56, 29, () => {
    ctx.drawImage(ga.woodenFence, WOODEN_FENCE_SPRITE.sx, WOODEN_FENCE_SPRITE.sy,
      WOODEN_FENCE_SPRITE.sw, WOODEN_FENCE_SPRITE.sh,
      56 * TILE_SIZE - 8, 29 * TILE_SIZE + 4, 48, 24);
  });

  // ── Northern Pass — zone exit gate (future zone connection) ──
  // Marble pillars flanking the north road
  [[55, 18], [57, 18]].forEach(([gx, gy]) => {
    fix(gx, gy, () => {
      ctx.fillStyle = 'rgba(200,140,50,0.06)';
      ctx.beginPath();
      ctx.arc(gx * TILE_SIZE + 16, gy * TILE_SIZE + 16, 20, 0, Math.PI * 2);
      ctx.fill();
      const ms = MARBLE_PILLAR_SPRITE;
      ctx.drawImage(ga.marbleFence, ms.sx, ms.sy, ms.sw, ms.sh,
        gx * TILE_SIZE + 6, gy * TILE_SIZE - 16, 18, 52);
    });
  });
  // Marble fence sections extending from pillars
  fix(54, 18, () => {
    const mf = MARBLE_FENCE_SPRITE;
    ctx.drawImage(ga.marbleFence, mf.sx, mf.sy, mf.sw, mf.sh,
      54 * TILE_SIZE - 6, 18 * TILE_SIZE + 2, 44, 28);
  });
  fix(58, 18, () => {
    const mf = MARBLE_FENCE_SPRITE;
    ctx.drawImage(ga.marbleFence, mf.sx, mf.sy, mf.sw, mf.sh,
      58 * TILE_SIZE - 6, 18 * TILE_SIZE + 2, 44, 28);
  });
  // Wooden fences extending further out
  fix(53, 18, () => {
    ctx.drawImage(ga.woodenFence, WOODEN_FENCE_SPRITE.sx, WOODEN_FENCE_SPRITE.sy,
      WOODEN_FENCE_SPRITE.sw, WOODEN_FENCE_SPRITE.sh,
      53 * TILE_SIZE - 8, 18 * TILE_SIZE + 4, 48, 24);
  });
  fix(59, 18, () => {
    ctx.drawImage(ga.woodenFence, WOODEN_FENCE_SPRITE.sx, WOODEN_FENCE_SPRITE.sy,
      WOODEN_FENCE_SPRITE.sw, WOODEN_FENCE_SPRITE.sh,
      59 * TILE_SIZE - 8, 18 * TILE_SIZE + 4, 48, 24);
  });
  // "Northern Pass" label
  items.push({ x: 56, y: 18, draw: () => {
    ctx.font = '600 9px Inter, sans-serif';
    ctx.textAlign = 'center';
    const lbl = 'Northern Pass';
    const lm = ctx.measureText(lbl);
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.beginPath();
    ctx.roundRect(56 * TILE_SIZE + 16 - lm.width / 2 - 5, 18 * TILE_SIZE + TILE_SIZE + 8, lm.width + 10, 13, 3);
    ctx.fill();
    ctx.fillStyle = 'rgba(200,164,78,0.8)';
    ctx.fillText(lbl, 56 * TILE_SIZE + 16, 18 * TILE_SIZE + TILE_SIZE + 18);
  }});
  // Signpost at gate
  fix(56, 19, () => {
    const src = SIGN_POST_SPRITES[0];
    ctx.drawImage(ga.assets, src.sx, src.sy, src.sw, src.sh,
      56 * TILE_SIZE + 4, 19 * TILE_SIZE - 20, 24, 36);
  });

  // ── Entity-surround props: dress each placed entity ──
  for (const pe of placedEntities) {
    const ex = pe.tileX, ey = pe.tileY;
    const eh = tileHash(ex * 7, ey * 13);

    if (pe.entity.type === 'LOCATION') {
      // Barrel beside building (tight, 1 tile offset)
      fix(ex + 1, ey + 1, () => {
        ctx.drawImage(ga.market, BARREL.sx, BARREL.sy, BARREL.sw, BARREL.sh,
          (ex + 1) * TILE_SIZE + 4, (ey + 1) * TILE_SIZE + 4, 22, 22);
      });
      // Bench or crate on the other side
      if (eh < 0.5) {
        fix(ex - 1, ey + 1, () => {
          ctx.drawImage(ga.nature, BENCH_SPRITE.sx, BENCH_SPRITE.sy, BENCH_SPRITE.sw, BENCH_SPRITE.sh,
            (ex - 1) * TILE_SIZE - 4, (ey + 1) * TILE_SIZE + 10, 40, 18);
        });
      } else {
        fix(ex - 1, ey, () => {
          ctx.drawImage(ga.market, CRATE.sx, CRATE.sy, CRATE.sw, CRATE.sh,
            (ex - 1) * TILE_SIZE + 6, ey * TILE_SIZE + 4, 20, 24);
        });
      }
      // Sack at front of building
      fix(ex, ey + 1, () => {
        ctx.drawImage(ga.market, SACK.sx, SACK.sy, SACK.sw, SACK.sh,
          ex * TILE_SIZE + 8, (ey + 1) * TILE_SIZE + 8, 18, 18);
      });
    }
  }

  // Sort by Y then draw
  items.sort((a, b) => a.y - b.y);
  for (const item of items) item.draw();

  return canvas;
}

// ══════════════════════════════════════════════════════════
//  Grassland Zone — separate off-hub area via Northern Pass
// ══════════════════════════════════════════════════════════

const GL_W = 80;
const GL_H = 60;

// Stream center y at each x column — sinusoidal winding
function streamCenterY(x: number): number {
  return 34 + Math.sin(x * 0.15) * 2.5 + Math.cos(x * 0.08 + 1) * 1.5;
}

function computeGrasslandTile(x: number, y: number): TileId {
  const h = tileHash(x + 2000, y + 2000);

  // Dense forest borders
  const bN = y / 2.5;
  const bS = (GL_H - 1 - y) / 2;
  const bW = x / 3;
  const bE = (GL_W - 1 - x) / 3;
  const bMin = Math.min(bN, bS, bW, bE);
  if (bMin < 0.6) return T.DENSE_FOREST;
  if (bMin < 1.2) return h < 0.4 ? T.DENSE_FOREST : T.FOREST;
  if (bMin < 1.8) return h < 0.2 ? T.FOREST : T.GRASS_DARK;

  // South entry corridor
  if (y >= GL_H - 4 && Math.abs(x - 40) < 4) return T.GRASS;

  // ── Stream (east-west around y=34) ──
  const scy = streamCenterY(x);
  const sd = Math.abs(y - scy);
  // Skip stream near bridge (x=38..42) and near borders
  if (x > 6 && x < GL_W - 6 && !(x >= 38 && x <= 42)) {
    if (sd < 0.8) return T.WATER;
    if (sd < 1.5) return T.SHALLOW;
    if (sd < 2.2) return T.SHORE;
  }

  // ── Small pond near forest clearing (18, 38) ──
  const pondD = ellipseDist(x, y, 18, 38, 3, 2.5);
  if (pondD < 0.5) return T.WATER;
  if (pondD < 0.75) return T.SHALLOW;
  if (pondD < 0.95) return T.SHORE;

  // Western pine forest
  if (x < 18) {
    if (h < 0.25) return T.DENSE_FOREST;
    if (h < 0.5) return T.FOREST;
    return T.GRASS_DARK;
  }
  if (x < 25) {
    if (h < 0.15) return T.FOREST;
    return h < 0.35 ? T.GRASS_DARK : T.GRASS;
  }

  // Eastern rocky hills
  if (x > 62) {
    if (h < 0.25) return T.ROCK;
    return T.HILLS;
  }
  if (x > 55) {
    if (h < 0.12) return T.ROCK;
    if (h < 0.3) return T.HILLS;
    return T.GRASS_DARK;
  }

  // Orc camp clearing (north center, ~40,12)
  const orcD = ellipseDist(x, y, 40, 12, 9, 6);
  if (orcD < 0.4) return h < 0.25 ? T.ROCK : T.HILLS;
  if (orcD < 0.7) return T.HILLS;
  if (orcD < 0.9) return T.GRASS_DARK;

  // Cave entrance area (62, 22) — darker rock
  const caveD = ellipseDist(x, y, 62, 22, 4, 3);
  if (caveD < 0.5) return T.ROCK;
  if (caveD < 0.8) return T.HILLS;

  if (h < 0.12) return T.GRASS_DARK;
  return T.GRASS;
}

function buildGrasslandMap(): TileId[][] {
  const map: TileId[][] = [];
  for (let y = 0; y < GL_H; y++) {
    map[y] = [];
    for (let x = 0; x < GL_W; x++) {
      map[y][x] = computeGrasslandTile(x, y);
    }
  }

  // Main north-south path (x=40)
  carvePath(map, 40, GL_H - 2, 40, 8, 1);
  // Branch east toward rocky overlook
  carvePath(map, 40, 28, 60, 28, 0);
  // Branch west toward forest clearing
  carvePath(map, 40, 32, 20, 32, 0);
  // Branch east toward cave entrance
  carvePath(map, 40, 22, 62, 22, 0);
  // Bridge crossing: carve grass at bridge position over stream
  for (let bx = 38; bx <= 42; bx++) {
    for (let by = 32; by <= 36; by++) {
      if (map[by] && map[by][bx] !== undefined) {
        const scy = streamCenterY(bx);
        if (Math.abs(by - scy) < 2.5) {
          map[by][bx] = T.PATH;
        }
      }
    }
  }

  return map;
}

function prerenderGrasslandTerrain(map: TileId[][]): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = GL_W * TILE_SIZE;
  canvas.height = GL_H * TILE_SIZE;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;

  // Helper: get color for a tile id
  const tileColor = (id: TileId): string => GRASSLAND_TERRAIN_COLORS[TILE_ID_NAMES[id] || 'grass'] || '#8cbd4c';

  for (let y = 0; y < GL_H; y++) {
    for (let x = 0; x < GL_W; x++) {
      const tileId = map[y][x];
      const px = x * TILE_SIZE;
      const py = y * TILE_SIZE;
      const h = tileHash(x + 2000, y + 2000);
      const h2 = tileHash(x + 2500, y + 2500);
      const h3 = tileHash(x + 3000, y + 3000);

      // Base color
      ctx.fillStyle = tileColor(tileId);
      ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);

      // ── Per-tile brightness variation ──
      if (h < 0.2) {
        ctx.fillStyle = 'rgba(255,255,255,0.04)';
        ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
      } else if (h > 0.8) {
        ctx.fillStyle = 'rgba(0,0,0,0.04)';
        ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
      }

      // ── Edge dithering: blend with neighboring tiles ──
      const neighbors = [
        [x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1],
      ];
      for (const [nx, ny] of neighbors) {
        if (nx >= 0 && nx < GL_W && ny >= 0 && ny < GL_H) {
          const nTile = map[ny][nx];
          if (nTile !== tileId) {
            const nColor = tileColor(nTile);
            // Scatter a few pixels of neighbor color along the border
            const edgeH = tileHash(x * 7 + nx * 13, y * 11 + ny * 17);
            if (edgeH < 0.45) {
              ctx.fillStyle = nColor;
              ctx.globalAlpha = 0.25;
              if (nx < x) { // neighbor is left
                ctx.fillRect(px, py + (edgeH * 28) | 0, 4 + (edgeH * 6) | 0, 4);
                if (edgeH < 0.25) ctx.fillRect(px, py + (edgeH * 20 + 8) | 0, 3, 3);
              } else if (nx > x) { // neighbor is right
                const w = 4 + (edgeH * 6) | 0;
                ctx.fillRect(px + TILE_SIZE - w, py + (edgeH * 28) | 0, w, 4);
                if (edgeH < 0.25) ctx.fillRect(px + TILE_SIZE - 3, py + (edgeH * 20 + 8) | 0, 3, 3);
              } else if (ny < y) { // neighbor is above
                ctx.fillRect(px + (edgeH * 28) | 0, py, 4, 4 + (edgeH * 6) | 0);
                if (edgeH < 0.25) ctx.fillRect(px + (edgeH * 20 + 8) | 0, py, 3, 3);
              } else { // neighbor is below
                const bh = 4 + (edgeH * 6) | 0;
                ctx.fillRect(px + (edgeH * 28) | 0, py + TILE_SIZE - bh, 4, bh);
                if (edgeH < 0.25) ctx.fillRect(px + (edgeH * 20 + 8) | 0, py + TILE_SIZE - 3, 3, 3);
              }
              ctx.globalAlpha = 1;
            }
          }
        }
      }

      // ── Terrain-specific texturing ──

      // Grass: subtle dots & small color variations
      if (tileId === T.GRASS || tileId === T.GRASS_DARK) {
        // Dark grass spots
        ctx.fillStyle = tileId === T.GRASS ? 'rgba(80,140,50,0.12)' : 'rgba(50,110,30,0.12)';
        for (let i = 0; i < 3; i++) {
          const dh = tileHash(x * 31 + i * 97, y * 47 + i * 53);
          ctx.fillRect(px + (dh * 28) | 0, py + (tileHash(x * 43 + i, y * 67 + i) * 28) | 0, 3, 3);
        }
        // Light grass highlights
        ctx.fillStyle = tileId === T.GRASS ? 'rgba(160,220,100,0.08)' : 'rgba(120,190,70,0.08)';
        if (h2 < 0.4) {
          ctx.fillRect(px + (h3 * 24) | 0, py + (h2 * 24) | 0, 5, 2);
          ctx.fillRect(px + (h * 20 + 4) | 0, py + (h3 * 20 + 8) | 0, 4, 2);
        }
      }

      // Water: wave patterns at multiple depths
      if (tileId === T.WATER || tileId === T.DEEP_WATER || tileId === T.SHALLOW) {
        // Ripple lines at varying positions
        ctx.fillStyle = tileId === T.DEEP_WATER ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.08)';
        const waveY1 = py + 4 + (h * 10) | 0;
        const waveY2 = py + 16 + (h2 * 10) | 0;
        ctx.fillRect(px + 2 + (h2 * 6) | 0, waveY1, TILE_SIZE - 8 - (h3 * 8) | 0, 1);
        ctx.fillRect(px + 6 + (h3 * 8) | 0, waveY2, TILE_SIZE - 14 - (h * 6) | 0, 1);
        // Subtle shimmer
        if (h > 0.7) {
          ctx.fillStyle = 'rgba(200,240,255,0.05)';
          ctx.fillRect(px + (h2 * 20) | 0, py + (h3 * 20) | 0, 6, 4);
        }
        // Deeper blue streaks in deep water
        if (tileId === T.DEEP_WATER && h < 0.3) {
          ctx.fillStyle = 'rgba(20,80,120,0.1)';
          ctx.fillRect(px + (h2 * 16) | 0, py + (h * 24) | 0, 10, 2);
        }
      }

      // Shore / Sand: granular texture
      if (tileId === T.SHORE || tileId === T.SAND) {
        ctx.fillStyle = 'rgba(255,255,240,0.06)';
        ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
        // Sand grains
        ctx.fillStyle = 'rgba(180,160,100,0.1)';
        for (let i = 0; i < 4; i++) {
          const gh = tileHash(x * 23 + i * 67, y * 37 + i * 89);
          ctx.fillRect(px + (gh * 28) | 0, py + (tileHash(x * 41 + i, y * 59 + i) * 28) | 0, 2, 2);
        }
      }

      // Forest/Dense Forest: darker dappled ground
      if (tileId === T.FOREST || tileId === T.DENSE_FOREST) {
        ctx.fillStyle = tileId === T.DENSE_FOREST ? 'rgba(0,0,0,0.06)' : 'rgba(0,0,0,0.03)';
        // Shadow dappling
        ctx.fillRect(px + (h * 12) | 0, py + (h2 * 12) | 0, 12, 8);
        ctx.fillRect(px + (h3 * 16 + 4) | 0, py + (h * 16 + 8) | 0, 8, 6);
        // Leaf litter highlights
        ctx.fillStyle = 'rgba(100,160,50,0.06)';
        ctx.fillRect(px + (h2 * 22) | 0, py + (h3 * 22) | 0, 4, 3);
      }

      // Hills: rougher texture with stone speckles
      if (tileId === T.HILLS) {
        ctx.fillStyle = 'rgba(140,120,80,0.08)';
        for (let i = 0; i < 3; i++) {
          const sh = tileHash(x * 29 + i * 71, y * 43 + i * 61);
          ctx.fillRect(px + (sh * 26) | 0, py + (tileHash(x * 37 + i, y * 53 + i) * 26) | 0, 4, 3);
        }
        // Subtle grass patches on hills
        if (h2 > 0.7) {
          ctx.fillStyle = 'rgba(100,160,60,0.08)';
          ctx.fillRect(px + (h * 18) | 0, py + (h3 * 18) | 0, 6, 4);
        }
      }

      // Rock: cracks and lichen
      if (tileId === T.ROCK) {
        ctx.fillStyle = 'rgba(0,0,0,0.06)';
        // Crack lines
        ctx.fillRect(px + (h * 20) | 0, py + 2, 1, (h2 * 14 + 8) | 0);
        ctx.fillRect(px + (h2 * 14 + 8) | 0, py + (h3 * 20) | 0, (h * 12 + 4) | 0, 1);
        // Lichen patches
        if (h > 0.6) {
          ctx.fillStyle = 'rgba(90,120,60,0.08)';
          ctx.fillRect(px + (h2 * 22) | 0, py + (h3 * 22) | 0, 5, 4);
        }
      }

      // Path: pebbles and worn texture
      if (tileId === T.PATH) {
        // Worn grooves
        ctx.fillStyle = 'rgba(0,0,0,0.05)';
        ctx.fillRect(px + 6, py + 4, TILE_SIZE - 12, 2);
        ctx.fillRect(px + 8, py + TILE_SIZE - 6, TILE_SIZE - 16, 2);
        // Pebble speckles
        ctx.fillStyle = 'rgba(160,130,80,0.12)';
        for (let i = 0; i < 5; i++) {
          const ph = tileHash(x * 19 + i * 83, y * 31 + i * 47);
          ctx.fillRect(px + (ph * 26 + 2) | 0, py + (tileHash(x * 41 + i, y * 67 + i) * 26 + 2) | 0, 2, 2);
        }
        // Lighter center
        ctx.fillStyle = 'rgba(255,255,220,0.04)';
        ctx.fillRect(px + 8, py + 8, TILE_SIZE - 16, TILE_SIZE - 16);
      }
    }
  }
  return canvas;
}

function prerenderGrasslandDeco(map: TileId[][], ga: GameAssets): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = GL_W * TILE_SIZE;
  canvas.height = GL_H * TILE_SIZE;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;

  const items: { x: number; y: number; draw: () => void }[] = [];
  const fix = (fx: number, fy: number, fn: () => void) => {
    items.push({ x: fx, y: fy, draw: fn });
  };
  // Helper to draw a single image (full source) at tile position with offset & size
  const img = (ga_img: HTMLImageElement, tx: number, ty: number, ox: number, oy: number, dw: number, dh: number) => {
    fix(tx, ty, () => {
      ctx.drawImage(ga_img, 0, 0, ga_img.naturalWidth, ga_img.naturalHeight,
        tx * TILE_SIZE + ox, ty * TILE_SIZE + oy, dw, dh);
    });
  };

  // ══════════════════════════════════════════════════════════
  //  PROCEDURAL VEGETATION — much denser than before
  // ══════════════════════════════════════════════════════════
  for (let y = 0; y < GL_H; y++) {
    for (let x = 0; x < GL_W; x++) {
      const tileId = map[y][x];
      const h = tileHash(x + 2000, y + 2000);
      const h2 = tileHash(x + 2500, y + 2500);
      const h3 = tileHash(x + 3000, y + 3000);
      const px = x * TILE_SIZE;
      const py = y * TILE_SIZE;

      // Pine trees in forest zones (higher density)
      if ((tileId === T.FOREST || tileId === T.DENSE_FOREST) && h < (tileId === T.DENSE_FOREST ? 0.45 : 0.3)) {
        const si = Math.floor(h2 * 100) % GL_PINE_SPRITES.length;
        const src = GL_PINE_SPRITES[si];
        const ox = (h2 * 8 - 4) | 0;
        items.push({ x, y, draw: () => {
          ctx.drawImage(ga.glPineTree, src.sx, src.sy, src.sw, src.sh,
            px - 16 + ox, py - 64, 64, 96);
        }});
      }

      // Deciduous trees mixed in (non-pine areas) — two color variants
      if (tileId === T.FOREST && h >= 0.3 && h < 0.4 && x > 20) {
        const treeImg = h2 < 0.5 ? ga.glTree1 : ga.glTree2;
        items.push({ x, y, draw: () => {
          ctx.drawImage(treeImg, 0, 0, treeImg.naturalWidth, treeImg.naturalHeight,
            px - 20, py - 72, 72, 100);
        }});
      }

      // Dead trees in rocky/hills areas and near orc camp
      if ((tileId === T.HILLS || tileId === T.ROCK) && h > 0.85) {
        items.push({ x, y, draw: () => {
          ctx.drawImage(ga.glDeadTree, 0, 0, ga.glDeadTree.naturalWidth, ga.glDeadTree.naturalHeight,
            px - 12, py - 60, 56, 84);
        }});
      }

      // Small pines on forest edge
      if (tileId === T.GRASS_DARK && h > 0.82 && x < 28) {
        const src = GL_PINE_SMALL[Math.floor(h2 * 100) % GL_PINE_SMALL.length];
        items.push({ x, y, draw: () => {
          ctx.drawImage(ga.glPineTree, src.sx, src.sy, src.sw, src.sh,
            px - 8, py - 40, 48, 72);
        }});
      }

      // Bushes — in grass_dark and hills areas
      if ((tileId === T.GRASS_DARK && h > 0.7 && h < 0.78) || (tileId === T.HILLS && h > 0.75)) {
        fix(x, y, () => {
          ctx.drawImage(ga.glBush, 0, 0, ga.glBush.naturalWidth, ga.glBush.naturalHeight,
            px - 4, py - 4, 36, 30);
        });
      }

      // Ground vegetation — scattered on grass
      if (tileId === T.GRASS && h > 0.72 && h < 0.78) {
        fix(x, y, () => {
          ctx.drawImage(ga.glVegetation, 0, 0, ga.glVegetation.naturalWidth, ga.glVegetation.naturalHeight,
            px + (h2 * 12) | 0, py + (h3 * 8) | 0, 24, 20);
        });
      }

      // Fallen trunks on forest floor
      if (tileId === T.FOREST && h > 0.85 && h2 < 0.4) {
        const trunk = h3 < 0.5 ? ga.glTrunk1 : ga.glTrunk2;
        fix(x, y, () => {
          ctx.drawImage(trunk, 0, 0, trunk.naturalWidth, trunk.naturalHeight,
            px - 8, py + 4, 48, 24);
        });
      }

      // Rocks using grassland pack rocks — in hills/rocky areas (higher density)
      if (tileId === T.ROCK && h > 0.4) {
        const rockImg = h2 < 0.33 ? ga.glRock1 : h2 < 0.66 ? ga.glRock2 : ga.glRockSmall;
        const rs = rockImg === ga.glRockSmall ? 24 : 36;
        fix(x, y, () => {
          ctx.drawImage(rockImg, 0, 0, rockImg.naturalWidth, rockImg.naturalHeight,
            px + (h3 * 6) | 0, py + (h2 * 4) | 0, rs, rs * 0.8);
        });
      }

      // Small rocks on hills
      if (tileId === T.HILLS && h > 0.82 && h2 > 0.5) {
        fix(x, y, () => {
          ctx.drawImage(ga.glRockSmall, 0, 0, ga.glRockSmall.naturalWidth, ga.glRockSmall.naturalHeight,
            px + (h3 * 14) | 0, py + (h * 10) | 0, 20, 16);
        });
      }

      // Grass detail sprites (flowers, tufts)
      if (tileId === T.GRASS && h > 0.78) {
        const src = GRASS_DETAIL_SPRITES[Math.floor(h2 * 100) % GRASS_DETAIL_SPRITES.length];
        fix(x, y, () => {
          ctx.drawImage(ga.assets, src.sx, src.sy, src.sw, src.sh,
            px + (h2 * 16) | 0, py + (h * 12) | 0, 14, 14);
        });
      }

      // Individual flowers on grass (pack flowers — 32x32 sprites)
      if (tileId === T.GRASS && h > 0.62 && h < 0.68) {
        const flowers = [ga.glFlower1, ga.glFlower2, ga.glFlower3, ga.glFlower4];
        const flowerImg = flowers[Math.floor(h2 * 100) % flowers.length];
        fix(x, y, () => {
          ctx.drawImage(flowerImg, 0, 0, 32, 32,
            px + (h3 * 18) | 0, py + (h2 * 14) | 0, 18, 18);
        });
      }
      // Second scatter of flowers on dark grass near paths
      if (tileId === T.GRASS_DARK && h > 0.55 && h < 0.6) {
        const flowers = [ga.glFlower1, ga.glFlower2, ga.glFlower3, ga.glFlower4];
        const flowerImg = flowers[Math.floor(h3 * 100) % flowers.length];
        fix(x, y, () => {
          ctx.drawImage(flowerImg, 0, 0, 32, 32,
            px + (h * 16) | 0, py + (h2 * 12) | 0, 16, 16);
        });
      }

      // Mushrooms in forest areas and near pond
      if ((tileId === T.FOREST || tileId === T.DENSE_FOREST) && h > 0.78 && h < 0.82) {
        const mushImg = h2 < 0.5 ? ga.glMushroom1 : ga.glMushroom2;
        fix(x, y, () => {
          ctx.drawImage(mushImg, 0, 0, 32, 32,
            px + (h3 * 18) | 0, py + (h * 14 + 6) | 0, 14, 14);
        });
      }
      // Mushrooms near pond
      if (tileId === T.SHORE && h > 0.45 && h < 0.55) {
        const pondDist = ellipseDist(x, y, 18, 38, 3, 2.5);
        if (pondDist < 1.2) {
          const mushImg = h2 < 0.5 ? ga.glMushroom1 : ga.glMushroom2;
          fix(x, y, () => {
            ctx.drawImage(mushImg, 0, 0, 32, 32,
              px + (h3 * 16) | 0, py + (h * 10 + 4) | 0, 14, 14);
          });
        }
      }

      // Shore rocks and vegetation near water
      if (tileId === T.SHORE && h > 0.6) {
        fix(x, y, () => {
          ctx.drawImage(ga.glRockSmall, 0, 0, ga.glRockSmall.naturalWidth, ga.glRockSmall.naturalHeight,
            px + (h2 * 10) | 0, py + (h3 * 8) | 0, 16, 12);
        });
      }
      if (tileId === T.SHORE && h < 0.3) {
        fix(x, y, () => {
          ctx.drawImage(ga.glVegetation, 0, 0, ga.glVegetation.naturalWidth, ga.glVegetation.naturalHeight,
            px + (h3 * 10) | 0, py + 2, 20, 16);
        });
      }
    }
  }

  // ══════════════════════════════════════════════════════════
  //  ORC STRONGHOLD — north center (around 40, 12)
  // ══════════════════════════════════════════════════════════

  // Dragon fossil — massive centerpiece behind shrine
  items.push({ x: 37, y: 5, draw: () => {
    ctx.drawImage(ga.glDragonFossil, 0, 0, 544, 288,
      37 * TILE_SIZE - 32, 5 * TILE_SIZE - 16, 300, 158);
  }});

  // Ancient Shrine (center)
  items.push({ x: 40, y: 12, draw: () => {
    ctx.drawImage(ga.glShrine, GL_SHRINE.sx, GL_SHRINE.sy, GL_SHRINE.sw, GL_SHRINE.sh,
      40 * TILE_SIZE - 48, 12 * TILE_SIZE - 32, 128, 96);
  }});
  fix(40, 12, () => {
    ctx.fillStyle = 'rgba(200,80,80,0.08)';
    ctx.beginPath(); ctx.arc(40 * TILE_SIZE + 16, 12 * TILE_SIZE + 16, 32, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(200,80,80,0.18)';
    ctx.beginPath(); ctx.arc(40 * TILE_SIZE + 16, 12 * TILE_SIZE + 16, 16, 0, Math.PI * 2); ctx.fill();
  });
  items.push({ x: 40, y: 13, draw: () => {
    ctx.font = '600 10px Inter, sans-serif'; ctx.textAlign = 'center';
    const lbl = 'Ancient Shrine'; const lm = ctx.measureText(lbl);
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.beginPath();
    ctx.roundRect(40 * TILE_SIZE + 16 - lm.width / 2 - 5, 13 * TILE_SIZE + 8, lm.width + 10, 14, 3); ctx.fill();
    ctx.fillStyle = 'rgba(220,100,80,0.85)'; ctx.fillText(lbl, 40 * TILE_SIZE + 16, 13 * TILE_SIZE + 19);
  }});

  // Altar near shrine
  fix(38, 11, () => {
    ctx.drawImage(ga.glAltar, 0, 0, 288, 224, 38 * TILE_SIZE - 32, 11 * TILE_SIZE - 24, 96, 72);
  });

  // Throne (orc chief seat) behind shrine
  fix(40, 9, () => {
    ctx.drawImage(ga.glThrone, 0, 0, 192, 128, 40 * TILE_SIZE - 8, 9 * TILE_SIZE - 8, 64, 44);
  });

  // Weapon rack near throne
  img(ga.glWeaponRack, 42, 9, -4, -12, 48, 52);

  // Wooden table (war council)
  img(ga.glWoodenTable, 38, 9, -8, 0, 56, 40);

  // Enemy tents (3 total — flanking + scout tent)
  fix(32, 10, () => { ctx.drawImage(ga.glTent1, 0, 0, 320, 288, 32 * TILE_SIZE - 24, 10 * TILE_SIZE - 56, 128, 116); });
  fix(48, 10, () => { ctx.drawImage(ga.glTent2, 0, 0, 320, 288, 48 * TILE_SIZE - 24, 10 * TILE_SIZE - 56, 128, 116); });
  fix(40, 7, () => { ctx.drawImage(ga.glTent1, 0, 0, 320, 288, 40 * TILE_SIZE - 20, 7 * TILE_SIZE - 48, 100, 90); });

  // Weapon racks near tents
  img(ga.glWeaponRack, 34, 12, 0, -8, 44, 48);
  img(ga.glWeaponRack, 46, 12, 0, -8, 44, 48);

  // Watchtower at camp entrance (south)
  fix(40, 18, () => {
    ctx.drawImage(ga.glWatchtower, 0, 0, 128, 224, 40 * TILE_SIZE - 12, 18 * TILE_SIZE - 64, 56, 96);
  });

  // Stronghold walls — horizontal sections (north, connecting to gate)
  [32, 34, 36, 44, 46, 48].forEach(wx => {
    fix(wx, 18, () => {
      ctx.drawImage(ga.glStrongWall, 0, 0, ga.glStrongWall.naturalWidth, ga.glStrongWall.naturalHeight,
        wx * TILE_SIZE - 8, 18 * TILE_SIZE - 4, 48, 40);
    });
  });

  // Stronghold gate (left and right sections flanking watchtower)
  fix(38, 18, () => {
    ctx.drawImage(ga.glStrongGateL, 0, 0, ga.glStrongGateL.naturalWidth, ga.glStrongGateL.naturalHeight,
      38 * TILE_SIZE - 4, 18 * TILE_SIZE - 16, 48, 56);
  });
  fix(42, 18, () => {
    ctx.drawImage(ga.glStrongGateR, 0, 0, ga.glStrongGateR.naturalWidth, ga.glStrongGateR.naturalHeight,
      42 * TILE_SIZE - 8, 18 * TILE_SIZE - 16, 48, 56);
  });

  // Stronghold vertical walls (east and west flanks of fortress)
  [8, 10, 12, 14, 16].forEach(wy => {
    fix(31, wy, () => {
      ctx.drawImage(ga.glStrongVertical, 0, 0, 128, 128,
        31 * TILE_SIZE - 12, wy * TILE_SIZE - 8, 56, 48);
    });
    fix(49, wy, () => {
      ctx.drawImage(ga.glStrongVertical, 0, 0, 128, 128,
        49 * TILE_SIZE - 12, wy * TILE_SIZE - 8, 56, 48);
    });
  });

  // Spikes outside the walls
  [31, 33, 35, 45, 47, 49].forEach(sx => {
    fix(sx, 19, () => {
      ctx.drawImage(ga.glSpike, 0, 0, ga.glSpike.naturalWidth, ga.glSpike.naturalHeight,
        sx * TILE_SIZE, 19 * TILE_SIZE - 4, 32, 36);
    });
  });

  // Barricades along flanks (vertical)
  [8, 10, 12, 14, 16].forEach(by => {
    fix(31, by, () => {
      ctx.drawImage(ga.glBarricade, 0, 0, 64, 64, 31 * TILE_SIZE - 4, by * TILE_SIZE + 4, 40, 40);
    });
    fix(49, by, () => {
      ctx.drawImage(ga.glBarricade, 0, 0, 64, 64, 49 * TILE_SIZE - 4, by * TILE_SIZE + 4, 40, 40);
    });
  });

  // Bones scattered around camp
  [[33, 8], [47, 8], [35, 15], [45, 15], [34, 13], [46, 13], [37, 7], [43, 7], [36, 17], [44, 17]].forEach(([bx, by]) => {
    fix(bx, by, () => {
      ctx.drawImage(ga.glBoneBig, 0, 0, 64, 128, bx * TILE_SIZE - 4, by * TILE_SIZE - 16, 24, 48);
    });
  });

  // Barrels + crates inside camp
  [[33, 11], [47, 11], [36, 14], [44, 14], [39, 16]].forEach(([bx, by]) => {
    fix(bx, by, () => {
      ctx.drawImage(ga.glBarrel, 0, 0, 32, 64, bx * TILE_SIZE + 4, by * TILE_SIZE - 8, 24, 44);
    });
  });
  [[35, 11], [45, 11], [41, 16]].forEach(([cx, cy]) => {
    fix(cx, cy, () => {
      ctx.drawImage(ga.glCrate, 0, 0, ga.glCrate.naturalWidth, ga.glCrate.naturalHeight,
        cx * TILE_SIZE + 2, cy * TILE_SIZE, 28, 28);
    });
  });

  // Wood log piles (firewood)
  img(ga.glWoodLogBig, 34, 10, -8, 4, 52, 36);
  img(ga.glWoodLogMed, 46, 10, 0, 6, 40, 28);

  // Lamp posts inside camp
  [[38, 18], [42, 18], [36, 10], [44, 10]].forEach(([lx, ly]) => {
    fix(lx, ly, () => {
      ctx.drawImage(ga.glLampPost, 0, 0, 64, 96, lx * TILE_SIZE + 4, ly * TILE_SIZE - 28, 28, 44);
    });
  });

  // Dead trees around camp perimeter (deforestation)
  [[30, 7], [50, 7], [30, 15], [50, 15], [33, 19]].forEach(([dx, dy]) => {
    items.push({ x: dx, y: dy, draw: () => {
      ctx.drawImage(ga.glDeadTree, 0, 0, ga.glDeadTree.naturalWidth, ga.glDeadTree.naturalHeight,
        dx * TILE_SIZE - 10, dy * TILE_SIZE - 56, 52, 80);
    }});
  });

  // ══════════════════════════════════════════════════════════
  //  RUINED CARRIAGE — northwest (18, 8)
  // ══════════════════════════════════════════════════════════
  items.push({ x: 18, y: 8, draw: () => {
    ctx.drawImage(ga.glCarriage, 0, 0, ga.glCarriage.naturalWidth, ga.glCarriage.naturalHeight,
      18 * TILE_SIZE - 32, 8 * TILE_SIZE - 24, 128, 80);
  }});
  img(ga.glCrate, 20, 9, 4, 0, 28, 28);
  img(ga.glCrate, 21, 8, 0, 4, 26, 26);
  img(ga.glBarrel, 17, 9, 4, -6, 24, 44);
  img(ga.glBarrel, 16, 8, 6, -4, 22, 40);
  // Scattered bones (ambush scene)
  fix(19, 7, () => {
    ctx.drawImage(ga.glBoneBig, 0, 0, 64, 128, 19 * TILE_SIZE + 2, 7 * TILE_SIZE - 4, 18, 36);
  });
  fix(20, 10, () => {
    ctx.drawImage(ga.glBoneBig, 0, 0, 64, 128, 20 * TILE_SIZE + 8, 10 * TILE_SIZE + 2, 16, 32);
  });
  // Broken weapon rack (looted)
  img(ga.glWeaponRack, 16, 7, 0, -8, 40, 44);
  // Fallen trunk blocking the road
  img(ga.glTrunk2, 15, 9, -8, 4, 48, 24);
  // Signpost (warning)
  img(ga.glSign, 21, 10, 4, -16, 28, 40);
  // Rocks scattered from the crash
  img(ga.glRockSmall, 17, 10, 8, 6, 18, 14);
  img(ga.glRockSmall, 20, 7, 4, 10, 16, 12);
  items.push({ x: 18, y: 10, draw: () => {
    ctx.font = '600 9px Inter, sans-serif'; ctx.textAlign = 'center';
    const lbl = 'Ruined Cart'; const lm = ctx.measureText(lbl);
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.beginPath();
    ctx.roundRect(18 * TILE_SIZE + 16 - lm.width / 2 - 4, 10 * TILE_SIZE + TILE_SIZE + 4, lm.width + 8, 12, 3); ctx.fill();
    ctx.fillStyle = 'rgba(180,140,80,0.7)'; ctx.fillText(lbl, 18 * TILE_SIZE + 16, 10 * TILE_SIZE + TILE_SIZE + 13);
  }});

  // ══════════════════════════════════════════════════════════
  //  VENDOR CAMP — south center (around 40, 47)
  // ══════════════════════════════════════════════════════════

  // Cabin
  fix(43, 45, () => {
    ctx.drawImage(ga.glCabin, 0, 0, 480, 384, 43 * TILE_SIZE - 32, 45 * TILE_SIZE - 80, 192, 154);
  });

  // Water well
  img(ga.glWaterwell, 37, 46, -8, -16, 48, 52);

  // Wooden table
  img(ga.glWoodenTable, 38, 49, -8, 0, 56, 40);

  // Training dummy
  fix(36, 48, () => {
    ctx.drawImage(ga.glDummy, 0, 0, GL_DUMMY_FW, GL_DUMMY_FH, 36 * TILE_SIZE - 16, 48 * TILE_SIZE - 28, 56, 56);
  });

  // Barrels and crates organized
  [[38, 47], [42, 50], [44, 49]].forEach(([bx, by]) => {
    fix(bx, by, () => {
      ctx.drawImage(ga.glBarrel, 0, 0, 32, 64, bx * TILE_SIZE + 4, by * TILE_SIZE - 8, 24, 44);
    });
  });
  [[39, 47], [43, 50]].forEach(([cx, cy]) => {
    fix(cx, cy, () => {
      ctx.drawImage(ga.glCrate, 0, 0, ga.glCrate.naturalWidth, ga.glCrate.naturalHeight,
        cx * TILE_SIZE + 2, cy * TILE_SIZE, 28, 28);
    });
  });

  // Wood logs stacked
  img(ga.glWoodLogBig, 45, 48, -8, 4, 52, 36);
  img(ga.glWoodLogMed, 46, 47, 0, 6, 40, 28);

  // Bench & log pile
  fix(42, 48, () => {
    ctx.drawImage(ga.nature, BENCH_SPRITE.sx, BENCH_SPRITE.sy, BENCH_SPRITE.sw, BENCH_SPRITE.sh,
      42 * TILE_SIZE - 4, 48 * TILE_SIZE + 10, 40, 18);
  });
  fix(44, 48, () => {
    ctx.drawImage(ga.nature, LOG_PILE_SPRITE.sx, LOG_PILE_SPRITE.sy, LOG_PILE_SPRITE.sw, LOG_PILE_SPRITE.sh,
      44 * TILE_SIZE - 2, 48 * TILE_SIZE + 6, 36, 22);
  });

  // Fence perimeter around vendor camp
  [36, 38, 40, 42, 44, 46].forEach(fx => {
    fix(fx, 44, () => {
      ctx.drawImage(ga.glFence, 0, 0, ga.glFence.naturalWidth, ga.glFence.naturalHeight,
        fx * TILE_SIZE - 4, 44 * TILE_SIZE - 4, 40, 32);
    });
    fix(fx, 51, () => {
      ctx.drawImage(ga.glFence, 0, 0, ga.glFence.naturalWidth, ga.glFence.naturalHeight,
        fx * TILE_SIZE - 4, 51 * TILE_SIZE - 4, 40, 32);
    });
  });
  // Fence gate at entrance
  fix(40, 51, () => {
    ctx.drawImage(ga.glFenceGate, 0, 0, ga.glFenceGate.naturalWidth, ga.glFenceGate.naturalHeight,
      40 * TILE_SIZE - 8, 51 * TILE_SIZE - 8, 48, 40);
  });

  // Lamp posts at vendor camp
  [[37, 44], [43, 44], [39, 51], [41, 51]].forEach(([lx, ly]) => {
    fix(lx, ly, () => {
      ctx.drawImage(ga.glLampPost, 0, 0, 64, 96, lx * TILE_SIZE + 4, ly * TILE_SIZE - 28, 28, 44);
    });
  });

  // Signs
  img(ga.glSign, 41, 52, 4, -16, 28, 40);
  fix(39, 55, () => {
    const src = SIGN_POST_SPRITES[0];
    ctx.drawImage(ga.assets, src.sx, src.sy, src.sw, src.sh, 39 * TILE_SIZE + 4, 55 * TILE_SIZE - 20, 24, 36);
  });
  // Flowers decorating vendor camp exterior
  [[36, 45], [46, 45], [37, 50], [43, 52], [45, 50]].forEach(([fx, fy], i) => {
    const flowerImgs = [ga.glFlower1, ga.glFlower3, ga.glFlower2, ga.glFlower4, ga.glFlower1];
    fix(fx, fy, () => {
      ctx.drawImage(flowerImgs[i], 0, 0, 32, 32, fx * TILE_SIZE + 4, fy * TILE_SIZE + 8, 18, 18);
    });
  });

  // ══════════════════════════════════════════════════════════
  //  CAVE ENTRANCE — east (62, 22)
  // ══════════════════════════════════════════════════════════
  items.push({ x: 62, y: 22, draw: () => {
    ctx.drawImage(ga.glCaveEntrance, 0, 0, ga.glCaveEntrance.naturalWidth, ga.glCaveEntrance.naturalHeight,
      62 * TILE_SIZE - 40, 22 * TILE_SIZE - 32, 120, 80);
  }});
  // Rocks around cave
  img(ga.glRock1, 60, 21, 0, 4, 32, 28);
  img(ga.glRock2, 64, 23, 0, 2, 32, 28);
  img(ga.glRockSmall, 61, 24, 8, 4, 20, 16);
  // Explorer's stash
  img(ga.glBarrel, 60, 23, 4, -6, 24, 44);
  img(ga.glCrate, 61, 23, 2, 0, 28, 28);
  // Bones near cave
  fix(63, 24, () => {
    ctx.drawImage(ga.glBoneBig, 0, 0, 64, 128, 63 * TILE_SIZE - 4, 24 * TILE_SIZE - 16, 24, 48);
  });
  // Warning sign
  img(ga.glSign, 60, 22, 4, -16, 28, 40);
  // Dead trees near cave entrance
  items.push({ x: 59, y: 21, draw: () => {
    ctx.drawImage(ga.glDeadTree, 0, 0, ga.glDeadTree.naturalWidth, ga.glDeadTree.naturalHeight,
      59 * TILE_SIZE - 8, 21 * TILE_SIZE - 52, 48, 72);
  }});
  items.push({ x: 65, y: 22, draw: () => {
    ctx.drawImage(ga.glDeadTree, 0, 0, ga.glDeadTree.naturalWidth, ga.glDeadTree.naturalHeight,
      65 * TILE_SIZE - 8, 22 * TILE_SIZE - 52, 48, 72);
  }});
  // Additional bones scattered further out
  fix(61, 20, () => {
    ctx.drawImage(ga.glBoneBig, 0, 0, 64, 128, 61 * TILE_SIZE, 20 * TILE_SIZE - 8, 20, 40);
  });
  fix(64, 21, () => {
    ctx.drawImage(ga.glBoneBig, 0, 0, 64, 128, 64 * TILE_SIZE + 6, 21 * TILE_SIZE - 4, 18, 36);
  });
  // Mushrooms in damp cave area
  fix(60, 24, () => {
    ctx.drawImage(ga.glMushroom1, 0, 0, 32, 32, 60 * TILE_SIZE + 8, 24 * TILE_SIZE + 10, 14, 14);
  });
  fix(63, 21, () => {
    ctx.drawImage(ga.glMushroom2, 0, 0, 32, 32, 63 * TILE_SIZE + 12, 21 * TILE_SIZE + 12, 14, 14);
  });
  // Dark atmosphere overlay — larger, darker
  fix(62, 22, () => {
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.beginPath(); ctx.ellipse(62 * TILE_SIZE + 16, 22 * TILE_SIZE + 16, 64, 48, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    ctx.beginPath(); ctx.ellipse(62 * TILE_SIZE + 16, 22 * TILE_SIZE + 16, 96, 64, 0, 0, Math.PI * 2); ctx.fill();
  });
  // Label
  items.push({ x: 62, y: 23, draw: () => {
    ctx.font = '600 9px Inter, sans-serif'; ctx.textAlign = 'center';
    const lbl = 'Dark Cave'; const lm = ctx.measureText(lbl);
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.beginPath();
    ctx.roundRect(62 * TILE_SIZE + 16 - lm.width / 2 - 4, 23 * TILE_SIZE + TILE_SIZE + 4, lm.width + 8, 12, 3); ctx.fill();
    ctx.fillStyle = 'rgba(140,100,180,0.8)'; ctx.fillText(lbl, 62 * TILE_SIZE + 16, 23 * TILE_SIZE + TILE_SIZE + 13);
  }});

  // ══════════════════════════════════════════════════════════
  //  STONE BRIDGE — stream crossing (~40, 34)
  // ══════════════════════════════════════════════════════════
  items.push({ x: 40, y: 34, draw: () => {
    ctx.drawImage(ga.glStoneBridge, 0, 0, ga.glStoneBridge.naturalWidth, ga.glStoneBridge.naturalHeight,
      38 * TILE_SIZE - 8, 33 * TILE_SIZE - 8, 160, 96);
  }});
  // Rocks along stream banks near bridge
  img(ga.glRock1, 36, 33, -4, 4, 32, 28);
  img(ga.glRock2, 44, 35, 0, 2, 32, 28);
  img(ga.glRockSmall, 37, 36, 8, 0, 20, 16);
  img(ga.glRockSmall, 43, 33, 4, 4, 20, 16);
  img(ga.glRockSmall, 36, 35, 4, 8, 18, 14);
  img(ga.glRock1, 44, 33, -6, 6, 28, 24);
  // Vegetation along banks
  img(ga.glVegetation, 35, 33, 0, 2, 24, 20);
  img(ga.glVegetation, 45, 35, 4, 0, 24, 20);
  img(ga.glVegetation, 37, 35, 6, 4, 20, 16);
  img(ga.glVegetation, 43, 34, 0, 2, 22, 18);
  // Flowers along stream banks
  fix(35, 34, () => { ctx.drawImage(ga.glFlower2, 0, 0, 32, 32, 35 * TILE_SIZE + 2, 34 * TILE_SIZE + 6, 16, 16); });
  fix(44, 34, () => { ctx.drawImage(ga.glFlower3, 0, 0, 32, 32, 44 * TILE_SIZE + 12, 34 * TILE_SIZE + 4, 16, 16); });
  fix(46, 35, () => { ctx.drawImage(ga.glFlower1, 0, 0, 32, 32, 46 * TILE_SIZE + 4, 35 * TILE_SIZE + 8, 16, 16); });
  // Stream crossing label
  items.push({ x: 40, y: 35, draw: () => {
    ctx.font = '600 9px Inter, sans-serif'; ctx.textAlign = 'center';
    const lbl = 'Stone Bridge'; const lm = ctx.measureText(lbl);
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.beginPath();
    ctx.roundRect(40 * TILE_SIZE + 16 - lm.width / 2 - 4, 35 * TILE_SIZE + TILE_SIZE + 4, lm.width + 8, 12, 3); ctx.fill();
    ctx.fillStyle = 'rgba(100,160,200,0.7)'; ctx.fillText(lbl, 40 * TILE_SIZE + 16, 35 * TILE_SIZE + TILE_SIZE + 13);
  }});

  // ══════════════════════════════════════════════════════════
  //  ROCKY OVERLOOK — east branch (60, 28)
  // ══════════════════════════════════════════════════════════
  // Dense rock cluster
  img(ga.glRock1, 59, 27, -4, 0, 40, 34);
  img(ga.glRock2, 61, 28, 0, -2, 36, 30);
  img(ga.glRock1, 60, 29, 4, 2, 36, 30);
  img(ga.glRockSmall, 58, 28, 8, 4, 22, 18);
  img(ga.glRockSmall, 62, 27, 0, 6, 22, 18);
  img(ga.glRockSmall, 61, 30, 4, 0, 20, 16);
  // Fallen trunk
  img(ga.glTrunk1, 58, 29, -8, 4, 48, 24);
  // Dead tree (windswept)
  items.push({ x: 63, y: 28, draw: () => {
    ctx.drawImage(ga.glDeadTree, 0, 0, ga.glDeadTree.naturalWidth, ga.glDeadTree.naturalHeight,
      63 * TILE_SIZE - 10, 28 * TILE_SIZE - 56, 52, 80);
  }});
  // Signpost
  img(ga.glSign, 58, 27, 4, -16, 28, 40);
  // Barrel
  img(ga.glBarrel, 59, 29, 4, -4, 24, 44);
  // Lamp post
  fix(57, 28, () => {
    ctx.drawImage(ga.glLampPost, 0, 0, 64, 96, 57 * TILE_SIZE + 4, 28 * TILE_SIZE - 28, 28, 44);
  });
  // Label
  items.push({ x: 60, y: 29, draw: () => {
    ctx.font = '600 9px Inter, sans-serif'; ctx.textAlign = 'center';
    const lbl = 'Overlook'; const lm = ctx.measureText(lbl);
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.beginPath();
    ctx.roundRect(60 * TILE_SIZE + 16 - lm.width / 2 - 4, 29 * TILE_SIZE + TILE_SIZE + 8, lm.width + 8, 12, 3); ctx.fill();
    ctx.fillStyle = 'rgba(200,164,78,0.7)'; ctx.fillText(lbl, 60 * TILE_SIZE + 16, 29 * TILE_SIZE + TILE_SIZE + 17);
  }});

  // ══════════════════════════════════════════════════════════
  //  FOREST CLEARING — west branch (20, 32)
  // ══════════════════════════════════════════════════════════
  // Stumps and logs (logging site)
  fix(19, 31, () => {
    ctx.drawImage(ga.assets, STUMP_SPRITE.sx, STUMP_SPRITE.sy, STUMP_SPRITE.sw, STUMP_SPRITE.sh,
      19 * TILE_SIZE + 2, 31 * TILE_SIZE + 8, 28, 22);
  });
  fix(22, 33, () => {
    ctx.drawImage(ga.assets, STUMP_SPRITE.sx, STUMP_SPRITE.sy, STUMP_SPRITE.sw, STUMP_SPRITE.sh,
      22 * TILE_SIZE + 4, 33 * TILE_SIZE + 6, 28, 22);
  });
  fix(21, 31, () => {
    ctx.drawImage(ga.assets, LOG_SPRITE.sx, LOG_SPRITE.sy, LOG_SPRITE.sw, LOG_SPRITE.sh,
      21 * TILE_SIZE - 4, 31 * TILE_SIZE + 6, 40, 18);
  });
  // Fallen trunks
  img(ga.glTrunk1, 18, 33, -8, 4, 48, 24);
  img(ga.glTrunk2, 22, 31, -4, 6, 44, 22);
  // Bush clusters
  img(ga.glBush, 17, 32, -4, -4, 36, 30);
  img(ga.glBush, 23, 32, 4, 0, 36, 30);
  // Deciduous trees (color variant) at clearing edges
  items.push({ x: 17, y: 30, draw: () => {
    ctx.drawImage(ga.glTree2, 0, 0, ga.glTree2.naturalWidth, ga.glTree2.naturalHeight,
      17 * TILE_SIZE - 16, 30 * TILE_SIZE - 68, 64, 92);
  }});
  items.push({ x: 23, y: 34, draw: () => {
    ctx.drawImage(ga.glTree2, 0, 0, ga.glTree2.naturalWidth, ga.glTree2.naturalHeight,
      23 * TILE_SIZE - 16, 34 * TILE_SIZE - 68, 64, 92);
  }});
  // Wildflowers around clearing edges
  [[18, 30], [21, 30], [23, 31], [17, 33], [19, 34], [22, 34]].forEach(([fx, fy], i) => {
    const flowerImgs = [ga.glFlower1, ga.glFlower2, ga.glFlower3, ga.glFlower4];
    const fImg = flowerImgs[i % flowerImgs.length];
    fix(fx, fy, () => {
      ctx.drawImage(fImg, 0, 0, 32, 32, fx * TILE_SIZE + 6, fy * TILE_SIZE + 8, 20, 20);
    });
  });
  // Mushrooms near stumps
  fix(19, 32, () => {
    ctx.drawImage(ga.glMushroom1, 0, 0, 32, 32, 19 * TILE_SIZE + 20, 32 * TILE_SIZE + 12, 14, 14);
  });
  fix(22, 32, () => {
    ctx.drawImage(ga.glMushroom2, 0, 0, 32, 32, 22 * TILE_SIZE + 2, 32 * TILE_SIZE + 14, 14, 14);
  });
  // Lamp posts
  fix(19, 30, () => {
    ctx.drawImage(ga.glLampPost, 0, 0, 64, 96, 19 * TILE_SIZE + 4, 30 * TILE_SIZE - 28, 28, 44);
  });
  fix(21, 34, () => {
    ctx.drawImage(ga.glLampPost, 0, 0, 64, 96, 21 * TILE_SIZE + 4, 34 * TILE_SIZE - 28, 28, 44);
  });
  // Barrel
  img(ga.glBarrel, 20, 33, 4, -4, 24, 44);
  // Label
  items.push({ x: 20, y: 33, draw: () => {
    ctx.font = '600 9px Inter, sans-serif'; ctx.textAlign = 'center';
    const lbl = 'Forest Clearing'; const lm = ctx.measureText(lbl);
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.beginPath();
    ctx.roundRect(20 * TILE_SIZE + 16 - lm.width / 2 - 4, 33 * TILE_SIZE + TILE_SIZE + 8, lm.width + 8, 12, 3); ctx.fill();
    ctx.fillStyle = 'rgba(120,180,80,0.7)'; ctx.fillText(lbl, 20 * TILE_SIZE + 16, 33 * TILE_SIZE + TILE_SIZE + 17);
  }});

  // ══════════════════════════════════════════════════════════
  //  PATH DECORATIONS — along main road & branches
  // ══════════════════════════════════════════════════════════
  // Lamp posts along main north-south road
  [22, 26, 30, 38, 42, 50, 54].forEach(ly => {
    fix(39, ly, () => {
      ctx.drawImage(ga.glLampPost, 0, 0, 64, 96, 39 * TILE_SIZE + 4, ly * TILE_SIZE - 28, 28, 44);
    });
  });
  // Barrels at path intersections
  img(ga.glBarrel, 41, 28, 2, -4, 24, 44);
  img(ga.glBarrel, 41, 32, 2, -4, 24, 44);
  // Signs at branch points
  img(ga.glSign, 42, 28, 4, -16, 28, 40);
  img(ga.glSign, 38, 32, -4, -16, 28, 40);

  // Flowers along main road
  [[41, 24], [41, 30], [41, 38], [41, 44], [41, 50], [41, 54]].forEach(([fx, fy], i) => {
    const flowerImgs = [ga.glFlower1, ga.glFlower2, ga.glFlower3, ga.glFlower4];
    fix(fx, fy, () => {
      ctx.drawImage(flowerImgs[i % flowerImgs.length], 0, 0, 32, 32,
        fx * TILE_SIZE + 8, fy * TILE_SIZE + 10, 16, 16);
    });
  });

  // ══════════════════════════════════════════════════════════
  //  POND AREA — west (18, 38)
  // ══════════════════════════════════════════════════════════
  // Vegetation ring around the pond
  [[16, 37], [20, 37], [16, 39], [20, 39]].forEach(([vx, vy]) => {
    img(ga.glVegetation, vx, vy, 0, 2, 24, 20);
  });
  // Flowers near pond
  fix(15, 38, () => { ctx.drawImage(ga.glFlower2, 0, 0, 32, 32, 15 * TILE_SIZE + 8, 38 * TILE_SIZE + 6, 18, 18); });
  fix(21, 38, () => { ctx.drawImage(ga.glFlower4, 0, 0, 32, 32, 21 * TILE_SIZE + 2, 38 * TILE_SIZE + 10, 18, 18); });
  // Rocks at pond shore
  img(ga.glRockSmall, 16, 38, 4, 8, 18, 14);
  img(ga.glRockSmall, 20, 38, 8, 4, 16, 12);
  // Mushrooms near pond
  fix(17, 40, () => { ctx.drawImage(ga.glMushroom1, 0, 0, 32, 32, 17 * TILE_SIZE + 12, 40 * TILE_SIZE + 8, 14, 14); });
  fix(19, 40, () => { ctx.drawImage(ga.glMushroom2, 0, 0, 32, 32, 19 * TILE_SIZE + 4, 40 * TILE_SIZE + 10, 14, 14); });
  // Pond label
  items.push({ x: 18, y: 39, draw: () => {
    ctx.font = '600 9px Inter, sans-serif'; ctx.textAlign = 'center';
    const lbl = 'Frog Pond'; const lm = ctx.measureText(lbl);
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.beginPath();
    ctx.roundRect(18 * TILE_SIZE + 16 - lm.width / 2 - 4, 39 * TILE_SIZE + TILE_SIZE + 4, lm.width + 8, 12, 3); ctx.fill();
    ctx.fillStyle = 'rgba(80,160,180,0.7)'; ctx.fillText(lbl, 18 * TILE_SIZE + 16, 39 * TILE_SIZE + TILE_SIZE + 13);
  }});

  // Y-sort and draw
  items.sort((a, b) => a.y - b.y);
  for (const item of items) item.draw();
  return canvas;
}

// ══════════════════════════════════════════════════════════
//  Summer Village Zone — compact off-hub area via Eastern Docks
// ══════════════════════════════════════════════════════════

function buildVillageMap(): TileId[][] {
  const map: TileId[][] = [];
  for (let y = 0; y < SV_H; y++) {
    map[y] = [];
    for (let x = 0; x < SV_W; x++) {
      const h = tileHash(x + 5000, y + 5000);
      // Water area (south, y >= 21)
      if (y >= 24) {
        const wd = y - 24;
        if (wd > 3) map[y][x] = T.DEEP_WATER;
        else if (wd > 1.5) map[y][x] = T.WATER;
        else if (wd > 0.5) map[y][x] = T.SHALLOW;
        else map[y][x] = T.SHORE;
        continue;
      }
      if (y >= 22 && x > 14 && x < 36) {
        map[y][x] = T.SHORE;
        continue;
      }
      // Border forest
      const bN = y / 2;
      const bS = (SV_H - 1 - y) / 2;
      const bW = x / 2;
      const bE = (SV_W - 1 - x) / 2;
      const bMin = Math.min(bN, bS, bW, bE);
      if (y < 22 && bMin < 0.5) { map[y][x] = T.DENSE_FOREST; continue; }
      if (y < 22 && bMin < 1.0) { map[y][x] = h < 0.4 ? T.FOREST : T.GRASS_DARK; continue; }
      // Default grass
      map[y][x] = h < 0.15 ? T.GRASS_DARK : T.GRASS;
    }
  }
  // Cobblestone village area (core)
  for (let y = 3; y <= 20; y++) {
    for (let x = 6; x <= 35; x++) {
      const d = ellipseDist(x, y, 20, 11, 16, 10);
      if (d < 0.85 && map[y][x] !== T.SHORE && map[y][x] !== T.WATER && map[y][x] !== T.SHALLOW && map[y][x] !== T.DEEP_WATER) {
        map[y][x] = T.COBBLE;
      }
    }
  }
  // Main paths
  // Entry path from west
  for (let x = 0; x <= 8; x++) { map[12][x] = T.COBBLE; map[13][x] = T.COBBLE; }
  // Path to waterfront
  for (let y = 15; y <= 22; y++) { if (map[y]) { map[y][20] = T.COBBLE; map[y][21] = T.COBBLE; } }
  // Wooden dock path at waterfront
  for (let x = 16; x <= 28; x++) { if (map[21]) map[21][x] = T.PATH; }
  // Grass patches in nature areas
  for (let y = 1; y <= 4; y++) {
    for (let x = 30; x <= 37; x++) {
      if (map[y][x] === T.COBBLE) map[y][x] = T.GRASS;
    }
  }
  for (let y = 1; y <= 4; y++) {
    for (let x = 2; x <= 7; x++) {
      if (map[y][x] !== T.DENSE_FOREST && map[y][x] !== T.FOREST) map[y][x] = T.GRASS;
    }
  }
  return map;
}

function prerenderVillageTerrain(map: TileId[][]): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = SV_W * TILE_SIZE;
  canvas.height = SV_H * TILE_SIZE;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;

  for (let y = 0; y < SV_H; y++) {
    for (let x = 0; x < SV_W; x++) {
      const tid = map[y][x];
      const name = TILE_ID_NAMES[tid] ?? 'grass';
      const base = VILLAGE_TERRAIN_COLORS[name] ?? VILLAGE_TERRAIN_COLORS.grass;
      const h = tileHash(x + 5000, y + 5000);
      // Slight brightness variation
      const bright = 1 + (h - 0.5) * 0.08;
      const r = parseInt(base.slice(1, 3), 16);
      const g = parseInt(base.slice(3, 5), 16);
      const b = parseInt(base.slice(5, 7), 16);
      ctx.fillStyle = `rgb(${Math.min(255, Math.round(r * bright))},${Math.min(255, Math.round(g * bright))},${Math.min(255, Math.round(b * bright))})`;
      ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);

      // Edge dithering
      if (x > 0 && map[y][x - 1] !== tid) {
        const nName = TILE_ID_NAMES[map[y][x - 1]] ?? 'grass';
        const nc = VILLAGE_TERRAIN_COLORS[nName] ?? base;
        ctx.fillStyle = nc;
        ctx.globalAlpha = 0.25;
        ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, 4, TILE_SIZE);
        ctx.globalAlpha = 1;
      }
      if (y > 0 && map[y - 1][x] !== tid) {
        const nName = TILE_ID_NAMES[map[y - 1][x]] ?? 'grass';
        const nc = VILLAGE_TERRAIN_COLORS[nName] ?? base;
        ctx.fillStyle = nc;
        ctx.globalAlpha = 0.25;
        ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, 4);
        ctx.globalAlpha = 1;
      }

      // Per-tile texture
      if (tid === T.COBBLE) {
        // cobblestone texture: subtle stone lines
        ctx.fillStyle = 'rgba(0,0,0,0.06)';
        ctx.fillRect(x * TILE_SIZE + 8, y * TILE_SIZE, 1, TILE_SIZE);
        ctx.fillRect(x * TILE_SIZE + 24, y * TILE_SIZE, 1, TILE_SIZE);
        ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE + 16, TILE_SIZE, 1);
        if (h > 0.7) {
          ctx.fillStyle = 'rgba(255,255,255,0.06)';
          ctx.fillRect(x * TILE_SIZE + 4, y * TILE_SIZE + 4, 6, 6);
        }
      } else if (tid === T.GRASS || tid === T.GRASS_DARK) {
        if (h > 0.6) {
          ctx.fillStyle = 'rgba(60,100,30,0.15)';
          ctx.fillRect(x * TILE_SIZE + 8 + (h * 12 | 0), y * TILE_SIZE + 4 + (h * 10 | 0), 2, 4);
        }
        if (h < 0.3) {
          ctx.fillStyle = 'rgba(100,180,60,0.12)';
          ctx.fillRect(x * TILE_SIZE + 14, y * TILE_SIZE + 20, 3, 3);
        }
      } else if (tid === T.WATER || tid === T.SHALLOW || tid === T.DEEP_WATER) {
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        const wx = x * TILE_SIZE + (h * 20 | 0);
        ctx.fillRect(wx, y * TILE_SIZE + 10, 8, 1);
        ctx.fillRect(wx + 4, y * TILE_SIZE + 22, 6, 1);
      } else if (tid === T.PATH) {
        ctx.fillStyle = 'rgba(80,60,30,0.08)';
        ctx.fillRect(x * TILE_SIZE + 6, y * TILE_SIZE + 12, 20, 2);
      }
    }
  }
  return canvas;
}

function prerenderVillageDeco(map: TileId[][], ga: GameAssets): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = SV_W * TILE_SIZE;
  canvas.height = SV_H * TILE_SIZE;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;

  const items: { x: number; y: number; draw: () => void }[] = [];
  const fix = (fx: number, fy: number, fn: () => void) => {
    items.push({ x: fx, y: fy, draw: fn });
  };

  // ── Houses ──
  // Small houses (top row residential area)
  fix(10 * TILE_SIZE, 2 * TILE_SIZE, () => {
    ctx.drawImage(ga.houses, HOUSE_SPRITES[0].sx, HOUSE_SPRITES[0].sy, HOUSE_SPRITES[0].sw, HOUSE_SPRITES[0].sh,
      10 * TILE_SIZE, 1 * TILE_SIZE, 170 * 0.7, 260 * 0.7);
  });
  fix(17 * TILE_SIZE, 2 * TILE_SIZE, () => {
    ctx.drawImage(ga.houses, HOUSE_SPRITES[1].sx, HOUSE_SPRITES[1].sy, HOUSE_SPRITES[1].sw, HOUSE_SPRITES[1].sh,
      17 * TILE_SIZE, 1 * TILE_SIZE, 170 * 0.7, 260 * 0.7);
  });
  fix(24 * TILE_SIZE, 2 * TILE_SIZE, () => {
    ctx.drawImage(ga.houses, HOUSE_SPRITES[2].sx, HOUSE_SPRITES[2].sy, HOUSE_SPRITES[2].sw, HOUSE_SPRITES[2].sh,
      24 * TILE_SIZE, 1 * TILE_SIZE, 170 * 0.7, 260 * 0.7);
  });
  // Large house (left side)
  fix(5 * TILE_SIZE, 4 * TILE_SIZE, () => {
    ctx.drawImage(ga.houses, LARGE_HOUSE_SPRITES[0].sx, LARGE_HOUSE_SPRITES[0].sy, LARGE_HOUSE_SPRITES[0].sw, LARGE_HOUSE_SPRITES[0].sh,
      4 * TILE_SIZE, 2 * TILE_SIZE, 230 * 0.65, 274 * 0.65);
  });

  // ── Well (village square center) ──
  fix(18 * TILE_SIZE, 7 * TILE_SIZE, () => {
    ctx.drawImage(ga.well, WELL_SPRITE.sx, WELL_SPRITE.sy, WELL_SPRITE.sw, WELL_SPRITE.sh,
      18 * TILE_SIZE - 8, 6 * TILE_SIZE + 8, 78 * 0.8, 68 * 0.8);
  });

  // ── Market area (3 canopies + stalls) ──
  const canopyColors = [0, 1, 2]; // green, red, blue
  for (let i = 0; i < 3; i++) {
    const mx = (22 + i * 4) * TILE_SIZE;
    const my = 8 * TILE_SIZE;
    const ci = canopyColors[i];
    fix(mx, my, () => {
      ctx.drawImage(ga.market, MARKET_CANOPY_SPRITES[ci].sx, MARKET_CANOPY_SPRITES[ci].sy, MARKET_CANOPY_SPRITES[ci].sw, MARKET_CANOPY_SPRITES[ci].sh,
        mx - 16, my - 24, 128 * 0.72, 76 * 0.72);
      ctx.drawImage(ga.market, MARKET_STALL.sx, MARKET_STALL.sy, MARKET_STALL.sw, MARKET_STALL.sh,
        mx - 8, my + 20, 96 * 0.65, 64 * 0.65);
    });
  }

  // ── Vegetable stall ──
  fix(20 * TILE_SIZE, 9 * TILE_SIZE, () => {
    ctx.drawImage(ga.vegetableStall, VEGETABLE_STALL_SPRITE.sx, VEGETABLE_STALL_SPRITE.sy, VEGETABLE_STALL_SPRITE.sw, VEGETABLE_STALL_SPRITE.sh,
      19 * TILE_SIZE + 8, 9 * TILE_SIZE - 8, 80 * 0.7, 96 * 0.7);
  });

  // ── Barrels, crates, sacks around market ──
  fix(32 * TILE_SIZE, 9 * TILE_SIZE, () => {
    ctx.drawImage(ga.market, BARREL_GROUP.sx, BARREL_GROUP.sy, BARREL_GROUP.sw, BARREL_GROUP.sh,
      32 * TILE_SIZE, 9 * TILE_SIZE, 52 * 0.7, 44 * 0.7);
  });
  fix(33 * TILE_SIZE, 10 * TILE_SIZE, () => {
    ctx.drawImage(ga.market, CRATE.sx, CRATE.sy, CRATE.sw, CRATE.sh,
      33 * TILE_SIZE + 8, 10 * TILE_SIZE, 24, 28);
    ctx.drawImage(ga.market, SACK.sx, SACK.sy, SACK.sw, SACK.sh,
      34 * TILE_SIZE, 10 * TILE_SIZE + 4, 24, 24);
  });
  fix(21 * TILE_SIZE, 10 * TILE_SIZE, () => {
    ctx.drawImage(ga.market, BARREL.sx, BARREL.sy, BARREL.sw, BARREL.sh,
      21 * TILE_SIZE, 10 * TILE_SIZE + 4, 28, 28);
  });

  // ── Food items on stalls ──
  for (let i = 0; i < 3; i++) {
    const fx = (23 + i * 4) * TILE_SIZE + 12;
    const fy = 8 * TILE_SIZE + 28;
    const fi = i % FOOD_SPRITES.length;
    fix(fx, fy, () => {
      ctx.drawImage(ga.market, FOOD_SPRITES[fi].sx, FOOD_SPRITES[fi].sy, FOOD_SPRITES[fi].sw, FOOD_SPRITES[fi].sh,
        fx, fy, 20, 20);
    });
  }

  // ── Market signs ──
  fix(22 * TILE_SIZE, 11 * TILE_SIZE, () => {
    ctx.drawImage(ga.market, MARKET_SIGN_SPRITES[0].sx, MARKET_SIGN_SPRITES[0].sy, MARKET_SIGN_SPRITES[0].sw, MARKET_SIGN_SPRITES[0].sh,
      22 * TILE_SIZE - 4, 11 * TILE_SIZE, 56 * 0.7, 28 * 0.7);
  });
  fix(30 * TILE_SIZE, 11 * TILE_SIZE, () => {
    ctx.drawImage(ga.market, MARKET_SIGN_SPRITES[1].sx, MARKET_SIGN_SPRITES[1].sy, MARKET_SIGN_SPRITES[1].sw, MARKET_SIGN_SPRITES[1].sh,
      30 * TILE_SIZE, 11 * TILE_SIZE, 56 * 0.7, 28 * 0.7);
  });

  // ── Campfire (gathering spot) ──
  fix(16 * TILE_SIZE, 12 * TILE_SIZE, () => {
    ctx.drawImage(ga.campfire, CAMPFIRE_SPRITE.sx, CAMPFIRE_SPRITE.sy, CAMPFIRE_SPRITE.sw, CAMPFIRE_SPRITE.sh,
      15 * TILE_SIZE + 12, 11 * TILE_SIZE + 16, 52 * 0.7, 48 * 0.7);
  });

  // ── Log pile near campfire ──
  fix(14 * TILE_SIZE, 13 * TILE_SIZE, () => {
    ctx.drawImage(ga.nature, LOG_PILE_SPRITE.sx, LOG_PILE_SPRITE.sy, LOG_PILE_SPRITE.sw, LOG_PILE_SPRITE.sh,
      14 * TILE_SIZE, 12 * TILE_SIZE + 16, 54 * 0.7, 34 * 0.7);
  });

  // ── Bench near houses ──
  fix(28 * TILE_SIZE, 4 * TILE_SIZE, () => {
    ctx.drawImage(ga.nature, BENCH_SPRITE.sx, BENCH_SPRITE.sy, BENCH_SPRITE.sw, BENCH_SPRITE.sh,
      28 * TILE_SIZE, 4 * TILE_SIZE + 8, 54 * 0.7, 26 * 0.7);
  });

  // ── Sign post at entry ──
  fix(7 * TILE_SIZE, 12 * TILE_SIZE, () => {
    ctx.drawImage(ga.nature, SIGN_SPRITE.sx, SIGN_SPRITE.sy, SIGN_SPRITE.sw, SIGN_SPRITE.sh,
      7 * TILE_SIZE, 11 * TILE_SIZE + 8, 32, 48);
  });

  // ── Trees scattered ──
  // Nature area (top right)
  const treePlaces: [number, number, number][] = [
    [33, 1, 0], [36, 2, 1], [34, 4, 0], [37, 5, 1],
    // Border trees
    [2, 1, 0], [3, 6, 1], [2, 9, 0],
    [37, 8, 1], [36, 12, 0],
    // Near waterfront
    [8, 18, 1], [35, 18, 0], [3, 16, 1], [37, 16, 0],
  ];
  for (const [tx, ty, ti] of treePlaces) {
    const ts = TREE_SPRITES[ti];
    fix(tx * TILE_SIZE, ty * TILE_SIZE, () => {
      ctx.drawImage(ga.assets, ts.sx, ts.sy, ts.sw, ts.sh,
        tx * TILE_SIZE - 16, ty * TILE_SIZE - 48, 96 * 0.75, 140 * 0.75);
    });
  }

  // Village trees (fruit / broad oak)
  fix(31 * TILE_SIZE, 3 * TILE_SIZE, () => {
    ctx.drawImage(ga.nature, VILLAGE_TREE_SPRITES[0].sx, VILLAGE_TREE_SPRITES[0].sy, VILLAGE_TREE_SPRITES[0].sw, VILLAGE_TREE_SPRITES[0].sh,
      31 * TILE_SIZE - 8, 2 * TILE_SIZE, 104 * 0.7, 126 * 0.7);
  });
  fix(8 * TILE_SIZE, 7 * TILE_SIZE, () => {
    ctx.drawImage(ga.nature, VILLAGE_TREE_SPRITES[1].sx, VILLAGE_TREE_SPRITES[1].sy, VILLAGE_TREE_SPRITES[1].sw, VILLAGE_TREE_SPRITES[1].sh,
      7 * TILE_SIZE + 8, 6 * TILE_SIZE, 104 * 0.7, 126 * 0.7);
  });

  // ── Bushes ──
  const bushPlaces: [number, number, number][] = [
    [9, 6, 0], [12, 14, 1], [33, 7, 2], [7, 15, 0],
    [35, 14, 1], [30, 6, 2], [15, 5, 0], [27, 14, 1],
  ];
  for (const [bx, by, bi] of bushPlaces) {
    const bs = VILLAGE_BUSH_SPRITES[bi];
    fix(bx * TILE_SIZE, by * TILE_SIZE, () => {
      ctx.drawImage(ga.nature, bs.sx, bs.sy, bs.sw, bs.sh,
        bx * TILE_SIZE, by * TILE_SIZE + 4, 34 * 0.8, 34 * 0.8);
    });
  }

  // ── Boulders ──
  const boulderPlaces: [number, number, number][] = [
    [34, 18, 0], [36, 20, 1], [33, 20, 2],
    [6, 19, 0], [4, 20, 1],
  ];
  for (const [rx, ry, ri] of boulderPlaces) {
    const rs = BOULDER_SPRITES[ri];
    fix(rx * TILE_SIZE, ry * TILE_SIZE, () => {
      ctx.drawImage(ga.nature, rs.sx, rs.sy, rs.sw, rs.sh,
        rx * TILE_SIZE, ry * TILE_SIZE, rs.sw * 0.7, rs.sh * 0.7);
    });
  }

  // ── Fences ──
  // Wooden fence along north market edge
  fix(21 * TILE_SIZE, 7 * TILE_SIZE, () => {
    ctx.drawImage(ga.woodenFence, WOODEN_FENCE_SPRITE.sx, WOODEN_FENCE_SPRITE.sy, WOODEN_FENCE_SPRITE.sw, WOODEN_FENCE_SPRITE.sh,
      21 * TILE_SIZE, 7 * TILE_SIZE - 8, 112 * 0.65, 54 * 0.65);
  });
  // Marble fence near waterfront
  fix(18 * TILE_SIZE, 19 * TILE_SIZE, () => {
    ctx.drawImage(ga.marbleFence, MARBLE_FENCE_SPRITE.sx, MARBLE_FENCE_SPRITE.sy, MARBLE_FENCE_SPRITE.sw, MARBLE_FENCE_SPRITE.sh,
      18 * TILE_SIZE, 19 * TILE_SIZE, 60 * 0.8, 44 * 0.8);
    ctx.drawImage(ga.marbleFence, MARBLE_PILLAR_SPRITE.sx, MARBLE_PILLAR_SPRITE.sy, MARBLE_PILLAR_SPRITE.sw, MARBLE_PILLAR_SPRITE.sh,
      17 * TILE_SIZE + 4, 19 * TILE_SIZE - 12, 20 * 0.8, 80 * 0.8);
  });
  fix(23 * TILE_SIZE, 19 * TILE_SIZE, () => {
    ctx.drawImage(ga.marbleFence, MARBLE_FENCE_SPRITE.sx, MARBLE_FENCE_SPRITE.sy, MARBLE_FENCE_SPRITE.sw, MARBLE_FENCE_SPRITE.sh,
      23 * TILE_SIZE, 19 * TILE_SIZE, 60 * 0.8, 44 * 0.8);
    ctx.drawImage(ga.marbleFence, MARBLE_PILLAR_SPRITE.sx, MARBLE_PILLAR_SPRITE.sy, MARBLE_PILLAR_SPRITE.sw, MARBLE_PILLAR_SPRITE.sh,
      27 * TILE_SIZE, 19 * TILE_SIZE - 12, 20 * 0.8, 80 * 0.8);
  });

  // ── Bridge + Landing Stage at waterfront ──
  fix(19 * TILE_SIZE, 21 * TILE_SIZE, () => {
    ctx.drawImage(ga.bridge, BRIDGE_PLANK_SPRITE.sx, BRIDGE_PLANK_SPRITE.sy, BRIDGE_PLANK_SPRITE.sw, BRIDGE_PLANK_SPRITE.sh,
      18 * TILE_SIZE, 21 * TILE_SIZE - 8, 192 * 0.5, 96 * 0.5);
  });
  fix(25 * TILE_SIZE, 22 * TILE_SIZE, () => {
    ctx.drawImage(ga.landingStage, LANDING_STAGE_SPRITE.sx, LANDING_STAGE_SPRITE.sy, LANDING_STAGE_SPRITE.sw, LANDING_STAGE_SPRITE.sh,
      24 * TILE_SIZE, 21 * TILE_SIZE + 8, 76 * 0.8, 48 * 0.8);
  });

  // ── Water lilies ──
  fix(16 * TILE_SIZE, 24 * TILE_SIZE, () => {
    ctx.drawImage(ga.waterLily, WATER_LILY_SPRITE.sx, WATER_LILY_SPRITE.sy, WATER_LILY_SPRITE.sw, WATER_LILY_SPRITE.sh,
      16 * TILE_SIZE + 4, 24 * TILE_SIZE + 4, 28, 24);
  });
  fix(28 * TILE_SIZE, 25 * TILE_SIZE, () => {
    ctx.drawImage(ga.waterLily, WATER_LILY_SPRITE.sx, WATER_LILY_SPRITE.sy, WATER_LILY_SPRITE.sw, WATER_LILY_SPRITE.sh,
      28 * TILE_SIZE + 8, 25 * TILE_SIZE, 28, 24);
  });
  fix(22 * TILE_SIZE, 26 * TILE_SIZE, () => {
    ctx.drawImage(ga.waterLily, WATER_LILY_SPRITE.sx, WATER_LILY_SPRITE.sy, WATER_LILY_SPRITE.sw, WATER_LILY_SPRITE.sh,
      22 * TILE_SIZE, 26 * TILE_SIZE + 4, 28, 24);
  });

  // ── Flowers & grass details ──
  const flowerPlaces: [number, number][] = [
    [11, 6], [14, 8], [9, 14], [32, 5], [35, 10],
    [16, 15], [28, 16], [8, 10], [13, 17], [31, 15],
    [10, 11], [25, 5], [19, 15], [34, 8], [7, 8],
  ];
  for (const [fx, fy] of flowerPlaces) {
    const gi = Math.abs(tileHash(fx + 999, fy + 999) * 5 | 0) % GRASS_DETAIL_SPRITES.length;
    const gs = GRASS_DETAIL_SPRITES[gi];
    fix(fx * TILE_SIZE, fy * TILE_SIZE, () => {
      ctx.drawImage(ga.assets, gs.sx, gs.sy, gs.sw, gs.sh,
        fx * TILE_SIZE + 8, fy * TILE_SIZE + 12, 16, 16);
    });
  }

  // ── Mushrooms near nature area ──
  fix(33 * TILE_SIZE, 6 * TILE_SIZE, () => {
    ctx.drawImage(ga.nature, MUSHROOM_SPRITE.sx, MUSHROOM_SPRITE.sy, MUSHROOM_SPRITE.sw, MUSHROOM_SPRITE.sh,
      33 * TILE_SIZE + 12, 6 * TILE_SIZE + 16, 20, 16);
  });
  fix(35 * TILE_SIZE, 3 * TILE_SIZE, () => {
    ctx.drawImage(ga.nature, MUSHROOM_SPRITE.sx, MUSHROOM_SPRITE.sy, MUSHROOM_SPRITE.sw, MUSHROOM_SPRITE.sh,
      35 * TILE_SIZE + 4, 3 * TILE_SIZE + 20, 20, 16);
  });

  // ── Shore rocks ──
  for (let i = 0; i < 6; i++) {
    const srx = 10 + i * 4;
    const sry = 22;
    const sri = i % SHORE_ROCK_SPRITES.length;
    const sr = SHORE_ROCK_SPRITES[sri];
    fix(srx * TILE_SIZE, sry * TILE_SIZE, () => {
      ctx.drawImage(ga.nature, sr.sx, sr.sy, sr.sw, sr.sh,
        srx * TILE_SIZE + 4, sry * TILE_SIZE + 8, sr.sw, sr.sh);
    });
  }

  // ── Tent (camping area near campfire) ──
  fix(12 * TILE_SIZE, 14 * TILE_SIZE, () => {
    ctx.drawImage(ga.assets, TENT_SPRITE.sx, TENT_SPRITE.sy, TENT_SPRITE.sw, TENT_SPRITE.sh,
      12 * TILE_SIZE - 8, 13 * TILE_SIZE, 116 * 0.55, 76 * 0.55);
  });

  // ── Fruit trees (near market) ──
  fix(19 * TILE_SIZE, 5 * TILE_SIZE, () => {
    ctx.drawImage(ga.assets, FRUIT_TREE_SPRITES[0].sx, FRUIT_TREE_SPRITES[0].sy, FRUIT_TREE_SPRITES[0].sw, FRUIT_TREE_SPRITES[0].sh,
      19 * TILE_SIZE - 4, 4 * TILE_SIZE + 8, 96 * 0.6, 96 * 0.6);
  });

  // ── Crate pile + barrels near dock ──
  fix(28 * TILE_SIZE, 20 * TILE_SIZE, () => {
    ctx.drawImage(ga.assets, CRATE_PILE_SPRITE.sx, CRATE_PILE_SPRITE.sy, CRATE_PILE_SPRITE.sw, CRATE_PILE_SPRITE.sh,
      28 * TILE_SIZE, 20 * TILE_SIZE, 52 * 0.7, 40 * 0.7);
  });
  fix(30 * TILE_SIZE, 20 * TILE_SIZE, () => {
    ctx.drawImage(ga.market, BARREL.sx, BARREL.sy, BARREL.sw, BARREL.sh,
      30 * TILE_SIZE, 20 * TILE_SIZE + 4, 28, 28);
    ctx.drawImage(ga.market, BARREL.sx, BARREL.sy, BARREL.sw, BARREL.sh,
      31 * TILE_SIZE, 20 * TILE_SIZE, 28, 28);
  });

  // ── Sign posts ──
  fix(9 * TILE_SIZE, 12 * TILE_SIZE, () => {
    ctx.drawImage(ga.assets, SIGN_POST_SPRITES[0].sx, SIGN_POST_SPRITES[0].sy, SIGN_POST_SPRITES[0].sw, SIGN_POST_SPRITES[0].sh,
      9 * TILE_SIZE, 11 * TILE_SIZE + 8, 40 * 0.7, 52 * 0.7);
  });

  // ── Horizontal fence sections ──
  fix(10 * TILE_SIZE, 16 * TILE_SIZE, () => {
    ctx.drawImage(ga.assets, FENCE_H_SPRITE.sx, FENCE_H_SPRITE.sy, FENCE_H_SPRITE.sw, FENCE_H_SPRITE.sh,
      10 * TILE_SIZE, 16 * TILE_SIZE, 192 * 0.45, 36 * 0.45);
  });

  // ── Stumps & logs ──
  fix(5 * TILE_SIZE, 17 * TILE_SIZE, () => {
    ctx.drawImage(ga.assets, STUMP_SPRITE.sx, STUMP_SPRITE.sy, STUMP_SPRITE.sw, STUMP_SPRITE.sh,
      5 * TILE_SIZE + 4, 17 * TILE_SIZE + 8, 40 * 0.7, 32 * 0.7);
  });
  fix(3 * TILE_SIZE, 14 * TILE_SIZE, () => {
    ctx.drawImage(ga.assets, LOG_SPRITE.sx, LOG_SPRITE.sy, LOG_SPRITE.sw, LOG_SPRITE.sh,
      3 * TILE_SIZE, 14 * TILE_SIZE + 8, 80 * 0.55, 32 * 0.55);
  });

  // ── POI area labels ──
  ctx.font = '500 9px Inter, sans-serif';
  ctx.textAlign = 'center';

  const labels: [string, number, number][] = [
    ['Village Square', 20, 7],
    ['Market', 26, 8],
    ['Waterfront', 22, 20],
    ['Campfire', 16, 11],
  ];
  for (const [lbl, lx, ly] of labels) {
    const lm = ctx.measureText(lbl);
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.roundRect(lx * TILE_SIZE + 16 - lm.width / 2 - 4, ly * TILE_SIZE - 4, lm.width + 8, 12, 3);
    ctx.fill();
    ctx.fillStyle = 'rgba(200,180,120,0.7)';
    ctx.fillText(lbl, lx * TILE_SIZE + 16, ly * TILE_SIZE + 5);
  }

  // Y-sort and draw
  items.sort((a, b) => a.y - b.y);
  for (const item of items) item.draw();
  return canvas;
}

// ─── Draw player ───

function drawPlayer(ctx: CanvasRenderingContext2D, x: number, y: number, player: Player, img: HTMLImageElement) {
  const row = PLAYER_ROWS[player.facing];
  const col = player.moving ? player.animFrame % PLAYER_WALK_FRAMES : 0;
  const sx = col * PLAYER_FRAME_W;
  const sy = row * PLAYER_FRAME_H;
  // Scale proportionally: 44x50 source → 40x46 dest, centered on tile
  const destW = 40;
  const destH = 46;
  const offsetX = (TILE_SIZE - destW) / 2; // center horizontally on tile

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath();
  ctx.ellipse(x + TILE_SIZE / 2, y + TILE_SIZE - 2, 10, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.drawImage(img, sx, sy, PLAYER_FRAME_W, PLAYER_FRAME_H,
    x + offsetX, y + TILE_SIZE - destH, destW, destH);
}

// ─── Draw entity ───

function drawEntitySprite(ctx: CanvasRenderingContext2D, pe: PlacedEntity, ga: GameAssets, isNearby: boolean, time: number) {
  const px = pe.tileX * TILE_SIZE;
  const py = pe.tileY * TILE_SIZE;

  if (pe.entity.type === 'LOCATION') {
    const h = hashString(pe.entity.id);
    const useLarge = h % 3 === 0; // ~1/3 of locations get large houses
    if (useLarge) {
      const idx = h % LARGE_HOUSE_SPRITES.length;
      const src = LARGE_HOUSE_SPRITES[idx];
      const dw = TILE_SIZE * 4;
      const dh = TILE_SIZE * 4;
      ctx.fillStyle = 'rgba(0,0,0,0.14)';
      ctx.beginPath();
      ctx.ellipse(px + TILE_SIZE / 2, py + TILE_SIZE + 6, dw / 2 - 8, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.drawImage(ga.houses, src.sx, src.sy, src.sw, src.sh,
        px - TILE_SIZE * 1.5, py - dh + TILE_SIZE + 12, dw, dh);
    } else {
      const idx = h % HOUSE_SPRITES.length;
      const src = HOUSE_SPRITES[idx];
      const dw = TILE_SIZE * 3;
      const dh = TILE_SIZE * 3;
      ctx.fillStyle = 'rgba(0,0,0,0.12)';
      ctx.beginPath();
      ctx.ellipse(px + TILE_SIZE / 2, py + TILE_SIZE + 4, dw / 2 - 10, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.drawImage(ga.houses, src.sx, src.sy, src.sw, src.sh,
        px - TILE_SIZE, py - dh + TILE_SIZE + 10, dw, dh);
    }
  } else if (pe.entity.type === 'CHARACTER') {
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.beginPath();
    ctx.ellipse(px + TILE_SIZE / 2, py + TILE_SIZE - 2, 8, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    const npcVariant = hashString(pe.entity.id) % 6;
    const frame = Math.floor(time * 1.5) % 4;
    if (npcVariant === 0) {
      ctx.drawImage(ga.oldMan, frame * NPC_TALL_FRAME_W, 0, NPC_TALL_FRAME_W, NPC_TALL_FRAME_H,
        px + 2, py - 6, TILE_SIZE - 4, TILE_SIZE + 6);
    } else if (npcVariant === 1) {
      ctx.drawImage(ga.oldWoman, frame * NPC_TALL_FRAME_W, 0, NPC_TALL_FRAME_W, NPC_TALL_FRAME_H,
        px + 2, py - 6, TILE_SIZE - 4, TILE_SIZE + 6);
    } else if (npcVariant === 2) {
      ctx.drawImage(ga.youngMan, frame * NPC_TALL_FRAME_W, 0, NPC_TALL_FRAME_W, NPC_TALL_FRAME_H,
        px + 2, py - 6, TILE_SIZE - 4, TILE_SIZE + 6);
    } else if (npcVariant === 3) {
      ctx.drawImage(ga.youngWoman, frame * NPC_TALL_FRAME_W, 0, NPC_TALL_FRAME_W, NPC_TALL_FRAME_H,
        px + 2, py - 6, TILE_SIZE - 4, TILE_SIZE + 6);
    } else if (npcVariant === 4) {
      ctx.drawImage(ga.merchant, frame * NPC_SMALL_FRAME_W, 0, NPC_SMALL_FRAME_W, NPC_SMALL_FRAME_H,
        px + 4, py + 2, TILE_SIZE - 8, TILE_SIZE - 4);
    } else {
      ctx.drawImage(ga.merchantGeneral, frame * NPC_SMALL_FRAME_W, 0, NPC_SMALL_FRAME_W, NPC_SMALL_FRAME_H,
        px + 4, py + 2, TILE_SIZE - 8, TILE_SIZE - 4);
    }
  } else if (pe.entity.type === 'FACTION') {
    ctx.drawImage(ga.market, MARKET_STALL.sx, MARKET_STALL.sy, MARKET_STALL.sw, MARKET_STALL.sh,
      px - TILE_SIZE / 2, py - TILE_SIZE / 2, TILE_SIZE * 2, TILE_SIZE * 1.5);
  } else {
    ctx.fillStyle = pe.entity.accent;
    ctx.beginPath();
    ctx.arc(px + TILE_SIZE / 2, py + TILE_SIZE / 2, 10, 0, Math.PI * 2);
    ctx.fill();
  }

  // Interaction ring
  if (isNearby) {
    ctx.strokeStyle = '#FF6B2C';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(px + TILE_SIZE / 2, py + TILE_SIZE / 2, TILE_SIZE / 2 + 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#FF6B2C';
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('[E]', px + TILE_SIZE / 2, py - 10);
  }

  // Label
  ctx.font = '600 10px Inter, sans-serif';
  ctx.textAlign = 'center';
  const label = pe.entity.title;
  const m = ctx.measureText(label);
  const lx = px + TILE_SIZE / 2;
  const ly = py + TILE_SIZE + 16;
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.beginPath();
  ctx.roundRect(lx - m.width / 2 - 5, ly - 9, m.width + 10, 14, 3);
  ctx.fill();
  ctx.fillStyle = isNearby ? '#FF6B2C' : 'rgba(255,255,255,0.85)';
  ctx.fillText(label, lx, ly);
}

// ─── Place entities across the world ───

function placeEntities(map: TileId[][], entities: WorldEntity[]): PlacedEntity[] {
  const placed: PlacedEntity[] = [];
  const locations = entities.filter(e => e.type === 'LOCATION');
  const characters = entities.filter(e => e.type === 'CHARACTER');
  const others = entities.filter(e => e.type !== 'LOCATION' && e.type !== 'CHARACTER');

  // Locations: first batch in town, overflow to points of interest
  const locationSlots = [
    { x: 51, y: 40 }, // NW house facing square
    { x: 51, y: 44 }, // SW house facing square
    { x: 54, y: 38 }, // N-west house
    { x: 56, y: 38 }, // N-center house
    { x: 60, y: 43 }, // SE house east of market
    { x: 53, y: 46 }, // S entrance house
    { x: 54, y: 44 }, // Central south
    { x: 59, y: 44 }, // SE inner
    { x: 96, y: 41 }, // Docks
    { x: 44, y: 76 }, // Ruins
    { x: 22, y: 30 }, // Forest clearing
    { x: 56, y: 13 }, // Highlands
    { x: 55, y: 63 }, // Farmstead
  ];
  for (let i = 0; i < locations.length; i++) {
    const slot = locationSlots[i % locationSlots.length];
    placed.push({ entity: locations[i], tileX: slot.x, tileY: slot.y });
  }

  // Characters: near town and along roads
  const charSlots = [
    { x: 53, y: 41 }, // Near well, west
    { x: 57, y: 43 }, // Near market, south
    { x: 52, y: 43 }, // Square SW corner
    { x: 56, y: 39 }, // Square north side
    { x: 61, y: 42 }, // East of town
    { x: 55, y: 34 }, // North road
    { x: 75, y: 42 }, // Coast road
    { x: 55, y: 55 }, // Ruins road
    { x: 96, y: 44 }, // Docks
    { x: 40, y: 68 }, // Lake area
    { x: 38, y: 38 }, // Forest road
    { x: 76, y: 43 }, // Coast road
  ];
  for (let i = 0; i < characters.length; i++) {
    const slot = charSlots[i % charSlots.length];
    placed.push({ entity: characters[i], tileX: slot.x, tileY: slot.y });
  }

  // Others: spread across the world
  const otherSlots = [
    { x: 35, y: 35 }, { x: 75, y: 25 }, { x: 80, y: 55 },
    { x: 30, y: 55 }, { x: 65, y: 65 }, { x: 40, y: 20 },
    { x: 85, y: 35 }, { x: 70, y: 50 },
    { x: 96, y: 49 }, // Harbor
  ];
  for (let i = 0; i < others.length; i++) {
    const slot = otherSlots[i % otherSlots.length];
    placed.push({ entity: others[i], tileX: slot.x, tileY: slot.y });
  }

  return placed;
}

// ─── Sprite thumbnail icon for build items ───

function SpriteIcon({ img, size = 28, dimmed }: { img: HTMLImageElement | undefined; size?: number; dimmed?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c || !img) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, size, size);
    const aspect = img.width / img.height;
    let dw = size - 4, dh = size - 4;
    if (aspect > 1) { dh = dw / aspect; } else { dw = dh * aspect; }
    const dx = (size - dw) / 2, dy = (size - dh) / 2;
    if (dimmed) ctx.globalAlpha = 0.3;
    ctx.drawImage(img, dx, dy, dw, dh);
  }, [img, size, dimmed]);
  return <canvas ref={ref} width={size} height={size} style={{ width: size, height: size, borderRadius: 5, background: 'rgba(255,255,255,0.04)', flexShrink: 0 }} />;
}

// ─── SVG effect icons for consumable items ───

const EFFECT_ICONS: Record<string, (color: string) => React.ReactNode> = {
  heal: (c) => (
    <svg viewBox="0 0 24 24" width="14" height="14"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill={c}/></svg>
  ),
  strength: (c) => (
    <svg viewBox="0 0 24 24" width="14" height="14"><path d="M14.5 2.5L22 10l-2 2-3-1-5 5 1 3-2 2L3.5 13.5l2-2 3 1 5-5-1-3 2-2z" fill={c}/></svg>
  ),
  defense: (c) => (
    <svg viewBox="0 0 24 24" width="14" height="14"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" fill={c}/></svg>
  ),
  speed: (c) => (
    <svg viewBox="0 0 24 24" width="14" height="14"><path d="M7 2v11h3v9l7-12h-4l4-8z" fill={c}/></svg>
  ),
  gold_find: (c) => (
    <svg viewBox="0 0 24 24" width="14" height="14"><circle cx="12" cy="12" r="9" fill="none" stroke={c} strokeWidth="2.5"/><path d="M12 7v10M9 9.5c0-1.1 1.34-2 3-2s3 .9 3 2-1.34 2-3 2-3 .9-3 2 1.34 2 3 2 3-.9 3-2" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round"/></svg>
  ),
  reveal: (c) => (
    <svg viewBox="0 0 24 24" width="14" height="14"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5.5-2.5l7.51-3.49L17.5 6.5 9.99 9.99 6.5 17.5zm5.5-6.6c.61 0 1.1.49 1.1 1.1s-.49 1.1-1.1 1.1-1.1-.49-1.1-1.1.49-1.1 1.1-1.1z" fill={c}/></svg>
  ),
  sight: (c) => (
    <svg viewBox="0 0 24 24" width="14" height="14"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill={c}/></svg>
  ),
};

// ─── Component ───

export function WorldExplore({
  entities,
  slug,
  worldTitle: _worldTitle,
  eraLabel,
  fullscreen = false,
  isOwner = false,
  worldId,
  playerName = 'Adventurer',
}: {
  entities: WorldEntity[];
  slug: string;
  worldTitle: string;
  eraLabel?: string;
  fullscreen?: boolean;
  isOwner?: boolean;
  worldId?: string;
  playerName?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mapRef = useRef<TileId[][] | null>(null);
  const playerRef = useRef<Player>({
    x: 55, y: 45, facing: 'down', moving: false, animFrame: 0, animTimer: 0,
  });
  const keysRef = useRef<Set<string>>(new Set());

  // ── Character selection ──
  const CHAR_SAVE_KEY = 'worldforge_character';
  const savedChar = (() => {
    try {
      if (typeof window === 'undefined') return null;
      const raw = localStorage.getItem(CHAR_SAVE_KEY);
      if (raw) return JSON.parse(raw) as { charIndex: number; hueShift: number; displayName?: string };
    } catch { /* ignore */ }
    return null;
  })();
  const [chosenCharIndex, setChosenCharIndex] = useState<number>(savedChar?.charIndex ?? (isOwner ? 0 : -1));
  const [chosenHueShift, setChosenHueShift] = useState<number>(savedChar?.hueShift ?? 0);
  const [chosenDisplayName, setChosenDisplayName] = useState<string>(savedChar?.displayName || playerName);
  const chosenCharRef = useRef({ charIndex: chosenCharIndex, hueShift: chosenHueShift });
  chosenCharRef.current = { charIndex: chosenCharIndex, hueShift: chosenHueShift };
  const [charPickerOpen, setCharPickerOpen] = useState(false);
  const charPickerOpenRef = useRef(false);
  charPickerOpenRef.current = charPickerOpen;
  const needsCharPick = chosenCharIndex === -1;
  const needsCharPickRef = useRef(needsCharPick);
  needsCharPickRef.current = needsCharPick;
  const hueCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const isOwnerRef = useRef(isOwner);
  isOwnerRef.current = isOwner;

  // ── Multiplayer ──
  const mp = useMultiplayer(slug, chosenDisplayName, chosenCharIndex >= 0 ? chosenCharIndex : 0, chosenHueShift);
  const [chatInput, setChatInput] = useState('');
  const [chatVisible, setChatVisible] = useState(false);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const chatVisibleRef = useRef(false);
  chatVisibleRef.current = chatVisible;

  const [nearbyEntity, setNearbyEntity] = useState<WorldEntity | null>(null);
  const [inspecting, setInspecting] = useState<WorldEntity | null>(null);
  const [canvasSize, setCanvasSize] = useState({ w: 900, h: 600 });
  const canvasSizeRef = useRef({ w: 900, h: 600 });
  canvasSizeRef.current = canvasSize;
  const [ready, setReady] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [tradeOpen, setTradeOpen] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(1); // 1-6 = active steps, 0 = closed
  const [unifiedShopOpen, setUnifiedShopOpen] = useState(false);
  const [shopTab, setShopTab] = useState<'consumables' | 'blueprints' | 'trading'>('consumables');
  const [helpOpen, setHelpOpen] = useState(false);
  const [helpTab, setHelpTab] = useState<'controls' | 'progression' | 'economy' | 'combat'>('controls');
  const unifiedShopOpenRef = useRef(false);
  unifiedShopOpenRef.current = unifiedShopOpen;
  const helpOpenRef = useRef(false);
  helpOpenRef.current = helpOpen;
  // Refs mirroring state for game loop (avoids effect teardown on state change)
  const inspectingRef = useRef<WorldEntity | null>(null);
  inspectingRef.current = inspecting;
  const shopOpenRef = useRef(false);
  shopOpenRef.current = shopOpen;
  const tradeOpenRef = useRef(false);
  tradeOpenRef.current = tradeOpen;
  const nearbyEntityRef = useRef<WorldEntity | null>(null);
  nearbyEntityRef.current = nearbyEntity;
  const nearMerchantRef = useRef(false);
  const eraLabelRef = useRef(eraLabel);
  eraLabelRef.current = eraLabel;
  const tutorialStepRef = useRef(tutorialStep);
  tutorialStepRef.current = tutorialStep;
  const [nearMerchant, setNearMerchant] = useState(false);
  nearMerchantRef.current = nearMerchant;
  const [playerGold, setPlayerGold] = useState(50);
  const [inventory, setInventory] = useState<Record<string, number>>({});
  const [shopMessage, setShopMessage] = useState<string | null>(null);
  const [activeBuffs, setActiveBuffs] = useState<ActiveBuff[]>([]);
  const buffsRef = useRef<ActiveBuff[]>([]);
  buffsRef.current = activeBuffs;
  const placedRef = useRef<PlacedEntity[]>([]);
  const goldAccumRef = useRef(0);
  const playerGoldRef = useRef(50);
  playerGoldRef.current = playerGold;
  const [playerHealth, setPlayerHealth] = useState(100);
  const [playerStamina, setPlayerStamina] = useState(100);
  const healthRef = useRef(100);
  const staminaRef = useRef(100);
  const visitedRef = useRef<Set<string>>(new Set());
  const objectiveRef = useRef('Pick up coins and visit the Merchant');
  const timeRef = useRef(0);
  const lastFrameRef = useRef(0);
  const terrainRef = useRef<HTMLCanvasElement | null>(null);
  const decoRef = useRef<HTMLCanvasElement | null>(null);
  const zoomRef = useRef(1);

  // ── Zone transition system ──
  const zoneRef = useRef<'hub' | 'grassland' | 'village'>('hub');
  const fadeRef = useRef(0);
  const fadeDirRef = useRef<'in' | 'out' | null>(null);
  const pendingZoneRef = useRef<'hub' | 'grassland' | 'village' | null>(null);
  const glMapRef = useRef<TileId[][] | null>(null);
  const glTerrainRef = useRef<HTMLCanvasElement | null>(null);
  const glDecoRef = useRef<HTMLCanvasElement | null>(null);
  const hubMapCache = useRef<TileId[][] | null>(null);
  const hubTerrainCache = useRef<HTMLCanvasElement | null>(null);
  const hubDecoCache = useRef<HTMLCanvasElement | null>(null);
  const hubPlayerSave = useRef<{ x: number; y: number; facing: 'up' | 'down' | 'left' | 'right' } | null>(null);
  const zoneWRef = useRef(W);
  const zoneHRef = useRef(H);
  const zoneBannerRef = useRef<string | null>(null);
  const zoneBannerTimer = useRef(0);
  const glVisitedRef = useRef<Set<string>>(new Set());
  const glMissionRef = useRef(false);
  const glChestAnimRef = useRef(0);
  const glRewardGivenRef = useRef(false);
  // Grassland interaction state
  const glDialogRef = useRef<{ text: string; speaker: string; timer: number } | null>(null);
  const glLootCollected = useRef<Set<string>>(new Set());
  const coinsCollectedRef = useRef<Set<string>>(new Set());
  const glCaveInspected = useRef(false);
  const glOrcWarning = useRef(0); // flash timer for danger warning
  const glCompletionGold = useRef(false); // hub payoff tracked
  // ── Combat system refs ──
  const orcsRef = useRef<OrcInstance[]>(initOrcs());
  const playerAtkCooldownRef = useRef(0);
  const playerAtkAnimRef = useRef(0);
  const damageNumbersRef = useRef<DamageNumber[]>([]);
  const playerHurtFlashRef = useRef(0);
  const orcsKilledRef = useRef(0);
  const shrineBuffRef = useRef({ active: false, timer: 0 });
  const dialogChoicesRef = useRef<{ options: { label: string; action: string }[]; active: boolean }>({ options: [], active: false });
  const [glShopOpen, setGlShopOpen] = useState(false);
  const glShopOpenRef = useRef(false);
  glShopOpenRef.current = glShopOpen;

  // ── Summer Village zone refs ──
  const svMapRef = useRef<TileId[][] | null>(null);
  const svTerrainRef = useRef<HTMLCanvasElement | null>(null);
  const svDecoRef = useRef<HTMLCanvasElement | null>(null);
  const svNpcsRef = useRef<VillageNPC[]>(initVillageNPCs());
  const svQuestRef = useRef<{ stage: 'none' | 'searching' | 'found' | 'returned' | 'complete'; searched: boolean[] }>({ stage: 'none', searched: [false, false, false] });
  const svChestOpenedRef = useRef(false);
  const svAreasVisited = useRef({ square: false, waterfront: false, residential: false });
  const svDialogChoicesRef = useRef<{ options: { label: string; action: string }[]; active: boolean }>({ options: [], active: false });
  const [svFoodShopOpen, setSvFoodShopOpen] = useState(false);
  const svFoodShopOpenRef = useRef(false);
  svFoodShopOpenRef.current = svFoodShopOpen;
  const [svGenShopOpen, setSvGenShopOpen] = useState(false);
  const svGenShopOpenRef = useRef(false);
  svGenShopOpenRef.current = svGenShopOpen;
  const [svWitchShopOpen, setSvWitchShopOpen] = useState(false);
  const svWitchShopOpenRef = useRef(false);
  svWitchShopOpenRef.current = svWitchShopOpen;
  const svWitchFortuneRef = useRef('');
  const svElderTalked = useRef(false);
  const svCompletionGold = useRef(false);
  const svObjectiveRef = useRef('Explore the Seaside Village');
  const svAnimalsRef = useRef<VillageAnimal[]>(initVillageAnimals());
  const svWildlifeDiscovered = useRef(false);
  const svBanditsRef = useRef<OrcInstance[]>(initVillageBandits());
  const svBanditsKilledRef = useRef(0);

  // ── World Building system refs ──
  const [playerWood, setPlayerWood] = useState(30);
  const [playerStone, setPlayerStone] = useState(15);
  const playerWoodRef = useRef(30);
  const playerStoneRef = useRef(15);
  playerWoodRef.current = playerWood;
  playerStoneRef.current = playerStone;
  const [buildMenuOpen, setBuildMenuOpen] = useState(false);
  const buildMenuOpenRef = useRef(false);
  buildMenuOpenRef.current = buildMenuOpen;
  const [buildCategory, setBuildCategory] = useState<'all' | 'structures' | 'props' | 'decoration' | 'functional'>('all');
  const [placementMode, setPlacementMode] = useState(false);
  const placementModeRef = useRef(false);
  placementModeRef.current = placementMode;
  const placementItemRef = useRef<BuildableItem | null>(null);
  const placementPosRef = useRef({ x: 0, y: 0 });
  const placedObjectsRef = useRef<PlacedWorldObject[]>([]);
  const placementRotRef = useRef(0); // 0-3 rotation state (0=0°, 1=90°, 2=180°, 3=270°)
  const placementFlashRef = useRef(0); // red flash for invalid placement
  // Economy system
  const buildingIncomeRef = useRef<Map<string, { gold: number; wood: number; stone: number }>>(new Map());
  const forageCooldownRef = useRef<Map<string, number>>(new Map()); // spotId → remaining cooldown seconds
  const buildingEffectCooldownRef = useRef<Map<string, number>>(new Map()); // objId → remaining cooldown
  const playerTierRef = useRef(1);
  const resourceCapRef = useRef({ gold: 200, wood: 100, stone: 100 });
  const unlockedItemsRef = useRef<Set<string>>(new Set());
  // ── Population & settlement refs ──
  const populationRef = useRef(0);
  const buildingCountRef = useRef(0);
  const buildingMilestonesRef = useRef<Set<number>>(new Set());
  // Visual townsfolk (cosmetic NPCs near houses) — uses GuttyKreum tilemap
  const townsfolkRef = useRef<AmbientNpc[]>([]);
  const townsfolkSpawnTimer = useRef(0);
  // Ambient sheep (hub + grassland)
  const ambientSheepRef = useRef<AmbientSheep[]>([]);
  const sheepSpawned = useRef(false);
  // Warrior guards
  const warriorGuardsRef = useRef<WarriorGuard[]>([]);
  const guardsSpawned = useRef(false);
  // Village ambient wanderers (non-quest NPCs)
  const villageWanderersRef = useRef<AmbientNpc[]>([]);
  const villageWandererSpawned = useRef(false);
  // Quest flags — persistent across zone transitions
  const questFlagsRef = useRef<Set<string>>(new Set());
  const ambientSpeechRef = useRef<Record<string, AmbientSpeechState>>({});
  const ambientSpeechTickRef = useRef(2.5);
  // Discovery journal (tracks inspected landmarks across all zones)
  const discoveriesRef = useRef<Set<string>>(new Set());
  // ── Minimap refs ──
  const minimapOpenRef = useRef(true);
  const minimapCanvasRef = useRef<HTMLCanvasElement | null>(null); // offscreen terrain cache
  const minimapZoneRef = useRef<string>(''); // tracks which zone terrain is cached for
  const saveLoadedRef = useRef(false);

  // ── Progress save/load (localStorage) ──
  const SAVE_KEY = `worldforge_save_${slug}`;

  const saveProgress = useCallback(() => {
    try {
      const data = {
        gold: playerGoldRef.current,
        wood: playerWoodRef.current,
        stone: playerStoneRef.current,
        health: Math.round(healthRef.current),
        inventory,
        zone: zoneRef.current,
        px: playerRef.current.x,
        py: playerRef.current.y,
        facing: playerRef.current.facing,
        orcsKilled: orcsKilledRef.current,
        deadOrcIds: orcsRef.current.filter(o => o.state === 'dead').map(o => o.id),
        deadBanditIds: svBanditsRef.current.filter(b => b.state === 'dead').map(b => b.id),
        glReward: glRewardGivenRef.current,
        glCompletion: glCompletionGold.current,
        glVisited: [...glVisitedRef.current],
        visited: [...visitedRef.current],
        coins: [...coinsCollectedRef.current],
        glLoot: [...glLootCollected.current],
        glCave: glCaveInspected.current,
        glMission: glMissionRef.current,
        svQuest: svQuestRef.current,
        svChest: svChestOpenedRef.current,
        svCompletion: svCompletionGold.current,
        svBanditsKilled: svBanditsKilledRef.current,
        svAreas: svAreasVisited.current,
        svElder: svElderTalked.current,
        svWildlife: svWildlifeDiscovered.current,
        unlocked: [...unlockedItemsRef.current],
        discoveries: [...discoveriesRef.current],
        buildingMilestones: [...buildingMilestonesRef.current],
        minimapOpen: minimapOpenRef.current,
        ts: Date.now(),
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch { /* quota exceeded or private browsing */ }
  }, [SAVE_KEY, inventory]);

  // Load saved progress on mount
  useEffect(() => {
    if (saveLoadedRef.current) return;
    saveLoadedRef.current = true;
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return;
      const d = JSON.parse(raw);
      if (!d || typeof d.gold !== 'number') return;
      // Resources
      setPlayerGold(d.gold); playerGoldRef.current = d.gold;
      setPlayerWood(d.wood ?? 30); playerWoodRef.current = d.wood ?? 30;
      setPlayerStone(d.stone ?? 15); playerStoneRef.current = d.stone ?? 15;
      healthRef.current = d.health ?? 100;
      // Inventory
      if (d.inventory && typeof d.inventory === 'object') setInventory(d.inventory);
      // Zone & position
      if (d.zone) zoneRef.current = d.zone;
      if (d.px != null && d.py != null) {
        playerRef.current.x = d.px;
        playerRef.current.y = d.py;
        playerRef.current.facing = d.facing || 'down';
      }
      // Grassland progress
      orcsKilledRef.current = d.orcsKilled ?? 0;
      if (d.deadOrcIds?.length) {
        const deadSet = new Set(d.deadOrcIds as number[]);
        orcsRef.current.forEach(o => { if (deadSet.has(o.id)) { o.state = 'dead'; o.hp = 0; o.deathFrame = 4; } });
      }
      glRewardGivenRef.current = d.glReward ?? false;
      glCompletionGold.current = d.glCompletion ?? false;
      if (d.glVisited?.length) d.glVisited.forEach((v: string) => glVisitedRef.current.add(v));
      if (d.visited?.length) d.visited.forEach((v: string) => visitedRef.current.add(v));
      if (d.coins?.length) d.coins.forEach((c: string) => coinsCollectedRef.current.add(c));
      if (d.glLoot?.length) d.glLoot.forEach((l: string) => glLootCollected.current.add(l));
      glCaveInspected.current = d.glCave ?? false;
      glMissionRef.current = d.glMission ?? false;
      // Village progress
      if (d.svQuest) svQuestRef.current = d.svQuest;
      svChestOpenedRef.current = d.svChest ?? false;
      svCompletionGold.current = d.svCompletion ?? false;
      svBanditsKilledRef.current = d.svBanditsKilled ?? 0;
      if (d.deadBanditIds?.length) {
        const deadSet = new Set(d.deadBanditIds as number[]);
        svBanditsRef.current.forEach(b => { if (deadSet.has(b.id)) { b.state = 'dead'; b.hp = 0; b.deathFrame = 4; } });
      }
      if (d.svAreas) svAreasVisited.current = d.svAreas;
      svElderTalked.current = d.svElder ?? false;
      svWildlifeDiscovered.current = d.svWildlife ?? false;
      // Unlocked blueprints
      if (d.unlocked?.length) d.unlocked.forEach((u: string) => unlockedItemsRef.current.add(u));
      // Discoveries & milestones
      if (d.discoveries?.length) d.discoveries.forEach((v: string) => discoveriesRef.current.add(v));
      if (d.buildingMilestones?.length) d.buildingMilestones.forEach((v: number) => buildingMilestonesRef.current.add(v));
      if (d.minimapOpen != null) minimapOpenRef.current = d.minimapOpen;
    } catch { /* corrupt save data — start fresh */ }
  }, [SAVE_KEY]);

  // Auto-save every 15 seconds
  useEffect(() => {
    const id = setInterval(() => saveProgress(), 15000);
    // Also save on page unload
    const onUnload = () => saveProgress();
    window.addEventListener('beforeunload', onUnload);
    return () => { clearInterval(id); window.removeEventListener('beforeunload', onUnload); };
  }, [saveProgress]);

  const { assets: ga, loading: assetsLoading, error: assetsError } = useGameAssets();

  // ── Build hue-shifted canvas when assets + character are ready ──
  useEffect(() => {
    if (ga && chosenCharIndex >= 0) {
      hueCanvasRef.current = createHueShiftedCanvas(ga.npcTilemap, chosenHueShift);
    }
  }, [ga, chosenCharIndex, chosenHueShift]);

  const handleCharSelect = useCallback((charIdx: number, hue: number, name: string) => {
    setChosenCharIndex(charIdx);
    setChosenHueShift(hue);
    setChosenDisplayName(name);
    chosenCharRef.current = { charIndex: charIdx, hueShift: hue };
    setCharPickerOpen(false);
    localStorage.setItem(CHAR_SAVE_KEY, JSON.stringify({ charIndex: charIdx, hueShift: hue, displayName: name }));
    if (ga) {
      hueCanvasRef.current = createHueShiftedCanvas(ga.npcTilemap, hue);
    }
  }, [ga]);

  const triggerAmbientSpeech = useCallback((id: string, text: string) => {
    ambientSpeechRef.current[id] = {
      text,
      timer: AMBIENT_SPEECH_DURATION,
      cooldown: nextAmbientCooldown(),
    };
  }, []);

  const tickAmbientSpeech = useCallback((dt: number) => {
    for (const state of Object.values(ambientSpeechRef.current)) {
      if (state.timer > 0) state.timer = Math.max(0, state.timer - dt);
      else if (state.cooldown > 0) state.cooldown = Math.max(0, state.cooldown - dt);
    }
  }, []);

  const getCurrentAmbientSpeakers = useCallback((): AmbientSpeaker[] => {
    const zone = zoneRef.current;
    const speakers: AmbientSpeaker[] = [];

    if (zone === 'hub') {
      for (const folk of townsfolkRef.current) {
        const voice =
          folk.charKey === 'FemaleBaker' ? 'baker' :
          folk.charKey === 'MaleCasual' ? 'dockhand' :
          folk.charKey === 'FemaleYouth' ? 'youth' :
          folk.charKey === 'MaleTraditional' ? 'traditional' :
          folk.charKey === 'FemaleCafeMaid' ? 'maid' :
          folk.charKey === 'MaleStudent' ? 'student' :
          folk.charKey === 'FemaleElder' ? 'elder_woman' :
          'punk';
        speakers.push({ id: folk.id, name: folk.name, x: folk.x, y: folk.y, zone, voice });
      }
      for (const sheep of ambientSheepRef.current) {
        if (sheep.zone !== 'hub') continue;
        speakers.push({ id: sheep.id, name: 'Sheep', x: sheep.x, y: sheep.y, zone, voice: 'sheep' });
      }
    } else if (zone === 'grassland') {
      for (const guard of warriorGuardsRef.current) {
        if (guard.zone !== zone) continue;
        speakers.push({ id: guard.id, name: guard.name, x: guard.x, y: guard.y, zone, voice: 'guard' });
      }
      for (const sheep of ambientSheepRef.current) {
        if (sheep.zone !== zone) continue;
        speakers.push({ id: sheep.id, name: 'Sheep', x: sheep.x, y: sheep.y, zone, voice: 'sheep' });
      }
    } else if (zone === 'village') {
      for (const npc of svNpcsRef.current) {
        const voice =
          npc.id === 'food_merchant' ? 'merchant_food' :
          npc.id === 'gen_merchant' ? 'merchant_trade' :
          npc.id === 'elder' ? 'elder' :
          npc.id === 'marina' ? 'marina' :
          npc.id === 'grandma' ? 'grandma' :
          'villager';
        speakers.push({ id: npc.id, name: npc.name, x: npc.x, y: npc.y, zone, voice });
      }
      speakers.push({ id: 'witch', name: 'Willow', x: SV_WITCH_POS.x, y: SV_WITCH_POS.y, zone, voice: 'elder' });
      for (const vw of villageWanderersRef.current) {
        const voice =
          vw.id === 'village_student' ? 'student_village' :
          vw.id === 'village_youth' ? 'youth_village' :
          'shiba';
        speakers.push({ id: vw.id, name: vw.name, x: vw.x, y: vw.y, zone, voice });
      }
    }

    return speakers;
  }, []);

  const maybeTriggerAmbientChatter = useCallback(() => {
    if (inspectingRef.current || shopOpenRef.current || glShopOpenRef.current || svFoodShopOpenRef.current || svGenShopOpenRef.current || svWitchShopOpenRef.current || unifiedShopOpenRef.current || helpOpenRef.current || dialogChoicesRef.current.active || svDialogChoicesRef.current.active) {
      return;
    }

    const speakers = getCurrentAmbientSpeakers();
    if (speakers.length === 0) return;

    const readySpeakers = speakers.filter((speaker) => {
      const state = ambientSpeechRef.current[speaker.id];
      return !state || (state.timer <= 0 && state.cooldown <= 0);
    });
    if (readySpeakers.length === 0) return;

    for (const pair of AMBIENT_CHATTER) {
      const a = speakers.find((s) => s.id === pair.a);
      const b = speakers.find((s) => s.id === pair.b);
      if (!a || !b) continue;
      const aState = ambientSpeechRef.current[a.id];
      const bState = ambientSpeechRef.current[b.id];
      const bothReady = (!aState || (aState.timer <= 0 && aState.cooldown <= 0)) && (!bState || (bState.timer <= 0 && bState.cooldown <= 0));
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (bothReady && dist < 8 && Math.random() < 0.5) {
        const lines = pair.lines[Math.floor(Math.random() * pair.lines.length)];
        triggerAmbientSpeech(a.id, lines[0]);
        triggerAmbientSpeech(b.id, lines[1]);
        return;
      }
    }

    const speaker = readySpeakers[Math.floor(Math.random() * readySpeakers.length)];
    // 30% chance for growth-aware lines when hub has 10+ buildings
    const growthLines = [
      'The town looks bigger every day.',
      'So many new buildings!',
      'I barely recognize this place.',
      'Feels like a real settlement now.',
      'More neighbors means more safety.',
    ];
    if (buildingCountRef.current >= 10 && zoneRef.current === 'hub' && Math.random() < 0.3) {
      triggerAmbientSpeech(speaker.id, growthLines[Math.floor(Math.random() * growthLines.length)]);
      return;
    }
    const pool = AMBIENT_SPEECH_LINES[speaker.voice] ?? AMBIENT_SPEECH_LINES.villager;
    triggerAmbientSpeech(speaker.id, pool[Math.floor(Math.random() * pool.length)]);
  }, [getCurrentAmbientSpeakers, triggerAmbientSpeech]);

  // Build zone
  useEffect(() => {
    const map = buildWorldMap();
    mapRef.current = map;
    placedRef.current = placeEntities(map, entities);
    setReady(true);
  }, [entities]);

  // Pre-render when assets ready + restore zone if saved in non-hub zone
  useEffect(() => {
    if (!ga || !mapRef.current) return;
    const entityPositions = new Set(placedRef.current.map(pe => `${pe.tileX},${pe.tileY}`));
    terrainRef.current = prerenderTerrain(mapRef.current, ga);
    decoRef.current = prerenderDecorations(mapRef.current, entityPositions, placedRef.current, ga);
    // If loaded into grassland or village, build that zone's map
    const zone = zoneRef.current;
    if (zone === 'grassland') {
      hubMapCache.current = mapRef.current;
      hubTerrainCache.current = terrainRef.current;
      hubDecoCache.current = decoRef.current;
      if (!glMapRef.current) glMapRef.current = buildGrasslandMap();
      if (!glTerrainRef.current) glTerrainRef.current = prerenderGrasslandTerrain(glMapRef.current);
      if (!glDecoRef.current) glDecoRef.current = prerenderGrasslandDeco(glMapRef.current, ga);
      mapRef.current = glMapRef.current;
      terrainRef.current = glTerrainRef.current;
      decoRef.current = glDecoRef.current;
      zoneWRef.current = GL_W;
      zoneHRef.current = GL_H;
    } else if (zone === 'village') {
      hubMapCache.current = mapRef.current;
      hubTerrainCache.current = terrainRef.current;
      hubDecoCache.current = decoRef.current;
      if (!svMapRef.current) svMapRef.current = buildVillageMap();
      if (!svTerrainRef.current) svTerrainRef.current = prerenderVillageTerrain(svMapRef.current);
      if (!svDecoRef.current) svDecoRef.current = prerenderVillageDeco(svMapRef.current, ga);
      mapRef.current = svMapRef.current;
      terrainRef.current = svTerrainRef.current;
      decoRef.current = svDecoRef.current;
      zoneWRef.current = SV_W;
      zoneHRef.current = SV_H;
    }
  }, [ga, ready]);

  // Load placed objects from API
  useEffect(() => {
    if (!worldId) return;
    fetch(`/api/worlds/${slug}/placed-objects`)
      .then(r => r.json())
      .then(data => {
        if (data.objects) {
          placedObjectsRef.current = data.objects.map((o: { id: string; zone: string; tileX: number; tileY: number; itemType: string; rotation?: number; lastCollectedAt?: string }) => ({
            id: o.id, zone: o.zone, tileX: o.tileX, tileY: o.tileY, itemType: o.itemType, rotation: o.rotation || 0, lastCollectedAt: o.lastCollectedAt,
          }));
          // Calculate offline income for income buildings
          const now = Date.now();
          let offlineGold = 0, offlineWood = 0, offlineStone = 0;
          const MAX_OFFLINE_MS = 8 * 60 * 60 * 1000; // 8 hours cap
          for (const obj of placedObjectsRef.current) {
            const bItem = BUILD_ITEMS.find(b => b.id === obj.itemType);
            if (!bItem?.income) continue;
            const lastT = obj.lastCollectedAt ? new Date(obj.lastCollectedAt).getTime() : now;
            const elapsed = Math.min(now - lastT, MAX_OFFLINE_MS);
            const minutes = elapsed / 60000;
            if (bItem.income.gold) offlineGold += Math.floor(bItem.income.gold * minutes);
            if (bItem.income.wood) offlineWood += Math.floor(bItem.income.wood * minutes);
            if (bItem.income.stone) offlineStone += Math.floor(bItem.income.stone * minutes);
            // Pre-seed live accumulation with fractional remainder
            const fracG = bItem.income.gold ? (bItem.income.gold * minutes) % 1 : 0;
            const fracW = bItem.income.wood ? (bItem.income.wood * minutes) % 1 : 0;
            const fracS = bItem.income.stone ? (bItem.income.stone * minutes) % 1 : 0;
            buildingIncomeRef.current.set(obj.id, { gold: fracG, wood: fracW, stone: fracS });
          }
          if (offlineGold > 0 || offlineWood > 0 || offlineStone > 0) {
            playerGoldRef.current = Math.min(playerGoldRef.current + offlineGold, resourceCapRef.current.gold);
            playerWoodRef.current = Math.min(playerWoodRef.current + offlineWood, resourceCapRef.current.wood);
            playerStoneRef.current = Math.min(playerStoneRef.current + offlineStone, resourceCapRef.current.stone);
            setPlayerGold(playerGoldRef.current);
            setPlayerWood(playerWoodRef.current);
            setPlayerStone(playerStoneRef.current);
            const parts: string[] = [];
            if (offlineGold > 0) parts.push(`+${offlineGold} Gold`);
            if (offlineWood > 0) parts.push(`+${offlineWood} Wood`);
            if (offlineStone > 0) parts.push(`+${offlineStone} Stone`);
            zoneBannerRef.current = `Welcome back! ${parts.join(', ')}`;
            zoneBannerTimer.current = 4;
          }
          // Update storage caps based on loaded chests + warehouses
          const chestCount = placedObjectsRef.current.filter(o => o.itemType === 'storage_chest').length;
          const whCount = placedObjectsRef.current.filter(o => o.itemType === 'warehouse').length;
          const capB = chestCount * 50 + whCount * 100;
          resourceCapRef.current = { gold: 200 + capB, wood: 100 + capB, stone: 100 + capB };
        }
      })
      .catch(err => console.error('Failed to load placed objects:', err));
  }, [worldId, slug]);

  // Resize
  useEffect(() => {
    const container = canvasRef.current?.parentElement;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    setCanvasSize({ w: rect.width, h: rect.height });
    const ro = new ResizeObserver(entries => {
      for (const e of entries) setCanvasSize({ w: e.contentRect.width, h: e.contentRect.height });
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  // Zoom
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      zoomRef.current = Math.max(0.4, Math.min(2.5, zoomRef.current + delta));
    };
    canvas.addEventListener('wheel', onWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', onWheel);
  }, []);

  // ── World Building helpers ──
  const isPlacementValid = useCallback((pos: { x: number; y: number }, item: BuildableItem, rot: number = 0): boolean => {
    const zone = zoneRef.current;
    const map = zone === 'hub' ? mapRef.current : zone === 'grassland' ? glMapRef.current : svMapRef.current;
    if (!map) return false;
    const { tw, th } = getRotatedDims(item, rot);
    const curW = zoneWRef.current;
    const curH = zoneHRef.current;
    for (let dy = 0; dy < th; dy++) {
      for (let dx = 0; dx < tw; dx++) {
        const tx = pos.x + dx;
        const ty = pos.y + dy;
        if (tx < 0 || tx >= curW || ty < 0 || ty >= curH) return false;
        if (!WALKABLE.has(map[ty][tx])) return false;
        if (placedObjectsRef.current.some(o => o.zone === zone && o.tileX === tx && o.tileY === ty)) return false;
      }
    }
    // Block near zone gates
    if (zone === 'hub') {
      for (let dy = 0; dy < th; dy++) for (let dx = 0; dx < tw; dx++) {
        const tx = pos.x + dx, ty = pos.y + dy;
        if (Math.abs(tx - 56) < 3 && Math.abs(ty - 17) < 3) return false; // Northern Pass
        if (Math.abs(tx - 96) < 3 && Math.abs(ty - 46) < 3) return false; // Docks gate
      }
    } else if (zone === 'grassland') {
      if (pos.y + th > 57) return false;
    } else if (zone === 'village') {
      if (pos.x < 3) return false;
    }
    return true;
  }, []);

  const enterPlacementMode = useCallback((item: BuildableItem) => {
    placementItemRef.current = item;
    placementRotRef.current = 0;
    const p = playerRef.current;
    const offY = p.facing === 'up' ? -2 : p.facing === 'down' ? 2 : 0;
    const offX = p.facing === 'left' ? -2 : p.facing === 'right' ? 2 : 0;
    placementPosRef.current = { x: Math.floor(p.x) + offX, y: Math.floor(p.y) + offY };
    setPlacementMode(true);
    setBuildMenuOpen(false);
  }, []);

  const confirmPlacement = useCallback(async () => {
    const item = placementItemRef.current;
    if (!item) return;
    const pos = { ...placementPosRef.current };
    const rot = placementRotRef.current;
    const zone = zoneRef.current;

    if (!isPlacementValid(pos, item, rot)) {
      placementFlashRef.current = 0.4;
      return;
    }

    const { tw, th } = getRotatedDims(item, rot);

    // Deduct resources
    playerGoldRef.current -= item.cost.gold;
    playerWoodRef.current -= item.cost.wood;
    playerStoneRef.current -= item.cost.stone;
    setPlayerGold(playerGoldRef.current);
    setPlayerWood(playerWoodRef.current);
    setPlayerStone(playerStoneRef.current);

    // Add to local list (optimistic)
    const tempId = `temp_${Date.now()}`;
    for (let dy = 0; dy < th; dy++) {
      for (let dx = 0; dx < tw; dx++) {
        if (dx === 0 && dy === 0) continue; // anchor tile added below
        placedObjectsRef.current.push({ id: `${tempId}_fill_${dx}_${dy}`, zone, tileX: pos.x + dx, tileY: pos.y + dy, itemType: '_fill', rotation: 0 });
      }
    }
    placedObjectsRef.current.push({ id: tempId, zone, tileX: pos.x, tileY: pos.y, itemType: item.id, rotation: rot });

    // Floating text
    damageNumbersRef.current.push({
      x: pos.x * TILE_SIZE + 16, y: pos.y * TILE_SIZE - 16,
      text: `+${item.name} built!`, color: '#80c860', timer: 2.0,
    });

    // Exit placement mode
    setPlacementMode(false);
    placementItemRef.current = null;

    // Persist to API
    if (worldId) {
      try {
        const res = await fetch(`/api/worlds/${slug}/placed-objects`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ zone, tileX: pos.x, tileY: pos.y, itemType: item.id, rotation: rot }),
        });
        const data = await res.json();
        if (data.object) {
          const idx = placedObjectsRef.current.findIndex(o => o.id === tempId);
          if (idx >= 0) placedObjectsRef.current[idx].id = data.object.id;
        }
      } catch (err) {
        console.error('Failed to save placed object:', err);
      }
    }
  }, [isPlacementValid, slug, worldId]);

  // Keys
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();

      // ── Chat toggle (Enter key) ──
      if (k === 'enter' && !chatVisibleRef.current && !inspecting && !shopOpen && !buildMenuOpen && !helpOpen && !unifiedShopOpen) {
        e.preventDefault();
        setChatVisible(true);
        setTimeout(() => chatInputRef.current?.focus(), 50);
        return;
      }
      if (chatVisibleRef.current) return; // Don't process game keys while chatting

      if (['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright','e',' ','b','r','m','c'].includes(k)) {
        e.preventDefault();
        keysRef.current.add(k);
      }

      // ── Character picker toggle (C key) ──
      if (k === 'c' && !chatVisibleRef.current && !shopOpen && !tradeOpen && !glShopOpen && !svFoodShopOpen && !svGenShopOpen && !svWitchShopOpen && !inspecting && !placementMode && !charPickerOpen) {
        setCharPickerOpen(true);
        return;
      }

      // ── Build menu toggle (B key, owner only) ──
      if (k === 'b' && isOwner && !shopOpen && !tradeOpen && !glShopOpen && !svFoodShopOpen && !svGenShopOpen && !svWitchShopOpen && !inspecting && !placementMode) {
        setBuildMenuOpen(prev => { if (!prev) { setUnifiedShopOpen(false); setHelpOpen(false); } return !prev; });
        return;
      }

      // ── Placement mode controls ──
      if (placementMode && placementItemRef.current) {
        const pos = placementPosRef.current;
        const curW = zoneWRef.current;
        const curH = zoneHRef.current;
        if (k === 'a' || k === 'arrowleft') { pos.x = Math.max(0, pos.x - 1); return; }
        if (k === 'd' || k === 'arrowright') { pos.x = Math.min(curW - 1, pos.x + 1); return; }
        if (k === 'w' || k === 'arrowup') { pos.y = Math.max(0, pos.y - 1); return; }
        if (k === 's' || k === 'arrowdown') { pos.y = Math.min(curH - 1, pos.y + 1); return; }
        if (k === 'r' && placementItemRef.current.rotatable) {
          placementRotRef.current = (placementRotRef.current + 1) % 4;
          return;
        }
        if (k === 'e' || k === 'enter') { confirmPlacement(); return; }
        if (k === 'escape') { setPlacementMode(false); placementItemRef.current = null; placementRotRef.current = 0; return; }
        return; // block all other keys in placement mode
      }

      // ── Dialogue choice selection (1/2/3) ──
      if (['1','2','3'].includes(k) && dialogChoicesRef.current.active) {
        const idx = parseInt(k) - 1;
        const opt = dialogChoicesRef.current.options[idx];
        if (opt) {
          dialogChoicesRef.current = { options: [], active: false };
          switch (opt.action) {
            case 'shop':
              glDialogRef.current = null;
              setGlShopOpen(true);
              break;
            case 'lore':
              glDialogRef.current = {
                speaker: 'Traveling Vendor',
                text: 'These grasslands were peaceful once. Then the orc warband moved into that stronghold to the north. They raid every caravan. Clear all 7 of them and this land might recover.',
                timer: 7,
              };
              break;
            case 'tips': {
              const orcK2 = orcsKilledRef.current;
              const curHpPct = healthRef.current / MAX_HEALTH;
              let tipText: string;
              if (curHpPct < 0.4) {
                tipText = "You look hurt! I have Health Potions in my shop. Heal up before heading back into battle.";
              } else if (orcK2 < 3) {
                tipText = "Start with the patrol orcs near the edges of the stronghold. The center is heavily guarded. Use SPACE to attack.";
              } else if (orcK2 < 7) {
                tipText = `${7 - orcK2} orcs remain. The shrine inside the stronghold grants a powerful buff once the guards nearby are cleared.`;
              } else {
                tipText = "The stronghold has fallen! Open the chest at the shrine to claim your reward, then head back south.";
              }
              glDialogRef.current = { speaker: 'Traveling Vendor', text: tipText, timer: 7 };
              break;
            }
            // Hub merchant actions
            case 'hub_shop':
              glDialogRef.current = null;
              dialogChoicesRef.current = { options: [], active: false };
              setShopOpen(true);
              break;
            case 'hub_trade':
              glDialogRef.current = null;
              dialogChoicesRef.current = { options: [], active: false };
              setTradeOpen(true);
              break;
            case 'hub_news': {
              const doneGL = glCompletionGold.current;
              const doneSV = svCompletionGold.current;
              const orcK = orcsKilledRef.current;
              const bldgC = buildingCountRef.current;
              let newsText: string;
              if (doneGL && doneSV && bldgC >= 10) {
                newsText = "Your town is thriving! Traders from distant lands are taking notice. Keep building — this could become a great city.";
              } else if (doneGL && doneSV) {
                newsText = "Peace reigns across both the grasslands and the village. Focus on building your settlement — place houses to attract townsfolk!";
              } else if (doneGL) {
                newsText = "The stronghold is cleared! The seaside village to the southeast could use help. Travel through the Docks South Gate.";
              } else if (orcK >= 3) {
                newsText = `I hear you've been fighting orcs! ${7 - orcK} more remain at the stronghold. The shrine chest will open once they're all defeated.`;
              } else if (bldgC >= 5) {
                newsText = "Your settlement is growing nicely! But orcs still threaten the northern grasslands. Enter the Northern Pass when you're ready.";
              } else {
                newsText = "Orcs have been spotted north of here. The road through Northern Pass leads to their stronghold. Stock up before you go!";
              }
              glDialogRef.current = { speaker: 'Town Merchant', text: newsText, timer: 7 };
              break;
            }
            case 'hub_info':
              glDialogRef.current = {
                speaker: 'Town Merchant',
                text: "Been supplying this town since the first settlers arrived. Bread, potions, scrolls — whatever you need for the road. My prices are fair, I promise.",
                timer: 6,
              };
              break;
          }
        }
      }

      // ── SPACE: melee attack ──
      if (k === ' ' && zoneRef.current === 'grassland' && !glShopOpen && !inspecting && playerAtkCooldownRef.current <= 0) {
        playerAtkCooldownRef.current = PLAYER_ATK_COOLDOWN;
        playerAtkAnimRef.current = 0.35;

        const p = playerRef.current;
        for (const orc of orcsRef.current) {
          if (orc.state === 'dead') continue;
          const dx = orc.x - p.x;
          const dy = orc.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > PLAYER_ATK_RANGE) continue;

          let inCone = false;
          if (p.facing === 'right' && dx > 0) inCone = true;
          if (p.facing === 'left' && dx < 0) inCone = true;
          if (p.facing === 'down' && dy > 0) inCone = true;
          if (p.facing === 'up' && dy < 0) inCone = true;
          if (dist < 0.8) inCone = true;

          if (inCone) {
            let dmg = PLAYER_ATK_DAMAGE;
            if (shrineBuffRef.current.active) dmg = Math.floor(dmg * 1.5);
            const hasStr = buffsRef.current.some(b => b.effect === 'strength' && b.remaining > 0);
            if (hasStr) dmg = Math.floor(dmg * 1.5);
            // Barracks zone-wide +15% damage
            if (placedObjectsRef.current.some(o => o.itemType === 'barracks' && o.zone === zoneRef.current)) dmg = Math.floor(dmg * 1.15);

            orc.hp -= dmg;
            orc.hurtTimer = ORC_HURT_DURATION;
            orc.state = 'hurt'; orc.stateTimer = 0;
            orc.facing = dx > 0 ? 'left' : 'right';

            damageNumbersRef.current.push({
              x: orc.x * TILE_SIZE + 16, y: orc.y * TILE_SIZE - 16,
              text: `-${dmg}`, color: '#ff4040', timer: 1.0,
            });

            if (orc.hp <= 0) {
              orc.hp = 0;
              orc.state = 'dead'; orc.stateTimer = 0; orc.deathFrame = 0;
              orcsKilledRef.current++;
              const goldDrop = orc.kind === 'mage' ? 20 : 10;
              playerGoldRef.current = Math.min(playerGoldRef.current + goldDrop, resourceCapRef.current.gold);
              setPlayerGold(playerGoldRef.current);
              damageNumbersRef.current.push({
                x: orc.x * TILE_SIZE + 16, y: orc.y * TILE_SIZE - 32,
                text: `+${goldDrop}G`, color: '#e8c86a', timer: 1.5,
              });
              // Resource drops: wood + stone
              const isMage = orc.kind === 'mage';
              const woodDrop = isMage ? 2 : (Math.random() < 0.5 ? 1 + Math.floor(Math.random() * 3) : 0);
              const stoneDrop = isMage ? 1 : (Math.random() < 0.3 ? 1 + Math.floor(Math.random() * 2) : 0);
              if (woodDrop > 0) {
                playerWoodRef.current = Math.min(playerWoodRef.current + woodDrop, resourceCapRef.current.wood);
                setPlayerWood(playerWoodRef.current);
                damageNumbersRef.current.push({ x: orc.x * TILE_SIZE + 32, y: orc.y * TILE_SIZE - 20, text: `+${woodDrop} Wood`, color: '#8b6c3e', timer: 1.5 });
              }
              if (stoneDrop > 0) {
                playerStoneRef.current = Math.min(playerStoneRef.current + stoneDrop, resourceCapRef.current.stone);
                setPlayerStone(playerStoneRef.current);
                damageNumbersRef.current.push({ x: orc.x * TILE_SIZE, y: orc.y * TILE_SIZE - 20, text: `+${stoneDrop} Stone`, color: '#808078', timer: 1.5 });
              }
            }
          }
        }
      }

      // ── SPACE: village hunt ──
      if (k === ' ' && zoneRef.current === 'village' && !svFoodShopOpen && !svGenShopOpen && !svWitchShopOpen && playerAtkCooldownRef.current <= 0) {
        playerAtkCooldownRef.current = PLAYER_ATK_COOLDOWN;
        playerAtkAnimRef.current = 0.35;

        const p = playerRef.current;
        for (const animal of svAnimalsRef.current) {
          if (animal.state === 'dead') continue;
          const dx = animal.x - p.x;
          const dy = animal.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > PLAYER_ATK_RANGE) continue;

          let inCone = false;
          if (p.facing === 'right' && dx > 0) inCone = true;
          if (p.facing === 'left' && dx < 0) inCone = true;
          if (p.facing === 'down' && dy > 0) inCone = true;
          if (p.facing === 'up' && dy < 0) inCone = true;
          if (dist < 0.8) inCone = true;

          if (inCone) {
            const dmg = PLAYER_ATK_DAMAGE;
            animal.hp -= dmg;
            damageNumbersRef.current.push({
              x: animal.x * TILE_SIZE + 16, y: animal.y * TILE_SIZE - 16,
              text: `-${dmg}`, color: '#ff4040', timer: 1.0,
            });

            if (animal.hp <= 0) {
              animal.hp = 0;
              animal.state = 'dead'; animal.stateTimer = 0;
              animal.respawnTimer = SV_ANIMAL_RESPAWN_TIME;
              const hasLuck = buffsRef.current.some(b => b.effect === 'gold_find' && b.remaining > 0);
              const goldDrop = hasLuck ? Math.ceil(animal.loot * 1.25) : animal.loot;
              playerGoldRef.current += goldDrop;
              setPlayerGold(playerGoldRef.current);
              damageNumbersRef.current.push({
                x: animal.x * TILE_SIZE + 16, y: animal.y * TILE_SIZE - 32,
                text: `+${goldDrop}G`, color: '#e8c86a', timer: 1.5,
              });
              if (!svWildlifeDiscovered.current) {
                svWildlifeDiscovered.current = true;
                zoneBannerRef.current = 'Discovered: Village Wildlife';
                zoneBannerTimer.current = 2.5;
              }
            } else {
              animal.state = 'flee'; animal.stateTimer = 0;
              animal.facing = dx > 0 ? 'right' : 'left';
            }
          }
        }

        // Also hit bandits
        for (const bandit of svBanditsRef.current) {
          if (bandit.state === 'dead') continue;
          const dx = bandit.x - p.x;
          const dy = bandit.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > PLAYER_ATK_RANGE) continue;

          let inCone = false;
          if (p.facing === 'right' && dx > 0) inCone = true;
          if (p.facing === 'left' && dx < 0) inCone = true;
          if (p.facing === 'down' && dy > 0) inCone = true;
          if (p.facing === 'up' && dy < 0) inCone = true;
          if (dist < 0.8) inCone = true;

          if (inCone) {
            let dmg = PLAYER_ATK_DAMAGE;
            const hasStr = buffsRef.current.some(b => b.effect === 'strength' && b.remaining > 0);
            if (hasStr) dmg = Math.floor(dmg * 1.5);
            if (placedObjectsRef.current.some(o => o.itemType === 'barracks' && o.zone === zoneRef.current)) dmg = Math.floor(dmg * 1.15);

            bandit.hp -= dmg;
            bandit.hurtTimer = ORC_HURT_DURATION;
            bandit.state = 'hurt'; bandit.stateTimer = 0;
            bandit.facing = dx > 0 ? 'left' : 'right';

            damageNumbersRef.current.push({
              x: bandit.x * TILE_SIZE + 16, y: bandit.y * TILE_SIZE - 16,
              text: `-${dmg}`, color: '#ff4040', timer: 1.0,
            });

            if (bandit.hp <= 0) {
              bandit.hp = 0;
              bandit.state = 'dead'; bandit.stateTimer = 0; bandit.deathFrame = 0;
              svBanditsKilledRef.current++;
              const goldDrop = bandit.kind === 'mage' ? 15 : 8;
              playerGoldRef.current = Math.min(playerGoldRef.current + goldDrop, resourceCapRef.current.gold);
              setPlayerGold(playerGoldRef.current);
              damageNumbersRef.current.push({
                x: bandit.x * TILE_SIZE + 16, y: bandit.y * TILE_SIZE - 32,
                text: `+${goldDrop}G`, color: '#e8c86a', timer: 1.5,
              });
              // Resource drops
              const woodDrop = Math.random() < 0.4 ? 1 + Math.floor(Math.random() * 2) : 0;
              const stoneDrop = Math.random() < 0.25 ? 1 : 0;
              if (woodDrop > 0) {
                playerWoodRef.current = Math.min(playerWoodRef.current + woodDrop, resourceCapRef.current.wood);
                setPlayerWood(playerWoodRef.current);
                damageNumbersRef.current.push({ x: bandit.x * TILE_SIZE + 32, y: bandit.y * TILE_SIZE - 20, text: `+${woodDrop} Wood`, color: '#8b6c3e', timer: 1.5 });
              }
              if (stoneDrop > 0) {
                playerStoneRef.current = Math.min(playerStoneRef.current + stoneDrop, resourceCapRef.current.stone);
                setPlayerStone(playerStoneRef.current);
                damageNumbersRef.current.push({ x: bandit.x * TILE_SIZE, y: bandit.y * TILE_SIZE - 20, text: `+${stoneDrop} Stone`, color: '#808078', timer: 1.5 });
              }
              // Check if all bandits cleared
              if (svBanditsRef.current.every(b => b.state === 'dead')) {
                zoneBannerRef.current = 'Village Bandits Cleared! The roads are safe.';
                zoneBannerTimer.current = 4;
              }
            }
          }
        }
      }

      if (k === 'e') {
        if (shopOpen || glShopOpen) { /* shop handles clicks */ }
        else if (nearMerchant && !inspecting && zoneRef.current === 'hub' && !dialogChoicesRef.current.active) {
          dialogChoicesRef.current = {
            active: true,
            options: [
              { label: 'Browse wares', action: 'hub_shop' },
              { label: 'Trade resources', action: 'hub_trade' },
              { label: 'Any news?', action: 'hub_news' },
            ],
          };
          glDialogRef.current = {
            speaker: 'Town Merchant',
            text: "Welcome, traveler! What can I do for you today?",
            timer: 30,
          };
        }
        else if (zoneRef.current === 'hub' && !inspecting && !glDialogRef.current) {
          const hpx = playerRef.current.x, hpy = playerRef.current.y;

          // ── Hub NPC interactions (named townsfolk) ──
          let spokeToNpc = false;
          for (const folk of townsfolkRef.current) {
            const nd = Math.sqrt((hpx - folk.x) ** 2 + (hpy - folk.y) ** 2);
            if (nd > 2.5) continue;
            spokeToNpc = true;
            // Face the player
            const dx = hpx - folk.x, dy = hpy - folk.y;
            folk.facing = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
            folk.idleTimer = 4;

            const bCount = buildingCountRef.current;
            const orcK = orcsKilledRef.current;
            const doneGL = glCompletionGold.current;
            const doneSV = svCompletionGold.current;

            switch (folk.id) {
              case 'hub_marta': // Baker — gossip + sell food
                if (doneGL && doneSV) {
                  glDialogRef.current = { speaker: 'Marta — Baker', text: "Peace at last! Business is booming. I baked extra today — the whole town smells like fresh bread.", timer: 6 };
                } else if (bCount >= 20) {
                  glDialogRef.current = { speaker: 'Marta — Baker', text: `${bCount} buildings! I need a bigger oven. Travelers keep stopping to ask 'who built this place?' and I just point at you.`, timer: 6 };
                } else if (bCount >= 10) {
                  glDialogRef.current = { speaker: 'Marta — Baker', text: "This is starting to feel like a real town! I've got regular customers now. Even the guards stop by for bread on their shifts.", timer: 6 };
                } else if (bCount >= 5) {
                  glDialogRef.current = { speaker: 'Marta — Baker', text: "The town's growing! I can barely keep up with orders. Have you tried the bread at the shop? Best this side of the pass.", timer: 6 };
                } else {
                  glDialogRef.current = { speaker: 'Marta — Baker', text: "Not many customers these days. If this settlement grows, I might finally get a real kitchen instead of baking over a campfire.", timer: 6 };
                }
                break;

              case 'hub_finn': // Dockhand — clues about village + sea
                if (doneSV && (svQuestRef.current.stage === 'returned' || svQuestRef.current.stage === 'complete')) {
                  glDialogRef.current = { speaker: 'Finn — Dockhand', text: "Bandits gone, necklace found — you're the talk of the coast! Trade ships are coming back. These docks will be busy again in no time.", timer: 7 };
                } else if (doneSV) {
                  glDialogRef.current = { speaker: 'Finn — Dockhand', text: "I heard the village is safe again. Maybe the trade ships will come back. These docks could use some life.", timer: 6 };
                } else {
                  glDialogRef.current = { speaker: 'Finn — Dockhand', text: "Used to be a busy port here. Now the docks are half rotten. There's a village through the South Gate — heard they've got trouble of their own.", timer: 6 };
                }
                break;

              case 'hub_lina': { // Shepherd — quest: lost sheep
                const sheepFound = questFlagsRef.current.has('lina_sheep_found');
                const sheepDone = questFlagsRef.current.has('lina_sheep_done');
                if (sheepDone) {
                  glDialogRef.current = { speaker: 'Lina — Shepherd', text: "The flock's all safe, thanks to you. They're grazing by the meadow. Listen — you can hear them from here!", timer: 5 };
                } else if (sheepFound) {
                  questFlagsRef.current.add('lina_sheep_done');
                  setPlayerGold(g => { const n = g + 20; playerGoldRef.current = n; return n; });
                  damageNumbersRef.current.push({ x: hpx * TILE_SIZE + 16, y: hpy * TILE_SIZE - 16, text: '+20 Gold', color: '#e8c040', timer: 2 });
                  glDialogRef.current = { speaker: 'Lina — Shepherd', text: "You found her! Oh thank goodness. Here — take this. It's not much, but it's all I have. You're a lifesaver!", timer: 6 };
                } else {
                  questFlagsRef.current.add('lina_sheep_quest');
                  glDialogRef.current = { speaker: 'Lina — Shepherd', text: "One of my sheep wandered off toward the eastern docks! She's white with a brown spot. If you see her near the water, walk up to her and she'll follow. Please bring her back!", timer: 8 };
                }
                break;
              }

              case 'hub_oswald': // Scholar — lore about ruins
                if (discoveriesRef.current.has('hub_ruins')) {
                  glDialogRef.current = { speaker: 'Oswald — Scholar', text: "You've seen the ruins! Those runes predate everything — older than this land's name. I believe they once channeled a power we've forgotten. Be careful down there.", timer: 7 };
                } else {
                  glDialogRef.current = { speaker: 'Oswald — Scholar', text: "I've been studying the ruins south of here. Ancient stonework — unlike anything built in our era. The runes glow at dusk. I'd give my last coin to know who carved them.", timer: 7 };
                }
                break;

              case 'hub_ada': // Innkeeper — healing + rumors
                if (healthRef.current < MAX_HEALTH * 0.7) {
                  const heal = 15;
                  healthRef.current = Math.min(MAX_HEALTH, healthRef.current + heal);
                  damageNumbersRef.current.push({ x: hpx * TILE_SIZE + 16, y: hpy * TILE_SIZE - 16, text: `+${heal} HP`, color: '#60c060', timer: 1.5 });
                  glDialogRef.current = { speaker: 'Ada — Innkeeper', text: "You look exhausted! Sit down, have some tea. On the house. ...There. Feeling better? The road's hard, but you'll manage.", timer: 6 };
                } else {
                  const rumors = [
                    "I overheard a merchant say there's a fortune chest in the grasslands — but orcs guard it closely.",
                    "They say the witch in the seaside village can brew potions that let you see hidden things. Willow, I think her name is.",
                    "A traveler told me there's a shrine in the orc stronghold. If you clear the guards around it, it grants great power.",
                    "The elder knows more about this land than anyone. If you're lost, ask Edith — she's usually near the forest edge.",
                  ];
                  glDialogRef.current = { speaker: 'Ada — Innkeeper', text: rumors[Math.floor(Math.random() * rumors.length)], timer: 6 };
                }
                break;

              case 'hub_rook': { // Courier — quest: deliver message to village
                const msgDone = questFlagsRef.current.has('rook_msg_done');
                const msgStarted = questFlagsRef.current.has('rook_msg_quest');
                if (msgDone) {
                  glDialogRef.current = { speaker: 'Rook — Courier', text: "You got Rowan's reply? Brilliant. I owe you one — the roads are too dangerous for me alone these days.", timer: 5 };
                } else if (msgStarted) {
                  glDialogRef.current = { speaker: 'Rook — Courier', text: "Did you find Elder Rowan in the seaside village yet? He's the old man near the center of town. Tell him Rook sent you — he'll know.", timer: 6 };
                } else {
                  questFlagsRef.current.add('rook_msg_quest');
                  glDialogRef.current = { speaker: 'Rook — Courier', text: "Hey! You travel between zones, right? I need a message taken to Elder Rowan in the seaside village. I'd go myself, but... orcs. Tell him the supply route is open. He'll reward you.", timer: 8 };
                }
                break;
              }

              case 'hub_edith': // Elder — guidance and world story
                if (doneGL && doneSV && bCount >= 10) {
                  glDialogRef.current = { speaker: 'Edith — Village Elder', text: `Peace in the grasslands, safety in the village, and ${bCount} structures standing tall. I've never seen this land flourish like this. You're building something that will outlast us all.`, timer: 8 };
                } else if (doneGL && doneSV) {
                  glDialogRef.current = { speaker: 'Edith — Village Elder', text: "You've brought peace to both the grasslands and the village. This settlement has a real future now. Keep building — every structure you place brings new life here.", timer: 7 };
                } else if (doneGL) {
                  glDialogRef.current = { speaker: 'Edith — Village Elder', text: "The grasslands are safe, but I've heard troubling news from the seaside village. Bandits, they say. The South Gate at the docks leads there — they could use someone like you.", timer: 7 };
                } else if (orcK >= 1) {
                  glDialogRef.current = { speaker: 'Edith — Village Elder', text: `You've been fighting orcs — I can tell. ${7 - orcK} remain at the stronghold. Clear them all and the shrine chest will open. Be careful near the shaman.`, timer: 7 };
                } else {
                  glDialogRef.current = { speaker: 'Edith — Village Elder', text: "I've watched this land since before the orcs came. Head north through the pass if you're brave — but stock up first. The merchant has potions, and building a well gives you a place to heal.", timer: 8 };
                }
                break;

              case 'hub_dale': // Lookout — warnings and danger intel
                if (doneGL) {
                  glDialogRef.current = { speaker: 'Dale — Lookout', text: "No orc activity from the north anymore. You really cleaned them out. I can finally take my eyes off the pass for a minute.", timer: 5 };
                } else if (orcK >= 3) {
                  glDialogRef.current = { speaker: 'Dale — Lookout', text: `I can see smoke from the stronghold — you're thinning their numbers. ${7 - orcK} left. Watch out for the big one with the staff — that's their shaman.`, timer: 6 };
                } else {
                  glDialogRef.current = { speaker: 'Dale — Lookout', text: "I keep watch over the northern approach. The orcs haven't pushed south yet, but they're getting bold. Seven of them — warriors and a shaman. Enter through the pass if you dare.", timer: 7 };
                }
                break;

              default:
                glDialogRef.current = { speaker: folk.name, text: "...", timer: 3 };
            }
            break;
          }

          // Hub landmark inspections (only if no NPC was spoken to)
          if (!spokeToNpc) {
            const landmarks: { id: string; x: number; y: number; r: number; speaker: string; text: string; heal?: number }[] = [
              { id: 'hub_ruins', x: 42, y: 78, r: 4, speaker: 'Ancient Ruins', text: 'Crumbling walls of a forgotten civilization. Strange runes glow faintly in the stone. Whatever was built here predates all known settlements.' },
              { id: 'hub_shrine', x: 28, y: 62, r: 3, speaker: 'Lakeside Shrine', text: 'A weathered shrine beside still waters. It hums with quiet energy. You feel restored.', heal: 10 },
              { id: 'hub_well', x: 55, y: 45, r: 2, speaker: 'Town Well', text: 'Fresh water from deep underground. The settlement\'s lifeblood. It has served this land for generations.' },
              { id: 'hub_docks', x: 90, y: 45, r: 4, speaker: 'The Docks', text: 'Worn wooden planks stretch over the water. Trade ships once docked here. The South Gate leads to the Seaside Village.' },
              { id: 'hub_forest', x: 22, y: 30, r: 4, speaker: 'Forest Edge', text: 'Ancient trees form a dense canopy. The air smells of pine and damp earth. Small creatures rustle in the undergrowth.' },
              { id: 'hub_hermit', x: 38, y: 59, r: 3, speaker: 'Hermit\'s Hut', text: 'A reclusive dwelling by the lake. Dried herbs hang from the eaves. A note on the door reads: "Gone fishing. Leave coin if you take anything."' },
              { id: 'hub_waystation', x: 57, y: 28, r: 3, speaker: 'Northern Waystation', text: 'A rest stop for travelers heading to the Northern Pass. A weathered journal records names of those who ventured north. Most entries have no return date. The sign reads: "Grasslands ahead \u2014 bring a weapon."' },
              { id: 'hub_cottage', x: 83, y: 41, r: 3, speaker: 'Coast Cottage', text: 'A fisherman\'s home overlooking the eastern waters. Nets hang from hooks, dried by sea wind. The hearth is still warm \u2014 someone lives here. A faded map on the wall shows old trade routes.' },
              { id: 'hub_farm', x: 35, y: 72, r: 3, speaker: 'Southern Farmstead', text: 'Abandoned farm plots, half-overgrown. Rusted tools lie in the dirt. Whoever farmed here left in a hurry. The nearby ruins may hold the answer.' },
              { id: 'hub_coast_road', x: 75, y: 35, r: 4, speaker: 'Coast Road', text: 'A worn trade road connecting the docks to the northern highlands. Cart tracks still mark the stone. In better times, merchants filled this path daily.' },
            ];
            for (const lm of landmarks) {
              const ld = Math.sqrt((hpx - lm.x) ** 2 + (hpy - lm.y) ** 2);
              if (ld < lm.r) {
                glDialogRef.current = { speaker: lm.speaker, text: lm.text, timer: 5 };
                if (!discoveriesRef.current.has(lm.id)) {
                  discoveriesRef.current.add(lm.id);
                  zoneBannerRef.current = `Discovered: ${lm.speaker}`;
                  zoneBannerTimer.current = 2;
                }
                if (lm.heal) {
                  healthRef.current = Math.min(MAX_HEALTH, healthRef.current + lm.heal);
                  damageNumbersRef.current.push({ x: hpx * TILE_SIZE + 16, y: hpy * TILE_SIZE - 16, text: `+${lm.heal} HP`, color: '#60c060', timer: 1.5 });
                }
                // Hermit hut one-time loot
                if (lm.id === 'hub_hermit' && !coinsCollectedRef.current.has('hub_hermit_loot')) {
                  coinsCollectedRef.current.add('hub_hermit_loot');
                  playerGoldRef.current = Math.min(playerGoldRef.current + 8, resourceCapRef.current.gold);
                  setPlayerGold(playerGoldRef.current);
                  damageNumbersRef.current.push({ x: 38 * TILE_SIZE + 16, y: 59 * TILE_SIZE - 24, text: '+8G', color: '#e8c86a', timer: 1.5 });
                }
                break;
              }
            }
          }
        }
        else if (nearbyEntity && !inspecting) setInspecting(nearbyEntity);
        // Grassland E-key interactions
        else if (zoneRef.current === 'grassland') {
          const px = playerRef.current.x, py = playerRef.current.y;

          // Guard dialogue
          let spokeToGuard = false;
          for (const guard of warriorGuardsRef.current) {
            const gd = Math.sqrt((px - guard.x) ** 2 + (py - guard.y) ** 2);
            if (gd < 2.5 && !glDialogRef.current) {
              spokeToGuard = true;
              const killed = orcsKilledRef.current;
              const cleared = glRewardGivenRef.current;
              let guardText: string;
              if (cleared) {
                guardText = guard.id === 'guard_l'
                  ? 'The stronghold has fallen. You fight like a champion. Safe travels back south.'
                  : 'I saw the smoke clear from the stronghold. You did what a dozen soldiers couldn\'t.';
              } else if (killed >= 3) {
                guardText = guard.id === 'guard_l'
                  ? `${7 - killed} orcs remain. Keep pushing. The shrine chest won't open until they're all gone.`
                  : 'I can hear the fighting from here. Give them no mercy \u2014 they showed us none.';
              } else {
                guardText = guard.id === 'guard_l'
                  ? 'Seven orcs hold the stronghold to the north. Clear them all and the ancient shrine unlocks a reward. SPACE to swing your weapon.'
                  : 'We guard this pass day and night. The vendor camp to the south has supplies if you need healing potions.';
              }
              glDialogRef.current = { speaker: guard.name || 'Guard', text: guardText, timer: 6 };
              break;
            }
          }

          // Vendor dialogue choices
          const vd = Math.sqrt((px - GL_VENDOR_POS.x) ** 2 + (py - GL_VENDOR_POS.y) ** 2);
          if (vd < MERCHANT_RANGE && !glDialogRef.current && !glShopOpen) {
            if (glRewardGivenRef.current) {
              glDialogRef.current = {
                speaker: 'Traveling Vendor',
                text: "You cleared the stronghold! I can finally trade in peace. Thank you, adventurer.",
                timer: 5,
              };
            } else {
              dialogChoicesRef.current = {
                active: true,
                options: [
                  { label: 'Open Shop', action: 'shop' },
                  { label: 'About this area', action: 'lore' },
                  { label: 'Combat tips', action: 'tips' },
                ],
              };
              glDialogRef.current = {
                speaker: 'Traveling Vendor',
                text: 'What can I do for you, adventurer?',
                timer: 999,
              };
            }
          }

          // Loot: Ruined Cart stash
          const cartDist = Math.sqrt((px - 18) ** 2 + (py - 9) ** 2);
          if (cartDist < 2.5 && !glLootCollected.current.has('cart')) {
            glLootCollected.current.add('cart');
            playerGoldRef.current += 15;
            setPlayerGold(playerGoldRef.current);
            glDialogRef.current = { speaker: 'Loot', text: 'Found a coin pouch in the wreckage! +15 Gold', timer: 3 };
            damageNumbersRef.current.push({ x: 18 * TILE_SIZE + 16, y: 9 * TILE_SIZE - 16, text: '+15G', color: '#e8c86a', timer: 1.5 });
          }

          // Loot: Cave explorer stash
          const caveLootDist = Math.sqrt((px - 61) ** 2 + (py - 23) ** 2);
          if (caveLootDist < 2.5 && !glLootCollected.current.has('cave')) {
            glLootCollected.current.add('cave');
            playerGoldRef.current += 25;
            setPlayerGold(playerGoldRef.current);
            glDialogRef.current = { speaker: 'Loot', text: "Explorer's stash: a gem pouch! +25 Gold", timer: 3 };
            damageNumbersRef.current.push({ x: 61 * TILE_SIZE + 16, y: 23 * TILE_SIZE - 16, text: '+25G', color: '#e8c86a', timer: 1.5 });
          }

          // Loot: Overlook hidden cache
          const olDist = Math.sqrt((px - 59) ** 2 + (py - 29) ** 2);
          if (olDist < 2.5 && !glLootCollected.current.has('overlook')) {
            glLootCollected.current.add('overlook');
            playerGoldRef.current += 10;
            setPlayerGold(playerGoldRef.current);
            glDialogRef.current = { speaker: 'Loot', text: 'Found coins hidden under rocks! +10 Gold', timer: 3 };
            damageNumbersRef.current.push({ x: 59 * TILE_SIZE + 16, y: 29 * TILE_SIZE - 16, text: '+10G', color: '#e8c86a', timer: 1.5 });
          }

          // Cave inspection
          const caveEntranceDist = Math.sqrt((px - 62) ** 2 + (py - 22) ** 2);
          if (caveEntranceDist < 2.5 && !glCaveInspected.current) {
            glCaveInspected.current = true;
            discoveriesRef.current.add('gl_cave');
            glDialogRef.current = {
              speaker: 'Dark Cave',
              text: 'Cold air seeps from within. The cave is too deep and dark to enter... but claw marks on the walls suggest something large sleeps in the depths.',
              timer: 6,
            };
          }

          // Shrine buff interaction
          const shrineDist = Math.sqrt((px - 40) ** 2 + (py - 12) ** 2);
          if (shrineDist < 2.5 && !shrineBuffRef.current.active) {
            const nearbyOrcs = orcsRef.current.filter(o =>
              o.state !== 'dead' && Math.sqrt((o.homeX - 40) ** 2 + (o.homeY - 12) ** 2) < 5
            );
            if (nearbyOrcs.length === 0) {
              shrineBuffRef.current = { active: true, timer: 45 };
              glDialogRef.current = {
                speaker: 'Ancient Shrine',
                text: 'Ancient power stirs! The spirits of fallen warriors lend their strength to the one who freed them. +50% damage, -20% damage taken for 45s.',
                timer: 4,
              };
            } else {
              glDialogRef.current = {
                speaker: 'Ancient Shrine',
                text: 'The shrine sleeps beneath orc corruption. Their presence suppresses its power. Clear the nearby orcs to awaken it.',
                timer: 3,
              };
            }
          }

          // POI inspect: Rocky Overlook
          if (ellipseDist(px, py, 60, 28, 4, 3) < 0.6 && !glDialogRef.current) {
            if (!discoveriesRef.current.has('gl_overlook')) discoveriesRef.current.add('gl_overlook');
            glDialogRef.current = {
              speaker: 'Rocky Overlook',
              text: 'From here you can see the entire grassland. The orc stronghold looms to the north, smoke rising from their fires. The vendor camp sits safely to the south.',
              timer: 6,
            };
            if (!coinsCollectedRef.current.has('gl_overlook_hp')) {
              coinsCollectedRef.current.add('gl_overlook_hp');
              healthRef.current = Math.min(MAX_HEALTH, healthRef.current + 10);
              damageNumbersRef.current.push({ x: 60 * TILE_SIZE + 16, y: 28 * TILE_SIZE - 24, text: '+10 HP', color: '#60c060', timer: 1.5 });
              glDialogRef.current.text += ' The clear mountain air revitalizes you.';
            }
          }

          // POI inspect: Forest Clearing
          if (ellipseDist(px, py, 20, 32, 4, 3) < 0.6 && !glDialogRef.current) {
            if (!discoveriesRef.current.has('gl_clearing')) discoveriesRef.current.add('gl_clearing');
            glDialogRef.current = {
              speaker: 'Forest Clearing',
              text: 'Ancient trees form a natural cathedral. It\'s peaceful here — the orc invasion hasn\'t reached this grove. Birds sing in the canopy above.',
              timer: 6,
            };
            if (!coinsCollectedRef.current.has('gl_clearing_wood')) {
              coinsCollectedRef.current.add('gl_clearing_wood');
              playerWoodRef.current = Math.min(playerWoodRef.current + 5, resourceCapRef.current.wood);
              setPlayerWood(playerWoodRef.current);
              damageNumbersRef.current.push({ x: 20 * TILE_SIZE + 16, y: 32 * TILE_SIZE - 24, text: '+5 Wood', color: '#8bc34a', timer: 1.5 });
              glDialogRef.current.text += ' You gather fallen branches from the grove floor.';
            }
          }

          // POI inspect: Frog Pond
          if (ellipseDist(px, py, 18, 38, 4, 3) < 0.6 && !glDialogRef.current) {
            if (!discoveriesRef.current.has('gl_pond')) discoveriesRef.current.add('gl_pond');
            glDialogRef.current = {
              speaker: 'Frog Pond',
              text: 'A tranquil pond teeming with life. The frogs seem unbothered by the orc war. Dragonflies dart across the surface.',
              timer: 5,
            };
            if (!coinsCollectedRef.current.has('gl_pond_gold')) {
              coinsCollectedRef.current.add('gl_pond_gold');
              playerGoldRef.current = Math.min(playerGoldRef.current + 5, resourceCapRef.current.gold);
              setPlayerGold(playerGoldRef.current);
              damageNumbersRef.current.push({ x: 18 * TILE_SIZE + 16, y: 38 * TILE_SIZE - 24, text: '+5G', color: '#e8c86a', timer: 1.5 });
              glDialogRef.current.text += ' A shiny pebble glints in the mud — gold!';
            }
          }

          // POI inspect: Stream Crossing
          const scyHere = streamCenterY(px);
          if (Math.abs(py - scyHere) < 2 && px > 25 && px < 55 && !glDialogRef.current) {
            if (!discoveriesRef.current.has('gl_stream')) discoveriesRef.current.add('gl_stream');
            glDialogRef.current = {
              speaker: 'Stream Crossing',
              text: 'Clear water flows over smooth stones. Fish dart beneath the surface. The water is clean enough to drink.',
              timer: 4,
            };
            if (!coinsCollectedRef.current.has('gl_stream_hp')) {
              coinsCollectedRef.current.add('gl_stream_hp');
              healthRef.current = Math.min(MAX_HEALTH, healthRef.current + 15);
              damageNumbersRef.current.push({ x: px * TILE_SIZE + 16, y: py * TILE_SIZE - 24, text: '+15 HP', color: '#60c060', timer: 1.5 });
              glDialogRef.current.text += ' You drink deeply — the fresh water restores you.';
            }
          }

          // Reward chest interaction — unlocked by killing all 7 orcs
          const chestDist = Math.sqrt((px - 42) ** 2 + (py - 12) ** 2);
          if (chestDist < 2.5 && orcsKilledRef.current >= 7 && !glRewardGivenRef.current) {
            glRewardGivenRef.current = true;
            glChestAnimRef.current = 0.01;
            playerGoldRef.current += 75;
            setPlayerGold(playerGoldRef.current);
            zoneBannerRef.current = 'Stronghold Cleared! +75 Gold';
            zoneBannerTimer.current = 4;
          }
        }

        // ── Village E-key interactions ──
        else if (zoneRef.current === 'village') {
          const px = playerRef.current.x, py = playerRef.current.y;

          // NPC interactions
          for (const npc of svNpcsRef.current) {
            const nd = Math.sqrt((px - npc.x) ** 2 + (py - npc.y) ** 2);
            if (nd > 2.5) continue;

            if (npc.id === 'food_merchant' && !svFoodShopOpen && !svDialogChoicesRef.current.active) {
              svDialogChoicesRef.current = {
                active: true,
                options: [
                  { label: 'Browse food', action: 'sv_food_shop' },
                  { label: "What's fresh today?", action: 'sv_food_chat' },
                ],
              };
              const allBanditsClear = svBanditsRef.current.every(b => b.state === 'dead');
              glDialogRef.current = { speaker: 'Fiona — Food Merchant', text: allBanditsClear ? 'Our hero returns! Fresh food for the village champion — on the house! Well, almost.' : 'Welcome! Fresh food, best in the village!', timer: 999 };
              break;
            }
            if (npc.id === 'gen_merchant' && !svGenShopOpen && !svDialogChoicesRef.current.active) {
              svDialogChoicesRef.current = {
                active: true,
                options: [
                  { label: 'Browse supplies', action: 'sv_gen_shop' },
                  { label: 'Any advice for travelers?', action: 'sv_gen_chat' },
                ],
              };
              glDialogRef.current = { speaker: 'Gerald — Merchant', text: 'Supplies for every journey! What do you need?', timer: 999 };
              break;
            }
            if (npc.id === 'elder' && !svDialogChoicesRef.current.active) {
              svElderTalked.current = true;
              // Check for Rook's delivery quest
              if (questFlagsRef.current.has('rook_msg_quest') && !questFlagsRef.current.has('rook_msg_done')) {
                questFlagsRef.current.add('rook_msg_done');
                playerGoldRef.current += 25;
                setPlayerGold(playerGoldRef.current);
                damageNumbersRef.current.push({ x: playerRef.current.x * TILE_SIZE + 16, y: playerRef.current.y * TILE_SIZE - 16, text: '+25 Gold', color: '#e8c040', timer: 2 });
                glDialogRef.current = { speaker: 'Elder Rowan', text: "A message from Rook? The supply route is open — wonderful news! Thank you for making the journey. Here, take this for your trouble. Tell Rook we're grateful.", timer: 7 };
              } else {
                svDialogChoicesRef.current = {
                  active: true,
                  options: [
                    { label: 'Tell me about this village', action: 'sv_elder_lore' },
                    { label: 'Any quests?', action: 'sv_elder_quest' },
                  ],
                };
                glDialogRef.current = { speaker: 'Elder Rowan', text: 'Ah, a visitor! Welcome to our little seaside village.', timer: 999 };
              }
              break;
            }
            if (npc.id === 'marina' && !svDialogChoicesRef.current.active) {
              const q = svQuestRef.current;
              if (q.stage === 'none') {
                q.stage = 'searching';
                glDialogRef.current = {
                  speaker: 'Marina',
                  text: "Oh please, can you help me? I lost my grandmother's necklace somewhere in the village. I think it might be near the waterfront rocks, the well, or behind the big house.",
                  timer: 7,
                };
              } else if (q.stage === 'found') {
                q.stage = 'returned';
                playerGoldRef.current += 30;
                setPlayerGold(playerGoldRef.current);
                glDialogRef.current = {
                  speaker: 'Marina',
                  text: "You found it! Thank you so much! Here, take this gold as a reward. +30 Gold",
                  timer: 5,
                };
                damageNumbersRef.current.push({
                  x: npc.x * TILE_SIZE + 16, y: npc.y * TILE_SIZE - 16,
                  text: '+30G', color: '#e8c86a', timer: 1.5,
                });
              } else if (q.stage === 'searching') {
                glDialogRef.current = {
                  speaker: 'Marina',
                  text: "Please keep looking! Check the waterfront rocks, near the well, and behind the big house.",
                  timer: 4,
                };
              } else {
                glDialogRef.current = {
                  speaker: 'Marina',
                  text: "Thank you again for finding the necklace! Grandmother will be so happy.",
                  timer: 4,
                };
              }
              break;
            }
            if (npc.id === 'grandma' && !svDialogChoicesRef.current.active) {
              svDialogChoicesRef.current = {
                active: true,
                options: [
                  { label: 'Tell me a story', action: 'sv_nana_story' },
                  { label: 'How are you?', action: 'sv_nana_tea' },
                ],
              };
              glDialogRef.current = {
                speaker: 'Nana Rose',
                text: svQuestRef.current.stage === 'returned' || svQuestRef.current.stage === 'complete'
                  ? "Oh, the hero who found Marina's necklace! Come, sit with me a moment."
                  : "Hello, dear. It's not often we get visitors. Come, sit with me.",
                timer: 30,
              };
              break;
            }
            if (npc.id === 'villager' && !svDialogChoicesRef.current.active) {
              svDialogChoicesRef.current = {
                active: true,
                options: [
                  { label: "What's around here?", action: 'sv_tom_area' },
                  { label: 'Seen anything unusual?', action: 'sv_tom_rumors' },
                ],
              };
              glDialogRef.current = {
                speaker: 'Tom',
                text: 'Hey there! Always nice to see a new face around the village.',
                timer: 30,
              };
              break;
            }
          }

          // Witch NPC interaction (standalone, not in NPC array)
          const witchDist = Math.sqrt((px - SV_WITCH_POS.x) ** 2 + (py - SV_WITCH_POS.y) ** 2);
          if (witchDist < SV_WITCH_RANGE && !svDialogChoicesRef.current.active && !svWitchShopOpen) {
            svDialogChoicesRef.current = {
              active: true,
              options: [
                { label: 'Tell my fortune', action: 'sv_witch_fortune' },
                { label: 'Buy potions', action: 'sv_witch_shop' },
                { label: 'Who are you?', action: 'sv_witch_lore' },
              ],
            };
            glDialogRef.current = {
              speaker: 'Willow — Fortune Teller',
              text: "Step closer, traveler... The stars have whispered your name to me.",
              timer: 30,
            };
          }

          // Search spots for necklace quest
          if (svQuestRef.current.stage === 'searching') {
            for (let si = 0; si < SV_SEARCH_SPOTS.length; si++) {
              const spot = SV_SEARCH_SPOTS[si];
              const sd = Math.sqrt((px - spot.x) ** 2 + (py - spot.y) ** 2);
              if (sd < 2.0 && !svQuestRef.current.searched[si]) {
                svQuestRef.current.searched[si] = true;
                if (si === SV_NECKLACE_SPOT) {
                  svQuestRef.current.stage = 'found';
                  glDialogRef.current = {
                    speaker: 'Search',
                    text: "Found Marina's Necklace! A delicate silver chain with a blue gem. Return it to Marina.",
                    timer: 4,
                  };
                  zoneBannerRef.current = "Found Marina's Necklace!";
                  zoneBannerTimer.current = 3;
                } else {
                  glDialogRef.current = {
                    speaker: 'Search',
                    text: `Searched ${spot.label}... nothing here.`,
                    timer: 3,
                  };
                }
                break;
              }
            }
          }

          // Reward chest at waterfront (unlocked after quest returned)
          const svChestDist = Math.sqrt((px - 35) ** 2 + (py - 17) ** 2);
          if (svChestDist < 2.0 && (svQuestRef.current.stage === 'returned' || svQuestRef.current.stage === 'complete') && !svChestOpenedRef.current) {
            svChestOpenedRef.current = true;
            svQuestRef.current.stage = 'complete';
            playerGoldRef.current += 25;
            setPlayerGold(playerGoldRef.current);
            glDialogRef.current = {
              speaker: 'Treasure Chest',
              text: 'You found a hidden chest! +25 Gold',
              timer: 4,
            };
            damageNumbersRef.current.push({
              x: 35 * TILE_SIZE + 16, y: 17 * TILE_SIZE - 16,
              text: '+25G', color: '#e8c86a', timer: 1.5,
            });
          }
        }

        // ── Foraging spots (all zones) ──
        if (!glDialogRef.current) {
          const px = playerRef.current.x, py = playerRef.current.y;
          const zone = zoneRef.current;
          for (const spot of FORAGE_SPOTS) {
            if (spot.zone !== zone) continue;
            const dist = Math.sqrt((px - spot.x) ** 2 + (py - spot.y) ** 2);
            if (dist > 2.5) continue;
            const cd = forageCooldownRef.current.get(spot.id) || 0;
            if (cd > 0) {
              glDialogRef.current = { speaker: 'Forage', text: `Nothing left here yet. (${Math.ceil(cd)}s)`, timer: 2 };
              break;
            }
            forageCooldownRef.current.set(spot.id, 45);
            if (spot.resource === 'wood') {
              playerWoodRef.current = Math.min(playerWoodRef.current + spot.amount, resourceCapRef.current.wood);
              setPlayerWood(playerWoodRef.current);
              damageNumbersRef.current.push({ x: spot.x * TILE_SIZE + 16, y: spot.y * TILE_SIZE - 16, text: `+${spot.amount} Wood`, color: '#8b6c3e', timer: 1.5 });
            } else {
              playerStoneRef.current = Math.min(playerStoneRef.current + spot.amount, resourceCapRef.current.stone);
              setPlayerStone(playerStoneRef.current);
              damageNumbersRef.current.push({ x: spot.x * TILE_SIZE + 16, y: spot.y * TILE_SIZE - 16, text: `+${spot.amount} Stone`, color: '#808078', timer: 1.5 });
            }
            glDialogRef.current = { speaker: 'Forage', text: spot.label, timer: 3 };
            break;
          }
        }

        // ── Interact with placed buildings (all zones) ──
        if (!glDialogRef.current) {
          const px = playerRef.current.x, py = playerRef.current.y;
          const zone = zoneRef.current;
          for (const obj of placedObjectsRef.current) {
            if (obj.zone !== zone || obj.itemType === '_fill') continue;
            const bItem = BUILD_ITEMS.find(b => b.id === obj.itemType);
            if (!bItem) continue;
            const dist = Math.sqrt((px - obj.tileX - 0.5) ** 2 + (py - obj.tileY - 0.5) ** 2);
            if (dist > 2.0) continue;
            const cdKey = obj.id;

            // Income building collection
            if (bItem.income) {
              const acc = buildingIncomeRef.current.get(obj.id);
              if (acc && (Math.floor(acc.gold) > 0 || Math.floor(acc.wood) > 0 || Math.floor(acc.stone) > 0)) {
                const cg = Math.floor(acc.gold), cw = Math.floor(acc.wood), cs = Math.floor(acc.stone);
                playerGoldRef.current = Math.min(playerGoldRef.current + cg, resourceCapRef.current.gold);
                playerWoodRef.current = Math.min(playerWoodRef.current + cw, resourceCapRef.current.wood);
                playerStoneRef.current = Math.min(playerStoneRef.current + cs, resourceCapRef.current.stone);
                setPlayerGold(playerGoldRef.current);
                setPlayerWood(playerWoodRef.current);
                setPlayerStone(playerStoneRef.current);
                buildingIncomeRef.current.set(obj.id, { gold: acc.gold - cg, wood: acc.wood - cw, stone: acc.stone - cs });
                const parts: string[] = [];
                if (cg > 0) parts.push(`+${cg}G`);
                if (cw > 0) parts.push(`+${cw}W`);
                if (cs > 0) parts.push(`+${cs}S`);
                damageNumbersRef.current.push({ x: obj.tileX * TILE_SIZE + 16, y: obj.tileY * TILE_SIZE - 16, text: parts.join(' '), color: '#e8c86a', timer: 2 });
                glDialogRef.current = { speaker: bItem.name, text: `Collected: ${parts.join(', ')}`, timer: 3 };
                // Persist collection time
                if (!obj.id.startsWith('temp_')) {
                  fetch(`/api/worlds/${slug}/placed-objects`, {
                    method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: obj.id }),
                  }).catch(() => {});
                }
                break;
              }
            }

            // Training Dummy buff
            if (bItem.effect === 'training_buff') {
              const cd = buildingEffectCooldownRef.current.get(cdKey) || 0;
              if (cd > 0) { glDialogRef.current = { speaker: 'Training Dummy', text: `Already practiced recently. (${Math.ceil(cd)}s)`, timer: 2 }; break; }
              buildingEffectCooldownRef.current.set(cdKey, 60);
              const existing = buffsRef.current.findIndex(b => b.effect === 'strength');
              if (existing >= 0) { buffsRef.current[existing].remaining += 30; }
              else { buffsRef.current.push({ effect: 'strength', label: 'Training', remaining: 30, color: '#e08040' }); }
              glDialogRef.current = { speaker: 'Training Dummy', text: 'You practice your strikes. +20% damage for 30s.', timer: 4 };
              damageNumbersRef.current.push({ x: obj.tileX * TILE_SIZE + 16, y: obj.tileY * TILE_SIZE - 16, text: '+STR', color: '#e08040', timer: 1.5 });
              break;
            }

            // Well heal
            if (bItem.effect === 'well_heal') {
              const cd = buildingEffectCooldownRef.current.get(cdKey) || 0;
              if (cd > 0) { glDialogRef.current = { speaker: 'Well', text: `The well needs time to refill. (${Math.ceil(cd)}s)`, timer: 2 }; break; }
              buildingEffectCooldownRef.current.set(cdKey, 30);
              healthRef.current = Math.min(MAX_HEALTH, healthRef.current + 15);
              glDialogRef.current = { speaker: 'Water Well', text: 'You drink fresh water from the well. +15 HP', timer: 3 };
              damageNumbersRef.current.push({ x: obj.tileX * TILE_SIZE + 16, y: obj.tileY * TILE_SIZE - 16, text: '+15 HP', color: '#60c060', timer: 1.5 });
              break;
            }

            // Forge buff
            if (bItem.effect === 'forge_buff') {
              const cd = buildingEffectCooldownRef.current.get(cdKey) || 0;
              if (cd > 0) { glDialogRef.current = { speaker: 'Forge', text: `The forge is cooling down. (${Math.ceil(cd)}s)`, timer: 2 }; break; }
              buildingEffectCooldownRef.current.set(cdKey, 90);
              const existing = buffsRef.current.findIndex(b => b.effect === 'strength');
              if (existing >= 0) { buffsRef.current[existing].remaining = 45; }
              else { buffsRef.current.push({ effect: 'strength', label: 'Forged', remaining: 45, color: '#c06030' }); }
              glDialogRef.current = { speaker: 'Forge', text: 'You temper your blade in the forge. +25% damage for 45s.', timer: 4 };
              damageNumbersRef.current.push({ x: obj.tileX * TILE_SIZE + 16, y: obj.tileY * TILE_SIZE - 16, text: '+25% DMG', color: '#c06030', timer: 1.5 });
              break;
            }

            // Altar cleanse
            if (bItem.effect === 'altar_cleanse') {
              const cd = buildingEffectCooldownRef.current.get(cdKey) || 0;
              if (cd > 0) { glDialogRef.current = { speaker: 'Altar', text: `The altar is recharging. (${Math.ceil(cd)}s)`, timer: 2 }; break; }
              buildingEffectCooldownRef.current.set(cdKey, 120);
              healthRef.current = Math.min(MAX_HEALTH, healthRef.current + 10);
              glDialogRef.current = { speaker: 'Stone Altar', text: 'The altar glows. You feel restored. +10 HP', timer: 4 };
              damageNumbersRef.current.push({ x: obj.tileX * TILE_SIZE + 16, y: obj.tileY * TILE_SIZE - 16, text: '+10 HP', color: '#a0a0ff', timer: 1.5 });
              break;
            }
          }
        }
      }

      // ── Village dialogue choice selection (1/2 keys) ──
      if ((k === '1' || k === '2') && svDialogChoicesRef.current.active) {
        const idx = parseInt(k) - 1;
        const opt = svDialogChoicesRef.current.options[idx];
        if (opt) {
          svDialogChoicesRef.current = { options: [], active: false };
          switch (opt.action) {
            case 'sv_food_shop':
              glDialogRef.current = null;
              setSvFoodShopOpen(true);
              break;
            case 'sv_food_chat':
              glDialogRef.current = {
                speaker: 'Fiona',
                text: "The fish was caught this morning! And the berry pies are my grandmother's recipe. You won't find better anywhere.",
                timer: 5,
              };
              break;
            case 'sv_gen_shop':
              glDialogRef.current = null;
              setSvGenShopOpen(true);
              break;
            case 'sv_gen_chat':
              glDialogRef.current = {
                speaker: 'Gerald',
                text: "Always carry a Lucky Charm when you're out adventuring. You never know what treasures you might stumble upon!",
                timer: 5,
              };
              break;
            case 'sv_elder_lore': {
              const elderBldg = buildingCountRef.current;
              const elderText = elderBldg >= 10
                ? "Word of your growing settlement has reached even us! A town that size... you must be quite the builder. This village has stood for generations, but yours may surpass it."
                : elderBldg >= 3
                ? "I hear you've been building a settlement to the west. Good — the land needs strong settlers. This village has stood for generations. The dock was built by my grandfather."
                : "This village has stood here for generations. The sea provides, the land nurtures. We're simple folk, but we live well. The dock was built by my grandfather.";
              glDialogRef.current = { speaker: 'Elder Rowan', text: elderText, timer: 7 };
              break;
            }
            case 'sv_elder_quest': {
              const allBanditsDead = svBanditsRef.current.every(b => b.state === 'dead');
              const questStage = svQuestRef.current.stage;
              if (allBanditsDead && (questStage === 'returned' || questStage === 'complete')) {
                glDialogRef.current = { speaker: 'Elder Rowan', text: "You've cleared the bandits AND helped Marina. You are a true friend of this village. When you return to your settlement, know that we stand with you.", timer: 7 };
              } else if (allBanditsDead) {
                glDialogRef.current = { speaker: 'Elder Rowan', text: "The bandits are gone \u2014 I can hardly believe it. Marina could still use help, though. She lost something dear to her.", timer: 6 };
              } else {
                glDialogRef.current = { speaker: 'Elder Rowan', text: "Hmm, young Marina's been looking upset lately. Something about a lost necklace. Perhaps you could help her? She's usually near the village square.", timer: 6 };
              }
              break;
            }
            // Tom actions
            case 'sv_tom_area': {
              const qs = svQuestRef.current.stage;
              const tomText = qs === 'searching'
                ? "Marina's been looking everywhere for that necklace. Have you checked the waterfront? And the well area?"
                : qs === 'returned' || qs === 'complete'
                ? "You're the one who found Marina's necklace! Everyone's talking about it. The village owes you one."
                : "The market square has the best food — Fiona's berry pies are incredible. And if you want adventure gear, Gerald's your man. Talk to Elder Rowan too, he always knows what's going on.";
              glDialogRef.current = { speaker: 'Tom', text: tomText, timer: 6 };
              break;
            }
            case 'sv_tom_rumors': {
              const allBanditsDead = svBanditsRef.current.every(b => b.state === 'dead');
              if (allBanditsDead) {
                glDialogRef.current = { speaker: 'Tom', text: "You cleared the bandits! The whole village is talking about it. Fiona baked a pie in your honor. The roads feel safe again.", timer: 6 };
              } else {
                const rumors = [
                  "I heard placing lumber yards near forests makes them 25% more productive. Same for quarries near rocky terrain.",
                  "A throne boosts all your income buildings by 15%. If you can afford one, it pays for itself quickly.",
                  "Some say building houses attracts townsfolk. More people means more passive gold from the local economy.",
                  "The shrine in the grassland stronghold grants a powerful combat buff \u2014 but only after you clear the orcs guarding it.",
                  "Watch your step in the eastern woods. Bandits have been spotted. They're dangerous but they carry coin.",
                ];
                const rumorIdx = Math.floor(Math.random() * rumors.length);
                glDialogRef.current = { speaker: 'Tom', text: rumors[rumorIdx], timer: 7 };
              }
              break;
            }
            // Nana Rose actions
            case 'sv_nana_story':
              glDialogRef.current = {
                speaker: 'Nana Rose',
                text: "When I was young, the waterfall near here was said to be magical. Fishermen who drank from it never came home empty-handed. My late husband caught the biggest fish this village ever saw.",
                timer: 7,
              };
              break;
            case 'sv_nana_tea': {
              const questDone = svQuestRef.current.stage === 'returned' || svQuestRef.current.stage === 'complete';
              const healAmt = questDone ? 25 : 15;
              healthRef.current = Math.min(MAX_HEALTH, healthRef.current + healAmt);
              const nanaPop = populationRef.current;
              let nanaText: string;
              if (questDone && nanaPop >= 5) {
                nanaText = `Marina showed me the necklace — you've done our family a great kindness. I hear ${nanaPop} people live in your town now! Here, have some special tea. (+${healAmt} HP)`;
              } else if (questDone) {
                nanaText = `Marina showed me the necklace — you've done our family a great kindness. Here, have some of my special tea. (+${healAmt} HP)`;
              } else {
                nanaText = `I'm well, dear. The sea breeze keeps these old bones going. Here, have some tea — you look like you could use it. (+${healAmt} HP)`;
              }
              glDialogRef.current = { speaker: 'Nana Rose', text: nanaText, timer: 7 };
              damageNumbersRef.current.push({
                x: playerRef.current.x * TILE_SIZE + 16,
                y: playerRef.current.y * TILE_SIZE - 16,
                text: `+${healAmt} HP`, color: '#60c060', timer: 1.5,
              });
              break;
            }
            // Witch actions
            case 'sv_witch_fortune': {
              const fortune = SV_WITCH_FORTUNES[Math.floor(Math.random() * SV_WITCH_FORTUNES.length)];
              svWitchFortuneRef.current = fortune;
              glDialogRef.current = { speaker: 'Willow', text: fortune, timer: 6 };
              break;
            }
            case 'sv_witch_shop':
              glDialogRef.current = null;
              setSvWitchShopOpen(true);
              break;
            case 'sv_witch_lore':
              glDialogRef.current = {
                speaker: 'Willow',
                text: "I am Willow, seer of the unseen. I arrived here long ago, guided by the stars. The villagers tolerate me — my potions keep them healthy, and my warnings have saved them more than once. The grasslands to the north hold ancient power. Be careful there.",
                timer: 8,
              };
              break;
          }
        }
      }

      // ? key opens help panel (replaces tutorial for returning players)
      if (k === '?' || k === '/') {
        const firstTime = typeof window !== 'undefined' && !localStorage.getItem('wf_tutorial_done');
        if (firstTime) { setTutorialStep(1); } else { setHelpOpen(h => !h); setUnifiedShopOpen(false); setBuildMenuOpen(false); }
        return;
      }

      // M key toggles minimap
      if (k === 'm') { minimapOpenRef.current = !minimapOpenRef.current; return; }

      // P key toggles unified shop
      if (k === 'p' && !placementModeRef.current) {
        setUnifiedShopOpen(s => { if (!s) { setBuildMenuOpen(false); setHelpOpen(false); } return !s; });
        return;
      }

      if (k === 'escape') {
        if (helpOpenRef.current) { setHelpOpen(false); return; }
        if (unifiedShopOpenRef.current) { setUnifiedShopOpen(false); return; }
        if (tutorialStep > 0) { setTutorialStep(0); return; }
        if (buildMenuOpen) setBuildMenuOpen(false);
        else if (svWitchShopOpen) setSvWitchShopOpen(false);
        else if (svFoodShopOpen) setSvFoodShopOpen(false);
        else if (svGenShopOpen) setSvGenShopOpen(false);
        else if (glShopOpen) setGlShopOpen(false);
        else if (tradeOpen) setTradeOpen(false);
        else if (shopOpen) setShopOpen(false);
        else if (inspecting) setInspecting(null);
        else if (dialogChoicesRef.current.active) {
          dialogChoicesRef.current = { options: [], active: false };
          glDialogRef.current = null;
        } else if (svDialogChoicesRef.current.active) {
          svDialogChoicesRef.current = { options: [], active: false };
          glDialogRef.current = null;
        }
      }
    };
    const up = (e: KeyboardEvent) => keysRef.current.delete(e.key.toLowerCase());
    // Clear all keys when window loses focus (prevents stuck keys on tab switch)
    const onBlur = () => keysRef.current.clear();
    // Reset frame timer when tab becomes visible again (prevents dt spike)
    const onVisChange = () => {
      if (!document.hidden) lastFrameRef.current = performance.now();
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', onBlur);
    document.addEventListener('visibilitychange', onVisChange);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); window.removeEventListener('blur', onBlur); document.removeEventListener('visibilitychange', onVisChange); };
  }, [nearbyEntity, nearMerchant, inspecting, shopOpen, glShopOpen, svFoodShopOpen, svGenShopOpen, svWitchShopOpen, buildMenuOpen, placementMode, isOwner, confirmPlacement, tutorialStep, tradeOpen, unifiedShopOpen, helpOpen]);

  // Game loop
  useEffect(() => {
    if (!ready || !canvasRef.current || !mapRef.current || !ga || !terrainRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    let animId: number;
    lastFrameRef.current = performance.now();

    const loop = (ts: number) => {
      const dt = Math.min((ts - lastFrameRef.current) / 1000, 0.1);
      lastFrameRef.current = ts;
      timeRef.current += dt;

      const p = playerRef.current;
      const keys = keysRef.current;
      const { w, h } = canvasSizeRef.current;

      // ── Zone transition fade ──
      if (fadeDirRef.current === 'in') {
        fadeRef.current = Math.min(1, fadeRef.current + dt * FADE_SPEED);
        if (fadeRef.current >= 1) {
          // Clear dialogue state before zone swap
          glDialogRef.current = null;
          dialogChoicesRef.current = { options: [], active: false };
          svDialogChoicesRef.current = { options: [], active: false };

          const target = pendingZoneRef.current;
          if (target === 'grassland' && ga) {
            hubMapCache.current = mapRef.current;
            hubTerrainCache.current = terrainRef.current;
            hubDecoCache.current = decoRef.current;
            hubPlayerSave.current = { x: p.x, y: p.y, facing: p.facing };
            if (!glMapRef.current) glMapRef.current = buildGrasslandMap();
            if (!glTerrainRef.current) glTerrainRef.current = prerenderGrasslandTerrain(glMapRef.current);
            if (!glDecoRef.current) glDecoRef.current = prerenderGrasslandDeco(glMapRef.current, ga);
            mapRef.current = glMapRef.current;
            terrainRef.current = glTerrainRef.current;
            decoRef.current = glDecoRef.current;
            zoneWRef.current = GL_W;
            zoneHRef.current = GL_H;
            p.x = 40; p.y = GL_H - 3; p.facing = 'up'; p.moving = false;
            zoneRef.current = 'grassland';
            zoneBannerRef.current = 'Northern Grasslands';
            zoneBannerTimer.current = 3;
          } else if (target === 'village' && ga) {
            // Save hub state if coming from hub
            if (zoneRef.current === 'hub') {
              hubMapCache.current = mapRef.current;
              hubTerrainCache.current = terrainRef.current;
              hubDecoCache.current = decoRef.current;
              hubPlayerSave.current = { x: p.x, y: p.y, facing: p.facing };
            }
            if (!svMapRef.current) svMapRef.current = buildVillageMap();
            if (!svTerrainRef.current) svTerrainRef.current = prerenderVillageTerrain(svMapRef.current);
            if (!svDecoRef.current) svDecoRef.current = prerenderVillageDeco(svMapRef.current, ga);
            mapRef.current = svMapRef.current;
            terrainRef.current = svTerrainRef.current;
            decoRef.current = svDecoRef.current;
            zoneWRef.current = SV_W;
            zoneHRef.current = SV_H;
            p.x = 1; p.y = 12; p.facing = 'right'; p.moving = false;
            zoneRef.current = 'village';
            zoneBannerRef.current = 'Seaside Village';
            zoneBannerTimer.current = 3;
          } else if (target === 'hub') {
            const prevZone = zoneRef.current;
            mapRef.current = hubMapCache.current;
            terrainRef.current = hubTerrainCache.current;
            decoRef.current = hubDecoCache.current;
            zoneWRef.current = W;
            zoneHRef.current = H;
            const saved = hubPlayerSave.current;
            if (prevZone === 'village') {
              // Return north of Docks south gate
              p.x = 96; p.y = 44; p.facing = 'up';
            } else if (saved) {
              p.x = saved.x; p.y = saved.y; p.facing = 'down';
            } else {
              p.x = 56; p.y = 20; p.facing = 'down';
            }
            p.moving = false;
            zoneRef.current = 'hub';
            if (prevZone === 'grassland' && glRewardGivenRef.current && !glCompletionGold.current) {
              // First return after completing grassland — big payoff
              glCompletionGold.current = true;
              playerGoldRef.current = Math.min(playerGoldRef.current + 50, resourceCapRef.current.gold);
              playerWoodRef.current = Math.min(playerWoodRef.current + 15, resourceCapRef.current.wood);
              playerStoneRef.current = Math.min(playerStoneRef.current + 10, resourceCapRef.current.stone);
              setPlayerGold(playerGoldRef.current);
              setPlayerWood(playerWoodRef.current);
              setPlayerStone(playerStoneRef.current);
              zoneBannerRef.current = 'Grassland Conquest Complete! +50G +15W +10S';
              zoneBannerTimer.current = 5;
              damageNumbersRef.current.push({ x: p.x * TILE_SIZE + 16, y: p.y * TILE_SIZE - 24, text: '+50G +15W +10S', color: '#e8c86a', timer: 2 });
            } else if (prevZone === 'village' && svQuestRef.current.stage === 'complete' && !svCompletionGold.current) {
              svCompletionGold.current = true;
              playerGoldRef.current = Math.min(playerGoldRef.current + 25, resourceCapRef.current.gold);
              playerWoodRef.current = Math.min(playerWoodRef.current + 10, resourceCapRef.current.wood);
              playerStoneRef.current = Math.min(playerStoneRef.current + 8, resourceCapRef.current.stone);
              setPlayerGold(playerGoldRef.current);
              setPlayerWood(playerWoodRef.current);
              setPlayerStone(playerStoneRef.current);
              zoneBannerRef.current = 'Village Quest Complete! +25G +10W +8S';
              zoneBannerTimer.current = 5;
              damageNumbersRef.current.push({ x: p.x * TILE_SIZE + 16, y: p.y * TILE_SIZE - 24, text: '+25G +10W +8S', color: '#e8c86a', timer: 2 });
            } else {
              zoneBannerRef.current = 'Returning to Town';
              zoneBannerTimer.current = 2;
            }
          }
          pendingZoneRef.current = null;
          fadeDirRef.current = 'out';
        }
      } else if (fadeDirRef.current === 'out') {
        fadeRef.current = Math.max(0, fadeRef.current - dt * FADE_SPEED);
        if (fadeRef.current <= 0) fadeDirRef.current = null;
      }

      if (zoneBannerTimer.current > 0) {
        zoneBannerTimer.current -= dt;
        if (zoneBannerTimer.current <= 0) zoneBannerRef.current = null;
      }

      const isFading = fadeDirRef.current !== null;
      const map = mapRef.current!;
      const curW = zoneWRef.current;
      const curH = zoneHRef.current;
      const inHub = zoneRef.current === 'hub';
      const inVillage = zoneRef.current === 'village';

      // Tick buff timers
      const curBuffs = buffsRef.current;
      if (curBuffs.length > 0) {
        const updated = curBuffs
          .map(b => ({ ...b, remaining: b.remaining - dt }))
          .filter(b => b.remaining > 0);
        if (updated.length !== curBuffs.length || curBuffs.some((b, i) => Math.floor(b.remaining) !== Math.floor(updated[i]?.remaining ?? -1))) {
          setActiveBuffs(updated);
        }
      }

      // ── Economy per-frame: income accumulation, cooldowns, tier, campfire heal ──
      // Tick forage cooldowns
      for (const [spotId, cd] of forageCooldownRef.current) {
        const next = cd - dt;
        if (next <= 0) forageCooldownRef.current.delete(spotId);
        else forageCooldownRef.current.set(spotId, next);
      }
      // Tick building effect cooldowns
      for (const [objId, cd] of buildingEffectCooldownRef.current) {
        const next = cd - dt;
        if (next <= 0) buildingEffectCooldownRef.current.delete(objId);
        else buildingEffectCooldownRef.current.set(objId, next);
      }
      // Update player tier (6-tier progression)
      const orcsK = orcsKilledRef.current;
      const hasGL = glRewardGivenRef.current || orcsK >= 7;
      const glChestDone = !!glCompletionGold.current;
      const svQuestDone = svQuestRef.current.stage === 'returned' || svQuestRef.current.stage === 'complete';
      const svChestDone = !!svCompletionGold.current;
      let calcTier = 1;
      if (orcsK >= 3) calcTier = 2;
      if (hasGL) calcTier = 3;
      if (glChestDone) calcTier = 4;
      if (glChestDone && svQuestDone) calcTier = 5;
      if (glChestDone && svChestDone) calcTier = 6;
      playerTierRef.current = calcTier;
      // Update resource caps (storage chests + warehouses + granaries)
      const chestCount = placedObjectsRef.current.filter(o => o.itemType === 'storage_chest').length;
      const warehouseCount = placedObjectsRef.current.filter(o => o.itemType === 'warehouse').length;
      const granaryCount = placedObjectsRef.current.filter(o => o.itemType === 'granary').length;
      const capBonus = chestCount * 50 + warehouseCount * 100 + granaryCount * 150;
      resourceCapRef.current = { gold: 200 + capBonus, wood: 100 + capBonus, stone: 100 + capBonus };
      // Population calculation
      let totalPop = 0;
      for (const obj of placedObjectsRef.current) {
        const bi = BUILD_ITEMS.find(b => b.id === obj.itemType);
        if (bi?.population) totalPop += bi.population;
      }
      populationRef.current = totalPop;
      // Population bonuses: +1G/min per 3 pop, +5% income per 5 pop
      const popIncomeBonus = Math.floor(totalPop / 3); // passive gold/min from townsfolk
      const popIncomeMultiplier = 1 + Math.floor(totalPop / 5) * 0.05; // workforce bonus
      // Building count & milestones
      const bCount = placedObjectsRef.current.filter(o => o.itemType !== '_fill').length;
      buildingCountRef.current = bCount;
      const milestones = [5, 10, 20, 30];
      const milestoneLabels: Record<number, string> = { 5: 'Settlement Founded', 10: 'Growing Town', 20: 'Thriving Settlement', 30: "Master Builder's Domain" };
      const milestoneRewards: Record<number, { gold: number; wood: number; stone: number }> = {
        5: { gold: 10, wood: 5, stone: 5 },
        10: { gold: 25, wood: 10, stone: 10 },
        20: { gold: 50, wood: 20, stone: 15 },
        30: { gold: 100, wood: 30, stone: 25 },
      };
      for (const ms of milestones) {
        if (bCount >= ms && !buildingMilestonesRef.current.has(ms)) {
          buildingMilestonesRef.current.add(ms);
          const reward = milestoneRewards[ms];
          zoneBannerRef.current = `${milestoneLabels[ms]} — +${reward.gold}G +${reward.wood}W +${reward.stone}S`;
          zoneBannerTimer.current = 4;
          playerGoldRef.current = Math.min(playerGoldRef.current + reward.gold, resourceCapRef.current.gold);
          playerWoodRef.current = Math.min(playerWoodRef.current + reward.wood, resourceCapRef.current.wood);
          playerStoneRef.current = Math.min(playerStoneRef.current + reward.stone, resourceCapRef.current.stone);
          setPlayerGold(playerGoldRef.current);
          setPlayerWood(playerWoodRef.current);
          setPlayerStone(playerStoneRef.current);
          const px = playerRef.current.x * TILE_SIZE + 16;
          const py = playerRef.current.y * TILE_SIZE - 16;
          damageNumbersRef.current.push({ x: px - 30, y: py, text: `+${reward.gold}G`, color: '#e8c86a', timer: 2.5 });
          damageNumbersRef.current.push({ x: px, y: py - 14, text: `+${reward.wood}W`, color: '#8bc34a', timer: 2.5 });
          damageNumbersRef.current.push({ x: px + 30, y: py, text: `+${reward.stone}S`, color: '#9e9e9e', timer: 2.5 });
        }
      }
      // Townsfolk AI (hub — always-present GuttyKreum NPCs at fixed locations)
      const GK_FOLK_KEYS = ['FemaleBaker', 'MaleCasual', 'FemaleYouth', 'MaleTraditional', 'FemaleCafeMaid'];
      if (inHub) {
        // Spawn permanent townsfolk at fixed hub locations on first frame
        if (townsfolkRef.current.length === 0) {
          const fixedSpawns: { id: string; name: string; x: number; y: number; charKey: string; facing: 'down'|'left'|'right'|'up' }[] = [
            { id: 'hub_marta',  name: 'Marta',   x: 55, y: 38, charKey: 'FemaleBaker',    facing: 'down' },     // Baker near town center
            { id: 'hub_finn',   name: 'Finn',     x: 85, y: 44, charKey: 'MaleCasual',     facing: 'left' },     // Dockhand near docks
            { id: 'hub_lina',   name: 'Lina',     x: 30, y: 55, charKey: 'FemaleYouth',    facing: 'right' },    // Shepherd girl near sheep
            { id: 'hub_oswald', name: 'Oswald',   x: 48, y: 70, charKey: 'MaleTraditional', facing: 'up' },      // Ruins scholar
            { id: 'hub_ada',    name: 'Ada',      x: 65, y: 28, charKey: 'FemaleCafeMaid',  facing: 'down' },    // Innkeeper north
            { id: 'hub_rook',   name: 'Rook',     x: 72, y: 60, charKey: 'MaleStudent',     facing: 'left' },    // Courier / runner
            { id: 'hub_edith',  name: 'Edith',    x: 40, y: 35, charKey: 'FemaleElder',     facing: 'right' },   // Village elder
            { id: 'hub_dale',   name: 'Dale',     x: 100, y: 50, charKey: 'MalePunk',       facing: 'left' },    // Docks lookout
          ];
          for (const s of fixedSpawns) {
            townsfolkRef.current.push({
              id: s.id, name: s.name,
              x: s.x, y: s.y, tx: s.x, ty: s.y,
              charKey: s.charKey, facing: s.facing,
              idleTimer: 2 + Math.random() * 3, animFrame: 0, zone: 'hub',
            });
          }
        }
        // Update each townsfolk — wander near their area
        for (const folk of townsfolkRef.current) {
          if (folk.idleTimer > 0) {
            folk.idleTimer -= dt;
            if (folk.idleTimer <= 0) {
              folk.tx = folk.x + (Math.random() * 6 - 3);
              folk.ty = folk.y + (Math.random() * 4 - 2);
            }
          } else {
            const fdx = folk.tx - folk.x;
            const fdy = folk.ty - folk.y;
            const fdist = Math.sqrt(fdx * fdx + fdy * fdy);
            if (fdist < 0.2) {
              folk.x = folk.tx; folk.y = folk.ty;
              folk.idleTimer = 2 + Math.random() * 4;
            } else {
              const spd = 1.5 * dt;
              folk.x += (fdx / fdist) * spd;
              folk.y += (fdy / fdist) * spd;
              if (Math.abs(fdx) > Math.abs(fdy)) folk.facing = fdx > 0 ? 'right' : 'left';
              else folk.facing = fdy > 0 ? 'down' : 'up';
              folk.animFrame += dt * 6;
            }
          }
        }
      } else if (!inHub) {
        townsfolkRef.current = [];
      }

      // ── Quest: Lina's lost sheep (hub only) ──
      if (inHub && questFlagsRef.current.has('lina_sheep_quest') && !questFlagsRef.current.has('lina_sheep_found')) {
        const pqx = playerRef.current.x, pqy = playerRef.current.y;
        // Lost sheep is near the eastern docks
        const sheepDist = Math.sqrt((pqx - 92) ** 2 + (pqy - 52) ** 2);
        if (sheepDist < 2.5) {
          questFlagsRef.current.add('lina_sheep_found');
          zoneBannerRef.current = 'Found the lost sheep! Return to Lina.';
          zoneBannerTimer.current = 3;
        }
      }

      // ── Ambient sheep AI (hub + grassland) ──
      if (!sheepSpawned.current && (inHub || zoneRef.current === 'grassland')) {
        sheepSpawned.current = true;
        // Hub sheep — spread across grassy areas
        ambientSheepRef.current = [
          { id: 'sh1', x: 25, y: 50, tx: 25, ty: 50, variant: 'white', facing: 'down', animFrame: 0, idleTimer: 3, zone: 'hub' },
          { id: 'sh2', x: 28, y: 53, tx: 28, ty: 53, variant: 'white', facing: 'right', animFrame: 0, idleTimer: 5, zone: 'hub' },
          { id: 'sh3', x: 75, y: 35, tx: 75, ty: 35, variant: 'white', facing: 'left', animFrame: 0, idleTimer: 4, zone: 'hub' },
          { id: 'sh4', x: 90, y: 55, tx: 90, ty: 55, variant: 'white', facing: 'down', animFrame: 0, idleTimer: 7, zone: 'hub' },
          // Grassland sheep — in safe meadow areas
          { id: 'sh5', x: 15, y: 20, tx: 15, ty: 20, variant: 'brown', facing: 'down', animFrame: 0, idleTimer: 4, zone: 'grassland' },
          { id: 'sh6', x: 60, y: 15, tx: 60, ty: 15, variant: 'brown', facing: 'left', animFrame: 0, idleTimer: 2, zone: 'grassland' },
          { id: 'sh7', x: 70, y: 50, tx: 70, ty: 50, variant: 'white', facing: 'right', animFrame: 0, idleTimer: 6, zone: 'grassland' },
        ];
      }
      // Update sheep in current zone
      for (const sheep of ambientSheepRef.current) {
        if (sheep.zone !== zoneRef.current) continue;
        if (sheep.idleTimer > 0) {
          sheep.idleTimer -= dt;
          if (sheep.idleTimer <= 0) {
            sheep.tx = sheep.x + (Math.random() * 6 - 3);
            sheep.ty = sheep.y + (Math.random() * 4 - 2);
          }
        } else {
          const sdx = sheep.tx - sheep.x;
          const sdy = sheep.ty - sheep.y;
          const sdist = Math.sqrt(sdx * sdx + sdy * sdy);
          if (sdist < 0.15) {
            sheep.x = sheep.tx; sheep.y = sheep.ty;
            sheep.idleTimer = 3 + Math.random() * 5;
          } else {
            const spd = 0.8 * dt;
            sheep.x += (sdx / sdist) * spd;
            sheep.y += (sdy / sdist) * spd;
            if (Math.abs(sdx) > Math.abs(sdy)) sheep.facing = sdx > 0 ? 'right' : 'left';
            else sheep.facing = sdy > 0 ? 'down' : 'up';
            sheep.animFrame += dt * 4;
          }
        }
      }

      // ── Warrior guards ──
      if (!guardsSpawned.current) {
        guardsSpawned.current = true;
        warriorGuardsRef.current = [
          { id: 'guard_l', name: 'Varn', x: 50, y: 4, facing: 'right', zone: 'grassland' },
          { id: 'guard_r', name: 'Drell', x: 52, y: 4, facing: 'left', zone: 'grassland' },
        ];
      }

      // ── Village ambient wanderers ──
      if (zoneRef.current === 'village' && !villageWandererSpawned.current) {
        villageWandererSpawned.current = true;
        villageWanderersRef.current = [
          { id: 'sv_ivy',  name: 'Ivy',   x: 12, y: 15, tx: 12, ty: 15, charKey: 'FemaleStudent', facing: 'down',  animFrame: 0, idleTimer: 3, zone: 'village', label: 'Ivy' },
          { id: 'sv_cole', name: 'Cole',  x: 25, y: 10, tx: 25, ty: 10, charKey: 'MaleYouth',     facing: 'left',  animFrame: 0, idleTimer: 5, zone: 'village', label: 'Cole' },
          { id: 'sv_haru', name: 'Haru',  x: 18, y: 20, tx: 18, ty: 20, charKey: 'ShibaInu',      facing: 'right', animFrame: 0, idleTimer: 2, zone: 'village', label: 'Haru' },
        ];
      }
      // Update village wanderers
      if (zoneRef.current === 'village') {
        for (const vw of villageWanderersRef.current) {
          if (vw.idleTimer > 0) {
            vw.idleTimer -= dt;
            if (vw.idleTimer <= 0) {
              vw.tx = vw.x + (Math.random() * 6 - 3);
              vw.ty = vw.y + (Math.random() * 4 - 2);
              // Clamp to village bounds
              vw.tx = Math.max(2, Math.min(37, vw.tx));
              vw.ty = Math.max(2, Math.min(27, vw.ty));
            }
          } else {
            const vdx = vw.tx - vw.x;
            const vdy = vw.ty - vw.y;
            const vdist = Math.sqrt(vdx * vdx + vdy * vdy);
            if (vdist < 0.15) {
              vw.x = vw.tx; vw.y = vw.ty;
              vw.idleTimer = 2 + Math.random() * 4;
            } else {
              const spd = 1.2 * dt;
              vw.x += (vdx / vdist) * spd;
              vw.y += (vdy / vdist) * spd;
              if (Math.abs(vdx) > Math.abs(vdy)) vw.facing = vdx > 0 ? 'right' : 'left';
              else vw.facing = vdy > 0 ? 'down' : 'up';
              vw.animFrame += dt * 6;
            }
          }
        }
      }

      // Income building accumulation
      const throneCount = placedObjectsRef.current.filter(o => o.itemType === 'throne' && o.zone === zoneRef.current).length;
      const townHallCount = placedObjectsRef.current.filter(o => o.itemType === 'town_hall' && o.zone === zoneRef.current).length;
      const merchantHallCount = placedObjectsRef.current.filter(o => o.itemType === 'merchant_hall' && o.zone === zoneRef.current).length;
      const manorCount = placedObjectsRef.current.filter(o => o.itemType === 'manor' && o.zone === zoneRef.current).length;
      const throneBoost = 1 + throneCount * 0.15;
      const townHallBoost = 1 + townHallCount * 0.10 + merchantHallCount * 0.25 + manorCount * 0.10;
      const curMap = zoneRef.current === 'hub' ? mapRef.current : zoneRef.current === 'grassland' ? glMapRef.current : svMapRef.current;
      for (const obj of placedObjectsRef.current) {
        const bItem = BUILD_ITEMS.find(b => b.id === obj.itemType);
        if (!bItem?.income) continue;
        const acc = buildingIncomeRef.current.get(obj.id) || { gold: 0, wood: 0, stone: 0 };
        // Synergy: proximity bonus
        let synergy = 1.0;
        if (curMap && obj.zone === zoneRef.current) {
          const neighbors = [[-1,0],[1,0],[0,-1],[0,1],[2,0],[0,2],[-2,0],[0,-2]];
          if (bItem.income.wood) {
            const nearForest = neighbors.some(([dx,dy]) => {
              const tx = obj.tileX + dx, ty = obj.tileY + dy;
              return ty >= 0 && ty < curMap.length && tx >= 0 && tx < (curMap[0]?.length || 0) &&
                (curMap[ty][tx] === T.FOREST || curMap[ty][tx] === T.DENSE_FOREST);
            });
            if (nearForest) synergy += 0.25;
          }
          if (bItem.income.stone) {
            const nearRock = neighbors.some(([dx,dy]) => {
              const tx = obj.tileX + dx, ty = obj.tileY + dy;
              return ty >= 0 && ty < curMap.length && tx >= 0 && tx < (curMap[0]?.length || 0) &&
                (curMap[ty][tx] === T.ROCK || curMap[ty][tx] === T.HILLS);
            });
            if (nearRock) synergy += 0.25;
          }
          if (bItem.income.gold) {
            const nearHouse = placedObjectsRef.current.some(other =>
              other.id !== obj.id && other.zone === obj.zone &&
              (other.itemType === 'inn' || other.itemType === 'cabin' || other.itemType === 'tent1') &&
              Math.abs(other.tileX - obj.tileX) <= 3 && Math.abs(other.tileY - obj.tileY) <= 3
            );
            if (nearHouse) synergy += 0.25;
          }
        }
        const boost = throneBoost * townHallBoost * popIncomeMultiplier * synergy;
        if (bItem.income.gold) acc.gold += (bItem.income.gold * boost * dt) / 60;
        if (bItem.income.wood) acc.wood += (bItem.income.wood * boost * dt) / 60;
        if (bItem.income.stone) acc.stone += (bItem.income.stone * boost * dt) / 60;
        buildingIncomeRef.current.set(obj.id, acc);
      }
      // Passive population gold income (+1G/min per 3 pop)
      if (popIncomeBonus > 0) {
        const popAcc = buildingIncomeRef.current.get('_pop') || { gold: 0, wood: 0, stone: 0 };
        popAcc.gold += (popIncomeBonus * dt) / 60;
        buildingIncomeRef.current.set('_pop', popAcc);
      }
      // Placed building auras & zone-wide effects
      let hasBarracksBuff = false;
      let hasTempleHeal = false;
      for (const obj of placedObjectsRef.current) {
        if (obj.zone !== zoneRef.current) continue;
        if (obj.itemType === 'campfire' || obj.itemType === 'inn_lodge') {
          const dist = Math.sqrt((p.x - obj.tileX - 0.5) ** 2 + (p.y - obj.tileY - 0.5) ** 2);
          if (dist < 2.5) healthRef.current = Math.min(MAX_HEALTH, healthRef.current + 2 * dt);
        }
        if (obj.itemType === 'healing_shrine') {
          const dist = Math.sqrt((p.x - obj.tileX - 0.5) ** 2 + (p.y - obj.tileY - 0.5) ** 2);
          if (dist < 2.5) healthRef.current = Math.min(MAX_HEALTH, healthRef.current + 3 * dt);
        }
        if (obj.itemType === 'barracks') hasBarracksBuff = true;
        if (obj.itemType === 'temple') hasTempleHeal = true;
      }
      // Temple zone-wide passive heal (+2 HP/s everywhere)
      if (hasTempleHeal && healthRef.current < MAX_HEALTH) {
        healthRef.current = Math.min(MAX_HEALTH, healthRef.current + 2 * dt);
      }

      // Check active effects
      const hasSpeed = curBuffs.some(b => b.effect === 'speed' && b.remaining > 0);
      const hasSight = curBuffs.some(b => b.effect === 'sight' && b.remaining > 0);
      const hasReveal = curBuffs.some(b => b.effect === 'reveal' && b.remaining > 0);
      const hasGoldFind = curBuffs.some(b => b.effect === 'gold_find' && b.remaining > 0);

      // Movement
      let speed = PLAYER_SPEED;
      if (hasSpeed) speed *= 1.4;
      if (staminaRef.current < 10) speed *= 0.6;
      let moving = false;
      if (!inspectingRef.current && !shopOpenRef.current && !tradeOpenRef.current && !glShopOpenRef.current && !svFoodShopOpenRef.current && !svGenShopOpenRef.current && !svWitchShopOpenRef.current && !isFading && !placementModeRef.current && !buildMenuOpenRef.current && tutorialStepRef.current === 0 && !unifiedShopOpenRef.current && !helpOpenRef.current && !chatVisibleRef.current && !charPickerOpenRef.current && !needsCharPickRef.current) {
        let dx = 0, dy = 0;
        if (keys.has('w') || keys.has('arrowup')) { dy = -1; p.facing = 'up'; }
        if (keys.has('s') || keys.has('arrowdown')) { dy = 1; p.facing = 'down'; }
        if (keys.has('a') || keys.has('arrowleft')) { dx = -1; p.facing = 'left'; }
        if (keys.has('d') || keys.has('arrowright')) { dx = 1; p.facing = 'right'; }

        if (dx || dy) {
          moving = true;
          const mag = Math.sqrt(dx * dx + dy * dy);
          dx /= mag; dy /= mag;
          const nx = p.x + dx * speed * dt;
          const ny = p.y + dy * speed * dt;
          const cx = Math.floor(nx), cy = Math.floor(ny);

          const zone = zoneRef.current;
          const blockedX = placedObjectsRef.current.some(o => o.zone === zone && o.itemType !== '_fill' && {
            check: (() => { const bi = BUILD_ITEMS.find(b => b.id === o.itemType); if (!bi) return false;
              const { tw: btw, th: bth } = getRotatedDims(bi, o.rotation);
              for (let bdy = 0; bdy < bth; bdy++) for (let bdx = 0; bdx < btw; bdx++)
                if (o.tileX + bdx === cx && o.tileY + bdy === Math.floor(p.y)) return true;
              return false; })()
          }.check);
          const blockedY = placedObjectsRef.current.some(o => o.zone === zone && o.itemType !== '_fill' && {
            check: (() => { const bi = BUILD_ITEMS.find(b => b.id === o.itemType); if (!bi) return false;
              const { tw: btw, th: bth } = getRotatedDims(bi, o.rotation);
              for (let bdy = 0; bdy < bth; bdy++) for (let bdx = 0; bdx < btw; bdx++)
                if (o.tileX + bdx === Math.floor(p.x) && o.tileY + bdy === cy) return true;
              return false; })()
          }.check);
          if (cx >= 0 && cx < curW && map[Math.floor(p.y)]?.[cx] !== undefined && WALKABLE.has(map[Math.floor(p.y)][cx]) && !blockedX) p.x = nx;
          if (cy >= 0 && cy < curH && map[cy]?.[Math.floor(p.x)] !== undefined && WALKABLE.has(map[cy][Math.floor(p.x)]) && !blockedY) p.y = ny;
          p.x = Math.max(0.5, Math.min(curW - 1.5, p.x));
          p.y = Math.max(0.5, Math.min(curH - 1.5, p.y));
        }
      }

      p.moving = moving;
      if (moving) {
        p.animTimer += dt;
        if (p.animTimer >= ANIM_FRAME_DURATION) { p.animFrame = (p.animFrame + 1) % PLAYER_WALK_FRAMES; p.animTimer = 0; }
      } else { p.animFrame = 0; p.animTimer = 0; }

      // ── Multiplayer: send position + interpolate remote players ──
      const facingToDir: Record<string, number> = { down: 0, left: 1, right: 2, up: 3 };
      mp.sendMove(p.x * TILE_SIZE, p.y * TILE_SIZE, facingToDir[p.facing] ?? 0, p.animFrame, zoneRef.current);
      mp.interpolatePlayers(dt);

      // Nearby entity (hub only)
      if (inHub) {
        let closest: WorldEntity | null = null;
        let closestD = INTERACT_RANGE + 1;
        for (const pe of placedRef.current) {
          const d = Math.sqrt((p.x - pe.tileX) ** 2 + (p.y - pe.tileY) ** 2);
          if (d < INTERACT_RANGE && d < closestD) { closest = pe.entity; closestD = d; }
        }
        setNearbyEntity(closest);
      } else {
        setNearbyEntity(null);
      }

      // Merchant / Vendor proximity — suppress hint when dialogue choices are active
      const merchantDist = inHub ? Math.sqrt((p.x - MERCHANT_POS.x) ** 2 + (p.y - MERCHANT_POS.y) ** 2) : Infinity;
      const vendorDist = !inHub ? Math.sqrt((p.x - GL_VENDOR_POS.x) ** 2 + (p.y - GL_VENDOR_POS.y) ** 2) : Infinity;
      const inRange = inHub ? merchantDist < MERCHANT_RANGE : vendorDist < MERCHANT_RANGE;
      setNearMerchant(inRange && !dialogChoicesRef.current.active && !glDialogRef.current);

      // Gold Find: earn 1 gold per second while moving
      if (hasGoldFind && moving) {
        goldAccumRef.current += dt;
        if (goldAccumRef.current >= 1.0) {
          goldAccumRef.current -= 1.0;
          setPlayerGold(g => g + 1);
        }
      }

      // Stamina: drain while moving, recover while idle
      if (moving) {
        staminaRef.current = Math.max(0, staminaRef.current - 8 * dt);
      } else {
        staminaRef.current = Math.min(MAX_STAMINA, staminaRef.current + 20 * dt);
      }

      // Health: hazardous zones drain HP
      const ptx = Math.floor(p.x), pty = Math.floor(p.y);
      if (inHub) {
        const inRuins = ellipseDist(ptx, pty, 42, 78, 10, 8) < 0.6;
        const onRock = map[pty]?.[ptx] === T.ROCK;
        if (inRuins) healthRef.current = Math.max(0, healthRef.current - 3 * dt);
        else if (onRock) healthRef.current = Math.max(0, healthRef.current - 1 * dt);
        const wellDist = Math.sqrt((ptx - 55) ** 2 + (pty - 42) ** 2);
        const campfires = [[53, 42], [21, 31], [44, 79], [56, 64], [50, 56]];
        const nearCampfire = campfires.some(([cx, cy]) => Math.sqrt((ptx - cx) ** 2 + (pty - cy) ** 2) < 2);
        if (wellDist < 3) healthRef.current = Math.min(MAX_HEALTH, healthRef.current + 5 * dt);
        else if (nearCampfire) healthRef.current = Math.min(MAX_HEALTH, healthRef.current + 3 * dt);

        // Hub dialog timer
        if (glDialogRef.current && !dialogChoicesRef.current.active) {
          glDialogRef.current.timer -= dt;
          if (glDialogRef.current.timer <= 0) glDialogRef.current = null;
        }
        // Hub damage numbers
        damageNumbersRef.current = damageNumbersRef.current.filter(dn => { dn.timer -= dt; dn.y -= 30 * dt; return dn.timer > 0; });

        // Walk-over gold coin pickup (hub)
        for (const coin of GOLD_COINS) {
          if (coin.zone !== 'hub') continue;
          if (coinsCollectedRef.current.has(coin.id)) continue;
          const cd = Math.sqrt((p.x - coin.x) ** 2 + (p.y - coin.y) ** 2);
          if (cd < 1.2) {
            coinsCollectedRef.current.add(coin.id);
            playerGoldRef.current = Math.min(playerGoldRef.current + coin.gold, resourceCapRef.current.gold);
            setPlayerGold(playerGoldRef.current);
            damageNumbersRef.current.push({ x: coin.x * TILE_SIZE + 16, y: coin.y * TILE_SIZE - 16, text: `+${coin.gold}G`, color: '#e8c86a', timer: 1.5 });
          }
        }
      } else {
        const onRock = map[pty]?.[ptx] === T.ROCK;
        if (onRock) healthRef.current = Math.max(0, healthRef.current - 1 * dt);
        const glCampfires = [[39, 48], [40, 14], [36, 11]];
        const nearGlFire = glCampfires.some(([cx, cy]) => Math.sqrt((ptx - cx) ** 2 + (pty - cy) ** 2) < 2);
        if (nearGlFire) healthRef.current = Math.min(MAX_HEALTH, healthRef.current + 3 * dt);

        // ── Orc AI State Machine ──
        for (const orc of orcsRef.current) {
          if (orc.state === 'dead') {
            const maxDF = orc.kind === 'warrior' ? GL_ORC_W_DEATH_FRAMES : GL_ORC_M_DEATH_FRAMES;
            if (orc.deathFrame < maxDF - 1) orc.deathFrame += dt * 8;
            continue;
          }

          const dx = p.x - orc.x;
          const dy = p.y - orc.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const homeDist = Math.sqrt((orc.x - orc.homeX) ** 2 + (orc.y - orc.homeY) ** 2);
          if (orc.attackCooldown > 0) orc.attackCooldown -= dt;

          if (orc.state === 'hurt') {
            orc.stateTimer += dt;
            orc.hurtTimer -= dt;
            if (orc.stateTimer >= ORC_HURT_DURATION) {
              orc.state = dist < ORC_ATTACK_RANGE ? 'attack' : 'chase';
              orc.stateTimer = 0;
            }
            continue;
          }

          switch (orc.state) {
            case 'idle':
              orc.animFrame += dt * 3;
              if (dist < ORC_AGGRO_RANGE) { orc.state = 'chase'; orc.stateTimer = 0; }
              break;

            case 'chase':
              orc.animFrame += dt * 5;
              orc.facing = dx > 0 ? 'right' : 'left';
              if (dist > 0.3) {
                const mx = (dx / dist) * ORC_CHASE_SPEED * dt;
                const my = (dy / dist) * ORC_CHASE_SPEED * dt;
                const ntx = Math.floor(orc.x + mx);
                const nty = Math.floor(orc.y + my);
                if (ntx >= 0 && ntx < GL_W && nty >= 0 && nty < GL_H) {
                  if (WALKABLE.has(map[Math.floor(orc.y)]?.[ntx])) orc.x += mx;
                  if (WALKABLE.has(map[nty]?.[Math.floor(orc.x)])) orc.y += my;
                }
              }
              if (dist < ORC_ATTACK_RANGE) { orc.state = 'attack'; orc.stateTimer = 0; }
              else if (dist > ORC_LEASH_RANGE || homeDist > ORC_LEASH_RANGE) {
                orc.state = 'idle'; orc.x = orc.homeX; orc.y = orc.homeY;
                orc.hp = Math.min(orc.maxHp, orc.hp + 10); orc.stateTimer = 0;
              }
              break;

            case 'attack':
              orc.stateTimer += dt;
              orc.animFrame += dt * 8;
              orc.facing = dx > 0 ? 'right' : 'left';
              if (orc.attackCooldown <= 0 && dist < ORC_ATTACK_RANGE + 0.5) {
                let dmgToPlayer = orc.damage;
                const hasDef = buffsRef.current.some(b => b.effect === 'defense' && b.remaining > 0);
                if (hasDef) dmgToPlayer = Math.floor(dmgToPlayer * 0.7);
                if (shrineBuffRef.current.active) dmgToPlayer = Math.floor(dmgToPlayer * 0.8);
                healthRef.current = Math.max(0, healthRef.current - dmgToPlayer);
                playerHurtFlashRef.current = 0.3;
                orc.attackCooldown = ORC_ATK_COOLDOWN;
                damageNumbersRef.current.push({
                  x: p.x * TILE_SIZE + 16, y: p.y * TILE_SIZE - 24,
                  text: `-${dmgToPlayer}`, color: '#ff6060', timer: 1.0,
                });
              }
              const atkFrames = orc.kind === 'warrior' ? GL_ORC_W_ATK_FRAMES : GL_ORC_M_ATK_FRAMES;
              if (orc.stateTimer >= atkFrames / 8) {
                orc.stateTimer = 0;
                if (dist > ORC_ATTACK_RANGE) orc.state = 'chase';
              }
              break;
          }
        }

        // Combat timer ticks
        if (playerAtkCooldownRef.current > 0) playerAtkCooldownRef.current -= dt;
        if (playerAtkAnimRef.current > 0) playerAtkAnimRef.current -= dt;
        if (playerHurtFlashRef.current > 0) playerHurtFlashRef.current -= dt;
        damageNumbersRef.current = damageNumbersRef.current
          .map(d => ({ ...d, timer: d.timer - dt, y: d.y - 30 * dt }))
          .filter(d => d.timer > 0);
        if (shrineBuffRef.current.active) {
          shrineBuffRef.current.timer -= dt;
          if (shrineBuffRef.current.timer <= 0) shrineBuffRef.current.active = false;
        }
      }

      // ── Village NPC animation + patrol ──
      if (inVillage) {
        for (const npc of svNpcsRef.current) {
          npc.animFrame += dt * 4;
          // Patrol movement
          if (npc.patrolPath && npc.patrolPath.length > 1) {
            npc.patrolTimer += dt;
            if (npc.patrolTimer >= 3) { // wait 3s at each waypoint
              npc.patrolTimer = 0;
              npc.patrolIdx = (npc.patrolIdx + 1) % npc.patrolPath.length;
            }
            const target = npc.patrolPath[npc.patrolIdx];
            const pdx = target.x - npc.x;
            const pdy = target.y - npc.y;
            const pd = Math.sqrt(pdx * pdx + pdy * pdy);
            if (pd > 0.1) {
              const spd = 1.5 * dt;
              npc.x += (pdx / pd) * spd;
              npc.y += (pdy / pd) * spd;
              if (Math.abs(pdx) > Math.abs(pdy)) npc.facing = pdx > 0 ? 'right' : 'left';
              else npc.facing = pdy > 0 ? 'down' : 'up';
            }
          }
        }

        // ── Village animal AI ──
        const svMap = svMapRef.current;
        for (const a of svAnimalsRef.current) {
          if (a.state === 'dead') {
            a.respawnTimer -= dt;
            const homeDist = Math.sqrt((ptx - a.homeX) ** 2 + (pty - a.homeY) ** 2);
            if (a.respawnTimer <= 0 && homeDist > 10) {
              a.x = a.homeX; a.y = a.homeY;
              a.hp = a.maxHp; a.state = 'idle'; a.stateTimer = 0;
              a.wanderTarget = null;
            }
            continue;
          }
          a.animFrame += dt * 3;
          const adx = ptx - a.x, ady = pty - a.y;
          const aDist = Math.sqrt(adx * adx + ady * ady);

          // Flee when player approaches
          if (aDist < SV_ANIMAL_FLEE_RANGE && a.state !== 'flee') {
            a.state = 'flee'; a.stateTimer = 0;
          }

          switch (a.state) {
            case 'idle':
              a.stateTimer += dt;
              if (a.stateTimer >= SV_ANIMAL_WANDER_PAUSE) {
                // Pick random walkable tile within 3 tiles of home
                const wx = a.homeX + (Math.random() - 0.5) * 6;
                const wy = a.homeY + (Math.random() - 0.5) * 4;
                const cx = Math.max(1, Math.min(SV_W - 2, Math.floor(wx)));
                const cy = Math.max(1, Math.min(SV_H - 2, Math.floor(wy)));
                if (svMap && svMap[cy] && WALKABLE.has(svMap[cy][cx])) {
                  a.wanderTarget = { x: wx, y: wy };
                  a.state = 'wander'; a.stateTimer = 0;
                } else {
                  a.stateTimer = SV_ANIMAL_WANDER_PAUSE * 0.5; // retry sooner
                }
              }
              break;
            case 'wander': {
              if (!a.wanderTarget) { a.state = 'idle'; a.stateTimer = 0; break; }
              const wdx = a.wanderTarget.x - a.x;
              const wdy = a.wanderTarget.y - a.y;
              const wDist = Math.sqrt(wdx * wdx + wdy * wdy);
              if (wDist < 0.2) { a.state = 'idle'; a.stateTimer = 0; a.wanderTarget = null; break; }
              const ws = a.speed * dt;
              a.x += (wdx / wDist) * ws;
              a.y += (wdy / wDist) * ws;
              a.facing = wdx > 0 ? 'right' : 'left';
              break;
            }
            case 'flee': {
              a.stateTimer += dt;
              if (a.stateTimer >= SV_ANIMAL_FLEE_DURATION) {
                a.state = 'wander'; a.stateTimer = 0;
                a.wanderTarget = { x: a.homeX, y: a.homeY };
                break;
              }
              // Flee away from player
              if (aDist > 0.1) {
                const fs = a.fleeSpeed * dt;
                const fx = a.x - (adx / aDist) * fs;
                const fy = a.y - (ady / aDist) * fs;
                const fxi = Math.floor(fx), fyi = Math.floor(fy);
                if (fx >= 1 && fx < SV_W - 1 && svMap && svMap[fyi] && WALKABLE.has(svMap[fyi][fxi])) a.x = fx;
                if (fy >= 1 && fy < SV_H - 1 && svMap && svMap[Math.floor(a.y)]?.[Math.floor(fx)] !== undefined) a.y = fy;
                a.facing = adx > 0 ? 'left' : 'right'; // face away from player
              }
              break;
            }
          }
        }

        // ── Village bandit AI (mirrors grassland orc AI) ──
        for (const b of svBanditsRef.current) {
          if (b.state === 'dead') {
            b.deathFrame += dt * 8;
            continue;
          }
          const bdx = ptx - b.x, bdy = pty - b.y;
          const bDist = Math.sqrt(bdx * bdx + bdy * bdy);
          const bHomeDist = Math.sqrt((b.x - b.homeX) ** 2 + (b.y - b.homeY) ** 2);
          if (b.attackCooldown > 0) b.attackCooldown -= dt;

          if (b.state === 'hurt') {
            b.stateTimer += dt;
            b.hurtTimer -= dt;
            if (b.stateTimer >= ORC_HURT_DURATION) {
              b.state = bDist < SV_BANDIT_ATTACK_RANGE ? 'attack' : 'chase';
              b.stateTimer = 0;
            }
            continue;
          }

          switch (b.state) {
            case 'idle':
              b.animFrame += dt * 3;
              if (bDist < SV_BANDIT_AGGRO) {
                b.state = 'chase'; b.stateTimer = 0;
              }
              break;
            case 'chase':
              b.animFrame += dt * 5;
              b.facing = bdx > 0 ? 'right' : 'left';
              if (bDist > 0.2) {
                const mx = (bdx / bDist) * SV_BANDIT_CHASE_SPEED * dt;
                const my = (bdy / bDist) * SV_BANDIT_CHASE_SPEED * dt;
                const ntx = Math.floor(b.x + mx), nty = Math.floor(b.y + my);
                if (svMap && svMap[Math.floor(b.y)]?.[ntx] !== undefined && WALKABLE.has(svMap[Math.floor(b.y)][ntx])) b.x += mx;
                if (svMap && svMap[nty]?.[Math.floor(b.x)] !== undefined && WALKABLE.has(svMap[nty][Math.floor(b.x)])) b.y += my;
              }
              if (bDist < SV_BANDIT_ATTACK_RANGE) {
                b.state = 'attack'; b.stateTimer = 0;
              } else if (bDist > SV_BANDIT_LEASH || bHomeDist > SV_BANDIT_LEASH) {
                b.state = 'idle'; b.x = b.homeX; b.y = b.homeY;
                b.hp = Math.min(b.maxHp, b.hp + 10);
                b.stateTimer = 0;
              }
              break;
            case 'attack':
              b.stateTimer += dt;
              b.animFrame += dt * 8;
              b.facing = bdx > 0 ? 'right' : 'left';
              if (b.attackCooldown <= 0 && bDist < SV_BANDIT_ATTACK_RANGE + 0.5) {
                let dmg = b.damage;
                const hasDef = buffsRef.current.some(bf => bf.effect === 'defense' && bf.remaining > 0);
                if (hasDef) dmg = Math.floor(dmg * 0.7);
                healthRef.current = Math.max(0, healthRef.current - dmg);
                playerHurtFlashRef.current = 0.3;
                b.attackCooldown = SV_BANDIT_ATK_COOLDOWN;
                damageNumbersRef.current.push({
                  x: ptx * TILE_SIZE + 16, y: pty * TILE_SIZE - 24,
                  text: `-${dmg}`, color: '#ff6060', timer: 1.0,
                });
              }
              const atkLen = b.kind === 'warrior' ? GL_ORC_W_ATK_FRAMES : GL_ORC_M_ATK_FRAMES;
              if (b.stateTimer >= atkLen / 8) {
                b.stateTimer = 0;
                if (bDist > SV_BANDIT_ATTACK_RANGE) b.state = 'chase';
              }
              break;
          }
        }

        // Area visited tracking (with discovery banners)
        const svAreas = svAreasVisited.current;
        if (ellipseDist(ptx, pty, 20, 8, 8, 4) < 0.8 && !svAreas.square) {
          svAreas.square = true; discoveriesRef.current.add('sv_square');
          zoneBannerRef.current = 'Discovered: Village Square';
          zoneBannerTimer.current = 2;
        }
        if (pty >= 18 && ptx > 10 && ptx < 32 && !svAreas.waterfront) {
          svAreas.waterfront = true; discoveriesRef.current.add('sv_waterfront');
          zoneBannerRef.current = 'Discovered: Waterfront';
          zoneBannerTimer.current = 2;
        }
        if (pty <= 5 && ptx > 8 && ptx < 28 && !svAreas.residential) {
          svAreas.residential = true; discoveriesRef.current.add('sv_residential');
          zoneBannerRef.current = 'Discovered: Residential Quarter';
          zoneBannerTimer.current = 2;
        }

        // Dialog timer (shared with grassland)
        if (glDialogRef.current && !svDialogChoicesRef.current.active) {
          glDialogRef.current.timer -= dt;
          if (glDialogRef.current.timer <= 0) glDialogRef.current = null;
        }

        // Damage numbers tick (shared)
        damageNumbersRef.current = damageNumbersRef.current
          .map(d => ({ ...d, timer: d.timer - dt, y: d.y - 30 * dt }))
          .filter(d => d.timer > 0);

        // Walk-over gold coin pickup (grassland & village)
        const curZone = zoneRef.current;
        for (const coin of GOLD_COINS) {
          if (coin.zone !== curZone) continue;
          if (coinsCollectedRef.current.has(coin.id)) continue;
          const cd = Math.sqrt((p.x - coin.x) ** 2 + (p.y - coin.y) ** 2);
          if (cd < 1.2) {
            coinsCollectedRef.current.add(coin.id);
            playerGoldRef.current = Math.min(playerGoldRef.current + coin.gold, resourceCapRef.current.gold);
            setPlayerGold(playerGoldRef.current);
            damageNumbersRef.current.push({ x: coin.x * TILE_SIZE + 16, y: coin.y * TILE_SIZE - 16, text: `+${coin.gold}G`, color: '#e8c86a', timer: 1.5 });
          }
        }
      }

      // Death: respawn, lose 20% gold, show feedback
      if (healthRef.current <= 0) {
        const goldBefore = playerGoldRef.current;
        const goldAfter = Math.floor(goldBefore * 0.8);
        const goldLost = goldBefore - goldAfter;
        healthRef.current = MAX_HEALTH;
        staminaRef.current = MAX_STAMINA;
        if (inHub) { p.x = 55; p.y = 45; }
        else if (inVillage) { p.x = 1; p.y = 12; }
        else { p.x = 40; p.y = GL_H - 3; }
        p.facing = 'down'; p.moving = false;
        playerGoldRef.current = goldAfter;
        setPlayerGold(goldAfter);
        zoneBannerRef.current = goldLost > 0 ? `You have fallen... -${goldLost} Gold` : 'You have fallen...';
        zoneBannerTimer.current = 3;
      }

      // Objectives: track exploration milestones
      if (inHub) {
        const vis = visitedRef.current;
        if (merchantDist < MERCHANT_RANGE && !vis.has('merchant')) { vis.add('merchant'); discoveriesRef.current.add('hub_merchant'); zoneBannerRef.current = 'Discovered: Town Merchant'; zoneBannerTimer.current = 2; }
        if (ellipseDist(ptx, pty, 22, 30, 5, 4) < 0.8 && !vis.has('forest')) { vis.add('forest'); discoveriesRef.current.add('hub_forest_area'); zoneBannerRef.current = 'Discovered: Western Forest'; zoneBannerTimer.current = 2; }
        if (ellipseDist(ptx, pty, 42, 78, 10, 8) < 0.6 && !vis.has('ruins')) { vis.add('ruins'); discoveriesRef.current.add('hub_ruins'); zoneBannerRef.current = 'Discovered: Ancient Ruins'; zoneBannerTimer.current = 2; }
        if (ellipseDist(ptx, pty, 28, 62, 3, 2) < 1.0 && !vis.has('shrine')) { vis.add('shrine'); discoveriesRef.current.add('hub_shrine'); zoneBannerRef.current = 'Discovered: Lakeside Shrine'; zoneBannerTimer.current = 2; }
        if (ellipseDist(ptx, pty, 96, 42, 5, 4) < 1.0 && !vis.has('docks')) { vis.add('docks'); discoveriesRef.current.add('hub_docks'); zoneBannerRef.current = 'Discovered: The Docks'; zoneBannerTimer.current = 2; }
        if (ellipseDist(ptx, pty, 38, 59, 3, 2) < 1.0 && !vis.has('hermit')) { vis.add('hermit'); discoveriesRef.current.add('hub_hermit'); zoneBannerRef.current = 'Discovered: Hermit\'s Hut'; zoneBannerTimer.current = 2; }
        if (ellipseDist(ptx, pty, 57, 28, 3, 2) < 1.0 && !vis.has('waystation')) { vis.add('waystation'); discoveriesRef.current.add('hub_waystation'); zoneBannerRef.current = 'Discovered: Northern Waystation'; zoneBannerTimer.current = 2; }
        if (ellipseDist(ptx, pty, 83, 41, 3, 2) < 1.0 && !vis.has('cottage')) { vis.add('cottage'); discoveriesRef.current.add('hub_cottage'); zoneBannerRef.current = 'Discovered: Coast Cottage'; zoneBannerTimer.current = 2; }
        if (ellipseDist(ptx, pty, 35, 72, 3, 2) < 1.0 && !vis.has('farm')) { vis.add('farm'); discoveriesRef.current.add('hub_farm'); zoneBannerRef.current = 'Discovered: Southern Farmstead'; zoneBannerTimer.current = 2; }
        if (ellipseDist(ptx, pty, 75, 35, 4, 3) < 0.8 && !vis.has('coast_road')) { vis.add('coast_road'); discoveriesRef.current.add('hub_coast_road'); zoneBannerRef.current = 'Discovered: Coast Road'; zoneBannerTimer.current = 2; }
        if (!vis.has('merchant')) objectiveRef.current = 'Visit the Merchant at Town Square \u2192';
        else if (!vis.has('forest')) objectiveRef.current = 'Explore the Forest to the west \u2190';
        else if (!vis.has('ruins')) objectiveRef.current = 'Find the Ancient Ruins to the south \u2193';
        else if (!vis.has('shrine')) objectiveRef.current = 'Visit the Lakeside Shrine \u2199 southwest';
        else if (!vis.has('docks')) objectiveRef.current = 'Discover the Docks to the east \u2192';
        else if (glCompletionGold.current && svCompletionGold.current) objectiveRef.current = 'Build your settlement [B] \u2014 place buildings to grow your town';
        else if (glCompletionGold.current && !svCompletionGold.current) objectiveRef.current = 'Travel to the Seaside Village via Docks South Gate \u2192';
        else if (!glCompletionGold.current && svCompletionGold.current) objectiveRef.current = 'Enter the Northern Pass to the Grassland \u2191';
        else objectiveRef.current = 'Enter the Northern Pass \u2191 or build structures [B]';
      } else if (inVillage) {
        // Village objectives
        const svAreas = svAreasVisited.current;
        const q = svQuestRef.current;
        if (!svAreas.square || !svAreas.waterfront || !svAreas.residential) {
          const remaining: string[] = [];
          if (!svAreas.square) remaining.push('square');
          if (!svAreas.waterfront) remaining.push('waterfront');
          if (!svAreas.residential) remaining.push('residential');
          svObjectiveRef.current = `Explore the village (${3 - remaining.length}/3 areas)`;
        } else if (!svElderTalked.current) {
          svObjectiveRef.current = 'Talk to the Village Elder [E]';
        } else if (q.stage === 'none') {
          svObjectiveRef.current = 'Talk to Marina [E]';
        } else if (q.stage === 'searching') {
          const searched = q.searched.filter(Boolean).length;
          svObjectiveRef.current = `Find the lost necklace (${searched}/3 spots searched)`;
        } else if (q.stage === 'found') {
          svObjectiveRef.current = 'Return the necklace to Marina [E]';
        } else if (q.stage === 'returned' && !svChestOpenedRef.current) {
          svObjectiveRef.current = 'Open the reward chest at the waterfront [E]';
        } else if (q.stage === 'complete' || svChestOpenedRef.current) {
          svObjectiveRef.current = 'Return west to the hub';
        }
      } else {
        const glVis = glVisitedRef.current;
        if (vendorDist < MERCHANT_RANGE && !glVis.has('vendor')) { glVis.add('vendor'); discoveriesRef.current.add('gl_vendor'); zoneBannerRef.current = 'Discovered: Vendor Camp'; zoneBannerTimer.current = 2; }
        if (ellipseDist(ptx, pty, 60, 28, 4, 3) < 0.9 && !glVis.has('overlook')) { glVis.add('overlook'); discoveriesRef.current.add('gl_overlook'); zoneBannerRef.current = 'Discovered: Rocky Overlook'; zoneBannerTimer.current = 2; }
        if (ellipseDist(ptx, pty, 20, 32, 4, 3) < 0.8 && !glVis.has('clearing')) { glVis.add('clearing'); discoveriesRef.current.add('gl_clearing'); zoneBannerRef.current = 'Discovered: Forest Clearing'; zoneBannerTimer.current = 2; }
        if (ellipseDist(ptx, pty, 62, 22, 4, 3) < 0.9 && !glVis.has('cave')) { glVis.add('cave'); discoveriesRef.current.add('gl_cave'); zoneBannerRef.current = 'Discovered: Dark Cave'; zoneBannerTimer.current = 2; }
        if (ellipseDist(ptx, pty, 40, 12, 9, 6) < 0.6 && !glVis.has('shrine')) { glVis.add('shrine'); discoveriesRef.current.add('gl_stronghold'); zoneBannerRef.current = 'Discovered: Orc Stronghold'; zoneBannerTimer.current = 2; }

        const killed = orcsKilledRef.current;
        if (!glVis.has('vendor')) objectiveRef.current = 'Talk to the Vendor at the camp [E]';
        else if (!glVis.has('cave')) objectiveRef.current = 'Inspect the Dark Cave entrance [E]';
        else if (!glVis.has('overlook')) objectiveRef.current = 'Reach the Rocky Overlook to the east';
        else if (!glVis.has('clearing')) objectiveRef.current = 'Find the Forest Clearing to the west';
        else if (killed < 7) objectiveRef.current = `Slay orcs at the Stronghold [SPACE] (${killed}/7)`;
        else if (!glMissionRef.current) {
          glMissionRef.current = true;
          zoneBannerRef.current = 'Stronghold cleared! Claim the chest!';
          zoneBannerTimer.current = 4;
          objectiveRef.current = 'Open the chest at the Shrine [E]';
        } else if (!glRewardGivenRef.current) {
          objectiveRef.current = 'Open the chest at the Shrine [E]';
          if (glChestAnimRef.current > 0 && glChestAnimRef.current < GL_CHEST_OPEN_FRAMES) {
            glChestAnimRef.current += dt * 4;
          }
        } else {
          objectiveRef.current = 'Return south to the hub';
        }

        // Orc danger warning — flash when entering stronghold
        const inOrcZone = ellipseDist(ptx, pty, 40, 12, 9, 6) < 0.7;
        if (inOrcZone && glOrcWarning.current <= 0 && healthRef.current > 0) {
          glOrcWarning.current = 3;
        }
        if (glOrcWarning.current > 0) glOrcWarning.current -= dt;

        // Dialog timer (pause while choices active)
        if (glDialogRef.current && !dialogChoicesRef.current.active) {
          glDialogRef.current.timer -= dt;
          if (glDialogRef.current.timer <= 0) glDialogRef.current = null;
        }
      }

      // Render
      canvas.width = w * devicePixelRatio;
      canvas.height = h * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
      ctx.imageSmoothingEnabled = false;

      // Sight buff: zoom out slightly to see more
      const zoom = hasSight ? zoomRef.current * 0.75 : zoomRef.current;
      const camX = p.x * TILE_SIZE - w / (2 * zoom);
      const camY = p.y * TILE_SIZE - h / (2 * zoom);

      ctx.fillStyle = inHub ? '#2898b8' : inVillage ? '#2888b0' : '#3a5c28';
      ctx.fillRect(0, 0, w, h);

      ctx.save();
      ctx.scale(zoom, zoom);
      ctx.translate(-camX, -camY);

      if (terrainRef.current) ctx.drawImage(terrainRef.current, 0, 0);
      if (decoRef.current) ctx.drawImage(decoRef.current, 0, 0);

      // Entities + player with Y-sort
      const allDrawables: { y: number; fn: () => void }[] = [];

      if (inHub) {
        for (const pe of placedRef.current) {
          const isNear = nearbyEntityRef.current?.id === pe.entity.id;
          allDrawables.push({ y: pe.tileY, fn: () => drawEntitySprite(ctx, pe, ga, isNear, timeRef.current) });
        }
        // Townsfolk rendering (GuttyKreum tilemap)
        const ppx = p.x, ppy = p.y;
        for (const folk of townsfolkRef.current) {
          allDrawables.push({ y: folk.y, fn: () => {
            const fx = folk.x * TILE_SIZE;
            const fy = folk.y * TILE_SIZE;
            const charIdx = GK_CHAR_INDEX[folk.charKey] ?? 0;
            const dirRow = GK_DIR_ROW[folk.facing];
            const frame = folk.idleTimer > 0 ? 0 : Math.floor(folk.animFrame) % GK_COLS;
            const sx = frame * GK_FRAME;
            const sy = (charIdx * 4 + dirRow) * GK_FRAME;
            // Shadow
            ctx.fillStyle = 'rgba(0,0,0,0.15)';
            ctx.beginPath();
            ctx.ellipse(fx + 16, fy + TILE_SIZE - 2, 8, 3, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.drawImage(ga.npcTilemap, sx, sy, GK_FRAME, GK_FRAME, fx + 2, fy - 4, 28, 32);
            // Name label + [E] prompt when near
            const folkDist = Math.sqrt((ppx - folk.x) ** 2 + (ppy - folk.y) ** 2);
            if (folkDist < 4) {
              ctx.font = '600 9px Inter, sans-serif';
              ctx.textAlign = 'center';
              const nm = ctx.measureText(folk.name);
              const nbgW = nm.width + 12;
              const nbgH = 16;
              const nbgX = fx + 16 - nbgW / 2;
              const nbgY = fy - 14;
              ctx.fillStyle = 'rgba(10,10,15,0.85)';
              ctx.beginPath();
              ctx.roundRect(nbgX, nbgY, nbgW, nbgH, 4);
              ctx.fill();
              ctx.strokeStyle = folkDist < 2.5 ? 'rgba(230,200,100,0.5)' : 'rgba(255,255,255,0.15)';
              ctx.lineWidth = 1;
              ctx.stroke();
              ctx.fillStyle = folkDist < 2.5 ? '#ffd700' : 'rgba(255,255,255,0.9)';
              ctx.fillText(folk.name, fx + 16, nbgY + 11.5);
              if (folkDist < 2.5) {
                ctx.font = 'bold 8px Inter, sans-serif';
                ctx.fillStyle = 'rgba(255,215,0,0.7)';
                ctx.fillText('[E]', fx + 16, nbgY - 4);
              }
            }
          }});
        }
        // Lost sheep for Lina's quest (visible when quest active, not yet found)
        if (questFlagsRef.current.has('lina_sheep_quest') && !questFlagsRef.current.has('lina_sheep_found')) {
          allDrawables.push({ y: 52, fn: () => {
            const lsx = 92 * TILE_SIZE;
            const lsy = 52 * TILE_SIZE;
            const lsFrame = Math.floor(timeRef.current * 2) % SHEEP_COLS;
            ctx.drawImage(ga.sheepWhite, lsFrame * SHEEP_FW, 0, SHEEP_FW, SHEEP_FH, lsx - 16, lsy - 8, 64, 32);
            // Exclamation mark to draw attention
            ctx.font = 'bold 10px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#e8c040';
            ctx.fillText('!', lsx + 16, lsy - 12);
          }});
        }
        // Hub sheep rendering
        for (const sheep of ambientSheepRef.current) {
          if (sheep.zone !== 'hub') continue;
          allDrawables.push({ y: sheep.y, fn: () => {
            const sx = sheep.x * TILE_SIZE;
            const sy = sheep.y * TILE_SIZE;
            const img = sheep.variant === 'white' ? ga.sheepWhite : ga.sheepBrown;
            const frame = Math.floor(sheep.animFrame) % SHEEP_COLS;
            // Row 0 = south idle/walk
            ctx.drawImage(img, frame * SHEEP_FW, 0, SHEEP_FW, SHEEP_FH, sx - 16, sy - 8, 64, 32);
          }});
        }
      } else if (zoneRef.current === 'village') {
        // ── Village NPC rendering ──
        const t = timeRef.current;
        const px = p.x, py = p.y;

        for (const npc of svNpcsRef.current) {
          allDrawables.push({ y: npc.y, fn: () => {
            const nx = npc.x * TILE_SIZE;
            const ny = npc.y * TILE_SIZE;
            const isTall = npc.kind === 'tall';
            const fw = isTall ? NPC_TALL_FRAME_W : NPC_SMALL_FRAME_W;
            const fh = isTall ? NPC_TALL_FRAME_H : NPC_SMALL_FRAME_H;
            const img = ga[npc.spriteKey];
            const cols = Math.floor(img.width / fw);
            // Tall spritesheets: row0=right, row1=left, row2=down, row3=up
            // Small spritesheets: row0=down, row1=right, row2=up (no left — flip right)
            let facingRow: number;
            let flipX = false;
            if (isTall) {
              facingRow = npc.facing === 'right' ? 0 : npc.facing === 'left' ? 1 : npc.facing === 'down' ? 2 : 3;
            } else {
              if (npc.facing === 'down') { facingRow = 0; }
              else if (npc.facing === 'right') { facingRow = 1; }
              else if (npc.facing === 'left') { facingRow = 1; flipX = true; }
              else { facingRow = 2; } // up
            }
            const frame = Math.floor(npc.animFrame) % (cols || 1);
            // Shadow
            ctx.fillStyle = 'rgba(0,0,0,0.12)';
            ctx.beginPath();
            ctx.ellipse(nx + 16, ny + TILE_SIZE - 2, 10, 4, 0, 0, Math.PI * 2);
            ctx.fill();
            // Sprite
            const scale = isTall ? 1.2 : 1.0;
            const destW = fw * scale;
            const destH = fh * scale;
            if (flipX) {
              ctx.save();
              ctx.translate(nx + 16, 0);
              ctx.scale(-1, 1);
              ctx.drawImage(img, frame * fw, facingRow * fh, fw, fh,
                -destW / 2, ny + TILE_SIZE - destH, destW, destH);
              ctx.restore();
            } else {
              ctx.drawImage(img, frame * fw, facingRow * fh, fw, fh,
                nx + 16 - destW / 2, ny + TILE_SIZE - destH, destW, destH);
            }
            // Name label
            ctx.font = '600 9px Inter, sans-serif';
            ctx.textAlign = 'center';
            const lm = ctx.measureText(npc.name);
            const dist = Math.sqrt((px - npc.x) ** 2 + (py - npc.y) ** 2);
            const nlW = lm.width + 12;
            const nlH = 16;
            const nlX = nx + 16 - nlW / 2;
            const nlY = ny - 14;
            ctx.fillStyle = 'rgba(10,10,15,0.85)';
            ctx.beginPath();
            ctx.roundRect(nlX, nlY, nlW, nlH, 4);
            ctx.fill();
            ctx.strokeStyle = dist < 2.5 ? 'rgba(230,200,100,0.5)' : 'rgba(255,255,255,0.15)';
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.fillStyle = dist < 2.5 ? '#ffd700' : 'rgba(255,255,255,0.9)';
            ctx.fillText(npc.name, nx + 16, nlY + 11.5);
            // [E] prompt when near
            if (dist < 2.5) {
              ctx.font = 'bold 8px Inter, sans-serif';
              ctx.fillStyle = 'rgba(255,215,0,0.7)';
              ctx.fillText('[E]', nx + 16, nlY - 4);
            }
          }});
        }

        // ── Village animals ──
        for (const a of svAnimalsRef.current) {
          if (a.state === 'dead') continue;
          allDrawables.push({ y: a.y, fn: () => {
            const ax = a.x * TILE_SIZE;
            const ay = a.y * TILE_SIZE;
            let spriteImg: HTMLImageElement;
            let fw: number, fh: number, frames: number, drawW: number, drawH: number;
            let hoverY = 0;

            switch (a.kind) {
              case 'duck':
                spriteImg = ga.glDuck; fw = GL_DUCK_FW; fh = GL_DUCK_FH; frames = GL_DUCK_FRAMES;
                drawW = 28; drawH = 28; break;
              case 'frog':
                spriteImg = ga.glFrog; fw = GL_FROG_FW; fh = GL_FROG_FH; frames = GL_FROG_FRAMES;
                drawW = 24; drawH = 24; break;
              case 'bird':
                spriteImg = ga.glBird; fw = GL_BIRD_FW; fh = GL_BIRD_FH; frames = GL_BIRD_FRAMES;
                drawW = 28; drawH = 28; break;
              case 'butterfly':
                spriteImg = ga.glButterfly; fw = GL_BUTTERFLY_FW; fh = GL_BUTTERFLY_FH; frames = GL_BUTTERFLY_FRAMES;
                drawW = 32; drawH = 24;
                hoverY = Math.sin(t * 2.5 + a.id) * 4;
                break;
            }

            const frame = Math.floor(a.animFrame) % frames;

            // Shadow
            ctx.fillStyle = 'rgba(0,0,0,0.08)';
            ctx.beginPath();
            ctx.ellipse(ax + 16, ay + TILE_SIZE - 2, drawW * 0.3, 3, 0, 0, Math.PI * 2);
            ctx.fill();

            // Sprite (flip if facing left)
            if (a.facing === 'left') {
              ctx.save();
              ctx.translate(ax + 16, 0);
              ctx.scale(-1, 1);
              ctx.drawImage(spriteImg, frame * fw, 0, fw, fh,
                -drawW / 2, ay + TILE_SIZE - drawH - 2 + hoverY, drawW, drawH);
              ctx.restore();
            } else {
              ctx.drawImage(spriteImg, frame * fw, 0, fw, fh,
                ax + 16 - drawW / 2, ay + TILE_SIZE - drawH - 2 + hoverY, drawW, drawH);
            }

            // Kind label when nearby
            const adist = Math.sqrt((px - a.x) ** 2 + (py - a.y) ** 2);
            if (adist < 3) {
              const label = a.kind.charAt(0).toUpperCase() + a.kind.slice(1);
              ctx.font = '500 8px Inter, sans-serif';
              ctx.textAlign = 'center';
              ctx.fillStyle = 'rgba(255,255,255,0.6)';
              ctx.fillText(label, ax + 16, ay - 2 + hoverY);
            }
          }});
        }

        // ── Witch NPC (GuttyKreum tilemap) ──
        allDrawables.push({ y: SV_WITCH_POS.y, fn: () => {
          const wx = SV_WITCH_POS.x * TILE_SIZE;
          const wy = SV_WITCH_POS.y * TILE_SIZE;
          const charIdx = GK_CHAR_INDEX['Witch'] ?? 18;
          // Idle animation: cycle frame 0-1 slowly
          const frame = Math.floor(t * 1.5) % 2;
          const sy = (charIdx * 4 + GK_DIR_ROW['down']) * GK_FRAME;
          // Shadow
          ctx.fillStyle = 'rgba(0,0,0,0.15)';
          ctx.beginPath();
          ctx.ellipse(wx + 16, wy + TILE_SIZE - 2, 8, 3, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.drawImage(ga.npcTilemap, frame * GK_FRAME, sy, GK_FRAME, GK_FRAME, wx + 2, wy - 4, 28, 32);
          // Name label
          ctx.font = '600 9px Inter, sans-serif';
          ctx.textAlign = 'center';
          const lbl = 'Willow';
          const lm = ctx.measureText(lbl);
          ctx.fillStyle = 'rgba(0,0,0,0.55)';
          ctx.beginPath();
          ctx.roundRect(wx + 16 - lm.width / 2 - 4, wy + TILE_SIZE + 2, lm.width + 8, 13, 3);
          ctx.fill();
          const witchDist = Math.sqrt((px - SV_WITCH_POS.x) ** 2 + (py - SV_WITCH_POS.y) ** 2);
          ctx.fillStyle = witchDist < SV_WITCH_RANGE ? '#c080e0' : 'rgba(200,160,255,0.85)';
          ctx.fillText(lbl, wx + 16, wy + TILE_SIZE + 12);
          // [E] prompt when near
          if (witchDist < SV_WITCH_RANGE) {
            ctx.fillStyle = '#c080e0';
            ctx.font = 'bold 10px Inter, sans-serif';
            ctx.fillText('[E]', wx + 16, wy - 8);
          }
        }});

        // ── Village ambient wanderers (GuttyKreum tilemap) ──
        for (const vw of villageWanderersRef.current) {
          allDrawables.push({ y: vw.y, fn: () => {
            const vx = vw.x * TILE_SIZE;
            const vy = vw.y * TILE_SIZE;
            const charIdx = GK_CHAR_INDEX[vw.charKey] ?? 0;
            const dirRow = GK_DIR_ROW[vw.facing];
            const frame = vw.idleTimer > 0 ? 0 : Math.floor(vw.animFrame) % GK_COLS;
            const sx = frame * GK_FRAME;
            const sy = (charIdx * 4 + dirRow) * GK_FRAME;
            // Shadow
            ctx.fillStyle = 'rgba(0,0,0,0.15)';
            ctx.beginPath();
            ctx.ellipse(vx + 16, vy + TILE_SIZE - 2, 8, 3, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.drawImage(ga.npcTilemap, sx, sy, GK_FRAME, GK_FRAME, vx + 2, vy - 4, 28, 32);
            // Name label when near
            const vdist = Math.sqrt((px - vw.x) ** 2 + (py - vw.y) ** 2);
            if (vdist < 4) {
              ctx.font = '600 8px Inter, sans-serif';
              ctx.textAlign = 'center';
              const nm = ctx.measureText(vw.name);
              ctx.fillStyle = 'rgba(0,0,0,0.5)';
              ctx.beginPath();
              ctx.roundRect(vx + 16 - nm.width / 2 - 3, vy + TILE_SIZE, nm.width + 6, 11, 3);
              ctx.fill();
              ctx.fillStyle = vdist < 2.5 ? '#90d090' : 'rgba(255,255,255,0.75)';
              ctx.fillText(vw.name, vx + 16, vy + TILE_SIZE + 8);
            }
          }});
        }

        // ── Village bandits (hostile, orc sprites) ──
        for (const b of svBanditsRef.current) {
          allDrawables.push({ y: b.y, fn: () => {
            const bPx = b.x * TILE_SIZE;
            const bPy = b.y * TILE_SIZE;
            const isW = b.kind === 'warrior';
            const fw = isW ? GL_ORC_W_FW : GL_ORC_M_FW;
            const fh = isW ? GL_ORC_W_FH : GL_ORC_M_FH;

            let bImg: HTMLImageElement;
            let frameCount: number;
            let currentFrame: number;

            switch (b.state) {
              case 'idle': case 'chase':
                bImg = isW ? (b.variant === 1 ? ga.glOrcWarrior : ga.glOrcWarrior2) : ga.glOrcMage;
                frameCount = isW ? GL_ORC_W_FRAMES : GL_ORC_M_FRAMES;
                currentFrame = Math.floor(b.animFrame) % frameCount;
                break;
              case 'attack':
                bImg = isW
                  ? (b.variant === 1 ? ga.glOrcWarriorAtk : ga.glOrcWarrior2Atk)
                  : ga.glOrcMageAtk;
                frameCount = isW ? GL_ORC_W_ATK_FRAMES : GL_ORC_M_ATK_FRAMES;
                currentFrame = Math.floor(b.animFrame) % frameCount;
                break;
              case 'hurt':
                bImg = isW
                  ? (b.variant === 1 ? ga.glOrcWarriorHurt : ga.glOrcWarrior2Hurt)
                  : ga.glOrcMageHurt;
                frameCount = isW ? GL_ORC_W_HURT_FRAMES : GL_ORC_M_HURT_FRAMES;
                currentFrame = Math.min(Math.floor(b.stateTimer * 12), frameCount - 1);
                break;
              case 'dead':
                bImg = isW
                  ? (b.variant === 1 ? ga.glOrcWarriorDeath : ga.glOrcWarrior2Death)
                  : ga.glOrcMageDeath;
                frameCount = isW ? GL_ORC_W_DEATH_FRAMES : GL_ORC_M_DEATH_FRAMES;
                currentFrame = Math.min(Math.floor(b.deathFrame), frameCount - 1);
                break;
            }

            // Shadow (alive only)
            if (b.state !== 'dead') {
              ctx.fillStyle = 'rgba(0,0,0,0.15)';
              ctx.beginPath();
              ctx.ellipse(bPx + 16, bPy + TILE_SIZE + 2, 14, 5, 0, 0, Math.PI * 2);
              ctx.fill();
            }

            // Sprite with flip
            ctx.save();
            if (b.facing === 'left') {
              ctx.translate(bPx + 16, 0);
              ctx.scale(-1, 1);
              ctx.drawImage(bImg, currentFrame * fw, 0, fw, fh, -40, bPy - 48, 80, 80);
            } else {
              ctx.drawImage(bImg, currentFrame * fw, 0, fw, fh, bPx - 24, bPy - 48, 80, 80);
            }
            ctx.restore();

            // Red flash on hurt
            if (b.hurtTimer > 0 && b.state !== 'dead') {
              ctx.globalAlpha = b.hurtTimer * 2;
              ctx.fillStyle = 'rgba(255,0,0,0.3)';
              ctx.fillRect(bPx - 24, bPy - 48, 80, 80);
              ctx.globalAlpha = 1;
            }

            // HP bar (alive and damaged)
            if (b.state !== 'dead' && b.hp < b.maxHp) {
              const barW = 40, barH = 4;
              const barX = bPx + 16 - barW / 2;
              const barY = bPy - 54;
              ctx.fillStyle = 'rgba(0,0,0,0.6)';
              ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);
              ctx.fillStyle = '#222';
              ctx.fillRect(barX, barY, barW, barH);
              const hpPct = b.hp / b.maxHp;
              ctx.fillStyle = hpPct > 0.3 ? '#c04040' : '#ff2020';
              ctx.fillRect(barX, barY, barW * hpPct, barH);
            }

            // Name label (alive only)
            if (b.state !== 'dead') {
              const lbl = b.kind === 'mage' ? 'Bandit Mage'
                : b.variant === 1 ? 'Bandit' : 'Bandit Brute';
              ctx.font = '600 9px Inter, sans-serif';
              ctx.textAlign = 'center';
              const lm = ctx.measureText(lbl);
              ctx.fillStyle = 'rgba(0,0,0,0.5)';
              ctx.beginPath();
              ctx.roundRect(bPx + 16 - lm.width / 2 - 4, bPy + TILE_SIZE + 10, lm.width + 8, 12, 3);
              ctx.fill();
              ctx.fillStyle = b.kind === 'mage' ? 'rgba(160,80,200,0.8)' : 'rgba(220,100,80,0.8)';
              ctx.fillText(lbl, bPx + 16, bPy + TILE_SIZE + 19);
            }
          }});
        }

        // Sparkle effect at unsearched quest spots
        if (svQuestRef.current.stage === 'searching') {
          for (let si = 0; si < SV_SEARCH_SPOTS.length; si++) {
            if (svQuestRef.current.searched[si]) continue;
            const spot = SV_SEARCH_SPOTS[si];
            allDrawables.push({ y: spot.y, fn: () => {
              const sx = spot.x * TILE_SIZE + 16;
              const sy = spot.y * TILE_SIZE + 8;
              const sparkle = Math.sin(t * 5 + si * 2) * 0.3 + 0.7;
              ctx.globalAlpha = sparkle;
              ctx.fillStyle = '#ffe060';
              for (let i = 0; i < 3; i++) {
                const angle = t * 2 + i * 2.1;
                const sr = 6 + Math.sin(t * 3 + i) * 3;
                ctx.beginPath();
                ctx.arc(sx + Math.cos(angle) * sr, sy + Math.sin(angle) * sr, 2, 0, Math.PI * 2);
                ctx.fill();
              }
              ctx.globalAlpha = 1;
              // [E] label
              const sDist = Math.sqrt((px - spot.x) ** 2 + (py - spot.y) ** 2);
              if (sDist < 2.5) {
                ctx.fillStyle = '#ffe060';
                ctx.font = 'bold 10px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('[E] Search', sx, sy - 12);
              }
            }});
          }
        }

        // Reward chest at waterfront (35, 17)
        if (svQuestRef.current.stage === 'returned' || svQuestRef.current.stage === 'complete') {
          allDrawables.push({ y: 17, fn: () => {
            const cx = 35 * TILE_SIZE;
            const cy = 17 * TILE_SIZE;
            if (!svChestOpenedRef.current) {
              // Closed chest — golden glow
              ctx.fillStyle = '#a07030';
              ctx.fillRect(cx + 4, cy + 8, 24, 16);
              ctx.fillStyle = '#c8a040';
              ctx.fillRect(cx + 6, cy + 10, 20, 12);
              ctx.fillStyle = '#e8c060';
              ctx.fillRect(cx + 12, cy + 6, 8, 4);
              // Glow
              const glow = Math.sin(t * 3) * 0.15 + 0.3;
              ctx.fillStyle = `rgba(232,192,96,${glow})`;
              ctx.beginPath();
              ctx.arc(cx + 16, cy + 14, 18, 0, Math.PI * 2);
              ctx.fill();
              const cDist = Math.sqrt((px - 35) ** 2 + (py - 17) ** 2);
              if (cDist < 2.5) {
                ctx.fillStyle = '#e8c86a';
                ctx.font = 'bold 10px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('[E] Open', cx + 16, cy - 4);
              }
            } else {
              // Opened chest
              ctx.fillStyle = '#806030';
              ctx.fillRect(cx + 4, cy + 8, 24, 16);
              ctx.fillStyle = '#a08040';
              ctx.fillRect(cx + 6, cy + 4, 20, 8);
            }
          }});
        }

        // ── Animated campfire (first-frame looped) ──
        allDrawables.push({ y: 12, fn: () => {
          const frame = Math.floor(t * 6) % 6;
          ctx.drawImage(ga.campfire, frame * 52, 0, 52, 48,
            15 * TILE_SIZE + 8, 11 * TILE_SIZE + 10, 52 * 0.7, 48 * 0.7);
        }});

        // ── Animated well ──
        allDrawables.push({ y: 7, fn: () => {
          const frame = Math.floor(t * 3) % 6;
          ctx.drawImage(ga.well, frame * 78, 0, 78, 68,
            18 * TILE_SIZE - 8, 6 * TILE_SIZE + 8, 78 * 0.8, 68 * 0.8);
        }});

      } else {
        const t = timeRef.current;

        // Vendor NPC (animated)
        allDrawables.push({ y: GL_VENDOR_POS.y, fn: () => {
          const frame = Math.floor(t * 4) % 8;
          ctx.fillStyle = 'rgba(0,0,0,0.12)';
          ctx.beginPath();
          ctx.ellipse(GL_VENDOR_POS.x * TILE_SIZE + 16, GL_VENDOR_POS.y * TILE_SIZE + TILE_SIZE - 2, 10, 4, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.drawImage(ga.glVendor, frame * GL_VENDOR_FW, 0, GL_VENDOR_FW, GL_VENDOR_FH,
            GL_VENDOR_POS.x * TILE_SIZE - 16, GL_VENDOR_POS.y * TILE_SIZE - 48, 64, 64);
          ctx.font = '600 10px Inter, sans-serif';
          ctx.textAlign = 'center';
          const lbl = 'Traveling Vendor';
          const lm = ctx.measureText(lbl);
          ctx.fillStyle = 'rgba(0,0,0,0.55)';
          ctx.beginPath();
          ctx.roundRect(GL_VENDOR_POS.x * TILE_SIZE + 16 - lm.width / 2 - 5, GL_VENDOR_POS.y * TILE_SIZE + TILE_SIZE + 8, lm.width + 10, 14, 3);
          ctx.fill();
          ctx.fillStyle = vendorDist < MERCHANT_RANGE ? '#e8c86a' : 'rgba(255,255,255,0.85)';
          ctx.fillText(lbl, GL_VENDOR_POS.x * TILE_SIZE + 16, GL_VENDOR_POS.y * TILE_SIZE + TILE_SIZE + 19);
          if (vendorDist < MERCHANT_RANGE) {
            ctx.strokeStyle = '#e8c86a';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(GL_VENDOR_POS.x * TILE_SIZE + 16, GL_VENDOR_POS.y * TILE_SIZE + 16, TILE_SIZE / 2 + 8, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = '#e8c86a';
            ctx.font = 'bold 10px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('[E]', GL_VENDOR_POS.x * TILE_SIZE + 16, GL_VENDOR_POS.y * TILE_SIZE - 16);
          }
        }});

        // ── Orcs (dynamic, state-based combat rendering) ──
        for (const orc of orcsRef.current) {
          allDrawables.push({ y: orc.y, fn: () => {
            const orcPx = orc.x * TILE_SIZE;
            const orcPy = orc.y * TILE_SIZE;
            const isW = orc.kind === 'warrior';
            const fw = isW ? GL_ORC_W_FW : GL_ORC_M_FW;
            const fh = isW ? GL_ORC_W_FH : GL_ORC_M_FH;

            let orcImg: HTMLImageElement;
            let frameCount: number;
            let currentFrame: number;

            switch (orc.state) {
              case 'idle': case 'chase':
                orcImg = isW ? (orc.variant === 1 ? ga.glOrcWarrior : ga.glOrcWarrior2) : ga.glOrcMage;
                frameCount = isW ? GL_ORC_W_FRAMES : GL_ORC_M_FRAMES;
                currentFrame = Math.floor(orc.animFrame) % frameCount;
                break;
              case 'attack':
                orcImg = isW
                  ? (orc.variant === 1 ? ga.glOrcWarriorAtk : ga.glOrcWarrior2Atk)
                  : ga.glOrcMageAtk;
                frameCount = isW ? GL_ORC_W_ATK_FRAMES : GL_ORC_M_ATK_FRAMES;
                currentFrame = Math.floor(orc.animFrame) % frameCount;
                break;
              case 'hurt':
                orcImg = isW
                  ? (orc.variant === 1 ? ga.glOrcWarriorHurt : ga.glOrcWarrior2Hurt)
                  : ga.glOrcMageHurt;
                frameCount = isW ? GL_ORC_W_HURT_FRAMES : GL_ORC_M_HURT_FRAMES;
                currentFrame = Math.min(Math.floor(orc.stateTimer * 12), frameCount - 1);
                break;
              case 'dead':
                orcImg = isW
                  ? (orc.variant === 1 ? ga.glOrcWarriorDeath : ga.glOrcWarrior2Death)
                  : ga.glOrcMageDeath;
                frameCount = isW ? GL_ORC_W_DEATH_FRAMES : GL_ORC_M_DEATH_FRAMES;
                currentFrame = Math.min(Math.floor(orc.deathFrame), frameCount - 1);
                break;
            }

            // Shadow (alive only)
            if (orc.state !== 'dead') {
              ctx.fillStyle = 'rgba(0,0,0,0.15)';
              ctx.beginPath();
              ctx.ellipse(orcPx + 16, orcPy + TILE_SIZE + 2, 14, 5, 0, 0, Math.PI * 2);
              ctx.fill();
            }

            // Flip for facing (sprites face right by default)
            ctx.save();
            if (orc.facing === 'left') {
              ctx.translate(orcPx + 16, 0);
              ctx.scale(-1, 1);
              ctx.drawImage(orcImg, currentFrame * fw, 0, fw, fh, -40, orcPy - 48, 80, 80);
            } else {
              ctx.drawImage(orcImg, currentFrame * fw, 0, fw, fh, orcPx - 24, orcPy - 48, 80, 80);
            }
            ctx.restore();

            // Red flash on hurt
            if (orc.hurtTimer > 0 && orc.state !== 'dead') {
              ctx.globalAlpha = orc.hurtTimer * 2;
              ctx.fillStyle = 'rgba(255,0,0,0.3)';
              ctx.fillRect(orcPx - 24, orcPy - 48, 80, 80);
              ctx.globalAlpha = 1;
            }

            // HP bar (only if alive and damaged)
            if (orc.state !== 'dead' && orc.hp < orc.maxHp) {
              const barW = 40, barH = 4;
              const barX = orcPx + 16 - barW / 2;
              const barY = orcPy - 54;
              ctx.fillStyle = 'rgba(0,0,0,0.6)';
              ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);
              ctx.fillStyle = '#222';
              ctx.fillRect(barX, barY, barW, barH);
              const hpPct = orc.hp / orc.maxHp;
              ctx.fillStyle = hpPct > 0.3 ? '#c04040' : '#ff2020';
              ctx.fillRect(barX, barY, barW * hpPct, barH);
            }

            // Name label (alive only)
            if (orc.state !== 'dead') {
              const lbl = orc.kind === 'mage' ? 'Orc Shaman'
                : orc.variant === 1 ? 'Orc Warrior' : 'Orc Grunt';
              ctx.font = '600 9px Inter, sans-serif';
              ctx.textAlign = 'center';
              const lm = ctx.measureText(lbl);
              ctx.fillStyle = 'rgba(0,0,0,0.5)';
              ctx.beginPath();
              ctx.roundRect(orcPx + 16 - lm.width / 2 - 4, orcPy + TILE_SIZE + 10, lm.width + 8, 12, 3);
              ctx.fill();
              ctx.fillStyle = orc.kind === 'mage' ? 'rgba(160,80,200,0.8)' : 'rgba(220,100,80,0.8)';
              ctx.fillText(lbl, orcPx + 16, orcPy + TILE_SIZE + 19);
            }
          }});
        }

        // Campfires (animated — vendor camp + orc camp)
        [{ x: 39, y: 48 }, { x: 40, y: 14 }, { x: 36, y: 11 }].forEach(pos => {
          allDrawables.push({ y: pos.y, fn: () => {
            const frame = Math.floor(t * 6) % GL_FIRE_FRAMES;
            ctx.drawImage(ga.glCampfire, frame * GL_FIRE_FW, 0, GL_FIRE_FW, GL_FIRE_FH,
              pos.x * TILE_SIZE - 24, pos.y * TILE_SIZE - 36, 80, 80);
          }});
        });

        // Enemy flags (animated — on stronghold walls, mix of 2 variants)
        [{ x: 33, y: 17, v: 1 }, { x: 47, y: 17, v: 2 }, { x: 40, y: 7, v: 1 }, { x: 36, y: 9, v: 2 }, { x: 44, y: 9, v: 1 },
         { x: 32, y: 8, v: 2 }, { x: 48, y: 8, v: 1 }].forEach(pos => {
          allDrawables.push({ y: pos.y, fn: () => {
            if (pos.v === 1) {
              const frame = Math.floor(t * 8) % GL_FLAG_FRAMES;
              ctx.drawImage(ga.glEnemyFlag, frame * GL_FLAG_FW, 0, GL_FLAG_FW, GL_FLAG_FH,
                pos.x * TILE_SIZE - 8, pos.y * TILE_SIZE - 36, 48, 64);
            } else {
              const frame = Math.floor(t * 7) % GL_FLAG2_FRAMES;
              ctx.drawImage(ga.glEnemyFlag2, frame * GL_FLAG2_FW, 0, GL_FLAG2_FW, GL_FLAG2_FH,
                pos.x * TILE_SIZE - 8, pos.y * TILE_SIZE - 36, 48, 64);
            }
          }});
        });

        // ── Ambient creatures ──

        // Birds (idle animation in grassy areas)
        [{ x: 28, y: 25 }, { x: 52, y: 40 }, { x: 15, y: 45 }, { x: 55, y: 50 }, { x: 25, y: 42 }].forEach((pos, i) => {
          allDrawables.push({ y: pos.y, fn: () => {
            const frame = Math.floor(t * 2 + i * 3) % GL_BIRD_FRAMES;
            ctx.drawImage(ga.glBird, frame * GL_BIRD_FW, 0, GL_BIRD_FW, GL_BIRD_FH,
              pos.x * TILE_SIZE - 8, pos.y * TILE_SIZE - 8, 32, 32);
          }});
        });

        // Ducks (near stream and pond)
        [{ x: 30, y: 34 }, { x: 50, y: 34 }, { x: 17, y: 38 }].forEach((pos, i) => {
          allDrawables.push({ y: pos.y, fn: () => {
            const frame = Math.floor(t * 1.5 + i * 4) % GL_DUCK_FRAMES;
            ctx.drawImage(ga.glDuck, frame * GL_DUCK_FW, 0, GL_DUCK_FW, GL_DUCK_FH,
              pos.x * TILE_SIZE - 8, pos.y * TILE_SIZE - 6, 32, 32);
          }});
        });

        // Frogs (near water/shore)
        [{ x: 35, y: 33 }, { x: 45, y: 35 }, { x: 19, y: 37 }, { x: 16, y: 39 }].forEach((pos, i) => {
          allDrawables.push({ y: pos.y, fn: () => {
            const frame = Math.floor(t * 1.2 + i * 5) % GL_FROG_FRAMES;
            ctx.drawImage(ga.glFrog, frame * GL_FROG_FW, 0, GL_FROG_FW, GL_FROG_FH,
              pos.x * TILE_SIZE - 4, pos.y * TILE_SIZE - 4, 28, 28);
          }});
        });

        // Butterflies (animated near clearing and flowers)
        [{ x: 22, y: 30 }, { x: 18, y: 33 }, { x: 30, y: 40 }, { x: 45, y: 45 }].forEach((pos, i) => {
          allDrawables.push({ y: pos.y - 1, fn: () => {
            const frame = Math.floor(t * 5 + i * 2) % GL_BUTTERFLY_FRAMES;
            const hover = Math.sin(t * 2 + i) * 4;
            ctx.drawImage(ga.glButterfly, frame * GL_BUTTERFLY_FW, 0, GL_BUTTERFLY_FW, GL_BUTTERFLY_FH,
              pos.x * TILE_SIZE - 12, pos.y * TILE_SIZE - 24 + hover, 40, 28);
          }});
        });

        // Chimney smoke from vendor cabin
        allDrawables.push({ y: 43, fn: () => {
          const frame = Math.floor(t * 4) % GL_CHIMNEY_FRAMES;
          ctx.drawImage(ga.glChimneySmoke, frame * GL_CHIMNEY_FW, 0, GL_CHIMNEY_FW, GL_CHIMNEY_FH,
            44 * TILE_SIZE + 8, 44 * TILE_SIZE - 28, 32, 32);
        }});

        // Animated lamp posts at key positions (replace static)
        [{ x: 39, y: 42 }, { x: 41, y: 42 }, { x: 39, y: 26 }].forEach(pos => {
          allDrawables.push({ y: pos.y, fn: () => {
            const frame = Math.floor(t * 3) % GL_ANIM_LAMP_FRAMES;
            ctx.drawImage(ga.glAnimLamp, frame * GL_ANIM_LAMP_FW, 0, GL_ANIM_LAMP_FW, GL_ANIM_LAMP_FH,
              pos.x * TILE_SIZE - 8, pos.y * TILE_SIZE - 36, 48, 56);
          }});
        });

        // Campfire smoke above each campfire
        [{ x: 39, y: 48 }, { x: 40, y: 14 }, { x: 36, y: 11 }].forEach(pos => {
          allDrawables.push({ y: pos.y - 1, fn: () => {
            const frame = Math.floor(t * 5) % GL_CAMPFIRE_SMOKE_FRAMES;
            ctx.globalAlpha = 0.6;
            ctx.drawImage(ga.glCampfireSmoke, frame * GL_CAMPFIRE_SMOKE_FW, 0, GL_CAMPFIRE_SMOKE_FW, GL_CAMPFIRE_SMOKE_FH,
              pos.x * TILE_SIZE - 4, pos.y * TILE_SIZE - 32, 40, 40);
            ctx.globalAlpha = 1;
          }});
        });

        // Flies near pond and stream (buzzing insects)
        [{ x: 17, y: 37 }, { x: 19, y: 39 }, { x: 32, y: 34 }, { x: 48, y: 34 }].forEach((pos, i) => {
          allDrawables.push({ y: pos.y, fn: () => {
            const frame = Math.floor(t * 8 + i * 4) % GL_FLIES_FRAMES;
            ctx.globalAlpha = 0.7;
            ctx.drawImage(ga.glFlies, frame * GL_FLIES_FW, 0, GL_FLIES_FW, GL_FLIES_FH,
              pos.x * TILE_SIZE - 12, pos.y * TILE_SIZE - 16 + Math.sin(t * 3 + i) * 3, 40, 40);
            ctx.globalAlpha = 1;
          }});
        });

        // Nature particles near shrine and clearing (ambient sparkle)
        [{ x: 40, y: 11 }, { x: 20, y: 31 }, { x: 60, y: 27 }].forEach((pos, i) => {
          allDrawables.push({ y: pos.y - 1, fn: () => {
            const frame = Math.floor(t * 3 + i * 5) % GL_NATURE_FRAMES;
            ctx.globalAlpha = 0.5;
            ctx.drawImage(ga.glNatureParticles, frame * GL_NATURE_FW, 0, GL_NATURE_FW, GL_NATURE_FH,
              pos.x * TILE_SIZE - 16, pos.y * TILE_SIZE - 24 + Math.sin(t * 1.5 + i) * 2, 56, 56);
            ctx.globalAlpha = 1;
          }});
        });

        // ── Grassland sheep ──
        for (const sheep of ambientSheepRef.current) {
          if (sheep.zone !== 'grassland') continue;
          allDrawables.push({ y: sheep.y, fn: () => {
            const spx = sheep.x * TILE_SIZE;
            const spy = sheep.y * TILE_SIZE;
            const img = sheep.variant === 'white' ? ga.sheepWhite : ga.sheepBrown;
            const frame = Math.floor(sheep.animFrame) % SHEEP_COLS;
            ctx.drawImage(img, frame * SHEEP_FW, 0, SHEEP_FW, SHEEP_FH, spx - 16, spy - 8, 64, 32);
          }});
        }

        // ── Warrior guards near zone entrance ──
        for (const guard of warriorGuardsRef.current) {
          if (guard.zone !== 'grassland') continue;
          allDrawables.push({ y: guard.y, fn: () => {
            const gx = guard.x * TILE_SIZE;
            const gy = guard.y * TILE_SIZE;
            // Use frame 0 (idle standing pose)
            ctx.save();
            if (guard.facing === 'left') {
              ctx.translate(gx + WARRIOR_FW / 2, 0);
              ctx.scale(-1, 1);
              ctx.drawImage(ga.warriorRun, 0, 0, WARRIOR_FW, WARRIOR_FH, -WARRIOR_FW / 2 - 4, gy - 32, 32, 56);
            } else {
              ctx.drawImage(ga.warriorRun, 0, 0, WARRIOR_FW, WARRIOR_FH, gx - 4, gy - 32, 32, 56);
            }
            ctx.restore();
            // Label
            ctx.font = '600 8px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.beginPath();
            const lbl = guard.name;
            const lm = ctx.measureText(lbl);
            ctx.roundRect(gx + 12 - lm.width / 2 - 3, gy + 28, lm.width + 6, 11, 3);
            ctx.fill();
            ctx.fillStyle = 'rgba(100,180,255,0.9)';
            ctx.fillText(lbl, gx + 12, gy + 36);
          }});
        }

        // ── Reward Chest at Ancient Shrine ──
        const missionDone = orcsKilledRef.current >= 7;
        const chestX = 42, chestY = 12;
        const chestPx = chestX * TILE_SIZE, chestPy = chestY * TILE_SIZE;
        const chestPlayerDist = Math.sqrt((p.x - chestX) ** 2 + (p.y - chestY) ** 2);

        if (!missionDone) {
          // Locked chest — static, with lock indicator
          allDrawables.push({ y: chestY, fn: () => {
            ctx.drawImage(ga.glChestClose, 0, 0, GL_CHEST_CLOSE_FW, GL_CHEST_CLOSE_FH,
              chestPx - 16, chestPy - 24, 64, 64);
            // Lock icon
            ctx.font = '600 9px Inter, sans-serif'; ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.beginPath();
            ctx.roundRect(chestPx + 16 - 28, chestPy + 40, 56, 14, 3); ctx.fill();
            ctx.fillStyle = 'rgba(180,140,80,0.6)';
            ctx.fillText('Locked', chestPx + 16, chestPy + 50);
          }});
        } else if (!glRewardGivenRef.current) {
          // Unlocked chest — pulsing golden glow + [E] prompt
          allDrawables.push({ y: chestY, fn: () => {
            // Pulsing glow
            const pulse = 0.3 + Math.sin(t * 4) * 0.15;
            ctx.fillStyle = `rgba(230,200,100,${pulse})`;
            ctx.beginPath(); ctx.arc(chestPx + 16, chestPy + 8, 36, 0, Math.PI * 2); ctx.fill();
            ctx.drawImage(ga.glChestClose, 0, 0, GL_CHEST_CLOSE_FW, GL_CHEST_CLOSE_FH,
              chestPx - 16, chestPy - 24, 64, 64);
            // Sparkle dots
            for (let si = 0; si < 6; si++) {
              const angle = t * 2 + si * (Math.PI / 3);
              const sr = 24 + Math.sin(t * 3 + si) * 8;
              ctx.fillStyle = `rgba(255,230,120,${0.5 + Math.sin(t * 5 + si) * 0.3})`;
              ctx.beginPath();
              ctx.arc(chestPx + 16 + Math.cos(angle) * sr, chestPy + 8 + Math.sin(angle) * sr, 2, 0, Math.PI * 2);
              ctx.fill();
            }
            // [E] prompt when near
            if (chestPlayerDist < 3) {
              ctx.font = 'bold 11px Inter, sans-serif'; ctx.textAlign = 'center';
              ctx.fillStyle = '#e8c86a';
              ctx.fillText('[E] Open Chest', chestPx + 16, chestPy - 32);
            }
          }});
        } else if (glChestAnimRef.current < GL_CHEST_OPEN_FRAMES) {
          // Chest opening animation
          allDrawables.push({ y: chestY, fn: () => {
            const frame = Math.min(Math.floor(glChestAnimRef.current), GL_CHEST_OPEN_FRAMES - 1);
            ctx.fillStyle = 'rgba(230,200,100,0.2)';
            ctx.beginPath(); ctx.arc(chestPx + 16, chestPy + 8, 32, 0, Math.PI * 2); ctx.fill();
            ctx.drawImage(ga.glChestOpen, frame * GL_CHEST_OPEN_FW, 0, GL_CHEST_OPEN_FW, GL_CHEST_OPEN_FH,
              chestPx - 16, chestPy - 24, 64, 64);
            // Gold burst text
            ctx.font = 'bold 14px Inter, sans-serif'; ctx.textAlign = 'center';
            ctx.fillStyle = '#e8c86a';
            const rise = Math.min(1, glChestAnimRef.current / 3) * 20;
            ctx.globalAlpha = Math.max(0, 1 - glChestAnimRef.current / GL_CHEST_OPEN_FRAMES);
            ctx.fillText('+75 Gold!', chestPx + 16, chestPy - 30 - rise);
            ctx.globalAlpha = 1;
          }});
        } else {
          // Chest fully open — done
          allDrawables.push({ y: chestY, fn: () => {
            ctx.drawImage(ga.glChestOpen, (GL_CHEST_OPEN_FRAMES - 1) * GL_CHEST_OPEN_FW, 0, GL_CHEST_OPEN_FW, GL_CHEST_OPEN_FH,
              chestPx - 16, chestPy - 24, 64, 64);
            ctx.font = '600 9px Inter, sans-serif'; ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.beginPath();
            ctx.roundRect(chestPx + 16 - 24, chestPy + 40, 48, 14, 3); ctx.fill();
            ctx.fillStyle = 'rgba(120,200,80,0.8)';
            ctx.fillText('Claimed', chestPx + 16, chestPy + 50);
          }});
        }

        // ── Loot sparkle indicators at uncollected stashes ──
        const lootSpots = [
          { id: 'cart', x: 18, y: 9, label: 'Search [E]' },
          { id: 'cave', x: 61, y: 23, label: 'Search [E]' },
          { id: 'overlook', x: 59, y: 29, label: 'Search [E]' },
        ];
        lootSpots.forEach(spot => {
          if (glLootCollected.current.has(spot.id)) return;
          const ld = Math.sqrt((p.x - spot.x) ** 2 + (p.y - spot.y) ** 2);
          allDrawables.push({ y: spot.y, fn: () => {
            // Sparkle
            const spark = 0.4 + Math.sin(t * 5) * 0.2;
            ctx.fillStyle = `rgba(255,220,80,${spark})`;
            ctx.beginPath();
            ctx.arc(spot.x * TILE_SIZE + 16, spot.y * TILE_SIZE + 8, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = `rgba(255,250,200,${spark + 0.2})`;
            ctx.beginPath();
            ctx.arc(spot.x * TILE_SIZE + 16, spot.y * TILE_SIZE + 8, 3, 0, Math.PI * 2);
            ctx.fill();
            if (ld < 3) {
              ctx.font = 'bold 9px Inter, sans-serif'; ctx.textAlign = 'center';
              ctx.fillStyle = '#e8c86a';
              ctx.fillText(spot.label, spot.x * TILE_SIZE + 16, spot.y * TILE_SIZE - 8);
            }
          }});
        });

        // ── Cave entrance [E] prompt ──
        if (!glCaveInspected.current) {
          const caveDist = Math.sqrt((p.x - 62) ** 2 + (p.y - 22) ** 2);
          if (caveDist < 3) {
            allDrawables.push({ y: 21, fn: () => {
              ctx.font = 'bold 10px Inter, sans-serif'; ctx.textAlign = 'center';
              ctx.fillStyle = '#c0a0e0';
              ctx.fillText('[E] Inspect', 62 * TILE_SIZE + 16, 22 * TILE_SIZE - 36);
            }});
          }
        }
      }

      // ── Gold coin sparkles (all zones) ──
      const coinZone = zoneRef.current;
      const ct = timeRef.current;
      for (const coin of GOLD_COINS) {
        if (coin.zone !== coinZone) continue;
        if (coinsCollectedRef.current.has(coin.id)) continue;
        const cx = coin.x * TILE_SIZE + 16;
        const baseY = coin.y * TILE_SIZE + 8;
        const coinDist = Math.sqrt((p.x - coin.x) ** 2 + (p.y - coin.y) ** 2);
        allDrawables.push({ y: coin.y, fn: () => {
          const bounce = Math.sin(ct * 3 + coin.x * 0.7) * 3;
          const cy = baseY + bounce;
          const glow = 0.55 + Math.sin(ct * 4 + coin.x) * 0.25;
          // Pulsing ring (expanding circle every 2s)
          const ringPhase = (ct * 0.5 + coin.x * 0.3) % 1;
          const ringRadius = 8 + ringPhase * 14;
          const ringAlpha = (1 - ringPhase) * 0.3;
          ctx.strokeStyle = `rgba(255,220,80,${ringAlpha})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
          ctx.stroke();
          // Outer glow (bigger, brighter)
          ctx.fillStyle = `rgba(255,220,80,${glow * 0.5})`;
          ctx.beginPath();
          ctx.arc(cx, cy, 12, 0, Math.PI * 2);
          ctx.fill();
          // Mid glow
          ctx.fillStyle = `rgba(255,230,100,${glow * 0.7})`;
          ctx.beginPath();
          ctx.arc(cx, cy, 7, 0, Math.PI * 2);
          ctx.fill();
          // Inner bright coin
          ctx.fillStyle = `rgba(255,245,180,${Math.min(1, glow + 0.3)})`;
          ctx.beginPath();
          ctx.arc(cx, cy, 5, 0, Math.PI * 2);
          ctx.fill();
          // Coin "G" symbol
          ctx.fillStyle = `rgba(180,140,40,${glow})`;
          ctx.font = 'bold 6px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('G', cx, cy + 2.5);
          // 3 orbiting sparkle particles
          for (let i = 0; i < 3; i++) {
            const angle = ct * 3 + i * (Math.PI * 2 / 3) + coin.y * 0.5;
            const sr = 8 + Math.sin(ct * 2 + i) * 3;
            ctx.fillStyle = `rgba(255,255,220,${0.5 + Math.sin(ct * 6 + i * 3) * 0.3})`;
            ctx.beginPath();
            ctx.arc(cx + Math.cos(angle) * sr, cy + Math.sin(angle) * sr, 2, 0, Math.PI * 2);
            ctx.fill();
          }
          // "G" label when player nearby
          if (coinDist < 4) {
            ctx.font = 'bold 8px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = `rgba(255,220,80,${0.6 + Math.sin(ct * 3) * 0.2})`;
            ctx.fillText(`+${coin.gold}G`, cx, cy - 14);
          }
        }});
      }

      // ── Forage spot indicators ──
      for (const spot of FORAGE_SPOTS) {
        if (spot.zone !== coinZone) continue;
        const cd = forageCooldownRef.current.get(spot.id) || 0;
        if (cd > 0) continue; // hide during cooldown
        const fx = spot.x * TILE_SIZE + 16;
        const fy = spot.y * TILE_SIZE + 8;
        const sDist = Math.sqrt((p.x - spot.x) ** 2 + (p.y - spot.y) ** 2);
        const isWood = spot.resource === 'wood';
        const glowColor = isWood ? [139, 108, 62] : [128, 128, 120];
        allDrawables.push({ y: spot.y, fn: () => {
          const pulse = 0.4 + Math.sin(ct * 2.5 + spot.x * 0.5) * 0.2;
          // Outer glow
          const grad = ctx.createRadialGradient(fx, fy, 0, fx, fy, 10);
          grad.addColorStop(0, `rgba(${glowColor[0]},${glowColor[1]},${glowColor[2]},${pulse})`);
          grad.addColorStop(1, `rgba(${glowColor[0]},${glowColor[1]},${glowColor[2]},0)`);
          ctx.fillStyle = grad;
          ctx.beginPath(); ctx.arc(fx, fy, 10, 0, Math.PI * 2); ctx.fill();
          // Inner dot
          ctx.fillStyle = `rgba(${glowColor[0]},${glowColor[1]},${glowColor[2]},${pulse + 0.2})`;
          ctx.beginPath(); ctx.arc(fx, fy, 3, 0, Math.PI * 2); ctx.fill();
          // "E Gather" label when close
          if (sDist < 3) {
            ctx.font = 'bold 8px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = `rgba(${glowColor[0]},${glowColor[1]},${glowColor[2]},0.8)`;
            ctx.fillText(`[E] ${isWood ? 'Chop' : 'Mine'}`, fx, fy - 12);
          }
        }});
      }

      // Draw local player
      allDrawables.push({ y: p.y, fn: () => {
        const px = p.x * TILE_SIZE;
        const py = p.y * TILE_SIZE;
        if (isOwnerRef.current) {
          // Owner uses the original character spritesheet
          drawPlayer(ctx, px, py, p, ga.character);
        } else {
          // Other players use chosen GuttyKreum character
          const charIdx = Math.max(0, chosenCharRef.current.charIndex) % 17;
          const dirMap: Record<string, number> = { down: 0, left: 1, right: 2, up: 3 };
          const dirRow = dirMap[p.facing] ?? 0;
          const frame = p.moving ? p.animFrame % GK_COLS : 0;
          const sx = frame * GK_FRAME;
          const sy = (charIdx * 4 + dirRow) * GK_FRAME;
          // Shadow
          ctx.fillStyle = 'rgba(0,0,0,0.18)';
          ctx.beginPath();
          ctx.ellipse(px + TILE_SIZE / 2, py + TILE_SIZE - 2, 10, 4, 0, 0, Math.PI * 2);
          ctx.fill();
          // Sprite (use hue-shifted canvas if available)
          const src = hueCanvasRef.current || ga.npcTilemap;
          ctx.drawImage(src, sx, sy, GK_FRAME, GK_FRAME, px + 2, py - 4, 28, 32);
        }
      }});

      // Player attack slash arc
      if (playerAtkAnimRef.current > 0 && zoneRef.current === 'grassland') {
        allDrawables.push({ y: p.y + 0.001, fn: () => {
          const progress = 1 - (playerAtkAnimRef.current / 0.35);
          const px = p.x * TILE_SIZE + TILE_SIZE / 2;
          const py = p.y * TILE_SIZE + TILE_SIZE / 2;
          const reach = TILE_SIZE * 1.5;
          let startA = 0, endA = 0, ox = 0, oy = 0;
          switch (p.facing) {
            case 'right': startA = -0.8; endA = 0.8; ox = 8; break;
            case 'left':  startA = Math.PI - 0.8; endA = Math.PI + 0.8; ox = -8; break;
            case 'down':  startA = Math.PI / 2 - 0.8; endA = Math.PI / 2 + 0.8; oy = 8; break;
            case 'up':    startA = -Math.PI / 2 - 0.8; endA = -Math.PI / 2 + 0.8; oy = -8; break;
          }
          const sweep = startA + (endA - startA) * progress;
          const r = reach * (0.5 + progress * 0.5);
          ctx.strokeStyle = `rgba(255,255,255,${0.8 - progress * 0.8})`;
          ctx.lineWidth = 3 - progress * 2;
          ctx.beginPath();
          ctx.arc(px + ox, py + oy, r, startA, sweep);
          ctx.stroke();
          const tipX = px + ox + Math.cos(sweep) * r;
          const tipY = py + oy + Math.sin(sweep) * r;
          ctx.fillStyle = `rgba(255,230,180,${0.6 - progress * 0.6})`;
          ctx.beginPath();
          ctx.arc(tipX, tipY, 4 - progress * 3, 0, Math.PI * 2);
          ctx.fill();
        }});
      }

      // Player hurt flash
      if (playerHurtFlashRef.current > 0) {
        allDrawables.push({ y: p.y + 0.002, fn: () => {
          ctx.globalAlpha = playerHurtFlashRef.current * 2;
          ctx.fillStyle = 'rgba(255,0,0,0.3)';
          ctx.fillRect(p.x * TILE_SIZE - 4, p.y * TILE_SIZE - 16, 40, 48);
          ctx.globalAlpha = 1;
        }});
      }

      // ── User-placed objects (all zones) ──
      for (const obj of placedObjectsRef.current) {
        if (obj.zone !== zoneRef.current || obj.itemType === '_fill') continue;
        const bItem = BUILD_ITEMS.find(b => b.id === obj.itemType);
        if (!bItem) continue;
        const { tw, th, dw, dh } = getRotatedDims(bItem, obj.rotation);
        allDrawables.push({ y: obj.tileY + th, fn: () => {
          const img = ga[bItem.spriteKey] as HTMLImageElement;
          if (!img) return;
          if (obj.rotation === 0) {
            const px = obj.tileX * TILE_SIZE + (tw * TILE_SIZE) / 2 - dw / 2;
            const py = (obj.tileY + th) * TILE_SIZE - dh;
            ctx.drawImage(img, px, py, dw, dh);
          } else {
            const cx = obj.tileX * TILE_SIZE + (tw * TILE_SIZE) / 2;
            const cy = (obj.tileY + th) * TILE_SIZE - dh / 2;
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(obj.rotation * Math.PI / 2);
            ctx.drawImage(img, -bItem.drawW / 2, -bItem.drawH / 2, bItem.drawW, bItem.drawH);
            ctx.restore();
          }
          // Chimney smoke for housing buildings (5+ buildings in zone)
          if (buildingCountRef.current >= 5 && (obj.itemType === 'cabin' || obj.itemType === 'large_house' || obj.itemType === 'manor' || obj.itemType === 'inn_lodge')) {
            const smokeImg = ga.glChimneySmoke;
            if (smokeImg) {
              const smokeFrames = Math.floor(smokeImg.width / 32) || 1;
              const smokeFrame = Math.floor(timeRef.current * 3) % smokeFrames;
              const sx = obj.tileX * TILE_SIZE + (tw * TILE_SIZE) / 2 - 4;
              const sy = obj.tileY * TILE_SIZE - dh + 4;
              ctx.globalAlpha = 0.5;
              ctx.drawImage(smokeImg, smokeFrame * 32, 0, 32, 32, sx, sy, 24, 24);
              ctx.globalAlpha = 1;
            }
          }
          // Income rate label when player walks near
          if (bItem.income) {
            const pdistLabel = Math.sqrt((p.x - obj.tileX - tw / 2) ** 2 + (p.y - obj.tileY - th / 2) ** 2);
            if (pdistLabel < 3) {
              const parts: string[] = [];
              if (bItem.income.gold) parts.push(`+${bItem.income.gold}G`);
              if (bItem.income.wood) parts.push(`+${bItem.income.wood}W`);
              if (bItem.income.stone) parts.push(`+${bItem.income.stone}S`);
              if (parts.length > 0) {
                const lx = obj.tileX * TILE_SIZE + (tw * TILE_SIZE) / 2;
                const ly = (obj.tileY + th) * TILE_SIZE + 8;
                ctx.font = '500 7px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillStyle = 'rgba(232,200,106,0.5)';
                ctx.fillText(parts.join(' ') + '/min', lx, ly);
              }
            }
          }
          // Income indicator: pulsing icon above building when resources ready
          if (bItem.income) {
            const acc = buildingIncomeRef.current.get(obj.id);
            const accG = acc ? Math.floor(acc.gold) : 0;
            const accW = acc ? Math.floor(acc.wood) : 0;
            const accS = acc ? Math.floor(acc.stone) : 0;
            if (accG > 0 || accW > 0 || accS > 0) {
              const icx = obj.tileX * TILE_SIZE + (tw * TILE_SIZE) / 2;
              const icy = obj.tileY * TILE_SIZE - 14 + Math.sin(timeRef.current * 3) * 2;
              const pulse = 0.7 + 0.3 * Math.sin(timeRef.current * 4);
              // Glow ring
              ctx.globalAlpha = pulse * 0.4;
              ctx.beginPath();
              ctx.arc(icx, icy, 8, 0, Math.PI * 2);
              ctx.fillStyle = accG > 0 ? 'rgba(232,200,106,0.4)' : accW > 0 ? 'rgba(139,108,62,0.4)' : 'rgba(128,128,120,0.4)';
              ctx.fill();
              ctx.globalAlpha = 1;
              // Pill bg
              const resLabel = accG > 0 ? `+${accG}G` : accW > 0 ? `+${accW}W` : `+${accS}S`;
              ctx.font = '600 7px Inter, sans-serif';
              const lw = ctx.measureText(resLabel).width;
              ctx.fillStyle = 'rgba(6,6,8,0.7)';
              ctx.beginPath();
              ctx.roundRect(icx - lw / 2 - 4, icy - 6, lw + 8, 12, 4);
              ctx.fill();
              ctx.fillStyle = accG > 0 ? '#e8c86a' : accW > 0 ? '#8b6c3e' : '#808078';
              ctx.textAlign = 'center';
              ctx.fillText(resLabel, icx, icy + 2);
              // "E" prompt if player is near
              const pdist = Math.sqrt((p.x - obj.tileX - 0.5) ** 2 + (p.y - obj.tileY - 0.5) ** 2);
              if (pdist < 3) {
                ctx.font = '600 8px Inter, sans-serif';
                ctx.fillStyle = 'rgba(232,200,106,0.8)';
                ctx.fillText('[E] Collect', icx, icy - 10);
              }
            }
          }
          // Functional effect indicators
          if (bItem.effect === 'heal_aura') {
            const pdist = Math.sqrt((p.x - obj.tileX - 0.5) ** 2 + (p.y - obj.tileY - 0.5) ** 2);
            if (pdist < 2.5) {
              const hx = obj.tileX * TILE_SIZE + (tw * TILE_SIZE) / 2;
              const hy = obj.tileY * TILE_SIZE - 6;
              ctx.font = '600 7px Inter, sans-serif';
              ctx.textAlign = 'center';
              ctx.fillStyle = `rgba(96,192,96,${0.4 + Math.sin(timeRef.current * 2) * 0.2})`;
              ctx.fillText('+HP', hx, hy);
            }
          }
        }});
      }

      // ── Multiplayer: render remote players ──
      for (const rp of mp.playersRef.current.values()) {
        if (rp.zone !== zoneRef.current) continue;
        const rpTileY = rp.y / TILE_SIZE;
        allDrawables.push({ y: rpTileY, fn: () => {
          const rpx = rp.x;
          const rpy = rp.y;
          const charIdx = rp.charIndex % 17;
          const dirRow = rp.dir; // 0=down,1=left,2=right,3=up
          const frame = rp.frame % GK_COLS;
          const sx = frame * GK_FRAME;
          const sy = (charIdx * 4 + dirRow) * GK_FRAME;
          // Shadow
          ctx.fillStyle = 'rgba(0,0,0,0.15)';
          ctx.beginPath();
          ctx.ellipse(rpx + 16, rpy + TILE_SIZE - 2, 8, 3, 0, 0, Math.PI * 2);
          ctx.fill();
          // Sprite (apply hue shift for remote players)
          const hasHue = rp.hueShift && rp.hueShift !== 0;
          if (hasHue) ctx.filter = `hue-rotate(${rp.hueShift}deg)`;
          ctx.drawImage(ga.npcTilemap, sx, sy, GK_FRAME, GK_FRAME, rpx + 2, rpy - 4, 28, 32);
          if (hasHue) ctx.filter = 'none';
          // Name label
          ctx.font = '600 7px Inter, sans-serif';
          ctx.textAlign = 'center';
          const nameWidth = ctx.measureText(rp.name).width;
          const nlx = rpx + 16;
          const nly = rpy - 12;
          ctx.fillStyle = 'rgba(0,0,0,0.55)';
          ctx.beginPath();
          ctx.roundRect(nlx - nameWidth / 2 - 4, nly - 7, nameWidth + 8, 12, 3);
          ctx.fill();
          ctx.fillStyle = '#80d0ff';
          ctx.fillText(rp.name, nlx, nly);
        }});
      }

      allDrawables.sort((a, b) => a.y - b.y);
      for (const d of allDrawables) d.fn();

      // ── Placement gizmo ──
      if (placementModeRef.current && placementItemRef.current) {
        const pItem = placementItemRef.current;
        const pPos = placementPosRef.current;
        const rot = placementRotRef.current;
        const { tw, th, dw, dh } = getRotatedDims(pItem, rot);
        const valid = isPlacementValid(pPos, pItem, rot);
        const now = Date.now();
        const pulse = 0.5 + Math.sin(now / 400) * 0.3;
        const flashActive = placementFlashRef.current > 0;

        // Footprint pixel bounds
        const fx = pPos.x * TILE_SIZE;
        const fy = pPos.y * TILE_SIZE;
        const fW = tw * TILE_SIZE;
        const fH = th * TILE_SIZE;
        const fcx = fx + fW / 2;
        const fcy = fy + fH / 2;

        // Color palette
        const baseR = valid ? 80 : 220;
        const baseG = valid ? 200 : 60;
        const baseB = valid ? 255 : 60;
        const hiR = valid ? 120 : 255;
        const hiG = valid ? 255 : 90;
        const hiB = valid ? 255 : 90;

        // ─ 1) Raised platform base: 3D-ish slab with side faces ─
        const sideH = 6; // depth of the raised platform
        // Bottom face (darker shade for depth)
        ctx.fillStyle = `rgba(${baseR},${baseG},${baseB},0.2)`;
        ctx.beginPath();
        ctx.moveTo(fx, fy + fH);
        ctx.lineTo(fx + 3, fy + fH + sideH);
        ctx.lineTo(fx + fW + 3, fy + fH + sideH);
        ctx.lineTo(fx + fW, fy + fH);
        ctx.closePath();
        ctx.fill();
        // Right face
        ctx.fillStyle = `rgba(${baseR},${baseG},${baseB},0.15)`;
        ctx.beginPath();
        ctx.moveTo(fx + fW, fy);
        ctx.lineTo(fx + fW + 3, fy + sideH);
        ctx.lineTo(fx + fW + 3, fy + fH + sideH);
        ctx.lineTo(fx + fW, fy + fH);
        ctx.closePath();
        ctx.fill();

        // ─ 2) Top face: bright filled platform ─
        // Outer glow
        ctx.shadowColor = `rgba(${baseR},${baseG},${baseB},0.6)`;
        ctx.shadowBlur = 12;
        ctx.fillStyle = `rgba(${baseR},${baseG},${baseB},${flashActive ? 0.35 : 0.12 + pulse * 0.1})`;
        ctx.fillRect(fx, fy, fW, fH);
        ctx.shadowBlur = 0;

        // ─ 3) Per-tile grid lines (inner) ─
        ctx.strokeStyle = `rgba(${hiR},${hiG},${hiB},${0.2 + pulse * 0.1})`;
        ctx.lineWidth = 0.8;
        for (let dy = 0; dy < th; dy++) {
          for (let dx = 0; dx < tw; dx++) {
            const tx = (pPos.x + dx) * TILE_SIZE;
            const ty = (pPos.y + dy) * TILE_SIZE;
            ctx.strokeRect(tx + 2, ty + 2, TILE_SIZE - 4, TILE_SIZE - 4);
            // Tile dot at center
            ctx.fillStyle = `rgba(${hiR},${hiG},${hiB},${0.15 + pulse * 0.1})`;
            ctx.beginPath();
            ctx.arc(tx + TILE_SIZE / 2, ty + TILE_SIZE / 2, 1.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // ─ 4) Strong outer frame with double border ─
        // Wide glow border
        ctx.strokeStyle = `rgba(${baseR},${baseG},${baseB},${0.3 + pulse * 0.15})`;
        ctx.lineWidth = 6;
        ctx.strokeRect(fx - 2, fy - 2, fW + 4, fH + 4);
        // Sharp main border
        ctx.strokeStyle = `rgba(${hiR},${hiG},${hiB},${0.8 + pulse * 0.2})`;
        ctx.lineWidth = 2;
        ctx.strokeRect(fx, fy, fW, fH);

        // ─ 5) Corner brackets (thick, bright, scaled to footprint) ─
        const cm = Math.max(8, Math.min(fW, fH) * 0.35);
        ctx.strokeStyle = `rgb(${hiR},${hiG},${hiB})`;
        ctx.lineWidth = 3;
        ctx.lineCap = 'square';
        ctx.beginPath(); ctx.moveTo(fx, fy + cm); ctx.lineTo(fx, fy); ctx.lineTo(fx + cm, fy); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(fx + fW - cm, fy); ctx.lineTo(fx + fW, fy); ctx.lineTo(fx + fW, fy + cm); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(fx, fy + fH - cm); ctx.lineTo(fx, fy + fH); ctx.lineTo(fx + cm, fy + fH); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(fx + fW - cm, fy + fH); ctx.lineTo(fx + fW, fy + fH); ctx.lineTo(fx + fW, fy + fH - cm); ctx.stroke();
        ctx.lineCap = 'butt';

        // ─ 6) Direction arrow showing orientation (for rotatable items) ─
        if (pItem.rotatable) {
          const arrowLen = Math.min(fW, fH) * 0.35;
          const angle = rot * (Math.PI / 2); // 0=right, 1=down, 2=left, 3=up
          const ax = fcx + Math.cos(angle) * arrowLen;
          const ay = fcy + Math.sin(angle) * arrowLen;
          // Arrow shaft
          ctx.strokeStyle = `rgba(255,255,255,${0.5 + pulse * 0.3})`;
          ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(fcx, fcy); ctx.lineTo(ax, ay); ctx.stroke();
          // Arrow head
          const headLen = 5;
          const ha1 = angle + Math.PI * 0.75;
          const ha2 = angle - Math.PI * 0.75;
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(ax + Math.cos(ha1) * headLen, ay + Math.sin(ha1) * headLen);
          ctx.moveTo(ax, ay);
          ctx.lineTo(ax + Math.cos(ha2) * headLen, ay + Math.sin(ha2) * headLen);
          ctx.stroke();
          // Small rotation label
          const rotLabels = ['\u2192', '\u2193', '\u2190', '\u2191']; // →↓←↑
          ctx.font = 'bold 10px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillStyle = `rgba(255,255,255,${0.4 + pulse * 0.2})`;
          ctx.fillText(rotLabels[rot], fcx, fcy - Math.min(fW, fH) * 0.3 - 2);
        }

        // ─ 7) Ghost sprite (rotation-aware) with drop shadow ─
        const gImg = ga[pItem.spriteKey] as HTMLImageElement;
        if (gImg) {
          // Drop shadow
          ctx.fillStyle = 'rgba(0,0,0,0.25)';
          ctx.beginPath();
          ctx.ellipse(fcx, fy + fH - 1, dw * 0.35, 4, 0, 0, Math.PI * 2);
          ctx.fill();
          // Sprite with rotation
          ctx.globalAlpha = 0.65 + pulse * 0.2;
          ctx.save();
          ctx.translate(fcx, fy + fH - dh / 2);
          ctx.rotate(rot * Math.PI / 2);
          ctx.drawImage(gImg, -pItem.drawW / 2, -pItem.drawH / 2, pItem.drawW, pItem.drawH);
          ctx.restore();
          ctx.globalAlpha = 1;
        }

        // ─ 8) Label pill: name + footprint size ─
        const sizeTag = (tw > 1 || th > 1) ? ` ${tw}\u00D7${th}` : '';
        const rotTag = pItem.rotatable ? `  R:\u00A0${['0\u00B0','90\u00B0','180\u00B0','270\u00B0'][rot]}` : '';
        const label = `${pItem.name}${sizeTag}${rotTag}`;
        ctx.font = 'bold 10px Inter, sans-serif';
        ctx.textAlign = 'center';
        const lm = ctx.measureText(label);
        const pillW = lm.width + 20;
        const pillH = 18;
        const pillX = fcx - pillW / 2;
        const pillY = fy - 24;
        ctx.fillStyle = valid ? 'rgba(15,50,30,0.9)' : 'rgba(60,15,15,0.9)';
        ctx.beginPath();
        ctx.roundRect(pillX, pillY, pillW, pillH, 5);
        ctx.fill();
        ctx.strokeStyle = `rgba(${hiR},${hiG},${hiB},0.5)`;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = valid ? `rgb(${hiR},${hiG},${hiB})` : '#ff8888';
        ctx.fillText(label, fcx, pillY + 13);

        // ─ 9) Valid/invalid status icon ─
        ctx.font = 'bold 16px Inter, sans-serif';
        ctx.textAlign = 'center';
        if (valid) {
          ctx.fillStyle = `rgba(${hiR},${hiG},${hiB},${0.6 + pulse * 0.4})`;
          ctx.fillText('\u2713', fx + fW + 12, fy + 14);
        } else {
          ctx.fillStyle = `rgba(255,70,70,${0.6 + pulse * 0.4})`;
          ctx.fillText('\u2717', fx + fW + 12, fy + 14);
        }

        // ─ 10) Dashed guide line from player ─
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = `rgba(${baseR},${baseG},${baseB},0.25)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(p.x * TILE_SIZE + 16, p.y * TILE_SIZE + 16);
        ctx.lineTo(fcx, fcy);
        ctx.stroke();
        ctx.setLineDash([]);

        // ─ 11) Flash on invalid placement ─
        if (flashActive) {
          placementFlashRef.current -= dt;
          const fp = Math.sin(placementFlashRef.current * 25) * 0.5 + 0.5;
          ctx.fillStyle = `rgba(255,30,30,${fp * 0.35})`;
          ctx.fillRect(fx, fy, fW, fH);
          ctx.strokeStyle = `rgba(255,50,50,${0.5 + fp * 0.4})`;
          ctx.lineWidth = 4;
          ctx.beginPath(); ctx.moveTo(fx + 4, fy + 4); ctx.lineTo(fx + fW - 4, fy + fH - 4); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(fx + fW - 4, fy + 4); ctx.lineTo(fx + 4, fy + fH - 4); ctx.stroke();
          ctx.font = 'bold 12px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillStyle = `rgba(255,80,80,${0.7 + fp * 0.3})`;
          ctx.fillText('BLOCKED', fcx, fcy + 4);
        }
      }

      // ── Floating Damage Numbers (world-space, drawn after sort) ──
      for (const dn of damageNumbersRef.current) {
        ctx.globalAlpha = Math.min(1, dn.timer * 2);
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillText(dn.text, dn.x + 1, dn.y + 1);
        ctx.fillStyle = dn.color;
        ctx.fillText(dn.text, dn.x, dn.y);
        ctx.globalAlpha = 1;
      }

      // Hub environmental healing/damage indicators
      if (inHub && healthRef.current > 0) {
        const ptx = Math.floor(p.x), pty = Math.floor(p.y);
        const wellDist = Math.sqrt((ptx - 55) ** 2 + (pty - 42) ** 2);
        const campfires = [[53, 42], [21, 31], [44, 79], [56, 64], [50, 56]];
        const nearCampfire = campfires.find(([cx, cy]) => Math.sqrt((ptx - cx) ** 2 + (pty - cy) ** 2) < 2);
        const inRuins = ellipseDist(ptx, pty, 42, 78, 10, 8) < 0.6;
        const pulse = 0.6 + Math.sin(Date.now() / 400) * 0.3;

        if (wellDist < 3 && healthRef.current < MAX_HEALTH) {
          const healPulse = 0.15 + Math.sin(Date.now() / 300) * 0.1;
          const wellPx = 55 * TILE_SIZE + 16;
          const wellPy = 42 * TILE_SIZE + 16;
          ctx.strokeStyle = `rgba(80,200,80,${healPulse})`;
          ctx.lineWidth = 2;
          const healRadius = 36 + Math.sin(Date.now() / 500) * 4;
          ctx.beginPath(); ctx.arc(wellPx, wellPy, healRadius, 0, Math.PI * 2); ctx.stroke();
          ctx.font = '600 9px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillStyle = `rgba(80,200,80,${pulse})`;
          ctx.fillText('+5 HP/s', wellPx, 42 * TILE_SIZE - 6);
        } else if (nearCampfire && healthRef.current < MAX_HEALTH) {
          const [cx, cy] = nearCampfire;
          const healPulse = 0.15 + Math.sin(Date.now() / 300) * 0.1;
          const cfPx = cx * TILE_SIZE + 16;
          const cfPy = cy * TILE_SIZE + 16;
          ctx.strokeStyle = `rgba(80,200,80,${healPulse})`;
          ctx.lineWidth = 2;
          const healRadius = 28 + Math.sin(Date.now() / 500) * 3;
          ctx.beginPath(); ctx.arc(cfPx, cfPy, healRadius, 0, Math.PI * 2); ctx.stroke();
          ctx.font = '600 9px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillStyle = `rgba(80,200,80,${pulse})`;
          ctx.fillText('+3 HP/s', cfPx, cy * TILE_SIZE - 6);
        }
        if (inRuins) {
          // Red vignette overlay
          const vigAlpha = 0.08 + Math.sin(Date.now() / 600) * 0.04;
          const cw = canvas.width;
          const ch = canvas.height;
          const vigGrad = ctx.createRadialGradient(cw / 2, ch / 2, cw * 0.25, cw / 2, ch / 2, cw * 0.7);
          vigGrad.addColorStop(0, 'rgba(0,0,0,0)');
          vigGrad.addColorStop(1, `rgba(180,30,30,${vigAlpha})`);
          ctx.fillStyle = vigGrad;
          ctx.fillRect(0, 0, cw, ch);
          ctx.font = '600 9px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillStyle = `rgba(220,60,60,${pulse})`;
          ctx.fillText('DANGER — Cursed Ruins', p.x * TILE_SIZE + 16, p.y * TILE_SIZE - 20);
        }
      }

      // Merchant interaction ring (hub only)
      if (inHub && nearMerchantRef.current && !shopOpenRef.current) {
        const mpx = MERCHANT_POS.x * TILE_SIZE;
        const mpy = MERCHANT_POS.y * TILE_SIZE;
        ctx.strokeStyle = '#e8c86a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(mpx + TILE_SIZE / 2, mpy + TILE_SIZE / 2, TILE_SIZE / 2 + 8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#e8c86a';
        ctx.font = 'bold 10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('[E]', mpx + TILE_SIZE / 2, mpy - 10);
        // Completion speech bubble
        if (glCompletionGold.current || svCompletionGold.current) {
          ctx.font = '500 9px Inter, sans-serif';
          const speechText = glCompletionGold.current && svCompletionGold.current ? 'Legend of the land!' : glCompletionGold.current ? 'Welcome back, hero!' : 'Village savior!';
          const sm = ctx.measureText(speechText);
          const bx = mpx + TILE_SIZE / 2 - sm.width / 2 - 10;
          const by = mpy - 36;
          ctx.fillStyle = 'rgba(6,6,8,0.85)';
          ctx.beginPath();
          ctx.roundRect(bx, by, sm.width + 20, 20, 6);
          ctx.fill();
          ctx.strokeStyle = 'rgba(200,164,78,0.3)';
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.fillStyle = '#e8c86a';
          ctx.fillText(speechText, mpx + TILE_SIZE / 2, by + 14);
        }
      }

      ctx.restore();

      // ── Orc Danger Warning Overlay ──
      if (glOrcWarning.current > 0 && zoneRef.current === 'grassland') {
        const warnAlpha = Math.min(1, glOrcWarning.current) * 0.5;
        // Red vignette border
        const vg = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.min(w, h) * 0.7);
        vg.addColorStop(0, 'rgba(0,0,0,0)');
        vg.addColorStop(1, `rgba(180,20,20,${warnAlpha})`);
        ctx.fillStyle = vg;
        ctx.fillRect(0, 0, w, h);
        // Warning text (only in first 2 seconds)
        if (glOrcWarning.current > 1) {
          const txtAlpha = Math.min(1, glOrcWarning.current - 1);
          ctx.globalAlpha = txtAlpha;
          ctx.font = 'bold 16px Inter, sans-serif';
          ctx.textAlign = 'center';
          // Dark background pill
          const warnMsg = 'DANGER — Orc Territory';
          const wm = ctx.measureText(warnMsg);
          ctx.fillStyle = 'rgba(60,0,0,0.85)';
          ctx.beginPath();
          ctx.roundRect(w / 2 - wm.width / 2 - 20, 52, wm.width + 40, 32, 8);
          ctx.fill();
          ctx.strokeStyle = 'rgba(255,60,60,0.6)';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.fillStyle = '#ff5050';
          ctx.fillText(warnMsg, w / 2, 74);
          ctx.globalAlpha = 1;
        }
      }

      // ── Dialogue Box Overlay ──
      if (glDialogRef.current) {
        const dlg = glDialogRef.current;
        const dlgAlpha = Math.min(1, dlg.timer, 1); // fade in/out
        ctx.globalAlpha = dlgAlpha;

        const dlgW = Math.min(420, w - 40);
        const dlgX = w / 2 - dlgW / 2;
        const maxTextW = dlgW - 24;
        const lineHeight = 15;

        // Pre-calculate wrapped lines so box height is dynamic
        ctx.font = '400 11px Inter, sans-serif';
        const words = dlg.text.split(' ');
        const wrappedLines: string[] = [];
        let curLine = '';
        for (const word of words) {
          const test = curLine ? curLine + ' ' + word : word;
          if (ctx.measureText(test).width > maxTextW && curLine) {
            wrappedLines.push(curLine);
            curLine = word;
          } else {
            curLine = test;
          }
        }
        if (curLine) wrappedLines.push(curLine);

        // 26px header (name + divider) + text lines + 10px bottom padding
        const dlgH = 26 + wrappedLines.length * lineHeight + 10;
        const activeChoices = dialogChoicesRef.current.active ? dialogChoicesRef.current : svDialogChoicesRef.current.active ? svDialogChoicesRef.current : null;
        const btnH = 28;
        const btnGap = 8;
        const totalBottom = dlgH + (activeChoices ? btnGap + btnH : 0) + 20;
        const dlgY = h - totalBottom;

        // Background
        ctx.fillStyle = 'rgba(6,6,8,0.92)';
        ctx.beginPath();
        ctx.roundRect(dlgX, dlgY, dlgW, dlgH, 8);
        ctx.fill();

        // Border
        const isLoot = dlg.speaker === 'Loot';
        const borderColor = isLoot ? 'rgba(230,200,100,0.5)' : 'rgba(120,180,220,0.4)';
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Speaker name tag
        const speakerColor = isLoot ? '#e8c86a' : '#88bbdd';
        ctx.font = 'bold 10px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillStyle = speakerColor;
        ctx.fillText(dlg.speaker, dlgX + 12, dlgY + 16);

        // Divider line
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.fillRect(dlgX + 12, dlgY + 22, dlgW - 24, 1);

        // Draw pre-wrapped text lines
        ctx.font = '400 11px Inter, sans-serif';
        ctx.fillStyle = 'rgba(240,240,240,0.92)';
        wrappedLines.forEach((ln, i) => {
          ctx.fillText(ln, dlgX + 12, dlgY + 38 + i * lineHeight);
        });

        // Dialogue choice buttons
        if (activeChoices) {
          const choices = activeChoices.options;
          const btnY = dlgY + dlgH + btnGap;
          const btnW = Math.floor((dlgW - 16) / choices.length) - 4;
          choices.forEach((opt, ci) => {
            const bx = dlgX + 8 + ci * (btnW + 4);
            // Solid dark background
            ctx.fillStyle = 'rgba(20,18,30,0.95)';
            ctx.beginPath();
            ctx.roundRect(bx, btnY, btnW, btnH, 5);
            ctx.fill();
            // Gold border
            ctx.strokeStyle = 'rgba(230,200,100,0.6)';
            ctx.lineWidth = 1.5;
            ctx.stroke();
            // Key number badge
            const badgeX = bx + 10;
            const badgeY = btnY + btnH / 2;
            ctx.fillStyle = 'rgba(230,200,100,0.15)';
            ctx.beginPath();
            ctx.arc(badgeX, badgeY, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.font = 'bold 10px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#ffd700';
            ctx.fillText(`${ci + 1}`, badgeX, badgeY + 4);
            // Label text
            ctx.font = '600 10px Inter, sans-serif';
            ctx.fillStyle = 'rgba(240,240,240,0.9)';
            ctx.fillText(opt.label, bx + 10 + (btnW - 10) / 2, btnY + btnH / 2 + 4);
          });
        }

        ctx.globalAlpha = 1;
      }

      // ── Top bar: location pill (left-aligned) ──
      const zoneName = inHub ? getZoneName(Math.floor(p.x), Math.floor(p.y)) : inVillage ? 'Seaside Village' : getGrasslandZoneName(Math.floor(p.x), Math.floor(p.y));
      const regionLabel = inHub ? 'Hub' : inVillage ? 'Village' : 'Grassland';

      // Location pill — top left
      ctx.font = '600 11px Inter, sans-serif';
      ctx.textAlign = 'left';
      const locIcon = '\u25C9'; // ◉
      const locText = `${locIcon}  ${zoneName}`;
      const regionText = regionLabel;
      const lm = ctx.measureText(locText);
      ctx.font = '400 9px Inter, sans-serif';
      const rm = ctx.measureText(regionText);
      const pillW = Math.max(lm.width, rm.width) + 28;
      const pillX = 12;
      const pillY = 12;
      ctx.fillStyle = 'rgba(6,6,8,0.78)';
      ctx.beginPath();
      ctx.roundRect(pillX, pillY, pillW, 36, 6);
      ctx.fill();
      ctx.strokeStyle = 'rgba(200,164,78,0.12)';
      ctx.lineWidth = 1;
      ctx.stroke();
      // Zone name
      ctx.font = '600 11px Inter, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.fillText(locText, pillX + 10, pillY + 15);
      // Region label
      ctx.font = '400 9px Inter, sans-serif';
      ctx.fillStyle = 'rgba(200,164,78,0.5)';
      ctx.fillText(regionLabel + (eraLabelRef.current ? ` \u2022 ${eraLabelRef.current}` : ''), pillX + 10, pillY + 28);

      // ── Character bar (top-left) ──
      const barX = 12;
      const barW = 220;
      const barH = isOwner ? 130 : 68;
      const barY = 54;

      // Panel background
      ctx.fillStyle = 'rgba(6,6,8,0.82)';
      ctx.beginPath();
      ctx.roundRect(barX, barY, barW, barH, 8);
      ctx.fill();
      ctx.strokeStyle = 'rgba(200,164,78,0.12)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // ── Health bar (top of panel) ──
      const curHp = healthRef.current;
      const hpPct = curHp / MAX_HEALTH;
      const hpBarX = barX + 10;
      const hpBarY2 = barY + 10;
      const hpBarW = barW - 20;
      const hpBarH2 = 12;
      // HP icon
      ctx.font = '10px Inter, sans-serif';
      ctx.fillStyle = '#c04040';
      ctx.textAlign = 'left';
      ctx.fillText('\u2764', hpBarX + 1, hpBarY2 + 9); // ❤
      // Bar bg
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.beginPath();
      ctx.roundRect(hpBarX + 14, hpBarY2, hpBarW - 14, hpBarH2, 4);
      ctx.fill();
      // Bar fill
      const hpColor = hpPct > 0.5 ? '#c04040' : hpPct > 0.25 ? '#d06030' : '#ff4040';
      ctx.fillStyle = hpColor;
      ctx.beginPath();
      ctx.roundRect(hpBarX + 14, hpBarY2, Math.max(0, (hpBarW - 14) * hpPct), hpBarH2, 4);
      ctx.fill();
      ctx.font = '600 8px Inter, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.fillText(`${Math.round(curHp)}/${MAX_HEALTH}`, hpBarX + 18, hpBarY2 + 9);

      // ── Stamina bar ──
      const curSp = staminaRef.current;
      const stPct = curSp / MAX_STAMINA;
      const stBarY = hpBarY2 + hpBarH2 + 4;
      ctx.font = '10px Inter, sans-serif';
      ctx.fillStyle = '#50a040';
      ctx.fillText('\u26A1', hpBarX + 1, stBarY + 9); // ⚡
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.beginPath();
      ctx.roundRect(hpBarX + 14, stBarY, hpBarW - 14, hpBarH2, 4);
      ctx.fill();
      ctx.fillStyle = stPct > 0.3 ? '#50a040' : '#80c040';
      ctx.beginPath();
      ctx.roundRect(hpBarX + 14, stBarY, Math.max(0, (hpBarW - 14) * stPct), hpBarH2, 4);
      ctx.fill();
      ctx.font = '600 8px Inter, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.fillText(`${Math.round(curSp)}/${MAX_STAMINA}`, hpBarX + 18, stBarY + 9);

      // ── Resources section (owner only) ──
      if (isOwner) {
        const resY = stBarY + hpBarH2 + 8;
        const cap = resourceCapRef.current;
        // Calculate income rates for HUD
        let hudIncG = 0, hudIncW = 0, hudIncS = 0;
        const hThroneC = placedObjectsRef.current.filter(o => o.itemType === 'throne' && o.zone === zoneRef.current).length;
        const hTownHC = placedObjectsRef.current.filter(o => o.itemType === 'town_hall' && o.zone === zoneRef.current).length;
        const hMerchHC = placedObjectsRef.current.filter(o => o.itemType === 'merchant_hall' && o.zone === zoneRef.current).length;
        const hManorC = placedObjectsRef.current.filter(o => o.itemType === 'manor' && o.zone === zoneRef.current).length;
        const hPopMult = 1 + Math.floor(populationRef.current / 5) * 0.05;
        const hBoost = (1 + hThroneC * 0.15) * (1 + hTownHC * 0.10 + hMerchHC * 0.25 + hManorC * 0.10) * hPopMult;
        for (const obj of placedObjectsRef.current) {
          const bi = BUILD_ITEMS.find(b => b.id === obj.itemType);
          if (bi?.income?.gold) hudIncG += bi.income.gold * hBoost;
          if (bi?.income?.wood) hudIncW += bi.income.wood * hBoost;
          if (bi?.income?.stone) hudIncS += bi.income.stone * hBoost;
        }
        // Add population passive gold
        hudIncG += Math.floor(populationRef.current / 3);
        // Thin divider
        ctx.fillStyle = 'rgba(200,164,78,0.08)';
        ctx.fillRect(barX + 10, resY - 4, barW - 20, 1);

        // Resource row with icons
        const resources = [
          { icon: 'G', value: playerGoldRef.current, inc: hudIncG, color: '#e8c86a', atCap: playerGoldRef.current >= cap.gold * 0.9 },
          { icon: 'W', value: playerWoodRef.current, inc: hudIncW, color: '#8b6c3e', atCap: playerWoodRef.current >= cap.wood * 0.9 },
          { icon: 'S', value: playerStoneRef.current, inc: hudIncS, color: '#808078', atCap: playerStoneRef.current >= cap.stone * 0.9 },
        ];
        const resSpacing = (barW - 20) / 3;
        resources.forEach((res, i) => {
          const rx = barX + 10 + i * resSpacing;
          ctx.fillStyle = res.color;
          ctx.globalAlpha = 0.7;
          ctx.beginPath();
          ctx.arc(rx + 4, resY + 5, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
          ctx.textAlign = 'left';
          ctx.font = '600 10px Inter, sans-serif';
          ctx.fillStyle = res.atCap ? '#c06040' : res.color;
          ctx.fillText(`${res.value}`, rx + 12, resY + 8);
          if (res.inc > 0) {
            ctx.font = '400 8px Inter, sans-serif';
            ctx.fillStyle = 'rgba(120,200,80,0.6)';
            ctx.fillText(`+${res.inc.toFixed(0)}`, rx + 14 + ctx.measureText(`${res.value}`).width + 2, resY + 8);
          }
        });

        // ── Population display ──
        const curPop = populationRef.current;
        if (curPop > 0) {
          const popY = resY + 16;
          ctx.font = '500 9px Inter, sans-serif';
          ctx.textAlign = 'left';
          ctx.fillStyle = 'rgba(160,200,120,0.6)';
          ctx.fillText('\u263A', barX + 12, popY + 1); // ☺
          ctx.fillStyle = 'rgba(160,200,120,0.8)';
          ctx.fillText(`${curPop}`, barX + 24, popY + 1);
          const popBonusG = Math.floor(curPop / 3);
          const popBonusPct = Math.floor(curPop / 5) * 5;
          const bonusParts: string[] = [];
          if (popBonusG > 0) bonusParts.push(`+${popBonusG}G/min`);
          if (popBonusPct > 0) bonusParts.push(`+${popBonusPct}%`);
          if (bonusParts.length > 0) {
            ctx.font = '400 7px Inter, sans-serif';
            ctx.fillStyle = 'rgba(120,200,80,0.5)';
            ctx.fillText(bonusParts.join(' '), barX + 36, popY + 1);
          }
        }

        // ── Builder Tier section ──
        const tierSectionY = resY + (curPop > 0 ? 28 : 16);
        const tier = playerTierRef.current;
        const ti = TIER_INFO.find(t => t.tier === tier) || TIER_INFO[0];
        const tierLabel = ti.name;
        const tierColor = ti.color;
        const tierY = tierSectionY;
        // Tier badge bg
        ctx.fillStyle = `${tierColor}0D`;
        ctx.beginPath();
        ctx.roundRect(barX + 8, tierY, barW - 16, 22, 4);
        ctx.fill();
        ctx.strokeStyle = `${tierColor}25`;
        ctx.lineWidth = 1;
        ctx.stroke();
        // Star + label
        ctx.font = '10px Inter, sans-serif';
        ctx.fillStyle = tierColor;
        ctx.textAlign = 'left';
        ctx.fillText('\u2605', barX + 14, tierY + 14);
        ctx.font = 'bold 10px Inter, sans-serif';
        ctx.fillText(tierLabel, barX + 26, tierY + 14);
        // Progress bar (next tier) with descriptive label
        if (tier < 6) {
          let progress = 0;
          let progLabel = '';
          let progDesc = '';
          if (tier === 1) {
            const k = Math.min(orcsKilledRef.current, 3);
            progress = k / 3;
            progLabel = `${k}/3`;
            progDesc = `Kill orcs: ${k}/3`;
          } else if (tier === 2) {
            const k = Math.min(orcsKilledRef.current, 7);
            progress = k / 7;
            progLabel = `${k}/7`;
            progDesc = `Stronghold orcs: ${k}/7`;
          } else if (tier === 3) {
            progress = glCompletionGold.current ? 1 : 0;
            progLabel = glCompletionGold.current ? '1/1' : '0/1';
            progDesc = glCompletionGold.current ? 'Shrine Chest: opened' : 'Open Shrine Chest';
          } else if (tier === 4) {
            const q = svQuestRef.current;
            const qDone = q.stage === 'returned' || q.stage === 'complete' ? 1 : 0;
            progress = qDone;
            progLabel = `${qDone}/1`;
            if (q.stage === 'none') progDesc = 'Talk to Marina';
            else if (q.stage === 'searching') progDesc = `Necklace: ${q.searched.filter(Boolean).length}/3 searched`;
            else if (q.stage === 'found') progDesc = 'Return necklace to Marina';
            else progDesc = "Marina's Necklace: done";
          } else {
            progress = svCompletionGold.current ? 1 : 0;
            progLabel = svCompletionGold.current ? '1/1' : '0/1';
            progDesc = svCompletionGold.current ? 'Village chest: opened' : 'Open Village reward chest';
          }
          const pbX = barX + 14;
          const pbW = barW - 28;
          // Descriptive task label above bar
          ctx.font = '500 7px Inter, sans-serif';
          ctx.fillStyle = 'rgba(255,255,255,0.35)';
          ctx.textAlign = 'left';
          ctx.fillText(progDesc, pbX, tierY + 26);
          // Progress bar
          ctx.fillStyle = 'rgba(255,255,255,0.06)';
          ctx.beginPath();
          ctx.roundRect(pbX, tierY + 29, pbW, 6, 3);
          ctx.fill();
          ctx.fillStyle = `${tierColor}70`;
          ctx.beginPath();
          ctx.roundRect(pbX, tierY + 29, Math.max(0, pbW * progress), 6, 3);
          ctx.fill();
          ctx.font = '600 7px Inter, sans-serif';
          ctx.fillStyle = 'rgba(255,255,255,0.5)';
          ctx.textAlign = 'right';
          ctx.fillText(progLabel, barX + barW - 14, tierY + 36);
          ctx.textAlign = 'left';
        }
      }

      // ── Objective bar (bottom-left, below character bar) ──
      const curObjective = inVillage ? svObjectiveRef.current : objectiveRef.current;
      const objY = barY - 26;
      const objW = barW;
      ctx.fillStyle = 'rgba(6,6,8,0.72)';
      ctx.beginPath();
      ctx.roundRect(barX, objY, objW, 20, 5);
      ctx.fill();
      ctx.font = '600 9px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(200,164,78,0.6)';
      ctx.fillText('\u25C6', barX + 8, objY + 13);
      ctx.font = '500 9px Inter, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.fillText(curObjective, barX + 20, objY + 13);

      // ── Quest/combat trackers (right side of obj bar) ──
      ctx.textAlign = 'right';
      if (zoneRef.current === 'grassland' && orcsKilledRef.current > 0) {
        ctx.font = '600 9px Inter, sans-serif';
        ctx.fillStyle = orcsKilledRef.current >= 7 ? '#78c850' : '#dc6450';
        ctx.fillText(`\u2694 ${orcsKilledRef.current}/7`, barX + objW - 8, objY + 13);
      }
      if (shrineBuffRef.current.active) {
        ctx.font = '500 8px Inter, sans-serif';
        ctx.fillStyle = 'rgba(160,120,255,0.7)';
        ctx.fillText(`\u269A ${Math.ceil(shrineBuffRef.current.timer)}s`, barX + objW - 8, objY + 13);
      }
      if (inVillage) {
        ctx.font = '600 9px Inter, sans-serif';
        const q = svQuestRef.current;
        if (q.stage === 'searching') {
          ctx.fillStyle = 'rgba(200,180,80,0.7)';
          ctx.fillText(`${q.searched.filter(Boolean).length}/3`, barX + objW - 8, objY + 13);
        } else if (q.stage === 'found') {
          ctx.fillStyle = '#78c850';
          ctx.fillText('\u2713 Found', barX + objW - 8, objY + 13);
        } else if (q.stage === 'returned' || q.stage === 'complete') {
          ctx.fillStyle = '#78c850';
          ctx.fillText('\u2713 Done', barX + objW - 8, objY + 13);
        }
      }
      ctx.textAlign = 'left';

      // Placement mode instruction bar (bottom center)
      if (placementModeRef.current && placementItemRef.current) {
        const pbi = placementItemRef.current;
        const pRot = placementRotRef.current;
        const { tw: eTw, th: eTh } = getRotatedDims(pbi, pRot);
        const costParts: string[] = [];
        if (pbi.cost.wood > 0) costParts.push(`${pbi.cost.wood} Wood`);
        if (pbi.cost.stone > 0) costParts.push(`${pbi.cost.stone} Stone`);
        if (pbi.cost.gold > 0) costParts.push(`${pbi.cost.gold} Gold`);
        const sizeLabel = eTw > 1 || eTh > 1 ? ` (${eTw}\u00D7${eTh})` : '';
        const rotHint = pbi.rotatable ? ' \u2022 R rotate' : '';
        const placeMsg = `Placing: ${pbi.name}${sizeLabel}  \u2502  ${costParts.join(' \u2022 ')}  \u2502  WASD move \u2022 E confirm${rotHint} \u2022 ESC cancel`;
        ctx.font = '500 11px Inter, sans-serif';
        ctx.textAlign = 'center';
        const pm = ctx.measureText(placeMsg);
        const barPad = 20;
        const barW2 = pm.width + barPad * 2;
        const barH2 = 32;
        const barX2 = w / 2 - barW2 / 2;
        const barY2 = h - 54;
        ctx.fillStyle = 'rgba(6,6,8,0.9)';
        ctx.beginPath();
        ctx.roundRect(barX2, barY2, barW2, barH2, 10);
        ctx.fill();
        ctx.strokeStyle = 'rgba(139,108,62,0.35)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = 'rgba(200,164,78,0.9)';
        ctx.fillText(placeMsg, w / 2, barY2 + 20);
      }

      // ── Minimap (top-right) ──
      if (minimapOpenRef.current) {
        const curMap = zoneRef.current === 'hub' ? mapRef.current : zoneRef.current === 'grassland' ? glMapRef.current : svMapRef.current;
        if (curMap && curMap.length > 0) {
          const mapW = curMap[0].length;
          const mapH = curMap.length;
          const mmW = Math.min(160, Math.round(mapW * 2));
          const mmH = Math.min(120, Math.round(mapH * 2));
          const mmX = w - mmW - 16;
          const mmY = h - mmH - 26;
          const scaleX = mmW / mapW;
          const scaleY = mmH / mapH;

          // Build offscreen terrain canvas if zone changed
          if (minimapZoneRef.current !== zoneRef.current || !minimapCanvasRef.current) {
            const offC = document.createElement('canvas');
            offC.width = mmW;
            offC.height = mmH;
            const offCtx = offC.getContext('2d');
            if (offCtx) {
              const MINI_COLORS: Record<number, string> = {
                [T.DEEP_WATER]: '#1a6080', [T.WATER]: '#2898b8', [T.SHALLOW]: '#38a8c0',
                [T.SHORE]: '#c0b080', [T.SAND]: '#d0c090', [T.GRASS]: '#4a6a30',
                [T.GRASS_DARK]: '#3a5820', [T.FOREST]: '#2a5020', [T.DENSE_FOREST]: '#1a3818',
                [T.HILLS]: '#6a6a52', [T.ROCK]: '#707068', [T.PATH]: '#b09060', [T.COBBLE]: '#908070',
              };
              for (let y = 0; y < mapH; y++) {
                for (let x = 0; x < mapW; x++) {
                  offCtx.fillStyle = MINI_COLORS[curMap[y][x]] || '#4a6a30';
                  offCtx.fillRect(Math.floor(x * scaleX), Math.floor(y * scaleY),
                    Math.ceil(scaleX), Math.ceil(scaleY));
                }
              }
            }
            minimapCanvasRef.current = offC;
            minimapZoneRef.current = zoneRef.current;
          }

          // Draw minimap background
          ctx.fillStyle = 'rgba(6,6,8,0.8)';
          ctx.beginPath();
          ctx.roundRect(mmX - 4, mmY - 4, mmW + 8, mmH + 18, 6);
          ctx.fill();
          ctx.strokeStyle = 'rgba(200,164,78,0.2)';
          ctx.lineWidth = 1;
          ctx.stroke();

          // Draw cached terrain
          if (minimapCanvasRef.current) {
            ctx.drawImage(minimapCanvasRef.current, mmX, mmY);
          }

          // Placed buildings (small dots)
          for (const obj of placedObjectsRef.current) {
            if (obj.zone !== zoneRef.current || obj.itemType === '_fill') continue;
            const bItem = BUILD_ITEMS.find(b => b.id === obj.itemType);
            ctx.fillStyle = bItem?.income ? '#e8c86a' : bItem?.effect ? '#80a0c0' : '#a08050';
            ctx.globalAlpha = 0.8;
            ctx.fillRect(mmX + obj.tileX * scaleX, mmY + obj.tileY * scaleY, Math.max(2, scaleX), Math.max(2, scaleY));
          }
          ctx.globalAlpha = 1;

          // Zone exits (yellow markers)
          const exits: { x: number; y: number; label: string }[] = [];
          if (zoneRef.current === 'hub') {
            exits.push({ x: 50, y: 0, label: 'N' }); // Northern Pass
            exits.push({ x: 96, y: 45, label: 'E' }); // Docks South Gate
          } else if (zoneRef.current === 'grassland') {
            exits.push({ x: 40, y: 59, label: 'S' }); // Back to hub
          } else {
            exits.push({ x: 0, y: 12, label: 'W' }); // Back to hub
          }
          for (const ex of exits) {
            const exx = mmX + ex.x * scaleX;
            const exy = mmY + ex.y * scaleY;
            ctx.fillStyle = '#e8c86a';
            ctx.beginPath();
            ctx.arc(exx, exy, 3, 0, Math.PI * 2);
            ctx.fill();
          }

          // Orcs (grassland — red dots)
          if (zoneRef.current === 'grassland') {
            for (const orc of orcsRef.current) {
              if (orc.state === 'dead') continue;
              ctx.fillStyle = '#dc4040';
              ctx.beginPath();
              ctx.arc(mmX + orc.x * scaleX, mmY + orc.y * scaleY, 2, 0, Math.PI * 2);
              ctx.fill();
            }
          }

          // Player dot (white, pulsing)
          const pp = playerRef.current;
          const pulse = 0.6 + Math.sin(timeRef.current * 4) * 0.4;
          ctx.fillStyle = `rgba(255,255,255,${pulse})`;
          ctx.beginPath();
          ctx.arc(mmX + pp.x * scaleX, mmY + pp.y * scaleY, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fff';
          ctx.beginPath();
          ctx.arc(mmX + pp.x * scaleX, mmY + pp.y * scaleY, 1.5, 0, Math.PI * 2);
          ctx.fill();

          // Zone label
          const zoneLabel = zoneRef.current === 'hub' ? 'Hub' : zoneRef.current === 'grassland' ? 'Grassland' : 'Village';
          ctx.font = '600 8px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillStyle = 'rgba(255,255,255,0.4)';
          ctx.fillText(zoneLabel + ' [M]', mmX + mmW / 2, mmY + mmH + 11);
          ctx.textAlign = 'left';
        }
      }

      // Controls hint (bottom center) — styled key badges
      if (!placementModeRef.current) {
        const hints = zoneRef.current === 'grassland'
          ? [['WASD', 'Move'], ['SPC', 'Attack'], ['E', 'Interact'], ['ESC', 'Close']]
          : inVillage
          ? [['WASD', 'Move'], ['SPC', 'Attack'], ['E', 'Interact'], ['1-2', 'Choose']]
          : [['WASD', 'Move'], ['E', 'Interact'], ['1-3', 'Choose'], ['ESC', 'Close']];
        const badgeFont = '600 8px Inter, sans-serif';
        const labelFont = '400 9px Inter, sans-serif';
        const badgePad = 5;
        const gap = 12;
        // Measure total width
        let totalW = 0;
        const segments: { key: string; label: string; keyW: number; labelW: number }[] = [];
        for (const [key, label] of hints) {
          ctx.font = badgeFont;
          const kw = ctx.measureText(key).width;
          ctx.font = labelFont;
          const lw = ctx.measureText(label).width;
          segments.push({ key, label, keyW: kw, labelW: lw });
          totalW += kw + badgePad * 2 + 4 + lw + gap;
        }
        totalW -= gap;
        let cx = w / 2 - totalW / 2;
        const cy = h - 16;
        for (const seg of segments) {
          // Key badge
          const bw = seg.keyW + badgePad * 2;
          ctx.fillStyle = 'rgba(200,164,78,0.12)';
          ctx.beginPath();
          ctx.roundRect(cx, cy - 8, bw, 14, 3);
          ctx.fill();
          ctx.font = badgeFont;
          ctx.fillStyle = 'rgba(200,164,78,0.6)';
          ctx.textAlign = 'center';
          ctx.fillText(seg.key, cx + bw / 2, cy + 3);
          cx += bw + 4;
          // Label
          ctx.font = labelFont;
          ctx.fillStyle = 'rgba(255,255,255,0.25)';
          ctx.textAlign = 'left';
          ctx.fillText(seg.label, cx, cy + 3);
          cx += seg.labelW + gap;
        }
      }


      // Entity Radar (reveal buff, hub only)
      if (hasReveal && inHub) {
        const margin = 24;
        for (const pe of placedRef.current) {
          const ex = (pe.tileX * TILE_SIZE - camX) * zoom;
          const ey = (pe.tileY * TILE_SIZE - camY) * zoom;
          if (ex >= -16 && ex <= w + 16 && ey >= -16 && ey <= h + 16) continue;
          const cx = Math.max(margin, Math.min(w - margin, ex));
          const cy = Math.max(margin + 40, Math.min(h - margin - 24, ey));
          const eColor = ENTITY_COLORS[pe.entity.type] || pe.entity.accent || '#e8c86a';
          const pulse = 0.6 + 0.4 * Math.sin(timeRef.current * 3);
          ctx.globalAlpha = pulse;
          ctx.fillStyle = eColor;
          ctx.beginPath();
          ctx.arc(cx, cy, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = 'rgba(255,255,255,0.4)';
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }

      // ── Zone transitions ──
      if (!isFading) {
        if (inHub) {
          // Northern Pass → Grassland
          const gateDist = Math.sqrt((p.x - 56) ** 2 + (p.y - 17) ** 2);
          if (gateDist < 1.5) {
            pendingZoneRef.current = 'grassland';
            fadeDirRef.current = 'in';
          } else if (gateDist < 3.5) {
            const gsx = (56 * TILE_SIZE + 16 - camX) * zoom;
            const gsy = (16 * TILE_SIZE - camY) * zoom;
            ctx.font = '500 11px Inter, sans-serif';
            ctx.textAlign = 'center';
            const msg = '\u25B2 Northern Pass';
            const mm = ctx.measureText(msg);
            ctx.fillStyle = 'rgba(6,6,8,0.8)';
            ctx.beginPath();
            ctx.roundRect(gsx - mm.width / 2 - 10, gsy - 10, mm.width + 20, 22, 6);
            ctx.fill();
            ctx.strokeStyle = 'rgba(200,164,78,0.3)';
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.fillStyle = 'rgba(200,164,78,0.7)';
            ctx.fillText(msg, gsx, gsy + 5);
          }
          // Docks South Gate → Village
          const villageDist = Math.sqrt((p.x - 96) ** 2 + (p.y - 46) ** 2);
          if (villageDist < 1.5) {
            pendingZoneRef.current = 'village';
            fadeDirRef.current = 'in';
          } else if (villageDist < 3.5) {
            const vsx = (96 * TILE_SIZE + 16 - camX) * zoom;
            const vsy = (45 * TILE_SIZE - camY) * zoom;
            ctx.font = '500 11px Inter, sans-serif';
            ctx.textAlign = 'center';
            const vmsg = '\u25B6 Seaside Village';
            const vm = ctx.measureText(vmsg);
            ctx.fillStyle = 'rgba(6,6,8,0.8)';
            ctx.beginPath();
            ctx.roundRect(vsx - vm.width / 2 - 10, vsy - 10, vm.width + 20, 22, 6);
            ctx.fill();
            ctx.strokeStyle = 'rgba(120,180,200,0.3)';
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.fillStyle = 'rgba(120,180,200,0.7)';
            ctx.fillText(vmsg, vsx, vsy + 5);
          }
        } else if (zoneRef.current === 'grassland') {
          if (p.y >= GL_H - 1.5) {
            pendingZoneRef.current = 'hub';
            fadeDirRef.current = 'in';
          }
        } else if (zoneRef.current === 'village') {
          if (p.x <= 0.5) {
            pendingZoneRef.current = 'hub';
            fadeDirRef.current = 'in';
          }
        }
      }

      // ── Fade overlay ──
      if (fadeRef.current > 0) {
        ctx.fillStyle = `rgba(0,0,0,${fadeRef.current})`;
        ctx.fillRect(0, 0, w, h);
      }

      // ── Zone banner ──
      if (zoneBannerRef.current && zoneBannerTimer.current > 0) {
        const bannerAlpha = Math.min(1, zoneBannerTimer.current);
        ctx.globalAlpha = bannerAlpha;
        ctx.font = '600 18px Inter, sans-serif';
        ctx.textAlign = 'center';
        const banner = zoneBannerRef.current;
        const bm = ctx.measureText(banner);
        ctx.fillStyle = 'rgba(6,6,8,0.85)';
        ctx.beginPath();
        ctx.roundRect(w / 2 - bm.width / 2 - 24, h / 2 - 18, bm.width + 48, 40, 10);
        ctx.fill();
        ctx.strokeStyle = 'rgba(200,164,78,0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = 'rgba(200,164,78,0.9)';
        ctx.fillText(banner, w / 2, h / 2 + 8);
        ctx.globalAlpha = 1;
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, ga]);

  const closeInspect = useCallback(() => setInspecting(null), []);
  const useItem = useCallback((item: ShopItem) => {
    if (item.effect === 'heal' && item.healAmount) {
      healthRef.current = Math.round(Math.min(MAX_HEALTH, healthRef.current + item.healAmount));
      damageNumbersRef.current.push({ x: playerRef.current.x * TILE_SIZE + 16, y: playerRef.current.y * TILE_SIZE - 16, text: `+${item.healAmount} HP`, color: '#60c060', timer: 1.5 });
      setShopMessage(`Used ${item.name} — ${item.effectLabel}!`);
      setTimeout(() => setShopMessage(null), 2000);
      return;
    }
    // Apply timed buff — stack duration if same effect already active
    setActiveBuffs(prev => {
      const existing = prev.find(b => b.effect === item.effect);
      if (existing) {
        return prev.map(b => b.effect === item.effect
          ? { ...b, remaining: b.remaining + item.duration }
          : b);
      }
      return [...prev, { effect: item.effect, label: item.effectLabel, remaining: item.duration, color: item.color }];
    });
    if (item.healAmount) {
      healthRef.current = Math.round(Math.min(MAX_HEALTH, healthRef.current + item.healAmount));
      damageNumbersRef.current.push({ x: playerRef.current.x * TILE_SIZE + 16, y: playerRef.current.y * TILE_SIZE - 16, text: `+${item.healAmount} HP`, color: '#60c060', timer: 1.5 });
    }
    setShopMessage(`Used ${item.name} — ${item.effectLabel}!`);
    setTimeout(() => setShopMessage(null), 2000);
  }, []);

  const buyItem = useCallback((item: ShopItem) => {
    setPlayerGold(g => {
      if (g >= item.price) {
        const newG = g - item.price;
        playerGoldRef.current = newG;
        // Auto-use instant heal items immediately instead of adding to inventory
        if (item.effect === 'heal' && item.healAmount && (!item.duration || item.duration === 0)) {
          healthRef.current = Math.round(Math.min(MAX_HEALTH, healthRef.current + item.healAmount));
          damageNumbersRef.current.push({ x: playerRef.current.x * TILE_SIZE + 16, y: playerRef.current.y * TILE_SIZE - 16, text: `+${item.healAmount} HP`, color: '#60c060', timer: 1.5 });
          setShopMessage(`Used ${item.name} — ${item.effectLabel}!`);
        } else {
          setInventory(inv => ({ ...inv, [item.id]: (inv[item.id] || 0) + 1 }));
          setShopMessage(`Purchased ${item.name}!`);
        }
        setTimeout(() => setShopMessage(null), 1500);
        return newG;
      }
      return g;
    });
  }, []);
  const loading = !ready || assetsLoading;

  return (
    <div className={fullscreen ? 'explore-fullscreen' : 'explore-container'}>
      <canvas ref={canvasRef} className="explore-canvas" tabIndex={0} onFocus={() => canvasRef.current?.focus()} />

      {/* Character Picker */}
      {(needsCharPick || charPickerOpen) && ga && (
        <CharacterPicker
          npcTilemap={ga.npcTilemap}
          currentCharIndex={chosenCharIndex}
          currentHueShift={chosenHueShift}
          currentName={chosenDisplayName}
          onSelect={handleCharSelect}
          onClose={() => { if (!needsCharPick) setCharPickerOpen(false); }}
        />
      )}

      {fullscreen && (
        <button className="explore-back-btn" onClick={() => window.close()} title="Close world">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          Exit
        </button>
      )}

      {/* Active buffs HUD */}
      {activeBuffs.length > 0 && (
        <div style={{
          position: 'absolute', top: 16, right: 16,
          display: 'flex', flexDirection: 'column', gap: 4, pointerEvents: 'none',
        }}>
          {activeBuffs.map(buff => (
            <div key={buff.effect} style={{
              background: 'rgba(6,6,8,0.75)', borderRadius: 10,
              padding: '4px 12px', display: 'flex', alignItems: 'center', gap: 6,
              border: `1px solid ${buff.color}33`,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: buff.color, flexShrink: 0 }} />
              <span style={{ color: buff.color, fontSize: 10, fontWeight: 600 }}>{buff.label}</span>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 9 }}>{Math.ceil(buff.remaining)}s</span>
            </div>
          ))}
        </div>
      )}

      {/* Entity inspect panel */}
      {inspecting && (
        <div className="explore-panel">
          <div className="explore-panel-header">
            <div>
              <div className="explore-panel-type" style={{ color: ENTITY_COLORS[inspecting.type] || inspecting.accent }}>
                <span className="entity-dot" style={{ background: ENTITY_COLORS[inspecting.type] || inspecting.accent }} />
                {inspecting.type}
              </div>
              <h3 className="explore-panel-title">{inspecting.title}</h3>
            </div>
            <button className="explore-panel-close" onClick={closeInspect}>ESC</button>
          </div>
          <p className="explore-panel-summary">{inspecting.summary}</p>
          {inspecting.facts.length > 0 && (
            <div className="explore-panel-facts">
              {inspecting.facts.map((f, i) => (
                <div key={i} className="explore-panel-fact">
                  <span className="fact-label">{f.label}</span>
                  <span className="fact-value">{f.value}</span>
                </div>
              ))}
            </div>
          )}
          {inspecting.tags.length > 0 && (
            <div className="explore-panel-tags">
              {inspecting.tags.map(tag => <span key={tag} className="entity-tag">{tag}</span>)}
            </div>
          )}
        </div>
      )}

      {/* Build menu panel */}
      {buildMenuOpen && isOwner && (() => {
        const curTier = playerTierRef.current;
        const curTI = TIER_INFO.find(t => t.tier === curTier) || TIER_INFO[0];
        const tierLabel = curTI.name;
        const tierColor = curTI.color;
        // Calculate total income rates
        const throneCount = placedObjectsRef.current.filter(o => o.itemType === 'throne').length;
        const townHallCount = placedObjectsRef.current.filter(o => o.itemType === 'town_hall').length;
        const throneBoost = 1 + throneCount * 0.15;
        const townHallBoost = 1 + townHallCount * 0.10;
        const totalBoost = throneBoost * townHallBoost;
        let totalIncG = 0, totalIncW = 0, totalIncS = 0;
        for (const obj of placedObjectsRef.current) {
          const bi = BUILD_ITEMS.find(b => b.id === obj.itemType);
          if (bi?.income?.gold) totalIncG += bi.income.gold * totalBoost;
          if (bi?.income?.wood) totalIncW += bi.income.wood * totalBoost;
          if (bi?.income?.stone) totalIncS += bi.income.stone * totalBoost;
        }
        const chestCount = placedObjectsRef.current.filter(o => o.itemType === 'storage_chest').length;
        const warehouseCount = placedObjectsRef.current.filter(o => o.itemType === 'warehouse').length;
        return (
        <div className="explore-panel" style={{ maxWidth: 400 }}>
          <div className="explore-panel-header">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#8b6c3e', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Builder</span>
                <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 3, background: `${tierColor}22`, color: tierColor, fontWeight: 700, border: `1px solid ${tierColor}44` }}>{tierLabel}</span>
              </div>
              <h3 className="explore-panel-title">Build Menu</h3>
            </div>
            <button className="explore-panel-close" onClick={() => setBuildMenuOpen(false)}>ESC</button>
          </div>

          {/* Resource bar with caps */}
          <div style={{ display: 'flex', justifyContent: 'space-around', padding: '8px 0', borderBottom: '1px solid rgba(139,108,62,0.2)', marginBottom: 4 }}>
            <span style={{ color: playerGold >= resourceCapRef.current.gold * 0.9 ? '#c04040' : '#e8c86a', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 4, background: '#e8c86a', opacity: 0.7, flexShrink: 0 }} />{playerGold}/{resourceCapRef.current.gold}</span>
            <span style={{ color: playerWood >= resourceCapRef.current.wood * 0.9 ? '#c04040' : '#8b6c3e', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 4, background: '#8b6c3e', opacity: 0.7, flexShrink: 0 }} />{playerWood}/{resourceCapRef.current.wood}</span>
            <span style={{ color: playerStone >= resourceCapRef.current.stone * 0.9 ? '#c04040' : '#808078', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 4, background: '#808078', opacity: 0.7, flexShrink: 0 }} />{playerStone}/{resourceCapRef.current.stone}</span>
          </div>

          {/* Economy summary */}
          {(totalIncG > 0 || totalIncW > 0 || totalIncS > 0 || chestCount > 0 || warehouseCount > 0 || throneCount > 0 || townHallCount > 0) && (
            <div style={{ display: 'flex', gap: 8, padding: '4px 0 6px', borderBottom: '1px solid rgba(139,108,62,0.1)', marginBottom: 6, fontSize: 9, color: 'rgba(255,255,255,0.4)', flexWrap: 'wrap' }}>
              {totalIncG > 0 && <span style={{ color: '#e8c86a' }}>+{totalIncG.toFixed(1)}G/min</span>}
              {totalIncW > 0 && <span style={{ color: '#8b6c3e' }}>+{totalIncW.toFixed(1)}W/min</span>}
              {totalIncS > 0 && <span style={{ color: '#808078' }}>+{totalIncS.toFixed(1)}S/min</span>}
              {throneCount > 0 && <span style={{ color: '#c8a040' }}>Throne +{(throneCount * 15)}%</span>}
              {townHallCount > 0 && <span style={{ color: '#b09060' }}>Hall +{(townHallCount * 10)}%</span>}
              {(chestCount > 0 || warehouseCount > 0) && <span>+{chestCount * 50 + warehouseCount * 100} cap</span>}
            </div>
          )}

          {/* Category tabs with counts */}
          <div style={{ display: 'flex', gap: 0, marginBottom: 8, borderBottom: '1px solid rgba(139,108,62,0.15)' }}>
            {([
              { id: 'all' as const, label: 'All' },
              { id: 'structures' as const, label: 'Struct' },
              { id: 'props' as const, label: 'Props' },
              { id: 'decoration' as const, label: 'Deco' },
              { id: 'functional' as const, label: 'Utility' },
            ]).map(cat => {
              const items = cat.id === 'all' ? BUILD_ITEMS : BUILD_ITEMS.filter(i => i.category === cat.id);
              const unlocked = items.filter(i => (i.tier || 1) <= curTier || unlockedItemsRef.current.has(i.id)).length;
              const active = buildCategory === cat.id;
              return (
                <button key={cat.id} onClick={() => setBuildCategory(cat.id)}
                  style={{
                    flex: 1, fontSize: 9, padding: '5px 0 3px', borderRadius: 0, border: 'none',
                    background: 'transparent',
                    color: active ? '#d4a44e' : 'rgba(255,255,255,0.35)',
                    fontWeight: active ? 700 : 500,
                    cursor: 'pointer',
                    borderBottom: active ? '2px solid #d4a44e' : '2px solid transparent',
                  }}>{cat.label} <span style={{ opacity: 0.4, fontSize: 8 }}>{unlocked}/{items.length}</span></button>
              );
            })}
          </div>

          {/* Items list — sorted: unlocked first, purchasable next, locked last */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 340, overflowY: 'auto' }}>
            {(() => {
              const filtered = BUILD_ITEMS.filter(item => buildCategory === 'all' || item.category === buildCategory);
              const unlocked: BuildableItem[] = [];
              const purchasable: BuildableItem[] = [];
              const locked: BuildableItem[] = [];
              for (const item of filtered) {
                const itemTier = item.tier || 1;
                const hasBP = unlockedItemsRef.current.has(item.id);
                if (itemTier <= curTier || hasBP) unlocked.push(item);
                else if (item.unlockMethod === 'purchase' && item.unlockPrice) purchasable.push(item);
                else locked.push(item);
              }
              const sections: { label: string; items: BuildableItem[] }[] = [];
              if (unlocked.length) sections.push({ label: '', items: unlocked });
              if (purchasable.length) sections.push({ label: 'Unlock with Gold', items: purchasable });
              if (locked.length) sections.push({ label: 'Locked — Progression', items: locked });
              return sections.map((section, si) => (
                <div key={si}>
                  {section.label && <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '6px 0 2px', fontWeight: 700, borderTop: si > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none', marginTop: si > 0 ? 4 : 0 }}>{section.label}</div>}
                  {section.items.map(item => {
                const itemTier = item.tier || 1;
                const hasBlueprint = unlockedItemsRef.current.has(item.id);
                const isLocked = itemTier > curTier && !hasBlueprint;
                const canAfford = !isLocked && playerGold >= item.cost.gold
                  && playerWood >= item.cost.wood
                  && playerStone >= item.cost.stone;
                const canBuyBlueprint = isLocked && item.unlockMethod === 'purchase' && item.unlockPrice && playerGold >= item.unlockPrice;
                // Specific lock reason
                const tierInfo = TIER_INFO.find(t => t.tier === itemTier) || TIER_INFO[0];
                const lockDesc = item.unlockMethod === 'purchase' && item.unlockPrice
                  ? `Buy blueprint (${item.unlockPrice}G) — or reach ${tierInfo.name}`
                  : `Requires ${tierInfo.name} — ${tierInfo.req}`;
                return (
                  <div key={item.id} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px',
                    background: isLocked ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.03)', borderRadius: 6,
                    border: `1px solid ${isLocked ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.06)'}`,
                    opacity: isLocked ? 0.55 : canAfford ? 1 : 0.55,
                  }}>
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <SpriteIcon img={ga ? ga[item.spriteKey as keyof GameAssets] as HTMLImageElement : undefined} size={30} dimmed={isLocked} />
                      {!isLocked && (item.tileW > 1 || item.tileH > 1) && (
                        <span style={{ position: 'absolute', bottom: -3, right: -3, fontSize: 7, background: 'rgba(139,108,62,0.7)', color: '#fff', borderRadius: 3, padding: '0 3px', fontWeight: 700 }}>
                          {item.tileW}\u00D7{item.tileH}
                        </span>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: isLocked ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                        {item.name}
                        {!isLocked && <span style={{ fontSize: 7, padding: '1px 4px', borderRadius: 2, background: `${tierInfo.color}18`, color: tierInfo.color, fontWeight: 700 }}>T{itemTier}</span>}
                        {item.income && <span style={{ fontSize: 8, color: isLocked ? 'rgba(232,200,106,0.4)' : '#e8c86a', fontWeight: 400 }}>
                          {item.income.gold ? `+${item.income.gold}G` : ''}{item.income.wood ? `+${item.income.wood}W` : ''}{item.income.stone ? `+${item.income.stone}S` : ''}/min
                        </span>}
                        {item.effect && !item.income && <span style={{ fontSize: 8, color: isLocked ? 'rgba(128,160,192,0.4)' : '#80a0c0', fontWeight: 400 }}>
                          {item.effect === 'heal_aura' ? 'Heal aura' : item.effect === 'heal_shrine' ? '+3 HP/s' : item.effect === 'forge_buff' ? '+25% dmg' : item.effect === 'storage_cap' ? '+50 cap' : item.effect === 'warehouse_cap' ? '+100 cap' : item.effect === 'throne_boost' ? '+15% income' : item.effect === 'town_hall_boost' ? '+10% income' : ''}
                        </span>}
                      </div>
                      <div style={{ fontSize: 9, color: isLocked ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.4)', lineHeight: 1.3 }}>
                        {isLocked ? lockDesc : item.description}
                      </div>
                      <div style={{ fontSize: 8, marginTop: 2, display: 'flex', gap: 6 }}>
                        {item.cost.wood > 0 && <span style={{ color: isLocked ? 'rgba(139,108,62,0.4)' : playerWood >= item.cost.wood ? '#8b6c3e' : '#c04040' }}>{item.cost.wood}w</span>}
                        {item.cost.stone > 0 && <span style={{ color: isLocked ? 'rgba(128,128,120,0.4)' : playerStone >= item.cost.stone ? '#808078' : '#c04040' }}>{item.cost.stone}s</span>}
                        {item.cost.gold > 0 && <span style={{ color: isLocked ? 'rgba(232,200,106,0.4)' : playerGold >= item.cost.gold ? '#e8c86a' : '#c04040' }}>{item.cost.gold}g</span>}
                      </div>
                    </div>
                    {isLocked && item.unlockMethod === 'purchase' && item.unlockPrice ? (
                      <button
                        onClick={() => {
                          if (!canBuyBlueprint) return;
                          const newGold = playerGold - item.unlockPrice!;
                          setPlayerGold(newGold);
                          playerGoldRef.current = newGold;
                          unlockedItemsRef.current.add(item.id);
                          setShopMessage(`Blueprint: ${item.name}!`);
                          damageNumbersRef.current.push({
                            x: playerRef.current.x * TILE_SIZE + 16,
                            y: playerRef.current.y * TILE_SIZE - 16,
                            text: `Blueprint: ${item.name}!`, color: '#80b8e0', timer: 2,
                          });
                        }}
                        disabled={!canBuyBlueprint}
                        style={{
                          padding: '4px 10px', fontSize: 10, fontWeight: 600,
                          border: 'none', borderRadius: 4, cursor: canBuyBlueprint ? 'pointer' : 'not-allowed',
                          background: canBuyBlueprint ? 'rgba(128,184,224,0.2)' : 'rgba(255,255,255,0.05)',
                          color: canBuyBlueprint ? '#80b8e0' : 'rgba(255,255,255,0.2)',
                          whiteSpace: 'nowrap',
                        }}>{item.unlockPrice}G</button>
                    ) : (
                      <button
                        onClick={() => !isLocked && enterPlacementMode(item)}
                        disabled={!canAfford}
                        style={{
                          padding: '4px 12px', fontSize: 10, fontWeight: 600,
                          border: 'none', borderRadius: 4, cursor: canAfford ? 'pointer' : 'not-allowed',
                          background: canAfford ? 'rgba(139,108,62,0.25)' : 'rgba(255,255,255,0.05)',
                          color: canAfford ? '#d4a44e' : 'rgba(255,255,255,0.2)',
                        }}>{isLocked ? 'Locked' : 'Place'}</button>
                    )}
                  </div>
                );
              })}
                </div>
              ));
            })()}
          </div>
        </div>
        );
      })()}

      {/* Shop panel */}
      {shopOpen && (
        <div className="explore-panel" style={{ maxWidth: 340 }}>
          <div className="explore-panel-header">
            <div>
              <div style={{ color: '#e8c86a', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Merchant
              </div>
              <h3 className="explore-panel-title">Market Shop</h3>
            </div>
            <button className="explore-panel-close" onClick={() => setShopOpen(false)}>ESC</button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(200,164,78,0.15)', marginBottom: 8 }}>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>Your Gold</span>
            <span style={{ color: '#e8c86a', fontWeight: 600 }}>{playerGold} G</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {SHOP_ITEMS.map(item => (
              <div key={item.id} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
                background: 'rgba(255,255,255,0.03)', borderRadius: 6,
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 4, background: item.color,
                  opacity: 0.8, flexShrink: 0,
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>{item.name}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{item.description}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 11, color: '#e8c86a', fontWeight: 600 }}>{item.price} G</div>
                  <button
                    onClick={() => buyItem(item)}
                    disabled={playerGold < item.price}
                    style={{
                      marginTop: 2, padding: '3px 10px', fontSize: 10, fontWeight: 600,
                      border: 'none', borderRadius: 4,
                      cursor: playerGold >= item.price ? 'pointer' : 'not-allowed',
                      background: playerGold >= item.price ? 'rgba(200,164,78,0.25)' : 'rgba(255,255,255,0.05)',
                      color: playerGold >= item.price ? '#e8c86a' : 'rgba(255,255,255,0.2)',
                    }}
                  >
                    Buy
                  </button>
                </div>
              </div>
            ))}
          </div>
          {shopMessage && (
            <div style={{ marginTop: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(200,164,78,0.1)', color: '#e8c86a', fontSize: 11, textAlign: 'center' }}>
              {shopMessage}
            </div>
          )}
          {Object.keys(inventory).length > 0 && (
            <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid rgba(200,164,78,0.15)' }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>Inventory — click to use</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {Object.entries(inventory).map(([id, count]) => {
                  const item = [...SHOP_ITEMS, ...GL_SHOP_ITEMS, ...SV_FOOD_SHOP_ITEMS, ...SV_GEN_SHOP_ITEMS].find(i => i.id === id);
                  if (!item || count <= 0) return null;
                  return (
                    <button key={id} onClick={() => {
                      setInventory(inv => {
                        const next = { ...inv, [id]: inv[id] - 1 };
                        if (next[id] <= 0) delete next[id];
                        return next;
                      });
                      useItem(item);
                    }} style={{
                      fontSize: 10, padding: '3px 10px', borderRadius: 4, border: 'none',
                      background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.8)',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: item.color, flexShrink: 0 }} />
                      {item.name} x{count}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Resource trade panel */}
      {tradeOpen && (
        <div className="explore-panel" style={{ maxWidth: 340 }}>
          <div className="explore-panel-header">
            <div>
              <div style={{ color: '#e8c86a', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Merchant
              </div>
              <h3 className="explore-panel-title">Resource Trading</h3>
            </div>
            <button className="explore-panel-close" onClick={() => setTradeOpen(false)}>ESC</button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(200,164,78,0.15)', marginBottom: 8 }}>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>Resources</span>
            <span style={{ color: '#e8c86a', fontWeight: 600, fontSize: 12 }}>{playerGold} G &nbsp; {playerWood} W &nbsp; {playerStone} S</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {/* Buy Wood */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ width: 28, height: 28, borderRadius: 4, background: '#8b6c3e', opacity: 0.8, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>Buy Wood</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>3 Gold → 1 Wood</div>
              </div>
              <button onClick={() => {
                if (playerGoldRef.current >= 3 && playerWoodRef.current < resourceCapRef.current.wood) {
                  playerGoldRef.current -= 3;
                  playerWoodRef.current = Math.min(playerWoodRef.current + 1, resourceCapRef.current.wood);
                  setPlayerGold(playerGoldRef.current);
                  setPlayerWood(playerWoodRef.current);
                  damageNumbersRef.current.push({ x: MERCHANT_POS.x * TILE_SIZE + 16, y: MERCHANT_POS.y * TILE_SIZE - 30, text: '+1 Wood', color: '#8b6c3e', timer: 1.5 });
                }
              }} disabled={playerGold < 3 || playerWood >= resourceCapRef.current.wood} style={{
                padding: '3px 10px', fontSize: 10, fontWeight: 600, border: 'none', borderRadius: 4, cursor: playerGold >= 3 ? 'pointer' : 'not-allowed',
                background: playerGold >= 3 ? 'rgba(139,108,62,0.25)' : 'rgba(255,255,255,0.05)',
                color: playerGold >= 3 ? '#FF6B2C' : 'rgba(255,255,255,0.2)',
              }}>Buy</button>
            </div>
            {/* Buy Stone */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ width: 28, height: 28, borderRadius: 4, background: '#808078', opacity: 0.8, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>Buy Stone</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>4 Gold → 1 Stone</div>
              </div>
              <button onClick={() => {
                if (playerGoldRef.current >= 4 && playerStoneRef.current < resourceCapRef.current.stone) {
                  playerGoldRef.current -= 4;
                  playerStoneRef.current = Math.min(playerStoneRef.current + 1, resourceCapRef.current.stone);
                  setPlayerGold(playerGoldRef.current);
                  setPlayerStone(playerStoneRef.current);
                  damageNumbersRef.current.push({ x: MERCHANT_POS.x * TILE_SIZE + 16, y: MERCHANT_POS.y * TILE_SIZE - 30, text: '+1 Stone', color: '#808078', timer: 1.5 });
                }
              }} disabled={playerGold < 4 || playerStone >= resourceCapRef.current.stone} style={{
                padding: '3px 10px', fontSize: 10, fontWeight: 600, border: 'none', borderRadius: 4, cursor: playerGold >= 4 ? 'pointer' : 'not-allowed',
                background: playerGold >= 4 ? 'rgba(128,128,120,0.25)' : 'rgba(255,255,255,0.05)',
                color: playerGold >= 4 ? '#a0a098' : 'rgba(255,255,255,0.2)',
              }}>Buy</button>
            </div>
            {/* Sell Wood */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ width: 28, height: 28, borderRadius: 4, background: '#8b6c3e', opacity: 0.8, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 10, color: '#fff', fontWeight: 700 }}>W</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>Sell Wood</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>1 Wood → 1 Gold</div>
              </div>
              <button onClick={() => {
                if (playerWoodRef.current >= 1 && playerGoldRef.current < resourceCapRef.current.gold) {
                  playerWoodRef.current -= 1;
                  playerGoldRef.current = Math.min(playerGoldRef.current + 1, resourceCapRef.current.gold);
                  setPlayerWood(playerWoodRef.current);
                  setPlayerGold(playerGoldRef.current);
                  damageNumbersRef.current.push({ x: MERCHANT_POS.x * TILE_SIZE + 16, y: MERCHANT_POS.y * TILE_SIZE - 30, text: '+1 Gold', color: '#e8c86a', timer: 1.5 });
                }
              }} disabled={playerWood < 1 || playerGold >= resourceCapRef.current.gold} style={{
                padding: '3px 10px', fontSize: 10, fontWeight: 600, border: 'none', borderRadius: 4, cursor: playerWood >= 1 ? 'pointer' : 'not-allowed',
                background: playerWood >= 1 ? 'rgba(139,108,62,0.25)' : 'rgba(255,255,255,0.05)',
                color: playerWood >= 1 ? '#FF6B2C' : 'rgba(255,255,255,0.2)',
              }}>Sell</button>
            </div>
            {/* Sell Stone */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ width: 28, height: 28, borderRadius: 4, background: '#808078', opacity: 0.8, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 10, color: '#fff', fontWeight: 700 }}>S</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>Sell Stone</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>1 Stone → 2 Gold</div>
              </div>
              <button onClick={() => {
                if (playerStoneRef.current >= 1 && playerGoldRef.current < resourceCapRef.current.gold) {
                  playerStoneRef.current -= 1;
                  playerGoldRef.current = Math.min(playerGoldRef.current + 2, resourceCapRef.current.gold);
                  setPlayerStone(playerStoneRef.current);
                  setPlayerGold(playerGoldRef.current);
                  damageNumbersRef.current.push({ x: MERCHANT_POS.x * TILE_SIZE + 16, y: MERCHANT_POS.y * TILE_SIZE - 30, text: '+2 Gold', color: '#e8c86a', timer: 1.5 });
                }
              }} disabled={playerStone < 1 || playerGold >= resourceCapRef.current.gold} style={{
                padding: '3px 10px', fontSize: 10, fontWeight: 600, border: 'none', borderRadius: 4, cursor: playerStone >= 1 ? 'pointer' : 'not-allowed',
                background: playerStone >= 1 ? 'rgba(128,128,120,0.25)' : 'rgba(255,255,255,0.05)',
                color: playerStone >= 1 ? '#a0a098' : 'rgba(255,255,255,0.2)',
              }}>Sell</button>
            </div>
          </div>
          <div style={{ marginTop: 10, padding: '6px 10px', borderRadius: 4, background: 'rgba(200,164,78,0.08)', color: 'rgba(255,255,255,0.4)', fontSize: 10, textAlign: 'center' }}>
            Buy resources to build structures, or sell excess for gold.
          </div>
        </div>
      )}

      {/* Grassland vendor shop */}
      {glShopOpen && (
        <div className="explore-panel" style={{ maxWidth: 340 }}>
          <div className="explore-panel-header">
            <div>
              <div style={{ color: '#e8c86a', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Vendor Camp
              </div>
              <h3 className="explore-panel-title">Traveling Vendor</h3>
            </div>
            <button className="explore-panel-close" onClick={() => setGlShopOpen(false)}>ESC</button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(200,164,78,0.15)', marginBottom: 8 }}>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>Your Gold</span>
            <span style={{ color: '#e8c86a', fontWeight: 600 }}>{playerGold} G</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {GL_SHOP_ITEMS.map(item => (
              <div key={item.id} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
                background: 'rgba(255,255,255,0.03)', borderRadius: 6,
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 4, background: item.color,
                  opacity: 0.8, flexShrink: 0,
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>{item.name}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{item.description}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 11, color: '#e8c86a', fontWeight: 600 }}>{item.price} G</div>
                  <button
                    onClick={() => buyItem(item)}
                    disabled={playerGold < item.price}
                    style={{
                      marginTop: 2, padding: '3px 10px', fontSize: 10, fontWeight: 600,
                      border: 'none', borderRadius: 4,
                      cursor: playerGold >= item.price ? 'pointer' : 'not-allowed',
                      background: playerGold >= item.price ? 'rgba(200,164,78,0.25)' : 'rgba(255,255,255,0.05)',
                      color: playerGold >= item.price ? '#e8c86a' : 'rgba(255,255,255,0.2)',
                    }}
                  >
                    Buy
                  </button>
                </div>
              </div>
            ))}
          </div>
          {shopMessage && (
            <div style={{ marginTop: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(200,164,78,0.1)', color: '#e8c86a', fontSize: 11, textAlign: 'center' }}>
              {shopMessage}
            </div>
          )}
          {Object.keys(inventory).length > 0 && (
            <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid rgba(200,164,78,0.15)' }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>Inventory — click to use</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {Object.entries(inventory).map(([id, count]) => {
                  const item = [...SHOP_ITEMS, ...GL_SHOP_ITEMS, ...SV_FOOD_SHOP_ITEMS, ...SV_GEN_SHOP_ITEMS].find(i => i.id === id);
                  if (!item || count <= 0) return null;
                  return (
                    <button key={id} onClick={() => {
                      setInventory(inv => {
                        const next = { ...inv, [id]: inv[id] - 1 };
                        if (next[id] <= 0) delete next[id];
                        return next;
                      });
                      useItem(item);
                    }} style={{
                      fontSize: 10, padding: '3px 10px', borderRadius: 4, border: 'none',
                      background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.8)',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: item.color, flexShrink: 0 }} />
                      {item.name} x{count}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {svFoodShopOpen && (
        <div className="explore-panel" style={{ maxWidth: 340 }}>
          <div className="explore-panel-header">
            <div>
              <div style={{ color: '#60a8c0', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Seaside Village
              </div>
              <h3 className="explore-panel-title">Fiona — Food Merchant</h3>
            </div>
            <button className="explore-panel-close" onClick={() => setSvFoodShopOpen(false)}>ESC</button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(120,180,200,0.15)', marginBottom: 8 }}>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>Your Gold</span>
            <span style={{ color: '#e8c86a', fontWeight: 600 }}>{playerGold} G</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {SV_FOOD_SHOP_ITEMS.map(item => (
              <div key={item.id} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
                background: 'rgba(255,255,255,0.03)', borderRadius: 6,
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <div style={{ width: 28, height: 28, borderRadius: 4, background: item.color, opacity: 0.8, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>{item.name}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{item.description}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 11, color: '#e8c86a', fontWeight: 600 }}>{item.price} G</div>
                  <button onClick={() => buyItem(item)} disabled={playerGold < item.price} style={{
                    marginTop: 2, padding: '3px 10px', fontSize: 10, fontWeight: 600,
                    border: 'none', borderRadius: 4,
                    cursor: playerGold >= item.price ? 'pointer' : 'not-allowed',
                    background: playerGold >= item.price ? 'rgba(120,180,200,0.25)' : 'rgba(255,255,255,0.05)',
                    color: playerGold >= item.price ? '#78b4cc' : 'rgba(255,255,255,0.2)',
                  }}>Buy</button>
                </div>
              </div>
            ))}
          </div>
          {shopMessage && (
            <div style={{ marginTop: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(120,180,200,0.1)', color: '#78b4cc', fontSize: 11, textAlign: 'center' }}>
              {shopMessage}
            </div>
          )}
        </div>
      )}

      {svGenShopOpen && (
        <div className="explore-panel" style={{ maxWidth: 340 }}>
          <div className="explore-panel-header">
            <div>
              <div style={{ color: '#80a060', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Seaside Village
              </div>
              <h3 className="explore-panel-title">Gerald — General Merchant</h3>
            </div>
            <button className="explore-panel-close" onClick={() => setSvGenShopOpen(false)}>ESC</button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(128,160,96,0.15)', marginBottom: 8 }}>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>Your Gold</span>
            <span style={{ color: '#e8c86a', fontWeight: 600 }}>{playerGold} G</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {SV_GEN_SHOP_ITEMS.map(item => (
              <div key={item.id} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
                background: 'rgba(255,255,255,0.03)', borderRadius: 6,
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <div style={{ width: 28, height: 28, borderRadius: 4, background: item.color, opacity: 0.8, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>{item.name}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{item.description}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 11, color: '#e8c86a', fontWeight: 600 }}>{item.price} G</div>
                  <button onClick={() => buyItem(item)} disabled={playerGold < item.price} style={{
                    marginTop: 2, padding: '3px 10px', fontSize: 10, fontWeight: 600,
                    border: 'none', borderRadius: 4,
                    cursor: playerGold >= item.price ? 'pointer' : 'not-allowed',
                    background: playerGold >= item.price ? 'rgba(128,160,96,0.25)' : 'rgba(255,255,255,0.05)',
                    color: playerGold >= item.price ? '#80a060' : 'rgba(255,255,255,0.2)',
                  }}>Buy</button>
                </div>
              </div>
            ))}
          </div>
          {shopMessage && (
            <div style={{ marginTop: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(128,160,96,0.1)', color: '#80a060', fontSize: 11, textAlign: 'center' }}>
              {shopMessage}
            </div>
          )}
        </div>
      )}

      {svWitchShopOpen && (
        <div className="explore-panel" style={{ maxWidth: 340 }}>
          <div className="explore-panel-header">
            <div>
              <div style={{ color: '#9060c0', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Fortune Teller
              </div>
              <h3 className="explore-panel-title">Willow — Potions</h3>
            </div>
            <button className="explore-panel-close" onClick={() => setSvWitchShopOpen(false)}>ESC</button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(144,96,192,0.15)', marginBottom: 8 }}>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>Your Gold</span>
            <span style={{ color: '#e8c86a', fontWeight: 600 }}>{playerGold} G</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {SV_WITCH_SHOP.map(item => (
              <div key={item.id} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
                background: 'rgba(255,255,255,0.03)', borderRadius: 6,
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <div style={{ width: 28, height: 28, borderRadius: 4, background: item.color, opacity: 0.8, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>{item.name}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{item.description}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 11, color: '#e8c86a', fontWeight: 600 }}>{item.price} G</div>
                  <button onClick={() => buyItem(item)} disabled={playerGold < item.price} style={{
                    marginTop: 2, padding: '3px 10px', fontSize: 10, fontWeight: 600,
                    border: 'none', borderRadius: 4,
                    cursor: playerGold >= item.price ? 'pointer' : 'not-allowed',
                    background: playerGold >= item.price ? 'rgba(144,96,192,0.25)' : 'rgba(255,255,255,0.05)',
                    color: playerGold >= item.price ? '#9060c0' : 'rgba(255,255,255,0.2)',
                  }}>Buy</button>
                </div>
              </div>
            ))}
          </div>
          {shopMessage && (
            <div style={{ marginTop: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(144,96,192,0.1)', color: '#9060c0', fontSize: 11, textAlign: 'center' }}>
              {shopMessage}
            </div>
          )}
        </div>
      )}

      {/* Interact hints — merchant takes priority */}
      {nearMerchant && !shopOpen && !inspecting && (
        <div className="explore-interact-hint">
          Press <strong>E</strong> to talk to <strong>Town Merchant</strong>
        </div>
      )}
      {nearbyEntity && !nearMerchant && !inspecting && !shopOpen && (
        <div className="explore-interact-hint">
          Press <strong>E</strong> to inspect <strong>{nearbyEntity.title}</strong>
        </div>
      )}

      {/* ── Top Action Bar ── */}
      <div style={{
        position: 'absolute', top: 12, right: 16, display: 'flex', gap: 4, zIndex: 20,
      }}>
        {([
          { label: 'Shop', shortcut: 'P', active: unifiedShopOpen, onClick: () => { setUnifiedShopOpen(s => !s); setBuildMenuOpen(false); setHelpOpen(false); },
            icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>,
            color: '#e8c86a' },
          ...(isOwner ? [{ label: 'Build', shortcut: 'B', active: buildMenuOpen, onClick: () => { setBuildMenuOpen(b => !b); setUnifiedShopOpen(false); setHelpOpen(false); },
            icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>,
            color: '#d4a44e' }] : []),
          { label: 'Guide', shortcut: '?', active: helpOpen, onClick: () => { setHelpOpen(h => !h); setUnifiedShopOpen(false); setBuildMenuOpen(false); },
            icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
            color: '#80a0e0' },
        ] as { label: string; shortcut: string; active: boolean; onClick: () => void; icon: React.ReactNode; color: string }[]).map(btn => (
          <button key={btn.label} onClick={btn.onClick} style={{
            display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 6,
            border: btn.active ? `1px solid ${btn.color}40` : '1px solid rgba(255,255,255,0.08)',
            background: btn.active ? `${btn.color}18` : 'rgba(6,6,8,0.78)',
            color: btn.active ? btn.color : 'rgba(255,255,255,0.55)',
            cursor: 'pointer', fontSize: 11, fontWeight: 600, letterSpacing: '0.02em',
            backdropFilter: 'blur(8px)',
            transition: 'all 0.15s ease',
          }}>
            {btn.icon}
            <span>{btn.label}</span>
            <span style={{ fontSize: 8, opacity: 0.4, fontWeight: 700, marginLeft: 2, fontFamily: 'monospace' }}>{btn.shortcut}</span>
          </button>
        ))}
      </div>

      {/* Unified shop panel */}
      {unifiedShopOpen && (() => {
        const allConsumables = [...SHOP_ITEMS, ...GL_SHOP_ITEMS, ...SV_FOOD_SHOP_ITEMS, ...SV_GEN_SHOP_ITEMS];
        // Deduplicate by id
        const seenIds = new Set<string>();
        const uniqueConsumables = allConsumables.filter(i => { if (seenIds.has(i.id)) return false; seenIds.add(i.id); return true; });
        const purchasableBlueprints = BUILD_ITEMS.filter(i => i.unlockMethod === 'purchase' && i.unlockPrice);
        const curTier = playerTierRef.current;
        return (
        <div className="explore-panel" style={{ maxWidth: 420 }}>
          <div className="explore-panel-header">
            <div>
              <div style={{ color: '#e8c86a', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Shop</div>
              <h3 className="explore-panel-title">General Store</h3>
            </div>
            <button className="explore-panel-close" onClick={() => setUnifiedShopOpen(false)}>ESC</button>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 0, marginBottom: 8, borderBottom: '1px solid rgba(200,164,78,0.12)' }}>
            {(['consumables', 'blueprints', 'trading'] as const).map(id => {
              const labels = { consumables: 'Items', blueprints: 'Blueprints', trading: 'Trade' };
              const active = shopTab === id;
              return (
              <button key={id} onClick={() => setShopTab(id)} style={{
                flex: 1, padding: '7px 0 5px', fontSize: 11, fontWeight: active ? 700 : 500, border: 'none', borderRadius: 0, cursor: 'pointer',
                background: 'transparent',
                color: active ? '#e8c86a' : 'rgba(255,255,255,0.35)',
                borderBottom: active ? '2px solid #e8c86a' : '2px solid transparent',
                letterSpacing: '0.03em',
              }}>{labels[id]}</button>
              );
            })}
          </div>

          {/* Tab description */}
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginBottom: 6, lineHeight: 1.4 }}>
            {shopTab === 'consumables' && 'Potions, buffs, and healing items. Click inventory items to use.'}
            {shopTab === 'blueprints' && 'Unlock buildings early with gold. Unlocked items appear in Build menu.'}
            {shopTab === 'trading' && 'Buy and sell resources at the merchant.'}
          </div>

          {/* Gold display */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0 6px', borderBottom: '1px solid rgba(200,164,78,0.08)', marginBottom: 6 }}>
            <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10 }}>Gold</span>
            <span style={{ color: '#e8c86a', fontWeight: 700, fontSize: 12 }}>{playerGold}</span>
          </div>

          {/* Consumables tab */}
          {shopTab === 'consumables' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, maxHeight: 300, overflowY: 'auto' }}>
              {uniqueConsumables.map(item => {
                const iconFn = EFFECT_ICONS[item.effect] || EFFECT_ICONS.heal;
                return (
                <div key={item.id} style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px',
                  background: 'rgba(255,255,255,0.03)', borderRadius: 6, border: '1px solid rgba(255,255,255,0.06)',
                }}>
                  <div style={{ width: 28, height: 28, borderRadius: 5, background: `${item.color}18`, border: `1px solid ${item.color}25`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {iconFn(item.color)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>{item.name}</div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>
                      {item.effectLabel && <span style={{ color: item.color, fontWeight: 600, marginRight: 4 }}>{item.effectLabel}</span>}
                      {item.duration > 0 ? `${item.duration}s` : ''}
                    </div>
                  </div>
                  <button onClick={() => buyItem(item)} disabled={playerGold < item.price} style={{
                    padding: '4px 10px', fontSize: 10, fontWeight: 700, border: 'none', borderRadius: 4,
                    cursor: playerGold >= item.price ? 'pointer' : 'not-allowed',
                    background: playerGold >= item.price ? 'rgba(139,108,62,0.25)' : 'rgba(255,255,255,0.05)',
                    color: playerGold >= item.price ? '#d4a44e' : 'rgba(255,255,255,0.2)',
                    whiteSpace: 'nowrap',
                  }}>{item.price}G</button>
                </div>
                );
              })}
              {/* Inventory section */}
              {Object.keys(inventory).length > 0 && (
                <div style={{ marginTop: 6, padding: '6px 0', borderTop: '1px solid rgba(200,164,78,0.1)' }}>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Inventory (click to use)</div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {Object.entries(inventory).filter(([, qty]) => qty > 0).map(([id, qty]) => {
                      const item = [...SHOP_ITEMS, ...GL_SHOP_ITEMS, ...SV_FOOD_SHOP_ITEMS, ...SV_GEN_SHOP_ITEMS].find(i => i.id === id);
                      if (!item) return null;
                      return (
                        <button key={id} onClick={() => {
                          setInventory(inv => {
                            const newInv = { ...inv };
                            if (newInv[id] > 1) newInv[id]--; else delete newInv[id];
                            return newInv;
                          });
                          useItem(item);
                        }} style={{
                          padding: '3px 8px', fontSize: 9, fontWeight: 600, border: 'none', borderRadius: 4, cursor: 'pointer',
                          background: `${item.color}25`, color: item.color,
                        }}>{item.name} x{qty}</button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Blueprints tab */}
          {shopTab === 'blueprints' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, maxHeight: 300, overflowY: 'auto' }}>
              {purchasableBlueprints.map(item => {
                const itemTier = item.tier || 1;
                const owned = unlockedItemsRef.current.has(item.id) || itemTier <= curTier;
                return (
                  <div key={item.id} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px',
                    background: owned ? 'rgba(96,192,96,0.04)' : 'rgba(255,255,255,0.03)', borderRadius: 6,
                    border: `1px solid ${owned ? 'rgba(96,192,96,0.15)' : 'rgba(255,255,255,0.06)'}`,
                    opacity: owned ? 0.7 : 1,
                  }}>
                    <SpriteIcon img={ga ? ga[item.spriteKey as keyof GameAssets] as HTMLImageElement : undefined} size={28} dimmed={owned} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                        {item.name}
                        {(() => { const bpTI = TIER_INFO.find(t => t.tier === itemTier); return bpTI ? <span style={{ fontSize: 7, padding: '1px 4px', borderRadius: 2, background: `${bpTI.color}18`, color: bpTI.color, fontWeight: 700 }}>T{itemTier}</span> : null; })()}
                        {item.income && <span style={{ fontSize: 8, color: '#e8c86a', fontWeight: 400 }}>
                          {item.income.gold ? `+${item.income.gold}G` : ''}{item.income.wood ? `+${item.income.wood}W` : ''}{item.income.stone ? `+${item.income.stone}S` : ''}/min
                        </span>}
                        {item.effect && !item.income && <span style={{ fontSize: 8, color: '#80a0c0', fontWeight: 400 }}>
                          {item.effect === 'heal_aura' ? 'Heal aura' : item.effect === 'heal_shrine' ? '+3 HP/s' : item.effect === 'storage_cap' ? '+50 cap' : ''}
                        </span>}
                      </div>
                      <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>{item.description}</div>
                      <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>
                        Build: {item.cost.wood > 0 ? `${item.cost.wood}W ` : ''}{item.cost.stone > 0 ? `${item.cost.stone}S ` : ''}{item.cost.gold > 0 ? `${item.cost.gold}G` : ''}
                      </div>
                    </div>
                    {owned ? (
                      <span style={{ fontSize: 9, fontWeight: 600, color: '#60c060', padding: '3px 8px' }}>Owned</span>
                    ) : (
                      <button onClick={() => {
                        if (playerGold < item.unlockPrice!) return;
                        const newGold = playerGold - item.unlockPrice!;
                        setPlayerGold(newGold);
                        playerGoldRef.current = newGold;
                        unlockedItemsRef.current.add(item.id);
                        setShopMessage(`Blueprint: ${item.name}!`);
                        damageNumbersRef.current.push({ x: playerRef.current.x * TILE_SIZE + 16, y: playerRef.current.y * TILE_SIZE - 16, text: `Blueprint: ${item.name}!`, color: '#80b8e0', timer: 2 });
                        setTimeout(() => setShopMessage(null), 2000);
                      }} disabled={playerGold < item.unlockPrice!} style={{
                        padding: '3px 10px', fontSize: 10, fontWeight: 600, border: 'none', borderRadius: 4, cursor: playerGold >= item.unlockPrice! ? 'pointer' : 'not-allowed', whiteSpace: 'nowrap',
                        background: playerGold >= item.unlockPrice! ? 'rgba(128,184,224,0.2)' : 'rgba(255,255,255,0.05)',
                        color: playerGold >= item.unlockPrice! ? '#80b8e0' : 'rgba(255,255,255,0.2)',
                      }}>{item.unlockPrice}G</button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Trading tab */}
          {shopTab === 'trading' && (
            nearMerchant ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 10, color: '#8b6c3e' }}>Wood: {playerWood}</span>
                  <span style={{ fontSize: 10, color: '#808078' }}>Stone: {playerStone}</span>
                </div>
                {[
                  { label: 'Buy Wood', desc: '3G → 1 Wood', canDo: playerGold >= 3, action: () => { setPlayerGold(g => g - 3); setPlayerWood(w => w + 1); damageNumbersRef.current.push({ x: MERCHANT_POS.x * TILE_SIZE + 16, y: MERCHANT_POS.y * TILE_SIZE - 30, text: '+1 Wood', color: '#8b6c3e', timer: 1.5 }); } },
                  { label: 'Buy Stone', desc: '4G → 1 Stone', canDo: playerGold >= 4, action: () => { setPlayerGold(g => g - 4); setPlayerStone(s => s + 1); damageNumbersRef.current.push({ x: MERCHANT_POS.x * TILE_SIZE + 16, y: MERCHANT_POS.y * TILE_SIZE - 30, text: '+1 Stone', color: '#808078', timer: 1.5 }); } },
                  { label: 'Sell Wood', desc: '1 Wood → 1G', canDo: playerWood >= 1, action: () => { setPlayerWood(w => w - 1); setPlayerGold(g => g + 1); damageNumbersRef.current.push({ x: MERCHANT_POS.x * TILE_SIZE + 16, y: MERCHANT_POS.y * TILE_SIZE - 30, text: '+1 Gold', color: '#e8c86a', timer: 1.5 }); } },
                  { label: 'Sell Stone', desc: '1 Stone → 2G', canDo: playerStone >= 1, action: () => { setPlayerStone(s => s - 1); setPlayerGold(g => g + 2); damageNumbersRef.current.push({ x: MERCHANT_POS.x * TILE_SIZE + 16, y: MERCHANT_POS.y * TILE_SIZE - 30, text: '+2 Gold', color: '#e8c86a', timer: 1.5 }); } },
                ].map(trade => (
                  <div key={trade.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>{trade.label}</div>
                      <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>{trade.desc}</div>
                    </div>
                    <button onClick={trade.action} disabled={!trade.canDo} style={{
                      padding: '3px 10px', fontSize: 10, fontWeight: 600, border: 'none', borderRadius: 4,
                      cursor: trade.canDo ? 'pointer' : 'not-allowed',
                      background: trade.canDo ? 'rgba(139,108,62,0.25)' : 'rgba(255,255,255,0.05)',
                      color: trade.canDo ? '#d4a44e' : 'rgba(255,255,255,0.2)',
                    }}>Trade</button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '20px 0', textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>Visit the Town Merchant to trade resources.</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>Walk to the merchant in the hub area and press E.</div>
              </div>
            )
          )}

          {shopMessage && (
            <div style={{ marginTop: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(120,180,200,0.1)', color: '#78b4cc', fontSize: 11, textAlign: 'center' }}>
              {shopMessage}
            </div>
          )}
        </div>
        );
      })()}

      {/* Help panel */}
      {helpOpen && (() => {
        const curTier = playerTierRef.current;
        return (
        <div className="explore-panel" style={{ maxWidth: 440 }}>
          <div className="explore-panel-header">
            <div>
              <div style={{ color: '#80a0e0', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Help</div>
              <h3 className="explore-panel-title">How to Play</h3>
            </div>
            <button className="explore-panel-close" onClick={() => setHelpOpen(false)}>ESC</button>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 0, marginBottom: 10, borderBottom: '1px solid rgba(128,160,224,0.12)' }}>
            {(['controls', 'progression', 'economy', 'combat'] as const).map(id => {
              const labels = { controls: 'Controls', progression: 'Tiers', economy: 'Economy', combat: 'Combat' };
              const active = helpTab === id;
              return (
              <button key={id} onClick={() => setHelpTab(id)} style={{
                flex: 1, padding: '7px 0 5px', fontSize: 10, fontWeight: active ? 700 : 500, border: 'none', borderRadius: 0, cursor: 'pointer',
                background: 'transparent',
                color: active ? '#80a0e0' : 'rgba(255,255,255,0.35)',
                borderBottom: active ? '2px solid #80a0e0' : '2px solid transparent',
                letterSpacing: '0.03em',
              }}>{labels[id]}</button>
              );
            })}
          </div>

          {/* Controls tab */}
          {helpTab === 'controls' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {[
                { key: 'WASD', desc: 'Move around' },
                { key: 'E', desc: 'Interact / collect' },
                { key: 'SPACE', desc: 'Attack enemies' },
                { key: '1 2 3', desc: 'Dialogue choices' },
                { key: 'B', desc: 'Build menu (owner)' },
                { key: 'P', desc: 'Open shop' },
                { key: 'R', desc: 'Rotate placement' },
                { key: 'M', desc: 'Toggle minimap' },
                { key: '?', desc: 'This help panel' },
                { key: 'ESC', desc: 'Close panels' },
              ].map(ctrl => (
                <div key={ctrl.key} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 6px' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#e8c86a', background: 'rgba(200,164,78,0.15)', padding: '2px 6px', borderRadius: 3, fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{ctrl.key}</span>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>{ctrl.desc}</span>
                </div>
              ))}
            </div>
          )}

          {/* Progression tab */}
          {helpTab === 'progression' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, maxHeight: 360, overflowY: 'auto' }}>
              {TIER_INFO.map((t, idx) => {
                const tierItems = BUILD_ITEMS.filter(i => (i.tier || 1) === t.tier);
                const itemNames = tierItems.map(i => i.name).join(', ');
                const isNext = t.tier === curTier + 1;
                return (
                <div key={t.tier} style={{
                  padding: '7px 10px', borderRadius: 6,
                  border: `1px solid ${curTier === t.tier ? `${t.color}50` : isNext ? `${t.color}25` : 'rgba(255,255,255,0.06)'}`,
                  background: curTier === t.tier ? `${t.color}10` : 'rgba(255,255,255,0.02)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
                    <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 4, background: t.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: t.color }}>{t.name}</span>
                    {curTier === t.tier && <span style={{ fontSize: 7, padding: '1px 5px', borderRadius: 3, background: `${t.color}30`, color: t.color, fontWeight: 700 }}>CURRENT</span>}
                    {curTier > t.tier && <span style={{ fontSize: 7, padding: '1px 5px', borderRadius: 3, background: 'rgba(120,200,80,0.15)', color: '#78c850', fontWeight: 700 }}>DONE</span>}
                  </div>
                  <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.5)', marginBottom: 3 }}>{t.req}</div>
                  <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', lineHeight: 1.3 }}>Unlocks: {itemNames || 'None'}</div>
                  {idx < TIER_INFO.length - 1 && isNext && (
                    <div style={{ fontSize: 8, color: t.color, marginTop: 3, fontWeight: 600 }}>{'\u25B6'} Next: {t.nextReq}</div>
                  )}
                </div>
                );
              })}
              <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', marginTop: 2, fontStyle: 'italic' }}>
                Some buildings can be unlocked early by purchasing blueprints from the Shop (P key).
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                <div style={{ flex: 1, padding: '6px 8px', borderRadius: 5, background: 'rgba(128,160,224,0.06)', border: '1px solid rgba(128,160,224,0.12)' }}>
                  <div style={{ fontSize: 9, fontWeight: 600, color: '#80a0e0', marginBottom: 2 }}>Discoveries</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>{discoveriesRef.current.size} <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)' }}>found</span></div>
                </div>
                <div style={{ flex: 1, padding: '6px 8px', borderRadius: 5, background: 'rgba(200,164,78,0.06)', border: '1px solid rgba(200,164,78,0.12)' }}>
                  <div style={{ fontSize: 9, fontWeight: 600, color: '#FF6B2C', marginBottom: 2 }}>Buildings</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>{buildingCountRef.current} <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)' }}>placed</span></div>
                </div>
                <div style={{ flex: 1, padding: '6px 8px', borderRadius: 5, background: 'rgba(112,184,104,0.06)', border: '1px solid rgba(112,184,104,0.12)' }}>
                  <div style={{ fontSize: 9, fontWeight: 600, color: '#70b868', marginBottom: 2 }}>Population</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>{populationRef.current} <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)' }}>townsfolk</span></div>
                </div>
              </div>
            </div>
          )}

          {/* Economy tab */}
          {helpTab === 'economy' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {[
                  { title: 'Gold Income', color: '#e8c86a', desc: 'Market Stall (+2G), Food Stall (+1G), Garden (+1G), Inn (+3G), Trade Wagon (+3G)' },
                  { title: 'Wood Income', color: '#8b6c3e', desc: 'Lumber Pile (+1W), Lumber Yard (+2W). +25% near forests.' },
                  { title: 'Stone Income', color: '#808078', desc: 'Stone Quarry (+1S), Stone Yard (+2S). +25% near rocks.' },
                  { title: 'Boosts', color: '#c8a040', desc: 'Throne +15%, Town Hall +10%, Merchant Hall +25% gold, Manor +10%. Stackable!' },
                  { title: 'Population', color: '#70b868', desc: 'Houses add population. Every 3 pop: +1G/min. Every 5 pop: +5% income. Townsfolk appear at 3+ pop.' },
                  { title: 'Buildings', color: '#8888b0', desc: 'Barracks: +15% dmg. Temple: +2 HP/s zone heal. Lodge: heal aura. Granary: +150 resource cap.' },
                ].map(card => (
                  <div key={card.title} style={{ padding: '8px', borderRadius: 6, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: card.color, marginBottom: 4 }}>{card.title}</div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', lineHeight: 1.4 }}>{card.desc}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', lineHeight: 1.4 }}>
                Collect coins scattered around the world. Forage wood and stone at resource nodes (press E). Press E near income buildings to collect earnings. Storage Chests (+50), Warehouses (+100), and Granaries (+150) increase resource caps.
              </div>
            </div>
          )}

          {/* Combat tab */}
          {helpTab === 'combat' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px 10px', alignItems: 'center' }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#e8c86a', background: 'rgba(200,164,78,0.15)', padding: '2px 6px', borderRadius: 3, fontFamily: 'monospace' }}>SPACE</span>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>Melee attack (1.5 tile range, 15-20 dmg)</span>
              </div>
              <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>Combat Buffs</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {[
                  { name: 'Strength Tonic', desc: '+50% damage for 30s', color: '#d08030', source: 'Grassland vendor / Shop' },
                  { name: 'Iron Shield', desc: '-30% damage taken for 45s', color: '#6080b0', source: 'Grassland vendor / Shop' },
                  { name: 'Training Dummy', desc: '+20% damage buff', color: '#a08060', source: 'Build & interact (E)' },
                  { name: 'Forge', desc: '+25% damage for 45s', color: '#c06030', source: 'Build & interact (E)' },
                  { name: 'Shrine', desc: '+50% dmg, -20% taken for 45s', color: '#80a0c0', source: 'Clear orcs near shrine' },
                  { name: 'Barracks', desc: '+15% damage zone-wide (passive)', color: '#7a6a50', source: 'Build barracks' },
                ].map(buff => (
                  <div key={buff.name} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 6px' }}>
                    <div style={{ width: 6, height: 6, borderRadius: 3, background: buff.color, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>{buff.name}</span>
                      <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginLeft: 6 }}>{buff.desc}</span>
                    </div>
                    <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)' }}>{buff.source}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        );
      })()}

      {/* Tutorial overlay */}
      {tutorialStep > 0 && (() => {
        const steps = [
          { title: 'Movement', desc: 'Use WASD to move around. Explore the hub to find coins, resources, and NPCs.' },
          { title: 'Interact', desc: 'Press E near NPCs to talk, near resources to gather, near buildings to collect earnings.' },
          { title: 'Combat', desc: 'Press SPACE to attack enemies. Visit the grassland through the Northern Pass for combat.' },
          { title: 'Building', desc: 'Press B to open the build menu. Place structures, income buildings, and decorations.' },
          { title: 'Economy', desc: 'Build Market Stalls and resource buildings to earn gold, wood, and stone passively. Walk near and press E to collect.' },
          { title: 'Progression', desc: 'Complete zone quests to unlock better buildings. Trade resources at the merchant. Build your world!' },
        ];
        const step = steps[tutorialStep - 1];
        if (!step) return null;
        return (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
            <div style={{ width: 400, background: 'rgba(20,18,16,0.95)', border: '1px solid rgba(200,164,78,0.3)', borderRadius: 10, padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>Tutorial — Step {tutorialStep} of {steps.length}</span>
                <button onClick={() => setTutorialStep(0)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 11 }}>Skip</button>
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#e8c86a', marginBottom: 8 }}>{step.title}</h3>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5, marginBottom: 20 }}>{step.desc}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 4 }}>
                  {steps.map((_, i) => (
                    <div key={i} style={{ width: 8, height: 8, borderRadius: 4, background: i < tutorialStep ? '#e8c86a' : 'rgba(255,255,255,0.15)' }} />
                  ))}
                </div>
                <button onClick={() => { if (tutorialStep >= steps.length) { setTutorialStep(0); localStorage.setItem('wf_tutorial_done', '1'); } else { setTutorialStep(tutorialStep + 1); } }} style={{
                  padding: '6px 20px', fontSize: 12, fontWeight: 600, border: 'none', borderRadius: 5,
                  background: 'rgba(200,164,78,0.25)', color: '#e8c86a', cursor: 'pointer',
                }}>
                  {tutorialStep >= steps.length ? 'Done' : 'Next'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Multiplayer: Online count ── */}
      {mp.connectedRef.current && (
        <div style={{
          position: 'absolute', top: 12, left: 16, zIndex: 20,
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '4px 10px', borderRadius: 0,
          background: 'rgba(6,6,8,0.78)', border: '1px solid rgba(255,255,255,0.08)',
          fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.55)',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: 3, background: '#36B37E', flexShrink: 0 }} />
          {mp.onlineCountRef.current} online
        </div>
      )}

      {/* ── Multiplayer: Chat ── */}
      <div style={{
        position: 'absolute', bottom: 60, left: 16, zIndex: 20,
        width: 280, display: 'flex', flexDirection: 'column', gap: 4,
      }}>
        {/* Chat messages */}
        {mp.chatRef.current.length > 0 && (
          <div style={{
            maxHeight: 120, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2,
            padding: '4px 8px', background: 'rgba(6,6,8,0.7)', borderRadius: 0,
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            {mp.chatRef.current.slice(-8).map((msg, i) => (
              <div key={i} style={{ fontSize: 10, lineHeight: '14px', color: 'rgba(255,255,255,0.7)' }}>
                <span style={{ color: '#80d0ff', fontWeight: 600 }}>{msg.playerName}: </span>
                {msg.message}
              </div>
            ))}
          </div>
        )}
        {/* Chat input */}
        {chatVisible ? (
          <form onSubmit={(e) => {
            e.preventDefault();
            if (chatInput.trim()) {
              mp.sendChat(chatInput.trim());
              setChatInput('');
            }
            setChatVisible(false);
            canvasRef.current?.focus();
          }} style={{ display: 'flex', gap: 4 }}>
            <input
              ref={chatInputRef}
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Escape') { setChatVisible(false); canvasRef.current?.focus(); } }}
              placeholder="Type a message..."
              maxLength={200}
              autoFocus
              style={{
                flex: 1, padding: '5px 8px', fontSize: 11, fontWeight: 500,
                background: 'rgba(6,6,8,0.85)', color: '#e8e0d4',
                border: '1px solid rgba(139,108,62,0.3)', borderRadius: 0, outline: 'none',
              }}
            />
            <button type="submit" style={{
              padding: '5px 10px', fontSize: 10, fontWeight: 600,
              background: 'rgba(139,108,62,0.3)', color: '#e8c86a',
              border: '1px solid rgba(139,108,62,0.3)', borderRadius: 0, cursor: 'pointer',
            }}>Send</button>
          </form>
        ) : mp.connectedRef.current && (
          <div
            onClick={() => { setChatVisible(true); setTimeout(() => chatInputRef.current?.focus(), 50); }}
            style={{
              padding: '4px 8px', fontSize: 9, color: 'rgba(255,255,255,0.3)',
              cursor: 'pointer', userSelect: 'none',
            }}
          >
            Press Enter to chat
          </div>
        )}
      </div>

      {loading && <div className="map-loading"><div className="spinner" /><p>{assetsLoading ? 'Loading assets...' : 'Generating world...'}</p></div>}
      {assetsError && <div className="map-loading"><p style={{ color: '#ff6b6b' }}>Failed to load assets: {assetsError}</p></div>}
    </div>
  );
}
