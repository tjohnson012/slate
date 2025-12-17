import { NextRequest, NextResponse } from 'next/server';
import { detectTrendingRestaurants } from '@/lib/trends';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get('location') || 'New York';
  const limit = parseInt(searchParams.get('limit') || '10');

  const trending = await detectTrendingRestaurants(location, limit);

  return NextResponse.json({ trending });
}
