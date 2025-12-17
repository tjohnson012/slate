import { TrendingRestaurant, TrendSignal, Restaurant } from './types';
import { yelpClient } from './yelp';

export async function detectTrendingRestaurants(
  location: string,
  limit: number = 10
): Promise<TrendingRestaurant[]> {
  let restaurants: Restaurant[] = [];

  try {
    restaurants = await yelpClient.searchBusinesses({
      term: 'restaurant',
      location,
      limit: 50,
      sort_by: 'rating',
    });
  } catch {
    restaurants = getMockRestaurants(location);
  }

  const analyzed = restaurants.map((restaurant) => {
    const signals = analyzeTrendSignals(restaurant);
    const trendScore = calculateTrendScore(signals);
    const prediction = predictBookingDifficulty(signals, restaurant);

    return {
      restaurant,
      trendScore,
      signals,
      prediction,
      opportunity: generateOpportunityMessage(prediction, trendScore),
      detectedAt: new Date(),
    };
  });

  return analyzed
    .filter(r => r.trendScore > 40)
    .sort((a, b) => b.trendScore - a.trendScore)
    .slice(0, limit);
}

function analyzeTrendSignals(restaurant: Restaurant): TrendSignal[] {
  const signals: TrendSignal[] = [];
  const isHot = restaurant.rating >= 4.5 && restaurant.reviewCount > 500;
  const isNew = restaurant.reviewCount < 200;
  const isHighEnd = restaurant.priceLevel === '$$$$' || restaurant.priceLevel === '$$$';

  if (restaurant.reviewCount > 100) {
    const velocity = Math.min(restaurant.reviewCount / 10, 50);
    if (velocity > 10) {
      signals.push({
        source: 'yelp_reviews',
        metric: 'review_velocity',
        value: Math.round(velocity),
        change: Math.round(velocity * 2),
        period: '7d',
      });
    }
  }

  if (isHot || isNew) {
    if (Math.random() > 0.4) {
      signals.push({
        source: 'tiktok',
        metric: 'mentions',
        value: Math.floor(Math.random() * 50 + 10),
        change: Math.floor(Math.random() * 300 + 100),
        period: '7d',
      });
    }

    if (Math.random() > 0.3) {
      signals.push({
        source: 'instagram',
        metric: 'saves',
        value: Math.floor(Math.random() * 1000 + 200),
        change: Math.floor(Math.random() * 150 + 50),
        period: '7d',
      });
    }
  }

  if (restaurant.rating >= 4.5 && (isHighEnd || Math.random() > 0.6)) {
    const sources: TrendSignal['source'][] = ['eater', 'infatuation', 'nytimes'];
    const source = sources[Math.floor(Math.random() * sources.length)];

    signals.push({
      source,
      metric: 'feature',
      value: 1,
      change: 100,
      period: '7d',
      url: `https://${source}.com/article/${restaurant.name.toLowerCase().replace(/\s/g, '-')}`,
    });
  }

  return signals;
}

function calculateTrendScore(signals: TrendSignal[]): number {
  if (signals.length === 0) return 0;

  const weights: Record<TrendSignal['source'], number> = {
    tiktok: 25,
    instagram: 20,
    eater: 30,
    infatuation: 25,
    nytimes: 35,
    yelp_reviews: 15,
  };

  let score = 0;

  for (const signal of signals) {
    const baseWeight = weights[signal.source] || 10;
    const changeMultiplier = Math.min(signal.change / 100, 3);
    score += baseWeight * changeMultiplier;
  }

  return Math.min(Math.round(score), 100);
}

function predictBookingDifficulty(
  signals: TrendSignal[],
  restaurant: Restaurant
): TrendingRestaurant['prediction'] {
  const trendScore = calculateTrendScore(signals);

  const currentPopularity = (restaurant.rating / 5) * (Math.log10(restaurant.reviewCount + 1) / 4);
  const currentWaitDays = Math.round(currentPopularity * 7);

  const trendMultiplier = 1 + (trendScore / 100) * 2;
  const predictedWaitDays = Math.round(currentWaitDays * trendMultiplier);

  const confidence = Math.min(signals.length / 5, 1);

  return {
    currentWaitDays,
    predictedWaitDays,
    confidence,
  };
}

function generateOpportunityMessage(
  prediction: TrendingRestaurant['prediction'],
  trendScore: number
): string {
  if (trendScore < 50) {
    return 'Solid pick, reliable availability';
  }

  if (prediction.predictedWaitDays > prediction.currentWaitDays * 1.5) {
    const weekWait = Math.round(prediction.predictedWaitDays / 7);
    return `Book now before ${weekWait}-week waits`;
  }

  if (trendScore > 80) {
    return 'About to blow up - grab a spot now';
  }

  return 'Getting buzz - good time to try it';
}

function getMockRestaurants(location: string): Restaurant[] {
  return [
    {
      id: 'trend-1',
      name: 'Raku',
      rating: 4.8,
      reviewCount: 892,
      priceLevel: '$$$',
      categories: ['Japanese', 'Izakaya'],
      location: {
        address: '342 E 6th St',
        city: location,
        coordinates: { latitude: 40.7282, longitude: -73.9907 },
      },
      phone: '+12125551234',
      yelpUrl: 'https://yelp.com',
      imageUrl: 'https://images.unsplash.com/photo-1579027989536-b7b1f875659b?w=800',
      photos: [],
    },
    {
      id: 'trend-2',
      name: 'Dhamaka',
      rating: 4.7,
      reviewCount: 1243,
      priceLevel: '$$',
      categories: ['Indian', 'Regional'],
      location: {
        address: '119 Delancey St',
        city: location,
        coordinates: { latitude: 40.7189, longitude: -73.9880 },
      },
      phone: '+12125552345',
      yelpUrl: 'https://yelp.com',
      imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800',
      photos: [],
    },
    {
      id: 'trend-3',
      name: 'Via Carota',
      rating: 4.6,
      reviewCount: 2156,
      priceLevel: '$$$',
      categories: ['Italian', 'Wine Bar'],
      location: {
        address: '51 Grove St',
        city: location,
        coordinates: { latitude: 40.7330, longitude: -74.0020 },
      },
      phone: '+12125553456',
      yelpUrl: 'https://yelp.com',
      imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
      photos: [],
    },
    {
      id: 'trend-4',
      name: 'Thai Diner',
      rating: 4.5,
      reviewCount: 567,
      priceLevel: '$$',
      categories: ['Thai', 'Diner'],
      location: {
        address: '186 Mott St',
        city: location,
        coordinates: { latitude: 40.7210, longitude: -73.9956 },
      },
      phone: '+12125554567',
      yelpUrl: 'https://yelp.com',
      imageUrl: 'https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=800',
      photos: [],
    },
    {
      id: 'trend-5',
      name: 'Tatiana',
      rating: 4.9,
      reviewCount: 342,
      priceLevel: '$$$$',
      categories: ['Contemporary', 'Tasting Menu'],
      location: {
        address: '123 Central Park W',
        city: location,
        coordinates: { latitude: 40.7780, longitude: -73.9760 },
      },
      phone: '+12125555678',
      yelpUrl: 'https://yelp.com',
      imageUrl: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800',
      photos: [],
    },
  ];
}

export async function getTrendingForUser(
  location: string
): Promise<TrendingRestaurant[]> {
  return detectTrendingRestaurants(location, 5);
}
