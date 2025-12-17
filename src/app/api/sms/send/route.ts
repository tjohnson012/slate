import { NextRequest, NextResponse } from 'next/server';
import { sms } from '@/lib/sms';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  const { to, message, context } = await request.json() as {
    to: string;
    message: string;
    context?: {
      type: 'confirm_booking' | 'accept_opportunity' | 'group_invite';
      data: Record<string, unknown>;
    };
  };

  if (!to || !message) {
    return NextResponse.json({ error: 'Missing to or message' }, { status: 400 });
  }

  try {
    const sid = await sms.send(to, message);

    if (context) {
      await db.sms.setState(to, {
        userId: to,
        awaitingResponse: true,
        pendingAction: context,
        lastMessageAt: new Date(),
      });
    }

    return NextResponse.json({ success: true, sid });
  } catch (err) {
    return NextResponse.json({
      error: err instanceof Error ? err.message : 'Failed to send',
    }, { status: 500 });
  }
}
