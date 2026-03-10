// ─── Tile Atlas ───
// Asset paths and sprite definitions for the explore system.

const PLAINS = '/tilesets/summer-plains/summer_plains_v1.0_plus/summer_plains_v1.0_plus';
const VILLAGE = '/tilesets/summer_village_v1.0_plus/summer_village_v1.0_plus';
const CHAR = '/tilesets/summer-plains/character_animations_v1.0/character_animations_v1.0';

export const ASSET_PATHS = {
  assets: `${PLAINS}/assets.png`,
  character: `${CHAR}/character_spritesheet.png`,
  houses: `${VILLAGE}/assets/houses.png`,
  market: `${VILLAGE}/assets/market_assets.png`,
  nature: `${VILLAGE}/assets/nature_assets.png`,
  cobblestone: `${VILLAGE}/tiles/cobblestone_tiles_brown.png`,
  cobblestoneGrey: `${VILLAGE}/tiles/cobblestone_tiles_grey.png`,
  oldMan: `${VILLAGE}/characters/old_man_spritesheet.png`,
  oldWoman: `${VILLAGE}/characters/old_woman_spritesheet.png`,
  youngMan: `${VILLAGE}/characters/young_man_spritesheet.png`,
  youngWoman: `${VILLAGE}/characters/young_woman_spritesheet.png`,
  merchant: `${VILLAGE}/characters/food_merchant_spritesheet.png`,
  merchantGeneral: `${VILLAGE}/characters/merchant_spritesheet.png`,
  vegetableStall: `${VILLAGE}/assets/vegetable_stall.png`,
  well: `${PLAINS}/animated_assets/well_spritesheet.png`,
  campfire: `${PLAINS}/animated_assets/campfire_spritesheet.png`,
  landingStage: `${PLAINS}/animated_assets/landing_stage_spritesheet.png`,
  waterLily: `${PLAINS}/animated_assets/water_lily_01_spritesheet.png`,
  woodenFence: `${VILLAGE}/tiles/wooden_fence.png`,
  bridge: `${PLAINS}/bridge_sprite.png`,
  marbleFence: `${VILLAGE}/tiles/marble_fence.png`,
} as const;

// ─── Fantasy RPG sprite pack (static chibi characters) ───
const FANTASY = '/tilesets/npcs/fantasy-pixel-rpg-sprite-pack/Individual_Sprites';

export const FANTASY_NPC_PATHS = {
  paladinGuard: `${FANTASY}/paladin_01_001.png`,
  elderPriest: `${FANTASY}/priest_01_001.png`,
  dwarfSmith: `${FANTASY}/dwarf_01_008.png`,
  elfScout: `${FANTASY}/elf_01_001.png`,
  skeletonMace: `${FANTASY}/skeleton_01_001.png`,
  skeletonAxe: `${FANTASY}/skeleton_01_005.png`,
  swordswoman: `${FANTASY}/warrior_01_003.png`,
  fireWitch: `${FANTASY}/mage_01_005.png`,
  elfHerbalist: `${FANTASY}/elf_02_005.png`,
} as const;

export interface SpriteRect {
  sx: number; sy: number; sw: number; sh: number;
}

// ─── Terrain colors ───
// Sampled from the actual tileset palette. Used for solid-fill terrain rendering
// to avoid broken autotile extraction.
export const TERRAIN_COLORS: Record<string, string> = {
  deep_water:   '#2898b8',
  water:        '#3bbcd8',
  shallow:      '#5ecce0',
  shore:        '#c8c078',
  sand:         '#d0c880',
  grass:        '#7cc850',
  grass_dark:   '#60b040',
  forest:       '#58a838',
  dense_forest: '#408828',
  hills:        '#a09060',
  rock:         '#808070',
  mountain:     '#686858',
  snow:         '#d8d8d0',
  path:         '#c0a858',
  cobblestone:  '#8a8070',
};

// ─── Cobblestone source rect (the fill tile from cobblestone_tiles_brown.png) ───
// The sheet is 320x96. The top-left 96x96 block is a filled area.
// Center tile of that block:
export const COBBLESTONE_TILE: SpriteRect = { sx: 32, sy: 32, sw: 32, sh: 32 };
export const COBBLESTONE_GREY_TILE: SpriteRect = { sx: 32, sy: 32, sw: 32, sh: 32 };

// ─── Tree sprites from assets.png (512x864) ───
export const TREE_SPRITES: SpriteRect[] = [
  { sx: 16,  sy: 8,   sw: 96,  sh: 140 }, // Tree 1
  { sx: 176, sy: 8,   sw: 96,  sh: 140 }, // Tree 2
  { sx: 346, sy: 8,   sw: 110, sh: 140 }, // Tree 3
];

// Bush sprites
export const BUSH_SPRITES: SpriteRect[] = [
  { sx: 0,   sy: 448, sw: 48, sh: 40 },
  { sx: 56,  sy: 448, sw: 48, sh: 40 },
  { sx: 112, sy: 448, sw: 48, sh: 40 },
  { sx: 168, sy: 448, sw: 48, sh: 40 },
];

