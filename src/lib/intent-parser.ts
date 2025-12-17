import { ParsedIntent } from './types';

/**
 * Natural language intent parser for evening planning requests.
 * Extracts location, cuisine, party size, time, budget, and vibe from user input.
 */

// Common cuisines/food types
const CUISINES = [
  'sushi', 'japanese', 'italian', 'thai', 'chinese', 'mexican', 'indian',
  'french', 'korean', 'vietnamese', 'mediterranean', 'american', 'seafood',
  'steakhouse', 'steak', 'pizza', 'ramen', 'tapas', 'greek', 'spanish',
  'peruvian', 'brazilian', 'bbq', 'barbecue', 'southern', 'cajun', 'creole',
  'ethiopian', 'middle eastern', 'turkish', 'lebanese', 'moroccan', 'cuban',
  'puerto rican', 'caribbean', 'hawaiian', 'dim sum', 'dumplings', 'noodles',
  'pho', 'tacos', 'burritos', 'sashimi', 'omakase', 'izakaya', 'teppanyaki',
  'fine dining', 'farm to table', 'brunch', 'breakfast', 'lunch', 'dinner',
];

// Vibe/atmosphere descriptors
const VIBES = [
  'romantic', 'casual', 'upscale', 'trendy', 'quiet', 'lively', 'intimate',
  'cozy', 'modern', 'traditional', 'hip', 'fancy', 'relaxed', 'chill',
  'sophisticated', 'elegant', 'fun', 'vibrant', 'low-key', 'high-end',
  'classy', 'chic', 'laid-back', 'energetic', 'buzzy', 'swanky',
];

// Vibe phrases (multi-word)
const VIBE_PHRASES = [
  'not too loud', 'good for conversation', 'date night', 'special occasion',
  'good for groups', 'outdoor seating', 'rooftop', 'great view',
  'people watching', 'hidden gem', 'hole in the wall', 'neighborhood spot',
];

// Dietary restrictions
const DIETARY = [
  'vegetarian', 'vegan', 'gluten-free', 'gluten free', 'dairy-free', 'dairy free',
  'kosher', 'halal', 'pescatarian', 'keto', 'paleo', 'nut-free', 'nut free',
];

// Occasions
const OCCASIONS = [
  'date night', 'birthday', 'anniversary', 'celebration', 'business dinner',
  'first date', 'proposal', 'engagement', 'graduation', 'promotion',
  'girls night', 'guys night', 'family dinner', 'catch up', 'reunion',
];

// Budget indicators mapped to Yelp price levels (1-4)
const BUDGET_KEYWORDS: Record<string, string> = {
  'cheap': '1',
  'budget': '1',
  'affordable': '1,2',
  'inexpensive': '1,2',
  'casual': '1,2',
  'moderate': '2',
  'mid-range': '2',
  'midrange': '2',
  'nice': '2,3',
  'upscale': '3,4',
  'fancy': '3,4',
  'fine dining': '4',
  'expensive': '3,4',
  'splurge': '4',
  'high-end': '4',
  'luxury': '4',
};

export function parseUserIntent(prompt: string): ParsedIntent {
  const lower = prompt.toLowerCase();

  return {
    date: extractDate(lower),
    time: extractTime(prompt) || '7:00 PM',
    partySize: extractPartySize(prompt),
    location: extractLocation(prompt),
    cuisines: extractCuisines(lower),
    vibeKeywords: extractVibes(lower),
    budget: extractBudget(lower),
    occasion: extractOccasion(lower),
    includeDrinks: /drinks?|cocktail|bar|after|nightcap/.test(lower),
    includeDessert: /dessert|sweet|ice cream/.test(lower),
    dietaryRestrictions: extractDietary(lower),
  };
}

