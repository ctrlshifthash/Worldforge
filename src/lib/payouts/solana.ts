/**
 * Solana / Helius integration for token-gating + SOL payouts.
 *
 * Runs in STUB MODE until creds are present (PAYOUTS_ENABLED=true plus
 * HELIUS_RPC_URL and TREASURY_SECRET_KEY). In stub mode no funds move and
 * token balances come from STUB_TOKEN_BALANCE, so the whole flow is testable
 * locally without touching the chain.
 *
 * Live mode needs these packages installed:
 *   npm i @solana/web3.js @solana/spl-token bs58
 */
import { PAYOUT } from './config';

const LAMPORTS_PER_SOL = 1_000_000_000;

/** Can we read on-chain balances? Needs an RPC + a configured mint. */
export function canReadChain(): boolean {
  return Boolean(process.env.HELIUS_RPC_URL && PAYOUT.token.mint);
}

/** Can we actually send SOL? Needs payouts enabled, an RPC, and a funded treasury. */
export function canSendPayouts(): boolean {
  return Boolean(
    PAYOUT.enabled &&
      process.env.HELIUS_RPC_URL &&
      (process.env.TREASURY_SECRET_KEY || process.env.PRIVY_TREASURY_WALLET_ID),
  );
}

/**
 * Raw token amount (UI units) the wallet holds of the gating mint.
 * Until a mint + RPC are configured, returns STUB_TOKEN_BALANCE so you can
 * simulate holders/non-holders locally.
 */
export async function getTokenBalance(walletAddress: string): Promise<number> {
  if (!canReadChain()) {
    return Number(process.env.STUB_TOKEN_BALANCE ?? 0);
  }

  const { Connection, PublicKey } = await import('@solana/web3.js');
  const connection = new Connection(process.env.HELIUS_RPC_URL as string, 'confirmed');

  const owner = new PublicKey(walletAddress);
  const mint = new PublicKey(PAYOUT.token.mint);

  const accounts = await connection.getParsedTokenAccountsByOwner(owner, { mint });
  let total = 0;
  for (const { account } of accounts.value) {
    const amount = account.data.parsed?.info?.tokenAmount?.uiAmount;
    if (typeof amount === 'number') total += amount;
  }
  return total;
}

export interface SendResult {
  ok: boolean;
  signature?: string;
  error?: string;
}

// Priority fee so payouts land during network congestion. microLamports per
// compute unit; with the default CU limit this is a fraction of a cent.
const PRIORITY_FEE_MICROLAMPORTS = 50_000;

/**
 * Send SOL from the treasury wallet to a player wallet.
 * In stub mode returns a fake signature and moves nothing.
 *
 * On a confirmation error it still returns the signature (if obtained) so the
 * caller can verify whether the transaction actually landed before rolling back.
 */
export async function sendSol(toAddress: string, amountSol: number): Promise<SendResult> {
  if (!(amountSol > 0)) return { ok: false, error: 'amount must be positive' };

  if (!canSendPayouts()) {
    return { ok: true, signature: `STUB-${toAddress.slice(0, 6)}-${amountSol}` };
  }

  let signature: string | undefined;
  try {
    const { Connection, PublicKey, Keypair, Transaction, SystemProgram, ComputeBudgetProgram } =
      await import('@solana/web3.js');
    const bs58 = (await import('bs58')).default;

    const connection = new Connection(process.env.HELIUS_RPC_URL as string, 'confirmed');
    const treasury = Keypair.fromSecretKey(bs58.decode(process.env.TREASURY_SECRET_KEY as string));
    const to = new PublicKey(toAddress);
    const lamports = Math.round(amountSol * LAMPORTS_PER_SOL);

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
    const tx = new Transaction();
    tx.add(ComputeBudgetProgram.setComputeUnitPrice({ microLamports: PRIORITY_FEE_MICROLAMPORTS }));
    tx.add(SystemProgram.transfer({ fromPubkey: treasury.publicKey, toPubkey: to, lamports }));
    tx.feePayer = treasury.publicKey;
    tx.recentBlockhash = blockhash;
    tx.sign(treasury);

    signature = await connection.sendRawTransaction(tx.serialize(), { maxRetries: 5 });
    const conf = await connection.confirmTransaction(
      { signature, blockhash, lastValidBlockHeight },
      'confirmed',
    );
    if (conf.value.err) {
      return { ok: false, signature, error: `tx failed: ${JSON.stringify(conf.value.err)}` };
    }
    return { ok: true, signature };
  } catch (err) {
    return { ok: false, signature, error: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * Whether a transaction signature ultimately succeeded on-chain. Used to avoid
 * double-paying when confirmation timed out but the transaction actually landed.
 */
export async function getSignatureSucceeded(signature: string): Promise<boolean> {
  if (signature.startsWith('STUB-')) return true;
  if (!process.env.HELIUS_RPC_URL) return false;
  try {
    const { Connection } = await import('@solana/web3.js');
    const connection = new Connection(process.env.HELIUS_RPC_URL as string, 'confirmed');
    for (let i = 0; i < 6; i++) {
      const { value } = await connection.getSignatureStatus(signature, { searchTransactionHistory: true });
      if (value) {
        if (value.err) return false;
        if (value.confirmationStatus === 'confirmed' || value.confirmationStatus === 'finalized') return true;
      }
      await new Promise((r) => setTimeout(r, 2500));
    }
    return false;
  } catch {
    return false;
  }
}
