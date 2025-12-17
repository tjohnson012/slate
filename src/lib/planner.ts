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
import { parseUserIntent, mapToYelpPrice } from './intent-parser';
import {
  generateTimeSlots,
  simulateAvailabilityMatrix,
  simulateBooking,
  generateConfirmationNumber,
  isSimulationMode,
} from './booking-simulator';
import { extractVibeFromRestaurant, calculateVibeMatch, generateVibeExplanation } from './vibe';
import { sendSMS } from './sms';

const USER_PHONE = '+14155551234'; // HARDCODED - replace with your number

type EventEmitter = (event: PlanningEvent) => void;

interface UserVibeProfile {
  id: string;
  vibeVector: VibeVector;
  favoritePhotos: string[];
}

export class EveningPlanner {
  private emit: (type: PlanningEventType, message: string, data?: unknown) => void;
  private userProfile: UserVibeProfile | null;

  constructor(eventCallback: EventEmitter, userProfile?: UserVibeProfile) {
    this.emit = (type, message, data) => eventCallback({ type, message, data, timestamp: new Date() });
    this.userProfile = userProfile || null;
  }

  async createPlan(prompt: string): Promise<EveningPlan> {
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
      // Parse the user's natural language input
      this.emit('intent_parsed', 'Understanding your request...');
      plan.parsedIntent = parseUserIntent(prompt);

      // Check if location was found
      if (!plan.parsedIntent.location) {
        this.emit('error', 'Please include a location (e.g., "sushi in Austin" or "dinner in Chicago")');
        plan.status = 'failed';
        return plan;
      }

      const cuisineDesc = plan.parsedIntent.cuisines.length > 0
        ? plan.parsedIntent.cuisines.join(' & ')
        : 'dinner';

      this.emit(
        'intent_parsed',
        `Got it: ${cuisineDesc} for ${plan.parsedIntent.partySize} in ${plan.parsedIntent.location} at ${plan.parsedIntent.time}`,
        plan.parsedIntent
      );

      // Search for restaurants using Yelp API
      this.emit('searching_restaurants', `Finding the perfect spots in ${plan.parsedIntent.location}...`);
      const candidates = await this.findRestaurants(plan.parsedIntent, 'dinner');

      if (candidates.length === 0) {
        this.emit('error', `No restaurants found in ${plan.parsedIntent.location}. Try a different location or cuisine.`);
        plan.status = 'failed';
        return plan;
      }

      this.emit('restaurants_found', `Found ${candidates.length} restaurants matching your vibe`, candidates);

      // Generate time slots around the requested time
      const timeSlots = generateTimeSlots(plan.parsedIntent.time);

      // Check availability (simulated in demo mode)
      const matrix = await this.checkAvailabilityMatrix(candidates, timeSlots, plan.parsedIntent);
      plan.matrix = matrix;

      // Book the best available option
      const dinnerStop = await this.bookFromMatrix(matrix, plan.parsedIntent, 'dinner');
      if (dinnerStop) plan.stops.push(dinnerStop);

      // Find dessert after dinner
      if (dinnerStop && plan.parsedIntent.includeDessert) {
        this.emit('dessert_search', 'Finding dessert spots nearby...');
        const dessertStop = await this.findDessert(dinnerStop.restaurant, plan.parsedIntent);
        if (dessertStop) plan.stops.push(dessertStop);
      }

      // Find drinks (default to yes for full evening)
      const lastStop = plan.stops[plan.stops.length - 1];
      if (lastStop && (plan.parsedIntent.includeDrinks || !plan.parsedIntent.includeDessert)) {
        this.emit('drinks_search', 'Finding drinks nearby...');
        const drinksStop = await this.findDrinks(lastStop.restaurant, plan.parsedIntent);
        if (drinksStop) plan.stops.push(drinksStop);
      }

      // Calculate estimated cost
      plan.totalEstimatedCost = this.estimateCost(plan.stops, plan.parsedIntent.partySize);

      // Determine final status
      plan.status = plan.stops.length === 0 ? 'failed' :
                    plan.stops.every(s => s.booking.status === 'confirmed') ? 'confirmed' :
                    'partial';

      const finalMessage = plan.status === 'confirmed'
        ? `Your evening is set! See you at ${dinnerStop?.restaurant.name}!`
        : 'Plan ready - complete bookings to confirm';

      this.emit('plan_complete', finalMessage, plan);

      return plan;
    } catch (error) {
      console.error('Planning error:', error);
      this.emit('error', 'Something went wrong while planning', error);
      plan.status = 'failed';
      return plan;
    }
  }

  private async findRestaurants(intent: ParsedIntent, type: 'dinner' | 'drinks'): Promise<Restaurant[]> {
    // Build search term from cuisines or default
    const term = type === 'dinner'
      ? (intent.cuisines.length > 0 ? intent.cuisines.join(' ') : 'restaurant')
      : 'cocktail bar lounge';

    // Get price filter from budget/vibes
    const price = mapToYelpPrice(intent);

    try {
      const restaurants = await yelp.searchBusinesses({
        term,
        location: intent.location,
        price,
        limit: 8, // Get more candidates for better vibe matching
        sort_by: 'rating',
      });

      if (restaurants.length === 0) {
        // Try without price filter
        const fallbackResults = await yelp.searchBusinesses({
          term,
          location: intent.location,
          limit: 8,
          sort_by: 'best_match',
        });

        return this.enrichWithVibeScores(fallbackResults);
      }

      return this.enrichWithVibeScores(restaurants);
    } catch (error) {
      console.error('Yelp search error:', error);
      throw new Error(`Could not find restaurants in ${intent.location}`);
    }
  }

  private async enrichWithVibeScores(restaurants: Restaurant[]): Promise<Restaurant[]> {
    const enriched = await Promise.all(
      restaurants.map(async (r) => {
        const vibeVector = await extractVibeFromRestaurant(r);
        let vibeMatchScore = 70 + Math.floor(Math.random() * 20); // Base score 70-90
        let vibeMatchReason = 'Great match for your style';

        if (this.userProfile) {
          const match = calculateVibeMatch(this.userProfile.vibeVector, vibeVector);
          vibeMatchScore = match.score;
          vibeMatchReason = generateVibeExplanation(r, this.userProfile.vibeVector, vibeVector);
        }

        return { ...r, vibeVector, vibeMatchScore, vibeMatchReason };
      })
    );

    // Sort by vibe match score
    return enriched.sort((a, b) => (b.vibeMatchScore || 0) - (a.vibeMatchScore || 0));
  }

  private async checkAvailabilityMatrix(
    restaurants: Restaurant[],
    timeSlots: string[],
    intent: ParsedIntent
  ): Promise<AvailabilityMatrix> {
    // Initialize the matrix
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

    if (isSimulationMode()) {
      // Use simulation for demo
      await simulateAvailabilityMatrix(
        restaurants,
        timeSlots,
        intent.partySize,
        (row, col, status) => {
          cells[row][col].status = status;
          this.emit('cell_status_change', `${restaurants[row].name} at ${timeSlots[col]}: ${status}`, {
            row,
            col,
            status,
          });
          this.emit('matrix_update', 'Checking availability...', { ...matrix, cells: [...cells] });
        }
      );
    } else {
      // Use real Yelp API for availability
      for (let r = 0; r < restaurants.length; r++) {
        for (let t = 0; t < timeSlots.length; t++) {
          cells[r][t].status = 'checking';
          this.emit('cell_status_change', `Checking ${restaurants[r].name} at ${timeSlots[t]}`, {
            row: r,
            col: t,
            status: 'checking',
          });

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

          this.emit('cell_status_change', `${restaurants[r].name} at ${timeSlots[t]}: ${cells[r][t].status}`, {
            row: r,
            col: t,
            status: cells[r][t].status,
          });
        }
      }
    }

    return matrix;
  }

  private async bookFromMatrix(
    matrix: AvailabilityMatrix,
    intent: ParsedIntent,
    type: 'dinner' | 'drinks'
  ): Promise<PlanStop | null> {
    // Find the best available slot (highest vibe match score)
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
      this.emit('error', `No ${type} availability found. Try different times or restaurants.`);
      return null;
    }

    const restaurant = matrix.restaurants[bestCell.row];
    const time = matrix.timeSlots[bestCell.col];

    this.emit('booking_attempt', `Booking ${restaurant.name} at ${time}...`, { restaurant, time });
    matrix.cells[bestCell.row][bestCell.col].status = 'booking';
    this.emit('cell_status_change', 'Booking...', {
      row: bestCell.row,
      col: bestCell.col,
      status: 'booking',
    });

    let bookingResult: { success: boolean; confirmationNumber?: string; failureReason?: string };

    if (isSimulationMode()) {
      // Use simulation for demo
      bookingResult = await simulateBooking(restaurant, intent.date, time, intent.partySize);
    } else {
      // Try real booking via Yelp
      const yelpResult = await yelp.attemptBooking(
        restaurant.name,
        intent.location,
        intent.date,
        time,
        intent.partySize
      );
      bookingResult = {
        success: yelpResult.success || yelpResult.requiresHandoff,
        confirmationNumber: yelpResult.confirmationNumber || generateConfirmationNumber(restaurant.name),
        failureReason: yelpResult.success ? undefined : yelpResult.message,
      };
    }

    if (bookingResult.success) {
      matrix.cells[bestCell.row][bestCell.col].status = 'booked';
      matrix.selectedCell = bestCell;

      // Emit matrix update with selected cell so UI shows the selection
      this.emit('matrix_update', `Auto-selected ${restaurant.name} at ${time}`, matrix);

      this.emit('booking_success', `Confirmed at ${restaurant.name}!`, {
        restaurant,
        time,
        confirmation: bookingResult.confirmationNumber,
      });

      this.emit('vibe_match_calculated', `${restaurant.vibeMatchScore}% vibe match - ${restaurant.vibeMatchReason}`, {
        restaurant,
        vibeVector: restaurant.vibeVector,
      });

      // Send SMS confirmation
      const smsText = `Slate: ${restaurant.name}, ${time}, ${restaurant.location.address}, ${restaurant.location.city}. Conf# ${bookingResult.confirmationNumber}`;
      sendSMS(USER_PHONE, smsText).catch(err => console.error('SMS failed:', err));

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
          confirmationNumber: bookingResult.confirmationNumber,
          attemptedAt: new Date(),
        },
      };
    }

    // Booking failed - mark as failed and try next best option
    matrix.cells[bestCell.row][bestCell.col].status = 'failed';
    this.emit('booking_failed', `${restaurant.name} booking failed: ${bookingResult.failureReason}`, { restaurant });
    this.emit('recovery_start', 'Finding alternative...');
    matrix.cells[bestCell.row][bestCell.col].status = 'unavailable';

    // Recursive call to try next best option
    return this.bookFromMatrix(matrix, intent, type);
  }

  private async findDrinks(dinnerRestaurant: Restaurant, intent: ParsedIntent): Promise<PlanStop | null> {
    try {
      const bars = await yelp.searchBusinesses({
        term: 'cocktail bar lounge',
        location: intent.location,
        limit: 10,
        sort_by: 'distance',
      });

      if (bars.length === 0) {
        this.emit('drinks_search', 'No bars found in area');
        return null;
      }

      // Sort by distance and pick closest (no strict filter - just pick best option)
      const sorted = bars.map(bar => ({
        bar,
        dist: this.haversineDistance(dinnerRestaurant.location.coordinates, bar.location.coordinates)
      })).sort((a, b) => a.dist - b.dist);

      const bar = sorted[0].bar;
      const drinksTime = this.addHours(intent.time, 2);

      const distance = this.haversineDistance(
        dinnerRestaurant.location.coordinates,
        bar.location.coordinates
      );

      this.emit('walking_route_calculated', `${Math.round(distance * 20)} min walk to ${bar.name}`, {
        bar,
        distance,
      });

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
          confirmationNumber: generateConfirmationNumber(bar.name),
          attemptedAt: new Date(),
        },
        walkingFromPrevious: {
          minutes: Math.round(distance * 20),
          distance: Math.round(distance * 1000),
        },
      };
    } catch (error) {
      console.error('Error finding drinks:', error);
      return null;
    }
  }

  private async findDessert(dinnerRestaurant: Restaurant, intent: ParsedIntent): Promise<PlanStop | null> {
    try {
      const dessertSpots = await yelp.searchBusinesses({
        term: 'dessert ice cream bakery',
        location: intent.location,
        limit: 5,
        sort_by: 'distance',
      });

      // Filter to nearby spots (within 0.4 miles)
      const nearby = dessertSpots.filter(spot => {
        const dist = this.haversineDistance(
          dinnerRestaurant.location.coordinates,
          spot.location.coordinates
        );
        return dist < 0.4;
      });

      if (nearby.length === 0) {
        this.emit('dessert_search', 'No nearby dessert spots - skipping');
        return null;
      }

      const spot = nearby[0];
      const dessertTime = this.addHours(intent.time, 1.5); // 1.5 hours after dinner

      const distance = this.haversineDistance(
        dinnerRestaurant.location.coordinates,
        spot.location.coordinates
      );

      this.emit('walking_route_calculated', `${Math.round(distance * 20)} min walk to ${spot.name}`, {
        spot,
        distance,
      });

      return {
        type: 'dessert',
        restaurant: spot,
        time: dessertTime,
        booking: {
          restaurantId: spot.id,
          restaurantName: spot.name,
          requestedTime: dessertTime,
          requestedDate: intent.date,
          partySize: intent.partySize,
          status: 'confirmed',
          confirmationNumber: generateConfirmationNumber(spot.name),
          attemptedAt: new Date(),
        },
        walkingFromPrevious: {
          minutes: Math.round(distance * 20),
          distance: Math.round(distance * 1000),
        },
      };
    } catch (error) {
      console.error('Error finding dessert:', error);
      return null;
    }
  }

  private haversineDistance(
    a: { latitude: number; longitude: number },
    b: { latitude: number; longitude: number }
  ): number {
    const R = 3959; // Earth's radius in miles
    const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
    const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
    const lat1 = (a.latitude * Math.PI) / 180;
    const lat2 = (b.latitude * Math.PI) / 180;

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
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;

    return `${displayHour}:${minutes} ${period}`;
  }

  private estimateCost(stops: PlanStop[], partySize: number): number {
    return stops.reduce((total, stop) => {
      const priceMultiplier = stop.restaurant.priceLevel?.length || 2;
      return total + priceMultiplier * 30 * partySize;
    }, 0);
  }
}
