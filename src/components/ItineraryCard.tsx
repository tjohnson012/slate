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

  const handleAddToCalendar = () => {
    const firstStop = plan.stops[0];
    if (!firstStop) return;

    const dateStr = plan.parsedIntent.date;
    const timeStr = firstStop.time;

    // Parse date and time
    const [month, day, year] = dateStr.includes('/')
      ? dateStr.split('/').map(Number)
      : [new Date().getMonth() + 1, new Date().getDate(), new Date().getFullYear()];

    const timeMatch = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    let hour = timeMatch ? parseInt(timeMatch[1]) : 19;
    const minute = timeMatch ? parseInt(timeMatch[2]) : 0;
    if (timeMatch && timeMatch[3].toUpperCase() === 'PM' && hour !== 12) hour += 12;
    if (timeMatch && timeMatch[3].toUpperCase() === 'AM' && hour === 12) hour = 0;

    const startDate = new Date(year, month - 1, day, hour, minute);
    const endDate = new Date(startDate.getTime() + 3 * 60 * 60 * 1000); // 3 hours

    const formatDate = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const stops = plan.stops.map(s => `${s.type}: ${s.restaurant.name} at ${s.time}`).join('\\n');

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `DTSTART:${formatDate(startDate)}`,
      `DTEND:${formatDate(endDate)}`,
      `SUMMARY:Evening at ${firstStop.restaurant.name}`,
      `DESCRIPTION:${stops}`,
      `LOCATION:${firstStop.restaurant.location.address}, ${firstStop.restaurant.location.city}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\n');

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'slate-evening.ics';
    a.click();
    URL.revokeObjectURL(url);
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
            onClick={handleAddToCalendar}
            className="py-3 px-4 bg-charcoal text-slate-white rounded-xl border border-light-gray/20 hover:border-slate-red/50 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            title="Add to calendar"
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
