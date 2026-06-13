/**
 * Server-side Privy: verify a user's access token and resolve their identity
 * (Privy DID + linked Solana wallet + email). Used by the auth bridge that
 * issues our own session cookie, so the rest of the app keeps using getSession().
 */
import { PrivyClient } from '@privy-io/server-auth';

let client: PrivyClient | null = null;

function getClient(): PrivyClient | null {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  const secret = process.env.PRIVY_APP_SECRET;
  if (!appId || !secret) return null;
  if (!client) client = new PrivyClient(appId, secret);
  return client;
}

export interface PrivyIdentity {
  privyId: string;
  walletAddress: string | null;
  email: string | null;
}

export async function verifyPrivyToken(token: string): Promise<PrivyIdentity | null> {
  const privy = getClient();
  if (!privy) return null;

  try {
    const claims = await privy.verifyAuthToken(token);
    const user = await privy.getUser(claims.userId);

    let walletAddress: string | null = null;
    let email: string | null = null;

    for (const acct of user.linkedAccounts) {
      // First linked Solana wallet wins (embedded or external).
      if (acct.type === 'wallet' && 'chainType' in acct && acct.chainType === 'solana' && !walletAddress) {
        walletAddress = acct.address;
      }
      if (acct.type === 'email' && 'address' in acct && !email) {
        email = acct.address as string;
      }
    }

    // Fallback: the user's primary embedded wallet, if it's Solana.
    if (!walletAddress && user.wallet && 'chainType' in user.wallet && user.wallet.chainType === 'solana') {
      walletAddress = user.wallet.address;
    }

    return { privyId: claims.userId, walletAddress, email };
  } catch {
    return null;
  }
}
