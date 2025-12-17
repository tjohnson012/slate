'use client';

import { motion } from 'framer-motion';
import { EveningPlan } from '@/lib/types';
import { VenueCard } from './VenueCard';
import { RouteMap } from './map/RouteMap';

interface Props {
  plan: EveningPlan;
  showMap?: boolean;
}

const statusConfig = {
  planning: { label: 'Planning your evening...', color: 'text-amber-400' },
  booking: { label: 'Securing reservations...', color: 'text-amber-400' },
  confirmed: { label: 'Your evening is set', color: 'text-emerald-400' },
  partial: { label: 'Partially booked', color: 'text-amber-400' },
  failed: { label: 'Unable to book', color: 'text-red-400' },
};

export function ItineraryCard({ plan, showMap = true }: Props) {
  const config = statusConfig[plan.status];
  const hasBookings = plan.stops.some(s => s.booking.status === 'confirmed');

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className={`text-xl font-bold ${config.color}`}>
            {config.label}
          </h2>
          <p className="text-sm text-zinc-500 mt-1">
            {plan.parsedIntent.date} · {plan.parsedIntent.time} · {plan.parsedIntent.partySize} {plan.parsedIntent.partySize === 1 ? 'guest' : 'guests'}
          </p>
        </div>
        {hasBookings && (
          <div className="text-right">
            <p className="text-xs text-zinc-500">Estimated</p>
            <p className="text-lg font-semibold text-white">${plan.totalEstimatedCost}</p>
          </div>
        )}
      </div>

      {showMap && plan.stops.length > 0 && (
        <div className="mb-6">
          <RouteMap stops={plan.stops} />
        </div>
      )}

      {plan.stops.length > 0 ? (
        <div className="space-y-3">
          {plan.stops.map((stop, i) => (
            <VenueCard
              key={stop.restaurant.id}
              restaurant={stop.restaurant}
              booking={stop.booking}
              time={stop.time}
              type={stop.type}
              walkingFromPrevious={i > 0 ? stop.walkingFromPrevious : undefined}
              index={i}
            />
          ))}
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
          <p className="text-zinc-400">
            No venues found matching your vibe. Try adjusting your request.
          </p>
        </div>
      )}

      {hasBookings && (
        <div className="mt-6 flex gap-3">
          <motion.button
            className="flex-1 py-3 bg-amber-500 text-zinc-900 font-semibold rounded-xl"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            Share Itinerary
          </motion.button>
          <motion.button
            className="py-3 px-4 bg-zinc-800 text-white rounded-xl"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}
