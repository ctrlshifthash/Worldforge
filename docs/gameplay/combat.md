# Combat

Worldforge features real-time combat with AI-driven enemies. Combat is simple to learn but requires timing, positioning, and kiting to master.

## How to Fight

- Press **SPACE** to attack in the direction your character is facing
- Attacks are melee and directional — you need to be facing the enemy and within range
- Damage numbers float above the target on each hit
- You can dodge attacks by moving out of range, then closing in to strike

## Player Stats

- **HP** — your health points, displayed in the HUD bar (starts at 100)
- **Gold** — currency earned from kills, quests, and loot
- **Wood** — building material (starts at 30)
- **Stone** — building material (starts at 15)

The HUD at the top of the screen shows your HP bar, gold count, material counts, and current zone name.

## Enemy AI

Every enemy has a full state machine with 5 states:

| State | Behavior |
|-------|----------|
| **Idle** | Enemy stands still or patrols a small area |
| **Chase** | Enemy detects the player and moves toward them |
| **Attack** | Enemy is in range and attacks the player |
| **Hurt** | Enemy takes damage, briefly staggers |
| **Dead** | Enemy plays death animation and drops loot |

Enemies detect you based on distance. Once they spot you, they chase until you move far enough away or one of you dies.

## Enemy Types

### Orc Warriors (Grassland)
- **2 color variants** — orc1 (green) and orc2 (darker)
- **6 warriors + 1 shaman** in the grassland zone
- Full animated spritesheets for all 5 states
- 9 combat spritesheets total across variants

### Bandits (Village)
- **4 bandits** roam the Seaside Village
- Use orc sprites with different behavior patterns
- Ambush players in certain areas of the village

## Damage Numbers

Every hit displays a floating damage number that:
- Rises above the target
- Fades out over ~1 second
- Shows in red for damage dealt
- Shows in green for healing received

## Shrine Buff

In the Grassland zone, there's a combat shrine. To activate it:

1. Clear the orcs near the shrine
2. Press **E** to activate
3. Receive a 45-second buff: **+50% damage dealt** and **-20% damage taken**

The buff timer is visible and the effect applies to all attacks during its duration.

## Death

When your HP reaches 0:
- A "You have fallen..." banner appears on screen showing how much gold you lost
- You lose a portion of your gold as a death penalty
- You respawn at the hub zone
- Enemies in the zone you died in reset

## Combat Tips

- **Kite enemies** — hit and move away, don't stand still
- **Use the shrine buff** before fighting the main orc group
- **Buy Health Potions** from vendors before heading into dangerous areas
- **Face the right direction** — your attacks only hit where you're looking
- **Time your attacks** — enemies have a brief recovery window after attacking where they're vulnerable
