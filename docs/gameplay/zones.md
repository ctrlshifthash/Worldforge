# Zones

Worldforge has three explorable zones, each with unique terrain, NPCs, enemies, and objectives. You unlock new zones by completing objectives in the hub.

## Hub Zone

Your home base. A procedurally generated area with terrain shaped by Simplex noise — grass, dirt paths, water, and rocks.

**Key Features:**
- **Merchant** — sells gear and items, has 3 dialogue options (shop, news about the world, general info). The merchant's news changes based on your progress
- **Campfire** — stand near it to regenerate HP over time. Shows a "+HP/s" indicator when you're in range
- **Well** — another healing spot, also restores HP passively
- **Ruins** — a dangerous area with warning text. Explore at your own risk
- **8 ambient townsfolk** — wander the hub using animated sprites, each with their own appearance
- **Sheep** — white sheep roam the hub as ambient wildlife
- **2 warrior guards** — stationed at the grassland zone entrance

**Objectives:**
Complete hub objectives to unlock paths to other zones. The game guides you to the next zone once you're ready.

**Zone Exits:**
- **Northern Pass** — leads to the Grassland Zone
- **Docks South Gate** — leads to the Seaside Village (marble pillars, fence wings, and a "Seaside Village" signpost)

---

## Grassland Zone

A wilderness zone (80×60 tiles) accessed through the Northern Pass from the hub. This is where combat begins.

**Terrain:**
- Open grasslands with edge dithering between terrain types
- Per-tile texture details: grass dots, water waves, path pebbles, rock cracks
- Trees in 2 color variants, flowers (4 types), mushrooms (2 types)

**Enemies:**
- **6 Orc Warriors** — 2 color variants (orc1 and orc2), full AI behavior with idle/chase/attack/hurt/death states
- **1 Orc Shaman** — a stronger enemy variant
- **2 flag variants** — orc banners placed around the stronghold

**Points of Interest (5 discoverable):**
1. **Orc Stronghold** — the main enemy camp with vertical walls and orc flags
2. **Vendor Camp** — a grassland vendor selling Health Potions, Strength Tonics, and Iron Shields
3. **Dark Cave** — a mysterious cave entrance
4. **Rocky Overlook** — a high point with an inspect prompt (press E)
5. **Forest Clearing** — a peaceful clearing you can inspect
6. **Stream Crossing** — a water crossing point
7. **Ruined Cart** — an abandoned cart on the roadside
8. **Frog Pond** — a pond with ambient frogs

**Ambient Life:**
- Birds, ducks, frogs, butterflies
- Chimney smoke from structures, animated lamps, campfire smoke
- Flies buzzing near certain areas, nature particles floating in the air

**Shrine:**
Clear the orcs near the shrine, then press **E** to activate it. Grants a combat buff: **+50% damage dealt** and **-20% damage taken** for 45 seconds.

**Mission:** Visit 5 Points of Interest → Kill 7 Orcs → Unlock the reward chest → Collect +75 Gold → Return to hub for payoff.

---

## Seaside Village

A coastal zone (40×30 tiles) accessed through the Docks South Gate from the hub. This is a social and quest-focused zone — less combat, more NPC interaction.

**Terrain:**
- Coastal village setting with docks, gardens, and buildings
- Uses Summer Village tileset assets

**NPCs (6 named characters, all with dialogue choices):**
- **Fiona** — runs a food shop
- **Gerald** — runs a general store
- **Elder Rowan** — village elder, gives lore and quests
- **Marina** — quest-giver for the Lost Necklace quest
- **Tom** — shares area info and rumors
- **Nana Rose** — tells stories, offers tea that heals you

**Witch Willow — Fortune Teller:**
Located at position (5, 22) in the village. Has 3 dialogue options:
1. **Tell me my fortune** — gives a random fortune reading
2. **Show me your potions** — opens her potion shop (Barrier Hex 30g, Third Eye 20g, Vigor Brew 25g)
3. **Tell me about this place** — shares village lore

**Enemies:**
- **4 Bandits** — hostile enemies that ambush you in parts of the village

**Wildlife:**
- **12 passive animals** — various wildlife wandering the village area

**POI Discovery Banners:**
3 discoverable points of interest, each triggers a discovery banner when you first visit.

**Quest:** Marina's Lost Necklace — see the [Quests](quests.md) page for details.
