# Building

World owners can build structures, props, and decorations in their world. The build system lets you physically grow your world by placing objects that persist across sessions and affect gameplay.

## How to Build

1. Press **B** to open the build menu
2. Choose a category tab: **Structures**, **Props**, or **Decoration**
3. Click an item to select it
4. Move your cursor to position it on the map — a placement gizmo shows where it will go
5. Press **R** to rotate the item (cycles through 0°, 90°, 180°, 270°)
6. Click to place the item

**Only the world owner can build.** Visitors can see placed objects but cannot add or remove them.

## Materials

Building costs materials. You start with:

| Material | Starting Amount |
|----------|----------------|
| **Wood** | 30 |
| **Stone** | 15 |
| **Gold** | Earned from combat, quests, and loot |

Materials are spent when you place objects. Earn more through quests, combat, and exploration.

## Buildable Items (22 Total)

### Structures
Large buildings and functional structures:
- Wooden Cabin
- Tower
- Tent
- Wall sections
- Stall (market stall)
- Well
- Barrel
- Fence

### Props
Functional and decorative props:
- Torches
- Market stalls
- Signs
- Crates

### Decoration
Purely visual items to customize your world:
- Flowers
- Bushes
- Banners
- Small props

## Placement Rules

- **Walkable tiles only** — you can't place objects on water, rocks, or other obstacles
- **No overlap** — objects can't be placed on top of each other
- **Not near zone gates** — you can't block entrances to other zones
- **Rotation-aware** — placement validation accounts for the rotated footprint of the item

## Placement Gizmo

When you have an item selected, a visual gizmo appears at your cursor showing:
- A 3D raised platform indicating the footprint
- Corner brackets marking the exact tile boundaries
- A direction arrow showing the item's rotation
- A scan line animation for visual feedback

Green gizmo = valid placement. Red = invalid.

## Collision

Placed objects are solid — they block player and enemy movement. NPCs and enemies will path around your buildings. This means you can strategically build walls and structures to control enemy movement.

The collision footprint is rotation-aware — when you rotate a 2×1 building, its collision becomes 1×2.

## Persistence

- Objects are saved to the database immediately when placed
- They load automatically when anyone visits the world
- Objects persist across all sessions
- Only the world owner can delete placed objects

## Building Residents

As you place buildings in the hub, named residents appear and offer quests:
- **Helena** — appears after placing structures, offers the Firewood quest
- **Marcus** — offers survey quests
- **Barton** (Guard Captain) — tracks your orc kills, offers bounty quests

Building isn't just cosmetic — it directly unlocks new NPCs and quest content.
