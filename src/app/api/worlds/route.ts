import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { createWorld, getWorlds } from '@/lib/queries';

export async function GET() {
  const session = await getSession();
  const worlds = await getWorlds(session?.sub);
  return NextResponse.json({ worlds });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const world = await createWorld({
    title: body.title || 'Untitled World',
    tagline: body.tagline || 'A new world takes shape.',
    description: body.description || '',
    visibility: body.visibility === 'PUBLIC' ? 'PUBLIC' : 'PRIVATE',
    ownerId: session.sub,
    coverGradient: body.coverGradient,
  });

  return NextResponse.json({ world }, { status: 201 });
}
