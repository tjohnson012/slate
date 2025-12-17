import { VibeVector, VibePhoto, Restaurant } from './types';
import { yelp } from './yelp';

export const VIBE_PHOTOS: VibePhoto[] = [
  {
    id: 'dim-romantic',
    url: 'https://images.unsplash.com/photo-1529543544277-750e04f96e74?w=400&h=400&fit=crop',
    vibeVector: { lighting: 15, noiseLevel: 20, crowdVibe: 20, formality: 60, adventurousness: 40, priceLevel: 70 },
    description: 'Intimate candlelit dinner',
  },
  {
    id: 'bright-casual',
    url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=400&fit=crop',
    vibeVector: { lighting: 85, noiseLevel: 60, crowdVibe: 40, formality: 20, adventurousness: 30, priceLevel: 30 },
    description: 'Bright casual spot',
  },
  {
    id: 'trendy-scene',
    url: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&h=400&fit=crop',
    vibeVector: { lighting: 40, noiseLevel: 75, crowdVibe: 90, formality: 50, adventurousness: 70, priceLevel: 60 },
    description: 'Trendy see-and-be-seen',
  },
  {
    id: 'cozy-neighborhood',
    url: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=400&h=400&fit=crop',
    vibeVector: { lighting: 35, noiseLevel: 40, crowdVibe: 15, formality: 30, adventurousness: 35, priceLevel: 45 },
    description: 'Cozy neighborhood gem',
  },
  {
    id: 'upscale-elegant',
    url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=400&fit=crop',
    vibeVector: { lighting: 50, noiseLevel: 25, crowdVibe: 55, formality: 95, adventurousness: 50, priceLevel: 95 },
    description: 'Upscale fine dining',
  },
  {
    id: 'lively-bustling',
    url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=400&fit=crop',
    vibeVector: { lighting: 70, noiseLevel: 85, crowdVibe: 60, formality: 25, adventurousness: 55, priceLevel: 40 },
    description: 'Lively bustling energy',
  },
  {
    id: 'intimate-quiet',
    url: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=400&h=400&fit=crop',
    vibeVector: { lighting: 25, noiseLevel: 15, crowdVibe: 10, formality: 55, adventurousness: 45, priceLevel: 65 },
    description: 'Intimate and quiet',
  },
  {
    id: 'hip-creative',
    url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&h=400&fit=crop',
    vibeVector: { lighting: 55, noiseLevel: 55, crowdVibe: 75, formality: 20, adventurousness: 85, priceLevel: 50 },
    description: 'Hip creative space',
  },
  {
    id: 'classic-timeless',
    url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=400&fit=crop',
    vibeVector: { lighting: 45, noiseLevel: 35, crowdVibe: 30, formality: 70, adventurousness: 15, priceLevel: 75 },
    description: 'Classic timeless elegance',
  },
  {
    id: 'outdoor-fresh',
    url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=400&fit=crop',
    vibeVector: { lighting: 95, noiseLevel: 50, crowdVibe: 45, formality: 35, adventurousness: 40, priceLevel: 55 },
    description: 'Fresh outdoor dining',
  },
  {
    id: 'hidden-speakeasy',
    url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=400&fit=crop',
    vibeVector: { lighting: 20, noiseLevel: 45, crowdVibe: 65, formality: 55, adventurousness: 75, priceLevel: 65 },
    description: 'Hidden speakeasy vibe',
  },
  {
    id: 'family-warm',
    url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&h=400&fit=crop',
    vibeVector: { lighting: 65, noiseLevel: 60, crowdVibe: 25, formality: 15, adventurousness: 25, priceLevel: 35 },
    description: 'Warm family atmosphere',
  },
];

const DEFAULT_VIBE: VibeVector = {
  lighting: 50,
  noiseLevel: 50,
  crowdVibe: 50,
  formality: 50,
  adventurousness: 50,
  priceLevel: 50,
};

