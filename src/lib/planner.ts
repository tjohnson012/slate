import {
  Restaurant,
  EveningPlan,
  PlanStop,
  ParsedIntent,
  PlanningEvent,
  AvailabilityMatrix,
  AvailabilityCell,
  CellStatus,
  PlanningEventType,
  VibeVector,
} from './types';
import { yelp } from './yelp';
import { extractVibeFromRestaurant, calculateVibeMatch, generateVibeExplanation } from './vibe';

type EventEmitter = (event: PlanningEvent) => void;

interface UserVibeProfile {
  id: string;
  vibeVector: VibeVector;
  favoritePhotos: string[];
}

const NEIGHBORHOODS = [
  'soho', 'tribeca', 'east village', 'west village', 'chelsea', 'midtown',
  'upper east side', 'upper west side', 'lower east side', 'williamsburg',
  'brooklyn', 'manhattan', 'greenpoint', 'bushwick', 'nolita', 'gramercy',
  'flatiron', 'koreatown', 'hells kitchen', 'financial district', 'dumbo',
  'union square', 'noho', 'little italy', 'chinatown', 'murray hill',
  'san francisco', 'mission', 'castro', 'marina', 'north beach', 'soma',
  'hayes valley', 'nob hill', 'pacific heights', 'potrero hill', 'dogpatch',
];

const CUISINES = [
  'sushi', 'japanese', 'italian', 'thai', 'chinese', 'mexican', 'indian',
  'french', 'korean', 'vietnamese', 'mediterranean', 'american', 'seafood',
  'steakhouse', 'pizza', 'ramen', 'tapas', 'greek', 'spanish', 'peruvian',
];

const VIBES = [
  'romantic', 'casual', 'upscale', 'trendy', 'quiet', 'lively', 'intimate',
  'cozy', 'modern', 'traditional', 'hip', 'fancy', 'relaxed', 'chill',
  'not too loud', 'good for conversation', 'date night', 'special',
];

const DIETARY = [
  'vegetarian', 'vegan', 'gluten-free', 'gluten free', 'dairy-free',
  'kosher', 'halal', 'pescatarian',
];

const OCCASIONS = [
  'date night', 'birthday', 'anniversary', 'celebration', 'business', 'first date',
];

export class EveningPlanner {
  private emit: (type: PlanningEventType, message: string, data?: unknown) => void;
  private userProfile: UserVibeProfile | null;

  constructor(eventCallback: EventEmitter, userProfile?: UserVibeProfile) {
    this.emit = (type, message, data) => eventCallback({ type, message, data, timestamp: new Date() });
    this.userProfile = userProfile || null;
  }

  async createPlan(prompt: string): Promise<EveningPlan> {
    yelp.resetChat();

    const plan: EveningPlan = {
      id: crypto.randomUUID(),
      userId: this.userProfile?.id || 'anonymous',
      status: 'planning',
      prompt,
      parsedIntent: {} as ParsedIntent,
      stops: [],
      totalEstimatedCost: 0,
      createdAt: new Date(),
    };

    try {
      this.emit('intent_parsed', 'Understanding your request...');
      plan.parsedIntent = this.parseIntent(prompt);

      const cuisineDesc = plan.parsedIntent.cuisines.join('/') || 'dinner';
      this.emit('intent_parsed', `Got it: ${cuisineDesc} for ${plan.parsedIntent.partySize} in ${plan.parsedIntent.location}`, plan.parsedIntent);

      this.emit('searching_restaurants', 'Finding the perfect spots...');
      const candidates = await this.findRestaurants(plan.parsedIntent, 'dinner');
      this.emit('restaurants_found', `Found ${candidates.length} restaurants`, candidates);

      const timeSlots = this.generateTimeSlots(plan.parsedIntent.time);
      const matrix = await this.checkAvailabilityMatrix(candidates, timeSlots, plan.parsedIntent);
      plan.matrix = matrix;

      const dinnerStop = await this.bookFromMatrix(matrix, plan.parsedIntent, 'dinner');
      if (dinnerStop) plan.stops.push(dinnerStop);

      if (plan.parsedIntent.includeDrinks && dinnerStop) {
        this.emit('drinks_search', 'Finding drinks nearby...');
        const drinksStop = await this.findDrinks(dinnerStop.restaurant, plan.parsedIntent);
        if (drinksStop) plan.stops.push(drinksStop);
      }

      plan.totalEstimatedCost = this.estimateCost(plan.stops, plan.parsedIntent.partySize);

      plan.status = plan.stops.length === 0 ? 'failed' :
                    plan.stops.every(s => s.booking.status === 'confirmed') ? 'confirmed' :
                    'partial';

      const finalMessage = plan.status === 'confirmed' ? 'Your evening is set!' : 'Plan ready - complete bookings to confirm';
      this.emit('plan_complete', finalMessage, plan);

      return plan;
    } catch (error) {
      this.emit('error', 'Something went wrong', error);
      plan.status = 'failed';
      return plan;
    }
  }

