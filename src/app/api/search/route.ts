import { NextResponse } from 'next/server';
import { getWorldBySlug, searchEntities } from '@/lib/queries';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const worldSlug = url.searchParams.get('world');
  const query = url.searchParams.get('q') || '';

  if (!worldSlug) {
    return NextResponse.json({ error: 'Missing ?world= parameter' }, { status: 400 });
  }

  const world = await getWorldBySlug(worldSlug);
  if (!world) {
    return NextResponse.json({ error: 'World not found' }, { status: 404 });
  }

  const results = await searchEntities(world.id, query);
  return NextResponse.json({ results });
}
