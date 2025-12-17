import { NextRequest, NextResponse } from 'next/server';
import { EveningPlanner } from '@/lib/planner';
import { PlanningEvent, VibeVector } from '@/lib/types';

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
    return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
  }

  const events: PlanningEvent[] = [];
  const planner = new EveningPlanner((event) => events.push(event), userVibeProfile);
  const plan = await planner.createPlan(prompt);

  return NextResponse.json({ plan, events });
}
