/**
 * Booking Simulation Layer
 *
 * Simulates the booking flow for demo purposes since we don't have
 * direct access to Yelp's booking API.
 */

import { Restaurant, CellStatus } from './types';

// Whether to use simulation mode (default true for demo)
const DEMO_MODE = process.env.DEMO_MODE !== 'false';

export interface SimulatedAvailability {
  status: CellStatus;
  waitlistAvailable?: boolean;
}

export interface SimulatedBooking {
  success: boolean;
  confirmationNumber?: string;
  failureReason?: string;
  handoffUrl?: string;
}

/**
 * Generate realistic time slots based on the requested time
 */
export function generateTimeSlots(baseTime: string): string[] {
  const match = baseTime.match(/(\d+):?(\d*)\s*(AM|PM)/i);
  if (!match) return ['6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM'];

  let hour = parseInt(match[1]);
  const period = match[3].toUpperCase();
  if (period === 'PM' && hour !== 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;

  const slots: string[] = [];

  // Generate slots around the requested time (-1 hour to +2 hours)
  for (let h = hour - 1; h <= hour + 2; h++) {
    for (const m of [0, 30]) {
      // Only include reasonable dinner hours (5pm - 10pm)
      if (h < 17 || h > 22) continue;

      const displayHour = h > 12 ? h - 12 : (h === 0 ? 12 : h);
      const displayPeriod = h >= 12 ? 'PM' : 'AM';
      slots.push(`${displayHour}:${m.toString().padStart(2, '0')} ${displayPeriod}`);
    }
  }

  return slots.length > 0 ? slots.slice(0, 6) : ['6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM'];
}

/**
 * Simulate checking availability for a single time slot
 * Returns after a realistic delay
 */
export async function simulateSlotCheck(
  restaurant: Restaurant,
  timeSlot: string,
  partySize: number
): Promise<SimulatedAvailability> {
  // Simulate network delay (300-600ms)
  await delay(300 + Math.random() * 300);

  // Determine availability based on various factors
  const availabilityRate = calculateAvailabilityRate(restaurant, timeSlot, partySize);

  const isAvailable = Math.random() < availabilityRate;

  return {
    status: isAvailable ? 'available' : 'unavailable',
    waitlistAvailable: !isAvailable && Math.random() > 0.7,
  };
}

/**
 * Calculate realistic availability rate based on restaurant and time
 */
function calculateAvailabilityRate(
  restaurant: Restaurant,
  timeSlot: string,
  partySize: number
): number {
  let rate = 0.65; // Base 65% availability

  // Popular restaurants (high review count) are harder to book
  if (restaurant.reviewCount > 1000) rate -= 0.15;
  if (restaurant.reviewCount > 2000) rate -= 0.1;

  // High-rated restaurants are harder to book
  if (restaurant.rating >= 4.5) rate -= 0.1;
  if (restaurant.rating >= 4.8) rate -= 0.1;

  // Prime time (7-8pm) is harder
  const hour = parseInt(timeSlot.match(/(\d+):/)?.[1] || '7');
  if (hour === 7 || hour === 8) rate -= 0.1;

  // Large parties harder to accommodate
  if (partySize > 4) rate -= 0.1;
  if (partySize > 6) rate -= 0.15;

  // Weekend effect (simulate it being Saturday night)
  const isWeekend = new Date().getDay() === 0 || new Date().getDay() === 6;
  if (isWeekend) rate -= 0.1;

  // Price level affects availability (expensive places often fully booked)
  const priceLevel = restaurant.priceLevel?.length || 2;
  if (priceLevel >= 3) rate -= 0.1;

  // Clamp between 0.2 and 0.85
  return Math.max(0.2, Math.min(0.85, rate));
}

/**
 * Simulate the full availability matrix check
 */
export async function simulateAvailabilityMatrix(
  restaurants: Restaurant[],
  timeSlots: string[],
  partySize: number,
  onCellUpdate: (row: number, col: number, status: CellStatus) => void
): Promise<CellStatus[][]> {
  const results: CellStatus[][] = restaurants.map(() =>
    timeSlots.map(() => 'idle' as CellStatus)
  );

  // Check each restaurant's availability
  for (let r = 0; r < restaurants.length; r++) {
    // Randomly decide if this restaurant is "fully booked tonight"
    const isFullyBooked = Math.random() < 0.15; // 15% chance

    for (let t = 0; t < timeSlots.length; t++) {
      // Mark as checking
      onCellUpdate(r, t, 'checking');

      // Simulate check delay
      await delay(200 + Math.random() * 200);

      let status: CellStatus;

      if (isFullyBooked) {
        status = 'unavailable';
      } else {
        const result = await simulateSlotCheck(restaurants[r], timeSlots[t], partySize);
        status = result.status;
      }

      results[r][t] = status;
      onCellUpdate(r, t, status);
    }
  }

  return results;
}

/**
 * Simulate a booking attempt
 */
export async function simulateBooking(
  restaurant: Restaurant,
  _date: string,
  _time: string,
  partySize: number
): Promise<SimulatedBooking> {
  // Simulate booking process delay (1.5-2.5 seconds)
  await delay(1500 + Math.random() * 1000);

  // Success rate varies by party size (larger groups harder to accommodate)
  let successRate = 0.9;
  if (partySize > 6) successRate = 0.75;
  if (partySize > 8) successRate = 0.6;

  const success = Math.random() < successRate;

  if (success) {
    return {
      success: true,
      confirmationNumber: generateConfirmationNumber(restaurant.name),
    };
  } else {
    // Booking failed - slot was just taken
    return {
      success: false,
      failureReason: getRandomFailureReason(),
      handoffUrl: restaurant.yelpUrl,
    };
  }
}

/**
 * Generate a realistic-looking confirmation number
 * Format: [RESTAURANT_INITIALS]-[4_DIGITS]
 */
export function generateConfirmationNumber(restaurantName: string): string {
  const initials = restaurantName
    .split(/[\s-]+/)
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 3)
    .padEnd(3, 'X');

  const number = Math.floor(1000 + Math.random() * 9000);

  return `${initials}-${number}`;
}

