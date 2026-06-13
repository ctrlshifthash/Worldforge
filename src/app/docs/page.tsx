import type { Metadata } from 'next';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Docs — Worldforge',
  description:
    'How Worldforge works: explore living worlds, complete quests, and earn real SOL by holding the token.',
};

const section: React.CSSProperties = {
  background: '#16161a',
  border: '1px solid #2a2a30',
  borderRadius: 14,
  padding: '24px 28px',
  marginBottom: 20,
};

const h2: React.CSSProperties = { fontSize: 22, margin: '0 0 12px', color: '#f0e6c8' };
const p: React.CSSProperties = { color: '#c4c4cc', lineHeight: 1.7, margin: '0 0 12px' };
const li: React.CSSProperties = { color: '#c4c4cc', lineHeight: 1.7, marginBottom: 6 };

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
            out in <strong>real SOL</strong>. If you don&apos;t, you still earn in-game coins.
          </p>

          <section style={section}>
            <h2 style={h2}>What is Worldforge?</h2>
            <p style={p}>
              A canvas-based explorable world with three zones — the Hub town, the Grassland (orcs,
              combat, a mission chain), and the Seaside Village (bandits, wildlife, and Marina&apos;s
              Lost Necklace quest). Owners can place buildings and props to grow their settlement.
              NPCs offer quests, shops, lore, and dialogue.
            </p>
            <Link href="/play/everhold" className="btn btn-primary btn-sm">Play now</Link>
          </section>

          <section style={section}>
            <h2 style={h2}>Connect your wallet</h2>
            <p style={p}>
              Click <strong>Connect Wallet</strong> in the top navigation. You can connect an
              existing Solana wallet (Phantom and others) or log in with email — Privy will create a
              Solana embedded wallet for you automatically. This wallet is where your SOL rewards are
              sent and where we check your token holdings.
            </p>
          </section>

          <section style={section}>
            <h2 style={h2}>How earning works</h2>
            <p style={p}>
              Every quest has a base reward. <strong>Token holders earn SOL</strong>; everyone else
              earns in-game coins. Your SOL reward is the quest&apos;s base amount multiplied by your
              <strong> holder tier</strong>, which scales with how much of the token supply your
              wallet holds:
            </p>
            <ul>
              <li style={li}><strong>Holder</strong> — base multiplier (1×)</li>
              <li style={li}><strong>Bronze / Silver / Gold / Diamond</strong> — progressively higher multipliers the more you hold</li>
              <li style={li}>The multiplier <strong>caps at 3.5% of supply</strong> per wallet — holding more than that doesn&apos;t increase your rate</li>
            </ul>
            <p style={p}>
              Each quest pays out <strong>once per account</strong>. Your live tier and claimable
              balance are always shown on your <Link href="/dashboard/earnings" style={{ color: '#e8c86a' }}>Earnings dashboard</Link>.
            </p>
          </section>

          <section style={section}>
            <h2 style={h2}>Claiming your SOL</h2>
            <ul>
              <li style={li}>Earnings accrue automatically as you complete quests.</li>
              <li style={li}>Withdraw from the Earnings dashboard with the <strong>Claim</strong> button.</li>
              <li style={li}>You can claim up to <strong>4 times per day</strong>, at least <strong>6 hours apart</strong>.</li>
              <li style={li}>There is a <strong>daily reward pool</strong> shared across all players; once it&apos;s used up for the day, claims resume the next day.</li>
              <li style={li}>You must still hold the token at claim time to receive SOL.</li>
            </ul>
          </section>

          <section style={section}>
            <h2 style={h2}>Fair play</h2>
            <p style={p}>
              To keep rewards sustainable, Worldforge applies anti-farming rules: quests pay once per
              account, new accounts have a short waiting period before their first claim, automated
              or implausibly fast play is rejected, and daily per-player and global limits apply. The
              goal is simple — reward real players exploring the world, not bots.
            </p>
          </section>

          <p style={{ ...p, fontSize: 14, color: '#888' }}>
            SOL payouts depend on the project treasury and are subject to the daily pool. Rewards are
            not an investment or a promise of profit — they&apos;re a reward for playing.
          </p>
        </div>
      </main>
    </>
  );
}
