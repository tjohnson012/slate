import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sms, parseInboundSMS } from '@/lib/sms';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const body = formData.get('Body')?.toString() || '';
  const from = formData.get('From')?.toString() || '';

  const parsed = parseInboundSMS(body);

  const conversationState = await db.sms.getState(from);

  if (!conversationState?.pendingAction) {
    await sms.send(from, "Hey! I don't have anything pending for you. Start planning at slate.app");
    return generateTwimlResponse();
  }

  const { type, data } = conversationState.pendingAction;

  if (type === 'confirm_booking' && parsed.isConfirmation) {
    await sms.send(from, `Confirmed! Your reservation is all set. See your itinerary at slate.app/plan/${data.planId}`);
    await db.sms.clearState(from);
  } else if (type === 'accept_opportunity') {
    if (parsed.isConfirmation) {
      await sms.send(from, `Great choice! Booking ${data.restaurantName} for ${data.time}. I'll confirm shortly.`);
    } else {
      await sms.send(from, `No problem. I'll keep looking for spots that match your vibe.`);
    }
    await db.sms.clearState(from);
  } else if (type === 'group_invite') {
    if (parsed.isConfirmation) {
      await sms.send(from, `You're in! Add your preferences here: slate.app/group/${data.sessionId}`);
    } else {
      await sms.send(from, `Got it, maybe next time!`);
    }
    await db.sms.clearState(from);
  }

  return generateTwimlResponse();
}

function generateTwimlResponse() {
  return new NextResponse(
    '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
    {
      headers: { 'Content-Type': 'text/xml' },
    }
  );
}