// Rock sprites
export const ROCK_SPRITES: SpriteRect[] = [
  { sx: 280, sy: 448, sw: 44, sh: 36 },
  { sx: 332, sy: 448, sw: 44, sh: 36 },
  { sx: 280, sy: 496, sw: 44, sh: 40 },
];

// Small flowers/grass details
export const GRASS_DETAIL_SPRITES: SpriteRect[] = [
  { sx: 416, sy: 496, sw: 16, sh: 16 },
  { sx: 432, sy: 496, sw: 16, sh: 16 },
  { sx: 448, sy: 496, sw: 16, sh: 16 },
  { sx: 464, sy: 496, sw: 16, sh: 16 },
  { sx: 480, sy: 496, sw: 16, sh: 16 },
];

// Log/stump sprites
export const STUMP_SPRITE: SpriteRect = { sx: 256, sy: 168, sw: 40, sh: 32 };
export const LOG_SPRITE: SpriteRect = { sx: 0, sy: 168, sw: 80, sh: 32 };

// ─── House sprites from houses.png (1166x572) ───
// Small houses (top row): 3 color variants
export const HOUSE_SPRITES: SpriteRect[] = [
  { sx: 8,   sy: 4,   sw: 170, sh: 260 }, // Green roof
  { sx: 394, sy: 4,   sw: 170, sh: 260 }, // Teal roof
  { sx: 780, sy: 4,   sw: 170, sh: 260 }, // Maroon roof
];
// Large houses (bottom row): 3 color variants — front+side composite
export const LARGE_HOUSE_SPRITES: SpriteRect[] = [
  { sx: 4,   sy: 294, sw: 230, sh: 274 }, // Large green
  { sx: 390, sy: 294, sw: 250, sh: 274 }, // Large teal
  { sx: 776, sy: 294, sw: 250, sh: 274 }, // Large maroon
];

// ─── Market items from market_assets.png (400x352) ───
export const MARKET_STALL: SpriteRect = { sx: 0,  sy: 80,  sw: 96, sh: 64 }; // stall with legs
export const BARREL: SpriteRect       = { sx: 0,  sy: 224, sw: 28, sh: 28 };
export const SACK: SpriteRect         = { sx: 100, sy: 224, sw: 24, sh: 24 };
export const CRATE: SpriteRect        = { sx: 176, sy: 224, sw: 24, sh: 28 };

// ─── Player character (352x400) ───
// Rows: 0=walk down, 1=walk left, 2=walk up, 3=walk right (DLUR order)
// 8 frames per row, frame size 44x50
export const PLAYER_FRAME_W = 44;
export const PLAYER_FRAME_H = 50;
export const PLAYER_WALK_FRAMES = 8;
export const PLAYER_ROWS = { down: 0, left: 1, up: 2, right: 3 } as const;

// ─── NPC sprites ───
// Tall NPCs (old_man 240x288, old_woman 240x300, young_man 240x288, young_woman 240x300)
// All share 30x36 frame size, 8 cols × 8 rows
export const NPC_OLD_MAN_FRAME_W = 30;
export const NPC_OLD_MAN_FRAME_H = 36;
export const NPC_TALL_FRAME_W = 30;
export const NPC_TALL_FRAME_H = 36;
// Small NPCs (food_merchant 120x90, merchant 120x90)
// All share 30x30 frame size, 4 cols × 3 rows
export const NPC_MERCHANT_FRAME_W = 30;
export const NPC_MERCHANT_FRAME_H = 30;
export const NPC_SMALL_FRAME_W = 30;
export const NPC_SMALL_FRAME_H = 30;

// ─── Vegetable stall from village_plus assets (80x96) ───
export const VEGETABLE_STALL_SPRITE: SpriteRect = { sx: 0, sy: 0, sw: 80, sh: 96 };

// ─── Village nature from nature_assets.png (512x279) ───
export const VILLAGE_TREE_SPRITES: SpriteRect[] = [
  { sx: 4,   sy: 2,  sw: 104, sh: 126 }, // Fruit tree
  { sx: 114, sy: 2,  sw: 104, sh: 126 }, // Broad oak
];
export const VILLAGE_BUSH_SPRITES: SpriteRect[] = [
  { sx: 270, sy: 26,  sw: 34, sh: 34 },
  { sx: 310, sy: 26,  sw: 34, sh: 34 },
  { sx: 260, sy: 128, sw: 42, sh: 38 },
];
export const BOULDER_SPRITES: SpriteRect[] = [
  { sx: 354, sy: 2,  sw: 56, sh: 54 },
  { sx: 416, sy: 4,  sw: 48, sh: 44 },
  { sx: 354, sy: 60, sw: 46, sh: 34 },
];
export const BENCH_SPRITE: SpriteRect = { sx: 118, sy: 142, sw: 54, sh: 26 };
export const LOG_PILE_SPRITE: SpriteRect = { sx: 54, sy: 136, sw: 54, sh: 34 };
export const SIGN_SPRITE: SpriteRect = { sx: 476, sy: 128, sw: 32, sh: 48 };
export const CAVE_SPRITE: SpriteRect = { sx: 2, sy: 194, sw: 128, sh: 80 };
export const MUSHROOM_SPRITE: SpriteRect = { sx: 292, sy: 168, sw: 20, sh: 16 };
export const SHORE_ROCK_SPRITES: SpriteRect[] = [
  { sx: 340, sy: 134, sw: 16, sh: 14 },
  { sx: 362, sy: 134, sw: 14, sh: 12 },
];

