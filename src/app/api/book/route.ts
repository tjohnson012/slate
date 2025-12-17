import { NextRequest, NextResponse } from 'next/server';
import { yelpClient } from '@/lib/yelp';

export async function POST(request: NextRequest) {
  const { restaurantName, location, date, time, partySize } = await request.json() as {
    restaurantName?: string;
    location?: string;
    date?: string;
    time?: string;
    partySize?: number;
  };

  if (!restaurantName || !location || !date || !time || !partySize) {
    return NextResponse.json({ error: 'All booking details required' }, { status: 400 });
  }

  try {
    const availability = await yelpClient.checkAvailability(
      restaurantName, location, date, time, partySize
    );

    if (!availability.available) {
      return NextResponse.json({
        success: false,
        available: false,
        message: availability.message,
        alternativeTimes: availability.alternativeTimes,
      });
    }

    const booking = await yelpClient.attemptBooking(
      restaurantName, location, date, time, partySize
    );

    return NextResponse.json({
      success: booking.success,
      available: true,
      message: booking.message,
      requiresHandoff: booking.requiresHandoff,
      handoffUrl: booking.handoffUrl,
    });
  } catch (error) {
    console.error('Booking error:', error);
    return NextResponse.json({ error: 'Booking failed' }, { status: 500 });
  }
}
