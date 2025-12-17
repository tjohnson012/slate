'use client';

import { motion } from 'framer-motion';

interface FunnelStep {
  label: string;
  remaining: number;
  eliminated: number;
  owner?: string;
}

interface EliminationFunnelProps {
  steps: FunnelStep[];
  total: number;
}

export function EliminationFunnel({ steps, total }: EliminationFunnelProps) {
  return (
    <div className="space-y-3">
      {steps.map((step, index) => {
        const percentage = (step.remaining / total) * 100;
        const prevPercentage = index === 0 ? 100 : (steps[index - 1].remaining / total) * 100;

        return (
          <motion.div
            key={step.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.4 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-white">{step.label}</span>
              <span className="text-warm-gray">
                {step.remaining} restaurants
                {step.eliminated > 0 && (
                  <span className="text-red-400 ml-2">(-{step.eliminated})</span>
                )}
              </span>
            </div>
            <div className="h-8 bg-charcoal rounded-lg overflow-hidden relative">
              <motion.div
                className="h-full bg-slate-red rounded-lg"
                initial={{ width: `${prevPercentage}%` }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.5, delay: index * 0.4 + 0.2 }}
              />
              {step.owner && (
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-warm-gray">
                  ({step.owner})
                </span>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