// ─── Additional market props from market_assets.png (400x352) ───
export const MARKET_CANOPY_SPRITES: SpriteRect[] = [
  { sx: 0,   sy: 0, sw: 128, sh: 76 }, // Green
  { sx: 136, sy: 0, sw: 128, sh: 76 }, // Red
  { sx: 272, sy: 0, sw: 128, sh: 76 }, // Blue
];
export const BARREL_GROUP: SpriteRect = { sx: 0,  sy: 224, sw: 52, sh: 44 };
export const FOOD_SPRITES: SpriteRect[] = [
  { sx: 312, sy: 232, sw: 20, sh: 20 }, // Pumpkin
  { sx: 340, sy: 236, sw: 16, sh: 16 }, // Apple
  { sx: 360, sy: 232, sw: 20, sh: 20 }, // Cabbage
];
// Wooden sign boards from market_assets.png
export const MARKET_SIGN_SPRITES: SpriteRect[] = [
  { sx: 268, sy: 88,  sw: 56, sh: 28 }, // Plank sign 1
  { sx: 332, sy: 88,  sw: 56, sh: 28 }, // Plank sign 2
];

// ─── Well (first frame from well_spritesheet.png, 6-frame strip) ───
export const WELL_SPRITE: SpriteRect = { sx: 0, sy: 0, sw: 78, sh: 68 };

// ─── Campfire (first frame from campfire_spritesheet.png, 6-frame strip) ───
export const CAMPFIRE_SPRITE: SpriteRect = { sx: 0, sy: 0, sw: 52, sh: 48 };

// ─── Landing stage / dock pier (first frame from landing_stage_spritesheet.png) ───
export const LANDING_STAGE_SPRITE: SpriteRect = { sx: 0, sy: 0, sw: 76, sh: 48 };

// ─── Water lily (first frame from water_lily_01_spritesheet.png) ───
export const WATER_LILY_SPRITE: SpriteRect = { sx: 0, sy: 0, sw: 28, sh: 24 };

// ─── Wooden fence from wooden_fence.png (112x110) ───
// Bottom half has connected fence posts with rope
export const WOODEN_FENCE_SPRITE: SpriteRect = { sx: 0, sy: 56, sw: 112, sh: 54 };

// ─── Additional sprites from assets.png (512x864) ───
// Tent (bottom right)
export const TENT_SPRITE: SpriteRect = { sx: 384, sy: 784, sw: 116, sh: 76 };
// Fruit/ornamental trees (smaller than the 3 main trees)
export const FRUIT_TREE_SPRITES: SpriteRect[] = [
  { sx: 0,   sy: 280, sw: 96, sh: 96 }, // Berry bush tree
  { sx: 96,  sy: 280, sw: 96, sh: 96 }, // Ornamental tree
];
// Sign posts (wooden, with directional planks)
export const SIGN_POST_SPRITES: SpriteRect[] = [
  { sx: 0,  sy: 696, sw: 40, sh: 52 },
  { sx: 48, sy: 696, sw: 40, sh: 52 },
  { sx: 96, sy: 696, sw: 44, sh: 52 },
];
// Wooden pallet / crate pile
export const CRATE_PILE_SPRITE: SpriteRect = { sx: 0, sy: 760, sw: 52, sh: 40 };
// Fence section (horizontal wooden stakes)
export const FENCE_H_SPRITE: SpriteRect = { sx: 64, sy: 780, sw: 192, sh: 36 };

// ─── Bridge from bridge_sprite.png (480x96) ───
// Left segment: thick wooden plank section
export const BRIDGE_PLANK_SPRITE: SpriteRect = { sx: 0, sy: 0, sw: 192, sh: 96 };

// ─── Marble fence from marble_fence.png (~92x128) ───
// Top: horizontal balustrade section between two pillars
export const MARBLE_FENCE_SPRITE: SpriteRect = { sx: 2, sy: 2, sw: 60, sh: 44 };
// Bottom: standalone decorative column/pillar
export const MARBLE_PILLAR_SPRITE: SpriteRect = { sx: 66, sy: 8, sw: 20, sh: 80 };

// ══════════════════════════════════════════════════════════
//  Summer Village — off-hub zone using Summer Plains + Village packs
// ══════════════════════════════════════════════════════════

