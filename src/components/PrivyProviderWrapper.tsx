'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { toSolanaWalletConnectors } from '@privy-io/react-auth/solana';

const solanaConnectors = toSolanaWalletConnectors();

/**
 * Wraps the app in Privy. Solana-only: external wallets (Phantom, etc.) connect
 * via the Solana connectors, and email/social logins auto-create a Solana
 * embedded wallet. If the app id isn't configured, renders children untouched.
 */
export function PrivyProviderWrapper({ children }: { children: React.ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  if (!appId) return <>{children}</>;

  return (
    <PrivyProvider
      appId={appId}
      config={{
        appearance: {
          theme: 'dark',
          accentColor: '#e8c86a',
          walletChainType: 'solana-only',
          logo: '/logo.png',
          landingHeader: 'Enter Worldforge',
        },
        loginMethods: ['wallet', 'email'],
        embeddedWallets: {
          solana: { createOnLogin: 'users-without-wallets' },
        },
        externalWallets: {
          solana: { connectors: solanaConnectors },
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
