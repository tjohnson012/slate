import { NextRequest, NextResponse } from 'next/server';
import { yelpClient } from '@/lib/yelp';

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const location = params.get('location');

  if (!location) {
    return NextResponse.json({ error: 'Location is required' }, { status: 400 });
  }

  try {
    const businesses = await yelpClient.searchBusinesses({
      location,
      term: params.get('term') || undefined,
      categories: params.get('categories') || undefined,
      price: params.get('price') || undefined,
      limit: params.get('limit') ? parseInt(params.get('limit')!) : 10,
      sort_by: (params.get('sort_by') as 'best_match' | 'rating' | 'review_count' | 'distance') || 'best_match',
    });

    return NextResponse.json({ businesses });
  } catch (error) {
    console.error('Yelp search error:', error);
    return NextResponse.json({ error: 'Yelp API error' }, { status: 500 });
  }
}