export const VILLAGE_PATHS = {
  villageAssets: `${VILLAGE}/assets/village_assets.png`,
  environment: `${VILLAGE}/tiles/environment.png`,
  woodenPath: `${PLAINS}/wooden_path_tiles.png`,
  stoneTiles: `${PLAINS}/stone_tiles.png`,
  wallTiles: `${PLAINS}/wall_tiles.png`,
  waterDeep: `${PLAINS}/animated_water_tiles/water_deep_spritesheet.png`,
  waterShallow: `${PLAINS}/animated_water_tiles/water_shallow_spritesheet.png`,
  waterShallowDirt: `${PLAINS}/animated_water_tiles/water_shallow_dirt_spritesheet.png`,
  waterfall: `${PLAINS}/animated_water_tiles/waterfall_spritesheet.png`,
  rockBrown: `${PLAINS}/animated_assets/rock_brown_spritesheet.png`,
  rockGrey: `${PLAINS}/animated_assets/rock_grey_spritesheet.png`,
  waterLily2: `${PLAINS}/animated_assets/water_lily_02_spritesheet.png`,
  waterLily3: `${PLAINS}/animated_assets/water_lily_03_spritesheet.png`,
} as const;

// ─── Water tile spritesheets (autotile format: 3 cols of 64px) ───
// water_deep: 192x448 → 3×7 grid of 64×64 tiles
// water_shallow: 192x416 → 3×6.5 grid (use center tile)
// water_shallow_dirt: 192x416 → shore edges
// Center (fully-filled) water tile is at col=1 row=2 in autotile sheets
export const SV_WATER_TILE_SIZE = 64;
export const SV_WATER_DEEP_TILE: SpriteRect = { sx: 64, sy: 128, sw: 64, sh: 64 };
export const SV_WATER_SHALLOW_TILE: SpriteRect = { sx: 64, sy: 128, sw: 64, sh: 64 };
export const SV_WATER_SHORE_TILE: SpriteRect = { sx: 64, sy: 128, sw: 64, sh: 64 };

// ─── Waterfall spritesheet (192x384) — 6 frames at 192×64 vertical strip ───
export const SV_WATERFALL_FW = 192;
export const SV_WATERFALL_FH = 64;
export const SV_WATERFALL_FRAMES = 6;

// ─── Rock animation spritesheets (228x35) — 6 frames at 38×35 ───
export const SV_ROCK_FW = 38;
export const SV_ROCK_FH = 35;
export const SV_ROCK_FRAMES = 6;

// ─── Water lily variant 2 (132x16) — 6 frames at 22×16 ───
export const SV_LILY2_FW = 22;
export const SV_LILY2_FH = 16;
export const SV_LILY2_FRAMES = 6;

// ─── Water lily variant 3 (168x18) — 6 frames at 28×18 ───
export const SV_LILY3_FW = 28;
export const SV_LILY3_FH = 18;
export const SV_LILY3_FRAMES = 6;

// ─── Stone tiles (320x160) — grid of 32×32 tiles, 10×5 ───
export const SV_STONE_TILE: SpriteRect = { sx: 128, sy: 64, sw: 32, sh: 32 };

// ─── Wooden path tiles (96x192) — grid of 32×32 tiles, 3×6 ───
export const SV_WOOD_PATH_TILE: SpriteRect = { sx: 32, sy: 64, sw: 32, sh: 32 };

// ─── Village assets extra props (400x352) ───
export const SV_CART_SPRITE: SpriteRect = { sx: 0, sy: 0, sw: 96, sh: 80 };
export const SV_WAGON_WHEEL: SpriteRect = { sx: 104, sy: 0, sw: 32, sh: 32 };
export const SV_CLOTH_SPRITE: SpriteRect = { sx: 144, sy: 0, sw: 48, sh: 32 };
export const SV_BASKET_SPRITE: SpriteRect = { sx: 200, sy: 0, sw: 24, sh: 24 };
export const SV_POT_SPRITE: SpriteRect = { sx: 232, sy: 0, sw: 24, sh: 28 };

// ─── Village terrain colors — warm summer palette ───
export const VILLAGE_TERRAIN_COLORS: Record<string, string> = {
  deep_water:   '#2888b0',
  water:        '#38a8c8',
  shallow:      '#58c0d8',
  shore:        '#c8c080',
  sand:         '#d4c888',
  grass:        '#78c848',
  grass_dark:   '#60b040',
  forest:       '#50a030',
  dense_forest: '#408828',
  hills:        '#a09060',
  rock:         '#888078',
  mountain:     '#686858',
  snow:         '#d8d8d0',
  path:         '#b0a068',
  cobblestone:  '#928878',
  wooden_path:  '#a08050',
};

// ══════════════════════════════════════════════════════════
//  Grassland v2 — ERW Grass Land 2.0 asset pack
// ══════════════════════════════════════════════════════════

const GRASSLAND = '/tilesets/grassland-v2/ERW - Grass Land 2.0 v1.9/ERW - Grass Land 2.0 v1.9';

