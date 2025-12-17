import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { GroupSession } from '@/lib/types';

export async function POST(request: NextRequest) {
  const { creatorName, date, time, location } = await request.json() as {
    creatorName: string;
    date: string;
    time: string;
    location: string;
  };

  if (!creatorName || !date || !time || !location) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const sessionId = crypto.randomUUID().slice(0, 8);
  const creatorId = crypto.randomUUID();

  const session: GroupSession = {
    id: sessionId,
    creatorId,
    status: 'collecting',
    date,
    time,
    location,
    participants: [{
      id: creatorId,
      name: creatorName,
      constraints: {
        dietary: [],
        cuisineYes: [],
        cuisineNo: [],
        vibeKeywords: [],
        maxPrice: 100,
        accessibility: false,
        other: '',
      },
      joinedAt: new Date(),
    }],
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  };

  await db.group.set(sessionId, session);

  return NextResponse.json({
    sessionId,
    creatorId,
    joinUrl: `/group/${sessionId}`,
  });
}
