import { NextRequest, NextResponse } from 'next/server';
import { yelpClient } from '@/lib/yelp';

export async function POST(request: NextRequest) {
  const { message, chatId } = await request.json() as {
    message?: string;
    chatId?: string;
  };

  if (!message) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 });
  }

  try {
    const response = await yelpClient.chat(message, chatId);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Yelp chat error:', error);
    return NextResponse.json({ error: 'Yelp API error' }, { status: 500 });
  }
}
