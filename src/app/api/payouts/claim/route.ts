import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { getSession } from '@/lib/auth';
import { processClaim } from '@/lib/payouts/engine';

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  try {
    const result = await processClaim(session.sub);
    if (!result.ok) return NextResponse.json(result, { status: 400 });
    return NextResponse.json(result);
  } catch (err) {
    // Claims move real SOL — make sure any unexpected failure is reported.
    console.error('[payouts/claim] failed:', err);
    Sentry.captureException(err, { tags: { route: 'payouts/claim' }, user: { id: session.sub } });
    return NextResponse.json({ ok: false, error: 'claim_failed' }, { status: 500 });
  }
}