  private parseIntent(prompt: string): ParsedIntent {
    const lower = prompt.toLowerCase();

    return {
      date: this.extractDate(lower),
      time: this.extractTime(prompt) || '7:00 PM',
      partySize: this.extractNumber(prompt, /for (\d+)|(\d+) people|(\d+) guests|party of (\d+)/) || 2,
      location: NEIGHBORHOODS.find(h => lower.includes(h)) || this.extractLocation(prompt) || 'Manhattan',
      cuisines: CUISINES.filter(c => lower.includes(c)),
      vibeKeywords: VIBES.filter(v => lower.includes(v)),
      budget: this.extractNumber(prompt, /\$(\d+)|(\d+) per person|budget (\d+)/),
      occasion: OCCASIONS.find(o => lower.includes(o)),
      includeDrinks: /drinks|cocktail|bar|after/.test(lower),
      includeDessert: /dessert/.test(lower),
      dietaryRestrictions: DIETARY.filter(d => lower.includes(d)),
    };
  }

  private extractDate(prompt: string): string {
    const today = new Date();

    if (prompt.includes('tonight') || prompt.includes('today')) {
      return this.formatDate(today);
    }
    if (prompt.includes('tomorrow')) {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return this.formatDate(tomorrow);
    }

    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    for (let i = 0; i < days.length; i++) {
      if (prompt.includes(days[i])) {
        const diff = (i - today.getDay() + 7) % 7 || 7;
        const target = new Date(today);
        target.setDate(target.getDate() + diff);
        return this.formatDate(target);
      }
    }

    return this.formatDate(today);
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  }

  private extractTime(prompt: string): string | null {
    const match = prompt.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
    if (!match) return null;

    const hour = parseInt(match[1]);
    const minutes = match[2] || '00';
    const period = match[3]?.toUpperCase() || (hour <= 6 || hour === 12 ? 'PM' : 'AM');

    return `${hour}:${minutes} ${period}`;
  }

  private extractNumber(prompt: string, pattern: RegExp): number | undefined {
    const match = prompt.match(pattern);
    if (!match) return undefined;
    return parseInt(match.slice(1).find(m => m) || '0');
  }

  private extractLocation(prompt: string): string | null {
    const inMatch = prompt.match(/in ([A-Za-z\s]+?)(?:,|\.|$| for| at)/i);
    return inMatch ? inMatch[1].trim() : null;
  }

  private async findRestaurants(intent: ParsedIntent, type: 'dinner' | 'drinks'): Promise<Restaurant[]> {
    const term = type === 'dinner'
      ? intent.cuisines.join(' ') || 'restaurant'
      : 'cocktail bar lounge';

    const restaurants = await yelp.searchBusinesses({
      term,
      location: intent.location,
      limit: 5,
      sort_by: 'rating',
    });

    const enriched = await Promise.all(
      restaurants.map(async (r) => {
        const vibeVector = await extractVibeFromRestaurant(r);
        let vibeMatchScore = 70;
        let vibeMatchReason = 'Great option';

        if (this.userProfile) {
          const match = calculateVibeMatch(this.userProfile.vibeVector, vibeVector);
          vibeMatchScore = match.score;
          vibeMatchReason = generateVibeExplanation(r, this.userProfile.vibeVector, vibeVector);
        }

        return { ...r, vibeVector, vibeMatchScore, vibeMatchReason };
      })
    );

    return enriched.sort((a, b) => (b.vibeMatchScore || 0) - (a.vibeMatchScore || 0));
  }

