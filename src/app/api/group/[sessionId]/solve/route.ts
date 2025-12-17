import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { GroupConstraintSolver } from '@/lib/group-solver';

export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  const { sessionId } = params;
  const session = await db.group.get(sessionId);

  if (!session) {
    return new Response(JSON.stringify({ error: 'Session not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      session.status = 'solving';
      await db.group.set(sessionId, session);

      const solver = new GroupConstraintSolver((event) => {
        const data = `data: ${JSON.stringify(event)}\n\n`;
        controller.enqueue(encoder.encode(data));
      });

      try {
        const result = await solver.solve(session);

        session.status = result.solution ? 'solved' : 'collecting';
        session.solution = result.solution || undefined;
        await db.group.set(sessionId, session);

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'final',
          result,
          session,
        })}\n\n`));
      } catch (err) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'error',
          message: err instanceof Error ? err.message : 'Solving failed',
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
