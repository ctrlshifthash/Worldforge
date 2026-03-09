import { NextResponse } from 'next/server';
import { getWorldBySlug, getActivity } from '@/lib/queries';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const world = await getWorldBySlug(slug);
  if (!world) {
    return NextResponse.json({ error: 'World not found' }, { status: 404 });
  }

  const activity = await getActivity(world.id);
  return NextResponse.json({ activity });
}
