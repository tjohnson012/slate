import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  const session = await db.group.get(params.sessionId);

  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  return NextResponse.json(session);
}
