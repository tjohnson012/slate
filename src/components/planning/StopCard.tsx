'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { MapPin, Clock } from 'lucide-react';
import { StatusBadge } from '@/components/shared';

interface Stop {
  type: 'dinner' | 'drinks' | 'dessert';
  restaurant: {
    name: string;
    imageUrl?: string;
    address: string;
    phone?: string;
    vibeMatchScore?: number;
  };
  time: string;
  booking?: {
    status: 'confirmed' | 'pending' | 'no-reservation';
    confirmationNumber?: string;
  };
}

interface StopCardProps {
  stop: Stop;
  index: number;
}

export function StopCard({ stop, index }: StopCardProps) {
  const typeLabels = { dinner: 'Dinner', drinks: 'Drinks', dessert: 'Dessert' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15 }}
      className="bg-charcoal rounded-xl overflow-hidden"
    >
      <div className="flex">
        {stop.restaurant.imageUrl && (
          <div className="relative w-24 h-24 flex-shrink-0">
            <Image
              src={stop.restaurant.imageUrl}
              alt={stop.restaurant.name}
              fill
              className="object-cover"
            />
          </div>
        )}
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-xs text-slate-red font-medium uppercase tracking-wide mb-1">
                {typeLabels[stop.type]}
              </p>
              <h3 className="font-display text-lg font-semibold text-slate-white">
                {stop.restaurant.name}
              </h3>
            </div>
            {stop.booking && (
              <StatusBadge status={stop.booking.status} />
            )}
          </div>

          <div className="space-y-1.5 text-sm text-warm-gray">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{stop.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{stop.restaurant.address}</span>
            </div>
          </div>

          {stop.booking?.confirmationNumber && (
            <p className="mt-2 text-xs font-mono text-slate-red">
              Conf: {stop.booking.confirmationNumber}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

interface WalkingConnectionProps {
  minutes: number;
  distance: string;
}

export function WalkingConnection({ minutes, distance }: WalkingConnectionProps) {
  return (
    <div className="flex items-center gap-3 py-3 px-4">
      <div className="flex-1 border-t border-dashed border-light-gray/30" />
      <div className="text-center">
        <p className="text-sm text-warm-gray">{minutes} min walk</p>
        <p className="text-xs text-warm-gray/60">{distance}</p>
      </div>
      <div className="flex-1 border-t border-dashed border-light-gray/30" />
    </div>
  );
}
