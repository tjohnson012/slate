import { NextRequest, NextResponse } from 'next/server';
import { simulateCall } from '@/lib/call-manager';
import { VoiceAgentConfig } from '@/lib/types';
import { yelpClient } from '@/lib/yelp';

export async function POST(request: NextRequest) {
  const { restaurantId, date, time, partySize, guestName, guestPhone } = await request.json();

  if (!restaurantId || !date || !time || !partySize || !guestName) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  let restaurantPhone = '';
  let restaurantName = 'Restaurant';

  try {
    const restaurant = await yelpClient.getBusinessDetails(restaurantId);
    restaurantPhone = restaurant.phone || '+15551234567';
    restaurantName = restaurant.name;
  } catch {
    restaurantPhone = '+15551234567';
  }

  const config: VoiceAgentConfig = {
    restaurantName,
    requestedDate: date,
    requestedTime: time,
    partySize,
    guestName,
    phoneCallback: guestPhone || '',
    flexibility: {
      timeRange: 30,
      acceptAlternatives: true,
    },
  };

  const call = await simulateCall(restaurantPhone, config);

  return NextResponse.json({ call });
}
