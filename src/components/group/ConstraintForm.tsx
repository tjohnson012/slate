'use client';

import { useState } from 'react';
import { Button, Input } from '@/components/shared';

interface Constraints {
  name: string;
  dietary: string[];
  avoidCuisines: string;
  vibe: string;
  budget: string;
  accessibility: boolean;
  notes: string;
}

interface ConstraintFormProps {
  onSubmit: (constraints: Constraints) => void;
  loading?: boolean;
}

const dietaryOptions = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Kosher', 'Halal'];
const vibeOptions = ['Quiet', 'Lively', 'Trendy', 'Casual', 'Upscale', 'Cozy'];
const budgetOptions = ['$20', '$40', '$60', '$80', '$100+'];

export function ConstraintForm({ onSubmit, loading }: ConstraintFormProps) {
  const [name, setName] = useState('');
  const [dietary, setDietary] = useState<string[]>([]);
  const [avoidCuisines, setAvoidCuisines] = useState('');
  const [vibe, setVibe] = useState('');
  const [budget, setBudget] = useState('');
  const [accessibility, setAccessibility] = useState(false);
  const [notes, setNotes] = useState('');

  const toggleDietary = (option: string) => {
    setDietary(prev => prev.includes(option) ? prev.filter(d => d !== option) : [...prev, option]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, dietary, avoidCuisines, vibe, budget, accessibility, notes });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Your Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your name"
        required
      />

      <div>
        <label className="block text-sm font-medium text-slate-white mb-2">Dietary Restrictions</label>
        <div className="flex flex-wrap gap-2">
          {dietaryOptions.map(option => (
            <button
              key={option}
              type="button"
              onClick={() => toggleDietary(option)}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                dietary.includes(option)
                  ? 'bg-slate-red text-white'
                  : 'bg-charcoal border border-light-gray/20 text-slate-white hover:border-slate-red/50'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <Input
        label="Cuisines to Avoid"
        value={avoidCuisines}
        onChange={(e) => setAvoidCuisines(e.target.value)}
        placeholder="e.g., Thai, Indian (comma separated)"
      />

      <div>
        <label className="block text-sm font-medium text-slate-white mb-2">Preferred Vibe</label>
        <div className="flex flex-wrap gap-2">
          {vibeOptions.map(option => (
            <button
              key={option}
              type="button"
              onClick={() => setVibe(option)}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                vibe === option
                  ? 'bg-slate-red text-white'
                  : 'bg-charcoal border border-light-gray/20 text-slate-white hover:border-slate-red/50'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-white mb-2">Budget per Person</label>
        <div className="flex flex-wrap gap-2">
          {budgetOptions.map(option => (
            <button
              key={option}
              type="button"
              onClick={() => setBudget(option)}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                budget === option
                  ? 'bg-slate-red text-white'
                  : 'bg-charcoal border border-light-gray/20 text-slate-white hover:border-slate-red/50'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="accessibility"
          checked={accessibility}
          onChange={(e) => setAccessibility(e.target.checked)}
          className="w-5 h-5 rounded border-light-gray/20 bg-charcoal text-slate-red focus:ring-slate-red"
        />
        <label htmlFor="accessibility" className="text-sm text-slate-white">
          Need wheelchair accessibility
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-white mb-2">Additional Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any other preferences..."
          className="w-full px-4 py-3 bg-charcoal border border-light-gray/20 rounded-lg text-slate-white placeholder:text-warm-gray focus:outline-none focus:border-slate-red resize-none"
          rows={3}
        />
      </div>

      <Button type="submit" fullWidth size="lg" loading={loading}>
        Submit Preferences
      </Button>
    </form>
  );
}