  private generateTimeSlots(baseTime: string): string[] {
    const match = baseTime.match(/(\d+):?(\d*)\s*(AM|PM)/i);
    if (!match) return ['6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM'];

    let hour = parseInt(match[1]);
    const period = match[3].toUpperCase();
    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;

    const slots: string[] = [];
    for (let h = hour - 1; h <= hour + 2; h++) {
      for (const m of [0, 30]) {
        if (h < 17 || h > 22) continue;
        const displayHour = h > 12 ? h - 12 : h;
        const displayPeriod = h >= 12 ? 'PM' : 'AM';
        slots.push(`${displayHour}:${m.toString().padStart(2, '0')} ${displayPeriod}`);
      }
    }

    return slots.slice(0, 6);
  }

  private async checkAvailabilityMatrix(
    restaurants: Restaurant[],
    timeSlots: string[],
    intent: ParsedIntent
  ): Promise<AvailabilityMatrix> {
    const cells: AvailabilityCell[][] = restaurants.map((r) =>
      timeSlots.map((t) => ({
        restaurantId: r.id,
        restaurantName: r.name,
        time: t,
        status: 'idle' as CellStatus,
        vibeMatchScore: r.vibeMatchScore,
      }))
    );

    const matrix: AvailabilityMatrix = { restaurants, timeSlots, cells };
    this.emit('matrix_update', 'Checking availability...', matrix);

    for (let r = 0; r < restaurants.length; r++) {
      for (let t = 0; t < timeSlots.length; t++) {
        cells[r][t].status = 'checking';
        this.emit('cell_status_change', `Checking ${restaurants[r].name} at ${timeSlots[t]}`, { row: r, col: t, status: 'checking' });

        await new Promise(resolve => setTimeout(resolve, 200));

        try {
          const result = await yelp.checkAvailability(
            restaurants[r].name,
            intent.location,
            intent.date,
            timeSlots[t],
            intent.partySize
          );
          cells[r][t].status = result.available ? 'available' : 'unavailable';
        } catch {
          cells[r][t].status = 'unavailable';
        }

        this.emit('cell_status_change', `${restaurants[r].name} at ${timeSlots[t]}: ${cells[r][t].status}`, { row: r, col: t, status: cells[r][t].status });
      }
    }

    return matrix;
  }

