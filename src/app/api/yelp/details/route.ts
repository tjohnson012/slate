import { NextRequest, NextResponse } from 'next/server';
import { yelpClient } from '@/lib/yelp';

export async function GET(request: NextRequest) {
  const businessId = request.nextUrl.searchParams.get('id');

  if (!businessId) {
    return NextResponse.json({ error: 'Business ID is required' }, { status: 400 });
  }

  try {
    const business = await yelpClient.getBusinessDetails(businessId);
    return NextResponse.json(business);
  } catch (error) {
    console.error('Yelp details error:', error);
    return NextResponse.json({ error: 'Yelp API error' }, { status: 500 });
  }
}
