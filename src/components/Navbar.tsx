/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { ConnectWallet } from '@/components/ConnectWallet';

const NAV_SOCIALS = [
  { name: 'Pump.fun', href: 'https://pump.fun/coin/8QZJYXVU2SUi3qesyGrHyTj21JSrs5xpLReTC1CLpump', img: '/socials/pumpfun.png' },
  { name: 'X', href: 'https://x.com/Playworldcraft', img: '/socials/x.png' },
  { name: 'GitHub', href: 'https://github.com/playWorldcraft/Worldcraft', img: '/socials/github.png' },
];

export async function Navbar() {
  const session = await getSession();

  return (
    <nav className="navbar">
      <Link href="/" className="navbar-brand">
        <img src="/logo.png" alt="Worldcraft" width={28} height={28} className="navbar-brand-logo" />
        Worldcraft
      </Link>

      <div className="navbar-center">
        <Link href="/" className="navbar-link">Home</Link>
        <Link href="/about" className="navbar-link">About</Link>
        <Link href="/how-it-works" className="navbar-link">How It Works</Link>
        <Link href="/docs" className="navbar-link">Docs</Link>
        <Link href="/play/everhold" className="navbar-link">Play</Link>
        <Link href="/discover" className="navbar-link">Discover</Link>
        {session && <Link href="/dashboard" className="navbar-link">Dashboard</Link>}
        {session && <Link href="/dashboard/earnings" className="navbar-link">Earnings</Link>}
      </div>

      <div className="navbar-right">
        <div className="navbar-socials">
          {NAV_SOCIALS.map((s) => (
            <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer" className="navbar-social" title={s.name}>
              <img src={s.img} alt={s.name} width={20} height={20} />
            </a>
          ))}
        </div>
        {session && (
          <Link href="/dashboard" className="navbar-user" title="Dashboard">
            <div className="navbar-avatar">
              {session.name?.charAt(0)?.toUpperCase()}
            </div>
          </Link>
        )}
        <ConnectWallet />
      </div>
    </nav>
  );
}
