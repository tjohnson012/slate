'use client';

import { motion } from 'framer-motion';
import { VibeDimensionBar } from '@/components/shared';

interface VibeProfileProps {
  profile: {
    lighting: number;
    noiseLevel: number;
    crowdVibe: number;
    formality: number;
    adventurousness: number;
    priceLevel: number;
  };
}

const dimensions = [
  {
    key: 'lighting' as const,
    label: 'Lighting',
    lowLabel: 'Dim & Moody',
    highLabel: 'Bright & Airy',
    getDescription: (v: number) => v < 40 ? 'You prefer intimate, dimly lit spaces' : v > 60 ? 'You like bright, open atmospheres' : 'You enjoy varied lighting',
  },
  {
    key: 'noiseLevel' as const,
    label: 'Energy',
    lowLabel: 'Quiet & Intimate',
    highLabel: 'Loud & Energetic',
    getDescription: (v: number) => v < 40 ? 'You prefer quieter conversations' : v > 60 ? 'You thrive in bustling scenes' : 'You adapt to any energy',
  },
  {
    key: 'crowdVibe' as const,
    label: 'Crowd',
    lowLabel: 'Locals & Regulars',
    highLabel: 'Scene & Trendy',
    getDescription: (v: number) => v < 40 ? 'You like neighborhood gems' : v > 60 ? 'You enjoy being where the action is' : 'You appreciate both vibes',
  },
  {
    key: 'formality' as const,
    label: 'Style',
    lowLabel: 'Casual',
    highLabel: 'Upscale',
    getDescription: (v: number) => v < 40 ? 'You keep it relaxed' : v > 60 ? 'You appreciate refined experiences' : 'You dress for the occasion',
  },
];

export function VibeProfile({ profile }: VibeProfileProps) {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="font-display text-2xl font-bold text-slate-white mb-2">
          Your Vibe Profile
        </h2>
        <p className="text-warm-gray">
          Based on your selections, here&apos;s what we learned about you
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-charcoal rounded-xl p-6 space-y-6"
      >
        {dimensions.map((dim, index) => (
          <motion.div
            key={dim.key}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
          >
            <VibeDimensionBar
              label={dim.label}
              lowLabel={dim.lowLabel}
              highLabel={dim.highLabel}
              value={profile[dim.key]}
              description={dim.getDescription(profile[dim.key])}
              animationDelay={0.4 + index * 0.15}
            />
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-slate-red/10 border border-slate-red/20 rounded-xl p-4"
      >
        <p className="text-sm text-slate-white">
          <span className="font-medium">Pro tip:</span> Your profile helps us find spots that match your energy.
          The more you use Slate, the better we get at reading your vibe.
        </p>
      </motion.div>
    </div>
  );
}

// Helper to calculate vibe from selected photos
export function calculateVibeFromPhotos(selectedIds: string[]): VibeProfileProps['profile'] {
  // This would normally analyze the actual photos
  // For now, generate a profile based on selection patterns
  const hash = selectedIds.reduce((acc, id) => acc + parseInt(id), 0);

  return {
    lighting: Math.min(100, Math.max(0, 30 + (hash % 50))),
    noiseLevel: Math.min(100, Math.max(0, 25 + ((hash * 2) % 55))),
    crowdVibe: Math.min(100, Math.max(0, 40 + ((hash * 3) % 40))),
    formality: Math.min(100, Math.max(0, 35 + ((hash * 4) % 45))),
    adventurousness: Math.min(100, Math.max(0, 50 + ((hash * 5) % 30))),
    priceLevel: Math.min(100, Math.max(0, 45 + ((hash * 6) % 35))),
  };
}
