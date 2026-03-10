import Link from 'next/link';
import { Navbar } from '@/components/Navbar';

const FANTASY = '/tilesets/npcs/fantasy-pixel-rpg-sprite-pack/Individual_Sprites';
const GL = '/tilesets/grassland-v2/ERW - Grass Land 2.0 v1.9/ERW - Grass Land 2.0 v1.9';
const VIL = '/tilesets/summer_village_v1.0_plus/summer_village_v1.0_plus';

const HIW_SPRITES = [
  { src: `${FANTASY}/paladin_01_001.png`, alt: 'Paladin' },
  { src: `${FANTASY}/priest_01_001.png`, alt: 'Priest' },
  { src: `${FANTASY}/dwarf_01_008.png`, alt: 'Dwarf' },
  { src: `${FANTASY}/elf_01_001.png`, alt: 'Elf Scout' },
  { src: `${FANTASY}/warrior_01_003.png`, alt: 'Swordswoman' },
  { src: `${FANTASY}/mage_01_005.png`, alt: 'Fire Witch' },
  { src: `${FANTASY}/elf_02_005.png`, alt: 'Herbalist' },
  { src: `${FANTASY}/skeleton_01_001.png`, alt: 'Skeleton' },
  { src: `${FANTASY}/skeleton_01_005.png`, alt: 'Undead' },
];

