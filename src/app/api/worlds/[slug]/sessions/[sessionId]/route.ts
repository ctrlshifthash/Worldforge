import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getCharacterSession, updateCharacterSession, logActivity } from '@/lib/queries';
import type { SessionStatus } from '@prisma/client';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string; sessionId: string }> }
) {
  const { sessionId } = await params;
  const session = await getCharacterSession(sessionId);
  if (!session) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(session);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string; sessionId: string }> }
) {
  const auth = await getSession();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { sessionId } = await params;
  const body = await request.json();

  const updateData: Record<string, unknown> = {};
  if (body.status) updateData.status = body.status as SessionStatus;
  if (body.personalityPrompt !== undefined) updateData.personalityPrompt = body.personalityPrompt;
  if (body.constraints !== undefined) updateData.constraints = body.constraints;
  if (body.frequency !== undefined) updateData.frequency = body.frequency;
  if (body.contextSummary !== undefined) updateData.contextSummary = body.contextSummary;

  const updated = await updateCharacterSession(sessionId, updateData);
  return NextResponse.json(updated);
}
