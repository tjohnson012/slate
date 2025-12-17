import { VoiceCall, VoiceAgentConfig, CallResult } from './types';
import { db } from './db';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

async function getTwilioClient() {
  const twilio = await import('twilio');
  return twilio.default(accountSid, authToken);
}

export async function initiateCall(
  restaurantPhone: string,
  config: VoiceAgentConfig
): Promise<VoiceCall> {
  const callId = crypto.randomUUID();

  const call: VoiceCall = {
    id: callId,
    status: 'initiating',
    restaurantName: config.restaurantName,
    restaurantPhone,
    requestedDate: config.requestedDate,
    requestedTime: config.requestedTime,
    partySize: config.partySize,
    transcript: [],
    startedAt: new Date(),
  };

  await db.set(`call:${callId}`, call, 3600);

  if (!accountSid || !authToken || !twilioNumber) {
    call.status = 'dialing';
    await db.set(`call:${callId}`, call, 3600);
    return call;
  }

  const client = await getTwilioClient();

  const twilioCall = await client.calls.create({
    to: restaurantPhone,
    from: twilioNumber,
    url: `${process.env.NEXT_PUBLIC_APP_URL}/api/voice/webhook?callId=${callId}`,
    statusCallback: `${process.env.NEXT_PUBLIC_APP_URL}/api/voice/status?callId=${callId}`,
    statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
    record: true,
  });

  call.status = 'dialing';
  await db.set(`call:${callId}`, call, 3600);
  await db.set(`twilio:${twilioCall.sid}`, callId, 3600);

  return call;
}

export async function getCallStatus(callId: string): Promise<VoiceCall | null> {
  return db.get<VoiceCall>(`call:${callId}`);
}

export async function addTranscriptEntry(
  callId: string,
  entry: { speaker: 'agent' | 'restaurant'; text: string }
): Promise<void> {
  const call = await db.get<VoiceCall>(`call:${callId}`);
  if (!call) return;

  call.transcript.push({
    ...entry,
    timestamp: new Date(),
  });

  await db.set(`call:${callId}`, call, 3600);
}

export async function updateCallStatus(
  callId: string,
  status: VoiceCall['status']
): Promise<void> {
  const call = await db.get<VoiceCall>(`call:${callId}`);
  if (!call) return;

  call.status = status;
  await db.set(`call:${callId}`, call, 3600);
}

export async function completeCall(
  callId: string,
  result: CallResult,
  duration: number
): Promise<VoiceCall> {
  const call = await db.get<VoiceCall>(`call:${callId}`);
  if (!call) throw new Error('Call not found');

  call.status = 'completed';
  call.result = result;
  call.duration = duration;
  call.completedAt = new Date();

  await db.set(`call:${callId}`, call, 86400);

  return call;
}

export async function simulateCall(
  restaurantPhone: string,
  config: VoiceAgentConfig
): Promise<VoiceCall> {
  const callId = crypto.randomUUID();

  const call: VoiceCall = {
    id: callId,
    status: 'initiating',
    restaurantName: config.restaurantName,
    restaurantPhone,
    requestedDate: config.requestedDate,
    requestedTime: config.requestedTime,
    partySize: config.partySize,
    transcript: [],
    startedAt: new Date(),
  };

  await db.set(`call:${callId}`, call, 3600);

  setTimeout(async () => {
    call.status = 'dialing';
    await db.set(`call:${callId}`, call, 3600);
  }, 500);

  setTimeout(async () => {
    call.status = 'ringing';
    await db.set(`call:${callId}`, call, 3600);
  }, 1500);

  setTimeout(async () => {
    call.status = 'connected';
    call.transcript.push({
      speaker: 'agent',
      text: `Hi! I'm calling to make a reservation for ${config.requestedDate}. Do you have availability for ${config.partySize} at ${config.requestedTime}?`,
      timestamp: new Date(),
    });
    await db.set(`call:${callId}`, call, 3600);
  }, 3000);

  setTimeout(async () => {
    call.transcript.push({
      speaker: 'restaurant',
      text: `Yes, we can do ${config.requestedTime} for ${config.partySize}. What name for the reservation?`,
      timestamp: new Date(),
    });
    await db.set(`call:${callId}`, call, 3600);
  }, 5000);

  setTimeout(async () => {
    call.transcript.push({
      speaker: 'agent',
      text: `Perfect! The reservation would be under ${config.guestName}.`,
      timestamp: new Date(),
    });
    await db.set(`call:${callId}`, call, 3600);
  }, 7000);

  setTimeout(async () => {
    call.transcript.push({
      speaker: 'restaurant',
      text: `Got it. You're all set for ${config.requestedTime}. Your confirmation number is ${Math.random().toString(36).substring(2, 8).toUpperCase()}.`,
      timestamp: new Date(),
    });
    await db.set(`call:${callId}`, call, 3600);
  }, 9000);

  setTimeout(async () => {
    call.transcript.push({
      speaker: 'agent',
      text: 'Thank you so much! We\'re looking forward to it. Have a great day!',
      timestamp: new Date(),
    });
    await db.set(`call:${callId}`, call, 3600);
  }, 11000);

  setTimeout(async () => {
    const confNum = call.transcript
      .find(t => t.text.includes('confirmation'))
      ?.text.match(/([A-Z0-9]{6})/)?.[1];

    call.status = 'completed';
    call.completedAt = new Date();
    call.duration = 15;
    call.result = {
      success: true,
      confirmationNumber: confNum,
      confirmedTime: config.requestedTime,
      confirmedPartySize: config.partySize,
    };
    await db.set(`call:${callId}`, call, 86400);
  }, 13000);

  return call;
}
