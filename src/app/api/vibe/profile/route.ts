import { NextRequest, NextResponse } from 'next/server';
import { VibeVector } from '@/lib/types';

interface UserVibeProfile {
  id: string;
  vibeVector: VibeVector;
  favoritePhotos: string[];
  createdAt: Date;
  updatedAt: Date;
}

const profiles = new Map<string, UserVibeProfile>();

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 400 });
  }

  const profile = profiles.get(userId);
  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  return NextResponse.json(profile);
}

export async function POST(request: NextRequest) {
  const { userId, vibeVector, favoritePhotos } = await request.json() as {
    userId?: string;
    vibeVector?: VibeVector;
    favoritePhotos?: string[];
  };

  if (!userId || !vibeVector) {
    return NextResponse.json({ error: 'User ID and vibe vector required' }, { status: 400 });
  }

  const profile: UserVibeProfile = {
    id: userId,
    vibeVector,
    favoritePhotos: favoritePhotos || [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  profiles.set(userId, profile);

  return NextResponse.json(profile);
}
