import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { processClaim } from '@/lib/payouts/engine';

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const result = await processClaim(session.sub);
  if (!result.ok) return NextResponse.json(result, { status: 400 });
  return NextResponse.json(result);
}
