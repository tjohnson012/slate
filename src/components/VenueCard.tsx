'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Restaurant, BookingAttempt } from '@/lib/types';
import { StatusPill } from './StatusPill';

interface Props {
  restaurant: Restaurant;
  booking: BookingAttempt;
  time: string;
  type: 'dinner' | 'drinks' | 'dessert';
  walkingFromPrevious?: {
    minutes: number;
    distance: number;
  };
  index?: number;
}

const typeLabels = {
  dinner: 'Dinner',
  drinks: 'Drinks',
  dessert: 'Dessert',
};

export function VenueCard({ restaurant, booking, time, type, walkingFromPrevious, index = 0 }: Props) {
  return (
    <motion.div
      className="bg-charcoal border border-light-gray/10 rounded-xl overflow-hidden hover:border-slate-red/30 transition-colors"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      {walkingFromPrevious && (
        <div className="px-4 py-2 bg-slate-black/50 border-b border-light-gray/10 text-sm text-warm-gray flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          {walkingFromPrevious.minutes} min walk ({walkingFromPrevious.distance}m)
        </div>
      )}

      <div className="flex">
        {restaurant.imageUrl && (
          <div className="w-28 h-28 flex-shrink-0 relative">
            <Image
              src={restaurant.imageUrl}
              alt={restaurant.name}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        )}

        <div className="flex-1 p-4 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs text-slate-red font-medium uppercase tracking-wide">
                {typeLabels[type]} · {time}
              </p>
              <h3 className="font-display text-lg font-semibold text-slate-white truncate mt-0.5">
                {restaurant.name}
              </h3>
            </div>
            <StatusPill status={booking.status} />
          </div>

          <div className="mt-2 flex items-center gap-3 text-sm text-warm-gray">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4 text-slate-red" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {restaurant.rating}
            </span>
            <span>{restaurant.priceLevel}</span>
            <span className="truncate">{restaurant.categories.slice(0, 2).join(', ')}</span>
          </div>

          {restaurant.vibeMatchScore !== undefined && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-slate-black rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-slate-red to-success"
                  initial={{ width: 0 }}
                  animate={{ width: `${restaurant.vibeMatchScore}%` }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                />
              </div>
              <span className="text-xs text-success font-medium">
                {restaurant.vibeMatchScore}%
              </span>
            </div>
          )}

          {restaurant.vibeMatchReason && (
            <p className="mt-1 text-xs text-warm-gray truncate">
              {restaurant.vibeMatchReason}
            </p>
          )}

          {booking.handoffUrl && booking.status !== 'confirmed' && (
            <a
              href={booking.handoffUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-sm text-slate-red hover:text-slate-red/80 transition-colors"
            >
              Complete on Yelp
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
