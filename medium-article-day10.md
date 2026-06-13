# Building a Game That Markets Itself: How I Used Real Game Assets to Replace Every Marketing Mockup

## Day 10 of building Worldforge — a playable 2D game inside an AI worldbuilding platform

Most indie game sites have a problem. The marketing page shows polished mockups and screenshots, but the actual game looks nothing like it. Today I flipped that: I made the marketing pages *use the actual game*.

Every sprite, every UI panel, every scene on the landing page is rendered from the same tileset assets the game engine uses. The hero section isn't a screenshot or an illustration — it's a composed scene of 20 positioned game sprites at three depth layers, sitting on a procedural forest terrain gradient. When you scroll past it into the rest of the site, you're still in the same visual world.

Getting there took the entire day and several false starts.

---

## The Starting Point: A Game With No Face

Yesterday I finished adding 9 Fantasy RPG characters to the game — a paladin, priest, dwarf, elf scout, swordswoman, fire witch, herbalist, and two skeleton variants. They're scattered across all three zones with full dialogue trees and combat AI. The game itself was feature-complete with 25+ NPCs, 8 quests, real-time combat, a building system, and three explorable zones.

But the website still looked like a generic SaaS landing page. Dark background, text sections, some CSS mockup boxes pretending to be game UI. Nothing that said "this is a real game you can walk into right now."

## Step 1: Replacing Mockups with Real Sprites

The first move was straightforward: take every placeholder mockup on the marketing pages and replace it with actual game assets.

The build menu mockup that previously showed empty gray boxes? Now it renders real structure sprites — cabin, watchtower, tent, stronghold wall, vegetable stall, waterwell, barrel, fence — loaded directly from the tileset files the game engine uses.

The combat scene that was just colored rectangles? Now it shows actual orc warrior sprites (both color variants) with floating damage numbers in the exact same style the game renders them.

The NPC dialogue box? Same gold-bordered panel, same pixel font, same 1/2/3 choice keys the real game uses.

```tsx
const BUILD_ITEMS = [
  { name: 'Cabin', src: `${GL}/Props/Static props/Cabin/cabin.png` },
  { name: 'Tower', src: `${GL}/Props/Static props/sheet2-sprites/watchtower - front.png` },
  { name: 'Tent', src: `${GL}/Props/Static props/sheet2-sprites/tent 1.png` },
  { name: 'Wall', src: `${GL}/Props/Static props/sheet2-sprites/stronghold - horizontal - on grass.png` },
  // ... 4 more items
];
```

Every `<img>` tag on the marketing pages now points to the same `/tilesets/` directory the game engine reads from. Same assets, same `image-rendering: pixelated`, same pixel-art rendering. What you see on the landing page is what you get in the game.

## Step 2: The Hero Scene — A Composed Game World

This is where it got interesting. Instead of a hero image or illustration, I built a composed scene from game sprites positioned at three depth layers:

**Back row** (6 pine trees): Small, dark, heavily desaturated. `opacity: 0.25`, `brightness(0.35)`, `saturate(0.5)`. Creates the illusion of a distant treeline.

**Mid row** (7 elements): Cabin, watchtower, stronghold entrance, medium trees. Slightly brighter, slightly more saturated. These are the structures you'd actually see in the game.

**Front row** (7 elements): Lamp post, campfire, shrine, rocks, signpost, barrel, waterwell. Brightest layer, closest to the viewer.

Behind all of them sits a CSS terrain gradient that transitions from near-black at the top through increasingly vivid forest greens:

```css
.hero-world-terrain {
  background: linear-gradient(180deg,
    #060a0e 0%, #081008 12%, #0c1a0e 28%,
    #122812 42%, #183618 56%, #1e4420 68%,
    #234e24 78%, #285828 86%, #1e4420 94%, #142e14 100%
  );
}
```

A dark overlay with a radial vignette sits on top for text readability. The result: you see "Your World. Alive." floating above a real game world, not a stock image.

## Step 3: The Palette Problem That Took 3 Iterations

Here's where I burned time. The hero section looked great — rich forest greens, game sprites, atmospheric depth. But everything below it was still using the original dark theme: flat `#0e1219` backgrounds with blue-navy undertones.

The disconnect was brutal. The hero screamed "game world" and then you'd scroll into what looked like a generic tech product page.

**Attempt 1**: I tried downloading an external fantasy landscape image and building a twilight purple palette around it. It looked nice in isolation but completely clashed with the pixel-art game aesthetic. The photo-realistic mountain backdrop next to pixel sprites was jarring. Reverted.

**Attempt 2**: I restored the sprite scene but only changed CSS variables. The section backgrounds were technically "updated" but still felt flat and disconnected because the root colors still had blue undertones while the hero was green.

