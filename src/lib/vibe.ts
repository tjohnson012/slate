import { VibeVector, VibePhoto, Restaurant } from './types';
import { yelp } from './yelp';

export const VIBE_PHOTOS: VibePhoto[] = [
  {
    id: 'dim-romantic',
    url: '/images/vibe-photos/dim-romantic.jpg',
    vibeVector: { lighting: 15, noiseLevel: 20, crowdVibe: 20, formality: 60, adventurousness: 40, priceLevel: 70 },
    description: 'Dim candlelit dinner',
  },
  {
    id: 'bright-casual',
    url: '/images/vibe-photos/bright-casual.jpg',
    vibeVector: { lighting: 85, noiseLevel: 60, crowdVibe: 40, formality: 20, adventurousness: 30, priceLevel: 30 },
    description: 'Bright casual spot',
  },
  {
    id: 'trendy-scene',
    url: '/images/vibe-photos/trendy-scene.jpg',
    vibeVector: { lighting: 40, noiseLevel: 75, crowdVibe: 90, formality: 50, adventurousness: 70, priceLevel: 60 },
    description: 'Trendy see-and-be-seen',
  },
  {
    id: 'cozy-neighborhood',
    url: '/images/vibe-photos/cozy-neighborhood.jpg',
    vibeVector: { lighting: 35, noiseLevel: 40, crowdVibe: 15, formality: 30, adventurousness: 35, priceLevel: 45 },
    description: 'Cozy neighborhood gem',
  },
  {
    id: 'upscale-elegant',
    url: '/images/vibe-photos/upscale-elegant.jpg',
    vibeVector: { lighting: 50, noiseLevel: 25, crowdVibe: 55, formality: 95, adventurousness: 50, priceLevel: 95 },
    description: 'Upscale fine dining',
  },
  {
    id: 'lively-bustling',
    url: '/images/vibe-photos/lively-bustling.jpg',
    vibeVector: { lighting: 70, noiseLevel: 85, crowdVibe: 60, formality: 25, adventurousness: 55, priceLevel: 40 },
    description: 'Lively bustling energy',
  },
  {
    id: 'intimate-quiet',
    url: '/images/vibe-photos/intimate-quiet.jpg',
    vibeVector: { lighting: 25, noiseLevel: 15, crowdVibe: 10, formality: 55, adventurousness: 45, priceLevel: 65 },
    description: 'Intimate and quiet',
  },
  {
    id: 'hip-creative',
    url: '/images/vibe-photos/hip-creative.jpg',
    vibeVector: { lighting: 55, noiseLevel: 55, crowdVibe: 75, formality: 20, adventurousness: 85, priceLevel: 50 },
    description: 'Hip creative space',
  },
  {
    id: 'classic-timeless',
    url: '/images/vibe-photos/classic-timeless.jpg',
    vibeVector: { lighting: 45, noiseLevel: 35, crowdVibe: 30, formality: 70, adventurousness: 15, priceLevel: 75 },
    description: 'Classic timeless elegance',
  },
  {
    id: 'outdoor-fresh',
    url: '/images/vibe-photos/outdoor-fresh.jpg',
    vibeVector: { lighting: 95, noiseLevel: 50, crowdVibe: 45, formality: 35, adventurousness: 40, priceLevel: 55 },
    description: 'Fresh outdoor dining',
  },
  {
    id: 'hidden-speakeasy',
    url: '/images/vibe-photos/hidden-speakeasy.jpg',
    vibeVector: { lighting: 20, noiseLevel: 45, crowdVibe: 65, formality: 55, adventurousness: 75, priceLevel: 65 },
    description: 'Hidden speakeasy vibe',
  },
  {
    id: 'family-warm',
    url: '/images/vibe-photos/family-warm.jpg',
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
  try {
    const prompt = `Describe the atmosphere at ${restaurant.name}. Is it dim or bright? Quiet or loud? Neighborhood feel or trendy scene? Casual or upscale? Traditional or experimental?`;

    const response = await yelp.chat(prompt);
    const text = response.text.toLowerCase();

    const dimensions = Object.keys(VIBE_KEYWORDS) as (keyof typeof VIBE_KEYWORDS)[];
    const result: VibeVector = { ...DEFAULT_VIBE };

    for (const dim of dimensions) {
      const keywords = VIBE_KEYWORDS[dim];
      const lowCount = keywords.low.filter(k => text.includes(k)).length;
      const highCount = keywords.high.filter(k => text.includes(k)).length;

      if (lowCount + highCount > 0) {
        result[dim as keyof VibeVector] = Math.round((highCount / (lowCount + highCount)) * 100);
      }
    }

    result.priceLevel = restaurant.priceLevel ? (restaurant.priceLevel.length / 4) * 100 : 50;

    return result;
  } catch {
    return DEFAULT_VIBE;
  }
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
