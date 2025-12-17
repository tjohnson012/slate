import { NextRequest } from 'next/server';
import { EveningPlanner } from '@/lib/planner';
import { VibeVector } from '@/lib/types';

interface UserVibeProfile {
  id: string;
  vibeVector: VibeVector;
  favoritePhotos: string[];
}

export async function POST(request: NextRequest) {
  const { prompt, userVibeProfile } = await request.json() as {
    prompt?: string;
    userVibeProfile?: UserVibeProfile;
  };

  if (!prompt) {
    return new Response(JSON.stringify({ error: 'Prompt is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const planner = new EveningPlanner(
        (event) => {
          const data = `data: ${JSON.stringify(event)}\n\n`;
          controller.enqueue(encoder.encode(data));
        },
        userVibeProfile
      );

      try {
        const plan = await planner.createPlan(prompt);
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'final', plan })}\n\n`));
      } catch (err) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'error',
          message: err instanceof Error ? err.message : 'Planning failed',
          timestamp: new Date(),
        })}\n\n`));
      }

      controller.close();
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