export const GRASSLAND_PATHS = {
  pineTree: `${GRASSLAND}/Props/Static props/pine-tree.png`,
  glCampfire: `${GRASSLAND}/Props/Animated props/campfire1 - fire.png`,
  shrine: `${GRASSLAND}/Props/Animated props/shrine-base-with grass.png`,
  enemyFlag: `${GRASSLAND}/Props/Animated props/enemy flag1animation.png`,
  trainingDummy: `${GRASSLAND}/Props/Animated props/trainning dummy-hit1.png`,
  vendor: `${GRASSLAND}/Characters/vendor-idle.png`,
  orcWarriorIdle: `${GRASSLAND}/Characters/orc warrior/orc1/orc melee - anims-idle.png`,
  orcMageIdle: `${GRASSLAND}/Characters/orc mage/orc1/orc mage - no hand fx-idle.png`,
  // Structures & props (existing)
  cabin: `${GRASSLAND}/Props/Static props/Cabin/cabin.png`,
  tent1: `${GRASSLAND}/Props/Static props/sheet2-sprites/tent 1.png`,
  tent2: `${GRASSLAND}/Props/Static props/sheet2-sprites/tent 2.png`,
  throne: `${GRASSLAND}/Props/Static props/sheet2-sprites/throne.png`,
  altar: `${GRASSLAND}/Props/Static props/sheet2-sprites/altar - neutral.png`,
  watchtower: `${GRASSLAND}/Props/Static props/sheet2-sprites/watchtower - front.png`,
  dragonFossil: `${GRASSLAND}/Props/Static props/sheet3-sprites/dragon fossil - complete - with grass.png`,
  barricade: `${GRASSLAND}/Props/Static props/sheet2-sprites/barricade - 1.png`,
  boneBig: `${GRASSLAND}/Props/Static props/sheet2-sprites/bone - big - 1.png`,
  lampPost: `${GRASSLAND}/Props/Static props/sheet1-sprites/lamp post 1 - lamp.png`,
  glBarrel: `${GRASSLAND}/Props/Static props/sheet1-sprites/barrel 1.png`,
  // ── Trees & vegetation ──
  glTree1: `${GRASSLAND}/Props/Static props/sheet1-sprites/tree - color scheme 1 - 1.png`,
  glDeadTree: `${GRASSLAND}/Props/Static props/sheet1-sprites/tree - naked 1.png`,
  glBush: `${GRASSLAND}/Props/Static props/sheet1-sprites/bush 1.png`,
  glVegetation: `${GRASSLAND}/Props/Static props/sheet1-sprites/vegetation 1.png`,
  glTrunk1: `${GRASSLAND}/Props/Static props/sheet1-sprites/trunk 1.png`,
  glTrunk2: `${GRASSLAND}/Props/Static props/sheet1-sprites/trunk 3.png`,
  // ── Rocks ──
  glRock1: `${GRASSLAND}/Props/Static props/sheet1-sprites/rocks - color scheme 1 - 1.png`,
  glRock2: `${GRASSLAND}/Props/Static props/sheet1-sprites/rocks - color scheme 1 - 2.png`,
  glRockSmall: `${GRASSLAND}/Props/Static props/sheet1-sprites/rocks - color scheme 1 - 3.png`,
  // ── Camp props ──
  glCrate: `${GRASSLAND}/Props/Static props/sheet1-sprites/crate 1.png`,
  glWoodLogBig: `${GRASSLAND}/Props/Static props/sheet2-sprites/wood log - big - no rope - 1.png`,
  glWoodLogMed: `${GRASSLAND}/Props/Static props/sheet2-sprites/wood log - intermediate - no rope - 1.png`,
  glWeaponRack: `${GRASSLAND}/Props/Static props/sheet2-sprites/weapon support - where the weapons hang.png`,
  glCarriage: `${GRASSLAND}/Props/Static props/sheet2-sprites/carriage - on grass - broken.png`,
  glSpike: `${GRASSLAND}/Props/Static props/sheet2-sprites/spikes 1.png`,
  glWoodenTable: `${GRASSLAND}/Props/Static props/sheet2-sprites/wooden table - rustic - on grass.png`,
  glWaterwell: `${GRASSLAND}/Props/Static props/sheet1-sprites/waterwell - rope.png`,
  // ── Structures ──
  glStrongGateL: `${GRASSLAND}/Props/Static props/sheet2-sprites/stronghold - gate - left section - on grass.png`,
  glStrongGateR: `${GRASSLAND}/Props/Static props/sheet2-sprites/stronghold - gate - right section - on grass.png`,
  glStrongWall: `${GRASSLAND}/Props/Static props/sheet2-sprites/stronghold - horizontal - on grass.png`,
  glCaveEntrance: `${GRASSLAND}/Props/Static props/sheet3-sprites/cave entrance - standalone.png`,
  glStoneBridge: `${GRASSLAND}/Props/Static props/sheet3-sprites/stone bridge - horizontal - 1.png`,
  // ── Signs & fences ──
  glSign: `${GRASSLAND}/Props/Static props/sheet1-sprites/sign 1.png`,
  glFence: `${GRASSLAND}/Props/Static props/sheet1-sprites/fence - left - right - 1.png`,
  glFenceGate: `${GRASSLAND}/Props/Static props/sheet1-sprites/fence - gateway - closed - middle.png`,
  // ── Animated spritesheets ──
  glButterfly: `${GRASSLAND}/Props/Animated props/Insects-butterfly1-flying-4 frames-150x106.png`,
  glAnimLamp: `${GRASSLAND}/Props/Animated props/animated lamp posts-1.png`,
  glChimneySmoke: `${GRASSLAND}/Props/Animated props/chimney smoke-chiminey 1 - white smoke.png`,
  // ── Small animals ──
  glBird: `${GRASSLAND}/Characters/small animals/birds/bird1/small animals - bird- idle - sideview.png`,
  glDuck: `${GRASSLAND}/Characters/small animals/ducks/duck1/small animals - duck-duck - idle - sideview.png`,
  glFrog: `${GRASSLAND}/Characters/small animals/frogs/frog1/small animals - frog-frog- idle - sideview.png`,
  // ── Additional assets (terrain enrichment & mission) ──
  glOrcWarrior2: `${GRASSLAND}/Characters/orc warrior/orc2/orc melee - anims color2-idle.png`,
  glChestOpen: `${GRASSLAND}/Props/Animated props/chests-opening- with squeeze fx.png`,
  glChestClose: `${GRASSLAND}/Props/Animated props/chests-closing - with squeeze fx.png`,
  glCampfireSmoke: `${GRASSLAND}/Props/Animated props/campfire smoke.png`,
  glFlies: `${GRASSLAND}/Props/Animated props/flies96x96-16 frames.png`,
  glNatureParticles: `${GRASSLAND}/Props/Animated props/generic nature particles96x96.png`,
  glEnemyFlag2: `${GRASSLAND}/Props/Animated props/enemy flag2 animation.png`,
  glStrongVertical: `${GRASSLAND}/Props/Static props/sheet2-sprites/stronghold - vertical - on grass.png`,
  glFlower1: `${GRASSLAND}/Props/Static props/items-flowers-mushrooms-sprites/items-flowers1_0.png`,
  glFlower2: `${GRASSLAND}/Props/Static props/items-flowers-mushrooms-sprites/items-flowers2_0.png`,
  glFlower3: `${GRASSLAND}/Props/Static props/items-flowers-mushrooms-sprites/items-flowers3_0.png`,
  glFlower4: `${GRASSLAND}/Props/Static props/items-flowers-mushrooms-sprites/items-flowers4_0.png`,
  glMushroom1: `${GRASSLAND}/Props/Static props/items-flowers-mushrooms-sprites/items-mushrooms1_0.png`,
  glMushroom2: `${GRASSLAND}/Props/Static props/items-flowers-mushrooms-sprites/items-mushrooms2_0.png`,
  glTree2: `${GRASSLAND}/Props/Static props/sheet1-sprites/tree - color scheme 2 - 1.png`,
  // ── Orc combat animations ──
  glOrcWarriorAtk: `${GRASSLAND}/Characters/orc warrior/orc1/orc melee - anims-atk1.png`,
  glOrcWarriorHurt: `${GRASSLAND}/Characters/orc warrior/orc1/orc melee - anims-hurt.png`,
  glOrcWarriorDeath: `${GRASSLAND}/Characters/orc warrior/orc1/orc melee - anims-death.png`,
  glOrcWarrior2Atk: `${GRASSLAND}/Characters/orc warrior/orc2/orc melee - anims color2-atk1.png`,
  glOrcWarrior2Hurt: `${GRASSLAND}/Characters/orc warrior/orc2/orc melee - anims color2-hurt.png`,
  glOrcWarrior2Death: `${GRASSLAND}/Characters/orc warrior/orc2/orc melee - anims color2-death.png`,
  glOrcMageAtk: `${GRASSLAND}/Characters/orc mage/orc1/orc mage - no hand fx-atk1.png`,
  glOrcMageHurt: `${GRASSLAND}/Characters/orc mage/orc1/orc mage - no hand fx-hurt.png`,
  glOrcMageDeath: `${GRASSLAND}/Characters/orc mage/orc1/orc mage - no hand fx-death.png`,
} as const;

