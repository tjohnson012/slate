import { NextRequest, NextResponse } from 'next/server';
import { extractVibeFromRestaurant, calculateVibeFromSelections } from '@/lib/vibe';
import { yelpClient } from '@/lib/yelp';

export async function POST(request: NextRequest) {
  const { restaurantNames, photoIds, location } = await request.json() as {
    restaurantNames?: string[];
    photoIds?: string[];
    location?: string;
  };

  if (photoIds && photoIds.length > 0) {
    const vibeVector = calculateVibeFromSelections(photoIds);
    return NextResponse.json({ vibeVector, source: 'photos' });
  }

  if (!restaurantNames || !Array.isArray(restaurantNames)) {
    return NextResponse.json({ error: 'Restaurant names or photo IDs required' }, { status: 400 });
  }

  try {
    const restaurants = await yelpClient.searchBusinesses({
      term: restaurantNames.join(' '),
      location: location || 'New York',
      limit: Math.min(restaurantNames.length, 5),
    });

    if (restaurants.length === 0) {
      return NextResponse.json({ error: 'No restaurants found' }, { status: 404 });
    }

    const vibeVectors = await Promise.all(
      restaurants.slice(0, 3).map(r => extractVibeFromRestaurant(r))
    );

    const avgVibe = vibeVectors.reduce((acc, v) => {
      Object.keys(v).forEach(k => {
        const key = k as keyof typeof v;
        acc[key] = (acc[key] || 0) + v[key] / vibeVectors.length;
      });
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      vibeVector: avgVibe,
      analyzedRestaurants: restaurants.length,
      source: 'restaurants',
    });
  } catch (error) {
    console.error('Vibe extraction error:', error);
    return NextResponse.json({ error: 'Failed to extract vibe' }, { status: 500 });
  }
}
