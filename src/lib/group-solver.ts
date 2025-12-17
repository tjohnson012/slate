import {
  GroupSession,
  GroupConstraints,
  Restaurant,
  ConstraintSolverResult,
  EliminationStep,
  GroupEvent,
} from './types';
import { yelp } from './yelp';

type EventEmitter = (event: GroupEvent) => void;

export class GroupConstraintSolver {
  private emit: EventEmitter;

  constructor(emit: EventEmitter) {
    this.emit = emit;
  }

  async solve(session: GroupSession): Promise<ConstraintSolverResult> {
    const eliminationLog: EliminationStep[] = [];

    this.emit({
      type: 'solving_started',
      message: `Finding a place that works for all ${session.participants.length} people...`,
      timestamp: new Date(),
    });

    // Get initial candidates - search for multiple terms to get variety
    let candidates: Restaurant[] = [];

    try {
      const results = await yelp.searchBusinesses({
        term: 'restaurant',
        location: session.location,
        limit: 50,
      });
      candidates = results;
    } catch (error) {
      console.error('Yelp search failed:', error);
      this.emit({
        type: 'solution_found',
        message: 'Could not search restaurants. Check Yelp API key.',
        data: { solution: null },
        timestamp: new Date(),
      });
      return { candidates: [], eliminationLog, solution: null, satisfactionScore: 0 };
    }

    if (candidates.length === 0) {
      this.emit({
        type: 'solution_found',
        message: `No restaurants found in ${session.location}. Try a different location.`,
        data: { solution: null },
        timestamp: new Date(),
      });
      return { candidates: [], eliminationLog, solution: null, satisfactionScore: 0 };
    }

    this.emit({
      type: 'elimination_step',
      message: `Starting with ${candidates.length} restaurants in ${session.location}`,
      data: { remaining: candidates.length },
      timestamp: new Date(),
    });

    // Score each restaurant instead of eliminating
    const scored = candidates.map(r => ({
      restaurant: r,
      score: 100,
      penalties: [] as string[],
    }));

    // Apply constraints as scoring penalties instead of hard elimination
    for (const participant of session.participants) {
      await this.delay(300); // Visual pacing

      let penaltyCount = 0;

      for (const item of scored) {
        let penalty = 0;
        const reasons: string[] = [];

        // Dietary constraints - heavy penalty but don't eliminate
        for (const dietary of participant.constraints.dietary) {
          if (!this.matchesDietary(item.restaurant, dietary)) {
            penalty += 30;
            reasons.push(`no ${dietary} options`);
          }
        }

        // Cuisine exclusions - heavy penalty
        for (const noCuisine of participant.constraints.cuisineNo) {
          if (item.restaurant.categories.some(c =>
            c.toLowerCase().includes(noCuisine.toLowerCase())
          )) {
            penalty += 50;
            reasons.push(`serves ${noCuisine}`);
          }
        }

        // Price constraint
        if (participant.constraints.maxPrice) {
          const priceLevel = item.restaurant.priceLevel?.length || 2;
          const maxDollars = Math.ceil(participant.constraints.maxPrice / 25);
          if (priceLevel > maxDollars) {
            penalty += 20;
            reasons.push('over budget');
          }
        }

        // Cuisine preferences - bonus for matching
        for (const yesCuisine of participant.constraints.cuisineYes) {
          if (item.restaurant.categories.some(c =>
            c.toLowerCase().includes(yesCuisine.toLowerCase())
          )) {
            penalty -= 15; // Bonus
          }
        }

        if (penalty > 0) {
          penaltyCount++;
          item.score -= penalty;
          item.penalties.push(...reasons);
        }
      }

      eliminationLog.push({
        constraint: this.summarizeConstraints(participant.constraints),
        participantName: participant.name,
        eliminatedCount: penaltyCount,
        remainingCount: scored.filter(s => s.score > 0).length,
      });

      this.emit({
        type: 'elimination_step',
        message: `${participant.name}'s preferences: ${penaltyCount} restaurants scored lower`,
        data: {
          participant: participant.name,
          eliminated: penaltyCount,
          remaining: scored.filter(s => s.score > 0).length
        },
        timestamp: new Date(),
      });
    }

    // Sort by score
    scored.sort((a, b) => b.score - a.score);

    // Get the best options (score > 0, or top 5 if all negative)
    let viable = scored.filter(s => s.score > 0);
    if (viable.length === 0) {
      viable = scored.slice(0, 5); // Take top 5 even if negative
    }

    const solution = viable[0]?.restaurant || null;
    const satisfactionScore = Math.max(0, viable[0]?.score || 0);

    await this.delay(500);

    if (solution) {
      this.emit({
        type: 'solution_found',
        message: `Found it: ${solution.name} works for everyone!`,
        data: { solution, satisfactionScore },
        timestamp: new Date(),
      });
    } else {
      this.emit({
        type: 'solution_found',
        message: 'Could not find a match. Try relaxing some constraints.',
        data: { solution: null },
        timestamp: new Date(),
      });
    }

    return {
      candidates: viable.slice(0, 5).map(s => s.restaurant),
      eliminationLog,
      solution,
      satisfactionScore,
    };
  }

  private matchesDietary(restaurant: Restaurant, dietary: string): boolean {
    const categories = restaurant.categories.map(c => c.toLowerCase()).join(' ');
    const name = restaurant.name.toLowerCase();

    // More flexible matching
    const dietaryMap: Record<string, string[]> = {
      vegetarian: ['vegetarian', 'vegan', 'indian', 'thai', 'salad', 'mediterranean', 'middle eastern', 'asian', 'japanese', 'chinese', 'mexican'],
      vegan: ['vegan', 'vegetarian', 'salad', 'juice', 'smoothie'],
      'gluten-free': ['gluten-free', 'gluten free', 'salad', 'mexican', 'steakhouse', 'seafood'],
      halal: ['halal', 'middle eastern', 'moroccan', 'turkish', 'mediterranean', 'indian', 'pakistani'],
      kosher: ['kosher', 'jewish', 'deli'],
    };

    const keywords = dietaryMap[dietary.toLowerCase()] || [dietary.toLowerCase()];
    return keywords.some(k => categories.includes(k) || name.includes(k));
  }

  private summarizeConstraints(constraints: GroupConstraints): string {
    const parts: string[] = [];
    if (constraints.dietary.length) parts.push(constraints.dietary.join(', '));
    if (constraints.cuisineNo.length) parts.push(`no ${constraints.cuisineNo.join('/')}`);
    if (constraints.cuisineYes.length) parts.push(`wants ${constraints.cuisineYes.join('/')}`);
    if (constraints.maxPrice) parts.push(`max $${constraints.maxPrice}pp`);
    if (constraints.accessibility) parts.push('accessible');
    return parts.join(', ') || 'flexible';
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
