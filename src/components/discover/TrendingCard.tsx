'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { TrendingUp, Clock, Star } from 'lucide-react';
import { Badge, Button } from '@/components/shared';

interface TrendSignal {
  platform: string;
  metric: string;
  change: number;
}

interface TrendingRestaurantData {
  id: string;
  name: string;
  imageUrl?: string;
  cuisine: string;
  neighborhood: string;
  rating: number;
  reviewCount: number;
  vibeMatch: number;
  signals: TrendSignal[];
  currentWait: string;
  predictedWait: string;
  urgencyMessage: string;
}

interface TrendingCardProps {
  restaurant: TrendingRestaurantData;
  onBook?: () => void;
}

const platformColors: Record<string, string> = {
  Eater: 'bg-red-500/20 text-red-400',
  TikTok: 'bg-pink-500/20 text-pink-400',
  Instagram: 'bg-purple-500/20 text-purple-400',
  Yelp: 'bg-red-600/20 text-red-400',
  NYT: 'bg-gray-500/20 text-gray-300',
};

export function TrendingCard({ restaurant, onBook }: TrendingCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-charcoal rounded-xl overflow-hidden border border-light-gray/10"
    >
      <div className="relative h-40">
        {restaurant.imageUrl ? (
          <Image src={restaurant.imageUrl} alt={restaurant.name} fill className="object-cover" />
        ) : (
          <div className="w-full h-full bg-light-gray/10" />
        )}
        <div className="absolute top-3 left-3">
          <Badge variant="red">
            <TrendingUp className="w-3 h-3 mr-1" /> Rising
          </Badge>
        </div>
        <div className="absolute top-3 right-3">
          <span className="px-2 py-1 bg-slate-red/90 text-white text-xs font-medium rounded-full">
            {restaurant.vibeMatch}% match
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-display text-lg font-semibold text-slate-white">{restaurant.name}</h3>
            <p className="text-sm text-warm-gray">{restaurant.cuisine} · {restaurant.neighborhood}</p>
          </div>
          <div className="flex items-center gap-1 text-amber-400">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-sm font-medium">{restaurant.rating}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {restaurant.signals.map((signal, i) => (
            <span
              key={i}
              className={`px-2 py-0.5 rounded-full text-xs ${platformColors[signal.platform] || 'bg-light-gray/20 text-warm-gray'}`}
            >
              [{signal.platform}] {signal.metric} {signal.change > 0 ? `+${signal.change}%` : ''}
            </span>
          ))}
        </div>

        <div className="p-3 bg-slate-black/50 rounded-lg mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-warm-gray" />
            <span className="text-sm text-warm-gray">Booking Difficulty</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-warm-gray">Now</p>
              <p className="text-sm font-medium text-slate-white">{restaurant.currentWait}</p>
            </div>
            <div>
              <p className="text-xs text-warm-gray">In 2 weeks</p>
              <p className="text-sm font-medium text-slate-red">{restaurant.predictedWait}</p>
            </div>
          </div>
        </div>

        <p className="text-sm text-slate-red font-medium mb-4">{restaurant.urgencyMessage}</p>

        <Button onClick={onBook} fullWidth>Book Now</Button>
      </div>
    </motion.div>
  );
}
