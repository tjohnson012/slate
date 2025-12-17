'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { VibePhotoGrid } from '@/components/onboarding/VibePhotoGrid';
import { usePlanStore } from '@/stores/planStore';
import { calculateVibeFromSelections } from '@/lib/vibe';

export default function OnboardingPage() {
  const router = useRouter();
  const { updateVibeVector, setFavoritePhotos } = usePlanStore();
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);

  const handleSelect = (photoIds: string[]) => {
    setSelectedPhotos(photoIds);
  };

  const handleContinue = () => {
    if (selectedPhotos.length < 3) return;

    const vibeVector = calculateVibeFromSelections(selectedPhotos);
    updateVibeVector(vibeVector);
    setFavoritePhotos(selectedPhotos);
    router.push('/plan');
  };

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-12">
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            What&apos;s your vibe?
          </h1>
          <p className="text-zinc-400">
            Pick scenes that speak to you. We&apos;ll find spots that match.
          </p>
        </motion.div>

        <VibePhotoGrid onSelect={handleSelect} maxSelections={5} />

        <motion.div
          className="mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: selectedPhotos.length >= 3 ? 1 : 0.5 }}
        >
          <button
            onClick={handleContinue}
            disabled={selectedPhotos.length < 3}
            className="w-full py-4 bg-amber-500 text-zinc-900 font-bold rounded-xl text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {selectedPhotos.length < 3
              ? `Select ${3 - selectedPhotos.length} more`
              : 'Continue'}
          </button>
        </motion.div>
      </div>
    </main>
  );
}
