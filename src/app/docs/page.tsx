import type { Metadata } from 'next';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Docs — Worldforge',
  description:
    'How Worldforge works: explore living worlds, fight, build, complete quests, and earn real SOL by holding the token.',
};

const section: React.CSSProperties = {
  background: '#16161a',
  border: '1px solid #2a2a30',
  borderRadius: 14,
  padding: '24px 28px',
  marginBottom: 20,
};

const h2: React.CSSProperties = { fontSize: 22, margin: '0 0 12px', color: '#f0e6c8' };
const h3: React.CSSProperties = { fontSize: 17, margin: '18px 0 8px', color: '#e8c86a' };
const p: React.CSSProperties = { color: '#c4c4cc', lineHeight: 1.7, margin: '0 0 12px' };
const li: React.CSSProperties = { color: '#c4c4cc', lineHeight: 1.7, marginBottom: 6 };
const link: React.CSSProperties = { color: '#e8c86a', textDecoration: 'none' };

const tocLink: React.CSSProperties = {
  color: '#c4c4cc',
  textDecoration: 'none',
  lineHeight: 1.9,
  display: 'block',
};

const tableWrap: React.CSSProperties = {
  overflowX: 'auto',
  margin: '4px 0 14px',
  border: '1px solid #2a2a30',
  borderRadius: 10,
};
const table: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: 15,
};
const th: React.CSSProperties = {
  textAlign: 'left',
  padding: '10px 14px',
  color: '#f0e6c8',
  background: '#1d1d22',
  borderBottom: '1px solid #2a2a30',
  fontWeight: 600,
};
const td: React.CSSProperties = {
  padding: '10px 14px',
  color: '#c4c4cc',
  borderBottom: '1px solid #232329',
};

const callout: React.CSSProperties = {
  background: 'rgba(232, 200, 106, 0.07)',
  border: '1px solid rgba(232, 200, 106, 0.35)',
  borderRadius: 10,
  padding: '14px 18px',
  margin: '4px 0 14px',
};

