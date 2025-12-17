import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { GroupConstraints } from '@/lib/types';

export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  const { name, constraints } = await request.json() as {
    name: string;
    constraints: GroupConstraints;
  };

  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  const session = await db.group.get(params.sessionId);

  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  if (session.status !== 'collecting') {
    return NextResponse.json({ error: 'Session is no longer accepting participants' }, { status: 400 });
  }

  const participantId = crypto.randomUUID();

  session.participants.push({
    id: participantId,
    name,
    constraints: constraints || {
      dietary: [],
      cuisineYes: [],
      cuisineNo: [],
      vibeKeywords: [],
      maxPrice: 100,
      accessibility: false,
      other: '',
    },
    joinedAt: new Date(),
  });

  await db.group.set(params.sessionId, session);

  return NextResponse.json({
    participantId,
    session,
  });
}
