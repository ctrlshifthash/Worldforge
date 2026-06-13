# NPCs & Dialogue

Worldforge has over 25 named NPCs spread across all three zones. Every NPC has a name, a role, and dialogue that changes based on your progress. Conversations use a numbered choice system — press **1**, **2**, or **3** to pick a response.

## How Dialogue Works

1. Walk up to an NPC and press **E**
2. A dialogue box appears with the NPC's message
3. Numbered options appear at the bottom (up to 3 choices)
4. Press the corresponding number key to respond
5. The conversation continues or ends based on your choice

Dialogue is **progression-aware** — NPCs react to your orc kills, quest completions, bandit clears, and buildings placed.

## Hub NPCs

### Merchant
Your main shop in the hub zone. Has 3 dialogue options:
- **Shop** — opens the store to buy/sell items
- **News** — shares context-aware news about the world that changes based on what you've done
- **Info** — general information about the hub and what to do next

### Hub Townsfolk
8 ambient NPCs wander the hub using animated sprites from the GuttyKreum tileset (32×32 pixel characters with 8-frame walk animations in 4 directions). They add life to the hub but aren't interactive.

### Warrior Guards
2 guards stationed at the Northern Pass entrance to the Grassland zone. They use the warrior spritesheet and stand in idle pose.

---

## Grassland NPCs

### Grassland Vendor
Located at the Vendor Camp POI. Sells combat supplies:

| Item | Price |
|------|-------|
| Health Potion | 15g |
| Strength Tonic | 25g |
| Iron Shield | 40g |

### Orc Shaman
The strongest enemy in the grassland. Part of the Orc Stronghold POI.

---

## Village NPCs

### Fiona — Food Shop
Runs a food shop in the village. Talk to her to browse food items for sale.

### Gerald — General Store
Runs the general store. Sells a variety of supplies.

### Elder Rowan — Village Elder
The village authority figure. Gives lore about the village's history and offers quests. Talk to him for:
- Village lore and backstory
- Quest information
- Guidance on what to do in the village

### Marina — Quest Giver
Gives the "Marina's Lost Necklace" quest. She's lost her necklace somewhere in the village and needs your help finding it. See [Quests](quests.md) for full details.

### Tom — Information
A villager who shares:
- Area information about different parts of the village
- Rumors about what's happening in the world

### Nana Rose — Storyteller
An elderly villager who:
- Tells stories about the village's past
- Offers you tea that heals your HP

### Witch Willow — Fortune Teller
Located at position (5, 22) in the village. A fortune teller with her own potion shop.

**Dialogue Options:**
1. **Fortune** — receive a random fortune reading (different text each time)
2. **Potions** — opens her shop:

| Potion | Price | Effect |
|--------|-------|--------|
| Barrier Hex | 30g | Defensive buff |
| Third Eye | 20g | Detection buff |
| Vigor Brew | 25g | Stamina buff |

3. **Lore** — learn about the village's mystical history

---

## Ambient Wildlife

### Sheep
- **White sheep (Sheep_0)** — roam the hub zone
- **Brown sheep (Sheep_3)** — found in the grassland zone
- Animated spritesheets with 64×32 frames, 4 columns, multiple animation rows

### Village Wildlife
12 passive animals wander the Seaside Village, adding ambient life to the zone.

---

## NPC Sprite System

NPCs use several sprite packs:

- **GuttyKreum Tilemap** (256×3200) — 19 different character designs at 32×32 pixels, 8 walk frames in 4 directions. Used for hub townsfolk and village wanderers.
- **Sheep Pack** — 9 color variants, each with full animation spritesheets
- **Warrior Pack** — used for the two guards at the grassland entrance
- **Orc Spritesheets** — 9 combat spritesheets covering idle, chase, attack, hurt, and death for both color variants
