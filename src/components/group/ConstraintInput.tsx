'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { GroupConstraints } from '@/lib/types';

interface Props {
  onSubmit: (constraints: GroupConstraints) => void;
  isSubmitting?: boolean;
}

const dietaryOptions = ['Vegetarian', 'Vegan', 'Gluten-free', 'Halal', 'Kosher', 'Nut allergy'];
const cuisineOptions = ['Italian', 'Japanese', 'Mexican', 'Thai', 'Indian', 'Chinese', 'American', 'Mediterranean', 'Korean', 'French'];

export function ConstraintInput({ onSubmit, isSubmitting }: Props) {
  const [dietary, setDietary] = useState<string[]>([]);
  const [cuisineYes, setCuisineYes] = useState<string[]>([]);
  const [cuisineNo, setCuisineNo] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(3);
  const [accessibility, setAccessibility] = useState(false);
  const [other, setOther] = useState('');

  const toggle = (arr: string[], item: string, setter: (v: string[]) => void) => {
    setter(arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item]);
  };

  const handleSubmit = () => {
    onSubmit({
      dietary,
      cuisineYes,
      cuisineNo,
      vibeKeywords: [],
      maxPrice,
      accessibility,
      other,
    });
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div>
        <h3 className="text-sm font-medium text-zinc-400 mb-3">Dietary restrictions</h3>
        <div className="flex flex-wrap gap-2">
          {dietaryOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => toggle(dietary, opt, setDietary)}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                dietary.includes(opt)
                  ? 'bg-amber-500 text-zinc-900'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-zinc-400 mb-3">Cuisines I&apos;d love</h3>
        <div className="flex flex-wrap gap-2">
          {cuisineOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => {
                if (cuisineNo.includes(opt)) return;
                toggle(cuisineYes, opt, setCuisineYes);
              }}
              disabled={cuisineNo.includes(opt)}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                cuisineYes.includes(opt)
                  ? 'bg-emerald-500 text-zinc-900'
                  : cuisineNo.includes(opt)
                  ? 'bg-zinc-900 text-zinc-600 cursor-not-allowed'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-zinc-400 mb-3">Hard no&apos;s</h3>
        <div className="flex flex-wrap gap-2">
          {cuisineOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => {
                if (cuisineYes.includes(opt)) return;
                toggle(cuisineNo, opt, setCuisineNo);
              }}
              disabled={cuisineYes.includes(opt)}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                cuisineNo.includes(opt)
                  ? 'bg-red-500 text-white'
                  : cuisineYes.includes(opt)
                  ? 'bg-zinc-900 text-zinc-600 cursor-not-allowed'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-zinc-400 mb-3">Max price level</h3>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((level) => (
            <button
              key={level}
              onClick={() => setMaxPrice(level)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                maxPrice >= level
                  ? 'bg-amber-500 text-zinc-900'
                  : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {'$'.repeat(level)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setAccessibility(!accessibility)}
          className={`w-12 h-6 rounded-full transition-colors relative ${
            accessibility ? 'bg-amber-500' : 'bg-zinc-700'
          }`}
        >
          <motion.div
            className="absolute top-1 w-4 h-4 bg-white rounded-full"
            animate={{ left: accessibility ? 28 : 4 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </button>
        <span className="text-sm text-zinc-300">Wheelchair accessible required</span>
      </div>

      <div>
        <h3 className="text-sm font-medium text-zinc-400 mb-2">Anything else?</h3>
        <textarea
          value={other}
          onChange={(e) => setOther(e.target.value)}
          placeholder="Outdoor seating preferred, celebrating a birthday..."
          className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 resize-none"
          rows={2}
        />
      </div>

      <motion.button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full py-3 bg-amber-500 text-zinc-900 font-semibold rounded-xl disabled:opacity-50"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        {isSubmitting ? 'Submitting...' : 'Submit my preferences'}
      </motion.button>
    </motion.div>
  );
}
