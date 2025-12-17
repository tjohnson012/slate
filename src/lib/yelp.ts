import { Restaurant, YelpBusiness, YelpChatResponse } from './types';

const YELP_API_KEY = process.env.YELP_API_KEY;
const BASE_URL = 'https://api.yelp.com/v3';

class YelpClient {
  private chatId: string | null = null;

  private getApiKey(): string {
    if (!YELP_API_KEY) {
      throw new Error(
        'YELP_API_KEY is not configured. Add it to your .env file or Vercel environment variables.'
      );
    }
    return YELP_API_KEY;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const apiKey = this.getApiKey();

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      if (response.status === 401) {
        throw new Error('Yelp API authentication failed. Check your YELP_API_KEY.');
      }
      throw new Error(`Yelp API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  async chat(message: string, chatId?: string): Promise<{
    text: string;
    businesses: YelpBusiness[];
    chatId: string;
  }> {
    const response = await this.request<YelpChatResponse>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({
        message,
        chat_id: chatId || this.chatId,
      }),
    });

    this.chatId = response.chat_id;

    return {
      text: response.response?.text || '',
      businesses: response.response?.businesses || [],
      chatId: response.chat_id,
    };
  }

  resetChat() {
    this.chatId = null;
  }

  async searchBusinesses(params: {
    term?: string;
    location: string;
    categories?: string;
    price?: string;
    limit?: number;
    radius?: number;
    sort_by?: 'best_match' | 'rating' | 'review_count' | 'distance';
  }): Promise<Restaurant[]> {
    const searchParams = new URLSearchParams({
      location: params.location,
      limit: String(params.limit || 20),
      sort_by: params.sort_by || 'best_match',
    });

    if (params.term) searchParams.set('term', params.term);
    if (params.categories) searchParams.set('categories', params.categories);
    if (params.price) searchParams.set('price', params.price);
    if (params.radius) searchParams.set('radius', String(params.radius));

    const data = await this.request<{ businesses: YelpBusiness[] }>(
      `/businesses/search?${searchParams}`
    );

    return data.businesses.map(this.mapBusinessToRestaurant);
  }

  async getBusinessDetails(businessId: string): Promise<Restaurant> {
    const data = await this.request<YelpBusiness>(`/businesses/${businessId}`);
    return this.mapBusinessToRestaurant(data);
  }

  async checkAvailability(
    restaurantName: string,
    location: string,
    date: string,
    time: string,
    partySize: number
  ): Promise<{
    available: boolean;
    alternativeTimes: string[];
    message: string;
  }> {
    const message = `Check availability at ${restaurantName} in ${location} for ${partySize} people on ${date} at ${time}`;
    const response = await this.chat(message);
    const text = response.text.toLowerCase();

    const unavailableIndicators = ['no availability', 'not available', 'fully booked', 'no tables'];
    const availableIndicators = ['available', 'has availability', 'can accommodate'];

    const available = !unavailableIndicators.some(i => text.includes(i)) &&
                     availableIndicators.some(i => text.includes(i));

    const timeRegex = /(\d{1,2}:\d{2}\s*(?:am|pm)|(\d{1,2})\s*(?:am|pm))/gi;
    const matches = text.match(timeRegex) || [];
    const alternativeTimes = Array.from(new Set(matches));

    return { available, alternativeTimes, message: response.text };
  }

  async attemptBooking(
    restaurantName: string,
    location: string,
    date: string,
    time: string,
    partySize: number
  ): Promise<{
    success: boolean;
    confirmationNumber?: string;
    requiresHandoff: boolean;
    handoffUrl?: string;
    message: string;
  }> {
    const message = `Book a table at ${restaurantName} in ${location} for ${partySize} people on ${date} at ${time}`;
    const response = await this.chat(message);
    const text = response.text.toLowerCase();

    const successIndicators = ['confirmed', 'booked', 'reservation is set'];
    const handoffIndicators = ["can't complete", 'cannot complete', 'visit their', 'call them', 'book directly'];

    const success = successIndicators.some(i => text.includes(i));
    const requiresHandoff = handoffIndicators.some(i => text.includes(i));

    const confMatch = response.text.match(/(?:confirmation|conf\.?)\s*(?:#|number|:)?\s*([A-Z0-9-]+)/i);
    const confirmationNumber = confMatch ? confMatch[1] : undefined;

    const handoffUrl = response.businesses[0]?.url;

    return { success, confirmationNumber, requiresHandoff, handoffUrl, message: response.text };
  }

  private mapBusinessToRestaurant(biz: YelpBusiness): Restaurant {
    return {
      id: biz.id,
      name: biz.name,
      rating: biz.rating,
      reviewCount: biz.review_count,
      priceLevel: biz.price || '$$',
      categories: biz.categories?.map(c => c.title) || [],
      location: {
        address: biz.location?.address1 || '',
        city: biz.location?.city || '',
        neighborhood: biz.location?.neighborhood,
        coordinates: {
          latitude: biz.coordinates?.latitude || 0,
          longitude: biz.coordinates?.longitude || 0,
        },
      },
      phone: biz.phone || '',
      yelpUrl: biz.url || '',
      imageUrl: biz.image_url || '',
      photos: biz.photos || [biz.image_url],
      hours: biz.hours?.[0] ? { isOpenNow: biz.hours[0].is_open_now } : undefined,
    };
  }
}

export const yelp = new YelpClient();
export const yelpClient = yelp;
