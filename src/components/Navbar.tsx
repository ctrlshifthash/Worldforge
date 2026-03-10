/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { getSession } from '@/lib/auth';

const NAV_SOCIALS = [
  { name: 'Pump.fun', href: 'https://pump.fun/coin/', img: '/socials/pumpfun.png' },
  { name: 'X', href: 'https://x.com/PlayWorldforge', img: '/socials/x.png' },
  { name: 'GitHub', href: 'https://github.com/PlayWorldforge/Worldforge', img: '/socials/github.png' },
  { name: 'GitBook', href: 'https://worldforge.gitbook.io/worldforge', img: '/socials/gitbook.png' },
  { name: 'Medium', href: 'https://medium.com/@Worldforge', img: '/socials/medium.png' },
];

export async function Navbar() {
  const session = await getSession();

  return (
    <nav className="navbar">
      <Link href="/" className="navbar-brand">
        <span className="navbar-brand-mark">W</span>
        Worldforge
      </Link>

      <div className="navbar-center">
        <Link href="/" className="navbar-link">Home</Link>
        <Link href="/play/everhold" className="navbar-link">Play</Link>
        <Link href="/discover" className="navbar-link">Discover</Link>
        <Link href="/how-it-works" className="navbar-link">How It Works</Link>
        <Link href="/about" className="navbar-link">About</Link>
        {session && <Link href="/dashboard" className="navbar-link">Dashboard</Link>}
      </div>

      <div className="navbar-right">
        <div className="navbar-socials">
          {NAV_SOCIALS.map((s) => (
            <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer" className="navbar-social" title={s.name}>
              <img src={s.img} alt={s.name} width={20} height={20} />
            </a>
          ))}
        </div>
        {session ? (
          <Link href="/dashboard" className="navbar-user">
            <div className="navbar-avatar">
              {session.name?.charAt(0)?.toUpperCase()}
            </div>
            <span className="navbar-user-name">{session.name}</span>
          </Link>
        ) : (
          <>
            <Link href="/login" className="btn btn-ghost btn-sm">
              Sign In
            </Link>
            <Link href="/register" className="btn btn-primary btn-sm">
              Play Now
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