export function calculateVibeFromSelections(selectedPhotoIds: string[]): VibeVector {
  const selectedPhotos = VIBE_PHOTOS.filter(p => selectedPhotoIds.includes(p.id));

  if (selectedPhotos.length === 0) return DEFAULT_VIBE;

  const dimensions = Object.keys(DEFAULT_VIBE) as (keyof VibeVector)[];
  const result = { ...DEFAULT_VIBE };

  for (const dim of dimensions) {
    const sum = selectedPhotos.reduce((acc, photo) => acc + photo.vibeVector[dim], 0);
    result[dim] = Math.round(sum / selectedPhotos.length);
  }

  return result;
}

export function generateVibeSummary(vibeVector: VibeVector): string {
  const parts: string[] = [];

  if (vibeVector.lighting < 40) parts.push('dim lighting');
  else if (vibeVector.lighting > 60) parts.push('bright spaces');

  if (vibeVector.noiseLevel < 40) parts.push('quiet atmosphere');
  else if (vibeVector.noiseLevel > 60) parts.push('lively energy');

  if (vibeVector.crowdVibe < 40) parts.push('neighborhood feel');
  else if (vibeVector.crowdVibe > 60) parts.push('trendy scenes');

  if (vibeVector.formality > 60) parts.push('upscale elegance');
  else if (vibeVector.formality < 40) parts.push('casual vibe');

  if (vibeVector.adventurousness > 60) parts.push('bold flavors');
  else if (vibeVector.adventurousness < 40) parts.push('familiar classics');

  return parts.join(', ') || 'balanced preferences';
}

const VIBE_KEYWORDS: Record<string, { low: string[]; high: string[] }> = {
  lighting: {
    low: ['dim', 'dark', 'moody', 'candlelit', 'romantic', 'intimate', 'cozy', 'low-light', 'ambient'],
    high: ['bright', 'airy', 'sunny', 'natural light', 'open', 'windows', 'daylight', 'well-lit'],
  },
  noiseLevel: {
    low: ['quiet', 'peaceful', 'serene', 'calm', 'hushed', 'conversation-friendly', 'soft music'],
    high: ['loud', 'buzzy', 'energetic', 'lively', 'bustling', 'noisy', 'vibrant', 'packed', 'crowded'],
  },
  crowdVibe: {
    low: ['neighborhood', 'locals', 'regulars', 'family', 'unpretentious', 'low-key', 'chill'],
    high: ['scene', 'trendy', 'hip', 'instagram', 'popular', 'hot spot', 'celebrities', 'see and be seen'],
  },
  formality: {
    low: ['casual', 'relaxed', 'laid-back', 'no dress code', 'come as you are', 'dive', 'hole in wall'],
    high: ['upscale', 'fine dining', 'elegant', 'formal', 'dress code', 'white tablecloth', 'sophisticated'],
  },
  adventurousness: {
    low: ['traditional', 'classic', 'authentic', 'old-school', 'comfort food', 'familiar', 'no-frills'],
    high: ['innovative', 'creative', 'experimental', 'fusion', 'molecular', 'unique', 'adventurous', 'bold'],
  },
};

