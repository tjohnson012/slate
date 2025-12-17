import {
  GroupSession,
  GroupParticipant,
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

    let candidates = await yelp.searchBusinesses({
      term: 'restaurant',
      location: session.location,
      limit: 50,
    });

    this.emit({
      type: 'elimination_step',
      message: `Starting with ${candidates.length} restaurants`,
      data: { remaining: candidates.length },
      timestamp: new Date(),
    });

    for (const participant of session.participants) {
      const before = candidates.length;

      for (const dietary of participant.constraints.dietary) {
        candidates = candidates.filter(r => this.matchesDietary(r, dietary));
      }

      for (const noCuisine of participant.constraints.cuisineNo) {
        candidates = candidates.filter(r =>
          !r.categories.some(c => c.toLowerCase().includes(noCuisine.toLowerCase()))
        );
      }

      if (participant.constraints.maxPrice) {
        const maxDollars = Math.ceil(participant.constraints.maxPrice / 25);
        candidates = candidates.filter(r =>
          (r.priceLevel?.length || 2) <= maxDollars
        );
      }

      const eliminated = before - candidates.length;

      if (eliminated > 0) {
        eliminationLog.push({
          constraint: this.summarizeConstraints(participant.constraints),
          participantName: participant.name,
          eliminatedCount: eliminated,
          remainingCount: candidates.length,
        });

        this.emit({
          type: 'elimination_step',
          message: `${participant.name}'s constraints eliminated ${eliminated} options`,
          data: { participant: participant.name, eliminated, remaining: candidates.length },
          timestamp: new Date(),
        });
      }

      if (candidates.length === 0) {
        this.emit({
          type: 'solution_found',
          message: 'No restaurants satisfy all constraints',
          data: { solution: null },
          timestamp: new Date(),
        });

        return { candidates: [], eliminationLog, solution: null, satisfactionScore: 0 };
      }
    }

    const scored = candidates.map(r => ({
      restaurant: r,
      score: this.calculateGroupScore(r, session.participants),
    }));

    scored.sort((a, b) => b.score - a.score);

    const solution = scored[0]?.restaurant || null;
    const satisfactionScore = scored[0]?.score || 0;

    this.emit({
      type: 'solution_found',
      message: solution
        ? `Found it: ${solution.name} satisfies everyone!`
        : 'No perfect match found',
      data: { solution, satisfactionScore },
      timestamp: new Date(),
    });

    return {
      candidates: scored.slice(0, 5).map(s => s.restaurant),
      eliminationLog,
      solution,
      satisfactionScore,
    };
  }

  private matchesDietary(restaurant: Restaurant, dietary: string): boolean {
    const categories = restaurant.categories.map(c => c.toLowerCase()).join(' ');
    const name = restaurant.name.toLowerCase();

    const dietaryMap: Record<string, string[]> = {
      vegetarian: ['vegetarian', 'vegan', 'indian', 'thai', 'salad'],
      vegan: ['vegan', 'vegetarian'],
      'gluten-free': ['gluten-free', 'gluten free'],
      halal: ['halal', 'middle eastern', 'moroccan'],
      kosher: ['kosher', 'jewish'],
    };

    const keywords = dietaryMap[dietary.toLowerCase()] || [dietary.toLowerCase()];
    return keywords.some(k => categories.includes(k) || name.includes(k));
  }

  private summarizeConstraints(constraints: GroupConstraints): string {
    const parts: string[] = [];
    if (constraints.dietary.length) parts.push(constraints.dietary.join(', '));
    if (constraints.cuisineNo.length) parts.push(`no ${constraints.cuisineNo.join('/')}`);
    if (constraints.maxPrice) parts.push(`max $${constraints.maxPrice}pp`);
    if (constraints.accessibility) parts.push('accessible');
    return parts.join(', ') || 'no restrictions';
  }

  private calculateGroupScore(restaurant: Restaurant, participants: GroupParticipant[]): number {
    let score = restaurant.rating * 20;

    for (const participant of participants) {
      for (const cuisine of participant.constraints.cuisineYes) {
        if (restaurant.categories.some(c => c.toLowerCase().includes(cuisine.toLowerCase()))) {
          score += 10;
        }
      }

      score += participant.constraints.vibeKeywords.length * 5;
    }

    return Math.min(100, score);
  }
}
