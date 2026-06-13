import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getEarningsSummary } from '@/lib/payouts/engine';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const summary = await getEarningsSummary(session.sub);
  return NextResponse.json(summary);
}
