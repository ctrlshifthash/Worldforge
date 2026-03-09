import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getWorldBySlug } from '@/lib/queries';
import { prisma } from '@/lib/prisma';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Sign in to claim this world' }, { status: 401 });
  }

  const { slug } = await params;
  const world = await getWorldBySlug(slug);

  if (!world) {
    return NextResponse.json({ error: 'World not found' }, { status: 404 });
  }

  if (world.ownerId) {
    return NextResponse.json({ error: 'This world already has an owner' }, { status: 400 });
  }

  await prisma.world.update({
    where: { id: world.id },
    data: {
      ownerId: session.sub,
      members: {
        create: { userId: session.sub, role: 'OWNER' },
      },
    },
  });

  return NextResponse.json({ success: true });
}
