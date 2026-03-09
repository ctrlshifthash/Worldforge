import { EntityType, PrismaClient, Role, Visibility } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Worldforge database...');

  // Clean existing data
  await prisma.eventEntityLink.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.event.deleteMany();
  await prisma.era.deleteMany();
  await prisma.entityRelation.deleteMany();
  await prisma.entity.deleteMany();
  await prisma.worldMember.deleteMany();
  await prisma.world.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('worldforge', 12);

  // ─── Users ───
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'demo@worldforge.app',
        username: 'demo',
        name: 'Demo User',
        passwordHash,
        avatar: 'DU',
      },
    }),
    prisma.user.create({
      data: {
        email: 'noor@worldforge.app',
        username: 'noor',
        name: 'Noor Kashan',
        passwordHash,
        avatar: 'NK',
      },
    }),
    prisma.user.create({
      data: {
        email: 'eli@worldforge.app',
        username: 'eli',
        name: 'Eli Thorne',
        passwordHash,
        avatar: 'ET',
      },
    }),
  ]);

  const [demo, noor, eli] = users;

  // ─── Everhold World ───
  const everhold = await prisma.world.create({
    data: {
      ownerId: demo.id,
      slug: 'everhold',
      title: 'Everhold',
      tagline: 'A drowned empire rebuilt on floating citadels above a sentient sea.',
      description:
        'Centuries ago, the Deep Empire was swallowed by a cataclysm called the Great Drowning. The sentient sea that consumed it is not merely water — it remembers, it speaks in pressure and current, and it decides who sinks and who floats. The survivors built Everhold: a constellation of floating citadels chained above the ruins of their ancestors. Here, factions trade in memory, navigate by reading the sea\'s moods, and fight over relics that could raise the drowned capital or sink it forever.',
      visibility: Visibility.PUBLIC,
      coverGradient:
        'radial-gradient(circle at 30% 20%, rgba(200,164,78,0.25), transparent 50%), radial-gradient(circle at 80% 70%, rgba(74,110,154,0.2), transparent 40%), linear-gradient(135deg, #0a0f1a 0%, #0d1f2d 40%, #1a2a1a 70%, #2a1f0a 100%)',
    },
  });

  // ─── World Members ───
  await prisma.worldMember.createMany({
    data: [
      { worldId: everhold.id, userId: demo.id, role: Role.OWNER },
      { worldId: everhold.id, userId: noor.id, role: Role.EDITOR },
      { worldId: everhold.id, userId: eli.id, role: Role.VIEWER },
    ],
  });

  // ─── Entities ───
  const entities = await Promise.all([
    // Characters
    prisma.entity.create({
      data: {
        worldId: everhold.id,
        slug: 'aurelian-vale',
        type: EntityType.CHARACTER,
        title: 'Aurelian Vale',
        summary:
          'Last Cartographer of the Deep Empire — a navigator who maps the sentient sea\'s shifting moods and guards the archive-key to the drowned capital.',
        accent: '#c8a44e',
        contentJson: JSON.stringify([
          'Aurelian Vale was born in the Glass Anchorage to a family of tidal cartographers who served the old court. When the Great Drowning consumed the empire, his ancestors preserved fragments of the navigational archive — living maps that shift with the sea\'s temperament.',
          'Now Aurelian maps pathways that only appear when the sentient sea is listening. His charts are political weapons: whoever controls safe routes controls tribute, migration, and war. Every faction wants him as an ally; none fully trust him.',
          'He inherited the last fragment of the court\'s archive-key, a crystalline device that resonates with the drowned capital\'s infrastructure. This makes him the most hunted man in Everhold — and possibly the only person who could raise or permanently seal the ruins below.',
          'Aurelian walks a razor\'s edge between the Tide Council, the Red Choir, and the Veilborn, each of whom needs what he knows but fears what he might do with it.',
        ]),
        factsJson: JSON.stringify([
          { label: 'Title', value: 'Last Cartographer' },
          { label: 'Origin', value: 'The Glass Anchorage' },
          { label: 'Allegiance', value: 'Tide Council (uneasy)' },
          { label: 'Age', value: '34' },
          { label: 'Abilities', value: 'Tidal cartography, archive reading' },
          { label: 'Status', value: 'Active — hunted' },
        ]),
        tagsJson: JSON.stringify(['navigator', 'heir', 'court archive', 'cartographer', 'hunted']),
        graphX: 20,
        graphY: 30,
      },
    }),
    prisma.entity.create({
      data: {
        worldId: everhold.id,
        slug: 'seraphine-duskmantle',
        type: EntityType.CHARACTER,
        title: 'Seraphine Duskmantle',
        summary:
          'Commander of the Red Choir\'s enforcement arm — a former Veilborn diver who turned her knowledge of the deep into leverage.',
        accent: '#9a4a6e',
        contentJson: JSON.stringify([
          'Seraphine was born among the Veilborn but left the lower strata after witnessing the Red Choir\'s agents exploit her people\'s knowledge of the drowned ruins. Rather than fight them from below, she infiltrated their ranks from within.',
          'Over twelve years, she rose from debt collector to Commander. She now controls the Choir\'s most sensitive operations: retrieving memory contracts from those who default, and enforcing silence on those who know too much.',
          'Her dual heritage makes her both invaluable and suspect. The Veilborn consider her a traitor; the Choir\'s senior partners watch her for signs of divided loyalty. She uses both suspicions as cover for her true agenda — one that neither faction suspects.',
        ]),
        factsJson: JSON.stringify([
          { label: 'Title', value: 'Commander, Enforcement Arm' },
          { label: 'Origin', value: 'Lower Flood Strata (Veilborn)' },
          { label: 'Allegiance', value: 'Red Choir (complicated)' },
          { label: 'Abilities', value: 'Deep diving, pressure combat, memory extraction' },
          { label: 'Status', value: 'Active — rising' },
        ]),
        tagsJson: JSON.stringify(['commander', 'spy', 'veilborn', 'red choir', 'enforcer']),
        graphX: 70,
        graphY: 25,
      },
    }),
    prisma.entity.create({
      data: {
        worldId: everhold.id,
        slug: 'orin-tidecaller',
        type: EntityType.CHARACTER,
        title: 'Orin Tidecaller',
        summary:
          'A young Veilborn who can hear the sea\'s whispers more clearly than anyone alive — and whom the sea seems to answer.',
        accent: '#8a4a9a',
        contentJson: JSON.stringify([
          'Orin is sixteen and already the most important person the Veilborn have produced in a generation. Since childhood, the sentient sea responds to his presence — calming storms, revealing safe passages, and occasionally surfacing objects from the drowned capital that no diver has been able to reach.',
          'The Tide Council wants to use him as a living navigation tool. The Red Choir wants to understand his ability so they can replicate it. The Veilborn elders want to protect him from both. Orin himself wants to understand why the sea chose him — and what it\'s trying to tell him.',
        ]),
        factsJson: JSON.stringify([
          { label: 'Age', value: '16' },
          { label: 'Origin', value: 'Deep Veilborn settlement' },
          { label: 'Abilities', value: 'Sea communion, relic surfacing' },
          { label: 'Status', value: 'Protected — contested' },
        ]),
        tagsJson: JSON.stringify(['prodigy', 'veilborn', 'sea communion', 'young', 'contested']),
        graphX: 50,
        graphY: 75,
      },
    }),

    // Locations
    prisma.entity.create({
      data: {
        worldId: everhold.id,
        slug: 'glass-anchorage',
        type: EntityType.LOCATION,
        title: 'The Glass Anchorage',
        summary:
          'The central floating citadel of Everhold — built from crystallized sea-spray and salvaged observatory panes, where light itself serves as law.',
        accent: '#4a9a6e',
        contentJson: JSON.stringify([
          'The Glass Anchorage is Everhold\'s largest and most politically significant citadel. Its architecture is constructed from crystallized sea-spray — a material that forms naturally where the sentient sea\'s surface tension meets the warm air currents above.',
          'Every surface reflects and refracts light, making the Anchorage both beautiful and politically transparent. Diplomatic meetings happen in mirrored chambers where body language, micro-expressions, and even stress-sweat patterns are visible to all parties. Betrayal literally leaves a visual trace on the mirrored docks.',
          'The Anchorage houses the Tide Council\'s chambers, the Cartographer\'s Spire, and the largest civilian population of any citadel. Its harbor masters read light-patterns as legal declarations, and its courts adjudicate disputes based on optical evidence.',
        ]),
        factsJson: JSON.stringify([
          { label: 'Region', value: 'Central Drift' },
          { label: 'Population', value: '~12,000' },
          { label: 'Governance', value: 'Tide Council' },
          { label: 'Economy', value: 'Diplomacy, shipbuilding, cartography' },
          { label: 'Known for', value: 'Mirror law, crystalline architecture' },
        ]),
        tagsJson: JSON.stringify(['capital', 'diplomacy', 'crystal', 'harbor', 'transparent']),
        graphX: 35,
        graphY: 50,
        mapX: 48,
        mapY: 42,
      },
    }),
    prisma.entity.create({
      data: {
        worldId: everhold.id,
        slug: 'drowning-market',
        type: EntityType.LOCATION,
        title: 'The Drowning Market',
        summary:
          'A half-submerged bazaar on the eastern rings where merchants negotiate with the sea itself for salvage rights.',
        accent: '#4a6e9a',
        contentJson: JSON.stringify([
          'The Drowning Market sits at the waterline — literally. Its lower stalls are submerged at high tide, and the merchants who work them have developed rituals for negotiating with the sentient sea about what it will release from below.',
          'Every item sold here comes with provenance: a story of what the sea chose to give up, and why. The most valuable goods are those the sea surrendered reluctantly, as this implies they hold knowledge the deep wants to forget.',
          'The Red Choir maintains a permanent presence here, recording every transaction as potential leverage. The Veilborn come to trade deep-salvage for surface goods, and the Tide Council sends observers to monitor what the sea is choosing to reveal.',
        ]),
        factsJson: JSON.stringify([
          { label: 'Region', value: 'Eastern Rings' },
          { label: 'Governance', value: 'Merchant guild' },
          { label: 'Economy', value: 'Salvage trade, ritual commerce' },
          { label: 'Known for', value: 'Sea-negotiation, relic trade' },
        ]),
        tagsJson: JSON.stringify(['market', 'salvage', 'trade', 'submerged', 'ritual']),
        graphX: 80,
        graphY: 55,
        mapX: 68,
        mapY: 55,
      },
    }),

    prisma.entity.create({
      data: {
        worldId: everhold.id,
        slug: 'iron-lattice',
        type: EntityType.LOCATION,
        title: 'The Iron Lattice',
        summary:
          'A military citadel forged from salvaged warship hulls — the armed fist of the Tide Council and Everhold\'s first line of defense.',
        accent: '#6a6a7a',
        contentJson: JSON.stringify([
          'The Iron Lattice was built by welding together the armored hulls of the Deep Empire\'s sunken war fleet. It is the most defensible citadel in Everhold, bristling with harpoon batteries, depth charges, and pressure cannons.',
          'Its commander holds a permanent seat on the Tide Council as one of the three Anchors. The Lattice trains every naval officer in Everhold and controls the patrol routes that keep the outer rings safe from deep-sea predators.',
        ]),
        factsJson: JSON.stringify([
          { label: 'Region', value: 'Northern Perimeter' },
          { label: 'Population', value: '~4,500' },
          { label: 'Governance', value: 'Military command' },
          { label: 'Known for', value: 'Naval power, defense, training' },
        ]),
        tagsJson: JSON.stringify(['military', 'defense', 'warships', 'anchor citadel']),
        graphX: 40,
        graphY: 35,
        mapX: 35,
        mapY: 28,
      },
    }),
    prisma.entity.create({
      data: {
        worldId: everhold.id,
        slug: 'drifting-seminary',
        type: EntityType.LOCATION,
        title: 'The Drifting Seminary',
        summary:
          'A sacred citadel devoted to interpreting the sentient sea\'s moods — part temple, part observatory, part diplomatic neutral ground.',
        accent: '#7a6a9a',
        contentJson: JSON.stringify([
          'The Drifting Seminary is the only citadel that moves. Its priests read the sea\'s pressure patterns as divine speech and adjust the Seminary\'s chain-anchors to follow what they call the Listening Current.',
          'As one of the three Anchor citadels, the Seminary provides religious legitimacy to the Tide Council. Its high priests can declare a voyage blessed or cursed, effectively controlling which trade routes are used.',
        ]),
        factsJson: JSON.stringify([
          { label: 'Region', value: 'Wandering (currently Southwest)' },
          { label: 'Population', value: '~2,000' },
          { label: 'Governance', value: 'Priestly council' },
          { label: 'Known for', value: 'Sea reading, prophecy, neutral ground' },
        ]),
        tagsJson: JSON.stringify(['temple', 'prophecy', 'anchor citadel', 'mobile']),
        graphX: 20,
        graphY: 60,
        mapX: 28,
        mapY: 62,
      },
    }),
    prisma.entity.create({
      data: {
        worldId: everhold.id,
        slug: 'rust-shallows',
        type: EntityType.LOCATION,
        title: 'The Rust Shallows',
        summary:
          'A lawless ring of decommissioned platforms on the outer edge — haven for smugglers, exiles, and those the sea has rejected.',
        accent: '#8a5a3a',
        contentJson: JSON.stringify([
          'The Rust Shallows is where Everhold puts what it doesn\'t want to look at. Decommissioned platforms, broken chains, and abandoned hulks form a loose ring at the outermost perimeter.',
          'No Tide Council law reaches here. The Red Choir avoids it because debts are uncollectable. It\'s home to smugglers, political exiles, and a growing population of people who\'ve defaulted on memory contracts and lost parts of themselves.',
        ]),
        factsJson: JSON.stringify([
          { label: 'Region', value: 'Outer Perimeter' },
          { label: 'Population', value: '~1,200 (unofficial)' },
          { label: 'Governance', value: 'None — anarchic' },
          { label: 'Known for', value: 'Smuggling, exile, freedom' },
        ]),
        tagsJson: JSON.stringify(['outlaw', 'exile', 'smuggling', 'lawless', 'outer ring']),
        graphX: 85,
        graphY: 70,
        mapX: 78,
        mapY: 72,
      },
    }),
    prisma.entity.create({
      data: {
        worldId: everhold.id,
        slug: 'abyssal-gate',
        type: EntityType.LOCATION,
        title: 'The Abyssal Gate',
        summary:
          'A deep-sea passage to the drowned capital — guarded by the Veilborn and feared by surface dwellers.',
        accent: '#2a4a6a',
        contentJson: JSON.stringify([
          'The Abyssal Gate is a vertical shaft that descends through the flood strata into the upper ruins of the drowned capital. It is the only known stable entrance to the deep.',
          'The Veilborn control access and charge a steep price for passage. Few surface dwellers have descended and returned unchanged. Those who do speak of vast underwater halls still lit by bioluminescent machinery.',
        ]),
        factsJson: JSON.stringify([
          { label: 'Region', value: 'Central Deep (below the Anchorage)' },
          { label: 'Controlled by', value: 'Veilborn elders' },
          { label: 'Danger level', value: 'Extreme' },
          { label: 'Known for', value: 'Only passage to the drowned capital' },
        ]),
        tagsJson: JSON.stringify(['deep', 'underwater', 'ruins', 'dangerous', 'passage']),
        graphX: 45,
        graphY: 65,
        mapX: 50,
        mapY: 58,
      },
    }),

    // Factions
    prisma.entity.create({
      data: {
        worldId: everhold.id,
        slug: 'red-choir',
        type: EntityType.FACTION,
        title: 'The Red Choir',
        summary:
          'A mercantile order that trades in memory contracts and maritime debt — the true financial power behind Everhold\'s floating economy.',
        accent: '#9a4a6e',
        contentJson: JSON.stringify([
          'The Red Choir emerged in the chaos after the Great Drowning, when memory became more valuable than gold. They developed rituals for preserving testimony, trauma, and strategic knowledge in sealed vaults, and then lending against those memories as collateral.',
          'A Red Choir memory contract is binding not just legally but neurologically — defaulting on a memory loan means losing the memories that secured it. This makes the Choir both indispensable and terrifying.',
          'Their influence reaches every floating district because they underwrite fleets, funerals, and regime changes with the same ledger. The Choir doesn\'t rule Everhold, but nothing happens without their balance sheets knowing about it first.',
        ]),
        factsJson: JSON.stringify([
          { label: 'Founded', value: 'Year 12 After Rise' },
          { label: 'Headquarters', value: 'Choir Market (Eastern Rings)' },
          { label: 'Leader', value: 'The Senior Partners (anonymous)' },
          { label: 'Motive', value: 'Monopoly over memory finance' },
          { label: 'Strength', value: 'Financial, intelligence, ritual' },
        ]),
        tagsJson: JSON.stringify(['banking', 'memory', 'trade', 'contracts', 'power']),
        graphX: 65,
        graphY: 20,
      },
    }),
    prisma.entity.create({
      data: {
        worldId: everhold.id,
        slug: 'tide-council',
        type: EntityType.FACTION,
        title: 'The Tide Council',
        summary:
          'The governing body of Everhold — an uneasy coalition of citadel leaders who balance power between military force, diplomacy, and the sea\'s will.',
        accent: '#4a6e9a',
        contentJson: JSON.stringify([
          'The Tide Council formed when the first citadels were chained together and someone had to decide who got fresh water, who got sunlight, and who got pushed to the dangerous outer rings.',
          'Each citadel sends a representative, but real power belongs to the three Anchors: the Glass Anchorage, the Iron Lattice, and the Drifting Seminary. These three citadels control military force, trade routes, and religious legitimacy respectively.',
          'The Council\'s greatest challenge is the Red Choir, which operates outside their jurisdiction but controls the financial infrastructure they depend on. Their greatest hope is the Tide Crown, which could give them authority the Choir cannot buy.',
        ]),
        factsJson: JSON.stringify([
          { label: 'Founded', value: 'Year 3 After Rise' },
          { label: 'Headquarters', value: 'The Glass Anchorage' },
          { label: 'Leader', value: 'Rotating Chair (currently Magister Voss)' },
          { label: 'Strength', value: 'Military, diplomatic legitimacy' },
        ]),
        tagsJson: JSON.stringify(['government', 'military', 'diplomacy', 'authority', 'coalition']),
        graphX: 25,
        graphY: 15,
      },
    }),

    // Artifacts
    prisma.entity.create({
      data: {
        worldId: everhold.id,
        slug: 'tide-crown',
        type: EntityType.ARTIFACT,
        title: 'The Tide Crown',
        summary:
          'An ancient interface from the Deep Empire that can command submerged infrastructure — and possibly raise or permanently drown the old capital.',
        accent: '#c8a44e',
        contentJson: JSON.stringify([
          'The Tide Crown is not jewelry. It is a surviving control interface from the Deep Empire\'s infrastructure network — a crystalline device that resonates with the machinery still functioning beneath the waves.',
          'When activated, it can command locks, pumps, and defensive systems in the drowned capital for brief periods. But the crown is fractured, and each use risks catastrophic feedback. A stable connection could raise the capital; an unstable one could drown every citadel above.',
          'The Crown responds to bloodline, pressure patterns, and language sequences no modern faction fully understands. Aurelian Vale holds the archive-key that may be needed to stabilize it. The Veilborn understand its pressure-language intuitively. The Red Choir has spent decades trying to reverse-engineer its ritual protocols.',
        ]),
        factsJson: JSON.stringify([
          { label: 'Origin', value: 'Deep Empire (pre-Drowning)' },
          { label: 'Condition', value: 'Fractured — unstable' },
          { label: 'Threat level', value: 'Civilization-ending' },
          { label: 'Current custody', value: 'Unknown — last seen in the deep' },
          { label: 'Requires', value: 'Archive-key for stabilization' },
        ]),
        tagsJson: JSON.stringify(['relic', 'infrastructure', 'royal', 'dangerous', 'control']),
        graphX: 50,
        graphY: 45,
      },
    }),
    prisma.entity.create({
      data: {
        worldId: everhold.id,
        slug: 'drowned-codex',
        type: EntityType.ARTIFACT,
        title: 'The Drowned Codex',
        summary:
          'A waterproof tome containing the Deep Empire\'s final administrative records — including the blueprints for infrastructure the Tide Crown controls.',
        accent: '#4a6e9a',
        contentJson: JSON.stringify([
          'The Drowned Codex was recovered from a sealed chamber in the upper ruins by a Veilborn diving team. It is written in a pressure-script that can only be read at specific depths, making it nearly impossible to study on the surface.',
          'Its contents include population records, infrastructure schematics, and — most critically — the authorization codes that the Tide Crown uses to interface with the drowned capital\'s systems. Without the Codex, the Crown is a loaded weapon with no trigger.',
        ]),
        factsJson: JSON.stringify([
          { label: 'Origin', value: 'Deep Empire archives' },
          { label: 'Format', value: 'Pressure-script (depth-dependent)' },
          { label: 'Current holder', value: 'Aurelian Vale (partial)' },
          { label: 'Value', value: 'Priceless — operational intelligence' },
        ]),
        tagsJson: JSON.stringify(['codex', 'records', 'pressure-script', 'infrastructure', 'intelligence']),
        graphX: 30,
        graphY: 65,
      },
    }),

    // Species
    prisma.entity.create({
      data: {
        worldId: everhold.id,
        slug: 'veilborn',
        type: EntityType.SPECIES,
        title: 'The Veilborn',
        summary:
          'A pressure-adapted people who survived the Great Drowning by descending rather than ascending — and who now live between the surface world and the sentient sea.',
        accent: '#8a4a9a',
        contentJson: JSON.stringify([
          'When the Great Drowning consumed the Deep Empire, most survivors fled upward. The Veilborn went down. They adapted to the crushing pressure of the lower flood strata through a combination of ritual body modification, selective breeding, and — some whisper — bargains with the sentient sea itself.',
          'The Veilborn can breathe in the pressure-rich lower waters, communicate through pressure pulses, and navigate the drowned ruins with an intuition that surface-dwellers find unsettling. They treat the sea not as a force of nature but as an archive — a living memory of everything it has consumed.',
          'Surface factions romanticize them as mystic divers while simultaneously exploiting their knowledge of the deep. The Veilborn tolerate this exchange because they need surface goods, but tensions are rising as the Red Choir pushes deeper into their territory.',
        ]),
        factsJson: JSON.stringify([
          { label: 'Habitat', value: 'Lower flood strata' },
          { label: 'Population', value: '~3,000' },
          { label: 'Adaptations', value: 'Pressure breathing, depth sight, pulse speech' },
          { label: 'Role', value: 'Divers, relic recovery, deep knowledge' },
          { label: 'Conflict', value: 'Exploited by surface factions' },
        ]),
        tagsJson: JSON.stringify(['deepwater', 'adapted', 'ritual', 'divers', 'knowledge keepers']),
        graphX: 55,
        graphY: 80,
      },
    }),

    // Events as entities
    prisma.entity.create({
      data: {
        worldId: everhold.id,
        slug: 'great-drowning',
        type: EntityType.EVENT,
        title: 'The Great Drowning',
        summary:
          'The cataclysm that consumed the Deep Empire — not a natural disaster but an awakening of the sentient sea.',
        accent: '#9a7a4a',
        contentJson: JSON.stringify([
          'The Great Drowning was not a flood. It was a decision. The sentient sea — dormant for millennia beneath the Deep Empire — woke up. In a single tide cycle, it consumed every coastal city, every underground vault, and every person who could not reach high ground.',
          'The few who survived did so by climbing the empire\'s tallest spires and chaining boats to their peaks. These became the first citadels of Everhold.',
          'Why the sea awoke remains the central mystery of Everhold\'s history. The Veilborn believe the empire committed an offense against the deep. The Tide Council\'s official history calls it a natural phenomenon. The Red Choir doesn\'t care why it happened — only who profited.',
        ]),
        factsJson: JSON.stringify([
          { label: 'Date', value: 'Year 0 (the defining event)' },
          { label: 'Cause', value: 'Unknown — sea awakening' },
          { label: 'Casualties', value: 'Estimated 90% of population' },
          { label: 'Consequence', value: 'Foundation of Everhold' },
        ]),
        tagsJson: JSON.stringify(['cataclysm', 'origin', 'mystery', 'sea', 'empire fall']),
        graphX: 10,
        graphY: 70,
      },
    }),
  ]);

  const bySlug = Object.fromEntries(entities.map((e) => [e.slug, e]));

  // ─── Relations ───
  await prisma.entityRelation.createMany({
    data: [
      { worldId: everhold.id, fromEntityId: bySlug['aurelian-vale'].id, toEntityId: bySlug['glass-anchorage'].id, label: 'resides in' },
      { worldId: everhold.id, fromEntityId: bySlug['aurelian-vale'].id, toEntityId: bySlug['red-choir'].id, label: 'owes debt to' },
      { worldId: everhold.id, fromEntityId: bySlug['aurelian-vale'].id, toEntityId: bySlug['tide-crown'].id, label: 'holds archive-key for' },
      { worldId: everhold.id, fromEntityId: bySlug['aurelian-vale'].id, toEntityId: bySlug['drowned-codex'].id, label: 'possesses (partial)' },
      { worldId: everhold.id, fromEntityId: bySlug['aurelian-vale'].id, toEntityId: bySlug['tide-council'].id, label: 'serves (uneasily)' },
      { worldId: everhold.id, fromEntityId: bySlug['seraphine-duskmantle'].id, toEntityId: bySlug['red-choir'].id, label: 'commands enforcement for' },
      { worldId: everhold.id, fromEntityId: bySlug['seraphine-duskmantle'].id, toEntityId: bySlug['veilborn'].id, label: 'born among' },
      { worldId: everhold.id, fromEntityId: bySlug['orin-tidecaller'].id, toEntityId: bySlug['veilborn'].id, label: 'belongs to' },
      { worldId: everhold.id, fromEntityId: bySlug['orin-tidecaller'].id, toEntityId: bySlug['tide-crown'].id, label: 'may be able to stabilize' },
      { worldId: everhold.id, fromEntityId: bySlug['red-choir'].id, toEntityId: bySlug['tide-crown'].id, label: 'seeks control of' },
      { worldId: everhold.id, fromEntityId: bySlug['red-choir'].id, toEntityId: bySlug['drowning-market'].id, label: 'monitors' },
      { worldId: everhold.id, fromEntityId: bySlug['tide-council'].id, toEntityId: bySlug['glass-anchorage'].id, label: 'headquartered in' },
      { worldId: everhold.id, fromEntityId: bySlug['tide-council'].id, toEntityId: bySlug['red-choir'].id, label: 'rivals' },
      { worldId: everhold.id, fromEntityId: bySlug['veilborn'].id, toEntityId: bySlug['great-drowning'].id, label: 'survived' },
      { worldId: everhold.id, fromEntityId: bySlug['veilborn'].id, toEntityId: bySlug['drowning-market'].id, label: 'trade in' },
      { worldId: everhold.id, fromEntityId: bySlug['tide-crown'].id, toEntityId: bySlug['great-drowning'].id, label: 'predates' },
      { worldId: everhold.id, fromEntityId: bySlug['drowned-codex'].id, toEntityId: bySlug['tide-crown'].id, label: 'contains codes for' },
    ],
  });

  // ─── Eras ───
  const eras = await Promise.all([
    prisma.era.create({
      data: {
        worldId: everhold.id,
        slug: 'the-fall',
        title: 'The Fall',
        description: 'The cataclysm that ended the Deep Empire and the desperate first days of survival above the waves.',
        sortOrder: 1,
        startLabel: 'Year 0',
        endLabel: 'Year 2',
        color: '#9a4a4a',
      },
    }),
    prisma.era.create({
      data: {
        worldId: everhold.id,
        slug: 'after-rise',
        title: 'After Rise',
        description: 'The founding era — when citadels were chained together, governance was established, and the Veilborn emerged from the deep.',
        sortOrder: 2,
        startLabel: 'Year 3',
        endLabel: 'Year 11',
        color: '#4a6e9a',
      },
    }),
    prisma.era.create({
      data: {
        worldId: everhold.id,
        slug: 'ledger-age',
        title: 'Ledger Age',
        description: 'The Red Choir rises to power through memory finance, reshaping Everhold\'s economy and politics.',
        sortOrder: 3,
        startLabel: 'Year 12',
        endLabel: 'Year 25',
        color: '#9a4a6e',
      },
    }),
    prisma.era.create({
      data: {
        worldId: everhold.id,
        slug: 'tidal-expansion',
        title: 'Tidal Expansion',
        description: 'New routes are charted, old secrets surface, and the factions prepare for a confrontation over the Tide Crown.',
        sortOrder: 4,
        startLabel: 'Year 26',
        endLabel: 'Year 29',
        color: '#c8a44e',
      },
    }),
    prisma.era.create({
      data: {
        worldId: everhold.id,
        slug: 'present-day',
        title: 'Present Day',
        description: 'The current era — Orin\'s communion with the sea has shattered the status quo. The race for the Tide Crown has begun.',
        sortOrder: 5,
        startLabel: 'Year 30',
        endLabel: 'Now',
        color: '#4a9a6e',
      },
    }),
  ]);

  const eraBySlug = Object.fromEntries(eras.map((e) => [e.slug, e]));

  // ─── Timeline Events ───
  const timelineEvents = await Promise.all([
    prisma.event.create({
      data: {
        worldId: everhold.id,
        title: 'The Great Drowning',
        dateLabel: 'Year 0',
        era: 'The Fall',
        eraId: eraBySlug['the-fall'].id,
        sortOrder: 1,
        summary: 'The sentient sea awakens and consumes the Deep Empire in a single tide cycle. Ninety percent of the population perishes.',
        impact: 'Defines Year Zero. All of Everhold\'s history is measured from this moment.',
        linkedEntitySlugs: 'great-drowning,veilborn',
      },
    }),
    prisma.event.create({
      data: {
        worldId: everhold.id,
        title: 'The First Ascension',
        dateLabel: 'Year 1',
        era: 'The Fall',
        eraId: eraBySlug['the-fall'].id,
        sortOrder: 2,
        summary: 'Survivors chain the first boats and platforms to the spires of drowned buildings, creating the first floating citadels.',
        impact: 'Creates the physical foundation of Everhold.',
        linkedEntitySlugs: 'glass-anchorage',
      },
    }),
    prisma.event.create({
      data: {
        worldId: everhold.id,
        title: 'Formation of the Tide Council',
        dateLabel: 'Year 3',
        era: 'After Rise',
        eraId: eraBySlug['after-rise'].id,
        sortOrder: 3,
        summary: 'Citadel leaders agree to share resources and establish governance. The three Anchor citadels claim permanent seats.',
        impact: 'Establishes political order and prevents war between citadels.',
        linkedEntitySlugs: 'tide-council,glass-anchorage',
      },
    }),
    prisma.event.create({
      data: {
        worldId: everhold.id,
        title: 'The Veilborn Emergence',
        dateLabel: 'Year 8',
        era: 'After Rise',
        eraId: eraBySlug['after-rise'].id,
        sortOrder: 4,
        summary: 'The first Veilborn appear at the surface, revealing that a population survived by descending into the deep. They bring salvaged relics and knowledge.',
        impact: 'Transforms understanding of the Drowning and creates a new social class.',
        linkedEntitySlugs: 'veilborn',
      },
    }),
    prisma.event.create({
      data: {
        worldId: everhold.id,
        title: 'The Memory Market Accord',
        dateLabel: 'Year 12',
        era: 'Ledger Age',
        eraId: eraBySlug['ledger-age'].id,
        sortOrder: 5,
        summary: 'The Red Choir legalizes memory-backed debt instruments, creating a new financial system based on preserved testimony and knowledge.',
        impact: 'Shifts power from military bloodlines to financial institutions.',
        linkedEntitySlugs: 'red-choir,drowning-market',
      },
    }),
    prisma.event.create({
      data: {
        worldId: everhold.id,
        title: 'Discovery of the Drowned Codex',
        dateLabel: 'Year 19',
        era: 'Ledger Age',
        eraId: eraBySlug['ledger-age'].id,
        sortOrder: 6,
        summary: 'A Veilborn diving team recovers a sealed tome from the upper ruins — the Deep Empire\'s final administrative records, written in pressure-script.',
        impact: 'Reveals the existence of still-functional infrastructure beneath Everhold.',
        linkedEntitySlugs: 'drowned-codex,veilborn',
      },
    }),
    prisma.event.create({
      data: {
        worldId: everhold.id,
        title: 'Aurelian Maps the Silent Current',
        dateLabel: 'Year 26',
        era: 'Tidal Expansion',
        eraId: eraBySlug['tidal-expansion'].id,
        sortOrder: 7,
        summary: 'Aurelian Vale discovers a hidden navigational route that opens access to the lower rings — and to the approaches of the drowned capital.',
        impact: 'Transforms Aurelian from obscure cartographer into a geopolitical target.',
        linkedEntitySlugs: 'aurelian-vale,glass-anchorage',
      },
    }),
    prisma.event.create({
      data: {
        worldId: everhold.id,
        title: 'The Whispering Accord',
        dateLabel: 'Year 28',
        era: 'Tidal Expansion',
        eraId: eraBySlug['tidal-expansion'].id,
        sortOrder: 8,
        summary: 'The Tide Council, Red Choir, and Veilborn elders meet in secret to discuss the Tide Crown. No agreement is reached. Each faction begins independent operations to find it.',
        impact: 'Ends the fragile peace. A three-way cold war begins.',
        linkedEntitySlugs: 'tide-crown,tide-council,red-choir,veilborn',
      },
    }),
    prisma.event.create({
      data: {
        worldId: everhold.id,
        title: 'Orin\'s First Communion',
        dateLabel: 'Year 30 (present)',
        era: 'Present Day',
        eraId: eraBySlug['present-day'].id,
        sortOrder: 9,
        summary: 'Sixteen-year-old Orin Tidecaller communicates with the sentient sea in a way never before recorded. The sea responds by surfacing an object from the drowned capital — the first fragment of the Tide Crown.',
        impact: 'Everything changes. The race for the Crown is no longer theoretical.',
        linkedEntitySlugs: 'orin-tidecaller,tide-crown,veilborn',
      },
    }),
  ]);

  // ─── Event-Entity Links ───
  const eventByTitle = Object.fromEntries(timelineEvents.map((e) => [e.title, e]));

  await prisma.eventEntityLink.createMany({
    data: [
      // The Great Drowning
      { eventId: eventByTitle['The Great Drowning'].id, entityId: bySlug['great-drowning'].id, role: 'subject' },
      { eventId: eventByTitle['The Great Drowning'].id, entityId: bySlug['veilborn'].id, role: 'survivor' },
      // The First Ascension
      { eventId: eventByTitle['The First Ascension'].id, entityId: bySlug['glass-anchorage'].id, role: 'founded' },
      // Formation of the Tide Council
      { eventId: eventByTitle['Formation of the Tide Council'].id, entityId: bySlug['tide-council'].id, role: 'founded' },
      { eventId: eventByTitle['Formation of the Tide Council'].id, entityId: bySlug['glass-anchorage'].id, role: 'headquarters' },
      // The Veilborn Emergence
      { eventId: eventByTitle['The Veilborn Emergence'].id, entityId: bySlug['veilborn'].id, role: 'subject' },
      // The Memory Market Accord
      { eventId: eventByTitle['The Memory Market Accord'].id, entityId: bySlug['red-choir'].id, role: 'founder' },
      { eventId: eventByTitle['The Memory Market Accord'].id, entityId: bySlug['drowning-market'].id, role: 'location' },
      // Discovery of the Drowned Codex
      { eventId: eventByTitle['Discovery of the Drowned Codex'].id, entityId: bySlug['drowned-codex'].id, role: 'discovered' },
      { eventId: eventByTitle['Discovery of the Drowned Codex'].id, entityId: bySlug['veilborn'].id, role: 'discoverer' },
      // Aurelian Maps the Silent Current
      { eventId: eventByTitle['Aurelian Maps the Silent Current'].id, entityId: bySlug['aurelian-vale'].id, role: 'protagonist' },
      { eventId: eventByTitle['Aurelian Maps the Silent Current'].id, entityId: bySlug['glass-anchorage'].id, role: 'location' },
      // The Whispering Accord
      { eventId: eventByTitle['The Whispering Accord'].id, entityId: bySlug['tide-crown'].id, role: 'subject' },
      { eventId: eventByTitle['The Whispering Accord'].id, entityId: bySlug['tide-council'].id, role: 'participant' },
      { eventId: eventByTitle['The Whispering Accord'].id, entityId: bySlug['red-choir'].id, role: 'participant' },
      { eventId: eventByTitle['The Whispering Accord'].id, entityId: bySlug['veilborn'].id, role: 'participant' },
      // Orin's First Communion
      { eventId: eventByTitle['Orin\'s First Communion'].id, entityId: bySlug['orin-tidecaller'].id, role: 'protagonist' },
      { eventId: eventByTitle['Orin\'s First Communion'].id, entityId: bySlug['tide-crown'].id, role: 'surfaced' },
      { eventId: eventByTitle['Orin\'s First Communion'].id, entityId: bySlug['veilborn'].id, role: 'involved' },
    ],
  });

  // ─── Activity Logs ───
  await prisma.activityLog.createMany({
    data: [
      { worldId: everhold.id, userId: demo.id, action: 'created', target: 'world "Everhold"' },
      { worldId: everhold.id, userId: demo.id, action: 'created', target: 'character "Aurelian Vale"' },
      { worldId: everhold.id, userId: demo.id, action: 'created', target: 'character "Seraphine Duskmantle"' },
      { worldId: everhold.id, userId: noor.id, action: 'created', target: 'faction "The Red Choir"' },
      { worldId: everhold.id, userId: noor.id, action: 'created', target: 'location "The Glass Anchorage"' },
      { worldId: everhold.id, userId: eli.id, action: 'linked', target: 'Aurelian Vale to The Tide Crown' },
      { worldId: everhold.id, userId: demo.id, action: 'created', target: 'species "The Veilborn"' },
      { worldId: everhold.id, userId: noor.id, action: 'added event', target: '"The Great Drowning"' },
      { worldId: everhold.id, userId: demo.id, action: 'updated', target: 'artifact "The Tide Crown"' },
      { worldId: everhold.id, userId: eli.id, action: 'created', target: 'character "Orin Tidecaller"' },
    ],
  });

  console.log('Seed complete.');
  console.log('');
  console.log('Demo credentials:');
  console.log('  Email:    demo@worldforge.app');
  console.log('  Password: worldforge');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
