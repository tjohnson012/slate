import { VoiceAgentConfig, CallResult, TranscriptEntry } from './types';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_AGENT_ID = process.env.ELEVENLABS_AGENT_ID;

export function generateAgentPrompt(config: VoiceAgentConfig): string {
  return `You are a friendly, professional assistant calling to make a restaurant reservation on behalf of ${config.guestName}.

GOAL: Book a table at ${config.restaurantName} for ${config.partySize} people on ${config.requestedDate} at ${config.requestedTime}.

PERSONALITY:
- Warm and polite, never pushy
- Speak naturally, not robotic
- Use conversational fillers like "great", "perfect", "wonderful"
- Be patient if they put you on hold

CONVERSATION FLOW:

1. GREETING:
"Hi! I'm calling to make a reservation for ${config.requestedDate}. Do you have availability for ${config.partySize} at ${config.requestedTime}?"

2. IF AVAILABLE:
"Perfect! The reservation would be under ${config.guestName}. And could I get a confirmation number?"

3. IF NOT AVAILABLE:
${config.flexibility.acceptAlternatives
  ? `"What times do you have available around then? We're flexible within about ${config.flexibility.timeRange} minutes either way."`
  : `"Ah that's too bad. Thank you anyway, have a great day!"`
}

4. IF OFFERED ALTERNATIVE:
Evaluate if it's within ${config.flexibility.timeRange} minutes of requested time.
If yes: "That works! Let's do that."
If no: "Unfortunately that's a bit too far from what we need. Thank you though!"

5. CLOSING:
"Thank you so much! We're looking forward to it. Have a great day!"

CRITICAL RULES:
- Never make up a confirmation number. Only repeat what they tell you.
- If you can't hear them clearly, say "I'm sorry, could you repeat that?"
- If they ask for a callback number, provide: ${config.phoneCallback}
- Keep responses concise - this is a phone call, not a chat
- If they seem confused about who's calling, explain: "I'm an AI assistant calling on behalf of ${config.guestName} to make a reservation."

INFORMATION TO EXTRACT:
- Confirmation number (required if booking succeeds)
- Exact time confirmed
- Any special notes (parking validation, dress code, etc.)
`;
}

export async function createVoiceAgent(config: VoiceAgentConfig): Promise<{
  agentId: string;
  sessionToken: string;
}> {
  if (!ELEVENLABS_API_KEY || !ELEVENLABS_AGENT_ID) {
    throw new Error('ElevenLabs API credentials not configured');
  }

  const response = await fetch('https://api.elevenlabs.io/v1/convai/conversation', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ELEVENLABS_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      agent_id: ELEVENLABS_AGENT_ID,
      conversation_config_override: {
        agent: {
          prompt: {
            prompt: generateAgentPrompt(config),
          },
          first_message: `Hi! I'm calling to make a reservation for ${config.requestedDate}. Do you have availability for ${config.partySize} at ${config.requestedTime}?`,
        },
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`ElevenLabs API error: ${response.status}`);
  }

  const data = await response.json();
  return {
    agentId: data.agent_id,
    sessionToken: data.session_token,
  };
}

export function extractCallResult(transcript: TranscriptEntry[]): CallResult {
  const fullText = transcript.map(t => t.text).join(' ').toLowerCase();

  const successPhrases = [
    'confirmed', 'booked', 'reservation is set', 'see you then',
    'looking forward', 'all set', 'got you down'
  ];
  const success = successPhrases.some(phrase => fullText.includes(phrase));

  const confPatterns = [
    /confirmation (?:number |#)?([A-Z0-9-]+)/i,
    /conf(?:irmation)? #?\s*([A-Z0-9-]+)/i,
    /your number is ([A-Z0-9-]+)/i,
    /reference (?:number )?([A-Z0-9-]+)/i,
  ];

  let confirmationNumber: string | undefined;
  for (const pattern of confPatterns) {
    const match = fullText.match(pattern);
    if (match) {
      confirmationNumber = match[1].toUpperCase();
      break;
    }
  }

  const timePattern = /(\d{1,2}):?(\d{2})?\s*(am|pm|o'clock)?/gi;
  const times = fullText.match(timePattern);
  const confirmedTime = times?.[times.length - 1];

  const failurePhrases = [
    'fully booked', 'no availability', 'not available', 'closed',
    'don\'t have', 'can\'t accommodate', 'unfortunately'
  ];
  const failed = failurePhrases.some(phrase => fullText.includes(phrase)) && !success;

  const notes: string[] = [];
  if (fullText.includes('parking')) notes.push('Parking available');
  if (fullText.includes('dress code') || fullText.includes('jacket')) notes.push('Dress code mentioned');
  if (fullText.includes('patio') || fullText.includes('outdoor')) notes.push('Outdoor seating discussed');
  if (fullText.includes('corner') || fullText.includes('window')) notes.push('Special seating noted');

  return {
    success: success && !failed,
    confirmationNumber,
    confirmedTime,
    notes: notes.length > 0 ? notes.join('. ') : undefined,
    failureReason: failed ? 'No availability' : undefined,
  };
}
