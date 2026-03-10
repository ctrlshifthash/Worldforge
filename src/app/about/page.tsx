import Link from 'next/link';
import { Navbar } from '@/components/Navbar';

const FANTASY = '/tilesets/npcs/fantasy-pixel-rpg-sprite-pack/Individual_Sprites';
const GL = '/tilesets/grassland-v2/ERW - Grass Land 2.0 v1.9/ERW - Grass Land 2.0 v1.9';

const ABOUT_SPRITES = [
  { src: `${FANTASY}/paladin_01_001.png`, alt: 'Paladin' },
  { src: `${FANTASY}/dwarf_01_008.png`, alt: 'Dwarf' },
  { src: `${FANTASY}/elf_01_001.png`, alt: 'Elf Scout' },
  { src: `${FANTASY}/warrior_01_003.png`, alt: 'Swordswoman' },
  { src: `${FANTASY}/mage_01_005.png`, alt: 'Fire Witch' },
];

export default function AboutPage() {
  return (
    <div className="about-page">
      <Navbar />

      {/* ─── Cinematic Opening ─── */}
      <section className="about-opening tileset-bg">
        <div className="about-opening-lines">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="about-opening-line" style={{ animationDelay: `${i * 0.3}s` }} />
          ))}
        </div>
        <div className="about-opening-content">
          <h1 className="about-opening-title">
            Every great story<br />
            starts with a <span className="about-glow-word">world</span>.
          </h1>
          <p className="about-opening-lead">
            Worldforge lets you build one — then walk into it.
          </p>
        </div>
        <div className="about-scroll-hint">
          <div className="about-scroll-line" />
        </div>
      </section>

      <div className="mountain-divider" />

      {/* ─── What Is Worldforge ─── */}
      <section className="about-statement">
        <div className="about-statement-inner">
          <h2 className="about-statement-heading">So what is Worldforge?</h2>
          <p className="about-big-text">
            Worldforge is a platform where you create fictional worlds — think Middle-earth,
            Westeros, or the Star Wars galaxy — except it&apos;s <em>your</em> universe, with <em>your</em> rules.
            And then you actually <em>play</em> inside it.
          </p>
          <p className="about-big-text">
            You can build everything yourself — manually creating characters, locations, factions,
            artifacts, timeline events, and relationships one by one. Or, give AI a concept like
            <em> &ldquo;a world where music is magic&rdquo;</em> and it&apos;ll generate everything
            in under 30 seconds. Then walk into your world — explore 3 zones, talk to 25+ named
            NPCs, fight orcs and bandits, complete 8 quests, build structures that attract residents,
            customize your character from 28 options, and grow your settlement into a living town.
          </p>
          <p className="about-big-text about-big-text-muted">
            AI is just an option — a starting point. Everything it generates can be edited, deleted,
            or expanded. It&apos;s your world, you decide how to build it.
          </p>
          {/* Character sprite parade */}
          <div className="sprite-parade" style={{ marginTop: 24, marginBottom: 8 }}>
            {ABOUT_SPRITES.map(c => (
              <img key={c.alt} src={c.src} alt={c.alt} />
            ))}
          </div>
          <Link href="/play/everhold" className="btn btn-primary" style={{ marginTop: 16, marginRight: 12 }}>
            Enter a World
          </Link>
          <Link href="/how-it-works" className="btn btn-secondary" style={{ marginTop: 16 }}>
            See how everything works &rarr;
          </Link>
        </div>
      </section>

      {/* ─── What's In A World ─── */}
      <section className="about-statement" style={{ borderTop: '1px solid rgba(30,68,32,0.12)' }}>
        <div className="about-statement-inner">
          <h2 className="about-statement-heading">What&apos;s inside a world?</h2>
          <p className="about-big-text">
            Every world is made up of <strong>entities</strong> — these are the building blocks.
            There are six types:
          </p>
          <div className="about-entity-explain">
            <div className="about-entity-row">
              <span className="about-entity-dot" style={{ background: 'var(--color-character)' }} />
              <div>
                <strong>Characters</strong> — The people in your world. Heroes, villains, rulers, outcasts.
                Each one has a name, a backstory, custom facts (like &ldquo;Age: 34&rdquo; or &ldquo;Title: Exiled Prince&rdquo;), and tags.
              </div>
            </div>
            <div className="about-entity-row">
              <span className="about-entity-dot" style={{ background: 'var(--color-location)' }} />
              <div>
                <strong>Locations</strong> — The places. Cities, mountains, ruins, taverns.
                Anywhere that matters to the story.
              </div>
            </div>
            <div className="about-entity-row">
              <span className="about-entity-dot" style={{ background: 'var(--color-faction)' }} />
              <div>
                <strong>Factions</strong> — Groups of people with shared goals. Kingdoms, guilds,
                cults, rebel alliances — any organized group.
              </div>
            </div>
            <div className="about-entity-row">
              <span className="about-entity-dot" style={{ background: 'var(--color-artifact)' }} />
              <div>
                <strong>Artifacts</strong> — Important objects. A legendary sword, a cursed ring,
                a sacred scroll — things that matter to your lore.
              </div>
            </div>
            <div className="about-entity-row">
              <span className="about-entity-dot" style={{ background: 'var(--color-species)' }} />
              <div>
                <strong>Species</strong> — Races and creatures. Elves, dragons, sentient mushrooms —
                whatever lives in your world.
              </div>
            </div>
            <div className="about-entity-row">
              <span className="about-entity-dot" style={{ background: 'var(--color-event)' }} />
              <div>
                <strong>Events</strong> — Major occurrences. A war, a natural disaster, a coronation —
                things that happened and changed the world.
              </div>
            </div>
          </div>
          <p className="about-big-text" style={{ marginTop: 32 }}>
            Then there&apos;s the <strong>timeline</strong> — a chronological history of your world
            broken into eras. Think of it like a history textbook for your universe. Each event
            has a date, a description, and an explanation of how it changed things.
          </p>
          <p className="about-big-text">
            And <strong>connections</strong> between entities. &ldquo;Kael is the
            leader of The Iron Guard.&rdquo; &ldquo;The Sunblade was forged in Mount Ashara.&rdquo;
            These get visualized as an interactive map so you can see how everything is linked.
          </p>
        </div>
      </section>

      {/* ─── The AI Demo ─── */}
      <section className="about-demo-section">
        <div className="about-demo-container">
          <div className="about-demo-label">AI generation (optional) — here&apos;s what it looks like</div>
          <div className="about-demo-terminal">
            <div className="about-demo-bar">
              <span className="about-demo-dot" />
              <span className="about-demo-dot" />
              <span className="about-demo-dot" />
              <span className="about-demo-bar-title">worldforge generate</span>
            </div>
            <div className="about-demo-body">
              <div className="about-demo-line about-demo-input">
                <span className="about-demo-prompt">&gt;</span>
                <span>&ldquo;A dying world where the last city floats above an ocean of ash, kept aloft by songs sung in shifts&rdquo;</span>
              </div>
              <div className="about-demo-line about-demo-processing">
                generating world...
              </div>
              <div className="about-demo-divider" />
              <div className="about-demo-line about-demo-output">
                <span className="about-demo-key">world</span> Ashenveil: The Last Refrain
              </div>
              <div className="about-demo-line about-demo-output">
                <span className="about-demo-key">entities</span>
                <span className="about-demo-tag" data-type="character">Kael Ashborn</span>
                <span className="about-demo-tag" data-type="location">The Hovering Choir</span>
                <span className="about-demo-tag" data-type="faction">The Songkeepers</span>
                <span className="about-demo-tag" data-type="artifact">The First Note</span>
                <span className="about-demo-tag" data-type="species">Cinderwraiths</span>
                <span className="about-demo-tag" data-type="location">The Ash Meridian</span>
                <span className="about-demo-tag" data-type="character">Lyris Halfvoice</span>
                <span className="about-demo-tag" data-type="faction">The Silencers</span>
              </div>
              <div className="about-demo-line about-demo-output">
                <span className="about-demo-key">timeline</span> 5 events across 3 eras
              </div>
              <div className="about-demo-line about-demo-output">
                <span className="about-demo-key">relations</span> 7 connections mapped
              </div>
              <div className="about-demo-divider" />
              <div className="about-demo-line about-demo-success">
                World ready. Opening Ashenveil...
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Bento Feature Grid ─── */}
      <section className="about-bento-section">
        <h2 className="about-section-title">What&apos;s inside every world</h2>
        <div className="about-bento">
          <div className="about-bento-card about-bento-wide">
            <div className="about-bento-icon" style={{ color: '#FF6B2C' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="8" r="4"/><path d="M5 20a7 7 0 0 1 14 0"/></svg>
            </div>
            <h3>Entity Library</h3>
            <p>
              Six entity types — Characters, Locations, Factions, Artifacts, Species, Events.
              Each one gets a full page with rich lore, custom key-value facts, and tags.
              Link them together and build a living encyclopedia of your universe.
            </p>
            <div className="about-bento-entity-pills">
              <span style={{ borderColor: 'var(--color-character)' }}>Characters</span>
              <span style={{ borderColor: 'var(--color-location)' }}>Locations</span>
              <span style={{ borderColor: 'var(--color-faction)' }}>Factions</span>
              <span style={{ borderColor: 'var(--color-artifact)' }}>Artifacts</span>
              <span style={{ borderColor: 'var(--color-species)' }}>Species</span>
              <span style={{ borderColor: 'var(--color-event)' }}>Events</span>
            </div>
          </div>

          <div className="about-bento-card">
            <div className="about-bento-icon" style={{ color: '#0984E3' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="12" cy="18" r="2.5"/><path d="M8 7.5l3 8M16 7.5l-3 8M8.5 6h7"/></svg>
            </div>
            <h3>Connections</h3>
            <p>
              An interactive map showing every connection in your world.
              Alliances, rivalries, bloodlines — characters, locations, and factions you can click and explore.
            </p>
          </div>

          <div className="about-bento-card">
            <div className="about-bento-icon" style={{ color: '#36B37E' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 12h4l3-9 4 18 3-9h4"/></svg>
            </div>
            <h3>Timeline</h3>
            <p>
              Chronicle events across eras. Every war, coronation, and cataclysm gets a date,
              a description, and what it changed in the world.
            </p>
          </div>

          <div className="about-bento-card about-bento-tall">
            <div className="about-bento-icon" style={{ color: '#7B61FF' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 12h18M12 3v18"/></svg>
            </div>
            <h3>Explore Mode &mdash; A Full Game</h3>
            <p>
              Every world becomes a playable 2D pixel-art game. 3 zones, 25+ NPCs
              with dialogue, 8 quests, real-time combat with orcs and bandits,
              vendor shops, a building system, and 28 playable characters to choose
              from. It&apos;s not just a viewer &mdash; it&apos;s a game you can
              spend hours in.
            </p>
            <div className="game-scene-panel" style={{ marginTop: 16, height: 100, padding: '12px 20px' }}>
              <div className="scene-terrain" />
              <img src={`${GL}/Props/Static props/pine-tree.png`} alt="Pine Tree" className="sprite-img" style={{ height: 64 }} />
              <img src={`${FANTASY}/paladin_01_001.png`} alt="Player" className="sprite-img" style={{ height: 44 }} />
              <img src={`${GL}/Props/Static props/Cabin/cabin.png`} alt="Cabin" className="sprite-img" style={{ height: 56 }} />
              <img src={`${GL}/Characters/orc warrior/orc1/orc melee - anims-idle.png`} alt="Orc" className="sprite-img" style={{ height: 40 }} />
            </div>
          </div>

          <div className="about-bento-card about-bento-wide">
            <div className="about-bento-split">
              <div>
                <div className="about-bento-icon" style={{ color: '#E84393' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                </div>
                <h3>World Map &amp; Territories</h3>
                <p>
                  Bird&apos;s-eye view with entity pins, drawable regions, and faction territories
                  that change per era. Scrub through time to watch borders shift.
                </p>
              </div>
              <div>
                <div className="about-bento-icon" style={{ color: '#F39C12' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="9"/></svg>
                </div>
                <h3>Eras &amp; Time Filter</h3>
                <p>
                  Divide your history into named eras with colors and date ranges.
                  The era filter on the map and connections view lets you filter everything by time period.
                </p>
              </div>
            </div>
          </div>

          <div className="about-bento-card about-bento-wide">
            <div className="about-bento-split">
              <div>
                <div className="about-bento-icon" style={{ color: '#36B37E' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                </div>
                <h3>AI Storytelling</h3>
                <p>
                  Let the AI write what happens to a character while you&apos;re away. Give it a personality prompt and constraints,
                  and it generates stories — journal entries, encounters, discoveries —
                  as if the character is living their life. You review and approve everything.
                </p>
              </div>
              <div>
                <div className="about-bento-icon" style={{ color: '#F39C12' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                </div>
                <h3>Story Review</h3>
                <p>
                  Every AI-written story lands in a review queue. Read the narrative,
                  see proposed changes (new connections, facts, tags), then approve, edit,
                  or reject. Nothing changes in your world without your say.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Big Numbers ─── */}
      <section className="about-numbers">
        <div className="about-numbers-inner">
          <div className="about-number-block">
            <img src={`${GL}/Props/Static props/pine-tree.png`} alt="" className="sprite-img" style={{ height: 32, marginBottom: 8 }} />
            <div className="about-number-value">3</div>
            <div className="about-number-label">Explorable zones with unique gameplay</div>
          </div>
          <div className="about-number-divider" />
          <div className="about-number-block">
            <img src={`${FANTASY}/paladin_01_001.png`} alt="" className="sprite-img" style={{ height: 32, marginBottom: 8 }} />
            <div className="about-number-value">25+</div>
            <div className="about-number-label">Named NPCs with dialogue and quests</div>
          </div>
          <div className="about-number-divider" />
          <div className="about-number-block">
            <img src={`${FANTASY}/elf_01_001.png`} alt="" className="sprite-img" style={{ height: 32, marginBottom: 8 }} />
            <div className="about-number-value">28</div>
            <div className="about-number-label">Playable characters with color customization</div>
          </div>
          <div className="about-number-divider" />
          <div className="about-number-block">
            <div className="about-number-value">&lt;30s</div>
            <div className="about-number-label">To generate a complete world with AI</div>
          </div>
        </div>
      </section>

      {/* ─── Who It's For — Horizontal Scroll ─── */}
      <section className="about-audience-section">
        <h2 className="about-section-title">Who builds with Worldforge</h2>
        <div className="about-audience-scroll">
          <div className="about-audience-item">
            <div className="about-audience-big-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
            </div>
            <h3>Writers &amp; Authors</h3>
            <p>
              Build the world behind your novel. Track every character arc, map faction politics,
              and never forget a plot thread. AI generates the scaffolding — you fill in the soul.
            </p>
          </div>
          <div className="about-audience-item">
            <div className="about-audience-big-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/><line x1="12" y1="22" x2="12" y2="15.5"/><polyline points="22 8.5 12 15.5 2 8.5"/></svg>
            </div>
            <h3>Game Masters</h3>
            <p>
              Generate an entire campaign setting in 30 seconds. NPCs with backstories,
              faction relationships, historical events — all connected and ready for session one.
            </p>
          </div>
          <div className="about-audience-item">
            <div className="about-audience-big-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z"/></svg>
            </div>
            <h3>Hobbyists</h3>
            <p>
              Build worlds for the pure joy of it. Explore your creation in 2D,
              share it with the community on Discover, and see what others have imagined.
            </p>
          </div>
        </div>
      </section>

      {/* ─── FAQ — Accordion Style ─── */}
      <section className="about-faq-section">
        <h2 className="about-section-title">Questions</h2>
        <div className="about-faq-list">
          <details className="about-faq-detail">
            <summary>What exactly is Worldforge?</summary>
            <p>Worldforge is a platform for creating fictional worlds. You know how Lord of the Rings has Middle-earth with all its characters, locations, history, and lore? Worldforge lets you build something like that — your own universe with its own people, places, factions, artifacts, species, history, and connections between everything. You can use AI to generate it all automatically, or build every detail by hand.</p>
          </details>
          <details className="about-faq-detail">
            <summary>What do you mean by &ldquo;entities&rdquo;?</summary>
            <p>Entities are just the things that exist in your world. There are six types: Characters (people), Locations (places), Factions (groups/organizations), Artifacts (important objects), Species (races/creatures), and Events (things that happened). Each entity gets its own page with a name, description, lore, custom facts (like &ldquo;Age: 142&rdquo; or &ldquo;Allegiance: The Northern Pact&rdquo;), and tags. They&apos;re the building blocks of your world.</p>
          </details>
          <details className="about-faq-detail">
            <summary>What&apos;s the timeline?</summary>
            <p>The timeline is your world&apos;s history — a list of major events organized by era. Think of it like a history book for your fictional universe. Each event has a date (like &ldquo;Year 312&rdquo; or &ldquo;The Third Age&rdquo;), a title, a description of what happened, and an explanation of how it changed the world. So you might have &ldquo;The Fall of Ironhold&rdquo; in the &ldquo;Age of Ruin&rdquo; era, describing how a fortress was destroyed and what that meant for everyone.</p>
          </details>
          <details className="about-faq-detail">
            <summary>What are relationships?</summary>
            <p>Relationships are connections between entities. Like &ldquo;Kael leads The Iron Guard&rdquo; or &ldquo;The Sunblade was forged in Mount Ashara&rdquo; or &ldquo;The Northern Kingdom is allied with The Merchant Guild.&rdquo; You define who/what is connected and how. These get displayed as an interactive graph — a visual web showing how everything in your world links together.</p>
          </details>
          <details className="about-faq-detail">
            <summary>Do I have to use AI?</summary>
            <p>No. AI generation is completely optional — it&apos;s just there to help if you want a quick starting point. When you create a world, you choose: either let AI generate everything from a concept you describe, or create an empty world and add characters, locations, events, and relationships yourself one by one. You can also mix both — let AI generate the foundation and then edit, add, or delete whatever you want.</p>
          </details>
          <details className="about-faq-detail">
            <summary>What&apos;s the explore mode?</summary>
            <p>Explore mode is a full 2D pixel-art game inside your world. There are 3 zones (hub, grassland, village), 25+ named NPCs with progression-aware dialogue, 8 quests with gold and resource rewards, real-time combat against orcs and bandits, 4 vendor shops, a witch selling potions, a building system with 22 placeable structures that attract named NPC residents, 28 playable characters with hue-shift color customization, wildlife, ambient effects, and a full economy with wood, stone, and gold. It&apos;s a complete game, not just a viewer.</p>
          </details>
          <details className="about-faq-detail">
            <summary>Is this a game or a worldbuilding tool?</summary>
            <p>Both. You get a complete worldbuilding platform — entity library, timeline, connections graph, world map, AI storytelling. But every world also becomes a playable 2D pixel-art game with 3 zones, real-time combat, 25+ NPCs with dialogue and quests, a building system where structures attract named residents, 28 playable characters, vendor shops, and a full economy. The lore layer and the game layer are the same world.</p>
          </details>
          <details className="about-faq-detail">
            <summary>Is it free?</summary>
            <p>Yes. Create an account, build as many worlds as you want, add unlimited entities, events, and relationships — all free. AI generation is also free to use.</p>
          </details>
          <details className="about-faq-detail">
            <summary>Do I need an account?</summary>
            <p>To create worlds, yes — you need a free account. But to browse and explore public worlds that other people have made, no account is needed. You can click Discover, find a world, explore it, view the graph, read the timeline — everything — without signing up.</p>
          </details>
          <details className="about-faq-detail">
            <summary>Can other people see my world?</summary>
            <p>Only if you want them to. Every world starts as Private — only you can see it. If you want to share it, change the visibility to Public in your world settings and it&apos;ll show up on the Discover page for anyone to browse.</p>
          </details>
          <details className="about-faq-detail">
            <summary>Can I edit stuff after AI generates it?</summary>
            <p>Yes, everything. AI gives you a starting point but nothing is locked. You can edit any entity&apos;s name, description, facts, and tags. You can delete entities you don&apos;t like, add new ones, change timeline events, add or remove relationships — it&apos;s fully yours to customize however you want.</p>
          </details>
          <details className="about-faq-detail">
            <summary>What are eras?</summary>
            <p>Eras are time periods that divide your world&apos;s history — like &ldquo;The First Age&rdquo; or &ldquo;The Age of Ruin.&rdquo; Each era has a title, color, and date range. Timeline events are grouped by era. On the Map and Connections pages, there&apos;s an era filter that lets you filter everything by time period — so you can see what the world looked like during a specific era.</p>
          </details>
          <details className="about-faq-detail">
            <summary>What is AI Storytelling?</summary>
            <p>AI Storytelling lets the AI write what happens to one of your characters. You give it a personality prompt (how the character thinks and acts) and constraints (what it should never do), then click &ldquo;Write Next Story&rdquo; to have the AI write a short narrative — something the character did, like a journal entry, an encounter, or a discovery. Every story goes to a review queue where you decide whether to approve it (making it part of your world) or reject it. Nothing happens to your world without your approval.</p>
          </details>
          <details className="about-faq-detail">
            <summary>What are AI-generated stories?</summary>
            <p>Stories from AI Storytelling are short narratives describing what a character did — a conversation they had, a place they traveled to, a rumor they heard. Each one comes with optional proposed changes (new connections, facts, or tags). You review them and decide: approve (applies the changes), edit, or reject (discards it). It&apos;s like having an AI co-writer that suggests what happens next, but you have final say.</p>
          </details>
          <details className="about-faq-detail">
            <summary>What are territories and regions?</summary>
            <p>On the World Map, you can draw named regions (like countries or provinces) and assign faction ownership per era. So &ldquo;The Northern Wastes&rdquo; might be controlled by &ldquo;The Ice Clans&rdquo; during the First Age, then conquered by &ldquo;The Empire&rdquo; in the Second Age. When you use the era filter on the map, you see territory ownership change over time.</p>
          </details>
        </div>
      </section>

      <div className="mountain-divider" />

      {/* ─── Final CTA ─── */}
      <section className="about-final-cta">
        <div className="about-final-cta-bg" />
        <h2>Start forging.</h2>
        <p>Describe a world. Watch it materialize. It takes 30 seconds.</p>
        <div className="about-final-cta-buttons">
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