export default function DocsPage() {
  return (
    <>
      <Navbar />
      <main className="page-container">
        <div style={{ maxWidth: 820, margin: '0 auto', padding: '32px 0' }}>
          <h1 style={{ fontSize: 40, marginBottom: 8, color: '#fff' }}>Worldforge Docs</h1>
          <p style={{ ...p, fontSize: 18 }}>
            Worldforge is a collaborative worldbuilding RPG. Explore hand-crafted zones, fight,
            build, and complete quests for NPCs. If you hold the Worldforge token, your quests pay
            out in <strong>real SOL</strong> on Solana. If you don&apos;t, you still earn in-game
            coins. This page is the complete guide to how everything works.
          </p>

          {/* ---------------- Table of contents ---------------- */}
          <section style={section}>
            <h2 style={h2}>On this page</h2>
            <a href="#what" style={tocLink}>1. What is Worldforge?</a>
            <a href="#zones" style={tocLink}>2. Zones &amp; gameplay</a>
            <a href="#earn" style={tocLink}>3. Play-to-earn: how earning works</a>
            <a href="#tiers" style={tocLink}>4. Holder tiers &amp; multipliers</a>
            <a href="#wallet" style={tocLink}>5. Connecting a wallet</a>
            <a href="#claim" style={tocLink}>6. Claiming your SOL</a>
            <a href="#fairplay" style={tocLink}>7. Fair play &amp; anti-farming</a>
            <a href="#token" style={tocLink}>8. Token status</a>
            <a href="#faq" style={tocLink}>9. FAQ</a>
          </section>

          {/* ---------------- What is Worldforge ---------------- */}
          <section id="what" style={section}>
            <h2 style={h2}>1. What is Worldforge?</h2>
            <p style={p}>
              Worldforge is a canvas-based, explorable worldbuilding RPG. You walk a living world
              made of three hand-crafted zones, talk to NPCs, take on quests, fight enemies, and —
              if you own the world — build it up with structures and props. It plays in the browser:
              there is nothing to install.
            </p>
            <p style={p}>
              The twist is the reward layer. Completing quests grants rewards, and players who hold
              the Worldforge token receive those rewards as <strong>real SOL</strong> instead of
              in-game coins. The rest of this guide explains the worlds you explore and exactly how
              earning, holding, and claiming work.
            </p>
            <Link href="/play/everhold" className="btn btn-primary btn-sm">Play now</Link>
          </section>

          {/* ---------------- Zones & gameplay ---------------- */}
          <section id="zones" style={section}>
            <h2 style={h2}>2. Zones &amp; gameplay</h2>
            <p style={p}>
              A world is made of connected zones you travel between on foot. Each has its own
              terrain, NPCs, enemies, loot, and quest line.
            </p>

            <h3 style={h3}>The Hub town</h3>
            <p style={p}>
              Your starting point. The Hub is a safe town with townsfolk to talk to, a merchant who
              runs the shop and shares news, healing spots (the well and campfire restore HP over
              time), and gateways out to the other zones. Objectives here guide you toward what to
              do next.
            </p>

            <h3 style={h3}>The Grassland (via the Northern Pass)</h3>
            <p style={p}>
              Head through the Northern Pass into orc country. The Grassland is a combat zone: an
              orc stronghold, a vendor camp, caves, ruins, and scenic points of interest to
              discover. The mission chain has you visit points of interest, clear out orcs, and
              unlock a reward chest. A shrine grants a temporary combat buff once you clear the orcs
              around it.
            </p>
            <p style={p}>
              <strong>Combat:</strong> press <strong>SPACE</strong> to attack. Enemies have real AI
              — they idle, chase, attack, and react to being hit — and damage numbers float up over
              every hit. Buy potions, tonics, and shields from vendors to survive the tougher fights.
            </p>

            <h3 style={h3}>The Seaside Village</h3>
            <p style={p}>
              A coastal settlement reached through the Docks gate. The village is full of NPCs with
              their own dialogue — shopkeepers, an elder with lore, a fortune-teller, and quest
              givers. Its signature quest, <em>Marina&apos;s Lost Necklace</em>, has you search the
              village, recover the necklace, and return it for a reward. Bandits roam the outskirts
              and wildlife wanders the fields.
            </p>

            <h3 style={h3}>Building your world</h3>
            <p style={p}>
              If you own a world, press <strong>B</strong> to open the build menu and place
              structures, props, and decorations onto walkable tiles. Rotate items with{' '}
              <strong>R</strong>. Building uses materials — Wood, Stone, and Gold — that you gather
              by playing. Everything you place is saved and persists for the next time you (and your
              visitors) enter the world.
            </p>

            <h3 style={h3}>NPCs &amp; quests</h3>
            <p style={p}>
              NPCs are the heart of the world. They run shops, tell you lore and rumors, heal you,
              and hand out quests. Most conversations offer choices (press the number keys to pick a
              response). Completing a quest is what triggers a reward — coins for everyone, and SOL
              for token holders. See the next section for the details.
            </p>
          </section>

          {/* ---------------- How earning works ---------------- */}
          <section id="earn" style={section}>
            <h2 style={h2}>3. Play-to-earn: how earning works</h2>
            <p style={p}>
              Every quest has a <strong>base reward</strong>. What you receive for completing it
              depends on whether you hold the Worldforge token:
            </p>
            <ul>
              <li style={li}>
                <strong>Token holders earn SOL.</strong> Your payout is the quest&apos;s base SOL
                amount multiplied by your <strong>holder tier</strong> (see the table below).
              </li>
              <li style={li}>
                <strong>Everyone else earns in-game coins</strong> — the same quests, the same
                progression, just no SOL until you hold the token.
              </li>
            </ul>
            <p style={p}>
              Earnings accrue <strong>automatically, server-side</strong> as you complete quests —
              there is nothing to click mid-game. Each quest pays out{' '}
              <strong>only once per account</strong>, so you can&apos;t farm the same quest twice.
              Your live tier and your claimable balance are always shown on your{' '}
              <Link href="/dashboard/earnings" style={link}>Earnings dashboard</Link>, and you
              withdraw from there (see <a href="#claim" style={link}>Claiming your SOL</a>).
            </p>
            <div style={callout}>
              <p style={{ ...p, margin: 0 }}>
                <strong>The honest version:</strong> this is a reward for playing, not an investment
                or a promise of profit. Payouts come from the project treasury and are capped by a
                daily pool — so there are no &quot;guaranteed returns&quot;. Play because the world
                is fun; the SOL is a bonus for the people who hold and play.
              </p>
            </div>
          </section>

          {/* ---------------- Tiers & multipliers ---------------- */}
          <section id="tiers" style={section}>
            <h2 style={h2}>4. Holder tiers &amp; multipliers</h2>
            <p style={p}>
              Your tier is set by <strong>how much of the total token supply your wallet holds</strong>.
              The more you hold, the higher your multiplier — up to an anti-whale cap. The total supply
              is <strong>1,000,000,000 (1B)</strong>, so the table shows both the share of supply and
              the matching token amount. We read your balance from the wallet you connect (see{' '}
              <a href="#wallet" style={link}>Connecting a wallet</a>).
            </p>
            <div style={tableWrap}>
              <table style={table}>
                <thead>
                  <tr>
                    <th style={th}>Tier</th>
                    <th style={th}>Tokens held (of 1B supply)</th>
                    <th style={th}>Reward multiplier</th>
                    <th style={th}>What it means</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={td}><strong>Non-holder</strong></td>
                    <td style={td}>under 0.001% <span style={{ color: '#8a8a93' }}>(&lt; 10K)</span></td>
                    <td style={td}>—</td>
                    <td style={td}>In-game coins only — no SOL.</td>
                  </tr>
                  <tr>
                    <td style={td}><strong>Holder</strong></td>
                    <td style={td}>0.001% – 0.25% <span style={{ color: '#8a8a93' }}>(10K – 2.5M)</span></td>
                    <td style={td}>1×</td>
                    <td style={td}>You hold the token. Quests pay base SOL.</td>
                  </tr>
                  <tr>
                    <td style={td}><strong>Bronze</strong></td>
                    <td style={td}>0.25% – 0.5% <span style={{ color: '#8a8a93' }}>(2.5M – 5M)</span></td>
                    <td style={td}>1.25×</td>
                    <td style={td}>+25% on every SOL payout.</td>
                  </tr>
                  <tr>
                    <td style={td}><strong>Silver</strong></td>
                    <td style={td}>0.5% – 1% <span style={{ color: '#8a8a93' }}>(5M – 10M)</span></td>
                    <td style={td}>1.5×</td>
                    <td style={td}>+50% on every SOL payout.</td>
                  </tr>
                  <tr>
                    <td style={td}><strong>Gold</strong></td>
                    <td style={td}>1% – 2% <span style={{ color: '#8a8a93' }}>(10M – 20M)</span></td>
                    <td style={td}>2×</td>
                    <td style={td}>Double SOL on every quest.</td>
                  </tr>
                  <tr>
                    <td style={td}><strong>Diamond</strong></td>
                    <td style={td}>2% and up <span style={{ color: '#8a8a93' }}>(20M+)</span></td>
                    <td style={td}>3×</td>
                    <td style={td}>Triple SOL — the top tier.</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p style={p}>
              The multiplier <strong>caps once a wallet holds more than 3.5% of supply (35M tokens)</strong>.
              Holding beyond that threshold does not increase your rate — this anti-whale rule keeps
              rewards spread across the community rather than concentrated in a few wallets.
            </p>
            <p style={p}>
              Reward = <strong>quest base SOL × your tier multiplier</strong>. Your current tier is
              shown live on the{' '}
              <Link href="/dashboard/earnings" style={link}>Earnings dashboard</Link>.
            </p>
          </section>

          {/* ---------------- Connect wallet ---------------- */}
          <section id="wallet" style={section}>
            <h2 style={h2}>5. Connecting a wallet</h2>
            <p style={p}>
              Click <strong>Connect Wallet</strong> in the top navigation. You have two options,
              both powered by Privy on Solana:
            </p>
            <ul>
              <li style={li}>
                <strong>Connect an existing Solana wallet</strong> — for example{' '}
                <strong>Phantom</strong> (and other supported Solana wallets). Approve the
                connection and you&apos;re in.
              </li>
              <li style={li}>
                <strong>Log in with email</strong> — Privy automatically creates a Solana embedded
                wallet for you. No browser extension or seed phrase to manage; it just works.
              </li>
            </ul>
            <p style={p}>
              Whichever you choose, that wallet does two jobs: it <strong>receives your SOL</strong>{' '}
              rewards, and it&apos;s the wallet we <strong>check for token holdings</strong> to
              determine your tier. Hold the token in the same wallet you connect.
            </p>
          </section>

          {/* ---------------- Claiming ---------------- */}
          <section id="claim" style={section}>
            <h2 style={h2}>6. Claiming your SOL</h2>
            <p style={p}>
              Earnings accrue automatically as you complete quests; claiming is how you move that
              balance into your wallet.
            </p>
            <ul>
              <li style={li}>
                Open your{' '}
                <Link href="/dashboard/earnings" style={link}>Earnings dashboard</Link> and press
                the <strong>Claim</strong> button.
              </li>
              <li style={li}>
                You can claim up to <strong>4 times per day</strong>, with each claim at least{' '}
                <strong>6 hours apart</strong>.
              </li>
              <li style={li}>
                There is a <strong>global daily reward pool</strong> shared across all players. Once
                the pool is used up for the day, claims resume the next day.
              </li>
              <li style={li}>
                You must <strong>still hold the token at claim time</strong> to receive SOL — tier
                and eligibility are checked when you claim, not just when you earned.
              </li>
              <li style={li}>
                Remember each quest pays out only once per account, so your claimable balance reflects
                quests you haven&apos;t been paid for yet.
              </li>
            </ul>
          </section>

          {/* ---------------- Fair play ---------------- */}
          <section id="fairplay" style={section}>
            <h2 style={h2}>7. Fair play &amp; anti-farming</h2>
            <p style={p}>
              To keep rewards sustainable and fair, Worldforge applies anti-farming protections. The
              goal is simple — reward real players exploring the world, not bots or exploiters.
            </p>
            <ul>
              <li style={li}>Each quest pays out <strong>once per account</strong>.</li>
              <li style={li}>New accounts have a <strong>minimum account age</strong> before their first claim.</li>
              <li style={li}>A <strong>minimum playtime</strong> is required — rewards are for actually playing.</li>
              <li style={li}>Automated, scripted, or implausibly fast play is rejected by <strong>bot and velocity checks</strong>.</li>
              <li style={li}>Daily per-player limits and the shared daily pool keep payouts within the treasury&apos;s means.</li>
            </ul>
          </section>

          {/* ---------------- Token status ---------------- */}
          <section id="token" style={section}>
            <h2 style={h2}>8. Token status</h2>
            <div style={callout}>
              <p style={{ ...p, margin: 0 }}>
                <strong>The token is not launched yet.</strong> The Contract Address (CA) is
                currently <strong>TBA</strong>. Until launch, <strong>everyone earns in-game
                coins</strong> — including would-be holders — and real SOL payouts begin once the
                token is live.
              </p>
            </div>
            <p style={p}>
              In other words: the play-to-earn mechanics, tiers, and dashboard are all real and
              working today, but the SOL switch flips on at launch. Keep playing and completing
              quests now — your progress and earned balance carry forward. When the CA goes live,
              connect a wallet that holds the token and your quests start paying SOL at your tier.
            </p>
          </section>

          {/* ---------------- FAQ ---------------- */}
          <section id="faq" style={section}>
            <h2 style={h2}>9. FAQ</h2>

            <h3 style={h3}>Do I need to hold the token to play?</h3>
            <p style={p}>
              No. Anyone can play every zone and quest for free. Holding the token is only what
              turns your quest rewards into SOL instead of in-game coins.
            </p>

            <h3 style={h3}>How is my tier decided?</h3>
            <p style={p}>
              By the percentage of total token supply held in your connected wallet: Holder (1×),
              Bronze (1.25×), Silver (1.5×), Gold (2×), Diamond (3×). The multiplier caps above 3.5%
              of supply. See <a href="#tiers" style={link}>Holder tiers</a>.
            </p>

            <h3 style={h3}>Can I earn SOL right now?</h3>
            <p style={p}>
              Not yet — the token isn&apos;t launched (CA is TBA), so everyone earns in-game coins
              for now. Real SOL payouts begin once the token is live. See{' '}
              <a href="#token" style={link}>Token status</a>.
            </p>

            <h3 style={h3}>How often can I claim?</h3>
            <p style={p}>
              Up to 4 times per day, at least 6 hours apart, subject to the global daily pool. You
              must still hold the token at claim time. See{' '}
              <a href="#claim" style={link}>Claiming your SOL</a>.
            </p>

            <h3 style={h3}>Can I farm a quest over and over for SOL?</h3>
            <p style={p}>
              No. Each quest pays out only once per account, and anti-farming checks (account age,
              playtime, and bot/velocity detection) apply. See{' '}
              <a href="#fairplay" style={link}>Fair play</a>.
            </p>

            <h3 style={h3}>I don&apos;t have a Solana wallet — can I still earn?</h3>
            <p style={p}>
              Yes. Log in with email and Privy creates a Solana embedded wallet for you
              automatically; that wallet receives your SOL and is checked for token holdings. See{' '}
              <a href="#wallet" style={link}>Connecting a wallet</a>.
            </p>

            <h3 style={h3}>Is this an investment?</h3>
            <p style={p}>
              No. Rewards are a thank-you for playing, not an investment or a promise of profit.
              Payouts depend on the treasury and the daily pool. This is not financial advice.
            </p>
          </section>

          <p style={{ ...p, fontSize: 14, color: '#888' }}>
            SOL payouts depend on the project treasury and are subject to the daily pool. Rewards are
            not an investment or a promise of profit — they&apos;re a reward for playing, and nothing
            here is financial advice.
          </p>
        </div>
      </main>
    </>
  );
}
