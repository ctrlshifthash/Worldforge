import { NextResponse } from 'next/server';
import { getWorldBySlug, getDevelopments, getPendingDevelopmentCount } from '@/lib/queries';
import type { DevelopmentStatus } from '@prisma/client';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const world = await getWorldBySlug(slug);
  if (!world) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const url = new URL(request.url);
  const status = url.searchParams.get('status') as DevelopmentStatus | null;

  const [developments, pendingCount] = await Promise.all([
    getDevelopments(world.id, status || undefined),
    getPendingDevelopmentCount(world.id),
  ]);

  return NextResponse.json({ developments, pendingCount });
}
