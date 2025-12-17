'use client';

import { motion } from 'framer-motion';
import { GroupParticipant, EliminationStep, Restaurant } from '@/lib/types';

interface Props {
  participants: GroupParticipant[];
  eliminationSteps: EliminationStep[];
  solution?: Restaurant | null;
  isProcessing?: boolean;
}

export function ConstraintGrid({ participants, eliminationSteps, solution, isProcessing }: Props) {
  return (
    <div className="space-y-6">
      <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800">
        <h3 className="text-sm font-medium text-zinc-400 mb-4">Participants</h3>
        <div className="flex flex-wrap gap-3">
          {participants.map((p, i) => (
            <motion.div
              key={p.id}
              className="flex items-center gap-2 bg-zinc-800 px-3 py-2 rounded-lg"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-zinc-900 font-bold text-sm">
                {p.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-white text-sm font-medium">{p.name}</p>
                <p className="text-xs text-zinc-500">
                  {p.constraints.dietary.length > 0
                    ? p.constraints.dietary.join(', ')
                    : 'No restrictions'}
                </p>
              </div>
              <svg className="w-4 h-4 text-emerald-500 ml-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </motion.div>
          ))}
          {isProcessing && (
            <div className="flex items-center gap-2 bg-zinc-800/50 px-3 py-2 rounded-lg border border-dashed border-zinc-700">
              <div className="w-8 h-8 rounded-full bg-zinc-700 animate-pulse" />
              <span className="text-sm text-zinc-500">Waiting...</span>
            </div>
          )}
        </div>
      </div>

      {eliminationSteps.length > 0 && (
        <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800">
          <h3 className="text-sm font-medium text-zinc-400 mb-4">Finding common ground</h3>
          <div className="space-y-2">
            {eliminationSteps.map((step, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.15 }}
              >
                <div className="w-6 h-6 rounded bg-zinc-800 flex items-center justify-center text-xs text-zinc-400">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-zinc-300">
                    <span className="text-amber-400">{step.participantName}</span>
                    {': '}{step.constraint}
                  </p>
                </div>
                <div className="text-xs text-zinc-500">
                  {step.eliminatedCount > 0 ? (
                    <span className="text-red-400">-{step.eliminatedCount}</span>
                  ) : (
                    <span className="text-emerald-400">all good</span>
                  )}
                </div>
                <div className="w-16 h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-amber-500 to-emerald-500"
                    initial={{ width: '100%' }}
                    animate={{ width: `${(step.remainingCount / (step.remainingCount + step.eliminatedCount)) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {solution && (
        <motion.div
          className="bg-gradient-to-br from-emerald-900/30 to-amber-900/30 rounded-xl p-6 border border-emerald-500/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <h3 className="text-emerald-400 font-semibold">Perfect match found!</h3>
          </div>
          <div className="flex items-center gap-4">
            {solution.imageUrl && (
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-zinc-800 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={solution.imageUrl}
                  alt={solution.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div>
              <h4 className="text-xl font-bold text-white">{solution.name}</h4>
              <p className="text-sm text-zinc-400">
                {solution.categories.slice(0, 2).join(' · ')} · {solution.priceLevel}
              </p>
              <p className="text-sm text-zinc-500 mt-1">
                {solution.location.neighborhood || solution.location.city}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
