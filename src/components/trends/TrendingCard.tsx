'use client';

import { TrendingUp, Clock, Flame, ExternalLink } from 'lucide-react';
import { TrendingRestaurant, TrendSignal } from '@/lib/types';
import Image from 'next/image';

interface TrendingCardProps {
  trending: TrendingRestaurant;
  onSelect?: (restaurant: TrendingRestaurant) => void;
}

const SOURCE_COLORS: Record<TrendSignal['source'], string> = {
  tiktok: 'bg-pink-500/20 text-pink-400',
  instagram: 'bg-purple-500/20 text-purple-400',
  eater: 'bg-red-500/20 text-red-400',
  infatuation: 'bg-orange-500/20 text-orange-400',
  nytimes: 'bg-gray-500/20 text-gray-300',
  yelp_reviews: 'bg-red-500/20 text-red-400',
};

const SOURCE_ICONS: Record<TrendSignal['source'], string> = {
  tiktok: 'TikTok',
  instagram: 'IG',
  eater: 'Eater',
  infatuation: 'Infat',
  nytimes: 'NYT',
  yelp_reviews: 'Yelp',
};

export function TrendingCard({ trending, onSelect }: TrendingCardProps) {
  const { restaurant, trendScore, signals, prediction, opportunity } = trending;

  const getScoreColor = () => {
    if (trendScore >= 80) return 'text-red-400';
    if (trendScore >= 60) return 'text-orange-400';
    return 'text-amber-400';
  };

  return (
    <div
      className="bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer group"
      onClick={() => onSelect?.(trending)}
    >
      <div className="relative h-40">
        {restaurant.imageUrl ? (
          <Image
            src={restaurant.imageUrl}
            alt={restaurant.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-zinc-800" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />

        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 bg-black/70 backdrop-blur-sm rounded-full">
          <Flame className={`w-4 h-4 ${getScoreColor()}`} />
          <span className={`text-sm font-bold ${getScoreColor()}`}>{trendScore}</span>
        </div>

        {trendScore >= 80 && (
          <div className="absolute top-3 left-3 px-2 py-1 bg-red-500/90 rounded-full text-xs font-semibold">
            HOT
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-semibold text-lg">{restaurant.name}</h3>
            <p className="text-sm text-zinc-400">
              {restaurant.categories.slice(0, 2).join(' · ')} · {restaurant.priceLevel}
            </p>
          </div>
          <div className="flex items-center gap-1 text-amber-400">
            <span className="text-sm font-medium">{restaurant.rating}</span>
            <span className="text-amber-400">★</span>
          </div>
        </div>

        <p className="text-sm text-zinc-400 mb-3">
          {restaurant.location.neighborhood || restaurant.location.city}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {signals.slice(0, 3).map((signal, i) => (
            <span
              key={i}
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${SOURCE_COLORS[signal.source]}`}
            >
              {SOURCE_ICONS[signal.source]}
              {signal.change > 0 && (
                <span className="ml-1">
                  <TrendingUp className="w-3 h-3 inline" />
                  {signal.change}%
                </span>
              )}
            </span>
          ))}
        </div>

        <div className="p-3 bg-zinc-800/50 rounded-xl mb-3">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-zinc-400" />
            <span className="text-sm text-zinc-300">Booking Prediction</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500">Now</p>
              <p className="text-sm font-medium">
                {prediction.currentWaitDays === 0
                  ? 'Available'
                  : `${prediction.currentWaitDays}d wait`}
              </p>
            </div>
            <TrendingUp className="w-4 h-4 text-red-400" />
            <div className="text-right">
              <p className="text-xs text-zinc-500">In 2 weeks</p>
              <p className="text-sm font-medium text-red-400">
                {prediction.predictedWaitDays}d wait
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-amber-400 font-medium">{opportunity}</p>
          <ExternalLink className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
        </div>
      </div>
    </div>
  );
}
