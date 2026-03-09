import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Navbar } from '@/components/Navbar';

export default async function LandingPage() {
  const worlds = await prisma.world.findMany({
    where: { visibility: 'PUBLIC' },
    include: {
      owner: { select: { id: true, name: true, username: true, avatar: true } },
      _count: { select: { entities: true, events: true, members: true } },
    },
    orderBy: { updatedAt: 'desc' },
    take: 3,
  });

  return (
    <div className="landing">
      <Navbar />

      {/* ═══════════════════════════════════════════════════════
          HERO — "Your World. Alive."
          HUD strip below proves this is a real game immediately
          ═══════════════════════════════════════════════════════ */}
      <section className="hero-v2">
        <div className="hero-bg" />
        <div className="hero-v2-glow" />

        <div className="hero-v2-content">
          <div className="hero-v2-badge">
            <span className="hero-v2-badge-dot" />
            AI-Generated Worlds You Can Play
          </div>

          <h1 className="hero-v2-title">
            Your World.<br /><em>Alive.</em>
          </h1>

          <p className="hero-v2-body">
            Describe a world in a sentence. AI builds it in 30 seconds &mdash;
            characters, factions, history, map, everything. Then you walk in.
            Fight enemies. Talk to NPCs. Complete quests. Build structures.
            Grow your world from a concept into a place.
          </p>

          <div className="hero-v2-cta">
            <div className="hero-cta-option">
              <Link href="/register" className="btn btn-primary btn-lg">
                Generate Your World
              </Link>
              <p className="hero-cta-desc">Create an account, build your own world, and get a full dashboard to manage everything.</p>
            </div>
            <div className="hero-cta-option">
              <Link href="/play/everhold" className="btn btn-secondary btn-lg">
                Enter Demo World
              </Link>
              <p className="hero-cta-desc">Jump straight in and explore a pre-built world. No account needed.</p>
            </div>
          </div>
        </div>

        {/* Game HUD mockup — immediately proves this is a game */}
        <div className="hero-hud-strip">
          <div className="mock-hud">
            <div className="mock-hud-hp">
              <span className="mock-hud-hp-icon">HP</span>
              <div className="mock-hud-hp-bar">
                <div className="mock-hud-hp-fill" style={{ width: '72%' }} />
              </div>
              <span className="mock-hud-hp-text">72/100</span>
            </div>
            <div className="mock-hud-gold">
              <span className="mock-hud-gold-icon" />
              145
            </div>
            <div className="mock-hud-mats">
              <span className="mock-hud-mat">
                <span className="mock-hud-mat-icon" style={{ background: '#8B6914' }} />
                <span style={{ color: '#8B6914' }}>24</span>
              </span>
              <span className="mock-hud-mat">
                <span className="mock-hud-mat-icon" style={{ background: '#808080' }} />
                <span style={{ color: '#808080' }}>12</span>
              </span>
            </div>
            <span className="mock-hud-zone">Grassland Zone</span>
          </div>
        </div>

        <div className="hero-v2-stats">
          <span className="hero-v2-stat"><strong>3</strong> explorable zones</span>
          <span className="hero-v2-stat-sep" />
          <span className="hero-v2-stat"><strong>22</strong> buildable structures</span>
          <span className="hero-v2-stat-sep" />
          <span className="hero-v2-stat"><strong>8+</strong> named NPCs with dialogue</span>
          <span className="hero-v2-stat-sep" />
          <span className="hero-v2-stat">AI-generated lore</span>
        </div>

        <div className="scroll-indicator">
          <span>Scroll to explore</span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M4 9l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          STATEMENT — One powerful sentence
          ═══════════════════════════════════════════════════════ */}
      <div className="zone-divider" />
      <section className="statement-section">
        <p className="statement-text">
          Every world you create becomes a <span className="gold">playable 2D game</span> with
          combat, NPCs, quests, building, vendors, wildlife, and
          progression &mdash; backed by a full AI-generated lore layer
          you can explore, edit, and grow.
        </p>
      </section>
      <div className="zone-divider" />

      {/* ═══════════════════════════════════════════════════════
          THE JOURNEY — Narrative walkthrough: Describe → Generate → Enter → Play
          Alternating panels, each visually unique
          ═══════════════════════════════════════════════════════ */}
      <section className="journey-section tile-bg">

        {/* Step 1: Describe */}
        <div className="journey-step">
          <div className="journey-text">
            <div className="journey-number">Step 01</div>
            <h2 className="journey-title">Describe a world in your own words</h2>
            <p className="journey-desc">
              Type a concept &mdash; anything from &ldquo;a dying world where the last city
              floats above an ocean of ash&rdquo; to &ldquo;cozy mushroom kingdom with
              sentient fungi.&rdquo; Or skip AI entirely and build everything by hand.
            </p>
            <p className="journey-detail">
              AI generation is optional. You can create an empty world and manually add
              every character, location, faction, artifact, species, and event yourself.
            </p>
          </div>
          <div className="journey-visual">
            <div className="ai-gen-terminal">
              <div className="ai-gen-terminal-bar">
                <span className="ai-gen-terminal-dot" />
                <span className="ai-gen-terminal-dot" />
                <span className="ai-gen-terminal-dot" />
                <span className="ai-gen-terminal-title">worldforge generate</span>
              </div>
              <div className="ai-gen-terminal-body">
                <div className="ai-gen-line" style={{ animationDelay: '0.2s' }}>
                  <span className="ai-gen-line-prompt">&gt;</span>
                  <span className="ai-gen-line-input">
                    &ldquo;A dying world where the last city floats above ash&rdquo;
                  </span>
                </div>
                <div className="ai-gen-line ai-gen-line-processing" style={{ animationDelay: '0.6s' }}>
                  generating...
                </div>
                <div className="ai-gen-divider" />
                <div className="ai-gen-line ai-gen-line-output" style={{ animationDelay: '1s' }}>
                  <span className="ai-gen-line-key">world</span>
                  Ashenveil: The Last Refrain
                </div>
                <div className="ai-gen-line ai-gen-line-output" style={{ animationDelay: '1.4s' }}>
                  <span className="ai-gen-line-key">entities</span>
                  <span className="ai-gen-tag" data-type="character">Kael Ashborn</span>
                  <span className="ai-gen-tag" data-type="location">Hovering Choir</span>
                  <span className="ai-gen-tag" data-type="faction">Songkeepers</span>
                  <span className="ai-gen-tag" data-type="artifact">First Note</span>
                  <span className="ai-gen-tag" data-type="species">Cinderwraiths</span>
                </div>
                <div className="ai-gen-line ai-gen-line-output" style={{ animationDelay: '1.8s' }}>
                  <span className="ai-gen-line-key">timeline</span> 5 events, 3 eras
                </div>
                <div className="ai-gen-line ai-gen-line-output" style={{ animationDelay: '2.2s' }}>
                  <span className="ai-gen-line-key">relations</span> 7 connections
                </div>
                <div className="ai-gen-divider" />
                <div className="ai-gen-line ai-gen-line-success" style={{ animationDelay: '2.6s' }}>
                  World ready. Opening Ashenveil...
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Enter */}
        <div className="journey-step reverse">
          <div className="journey-text">
            <div className="journey-number">Step 02</div>
            <h2 className="journey-title">Walk into your world</h2>
            <p className="journey-desc">
              Your world isn&apos;t a document &mdash; it&apos;s a place. Enter the hub zone
              and start exploring. The terrain is procedurally generated. NPCs wander
              the streets. A merchant sells gear. A campfire heals you. Portals lead
              to other zones.
            </p>
            <p className="journey-detail">
              3 zones: Hub (your home base), Grassland (wilderness with orcs), and
              Seaside Village (NPCs, quests, shops). More zones coming.
            </p>
          </div>
          <div className="journey-visual">
            <div className="mock-hud" style={{ transform: 'scale(0.95)' }}>
              <div className="mock-hud-hp">
                <span className="mock-hud-hp-icon">HP</span>
                <div className="mock-hud-hp-bar">
                  <div className="mock-hud-hp-fill" style={{ width: '100%' }} />
                </div>
                <span className="mock-hud-hp-text">100/100</span>
              </div>
              <div className="mock-hud-gold">
                <span className="mock-hud-gold-icon" /> 0
              </div>
              <span className="mock-hud-zone">Hub Zone</span>
            </div>
          </div>
        </div>

        {/* Step 3: Play */}
        <div className="journey-step">
          <div className="journey-text">
            <div className="journey-number">Step 03</div>
            <h2 className="journey-title">Fight, trade, talk, quest</h2>
            <p className="journey-desc">
              This is a real game. Orc warriors patrol the grassland. Bandits ambush
              you in the village. Named NPCs give you quests with gold rewards. Vendors
              sell health potions, strength tonics, and shields. Shrines buff your stats.
              Everything tracks progress.
            </p>
            <p className="journey-detail">
              SPACE to attack. E to interact. 1/2/3 for dialogue choices.
              Damage numbers float. Enemies have AI states: idle, chase, attack, hurt, death.
            </p>
          </div>
          <div className="journey-visual">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
              {/* NPC dialogue mockup */}
              <div className="mock-dialogue">
                <div className="mock-dialogue-name">Ada &mdash; Innkeeper</div>
                <div className="mock-dialogue-text">
                  You look like you&apos;ve been through a fight. Let me fix you
                  up &mdash; on the house this time.
                </div>
                <div className="mock-dialogue-choices">
                  <div className="mock-choice">
                    <span className="mock-choice-key">1</span> Thank you, Ada.
                  </div>
                  <div className="mock-choice">
                    <span className="mock-choice-key">2</span> Any news from the village?
                  </div>
                  <div className="mock-choice">
                    <span className="mock-choice-key">3</span> I&apos;m fine. Just passing through.
                  </div>
                </div>
              </div>
              {/* Quest tracker mockup */}
              <div className="mock-quest">
                <div className="mock-quest-header">Active Quest</div>
                <div className="mock-quest-title">Lina&apos;s Lost Sheep</div>
                <div className="mock-quest-obj done">
                  <span className="mock-quest-marker">&#10003;</span>
                  Talk to Lina the Shepherd
                </div>
                <div className="mock-quest-obj active">
                  <span className="mock-quest-marker" />
                  Find the sheep near the eastern docks
                </div>
                <div className="mock-quest-obj active">
                  <span className="mock-quest-marker" />
                  Return to Lina
                </div>
                <div className="mock-quest-reward">Reward: +20 Gold</div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 4: Build & Grow */}
        <div className="journey-step reverse">
          <div className="journey-text">
            <div className="journey-number">Step 04</div>
            <h2 className="journey-title">Build structures. Grow your world.</h2>
            <p className="journey-desc">
              Press B to open the build menu. Place wooden huts, stone walls, market
              stalls, watchtowers, fences, torches, and more. Rotate with R. Everything
              costs wood, stone, or gold. Your placements persist &mdash; the world
              grows as you play.
            </p>
            <p className="journey-detail">
              22 items across structures, props, and decoration.
              Placed objects become collision — NPCs and enemies path around them.
              Only the world owner can build.
            </p>
          </div>
          <div className="journey-visual">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
              {/* Build menu mockup */}
              <div className="mock-build">
                <div className="mock-build-tabs">
                  <span className="mock-build-tab active">Structures</span>
                  <span className="mock-build-tab">Props</span>
                  <span className="mock-build-tab">Decor</span>
                </div>
                <div className="mock-build-grid">
                  {['Hut', 'Wall', 'Tower', 'Gate', 'Stall', 'Forge', 'Well', 'Fence'].map(name => (
                    <div key={name} className="mock-build-cell">
                      <div className="mock-build-cell-icon" />
                      <span className="mock-build-cell-label">{name}</span>
                    </div>
                  ))}
                </div>
                <div className="mock-build-cost">
                  <span>Wooden Hut</span>
                  <span style={{ color: '#8B6914' }}>8 Wood, 2 Stone</span>
                </div>
              </div>
              {/* Shop mockup */}
              <div className="mock-shop">
                <div className="mock-shop-title">Grassland Vendor</div>
                <div className="mock-shop-list">
                  <div className="mock-shop-row">
                    <span className="mock-shop-row-name">Health Potion</span>
                    <span className="mock-shop-row-price">15g</span>
                  </div>
                  <div className="mock-shop-row">
                    <span className="mock-shop-row-name">Strength Tonic</span>
                    <span className="mock-shop-row-price">25g</span>
                  </div>
                  <div className="mock-shop-row">
                    <span className="mock-shop-row-name">Iron Shield</span>
                    <span className="mock-shop-row-price">40g</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="zone-divider" />

      {/* ═══════════════════════════════════════════════════════
          GAME SYSTEMS — Editorial spreads proving each system is real
          Each system has a game-UI mockup as its visual
          ═══════════════════════════════════════════════════════ */}
      <section className="systems-section">
        <div className="systems-header">
          <h2>Everything a world needs.</h2>
          <p>
            Each of these systems is built and working. Not a roadmap.
            Not coming soon. This is what you get when you create a world today.
          </p>
        </div>

        {/* Combat */}
        <div className="system-spread">
          <div className="system-text">
            <div className="system-label" style={{ color: '#e06060' }}>Combat</div>
            <h3>Real-time combat with AI enemies</h3>
            <p>
              Orc warriors in the grassland. Bandits in the village. Each enemy has
              full AI behavior &mdash; they idle, detect you, chase, attack, take damage,
              and die with animated states. Damage numbers float. You can dodge, kite,
              and time your attacks.
            </p>
            <ul>
              <li>SPACE to attack, directional facing</li>
              <li>Damage numbers with knockback</li>
              <li>Enemy AI: idle → chase → attack → hurt → death</li>
              <li>Orc warriors (2 color variants) + bandit enemies</li>
              <li>Shrine buffs: +50% damage, −20% damage taken</li>
            </ul>
          </div>
          <div className="system-visual">
            <div className="system-visual-stack">
              <div className="mock-hud" style={{ transform: 'scale(0.85)' }}>
                <div className="mock-hud-hp">
                  <span className="mock-hud-hp-icon">HP</span>
                  <div className="mock-hud-hp-bar">
                    <div className="mock-hud-hp-fill" style={{ width: '45%' }} />
                  </div>
                  <span className="mock-hud-hp-text">45/100</span>
                </div>
                <div className="mock-hud-gold"><span className="mock-hud-gold-icon" /> 85</div>
              </div>
              <div className="mock-dialogue" style={{ maxWidth: 280 }}>
                <div className="mock-dialogue-name" style={{ color: '#e06060', borderColor: 'rgba(224,96,96,0.15)' }}>
                  Orc Warrior
                </div>
                <div className="mock-dialogue-text" style={{ fontSize: '0.78rem', padding: '10px 14px' }}>
                  <span style={{ color: '#e06060', fontWeight: 700 }}>−12</span>
                  <span style={{ color: 'var(--text-dim)', margin: '0 6px' }}>|</span>
                  <span style={{ color: '#e06060', fontWeight: 700 }}>−8</span>
                  <span style={{ color: 'var(--text-dim)', margin: '0 6px' }}>|</span>
                  <span style={{ color: '#60c060', fontWeight: 700 }}>+25 HP</span>
                  <span style={{ color: 'var(--text-dim)', margin: '0 6px' }}>|</span>
                  <span style={{ color: 'var(--gold)', fontWeight: 700 }}>+10g</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* NPCs & Dialogue */}
        <div className="system-spread reverse">
          <div className="system-text">
            <div className="system-label" style={{ color: 'var(--gold)' }}>NPCs</div>
            <h3>Named characters with progression-aware dialogue</h3>
            <p>
              Every NPC has a name, a role, and dialogue that changes based on your
              progress. Ada the Innkeeper heals you when you&apos;re hurt. Dale the
              Lookout gives orc intel. Edith the Elder guides your next move.
              Quest-givers remember what you&apos;ve done.
            </p>
            <ul>
              <li>8 named hub NPCs + 6 village NPCs + guards</li>
              <li>Dialogue choices with 1/2/3 keys</li>
              <li>Progress-aware: dialogue changes as you advance</li>
              <li>Vendors with zone-specific inventories</li>
              <li>Witch Willow sells potions in the village</li>
            </ul>
          </div>
          <div className="system-visual">
            <div className="mock-dialogue">
              <div className="mock-dialogue-name">Marta &mdash; Baker</div>
              <div className="mock-dialogue-text">
                The grassland orcs have been quiet since you cleared
                them out. The village folk are talking about it &mdash;
                you&apos;ve made quite a name for yourself.
              </div>
              <div className="mock-dialogue-choices">
                <div className="mock-choice">
                  <span className="mock-choice-key">1</span> What can you tell me about the village?
                </div>
                <div className="mock-choice">
                  <span className="mock-choice-key">2</span> Do you have anything for sale?
                </div>
                <div className="mock-choice">
                  <span className="mock-choice-key">3</span> Just browsing. Thanks, Marta.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Building */}
        <div className="system-spread">
          <div className="system-text">
            <div className="system-label" style={{ color: '#36B37E' }}>Building</div>
            <h3>Place, rotate, and persist structures</h3>
            <p>
              Press B to open the build menu. 22 items across structures, props,
              and decoration. Each costs wood, stone, or gold. Place anywhere on
              walkable terrain. Rotate with R. Objects block movement and persist
              across sessions.
            </p>
            <ul>
              <li>3 material types: Wood (30), Stone (15), Gold</li>
              <li>Rotation: 0° / 90° / 180° / 270°</li>
              <li>Collision-aware placement validation</li>
              <li>Saved to database, loaded on enter</li>
              <li>Y-sorted rendering with canvas rotation</li>
            </ul>
          </div>
          <div className="system-visual">
            <div className="mock-build">
              <div className="mock-build-tabs">
                <span className="mock-build-tab active">Structures</span>
                <span className="mock-build-tab">Props</span>
                <span className="mock-build-tab">Decor</span>
              </div>
              <div className="mock-build-grid">
                {['Hut', 'Wall', 'Tower', 'Gate', 'Stall', 'Forge', 'Well', 'Fence'].map(n => (
                  <div key={n} className="mock-build-cell">
                    <div className="mock-build-cell-icon" />
                    <span className="mock-build-cell-label">{n}</span>
                  </div>
                ))}
              </div>
              <div className="mock-build-cost">
                <span>Stone Wall</span>
                <span style={{ color: '#808080' }}>4 Stone</span>
              </div>
            </div>
          </div>
        </div>

        {/* Economy & Quests */}
        <div className="system-spread reverse">
          <div className="system-text">
            <div className="system-label" style={{ color: 'var(--gold)' }}>Economy &amp; Quests</div>
            <h3>Gold, shops, and missions that chain across zones</h3>
            <p>
              Kill enemies for gold. Complete quests for gold. Buy gear from vendors.
              The grassland has a full mission chain: visit 5 points of interest,
              kill 7 orcs, unlock a chest for +75 gold. The village has Marina&apos;s
              Lost Necklace quest and a witch selling potions.
            </p>
            <ul>
              <li>Gold persists across zones and sessions</li>
              <li>Vendor shops in every zone</li>
              <li>Multi-step quest chains with progression tracking</li>
              <li>Hub objectives guide you to the next zone</li>
              <li>Death penalty: lose gold, respawn at hub</li>
            </ul>
          </div>
          <div className="system-visual">
            <div className="system-visual-stack">
              <div className="mock-quest">
                <div className="mock-quest-header">Grassland Mission</div>
                <div className="mock-quest-title">Clear the Grassland</div>
                <div className="mock-quest-obj done">
                  <span className="mock-quest-marker">&#10003;</span>
                  Visit 5 points of interest
                </div>
                <div className="mock-quest-obj done">
                  <span className="mock-quest-marker">&#10003;</span>
                  Defeat 7 orc warriors
                </div>
                <div className="mock-quest-obj active">
                  <span className="mock-quest-marker" />
                  Open the reward chest
                </div>
                <div className="mock-quest-reward">Reward: +75 Gold</div>
              </div>
              <div className="mock-shop">
                <div className="mock-shop-title">Village &mdash; Witch Willow</div>
                <div className="mock-shop-list">
                  <div className="mock-shop-row">
                    <span className="mock-shop-row-name">Barrier Hex</span>
                    <span className="mock-shop-row-price">30g</span>
                  </div>
                  <div className="mock-shop-row">
                    <span className="mock-shop-row-name">Third Eye</span>
                    <span className="mock-shop-row-price">20g</span>
                  </div>
                  <div className="mock-shop-row">
                    <span className="mock-shop-row-name">Vigor Brew</span>
                    <span className="mock-shop-row-price">25g</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="zone-divider" />

      {/* ═══════════════════════════════════════════════════════
          LORE LAYER — The worldbuilding tools under the game
          Bento layout, not uniform cards
          ═══════════════════════════════════════════════════════ */}
      <section className="lore-section">
        <div className="container">
          <div className="lore-header">
            <h2>Deep worldbuilding under every game.</h2>
            <p>
              Every world has a full lore layer &mdash; entity library, timeline,
              connections graph, world map, and AI storytelling. The game and the
              lore are the same world.
            </p>
          </div>

          <div className="lore-bento">
            <div className="lore-bento-card wide">
              <h3>
                <span className="lore-bento-dot" style={{ background: 'var(--color-character)' }} />
                Entity Library
              </h3>
              <p>
                Six entity types &mdash; characters, locations, factions, artifacts,
                species, events. Each gets a full page with lore, custom facts,
                tags, and connections to other entities.
              </p>
              <div className="lore-bento-entity-row">
                <span className="lore-bento-entity-pill" style={{ color: 'var(--color-character)', borderColor: 'rgba(200,164,78,0.3)' }}>Characters</span>
                <span className="lore-bento-entity-pill" style={{ color: 'var(--color-location)', borderColor: 'rgba(74,154,110,0.3)' }}>Locations</span>
                <span className="lore-bento-entity-pill" style={{ color: 'var(--color-faction)', borderColor: 'rgba(154,74,110,0.3)' }}>Factions</span>
                <span className="lore-bento-entity-pill" style={{ color: 'var(--color-artifact)', borderColor: 'rgba(74,110,154,0.3)' }}>Artifacts</span>
                <span className="lore-bento-entity-pill" style={{ color: 'var(--color-species)', borderColor: 'rgba(138,74,154,0.3)' }}>Species</span>
                <span className="lore-bento-entity-pill" style={{ color: 'var(--color-event)', borderColor: 'rgba(154,122,74,0.3)' }}>Events</span>
              </div>
            </div>

            <div className="lore-bento-card">
              <h3>
                <span className="lore-bento-dot" style={{ background: 'var(--color-event)' }} />
                Timeline
              </h3>
              <p>
                Chronological history divided into named eras. Every war,
                coronation, and cataclysm &mdash; with dates and impact descriptions.
              </p>
            </div>

            <div className="lore-bento-card">
              <h3>
                <span className="lore-bento-dot" style={{ background: 'var(--color-faction)' }} />
                Connections
              </h3>
              <p>
                Interactive graph showing every relationship. Alliances, rivalries,
                bloodlines &mdash; hover to highlight, click to navigate.
              </p>
            </div>

            <div className="lore-bento-card">
              <h3>
                <span className="lore-bento-dot" style={{ background: 'var(--color-location)' }} />
                World Map
              </h3>
              <p>
                Bird&apos;s-eye view with entity pins. Draw regions, assign faction
                territories, and watch borders shift across eras.
              </p>
            </div>

            <div className="lore-bento-card wide">
              <h3>
                <span className="lore-bento-dot" style={{ background: 'var(--color-species)' }} />
                AI Storytelling
              </h3>
              <p>
                Give any character a personality prompt and let AI write what
                happens to them &mdash; journal entries, encounters, discoveries.
                Every story goes to a review queue. You approve, edit, or reject.
                Nothing changes in your world without your say.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          HOW TO PLAY — Quick controls reference
          ═══════════════════════════════════════════════════════ */}
      <section className="htp-section tile-bg">
        <div className="container">
          <div className="htp-header">
            <h2>How to Play</h2>
            <p>Everything you need to know to start playing.</p>
          </div>

          <div className="htp-grid">
            <div className="htp-card">
              <div className="htp-key">WASD</div>
              <h4>Move</h4>
              <p>Walk around the world. Arrow keys also work.</p>
            </div>
            <div className="htp-card">
              <div className="htp-key">SPACE</div>
              <h4>Attack</h4>
              <p>Strike enemies in the direction you&apos;re facing.</p>
            </div>
            <div className="htp-card">
              <div className="htp-key">E</div>
              <h4>Interact</h4>
              <p>Talk to NPCs, inspect landmarks, activate shrines.</p>
            </div>
            <div className="htp-card">
              <div className="htp-key">B</div>
              <h4>Build</h4>
              <p>Open the build menu. R to rotate. Click to place.</p>
            </div>
          </div>

          <div className="htp-zones">
            <div className="htp-zone" style={{ borderColor: 'rgba(200,164,78,0.2)', background: 'rgba(200,164,78,0.03)' }}>
              <h4>Hub Zone</h4>
              <p>
                Your home base. Merchant, campfire, well, townsfolk.
                Complete objectives here to unlock other zones.
              </p>
            </div>
            <div className="htp-zone" style={{ borderColor: 'rgba(74,154,110,0.2)', background: 'rgba(74,154,110,0.03)' }}>
              <h4>Grassland</h4>
              <p>
                Wilderness zone. Orc warriors, shrine, vendor camp,
                8 points of interest. Full combat mission chain.
              </p>
            </div>
            <div className="htp-zone" style={{ borderColor: 'rgba(74,110,154,0.2)', background: 'rgba(74,110,154,0.03)' }}>
              <h4>Seaside Village</h4>
              <p>
                Peaceful zone. 6 named NPCs, Witch Willow, quests,
                bandits, wildlife. Find Marina&apos;s lost necklace.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          COMMUNITY — Real worlds from the database
          ═══════════════════════════════════════════════════════ */}
      <section className="community-section">
        <div className="container">
          <div className="community-header">
            <h2>Worlds built by players.</h2>
            <p>
              Browse public worlds on Discover. Walk through someone
              else&apos;s creation. No account needed.
            </p>
          </div>

          {worlds.length > 0 ? (
            <div className="community-grid">
              {worlds.map((world) => (
                <div key={world.id} className="discover-card">
                  <div className="world-card-bg" style={{ background: world.coverGradient }} />
                  <div className="world-card-overlay" />
                  <div className="discover-card-content">
                    <div className="discover-card-top">
                      <h3>{world.title}</h3>
                      <p className="discover-card-tagline">{world.tagline}</p>
                    </div>
                    <div className="discover-card-meta">
                      <div className="discover-card-author">
                        <div className="discover-card-avatar">
                          {world.owner?.name?.charAt(0)?.toUpperCase() ?? '?'}
                        </div>
                        <span>{world.owner?.name ?? 'Anonymous Creator'}</span>
                      </div>
                      <div className="discover-card-stats">
                        <span><strong>{world._count.entities}</strong> entities</span>
                        <span><strong>{world._count.events}</strong> events</span>
                      </div>
                    </div>
                    <div className="discover-card-actions">
                      <Link href={`/play/${world.slug}`} className="btn btn-primary btn-sm">
                        Enter World
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
              <p>No public worlds yet. Be the first to share yours.</p>
            </div>
          )}

          <div className="community-browse">
            <Link href="/discover">Browse all worlds &rarr;</Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FINAL CTA
          ═══════════════════════════════════════════════════════ */}
      <section className="final-cta">
        <div className="final-cta-glow" />
        <div className="final-cta-shimmer" />
        <div className="container">
          <h2 className="final-cta-title">Your world is waiting.</h2>
          <p className="final-cta-body">
            Describe a concept. AI builds it in 30 seconds.
            Then walk in, fight, build, and grow it into something real.
            Free. No limits. No credit card.
          </p>
          <div className="final-cta-buttons">
            <Link href="/register" className="btn btn-primary btn-lg">
              Create Free Account
            </Link>
            <Link href="/discover" className="btn btn-secondary btn-lg">
              Browse Worlds First
            </Link>
          </div>
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
