'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ChatInput } from '@/components/ChatInput';
import { ThinkingStream } from '@/components/ThinkingStream';
import { ItineraryCard } from '@/components/ItineraryCard';
import { AvailabilityMatrix } from '@/components/planning/AvailabilityMatrix';
import { VoiceInput } from '@/components/planning/VoiceInput';
import { Navigation } from '@/components/landing';
import { usePlanStore } from '@/stores/planStore';

export default function PlanPage() {
  const router = useRouter();
  const [useVoice, setUseVoice] = useState(false);
  const {
    currentPlan,
    events,
    matrix,
    isPlanning,
    error,
    userVibeProfile,
    startPlanStream,
    reset,
  } = usePlanStore();

  useEffect(() => {
    if (!userVibeProfile) {
      router.push('/onboarding');
    }
  }, [userVibeProfile, router]);

  const handleVoiceTranscript = (text: string) => {
    if (text.trim().length > 10) {
      setUseVoice(false);
      startPlanStream(text);
    }
  };

  if (!userVibeProfile) return null;

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-slate-black pt-20 px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <header className="flex items-center justify-between mb-8">
            <Link
              href="/"
              className="font-display text-2xl font-bold text-slate-red hover:text-slate-red/80 transition-colors"
            >
              Slate
            </Link>

            <div className="flex items-center gap-4">
              {currentPlan && (
                <button
                  onClick={reset}
                  className="text-sm text-warm-gray hover:text-slate-white transition-colors"
                >
                  + New Plan
                </button>
              )}
              <Link
                href="/group/create"
                className="text-sm text-slate-red hover:text-slate-red/80 transition-colors"
              >
                Plan with friends
              </Link>
            </div>
          </header>

          <AnimatePresence mode="wait">
            {!currentPlan && !isPlanning && (
              <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <h1 className="font-display text-3xl font-bold text-slate-white mb-2">
                  Where to tonight?
                </h1>
                <p className="text-warm-gray">
                  Tell me what you&apos;re in the mood for and I&apos;ll handle the rest.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-6">
            {!currentPlan && !isPlanning && (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <button
                    onClick={() => setUseVoice(false)}
                    className={`px-4 py-2 rounded-full text-sm transition-colors ${
                      !useVoice ? 'bg-slate-red text-white' : 'bg-charcoal text-warm-gray hover:text-slate-white'
                    }`}
                  >
                    Type
                  </button>
                  <button
                    onClick={() => setUseVoice(true)}
                    className={`px-4 py-2 rounded-full text-sm transition-colors ${
                      useVoice ? 'bg-slate-red text-white' : 'bg-charcoal text-warm-gray hover:text-slate-white'
                    }`}
                  >
                    Speak
                  </button>
                </div>

                {useVoice ? (
                  <div className="py-8">
                    <VoiceInput onTranscript={handleVoiceTranscript} />
                  </div>
                ) : (
                  <ChatInput
                    onSubmit={startPlanStream}
                    disabled={isPlanning}
                    placeholder="Sushi for 2 in the East Village around 7pm, then drinks..."
                  />
                )}
              </div>
            )}

            {(events.length > 0 || isPlanning) && (
              <ThinkingStream events={events} isPlanning={isPlanning} />
            )}

            {matrix && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <AvailabilityMatrix matrix={matrix} />
                {matrix.selectedCell && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 bg-success/10 border border-success/30 rounded-xl"
                  >
                    <p className="text-success font-medium">
                      ✓ Auto-selected best option: {matrix.restaurants[matrix.selectedCell.row]?.name} at {matrix.timeSlots[matrix.selectedCell.col]}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )}

            {error && (
              <motion.div
                className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {error}
              </motion.div>
            )}

            {currentPlan && <ItineraryCard plan={currentPlan} />}
          </div>

          {currentPlan && (
            <motion.div
              className="mt-8 pt-8 border-t border-light-gray/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <h3 className="font-display text-lg font-semibold text-slate-white mb-4">Try another?</h3>
              <ChatInput
                onSubmit={(prompt) => {
                  reset();
                  startPlanStream(prompt);
                }}
                disabled={isPlanning}
                placeholder="Italian in Tribeca for 4 tomorrow at 8..."
              />
            </motion.div>
          )}
        </div>
      </main>
    </>
  );
}
