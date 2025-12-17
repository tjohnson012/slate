// Vibe dimensions - each scored 0-100
export interface VibeVector {
  lighting: number;        // 0=dim/moody, 100=bright/airy
  noiseLevel: number;      // 0=quiet/intimate, 100=loud/energetic
  crowdVibe: number;       // 0=neighborhood/locals, 100=scene/trendy
  formality: number;       // 0=casual, 100=upscale/formal
  adventurousness: number; // 0=classic/familiar, 100=experimental/bold
  priceLevel: number;      // 0=budget, 100=splurge
}

export interface VibePhoto {
  id: string;
  url: string;
  vibeVector: VibeVector;
  description: string;
}

export interface UserProfile {
  id: string;
  phone?: string;
  vibeVector: VibeVector;
  favoritePhotos: string[];
  bookingHistory: BookingRecord[];
  patterns: UserPatterns;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPatterns {
  preferredDays: string[];
  preferredTimes: string[];
  usualPartySize: number;
  cuisineFrequency: Record<string, number>;
  neighborhoodFrequency: Record<string, number>;
}

export interface Restaurant {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  priceLevel: string;
  categories: string[];
  location: {
    address: string;
    city: string;
    neighborhood?: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  phone: string;
  yelpUrl: string;
  imageUrl: string;
  photos: string[];
  hours?: {
    isOpenNow: boolean;
  };
  vibeVector?: VibeVector;
  vibeMatchScore?: number;
  vibeMatchReason?: string;
}

export type CellStatus =
  | 'idle'
  | 'checking'
  | 'available'
  | 'unavailable'
  | 'selected'
  | 'booking'
  | 'booked'
  | 'failed';

export interface AvailabilityCell {
  restaurantId: string;
  restaurantName: string;
  time: string;
  status: CellStatus;
  vibeMatchScore?: number;
}

export interface AvailabilityMatrix {
  restaurants: Restaurant[];
  timeSlots: string[];
  cells: AvailabilityCell[][];
  selectedCell?: { row: number; col: number };
}

export interface BookingAttempt {
  restaurantId: string;
  restaurantName: string;
  requestedTime: string;
  requestedDate: string;
  partySize: number;
  status: 'pending' | 'confirmed' | 'failed' | 'handoff';
  confirmationNumber?: string;
  handoffUrl?: string;
  failureReason?: string;
  attemptedAt: Date;
}

export interface BookingRecord {
  id: string;
  restaurant: Restaurant;
  date: string;
  time: string;
  partySize: number;
  confirmationNumber?: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  vibeMatchScore: number;
  createdAt: Date;
}

export interface PlanStop {
  type: 'dinner' | 'drinks' | 'dessert';
  restaurant: Restaurant;
  time: string;
  booking: BookingAttempt;
  walkingFromPrevious?: {
    minutes: number;
    distance: number;
    polyline?: string;
  };
}

export interface EveningPlan {
  id: string;
  userId: string;
  status: 'planning' | 'booking' | 'confirmed' | 'partial' | 'failed';
  prompt: string;
  parsedIntent: ParsedIntent;
  stops: PlanStop[];
  matrix?: AvailabilityMatrix;
  totalEstimatedCost: number;
  createdAt: Date;
}

export interface ParsedIntent {
  date: string;
  time: string;
  partySize: number;
  location: string;
  cuisines: string[];
  vibeKeywords: string[];
  budget?: number;
  occasion?: string;
  includeDrinks: boolean;
  includeDessert: boolean;
  dietaryRestrictions: string[];
}

export interface GroupSession {
  id: string;
  creatorId: string;
  status: 'collecting' | 'solving' | 'solved' | 'booked';
  date: string;
  time: string;
  location: string;
  participants: GroupParticipant[];
  solution?: Restaurant;
  booking?: BookingAttempt;
  createdAt: Date;
  expiresAt: Date;
}

export interface GroupParticipant {
  id: string;
  name: string;
  phone?: string;
  constraints: GroupConstraints;
  joinedAt: Date;
}

export interface GroupConstraints {
  dietary: string[];
  cuisineYes: string[];
  cuisineNo: string[];
  vibeKeywords: string[];
  maxPrice: number;
  accessibility: boolean;
  other: string;
}

export interface ConstraintSolverResult {
  candidates: Restaurant[];
  eliminationLog: EliminationStep[];
  solution: Restaurant | null;
  satisfactionScore: number;
}

export interface EliminationStep {
  constraint: string;
  participantName: string;
  eliminatedCount: number;
  remainingCount: number;
}

export interface ProactiveOpportunity {
  id: string;
  userId: string;
  type: 'cancellation' | 'new_opening' | 'pattern_suggestion';
  restaurant: Restaurant;
  availableSlot: {
    date: string;
    time: string;
  };
  vibeMatchScore: number;
  message: string;
  status: 'pending' | 'sent' | 'accepted' | 'declined' | 'expired';
  createdAt: Date;
  expiresAt: Date;
}

export interface SMSMessage {
  id: string;
  userId: string;
  direction: 'inbound' | 'outbound';
  body: string;
  context?: {
    opportunityId?: string;
    planId?: string;
    groupSessionId?: string;
  };
  timestamp: Date;
}

export interface SMSConversationState {
  userId: string;
  awaitingResponse: boolean;
  pendingAction?: {
    type: 'confirm_booking' | 'accept_opportunity' | 'group_invite';
    data: Record<string, unknown>;
  };
  lastMessageAt: Date;
}

export type PlanningEventType =
  | 'intent_parsed'
  | 'searching_restaurants'
  | 'restaurants_found'
  | 'matrix_update'
  | 'cell_status_change'
  | 'booking_attempt'
  | 'booking_success'
  | 'booking_failed'
  | 'recovery_start'
  | 'vibe_match_calculated'
  | 'drinks_search'
  | 'walking_route_calculated'
  | 'plan_complete'
  | 'error';

export interface PlanningEvent {
  type: PlanningEventType;
  message: string;
  data?: unknown;
  timestamp: Date;
}

export type GroupEventType =
  | 'participant_joined'
  | 'constraint_added'
  | 'solving_started'
  | 'elimination_step'
  | 'solution_found'
  | 'booking_started'
  | 'booking_complete';

export interface GroupEvent {
  type: GroupEventType;
  message: string;
  data?: unknown;
  timestamp: Date;
}

export interface YelpChatResponse {
  response: {
    text: string;
    businesses?: YelpBusiness[];
  };
  chat_id: string;
}

export interface YelpBusiness {
  id: string;
  name: string;
  rating: number;
  review_count: number;
  price?: string;
  categories: { alias: string; title: string }[];
  location: {
    address1: string;
    city: string;
    state: string;
    zip_code: string;
    neighborhood?: string;
  };
  coordinates: {
    latitude: number;
    longitude: number;
  };
  phone: string;
  url: string;
  image_url: string;
  photos?: string[];
  hours?: { is_open_now: boolean }[];
}
