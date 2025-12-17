'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlanningEvent, PlanningEventType } from '@/lib/types';

interface Props {
  events: PlanningEvent[];
  isPlanning: boolean;
}

const eventConfig: Record<PlanningEventType, { icon: string; color: string }> = {
  intent_parsed: { icon: '🧠', color: 'text-purple-400' },
  searching_restaurants: { icon: '🔍', color: 'text-zinc-300' },
  restaurants_found: { icon: '📍', color: 'text-amber-400' },
  matrix_update: { icon: '📊', color: 'text-blue-400' },
  cell_status_change: { icon: '⬜', color: 'text-zinc-400' },
  booking_attempt: { icon: '📞', color: 'text-amber-400' },
  booking_success: { icon: '✓', color: 'text-emerald-400' },
  booking_failed: { icon: '✗', color: 'text-red-400' },
  recovery_start: { icon: '↻', color: 'text-amber-400' },
  vibe_match_calculated: { icon: '✨', color: 'text-purple-400' },
  drinks_search: { icon: '🍸', color: 'text-zinc-300' },
  walking_route_calculated: { icon: '🚶', color: 'text-blue-400' },
  plan_complete: { icon: '★', color: 'text-emerald-400' },
  error: { icon: '!', color: 'text-red-400' },
};

export function ThinkingStream({ events, isPlanning }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [events]);

  if (events.length === 0 && !isPlanning) return null;

  return (
    <div className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 max-h-72 overflow-y-auto">
      <AnimatePresence mode="popLayout">
        {events.map((event, i) => {
          const config = eventConfig[event.type] || eventConfig.error;
          return (
            <motion.div
              key={`${event.type}-${i}`}
              className="flex items-start gap-3 py-1.5"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              <span className={`flex-shrink-0 w-5 text-center ${config.color}`}>
                {config.icon}
              </span>
              <span className={`text-sm ${config.color}`}>
                {event.message}
              </span>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {isPlanning && (
        <motion.div
          className="flex items-center gap-3 py-1.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <span className="flex gap-0.5 w-5 justify-center">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="w-1 h-1 bg-amber-500 rounded-full"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
              />
            ))}
          </span>
          <span className="text-sm text-zinc-500">Working...</span>
        </motion.div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
