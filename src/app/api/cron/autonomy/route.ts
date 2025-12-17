import { NextResponse } from 'next/server';
import { checkAndTriggerAutonomyPlans } from '@/lib/autonomy';

export async function GET() {
  await checkAndTriggerAutonomyPlans();
  return NextResponse.json({ ok: true });
}

export const dynamic = 'force-dynamic';