function extractDate(prompt: string): string {
  const today = new Date();

  if (prompt.includes('tonight') || prompt.includes('today')) {
    return formatDate(today);
  }

  if (prompt.includes('tomorrow')) {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return formatDate(tomorrow);
  }

  // Check for specific days of the week
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  for (let i = 0; i < days.length; i++) {
    if (prompt.includes(days[i])) {
      const diff = (i - today.getDay() + 7) % 7 || 7;
      const target = new Date(today);
      target.setDate(target.getDate() + diff);
      return formatDate(target);
    }
  }

  // Check for "this weekend", "next week" patterns
  if (prompt.includes('this weekend')) {
    const saturday = new Date(today);
    const daysUntilSaturday = (6 - today.getDay() + 7) % 7;
    saturday.setDate(saturday.getDate() + (daysUntilSaturday || 7));
    return formatDate(saturday);
  }

  // Check for specific date patterns like "December 20" or "12/20"
  const dateMatch = prompt.match(/(\w+)\s+(\d{1,2})(?:st|nd|rd|th)?|(\d{1,2})\/(\d{1,2})/i);
  if (dateMatch) {
    // Handle month name + day
    if (dateMatch[1] && dateMatch[2]) {
      const months = ['january', 'february', 'march', 'april', 'may', 'june',
                      'july', 'august', 'september', 'october', 'november', 'december'];
      const monthIndex = months.indexOf(dateMatch[1].toLowerCase());
      if (monthIndex !== -1) {
        const year = today.getFullYear();
        const date = new Date(year, monthIndex, parseInt(dateMatch[2]));
        if (date < today) date.setFullYear(year + 1);
        return formatDate(date);
      }
    }
  }

  return formatDate(today);
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

function extractTime(prompt: string): string | null {
  // Match various time formats: "7pm", "7:30 PM", "19:00", "around 8"
  const patterns = [
    /(?:at|around|@)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i,
    /(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i,
    /(\d{1,2}):(\d{2})/,
  ];

  for (const pattern of patterns) {
    const match = prompt.match(pattern);
    if (match) {
      let hour = parseInt(match[1]);
      const minutes = match[2] || '00';
      let period = match[3]?.toUpperCase();

      // Infer AM/PM if not specified (assume PM for dinner times)
      if (!period) {
        period = (hour >= 1 && hour <= 6) || hour === 12 ? 'PM' : (hour >= 7 && hour <= 11 ? 'PM' : 'AM');
      }

      // Handle 24-hour format
      if (hour > 12) {
        hour -= 12;
        period = 'PM';
      }

      return `${hour}:${minutes} ${period}`;
    }
  }

  return null;
}

function extractPartySize(prompt: string): number {
  const patterns = [
    /for\s+(\d+)/i,
    /(\d+)\s+(?:people|guests|persons|of us)/i,
    /party\s+of\s+(\d+)/i,
    /table\s+for\s+(\d+)/i,
    /(\d+)\s+(?:top|pax)/i,
  ];

  for (const pattern of patterns) {
    const match = prompt.match(pattern);
    if (match) {
      return parseInt(match[1]);
    }
  }

  // Check for word numbers
  const wordNumbers: Record<string, number> = {
    'two': 2, 'three': 3, 'four': 4, 'five': 5, 'six': 6,
    'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10, 'twelve': 12,
  };

  for (const [word, num] of Object.entries(wordNumbers)) {
    if (prompt.toLowerCase().includes(`for ${word}`) ||
        prompt.toLowerCase().includes(`${word} people`)) {
      return num;
    }
  }

  return 2; // Default to 2 people
}

function extractLocation(prompt: string): string {
  const lower = prompt.toLowerCase();

  // Pattern 1: "in [Location]" - capture everything after "in" until end or stop words
  const inMatch = prompt.match(/\bin\s+([A-Za-z][A-Za-z\s'-]+?)(?:\s+(?:for|at|around|near|tonight|tomorrow|this|next|on|\d)|,|\.|\s*$)/i);
  if (inMatch) {
    const location = inMatch[1].trim();
    const nonLocations = ['mood', 'evening', 'night', 'morning', 'afternoon', 'vibe', 'style', 'a', 'the', 'my', 'our'];
    if (!nonLocations.includes(location.toLowerCase()) && location.length > 1) {
      return cleanLocation(location);
    }
  }

  // Pattern 2: "near/around [Location]"
  const nearMatch = prompt.match(/(?:near|around|by)\s+([A-Za-z][A-Za-z\s'-]+?)(?:\s+(?:for|at|\d)|,|\.|\s*$)/i);
  if (nearMatch) {
    return cleanLocation(nearMatch[1].trim());
  }

  // Pattern 3: City, State format (e.g., "Austin, TX" or "Cincinnati, Ohio")
  const cityStateMatch = prompt.match(/([A-Za-z][A-Za-z\s'-]+),\s*([A-Z]{2}|[A-Za-z]+)/);
  if (cityStateMatch) {
    return `${cityStateMatch[1].trim()}, ${cityStateMatch[2].trim()}`;
  }

  // Pattern 4: Check for known cities anywhere in the prompt
  const cities = [
    'new york', 'nyc', 'manhattan', 'brooklyn', 'queens', 'bronx',
    'los angeles', 'la', 'hollywood', 'santa monica', 'beverly hills',
    'san francisco', 'sf', 'oakland', 'berkeley',
    'chicago', 'wicker park', 'lincoln park', 'river north',
    'miami', 'miami beach', 'south beach', 'wynwood', 'brickell',
    'austin', 'houston', 'dallas', 'san antonio', 'fort worth',
    'seattle', 'capitol hill', 'fremont', 'ballard',
    'boston', 'cambridge', 'back bay', 'beacon hill',
    'denver', 'boulder', 'lodo', 'rino',
    'portland', 'pearl district',
    'philadelphia', 'philly', 'old city', 'rittenhouse',
    'washington dc', 'dc', 'georgetown', 'dupont circle',
    'atlanta', 'midtown', 'buckhead', 'decatur',
    'nashville', 'the gulch', 'east nashville',
    'new orleans', 'nola', 'french quarter', 'garden district',
    'san diego', 'gaslamp', 'la jolla',
    'las vegas', 'the strip',
    'phoenix', 'scottsdale', 'tempe',
    'minneapolis', 'st paul',
    'detroit', 'downtown detroit',
    'cleveland', 'cincinnati', 'columbus', 'ohio city',
    'pittsburgh', 'baltimore', 'tampa', 'orlando',
    'charlotte', 'raleigh', 'durham', 'chapel hill',
    'salt lake city', 'park city',
    'sacramento', 'san jose', 'fresno',
    'kansas city', 'st louis', 'indianapolis',
    'milwaukee', 'madison',
    'memphis', 'louisville', 'lexington',
    'albuquerque', 'tucson', 'el paso',
    'omaha', 'des moines', 'oklahoma city', 'tulsa',
    'richmond', 'virginia beach', 'norfolk',
    'providence', 'hartford', 'new haven',
    'buffalo', 'rochester', 'albany', 'syracuse',
    'jacksonville', 'fort lauderdale', 'west palm beach',
    'anchorage', 'honolulu',
  ];

  for (const city of cities) {
    if (lower.includes(city)) {
      return cleanLocation(city);
    }
  }

  // NO DEFAULT - return empty to force error message asking for location
  // This way user knows to specify a location instead of getting wrong results
  return '';
}

function cleanLocation(location: string): string {
  // Capitalize properly
  return location
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    .replace(/\bNyc\b/i, 'NYC')
    .replace(/\bSf\b/i, 'SF')
    .replace(/\bLa\b/i, 'LA')
    .replace(/\bDc\b/i, 'DC')
    .trim();
}

function extractCuisines(prompt: string): string[] {
  const found: string[] = [];

  for (const cuisine of CUISINES) {
    if (prompt.includes(cuisine)) {
      found.push(cuisine);
    }
  }

  return found;
}

function extractVibes(prompt: string): string[] {
  const found: string[] = [];

  // Check single-word vibes
  for (const vibe of VIBES) {
    if (prompt.includes(vibe)) {
      found.push(vibe);
    }
  }

  // Check multi-word vibe phrases
  for (const phrase of VIBE_PHRASES) {
    if (prompt.includes(phrase)) {
      found.push(phrase);
    }
  }

  return found;
}

function extractBudget(prompt: string): number | undefined {
  // Check for explicit dollar amounts
  const dollarMatch = prompt.match(/\$(\d+)/);
  if (dollarMatch) {
    return parseInt(dollarMatch[1]);
  }

  // Check for "X per person" pattern
  const perPersonMatch = prompt.match(/(\d+)\s*(?:per person|pp|each)/i);
  if (perPersonMatch) {
    return parseInt(perPersonMatch[1]);
  }

  return undefined;
}

function extractOccasion(prompt: string): string | undefined {
  for (const occasion of OCCASIONS) {
    if (prompt.includes(occasion)) {
      return occasion;
    }
  }
  return undefined;
}

function extractDietary(prompt: string): string[] {
  const found: string[] = [];

  for (const restriction of DIETARY) {
    if (prompt.includes(restriction)) {
      found.push(restriction);
    }
  }

  return found;
}

/**
 * Map budget/vibe to Yelp price parameter
 */
export function mapToYelpPrice(intent: ParsedIntent): string | undefined {
  const { budget, vibeKeywords } = intent;

  // If explicit budget, map to price level
  if (budget) {
    if (budget <= 20) return '1';
    if (budget <= 40) return '1,2';
    if (budget <= 60) return '2,3';
    if (budget <= 100) return '3,4';
    return '4';
  }

  // Map vibes to price
  for (const vibe of vibeKeywords) {
    const price = BUDGET_KEYWORDS[vibe.toLowerCase()];
    if (price) return price;
  }

  return undefined; // Let Yelp return all price levels
}