// ─── Pine trees from pine-tree.png (512x640) ───
// 4 cols × 4 rows, each cell ~128×160
export const GL_PINE_SPRITES: SpriteRect[] = [
  { sx: 0, sy: 0, sw: 128, sh: 160 },
  { sx: 128, sy: 0, sw: 128, sh: 160 },
  { sx: 256, sy: 0, sw: 128, sh: 160 },
];
export const GL_PINE_SMALL: SpriteRect[] = [
  { sx: 0, sy: 320, sw: 128, sh: 160 },
  { sx: 128, sy: 320, sw: 128, sh: 160 },
  { sx: 256, sy: 320, sw: 128, sh: 160 },
];

// ─── Vendor NPC (1024x128) — 8 frames at 128×128 ───
export const GL_VENDOR_FW = 128;
export const GL_VENDOR_FH = 128;

// ─── Orc warrior idle (2304x256) — 9 frames at 256×256 ───
export const GL_ORC_W_FW = 256;
export const GL_ORC_W_FH = 256;
export const GL_ORC_W_FRAMES = 9;

// ─── Orc mage idle (2048x256) — 8 frames at 256×256 ───
export const GL_ORC_M_FW = 256;
export const GL_ORC_M_FH = 256;
export const GL_ORC_M_FRAMES = 8;

