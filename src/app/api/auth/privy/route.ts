import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/utils';
import { verifyPrivyToken } from '@/lib/privy-server';
import { createSessionToken, setSessionCookie } from '@/lib/auth';

/**
 * Auth bridge: the client logs in with Privy, then posts its access token here.
 * We verify it, find-or-create the matching User (keyed on Privy DID), store the
 * linked Solana wallet, and issue our own session cookie so getSession() works
 * everywhere unchanged.
 */
export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization');
  const headerToken = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
  const body = await req.json().catch(() => ({}));
  const token = headerToken || body?.token;
  if (!token) return NextResponse.json({ error: 'missing_token' }, { status: 400 });

  const identity = await verifyPrivyToken(token);
  if (!identity) return NextResponse.json({ error: 'invalid_token' }, { status: 401 });

  // Find an existing account: by Privy DID first, then wallet, then email.
  let user = await prisma.user.findUnique({ where: { privyId: identity.privyId } });
  if (!user && identity.walletAddress) {
    user = await prisma.user.findUnique({ where: { walletAddress: identity.walletAddress } });
  }
  if (!user && identity.email) {
    user = await prisma.user.findUnique({ where: { email: identity.email } });
  }

  if (user) {
    // Backfill Privy id / wallet on an existing account.
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        privyId: identity.privyId,
        walletAddress: identity.walletAddress ?? user.walletAddress,
      },
    });
  } else {
    // New account. Synthesize email/username for wallet-only logins.
    const email = identity.email ?? `${identity.privyId.replace(/[^a-z0-9]/gi, '')}@privy.local`;
    const base = identity.walletAddress
      ? `wallet-${identity.walletAddress.slice(0, 6)}`
      : slugify(email.split('@')[0] || 'player');
    const username = `${base}-${identity.privyId.slice(-5)}`.toLowerCase();
    const name = identity.walletAddress
      ? `${identity.walletAddress.slice(0, 4)}…${identity.walletAddress.slice(-4)}`
      : email.split('@')[0];

    user = await prisma.user.create({
      data: {
        email,
        username,
        name,
        privyId: identity.privyId,
        walletAddress: identity.walletAddress,
        passwordHash: null,
      },
    });
  }

  const sessionToken = await createSessionToken({ sub: user.id, email: user.email, name: user.name });
  await setSessionCookie(sessionToken);

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      walletAddress: user.walletAddress,
    },
  });
}
