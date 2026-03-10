import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Navbar } from '@/components/Navbar';
import { DemoButton } from '@/components/DemoButton';
import { ScrollReveal } from '@/components/ScrollReveal';
import { CaBadge } from '@/components/CaBadge';
import { SocialLinks } from '@/components/SocialLinks';

const FANTASY = '/tilesets/npcs/fantasy-pixel-rpg-sprite-pack/Individual_Sprites';
const GL = '/tilesets/grassland-v2/ERW - Grass Land 2.0 v1.9/ERW - Grass Land 2.0 v1.9';
const VIL = '/tilesets/summer_village_v1.0_plus/summer_village_v1.0_plus';

const HERO_SPRITES = [
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

/* Sprites composing the hero world scene backdrop */
const GLS = `${GL}/Props/Static props`;
const SCENE_SPRITES: { src: string; style: React.CSSProperties }[] = [
  /* ── Back row: far trees (atmospheric depth) ── */
  { src: `${GLS}/pine-tree-sprites/pine-tree_3.png`,  style: { left: '3%',  bottom: '38%', height: 120, opacity: 0.50, filter: 'brightness(0.55) saturate(0.7)' } },
  { src: `${GLS}/pine-tree-sprites/pine-tree_9.png`,  style: { left: '18%', bottom: '40%', height: 100, opacity: 0.45, filter: 'brightness(0.50) saturate(0.65)' } },
  { src: `${GLS}/pine-tree-sprites/pine-tree_6.png`,  style: { right: '15%', bottom: '39%', height: 110, opacity: 0.48, filter: 'brightness(0.52) saturate(0.7)' } },
  { src: `${GLS}/pine-tree-sprites/pine-tree_3.png`,  style: { right: '5%', bottom: '37%', height: 105, opacity: 0.46, filter: 'brightness(0.50) saturate(0.65)' } },
  { src: `${GLS}/pine-tree-sprites/pine-tree_0.png`,  style: { left: '38%', bottom: '41%', height: 95, opacity: 0.42, filter: 'brightness(0.48) saturate(0.6)' } },
  { src: `${GLS}/pine-tree-sprites/pine-tree_6.png`,  style: { right: '38%', bottom: '40%', height: 90, opacity: 0.40, filter: 'brightness(0.45) saturate(0.55)' } },

  /* ── Mid row: structures + medium trees ── */
  { src: `${GLS}/pine-tree-sprites/pine-tree_0.png`,  style: { left: '-2%', bottom: '22%', height: 220, opacity: 0.72, filter: 'brightness(0.70) saturate(0.85)' } },
  { src: `${GLS}/Cabin/cabin.png`,                    style: { left: '14%', bottom: '18%', height: 150, opacity: 0.70, filter: 'brightness(0.68) saturate(0.88)' } },
  { src: `${GLS}/sheet2-sprites/watchtower - front.png`, style: { right: '12%', bottom: '20%', height: 200, opacity: 0.65, filter: 'brightness(0.65) saturate(0.82)' } },
  { src: `${GLS}/pine-tree-sprites/pine-tree_6.png`,  style: { right: '-1%', bottom: '20%', height: 200, opacity: 0.68, filter: 'brightness(0.68) saturate(0.8)' } },
  { src: `${GLS}/sheet2-sprites/stronghold - horizontal - entrance - on grass.png`, style: { left: '42%', bottom: '16%', height: 130, opacity: 0.62, filter: 'brightness(0.62) saturate(0.8)', transform: 'translateX(-50%)' } },
  { src: `${GLS}/pine-tree-sprites/pine-tree_9.png`,  style: { left: '30%', bottom: '24%', height: 160, opacity: 0.60, filter: 'brightness(0.60) saturate(0.78)' } },
  { src: `${GLS}/pine-tree-sprites/pine-tree_3.png`,  style: { right: '30%', bottom: '23%', height: 150, opacity: 0.58, filter: 'brightness(0.58) saturate(0.75)' } },

  /* ── Front row: foreground props (most visible) ── */
  { src: `${GLS}/sheet1-sprites/lamp post 1 - lamp.png`, style: { left: '25%', bottom: '10%', height: 110, opacity: 0.78, filter: 'brightness(0.75) saturate(0.88)' } },
  { src: `${GLS}/sheet1-sprites/campfire 1.png`,      style: { left: '48%', bottom: '8%', height: 55, opacity: 0.82, filter: 'brightness(0.80) saturate(0.9)' } },
  { src: `${GL}/Props/Animated props/shrine-base-with grass.png`, style: { right: '25%', bottom: '8%', height: 80, opacity: 0.72, filter: 'brightness(0.70) saturate(0.85)' } },
  { src: `${GLS}/sheet1-sprites/rocks on grass - color scheme 1 - 5.png`, style: { left: '58%', bottom: '5%', height: 45, opacity: 0.68, filter: 'brightness(0.68) saturate(0.82)' } },
  { src: `${GLS}/sheet1-sprites/sign 1.png`,          style: { right: '42%', bottom: '6%', height: 35, opacity: 0.65, filter: 'brightness(0.65) saturate(0.8)' } },
  { src: `${GLS}/sheet1-sprites/barrel 1.png`,        style: { left: '8%', bottom: '6%', height: 40, opacity: 0.68, filter: 'brightness(0.65) saturate(0.8)' } },
  { src: `${GLS}/sheet1-sprites/waterwell - rope.png`, style: { right: '8%', bottom: '7%', height: 65, opacity: 0.70, filter: 'brightness(0.68) saturate(0.82)' } },
];

const BUILD_ITEMS = [
  { name: 'Cabin', src: `${GL}/Props/Static props/Cabin/cabin.png` },
  { name: 'Tower', src: `${GL}/Props/Static props/sheet2-sprites/watchtower - front.png` },
  { name: 'Tent', src: `${GL}/Props/Static props/sheet2-sprites/tent 1.png` },
  { name: 'Wall', src: `${GL}/Props/Static props/sheet2-sprites/stronghold - horizontal - on grass.png` },
  { name: 'Stall', src: `${VIL}/assets/vegetable_stall.png` },
  { name: 'Well', src: `${GL}/Props/Static props/sheet1-sprites/waterwell - rope.png` },
  { name: 'Barrel', src: `${GL}/Props/Static props/sheet1-sprites/barrel 1.png` },
  { name: 'Fence', src: `${GL}/Props/Static props/sheet1-sprites/fence - left - right - 1.png` },
];

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
      <ScrollReveal />
      <Navbar />

      {/* ═══════════════════════════════════════════════════════
          HERO — "Your World. Alive."
          HUD strip below proves this is a real game immediately
          ═══════════════════════════════════════════════════════ */}
      <section className="hero-v2">
        {/* Real game world scene backdrop */}
        <div className="hero-world-scene">
          <div className="hero-world-terrain" />
          {SCENE_SPRITES.map((s, i) => (
            <img key={i} src={s.src} alt="" style={s.style} />
          ))}
          <div className="hero-world-overlay" />
        </div>
        <div className="hero-v2-glow" />
        <CaBadge />
        <SocialLinks />

        <div className="hero-v2-content">

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
              <DemoButton />
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
          <span className="hero-v2-stat"><strong>28</strong> playable characters</span>
          <span className="hero-v2-stat-sep" />
          <span className="hero-v2-stat"><strong>25+</strong> NPCs with dialogue</span>
          <span className="hero-v2-stat-sep" />
          <span className="hero-v2-stat"><strong>8</strong> quests &amp; missions</span>
        </div>

        {/* Character sprite parade — real game assets */}
        <div className="sprite-parade" style={{ position: 'relative', zIndex: 3, marginTop: 16 }}>
          {HERO_SPRITES.map(c => (
            <img key={c.alt} src={c.src} alt={c.alt} />
          ))}
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
      <div className="section-divider" aria-hidden="true"><span /></div>
      <section className="statement-section reveal-section">
        <p className="statement-text">
          Every world you create becomes a <span className="gold">playable 2D game</span> with
          combat, NPCs, quests, building, vendors, wildlife, and
          progression &mdash; backed by a full AI-generated lore layer
          you can explore, edit, and grow.
        </p>
      </section>
      <div className="section-divider" aria-hidden="true"><span /></div>
      {/* ═══════════════════════════════════════════════════════
          THE JOURNEY — Narrative walkthrough: Describe → Generate → Enter → Play
          Alternating panels, each visually unique
          ═══════════════════════════════════════════════════════ */}
      <section className="journey-section reveal-section">

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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
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
              {/* Game scene — real tileset sprites */}
              <div className="game-scene-panel" style={{ width: 320, height: 140 }}>
                <div className="scene-terrain" />
                <img src={`${GL}/Props/Static props/pine-tree.png`} alt="Pine Tree" style={{ height: 80 }} />
                <img src={`${FANTASY}/paladin_01_001.png`} alt="Player" style={{ height: 48 }} />
                <img src={`${GL}/Props/Static props/Cabin/cabin.png`} alt="Cabin" style={{ height: 72 }} />
                <img src={`${GL}/Props/Static props/sheet1-sprites/waterwell - rope.png`} alt="Well" style={{ height: 40 }} />
              </div>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
              {/* Combat scene — real orc sprites */}
              <div className="game-scene-panel" style={{ width: 300, height: 100 }}>
                <div className="scene-terrain" />
                <img src={`${GL}/Characters/orc warrior/orc1/orc melee - anims-idle.png`} alt="Orc Warrior" style={{ height: 48 }} />
                <span className="scene-damage" style={{ color: '#ff4040' }}>-12</span>
                <img src={`${FANTASY}/warrior_01_003.png`} alt="Player" style={{ height: 44 }} />
                <span className="scene-damage" style={{ color: '#60c060' }}>+25 HP</span>
                <img src={`${GL}/Characters/orc warrior/orc2/orc melee - anims color2-idle.png`} alt="Orc Warrior" style={{ height: 48 }} />
              </div>
              {/* NPC dialogue mockup */}
              <div className="mock-dialogue">
                <div className="mock-dialogue-name">Helena &mdash; Tavern Keeper</div>
                <div className="mock-dialogue-text">
                  Welcome back, traveler. The fire&apos;s warm and I&apos;ve got stew on.
                  I could use a favor though &mdash; I&apos;m running low on firewood.
                </div>
                <div className="mock-dialogue-choices">
                  <div className="mock-choice">
                    <span className="mock-choice-key">1</span> I can gather some for you.
                  </div>
                  <div className="mock-choice">
                    <span className="mock-choice-key">2</span> What&apos;s happening in town?
                  </div>
                  <div className="mock-choice">
                    <span className="mock-choice-key">3</span> Just here for the warmth.
                  </div>
                </div>
              </div>
              {/* Quest tracker mockup */}
              <div className="mock-quest">
                <div className="mock-quest-header">Active Quest</div>
                <div className="mock-quest-title">Marina&apos;s Lost Necklace</div>
                <div className="mock-quest-obj done">
                  <span className="mock-quest-marker">&#10003;</span>
                  Search the old well
                </div>
                <div className="mock-quest-obj done">
                  <span className="mock-quest-marker">&#10003;</span>
                  Search the dock crates
                </div>
                <div className="mock-quest-obj active">
                  <span className="mock-quest-marker" />
                  Search the garden flowers
                </div>
                <div className="mock-quest-obj active">
                  <span className="mock-quest-marker" />
                  Return to Marina
                </div>
                <div className="mock-quest-reward">Reward: +30 Gold</div>
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
              {/* Build menu mockup — real structure sprites */}
              <div className="mock-build">
                <div className="mock-build-tabs">
                  <span className="mock-build-tab active">Structures</span>
                  <span className="mock-build-tab">Props</span>
                  <span className="mock-build-tab">Decor</span>
                </div>
                <div className="mock-build-grid">
                  {BUILD_ITEMS.map(item => (
                    <div key={item.name} className="mock-build-cell">
                      <img src={item.src} alt={item.name} />
                      <span className="mock-build-cell-label">{item.name}</span>
                    </div>
                  ))}
                </div>
                <div className="mock-build-cost">
                  <span>Wooden Cabin</span>
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

      <div className="section-divider" aria-hidden="true"><span /></div>
      {/* ═══════════════════════════════════════════════════════
          GAME SYSTEMS — Editorial spreads proving each system is real
          Each system has a game-UI mockup as its visual
          ═══════════════════════════════════════════════════════ */}
      <section className="systems-section reveal-section">
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
              {/* Combat scene — real orc sprites */}
              <div className="game-scene-panel" style={{ padding: '16px 24px', gap: 16 }}>
                <div className="scene-terrain" />
                <img src={`${GL}/Characters/orc warrior/orc1/orc melee - anims-idle.png`} alt="Orc Warrior" className="sprite-img" style={{ height: 52 }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center', position: 'relative', zIndex: 1 }}>
                  <span className="scene-damage" style={{ color: '#ff4040' }}>−12</span>
                  <span className="scene-damage" style={{ color: '#ff4040' }}>−8</span>
                  <span className="scene-damage" style={{ color: '#60c060' }}>+25 HP</span>
                  <span className="scene-damage" style={{ color: '#e8c86a' }}>+10g</span>
                </div>
                <img src={`${GL}/Characters/orc warrior/orc2/orc melee - anims color2-idle.png`} alt="Orc Warrior 2" className="sprite-img" style={{ height: 52 }} />
              </div>
            </div>
          </div>
        </div>

        {/* NPCs & Dialogue */}
        <div className="system-spread reverse">
          <div className="system-text">
            <div className="system-label" style={{ color: 'var(--gold)' }}>NPCs</div>
            <h3>25+ named characters with progression-aware dialogue</h3>
            <p>
              Every NPC has a name, a role, and dialogue that changes based on your
              progress. Helena the Tavern Keeper offers quests and heals you. Barton
              the Guard Captain tracks your orc kills. Witch Willow reads your fortune
              and sells potions. Quest-givers remember what you&apos;ve done.
            </p>
            <ul>
              <li>8 ambient hub NPCs + 8 building residents with quests</li>
              <li>6 village NPCs + Witch Willow + 2 grassland guards</li>
              <li>Dialogue choices with 1/2/3 keys</li>
              <li>Progress-aware: dialogue reacts to orc kills, bandit clears, quests, buildings</li>
              <li>28 playable characters with color customization (press C)</li>
            </ul>
          </div>
          <div className="system-visual">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
              <div className="mock-dialogue">
                <div className="mock-dialogue-name">Witch Willow &mdash; Fortune Teller</div>
                <div className="mock-dialogue-text">
                  The cards whisper of a necklace lost near the village garden&hellip;
                  and of hidden gold along the coast road. Seek them if you dare.
                </div>
                <div className="mock-dialogue-choices">
                  <div className="mock-choice">
                    <span className="mock-choice-key">1</span> Tell me my fortune.
                  </div>
                  <div className="mock-choice">
                    <span className="mock-choice-key">2</span> Show me your potions.
                  </div>
                  <div className="mock-choice">
                    <span className="mock-choice-key">3</span> Tell me about this place.
                  </div>
                </div>
              </div>
              {/* NPC character parade */}
              <div className="sprite-parade sprite-parade-sm" style={{ padding: '8px 0 0' }}>
                {HERO_SPRITES.slice(0, 5).map(c => (
                  <img key={c.alt} src={c.src} alt={c.alt} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Building */}
        <div className="system-spread">
          <div className="system-text">
            <div className="system-label" style={{ color: '#36B37E' }}>Building</div>
            <h3>Build structures. Attract residents.</h3>
            <p>
              Press B to open the build menu. 22 items across structures, props,
              and decoration. Each costs wood, stone, or gold. Rotate with R.
              Buildings persist across sessions &mdash; and attract named NPC
              residents who move in, offer quests, and react to your progress.
            </p>
            <ul>
              <li>22 items: huts, walls, towers, stalls, fences, torches, and more</li>
              <li>8 named residents with unique dialogue and quests</li>
              <li>Milestone rewards at 5, 10, 20, 30 buildings</li>
              <li>Rotation: 0&deg; / 90&deg; / 180&deg; / 270&deg;</li>
              <li>Saved to database, loaded on enter</li>
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
                {BUILD_ITEMS.map(item => (
                  <div key={item.name} className="mock-build-cell">
                    <img src={item.src} alt={item.name} />
                    <span className="mock-build-cell-label">{item.name}</span>
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
            <h3>8 quests, 4 vendors, and a full economy</h3>
            <p>
              Kill enemies for gold. Complete quests for rewards. Buy gear from vendors.
              The grassland has a full mission chain. The village has Marina&apos;s
              Lost Necklace quest and a witch selling potions. Building residents
              in the hub offer their own quests &mdash; gather firewood for Helena,
              survey discoveries for Marcus, clear orcs for Barton.
            </p>
            <ul>
              <li>8 quests across all zones with gold and resource rewards</li>
              <li>3 material types: Wood, Stone, Gold &mdash; all persist across sessions</li>
              <li>Vendor shops in every zone + witch potion shop</li>
              <li>Building residents offer quests tied to your progress</li>
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
              <div className="mock-quest" style={{ opacity: 0.85 }}>
                <div className="mock-quest-header">Building Quest</div>
                <div className="mock-quest-title">Helena&apos;s Firewood</div>
                <div className="mock-quest-obj active">
                  <span className="mock-quest-marker" />
                  Gather 5 wood for Helena
                </div>
                <div className="mock-quest-reward">Reward: +15 Gold</div>
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

      <div className="section-divider" aria-hidden="true"><span /></div>
      {/* ═══════════════════════════════════════════════════════
          LORE LAYER — The worldbuilding tools under the game
          Bento layout, not uniform cards
          ═══════════════════════════════════════════════════════ */}
      <section className="lore-section reveal-section">
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
                <span className="lore-bento-entity-pill" style={{ color: 'var(--color-character)', borderColor: 'rgba(255,107,44,0.3)' }}>Characters</span>
                <span className="lore-bento-entity-pill" style={{ color: 'var(--color-location)', borderColor: 'rgba(54,179,126,0.3)' }}>Locations</span>
                <span className="lore-bento-entity-pill" style={{ color: 'var(--color-faction)', borderColor: 'rgba(232,67,147,0.3)' }}>Factions</span>
                <span className="lore-bento-entity-pill" style={{ color: 'var(--color-artifact)', borderColor: 'rgba(9,132,227,0.3)' }}>Artifacts</span>
                <span className="lore-bento-entity-pill" style={{ color: 'var(--color-species)', borderColor: 'rgba(123,97,255,0.3)' }}>Species</span>
                <span className="lore-bento-entity-pill" style={{ color: 'var(--color-event)', borderColor: 'rgba(243,156,18,0.3)' }}>Events</span>
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

      <div className="section-divider" aria-hidden="true"><span /></div>
      {/* ═══════════════════════════════════════════════════════
          HOW TO PLAY — Quick controls reference
          ═══════════════════════════════════════════════════════ */}
      <section className="htp-section reveal-section">
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
              <p>Talk to NPCs, accept quests, inspect landmarks, activate shrines.</p>
            </div>
            <div className="htp-card">
              <div className="htp-key">B</div>
              <h4>Build</h4>
              <p>Open the build menu. R to rotate. Click to place.</p>
            </div>
            <div className="htp-card">
              <div className="htp-key">C</div>
              <h4>Character</h4>
              <p>Choose from 28 characters. Customize your color.</p>
            </div>
            <div className="htp-card">
              <div className="htp-key">1 2 3</div>
              <h4>Dialogue</h4>
              <p>Pick dialogue options when talking to NPCs.</p>
            </div>
          </div>

          <div className="htp-zones">
            <div className="htp-zone" style={{ borderColor: 'rgba(240,192,96,0.25)', background: 'rgba(240,192,96,0.04)' }}>
              <h4>Hub Zone</h4>
              <p>
                Your home base. Merchant, campfire, well, 8 townsfolk NPCs.
                Place buildings to attract named residents who offer quests.
                Complete objectives to unlock paths to other zones.
              </p>
              <div className="game-scene-panel" style={{ marginTop: 12, height: 80, padding: '10px 16px' }}>
                <div className="scene-terrain" />
                <img src={`${GL}/Props/Static props/Cabin/cabin.png`} alt="Cabin" className="sprite-img" style={{ height: 48 }} />
                <img src={`${GL}/Props/Static props/sheet1-sprites/waterwell - rope.png`} alt="Well" className="sprite-img" style={{ height: 32 }} />
                <img src={`${FANTASY}/paladin_01_001.png`} alt="Player" className="sprite-img" style={{ height: 36 }} />
              </div>
            </div>
            <div className="htp-zone" style={{ borderColor: 'rgba(54,179,126,0.25)', background: 'rgba(54,179,126,0.04)' }}>
              <h4>Grassland</h4>
              <p>
                Wilderness zone. 7 orc warriors, combat shrine, vendor camp,
                8 points of interest. Full mission chain with chest reward.
              </p>
              <div className="game-scene-panel" style={{ marginTop: 12, height: 80, padding: '10px 16px' }}>
                <div className="scene-terrain" />
                <img src={`${GL}/Props/Static props/pine-tree.png`} alt="Pine Tree" className="sprite-img" style={{ height: 56 }} />
                <img src={`${GL}/Characters/orc warrior/orc1/orc melee - anims-idle.png`} alt="Orc" className="sprite-img" style={{ height: 36 }} />
                <img src={`${GL}/Props/Animated props/shrine-base-with grass.png`} alt="Shrine" className="sprite-img" style={{ height: 40 }} />
              </div>
            </div>
            <div className="htp-zone" style={{ borderColor: 'rgba(9,132,227,0.25)', background: 'rgba(9,132,227,0.04)' }}>
              <h4>Seaside Village</h4>
              <p>
                Coastal zone. 6 named NPCs, Witch Willow&apos;s potion shop,
                4 bandits, wildlife, and Marina&apos;s Lost Necklace quest.
              </p>
              <div className="game-scene-panel" style={{ marginTop: 12, height: 80, padding: '10px 16px' }}>
                <div className="scene-terrain" style={{ background: 'linear-gradient(180deg, #2898b8 0%, #3bbcd8 50%, #c8c078 100%)' }} />
                <img src={`${VIL}/assets/vegetable_stall.png`} alt="Market" className="sprite-img" style={{ height: 40 }} />
                <img src={`${FANTASY}/priest_01_001.png`} alt="NPC" className="sprite-img" style={{ height: 36 }} />
                <img src={`${FANTASY}/elf_02_005.png`} alt="Herbalist" className="sprite-img" style={{ height: 36 }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider" aria-hidden="true"><span /></div>
      {/* ═══════════════════════════════════════════════════════
          COMMUNITY — Real worlds from the database
          ═══════════════════════════════════════════════════════ */}
      <section className="community-section reveal-section">
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

      <div className="section-divider" aria-hidden="true"><span /></div>
      {/* ═══════════════════════════════════════════════════════
          FINAL CTA
          ═══════════════════════════════════════════════════════ */}
      <section className="final-cta reveal-section">
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