/**
 * Get a random, realistic failure reason
 */
function getRandomFailureReason(): string {
  const reasons = [
    'That time slot was just booked by another party',
    'The restaurant is no longer accepting reservations for this time',
    'Unable to accommodate party size at this time',
    'Please try a different time or call the restaurant directly',
    'High demand - this slot filled while processing',
  ];

  return reasons[Math.floor(Math.random() * reasons.length)];
}

/**
 * Simulate voice call booking (for voice feature demo)
 */
export async function simulateVoiceBooking(
  restaurant: Restaurant,
  requestedDate: string,
  requestedTime: string,
  requestedPartySize: number,
  guestName: string,
  onTranscriptUpdate: (speaker: 'agent' | 'restaurant', text: string) => void
): Promise<SimulatedBooking> {
  const transcript = [
    { speaker: 'agent' as const, text: `Hi, I'm calling to make a reservation at ${restaurant.name}.`, delay: 1000 },
    { speaker: 'restaurant' as const, text: `Thank you for calling ${restaurant.name}. How can I help you?`, delay: 2000 },
    { speaker: 'agent' as const, text: `I'd like to book a table for ${requestedPartySize} on ${requestedDate} at ${requestedTime}, please.`, delay: 2500 },
    { speaker: 'restaurant' as const, text: `Let me check that for you... One moment please.`, delay: 2000 },
    { speaker: 'restaurant' as const, text: `Yes, we have availability at ${requestedTime}. May I have a name for the reservation?`, delay: 3000 },
    { speaker: 'agent' as const, text: `The reservation will be under ${guestName}.`, delay: 1500 },
    { speaker: 'restaurant' as const, text: `Perfect. I have you down for ${requestedPartySize} guests at ${requestedTime} under ${guestName}.`, delay: 2000 },
  ];

  // Play through the transcript
  for (const line of transcript) {
    await delay(line.delay);
    onTranscriptUpdate(line.speaker, line.text);
  }

  // Generate confirmation
  const confirmationNumber = generateConfirmationNumber(restaurant.name);

  await delay(1500);
  onTranscriptUpdate('restaurant', `Your confirmation number is ${confirmationNumber}. Is there anything else I can help with?`);

  await delay(1000);
  onTranscriptUpdate('agent', `No, that's all. Thank you so much!`);

  await delay(800);
  onTranscriptUpdate('restaurant', `Thank you for choosing ${restaurant.name}. We look forward to seeing you!`);

  return {
    success: true,
    confirmationNumber,
  };
}

/**
 * Check if we should use simulation mode
 */
export function isSimulationMode(): boolean {
  return DEMO_MODE;
}

/**
 * Utility delay function
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
