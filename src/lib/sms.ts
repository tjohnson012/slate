import { EveningPlan, ProactiveOpportunity, GroupSession } from './types';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

export async function sendSMS(to: string, body: string): Promise<string> {
  if (!accountSid || !authToken || !fromNumber) {
    console.log('[SMS Mock]', to, body);
    return 'mock-sid';
  }

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: to,
        From: fromNumber,
        Body: body,
      }),
    }
  );

  const data = await response.json();
  return data.sid;
}

export function formatProactiveOpportunity(opp: ProactiveOpportunity): string {
  return `Hey! That ${opp.restaurant.categories[0]} spot you'd love just opened up: ${opp.restaurant.name}, ${opp.availableSlot.time} ${opp.availableSlot.date}. ${opp.vibeMatchScore}% your vibe. Want it? Reply YES or NO`;
}

export function formatPlanConfirmation(plan: EveningPlan): string {
  const lines = ['Your evening is set!\n'];

  for (const stop of plan.stops) {
    const status = stop.booking.status === 'confirmed'
      ? `Confirmed ${stop.booking.confirmationNumber || ''}`
      : 'Walk-in';

    lines.push(`${stop.time} - ${stop.restaurant.name}`);
    lines.push(`${stop.restaurant.location.address}`);
    lines.push(status);
    lines.push('');
  }

  if (plan.totalEstimatedCost) {
    lines.push(`Est. total: $${plan.totalEstimatedCost}`);
  }

  return lines.join('\n');
}

export function formatGroupInvite(session: GroupSession, inviteUrl: string): string {
  return `You're invited to plan dinner! Add your preferences here: ${inviteUrl}\n\n${session.participants.length} people already in.`;
}

export function formatGroupResult(session: GroupSession): string {
  if (!session.solution) {
    return `Couldn't find a spot that works for everyone. Try adjusting constraints?`;
  }

  return `Found it! ${session.solution.name} works for all ${session.participants.length} of you.\n\n${session.solution.location.address}\n\nBooking ${session.time} for ${session.participants.length}. Reply YES to confirm.`;
}

export function parseInboundSMS(body: string): {
  intent: 'confirm' | 'decline' | 'unknown';
  confidence: number;
  isConfirmation: boolean;
} {
  const lower = body.toLowerCase().trim();

  const confirmWords = ['yes', 'yep', 'yeah', 'y', 'sure', 'ok', 'okay', 'book it', 'do it', 'confirm'];
  const declineWords = ['no', 'nope', 'nah', 'n', 'pass', 'skip', 'cancel'];

  if (confirmWords.some(w => lower === w || lower.startsWith(w + ' '))) {
    return { intent: 'confirm', confidence: 1, isConfirmation: true };
  }

  if (declineWords.some(w => lower === w || lower.startsWith(w + ' '))) {
    return { intent: 'decline', confidence: 1, isConfirmation: false };
  }

  return { intent: 'unknown', confidence: 0, isConfirmation: false };
}

export const sms = {
  send: sendSMS,
};