export async function extractVibeFromRestaurant(restaurant: Restaurant): Promise<VibeVector> {
  // Generate vibe based on restaurant characteristics for variety
  const categories = restaurant.categories.map(c => c.toLowerCase()).join(' ');
  const name = restaurant.name.toLowerCase();
  const priceLen = restaurant.priceLevel?.length || 2;

  // Use restaurant ID hash for consistent but varied randomness
  const hash = restaurant.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const variance = (seed: number) => ((hash * seed) % 30) - 15; // -15 to +15 variance

  const result: VibeVector = {
    // Lighting: fine dining/wine bars darker, cafes/brunch brighter
    lighting: categories.includes('wine') || categories.includes('cocktail') || categories.includes('speakeasy')
      ? 25 + variance(1)
      : categories.includes('cafe') || categories.includes('brunch') || categories.includes('breakfast')
      ? 75 + variance(2)
      : 50 + variance(3),

    // Noise: bars/clubs louder, fine dining quieter
    noiseLevel: categories.includes('bar') || categories.includes('club') || categories.includes('pub')
      ? 70 + variance(4)
      : priceLen >= 3
      ? 30 + variance(5)
      : 50 + variance(6),

    // Crowd vibe: trendy spots vs neighborhood joints
    crowdVibe: categories.includes('trendy') || name.includes('craft') || restaurant.reviewCount > 500
      ? 70 + variance(7)
      : categories.includes('diner') || categories.includes('family')
      ? 25 + variance(8)
      : 45 + variance(9),

    // Formality: based on price level
    formality: priceLen === 4 ? 85 + variance(10) : priceLen === 3 ? 60 + variance(11) : priceLen === 1 ? 20 + variance(12) : 40 + variance(13),

    // Adventurousness: fusion/experimental vs traditional
    adventurousness: categories.includes('fusion') || categories.includes('modern') || categories.includes('new american')
      ? 75 + variance(14)
      : categories.includes('traditional') || categories.includes('classic') || categories.includes('diner')
      ? 25 + variance(15)
      : 50 + variance(16),

    // Price level directly from restaurant
    priceLevel: (priceLen / 4) * 100,
  };

  // Clamp all values to 0-100
  for (const key of Object.keys(result) as (keyof VibeVector)[]) {
    result[key] = Math.max(0, Math.min(100, Math.round(result[key])));
  }

  return result;
}

const DIMENSION_LABELS: Record<keyof VibeVector, { low: string; high: string }> = {
  lighting: { low: 'dim and moody', high: 'bright and airy' },
  noiseLevel: { low: 'quiet and intimate', high: 'lively and energetic' },
  crowdVibe: { low: 'neighborhood feel', high: 'trendy scene' },
  formality: { low: 'casual vibe', high: 'upscale elegance' },
  adventurousness: { low: 'classic and familiar', high: 'creative and bold' },
  priceLevel: { low: 'budget-friendly', high: 'splurge-worthy' },
};

export function calculateVibeMatch(
  userVibe: VibeVector,
  restaurantVibe: VibeVector
): { score: number; reasons: string[] } {
  const dimensions = Object.keys(userVibe) as (keyof VibeVector)[];

  const totalDiff = dimensions.reduce(
    (sum, dim) => sum + Math.abs(userVibe[dim] - restaurantVibe[dim]),
    0
  );
  const maxDiff = dimensions.length * 100;
  const score = Math.round(100 - (totalDiff / maxDiff) * 100);

  const matchingDimensions = dimensions.filter(
    dim => Math.abs(userVibe[dim] - restaurantVibe[dim]) < 20
  );

  const reasons = matchingDimensions.slice(0, 3).map(dim => {
    const labels = DIMENSION_LABELS[dim];
    return restaurantVibe[dim] > 50 ? labels.high : labels.low;
  });

  return { score, reasons };
}

export function generateVibeExplanation(
  restaurant: Restaurant,
  userVibe: VibeVector,
  restaurantVibe: VibeVector
): string {
  const { reasons } = calculateVibeMatch(userVibe, restaurantVibe);

  if (reasons.length === 0) return `${restaurant.name} offers a unique experience`;
  if (reasons.length === 1) return `${reasons[0]} - just like your favorites`;
  return `${reasons.slice(0, -1).join(', ')} and ${reasons[reasons.length - 1]}`;
}

export function sortByVibeMatch(restaurants: Restaurant[], userVibe: VibeVector): Restaurant[] {
  return restaurants
    .map(restaurant => {
      if (!restaurant.vibeVector) return restaurant;
      const match = calculateVibeMatch(userVibe, restaurant.vibeVector);
      return {
        ...restaurant,
        vibeMatchScore: match.score,
        vibeMatchReason: generateVibeExplanation(restaurant, userVibe, restaurant.vibeVector),
      };
    })
    .sort((a, b) => (b.vibeMatchScore || 0) - (a.vibeMatchScore || 0));
}
