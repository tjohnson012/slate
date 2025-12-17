'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatInput } from '@/components/ChatInput';
import { ThinkingStream } from '@/components/ThinkingStream';
import { ItineraryCard } from '@/components/ItineraryCard';
import { AvailabilityMatrix } from '@/components/planning/AvailabilityMatrix';
import { VoiceInput } from '@/components/planning/VoiceInput';
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
    <main className="min-h-screen bg-zinc-950 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push('/')}
            className="text-2xl font-bold text-white hover:text-amber-500 transition-colors"
          >
            Slate
          </button>

          <div className="flex items-center gap-4">
            {currentPlan && (
              <button
                onClick={reset}
                className="text-sm text-zinc-400 hover:text-white transition-colors"
              >
                + New Plan
              </button>
            )}
            <button
              onClick={() => router.push('/group/create')}
              className="text-sm text-amber-500 hover:text-amber-400 transition-colors"
            >
              Plan with friends
            </button>
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
              <h1 className="text-3xl font-bold text-white mb-2">
                Where to tonight?
              </h1>
              <p className="text-zinc-400">
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
                    !useVoice ? 'bg-amber-500 text-zinc-900' : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  Type
                </button>
                <button
                  onClick={() => setUseVoice(true)}
                  className={`px-4 py-2 rounded-full text-sm transition-colors ${
                    useVoice ? 'bg-amber-500 text-zinc-900' : 'bg-zinc-800 text-zinc-400'
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

          {matrix && isPlanning && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AvailabilityMatrix matrix={matrix} />
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
            className="mt-8 pt-8 border-t border-zinc-800"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="text-lg font-semibold text-white mb-4">Try another?</h3>
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
  );
}