  private async bookFromMatrix(
    matrix: AvailabilityMatrix,
    intent: ParsedIntent,
    type: 'dinner' | 'drinks'
  ): Promise<PlanStop | null> {
    let bestCell: { row: number; col: number } | null = null;
    let bestScore = -1;

    for (let r = 0; r < matrix.cells.length; r++) {
      for (let t = 0; t < matrix.cells[r].length; t++) {
        const cell = matrix.cells[r][t];
        if (cell.status === 'available' && (cell.vibeMatchScore || 0) > bestScore) {
          bestScore = cell.vibeMatchScore || 0;
          bestCell = { row: r, col: t };
        }
      }
    }

    if (!bestCell) {
      this.emit('error', `No ${type} availability found`);
      return null;
    }

    const restaurant = matrix.restaurants[bestCell.row];
    const time = matrix.timeSlots[bestCell.col];

    this.emit('booking_attempt', `Booking ${restaurant.name} at ${time}...`, { restaurant, time });
    matrix.cells[bestCell.row][bestCell.col].status = 'booking';
    this.emit('cell_status_change', 'Booking...', { row: bestCell.row, col: bestCell.col, status: 'booking' });

    await new Promise(resolve => setTimeout(resolve, 800));

    const booking = await yelp.attemptBooking(
      restaurant.name,
      intent.location,
      intent.date,
      time,
      intent.partySize
    );

    if (booking.success) {
      matrix.cells[bestCell.row][bestCell.col].status = 'booked';
      matrix.selectedCell = bestCell;
      this.emit('booking_success', `Confirmed at ${restaurant.name}!`, { restaurant, time, confirmation: booking.confirmationNumber });

      this.emit('vibe_match_calculated', `${restaurant.vibeMatchScore}% vibe match`, { restaurant, vibeVector: restaurant.vibeVector });

      return {
        type,
        restaurant,
        time,
        booking: {
          restaurantId: restaurant.id,
          restaurantName: restaurant.name,
          requestedTime: time,
          requestedDate: intent.date,
          partySize: intent.partySize,
          status: 'confirmed',
          confirmationNumber: booking.confirmationNumber,
          attemptedAt: new Date(),
        },
      };
    }

    if (booking.requiresHandoff) {
      matrix.cells[bestCell.row][bestCell.col].status = 'booked';
      matrix.selectedCell = bestCell;
      this.emit('booking_success', `Available at ${restaurant.name} - complete on Yelp`, { restaurant, handoffUrl: booking.handoffUrl });

      return {
        type,
        restaurant,
        time,
        booking: {
          restaurantId: restaurant.id,
          restaurantName: restaurant.name,
          requestedTime: time,
          requestedDate: intent.date,
          partySize: intent.partySize,
          status: 'handoff',
          handoffUrl: booking.handoffUrl,
          attemptedAt: new Date(),
        },
      };
    }

    matrix.cells[bestCell.row][bestCell.col].status = 'failed';
    this.emit('booking_failed', `${restaurant.name} booking failed: ${booking.message}`, { restaurant });
    this.emit('recovery_start', 'Finding alternative...');
    matrix.cells[bestCell.row][bestCell.col].status = 'unavailable';
    return this.bookFromMatrix(matrix, intent, type);
  }

  private async findDrinks(dinnerRestaurant: Restaurant, intent: ParsedIntent): Promise<PlanStop | null> {
    const bars = await yelp.searchBusinesses({
      term: 'cocktail bar lounge',
      location: intent.location,
      limit: 5,
      sort_by: 'distance',
    });

    const nearby = bars.filter(bar => {
      const dist = this.haversineDistance(
        dinnerRestaurant.location.coordinates,
        bar.location.coordinates
      );
      return dist < 0.5;
    });

    if (nearby.length === 0) return null;

    const bar = nearby[0];
    const drinksTime = this.addHours(intent.time, 2);

    const distance = this.haversineDistance(
      dinnerRestaurant.location.coordinates,
      bar.location.coordinates
    );

    this.emit('walking_route_calculated', `${Math.round(distance * 20)} min walk to ${bar.name}`, { bar, distance });

    return {
      type: 'drinks',
      restaurant: bar,
      time: drinksTime,
      booking: {
        restaurantId: bar.id,
        restaurantName: bar.name,
        requestedTime: drinksTime,
        requestedDate: intent.date,
        partySize: intent.partySize,
        status: 'confirmed',
        attemptedAt: new Date(),
      },
      walkingFromPrevious: {
        minutes: Math.round(distance * 20),
        distance: Math.round(distance * 1000),
      },
    };
  }

  private haversineDistance(
    a: { latitude: number; longitude: number },
    b: { latitude: number; longitude: number }
  ): number {
    const R = 3959;
    const dLat = (b.latitude - a.latitude) * Math.PI / 180;
    const dLon = (b.longitude - a.longitude) * Math.PI / 180;
    const lat1 = a.latitude * Math.PI / 180;
    const lat2 = b.latitude * Math.PI / 180;

    const x = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  }

  private addHours(time: string, hours: number): string {
    const match = time.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return time;

    let hour = parseInt(match[1]);
    const minutes = match[2];
    if (match[3].toUpperCase() === 'PM' && hour !== 12) hour += 12;
    if (match[3].toUpperCase() === 'AM' && hour === 12) hour = 0;

    hour = (hour + hours) % 24;
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);

    return `${displayHour}:${minutes} ${period}`;
  }

  private estimateCost(stops: PlanStop[], partySize: number): number {
    return stops.reduce((total, stop) => {
      const priceMultiplier = stop.restaurant.priceLevel?.length || 2;
      return total + priceMultiplier * 30 * partySize;
    }, 0);
  }
}
