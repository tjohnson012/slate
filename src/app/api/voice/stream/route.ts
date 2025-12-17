import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { VoiceCall } from '@/lib/types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const callId = searchParams.get('callId');

  if (!callId) {
    return new Response('Missing callId', { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let lastStatus = '';
      let lastTranscriptLength = 0;
      let attempts = 0;
      const maxAttempts = 120;

      const poll = async () => {
        if (attempts >= maxAttempts) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'timeout' })}\n\n`));
          controller.close();
          return;
        }
        attempts++;

        const call = await db.get<VoiceCall>(`call:${callId}`);

        if (!call) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: 'Call not found' })}\n\n`));
          controller.close();
          return;
        }

        if (call.status !== lastStatus) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'status', status: call.status })}\n\n`));
          lastStatus = call.status;
        }

        if (call.transcript.length > lastTranscriptLength) {
          const newEntries = call.transcript.slice(lastTranscriptLength);
          for (const entry of newEntries) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'transcript', entry })}\n\n`));
          }
          lastTranscriptLength = call.transcript.length;
        }

        if (call.status === 'completed' && call.result) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'result', result: call.result })}\n\n`));
          controller.close();
          return;
        }

        if (call.status === 'failed') {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'failed' })}\n\n`));
          controller.close();
          return;
        }

        setTimeout(poll, 500);
      };

      poll();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
