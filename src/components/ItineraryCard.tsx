'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { EveningPlan } from '@/lib/types';
import { VenueCard } from './VenueCard';
import { RouteMap } from './map/RouteMap';

interface Props {
  plan: EveningPlan;
  showMap?: boolean;
}

const statusConfig = {
  planning: { label: 'Planning your evening...', color: 'text-warning' },
  booking: { label: 'Securing reservations...', color: 'text-warning' },
  confirmed: { label: 'Your evening is set', color: 'text-success' },
  partial: { label: 'Partially booked', color: 'text-warning' },
  failed: { label: 'Unable to book', color: 'text-red-400' },
};

export function ItineraryCard({ plan, showMap = true }: Props) {
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied' | 'shared'>('idle');
  const config = statusConfig[plan.status];
  const hasBookings = plan.stops.some(s => s.booking.status === 'confirmed');

  const handleShare = async () => {
    const itineraryText = plan.stops.map((stop, i) => {
      const prefix = i === 0 ? '' : `→ ${stop.walkingFromPrevious?.minutes || 5} min walk\n`;
      return `${prefix}${stop.type.toUpperCase()}: ${stop.restaurant.name} at ${stop.time}\n${stop.restaurant.location.address}, ${stop.restaurant.location.city}${stop.booking.confirmationNumber ? `\nConf# ${stop.booking.confirmationNumber}` : ''}`;
    }).join('\n\n');

    const shareText = `My evening plan for ${plan.parsedIntent.date}:\n\n${itineraryText}\n\nPlanned with Slate`;

    if (navigator.share) {
      try {
        await navigator.share({ title: 'My Evening Plan', text: shareText });
        setShareStatus('shared');
      } catch {
        // User cancelled or share failed, try clipboard
        await copyToClipboard(shareText);
      }
    } else {
      await copyToClipboard(shareText);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setShareStatus('copied');
      setTimeout(() => setShareStatus('idle'), 2000);
    } catch {
      console.error('Failed to copy');
    }
  };

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className={`font-display text-xl font-bold ${config.color}`}>
            {config.label}
          </h2>
          <p className="text-sm text-warm-gray mt-1">
            {plan.parsedIntent.date} · {plan.parsedIntent.time} · {plan.parsedIntent.partySize} {plan.parsedIntent.partySize === 1 ? 'guest' : 'guests'}
          </p>
        </div>
        {hasBookings && (
          <div className="text-right">
            <p className="text-xs text-warm-gray">Estimated</p>
            <p className="text-lg font-semibold text-slate-white">${plan.totalEstimatedCost}</p>
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
        <div className="bg-charcoal border border-light-gray/10 rounded-xl p-8 text-center">
          <p className="text-warm-gray">
            No venues found matching your vibe. Try adjusting your request.
          </p>
        </div>
      )}

      {hasBookings && (
        <div className="mt-6 flex gap-3">
          <motion.button
            onClick={handleShare}
            className="flex-1 py-3 bg-slate-red text-white font-semibold rounded-xl hover:bg-slate-red/90 transition-colors"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            {shareStatus === 'copied' ? '✓ Copied to clipboard!' : shareStatus === 'shared' ? '✓ Shared!' : 'Share Itinerary'}
          </motion.button>
          <motion.button
            className="py-3 px-4 bg-charcoal text-slate-white rounded-xl border border-light-gray/20 hover:border-slate-red/50 transition-colors"
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