export default function HowItWorksPage() {
  return (
    <div className="hiw-page">
      <Navbar />

      {/* ─── Hero ─── */}
      <section className="hiw-hero tileset-bg">
        <h1>How Worldforge Works</h1>
        <p className="hiw-hero-sub">
          A complete guide to every feature &mdash; from creating your first world to
          playing inside it. Worldbuilding, combat, NPCs, quests, building, character customization,
          AI generation, and everything in between.
        </p>
        <div className="sprite-parade" style={{ marginTop: 16 }}>
          {HIW_SPRITES.map(c => (
            <img key={c.alt} src={c.src} alt={c.alt} />
          ))}
        </div>
      </section>

      {/* ─── Table of Contents ─── */}
      <nav className="hiw-toc">
        <div className="hiw-toc-inner">
          <span className="hiw-toc-label">Jump to:</span>
          <a href="#creating" className="hiw-toc-link">Creating a World</a>
          <a href="#entities" className="hiw-toc-link">Entities</a>
          <a href="#relationships" className="hiw-toc-link">Relationships</a>
          <a href="#timeline" className="hiw-toc-link">Timeline &amp; Eras</a>
          <a href="#views" className="hiw-toc-link">Ways to See Your World</a>
          <a href="#gameplay" className="hiw-toc-link">Gameplay</a>
          <a href="#characters" className="hiw-toc-link">Characters</a>
          <a href="#building" className="hiw-toc-link">Building</a>
          <a href="#away-mode" className="hiw-toc-link">AI Storytelling</a>
          <a href="#developments" className="hiw-toc-link">Story Review</a>
          <a href="#sharing" className="hiw-toc-link">Sharing</a>
        </div>
      </nav>

      {/* ─── Sections ─── */}
      <div className="hiw-content">

        {/* Creating a World */}
        <section id="creating" className="hiw-section">
          <div className="hiw-section-number">01</div>
          <h2>Creating a World</h2>
          <p>
            When you create a new world, you have two options:
          </p>
          <div className="hiw-two-col">
            <div className="hiw-option-card">
              <h3>AI Generation</h3>
              <p>
                Describe a concept — like <em>&ldquo;a dying world where the last city floats above an ocean of ash&rdquo;</em> — and
                the AI generates everything: a world name, description, 8-12 entities (characters, locations, factions, artifacts,
                species), a timeline with multiple eras and events, and all the relationships between them. It takes about 30 seconds.
              </p>
              <p>
                <strong>Everything is editable.</strong> AI gives you a starting point. You can change names, rewrite backstories,
                delete things you don&apos;t like, and add new content. Nothing is locked.
              </p>
            </div>
            <div className="hiw-option-card">
              <h3>Build Manually</h3>
              <p>
                Start with an empty world and build everything yourself. Create entities one by one, write their lore,
                define relationships, add timeline events, and organize everything into eras. Full control from the start.
              </p>
              <p>
                You can also mix both approaches — generate a world with AI, then manually add, edit, or remove whatever you want.
              </p>
            </div>
          </div>
        </section>

        {/* Entities */}
        <section id="entities" className="hiw-section">
          <div className="hiw-section-number">02</div>
          <h2>Entities</h2>
          <p>
            Entities are the building blocks of your world — every person, place, group, object, creature, and major event.
            There are six types:
          </p>
          <div className="hiw-entity-grid">
            <div className="hiw-entity-type">
              <span className="hiw-entity-dot" style={{ background: 'var(--color-character)' }} />
              <div>
                <h4>Characters</h4>
                <p>The people in your world. Heroes, villains, rulers, merchants, rebels. Each gets a full profile page with
                backstory paragraphs, custom facts (like &ldquo;Age: 34&rdquo; or &ldquo;Title: Exiled Prince&rdquo;), and tags for filtering.</p>
              </div>
            </div>
            <div className="hiw-entity-type">
              <span className="hiw-entity-dot" style={{ background: 'var(--color-location)' }} />
              <div>
                <h4>Locations</h4>
                <p>Cities, mountains, ruins, taverns, temples — anywhere that matters. They appear as markers on the map and in Explore mode.</p>
              </div>
            </div>
            <div className="hiw-entity-type">
              <span className="hiw-entity-dot" style={{ background: 'var(--color-faction)' }} />
              <div>
                <h4>Factions</h4>
                <p>Organized groups with shared goals. Kingdoms, guilds, cults, rebel alliances. Factions can own territory on the map.</p>
              </div>
            </div>
            <div className="hiw-entity-type">
              <span className="hiw-entity-dot" style={{ background: 'var(--color-artifact)' }} />
              <div>
                <h4>Artifacts</h4>
                <p>Important objects. A legendary sword, a cursed ring, a sacred scroll — items that matter to your lore.</p>
              </div>
            </div>
            <div className="hiw-entity-type">
              <span className="hiw-entity-dot" style={{ background: 'var(--color-species)' }} />
              <div>
                <h4>Species</h4>
                <p>Races and creatures. Elves, dragons, sentient mushrooms — whatever lives in your world.</p>
              </div>
            </div>
            <div className="hiw-entity-type">
              <span className="hiw-entity-dot" style={{ background: 'var(--color-event)' }} />
              <div>
                <h4>Events</h4>
                <p>Major occurrences treated as entities — a war, a plague, a discovery. These also appear on the timeline.</p>
              </div>
            </div>
          </div>
          <div className="hiw-callout">
            <strong>Each entity page includes:</strong> lore paragraphs, custom key-value facts (like a wiki infobox),
            tags, a history timeline showing every event they were involved in, their connections to other entities,
            and for characters — an AI Storytelling toggle.
          </div>
        </section>

        {/* Relationships */}
        <section id="relationships" className="hiw-section">
          <div className="hiw-section-number">03</div>
          <h2>Relationships</h2>
          <p>
            Relationships are connections between any two entities. &ldquo;Kael leads The Iron Guard.&rdquo;
            &ldquo;The Sunblade was forged in Mount Ashara.&rdquo; &ldquo;The Northern Kingdom is allied with The Merchant Guild.&rdquo;
          </p>
          <p>
            You define who or what is connected and write a short label describing the connection.
            Relationships are bidirectional — if Kael leads The Iron Guard, you&apos;ll see that link from both entity pages.
          </p>
          <p>
            All connections get visualized on the <strong>Connections page</strong> — an interactive visual map
            where every entity is a dot and every connection is a line. Hover over any entity to see its connections
            light up while everything else dims. Click one to go to that entity&apos;s page.
          </p>
          <div className="hiw-callout">
            <strong>Connections over time:</strong> Connections can have a &ldquo;formed era&rdquo; and &ldquo;dissolved era.&rdquo;
            When you use the era filter on the Connections page, only connections that existed during that era are shown.
            So you can see how alliances and rivalries changed over time.
          </div>
        </section>

        {/* Timeline & Eras */}
        <section id="timeline" className="hiw-section">
          <div className="hiw-section-number">04</div>
          <h2>Timeline &amp; Eras</h2>
          <p>
            The timeline is your world&apos;s history — a chronological list of events grouped by era.
          </p>
          <h3>Eras</h3>
          <p>
            Eras are time periods that divide your history. Think &ldquo;The First Age,&rdquo; &ldquo;The Age of Ruin,&rdquo;
            &ldquo;The Modern Era.&rdquo; Each era has a title, a description, a color, and a date range (like &ldquo;Year 0 – Year 340&rdquo;).
            They&apos;re shown as colored segments on the <strong>era filter</strong> — a timeline bar that appears at the top
            of the Map and Connections pages.
          </p>
          <h3>Events</h3>
          <p>
            Events are things that happened. A battle, a coronation, a natural disaster. Each event has a title, date label,
            summary, description of how it changed the world, and which entities were involved (with roles like &ldquo;victor,&rdquo;
            &ldquo;founder,&rdquo; or &ldquo;casualty&rdquo;).
          </p>
          <h3>Cross-linking</h3>
          <p>
            Every event on the timeline has two action buttons:
          </p>
          <ul className="hiw-list">
            <li><strong>Show on Map</strong> — jumps to the Map page and highlights the entities involved with a gold glow, auto-panning the camera to them.</li>
            <li><strong>Show in Graph</strong> — jumps to the Graph page and highlights the involved nodes while dimming everything else.</li>
          </ul>
          <p>
            This lets you seamlessly move between views: read about a battle on the timeline, see where it happened on the map,
            then see who was involved on the graph.
          </p>
        </section>

        {/* Views */}
        <section id="views" className="hiw-section">
          <div className="hiw-section-number">05</div>
          <h2>Ways to See Your World</h2>
          <p>
            These are three different ways to <em>see</em> your world. They&apos;re all reading the same data but showing it differently.
          </p>

          <h3>Explore Mode (Playable Game)</h3>
          <p>
            Explore mode is a full 2D game inside your world. It generates procedural terrain and turns your world into
            a playable experience with multiple zones, NPCs, combat, quests, building, vendors, and economy.
            Move with <strong>WASD or arrow keys</strong>, attack with <strong>SPACE</strong>, interact with <strong>E</strong>,
            and build with <strong>B</strong>. See the <a href="#gameplay">Gameplay</a> section below for full details.
          </p>

          <h3>World Map</h3>
          <p>
            A bird&apos;s-eye view of the same terrain. You can see all entity markers at once, zoom and pan freely, and use
            the search to find specific entities. The map also supports:
          </p>
          <ul className="hiw-list">
            <li><strong>Regions</strong> — Draw named polygon regions on the map (like countries on a real map).</li>
            <li><strong>Territories</strong> — Assign which faction owns each region during each era. When you scrub through eras, you see ownership change.</li>
            <li><strong>Event highlighting</strong> — When you click &ldquo;Show on Map&rdquo; from the timeline, the involved entities get highlighted with a pulsing glow.</li>
            <li><strong>Era filter</strong> — Filter the map by era. Entities that didn&apos;t exist yet (or have been retired) disappear.</li>
          </ul>

          <h3>Connections</h3>
          <p>
            An interactive visual map showing every entity as a dot and every connection as a line.
            Dots are color-coded by entity type. Hover to highlight connections, click to navigate.
            The era filter hides entities and connections that don&apos;t exist during the selected era.
          </p>
        </section>

        {/* Gameplay */}
        <section id="gameplay" className="hiw-section">
          <div className="hiw-section-number">06</div>
          <h2>Gameplay</h2>
          <p>
            Every world you create is a playable 2D game. Explore mode isn&apos;t just a viewer &mdash; it&apos;s a full game
            with combat, NPCs, quests, vendors, economy, and progression. Here&apos;s everything that&apos;s in the game:
          </p>

          <h3>Zones</h3>
          <p>
            There are three explorable zones, each with different gameplay:
          </p>
          <ul className="hiw-list">
            <li><strong>Hub Zone</strong> &mdash; Your home base. A 140&times;105 tile map with a merchant, campfire (heals you),
              well, ruins, and 8 named townsfolk NPCs. Complete objectives here to unlock paths to other zones.</li>
            <li><strong>Grassland</strong> &mdash; A wilderness zone (80&times;60 tiles) accessed through the Northern Pass.
              Contains orc warriors, a vendor camp, shrine, 8 points of interest, and a full combat mission chain.</li>
            <li><strong>Seaside Village</strong> &mdash; A peaceful zone (40&times;30 tiles) accessed through the Docks South Gate.
              Contains 6 named NPCs with dialogue, Witch Willow&apos;s potion shop, quests, bandits, and wildlife.</li>
          </ul>

          {/* Zone scene panels */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 16 }}>
            <div className="game-scene-panel" style={{ flex: '1 1 180px', height: 90, padding: '10px 14px' }}>
              <div className="scene-terrain" />
              <img src={`${GL}/Props/Static props/Cabin/cabin.png`} alt="Cabin" className="sprite-img" style={{ height: 48 }} />
              <img src={`${GL}/Props/Static props/sheet1-sprites/waterwell - rope.png`} alt="Well" className="sprite-img" style={{ height: 28 }} />
              <img src={`${FANTASY}/paladin_01_001.png`} alt="Player" className="sprite-img" style={{ height: 32 }} />
            </div>
            <div className="game-scene-panel" style={{ flex: '1 1 180px', height: 90, padding: '10px 14px' }}>
              <div className="scene-terrain" />
              <img src={`${GL}/Props/Static props/pine-tree.png`} alt="Tree" className="sprite-img" style={{ height: 56 }} />
              <img src={`${GL}/Characters/orc warrior/orc1/orc melee - anims-idle.png`} alt="Orc" className="sprite-img" style={{ height: 36 }} />
              <img src={`${GL}/Props/Animated props/shrine-base-with grass.png`} alt="Shrine" className="sprite-img" style={{ height: 36 }} />
            </div>
            <div className="game-scene-panel" style={{ flex: '1 1 180px', height: 90, padding: '10px 14px' }}>
              <div className="scene-terrain" style={{ background: 'linear-gradient(180deg, #2898b8 0%, #3bbcd8 50%, #c8c078 100%)' }} />
              <img src={`${VIL}/assets/vegetable_stall.png`} alt="Stall" className="sprite-img" style={{ height: 36 }} />
              <img src={`${FANTASY}/priest_01_001.png`} alt="NPC" className="sprite-img" style={{ height: 32 }} />
              <img src={`${FANTASY}/elf_02_005.png`} alt="Herbalist" className="sprite-img" style={{ height: 32 }} />
            </div>
          </div>

          <h3>Combat</h3>
          <p>
            Press <strong>SPACE</strong> to attack in the direction you&apos;re facing.
            Enemies have AI behavior states: idle, chase, attack, hurt, and death.
            Damage numbers float above targets. You earn gold from kills.
          </p>
          <ul className="hiw-list">
            <li><strong>Orc Warriors</strong> &mdash; 6 warriors + 1 shaman in the grassland, 2 color variants</li>
            <li><strong>Bandits</strong> &mdash; 4 hostile enemies in the village zone</li>
            <li><strong>Shrine Buff</strong> &mdash; Clear nearby orcs, press E to activate: +50% damage, &minus;20% damage taken for 45 seconds</li>
            <li><strong>Death</strong> &mdash; You lose gold and respawn at the hub</li>
          </ul>

          {/* Combat scene */}
          <div className="game-scene-panel" style={{ maxWidth: 360, height: 100, padding: '12px 20px', marginTop: 12, marginBottom: 20 }}>
            <div className="scene-terrain" />
            <img src={`${GL}/Characters/orc warrior/orc1/orc melee - anims-idle.png`} alt="Orc Warrior" className="sprite-img" style={{ height: 48 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center', position: 'relative', zIndex: 1 }}>
              <span className="scene-damage" style={{ color: '#ff4040' }}>−12</span>
              <span className="scene-damage" style={{ color: '#60c060' }}>+25 HP</span>
            </div>
            <img src={`${FANTASY}/warrior_01_003.png`} alt="Player" className="sprite-img" style={{ height: 40 }} />
            <img src={`${GL}/Characters/orc warrior/orc2/orc melee - anims color2-idle.png`} alt="Orc 2" className="sprite-img" style={{ height: 48 }} />
          </div>

          <h3>NPCs &amp; Dialogue</h3>
          <p>
            25+ named NPCs appear across all zones with E-key interaction. Each NPC has progression-aware dialogue &mdash;
            what they say changes based on what you&apos;ve done. Press <strong>1, 2, or 3</strong> for dialogue choices.
          </p>
          <ul className="hiw-list">
            <li><strong>Hub Townsfolk:</strong> Marta (Baker), Finn (Dockhand), Lina (Shepherd), Oswald (Scholar), Ada (Innkeeper &mdash; heals you),
              Rook (Courier), Edith (Elder), Dale (Lookout)</li>
            <li><strong>Building Residents:</strong> Helena (Tavern Keeper &mdash; quest + heals), Marcus (Archivist &mdash; quest),
              Greta (Healer), Barton (Guard Captain &mdash; quest), Pip (Trader), Elara (Scholar),
              Corwin (Builder &mdash; quest), Nessa (Caretaker)</li>
            <li><strong>Village:</strong> Fiona (food shop), Gerald (general shop), Elder Rowan (lore), Marina (quest),
              Tom (area info), Nana Rose (tea heal), Witch Willow (potions + fortunes)</li>
            <li><strong>Guards:</strong> Varn and Drell at the grassland entrance</li>
          </ul>

          <h3>Quests</h3>
          <p>
            NPCs give you quests with gold and resource rewards. Quest progress persists across zone transitions and sessions.
          </p>
          <ul className="hiw-list">
            <li><strong>Grassland Mission</strong> &mdash; Visit 5 points of interest &rarr; Kill 7 orcs &rarr; Open reward chest (+75 gold)</li>
            <li><strong>Marina&apos;s Lost Necklace</strong> &mdash; Search 3 spots &rarr; Find necklace &rarr; Return (+30 gold + chest +25 gold)</li>
            <li><strong>Helena&apos;s Firewood</strong> &mdash; Gather 5 wood for the Tavern Keeper (+15 gold)</li>
            <li><strong>Marcus&apos;s Survey</strong> &mdash; Discover 5 landmarks for the Archivist (+20 gold)</li>
            <li><strong>Barton&apos;s Orc Hunt</strong> &mdash; Defeat 7 orcs for the Guard Captain (+25 gold)</li>
            <li><strong>Corwin&apos;s Building Goal</strong> &mdash; Place 10 buildings for the Builder (+10 gold, +8 wood, +5 stone)</li>
            <li><strong>Lina&apos;s Lost Sheep</strong> &mdash; Talk to Lina &rarr; Find sheep near eastern docks &rarr; Return (+20 gold)</li>
            <li><strong>Rook&apos;s Message</strong> &mdash; Talk to Rook &rarr; Deliver message to Elder Rowan in village (+25 gold)</li>
          </ul>

          <h3>Vendors &amp; Economy</h3>
          <p>
            Gold comes from combat kills, quest rewards, and loot chests. Spend it at vendors:
          </p>
          <ul className="hiw-list">
            <li><strong>Hub Merchant</strong> &mdash; General goods</li>
            <li><strong>Grassland Vendor</strong> &mdash; Health Potion (15g), Strength Tonic (25g), Iron Shield (40g)</li>
            <li><strong>Village shops</strong> &mdash; Fiona (food), Gerald (general goods)</li>
            <li><strong>Witch Willow</strong> &mdash; Barrier Hex (30g), Third Eye (20g), Vigor Brew (25g)</li>
          </ul>
          <p>
            Health potions auto-heal on purchase. Buff items have duration effects.
          </p>

          <h3 id="characters">Character Customization</h3>
          <p>
            Press <strong>C</strong> to open the character picker. Choose from 28 playable characters across two categories:
          </p>
          <ul className="hiw-list">
            <li><strong>Townsfolk</strong> &mdash; 19 animated characters with walk cycles (farmer, merchant, knight, mage, and more)</li>
            <li><strong>Fantasy Heroes</strong> &mdash; 9 detailed characters (Paladin, Priest, Dwarf, Elf Scout, Skeleton, Swordswoman, Fire Witch, Herbalist, and more)</li>
          </ul>
          <p>
            Each character can be recolored with a <strong>hue-shift slider</strong> or preset color swatches &mdash;
            giving you hundreds of visual combinations. You can also set a custom display name (up to 20 characters)
            that appears above your character in the world.
          </p>

          {/* Fantasy hero parade */}
          <div className="sprite-parade" style={{ marginTop: 12, marginBottom: 20 }}>
            {HIW_SPRITES.map(c => (
              <img key={c.alt} src={c.src} alt={c.alt} />
            ))}
          </div>

          <h3>Wildlife &amp; Ambient</h3>
          <p>
            Passive animals wander the world: sheep in the hub and grassland, wildlife in the village.
            Birds, butterflies, frogs, ducks, and nature particles add atmosphere.
            Campfire smoke, chimney smoke, animated lamps, and fireflies bring the world to life.
          </p>
        </section>

        {/* Building */}
        <section id="building" className="hiw-section">
          <div className="hiw-section-number">07</div>
          <h2>Building System</h2>
          <p>
            World owners can place structures in their world. Press <strong>B</strong> to open the build menu.
          </p>

          <h3>How it works</h3>
          <ol className="hiw-list hiw-list-numbered">
            <li>Press <strong>B</strong> to open the build menu.</li>
            <li>Choose a category: <strong>Structures</strong>, <strong>Props</strong>, or <strong>Decoration</strong>.</li>
            <li>Select an item. A placement gizmo follows your cursor.</li>
            <li>Press <strong>R</strong> to rotate (0&deg; / 90&deg; / 180&deg; / 270&deg;).</li>
            <li>Click to place. The item costs materials (wood, stone, or gold).</li>
          </ol>

          <h3>Materials</h3>
          <ul className="hiw-list">
            <li><strong>Wood</strong> &mdash; Start with 30. Used for huts, fences, market stalls.</li>
            <li><strong>Stone</strong> &mdash; Start with 15. Used for walls, towers, wells.</li>
            <li><strong>Gold</strong> &mdash; Earned in-game. Used for premium items.</li>
          </ul>

          <h3>Rules</h3>
          <ul className="hiw-list">
            <li>Can only place on walkable tiles</li>
            <li>No overlapping with existing objects</li>
            <li>Cannot place near zone gates</li>
            <li>Placed objects block movement (rotation-aware footprint)</li>
            <li>All placements are saved to the database and loaded when you enter the world</li>
          </ul>

          <h3>Building Residents</h3>
          <p>
            Buildings you place attract named NPC residents who move in and become part of the world.
            Each resident has a unique role, dialogue that reacts to your progress, and some offer quests:
          </p>
          <ul className="hiw-list">
            <li><strong>Helena</strong> (Tavern Keeper) &mdash; Heals you and offers a firewood gathering quest</li>
            <li><strong>Marcus</strong> (Archivist) &mdash; Tracks your discoveries and offers a survey quest</li>
            <li><strong>Greta</strong> (Healer) &mdash; Heals you when hurt</li>
            <li><strong>Barton</strong> (Guard Captain) &mdash; Offers an orc hunting quest</li>
            <li><strong>Pip</strong> (Trader) &mdash; Comments on the economy and your progress</li>
            <li><strong>Elara</strong> (Scholar) &mdash; Shares lore and research about your world</li>
            <li><strong>Corwin</strong> (Builder) &mdash; Offers a building milestone quest</li>
            <li><strong>Nessa</strong> (Caretaker) &mdash; Watches over the settlement</li>
          </ul>

          {/* Structure sprite row */}
          <div className="structure-row" style={{ marginTop: 12 }}>
            <img src={`${GL}/Props/Static props/Cabin/cabin.png`} alt="Cabin" />
            <img src={`${GL}/Props/Static props/sheet2-sprites/watchtower - front.png`} alt="Tower" />
            <img src={`${GL}/Props/Static props/sheet2-sprites/tent 1.png`} alt="Tent" />
            <img src={`${GL}/Props/Static props/sheet2-sprites/stronghold - horizontal - on grass.png`} alt="Wall" />
            <img src={`${GL}/Props/Static props/sheet1-sprites/barrel 1.png`} alt="Barrel" />
            <img src={`${GL}/Props/Static props/sheet1-sprites/fence - left - right - 1.png`} alt="Fence" />
          </div>

          <div className="hiw-callout">
            <strong>22 buildable items</strong> across 3 categories. Only the world owner can build &mdash;
            visitors can see placed objects but can&apos;t modify them. Building milestones at 5, 10, 20, and 30
            structures trigger celebration banners.
          </div>
        </section>

        {/* Away Mode */}
        <section id="away-mode" className="hiw-section">
          <div className="hiw-section-number">08</div>
          <h2>AI Storytelling</h2>
          <p>
            This is where your world starts to feel <em>alive</em>. AI Storytelling lets the AI write what happens to one of your characters —
            generating stories as if the character is living their life while you&apos;re away.
          </p>

          <h3>How to enable it</h3>
          <ol className="hiw-list hiw-list-numbered">
            <li>Go to any <strong>Character</strong> entity&apos;s page (it must be a Character type — not locations, factions, etc.).</li>
            <li>Scroll down to the sidebar — you&apos;ll see <strong>&ldquo;AI Storytelling&rdquo;</strong> in the sidebar.</li>
            <li>Click <strong>&ldquo;Start AI Storytelling.&rdquo;</strong></li>
            <li>Write a <strong>personality prompt</strong> — describe how the AI should play this character. For example:
              <em>&ldquo;Cautious and intellectual. Driven by duty but privately doubts the Council&apos;s decisions. Prefers diplomacy over force.&rdquo;</em></li>
            <li>Write <strong>constraints</strong> — what the AI should NEVER do. For example:
              <em>&ldquo;Never kill other characters. Don&apos;t leave the city. Don&apos;t reveal the secret of the Codex.&rdquo;</em></li>
            <li>Click <strong>&ldquo;Start.&rdquo;</strong></li>
          </ol>

          <h3>What happens next</h3>
          <p>
            Once a session is active, click <strong>&ldquo;Write Next Story&rdquo;</strong> to have the AI generate a story —
            a short narrative about what the character did. The AI reads the character&apos;s full context: their backstory,
            personality, relationships, history, other characters in the world, locations, and your constraints. Then it writes
            something appropriate — a journal entry, an encounter, a discovery, a conversation.
          </p>

          <h3>Session controls</h3>
          <ul className="hiw-list">
            <li><strong>Write Next Story</strong> — generates one story immediately.</li>
            <li><strong>Pause</strong> — temporarily stops the session. You can resume anytime.</li>
            <li><strong>Stop AI Storytelling</strong> — permanently ends it. You can start a new one later.</li>
          </ul>

          <div className="hiw-callout">
            <strong>Important:</strong> Nothing the AI generates is automatically official. Every story goes to a review queue
            where you decide what becomes part of your world. You stay in full control.
          </div>
        </section>

        {/* Developments */}
        <section id="developments" className="hiw-section">
          <div className="hiw-section-number">09</div>
          <h2>Story Review</h2>
          <p>
            The <strong>Story Queue</strong> page is where AI-generated stories land —
            each with a &ldquo;Pending&rdquo; status, waiting for you to decide what happens.
          </p>

          <h3>What&apos;s in a story?</h3>
          <p>
            Each story has a <strong>type</strong> (Journal, Encounter, Travel, Conversation, Discovery, Rumor,
            Relationship Shift, or Minor Event), a <strong>title</strong>, the full <strong>narrative text</strong>,
            and optionally <strong>proposed changes</strong> — things the AI suggests should become official, like:
          </p>
          <ul className="hiw-list">
            <li><strong>New connections</strong> — &ldquo;Kael now mistrusts The Tide Council&rdquo;</li>
            <li><strong>New facts</strong> — &ldquo;Carries a smuggler&apos;s map of the Rust Shallows&rdquo;</li>
            <li><strong>New tags</strong> — &ldquo;explorer,&rdquo; &ldquo;outcast&rdquo;</li>
          </ul>

          <h3>Your options</h3>
          <ul className="hiw-list">
            <li><strong>Approve</strong> — accepts the story. Any proposed changes (new connections, facts, tags) get applied to the actual entity data.</li>
            <li><strong>Approve with Note</strong> — lets you add a note about what you changed, then approves it.</li>
            <li><strong>Reject</strong> — discards the story. Nothing changes in your world.</li>
          </ul>

          <div className="hiw-callout">
            The Overview page shows a badge when there are pending stories, so you always know when something needs your attention.
          </div>
        </section>

        {/* Sharing */}
        <section id="sharing" className="hiw-section">
          <div className="hiw-section-number">10</div>
          <h2>Sharing &amp; Visibility</h2>
          <p>
            Every world starts as <strong>Private</strong> — only you can see it. When you&apos;re ready to share:
          </p>
          <ol className="hiw-list hiw-list-numbered">
            <li>Go to <strong>Settings</strong> in your world.</li>
            <li>Change visibility to <strong>Public</strong>.</li>
            <li>Your world appears on the <strong>Discover</strong> page for anyone to browse.</li>
          </ol>
          <p>
            Public worlds are fully explorable — visitors can view all entities, explore the map, browse the graph, read the timeline,
            and walk through explore mode. They just can&apos;t edit anything.
          </p>
        </section>

      </div>

      {/* ─── CTA ─── */}
      <section className="hiw-cta">
        <h2>Ready to play?</h2>
        <p>Create a world in 30 seconds with AI, then walk in and play. Or start from scratch.</p>
        <div className="hiw-cta-buttons">
          <Link href="/register" className="btn btn-primary btn-lg">Create Free Account</Link>
          <Link href="/discover" className="btn btn-secondary btn-lg">Browse Worlds First</Link>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="landing-footer">
        <div className="container">
          <div className="ornament" style={{ marginBottom: 24 }}>Worldforge</div>
          <p>An AI worldbuilding game.</p>
        </div>
      </footer>
    </div>
  );
}
