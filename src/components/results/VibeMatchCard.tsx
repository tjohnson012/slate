'use client';

import { motion } from 'framer-motion';
import { Restaurant, VibeVector } from '@/lib/types';

interface Props {
  restaurant: Restaurant;
  vibeVector: VibeVector;
  matchScore: number;
  matchReason: string;
}

const dimensions: { key: keyof VibeVector; label: string; low: string; high: string }[] = [
  { key: 'lighting', label: 'Lighting', low: 'Dim', high: 'Bright' },
  { key: 'noiseLevel', label: 'Volume', low: 'Quiet', high: 'Lively' },
  { key: 'crowdVibe', label: 'Crowd', low: 'Local', high: 'Scene' },
  { key: 'formality', label: 'Style', low: 'Casual', high: 'Upscale' },
];

export function VibeMatchCard({ restaurant, vibeVector, matchScore, matchReason }: Props) {
  return (
    <motion.div
      className="bg-zinc-900 rounded-xl p-6 border border-zinc-800"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-white">Why {restaurant.name}</h3>
        <div className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-sm font-medium">
          {matchScore}% Match
        </div>
      </div>

      <div className="space-y-3 mb-4">
        {dimensions.map((dim, i) => (
          <div key={dim.key}>
            <div className="flex justify-between text-xs text-zinc-500 mb-1">
              <span>{dim.low}</span>
              <span className="text-zinc-400">{dim.label}</span>
              <span>{dim.high}</span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${vibeVector[dim.key]}%` }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
              />
            </div>
          </div>
        ))}
      </div>

      <p className="text-zinc-400 text-sm italic">&quot;{matchReason}&quot;</p>
    </motion.div>
  );
}
