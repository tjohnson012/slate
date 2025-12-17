import { NextRequest, NextResponse } from 'next/server';
import { getAutonomyConfig, saveAutonomyConfig } from '@/lib/autonomy';
import { AutonomyConfig } from '@/lib/types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  const config = await getAutonomyConfig(userId);
  return NextResponse.json({ config });
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const config: AutonomyConfig = {
    id: body.id || crypto.randomUUID(),
    userId: body.userId,
    enabled: body.enabled ?? true,
    schedule: body.schedule || {
      daysOfWeek: [5, 6],
      notifyDaysBefore: 2,
      notifyTime: '10:00',
    },
    constraints: body.constraints || {
      partySize: 2,
      budgetPerPerson: { min: 50, max: 150 },
      neighborhoods: [],
      cuisinePreferences: [],
      cuisineExclusions: [],
      includeDrinks: true,
      timePreference: { earliest: '18:00', latest: '21:00' },
    },
    autonomyLevel: body.autonomyLevel || 'suggest',
    vibeVector: body.vibeVector || {
      lighting: 50,
      noiseLevel: 50,
      crowdVibe: 50,
      formality: 50,
      adventurousness: 50,
      priceLevel: 50,
    },
    successfulBookings: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await saveAutonomyConfig(config);

  return NextResponse.json({ config });
}