// ─── Orc combat animation frame counts (all 256×256 per frame) ───
export const GL_ORC_W_ATK_FRAMES = 16;   // 4096x256
export const GL_ORC_W_HURT_FRAMES = 6;   // 1536x256
export const GL_ORC_W_DEATH_FRAMES = 12; // 3072x256
export const GL_ORC_M_ATK_FRAMES = 18;   // 4608x256
export const GL_ORC_M_HURT_FRAMES = 7;   // 1792x256
export const GL_ORC_M_DEATH_FRAMES = 17; // 4352x256

// ─── Grassland campfire (1280x160) — 8 frames at 160×160 ───
export const GL_FIRE_FW = 160;
export const GL_FIRE_FH = 160;
export const GL_FIRE_FRAMES = 8;

// ─── Shrine base (224x192) — single image ───
export const GL_SHRINE: SpriteRect = { sx: 0, sy: 0, sw: 224, sh: 192 };

// ─── Enemy flag (1440x128) — 15 frames at 96×128 ───
export const GL_FLAG_FW = 96;
export const GL_FLAG_FH = 128;
export const GL_FLAG_FRAMES = 15;

// ─── Training dummy (1152x128) — 9 frames at 128×128 ───
export const GL_DUMMY_FW = 128;
export const GL_DUMMY_FH = 128;

// ─── Butterfly flying (600x106) — 4 frames at 150×106 ───
export const GL_BUTTERFLY_FW = 150;
export const GL_BUTTERFLY_FH = 106;
export const GL_BUTTERFLY_FRAMES = 4;

// ─── Animated lamp post (1216x96) — ~12-13 frames at 96×96 ───
export const GL_ANIM_LAMP_FW = 96;
export const GL_ANIM_LAMP_FH = 96;
export const GL_ANIM_LAMP_FRAMES = Math.floor(1216 / 96); // 12

// ─── Chimney smoke (1536x64) — 24 frames at 64×64 ───
export const GL_CHIMNEY_FW = 64;
export const GL_CHIMNEY_FH = 64;
export const GL_CHIMNEY_FRAMES = Math.floor(1536 / 64); // 24

// ─── Bird idle (1440x96) — 15 frames at 96×96 ───
export const GL_BIRD_FW = 96;
export const GL_BIRD_FH = 96;
export const GL_BIRD_FRAMES = Math.floor(1440 / 96); // 15

// ─── Duck idle (1728x96) — 18 frames at 96×96 ───
export const GL_DUCK_FW = 96;
export const GL_DUCK_FH = 96;
export const GL_DUCK_FRAMES = Math.floor(1728 / 96); // 18

// ─── Frog idle (1632x96) — 17 frames at 96×96 ───
export const GL_FROG_FW = 96;
export const GL_FROG_FH = 96;
export const GL_FROG_FRAMES = Math.floor(1632 / 96); // 17

// ─── Chest opening (1728x192) — 9 frames at 192×192 ───
export const GL_CHEST_OPEN_FW = 192;
export const GL_CHEST_OPEN_FH = 192;
export const GL_CHEST_OPEN_FRAMES = Math.floor(1728 / 192); // 9

// ─── Chest closing (1536x192) — 8 frames at 192×192 ───
export const GL_CHEST_CLOSE_FW = 192;
export const GL_CHEST_CLOSE_FH = 192;
export const GL_CHEST_CLOSE_FRAMES = Math.floor(1536 / 192); // 8

// ─── Campfire smoke (1024x64) — 16 frames at 64×64 ───
export const GL_CAMPFIRE_SMOKE_FW = 64;
export const GL_CAMPFIRE_SMOKE_FH = 64;
export const GL_CAMPFIRE_SMOKE_FRAMES = Math.floor(1024 / 64); // 16

// ─── Flies (1536x96) — 16 frames at 96×96 ───
export const GL_FLIES_FW = 96;
export const GL_FLIES_FH = 96;
export const GL_FLIES_FRAMES = 16;

// ─── Nature particles (1536x96) — 16 frames at 96×96 ───
export const GL_NATURE_FW = 96;
export const GL_NATURE_FH = 96;
export const GL_NATURE_FRAMES = 16;

// ─── Enemy flag 2 (768x128) — 8 frames at 96×128 ───
export const GL_FLAG2_FW = 96;
export const GL_FLAG2_FH = 128;
export const GL_FLAG2_FRAMES = Math.floor(768 / 96); // 8

// ─── Grassland terrain colors — wilder, warmer palette ───
export const GRASSLAND_TERRAIN_COLORS: Record<string, string> = {
  deep_water:   '#2080a0',
  water:        '#3098b8',
  shallow:      '#48b0c8',
  shore:        '#c0b870',
  sand:         '#c8c070',
  grass:        '#8cbd4c',
  grass_dark:   '#6ca038',
  forest:       '#4a7828',
  dense_forest: '#366018',
  hills:        '#8a7850',
  rock:         '#707068',
  mountain:     '#606058',
  snow:         '#d0d0c8',
  path:         '#a89058',
  cobblestone:  '#8a8070',
};

// ══════════════════════════════════════════════════════════
//  NPC Character Packs — GuttyKreum, Sheep, Warrior
// ══════════════════════════════════════════════════════════

const NPC_BASE = '/tilesets/npcs';