**Attempt 3 (the fix)**: I realized the actual problem was the hex values in the root palette. The hero terrain gradient uses greens (#060a0e through #285828). Everything else used blues (#080b12, #0e1219, #151a28, #1c2236). Different color families entirely.

The fix was changing six CSS variables:

```css
/* Before: Blue-navy */
--void:    #080b12;
--bg:      #0e1219;
--surface: #151a28;
--raised:  #1c2236;

/* After: Dark forest */
--void:    #060a06;
--bg:      #0b100a;
--surface: #121a12;
--raised:  #1a2418;
```

This single change cascaded through every card, panel, navbar, dialogue box, and section on the entire site. Every `var(--surface)` reference — dozens of them across the codebase — immediately shifted from blue-navy to dark forest.

Then I added subtle terrain gradients to each section:

```css
.journey-section {
  background: linear-gradient(180deg,
    #0a0f09 0%, #0c120b 20%, #0e140d 50%, #0c120b 80%, #0a0f09 100%
  );
}
```

Not bright enough to be distracting. Just enough green to feel like you're still in the same forest.

## Step 4: Fantasy Heroes as Character Parade

Below the hero text and HUD mockup, I added a "sprite parade" — a flex row of the 9 Fantasy RPG hero sprites:

```tsx
const HERO_SPRITES = [
  { src: `${FANTASY}/paladin_01_001.png`, alt: 'Paladin' },
  { src: `${FANTASY}/priest_01_001.png`, alt: 'Priest' },
  { src: `${FANTASY}/dwarf_01_008.png`, alt: 'Dwarf' },
  // ... 6 more
];
```

Each sprite scales up 25% on hover with a subtle float effect. They're the same characters you can play as in the game — press C to open the character picker. What you see on the marketing page is what you play.

This pattern repeats across the site. The About page has a 5-character parade. The How It Works page has the full 9. The NPC section shows a smaller parade below the dialogue mockup. Real game assets, everywhere.

## Step 5: Game Scene Panels

I created a reusable `.game-scene-panel` component — a dark-bordered panel with a green terrain strip at the bottom and positioned sprite images:

```css
.game-scene-panel {
  background: rgba(6, 14, 8, 0.92);
  border: 2px solid rgba(240,192,96,0.25);
}

.scene-terrain {
  position: absolute;
  bottom: 0;
  height: 40%;
  background: linear-gradient(180deg, #306820 0%, #488830 40%, #68b048 100%);
  opacity: 0.35;
}
```

These panels appear inside zone descriptions, combat sections, and feature cards. Each one contains 3-4 positioned sprites that compose a mini-scene — a cabin next to a well with a character standing nearby, or two orc warriors flanking floating damage numbers.

The village zone panel uses a different terrain gradient (blue-to-sand for the coastal theme). Same component, different context.

## The Technical Details

**Asset pipeline**: All sprites load from `/public/tilesets/` — the same directory the game's `useGameAssets.ts` hook loads from. No duplicate assets, no marketing-specific images.

**Pixel rendering**: Every sprite uses `image-rendering: pixelated` to maintain crisp pixel art at any scale. This is critical — without it, the browser antialiases pixel art into blurry mush.

**Depth simulation**: The hero scene uses CSS `filter: brightness() saturate()` to simulate atmospheric perspective. Back-row trees at 30% brightness feel far away. Front-row props at 55% feel close. No 3D engine needed.

**Forest-tinted everything**: The body's pixel grid overlay shifted from white to green (`rgba(120,180,100,0.018)`). The cobblestone tile texture got a `hue-rotate(60deg)` filter. Section dividers use `rgba(30,68,32,0.15)` borders. Every element contributes to the forest atmosphere.

**Tree-line dividers**: Between major sections, a CSS `clip-path: polygon()` creates a jagged tree-line silhouette in forest green, replacing generic horizontal rules.

## What I Learned

**Your game IS your marketing**. If you're building a game with distinct visual assets, use them everywhere. Stock photos and mockup boxes undermine the thing you're selling. The game's own sprites are more convincing than any marketing designer could produce because they're *real*.

**Color palette consistency is non-negotiable**. Having the hero section in green and everything else in blue created a visual schizophrenia that no amount of layout fixes could solve. The root variables needed to match the hero's color family. Once they did, everything clicked.

**CSS custom properties are cascade machines**. Changing 6 hex values in `:root` updated hundreds of elements across 4 pages because everything referenced `var(--surface)`, `var(--raised)`, etc. This is the right architecture for theming — if you're hardcoding colors in individual components, you're creating a palette migration nightmare.

**Atmospheric depth is cheap**. The hero's three-layer sprite composition looks like it required a scene editor. It's just absolutely positioned `<img>` tags with brightness/opacity filters. Total implementation: an array of 20 objects with `src` and `style` properties.

---

## Current State

Worldforge now has a landing page, About page, and How It Works page that all feel like you're browsing a game wiki from inside the game world. Dark forest backgrounds, gold accent borders, pixel-art sprites, game UI mockups built from real in-game components.

The game itself has 3 explorable zones, 25+ NPCs with dialogue, 8 quests, real-time combat, a building system with 22 items, 28 playable characters with color customization, vendors, economy, wildlife, and ambient effects.

Tomorrow I'm looking at the actual gameplay systems again. The marketing pages are done selling the game — time to make the game sell itself.

---

*This is part of a daily build log. Worldforge is an AI worldbuilding platform where every world becomes a playable 2D pixel-art game. Built with Next.js, Prisma, SQLite, and HTML5 Canvas.*
