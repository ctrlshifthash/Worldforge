import Link from 'next/link';
import { getSession } from '@/lib/auth';

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