export const NPC_PACK_PATHS = {
  tilemap: `${NPC_BASE}/GuttyKreum_Characterpackv8/Blackoutlinecharacters/Tilemap.png`,
  sheepWhite: `${NPC_BASE}/Sheep/Sheep_0.png`,
  sheepBrown: `${NPC_BASE}/Sheep/Sheep_3.png`,
  warriorRun: `${NPC_BASE}/warrior/warrior/warrior run.png`,
} as const;

// ─── GuttyKreum Tilemap (256×3200) ───
// 8 cols × 100 rows of 32×32 frames. Each character occupies 4 rows (128px tall):
//   Row 0 = walk south, Row 1 = walk west, Row 2 = walk east, Row 3 = walk north
export const GK_FRAME = 32;
export const GK_COLS = 8;
export const GK_CHAR_INDEX: Record<string, number> = {
  FemaleBaker: 0,
  FemaleCafeMaid: 1,
  FemaleElder: 2,
  FemaleOfficeWorker: 3,
  FemaleStudent: 4,
  FemaleTrendy: 5,
  FemaleYouth: 6,
  GuttyChan: 7,
  MaleBusinessMan: 8,
  MaleBusinessManOld: 9,
  MaleCasual: 10,
  MalePunk: 11,
  MaleStudent: 12,
  MaleStudent1: 13,
  MaleTraditional: 14,
  MaleTrafficCop: 15,
  MaleYouth: 16,
  ShibaInu: 17,
  Witch: 18,
};
export const GK_DIR_ROW = { down: 0, left: 1, right: 2, up: 3 } as const;

// ─── Selectable player characters (human GuttyKreum only, indices 0-16) ───
export const SELECTABLE_CHARACTERS = [
  { index: 0,  key: 'FemaleBaker',        label: 'Baker' },
  { index: 1,  key: 'FemaleCafeMaid',     label: 'Cafe Maid' },
  { index: 2,  key: 'FemaleElder',        label: 'Elder' },
  { index: 3,  key: 'FemaleOfficeWorker', label: 'Office Worker' },
  { index: 4,  key: 'FemaleStudent',      label: 'Student' },
  { index: 5,  key: 'FemaleTrendy',       label: 'Trendy' },
  { index: 6,  key: 'FemaleYouth',        label: 'Youth' },
  { index: 7,  key: 'GuttyChan',          label: 'Gutty Chan' },
  { index: 8,  key: 'MaleBusinessMan',    label: 'Businessman' },
  { index: 9,  key: 'MaleBusinessManOld', label: 'Senior Exec' },
  { index: 10, key: 'MaleCasual',         label: 'Casual' },
  { index: 11, key: 'MalePunk',           label: 'Punk' },
  { index: 12, key: 'MaleStudent',        label: 'Student' },
  { index: 13, key: 'MaleStudent1',       label: 'Student Alt' },
  { index: 14, key: 'MaleTraditional',    label: 'Traditional' },
  { index: 15, key: 'MaleTrafficCop',     label: 'Traffic Cop' },
  { index: 16, key: 'MaleYouth',          label: 'Youth' },
] as const;

export const HUE_PRESETS = [
  { label: 'Original', value: 0 },
  { label: 'Crimson',  value: 330 },
  { label: 'Ocean',    value: 200 },
  { label: 'Forest',   value: 120 },
  { label: 'Royal',    value: 270 },
  { label: 'Sunset',   value: 30 },
  { label: 'Frost',    value: 180 },
  { label: 'Shadow',   value: 240 },
] as const;

// ─── Fantasy RPG selectable characters (indices 100+) ───
// These use static chibi sprites from the Fantasy RPG pack, not the GuttyKreum tilemap.
export const FANTASY_SELECTABLE = [
  { index: 100, key: 'fPaladinGuard', label: 'Paladin' },
  { index: 101, key: 'fElderPriest',  label: 'Priest' },
  { index: 102, key: 'fDwarfSmith',   label: 'Dwarf' },
  { index: 103, key: 'fElfScout',     label: 'Elf Scout' },
  { index: 104, key: 'fSkeletonMace', label: 'Skeleton' },
  { index: 105, key: 'fSkeletonAxe',  label: 'Undead Axe' },
  { index: 106, key: 'fSwordswoman',  label: 'Swordswoman' },
  { index: 107, key: 'fFireWitch',    label: 'Fire Witch' },
  { index: 108, key: 'fElfHerbalist', label: 'Herbalist' },
] as const;

export const FANTASY_SPRITE_KEYS = [
  'fPaladinGuard', 'fElderPriest', 'fDwarfSmith', 'fElfScout',
  'fSkeletonMace', 'fSkeletonAxe', 'fSwordswoman', 'fFireWitch', 'fElfHerbalist',
] as const;

// ─── Sheep spritesheets (256×896) — 4 cols × 28 rows of 64×32 frames ───
export const SHEEP_FW = 64;
export const SHEEP_FH = 32;
export const SHEEP_COLS = 4;

// ─── Warrior run (125×64) — 5 frames of 25×64 ───
export const WARRIOR_FW = 25;
export const WARRIOR_FH = 64;
export const WARRIOR_FRAMES = 5;
