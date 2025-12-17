import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { GroupConstraints } from '@/lib/types';

export async function PUT(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  const { participantId, constraints } = await request.json() as {
    participantId: string;
    constraints: GroupConstraints;
  };

  const session = await db.group.get(params.sessionId);

  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  const participant = session.participants.find(p => p.id === participantId);

  if (!participant) {
    return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
  }

  participant.constraints = constraints;

  await db.group.set(params.sessionId, session);

  return NextResponse.json({ success: true, session });
}
