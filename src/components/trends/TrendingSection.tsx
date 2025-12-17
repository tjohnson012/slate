'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Loader2, MapPin } from 'lucide-react';
import { TrendingRestaurant } from '@/lib/types';
import { TrendingCard } from './TrendingCard';

interface TrendingSectionProps {
  location?: string;
  onSelectRestaurant?: (trending: TrendingRestaurant) => void;
}

export function TrendingSection({ location = 'New York', onSelectRestaurant }: TrendingSectionProps) {
  const [trending, setTrending] = useState<TrendingRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTrending() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/trends?location=${encodeURIComponent(location)}&limit=6`);
        if (!response.ok) throw new Error('Failed to fetch trends');

        const data = await response.json();
        setTrending(data.trending);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load trends');
      } finally {
        setLoading(false);
      }
    }

    fetchTrending();
  }, [location]);

  if (loading) {
    return (
      <div className="py-12">
        <div className="flex items-center justify-center gap-3 text-zinc-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Analyzing trends...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (trending.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-zinc-500">No trending restaurants found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Trending Now</h2>
            <p className="text-sm text-zinc-400 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {location}
            </p>
          </div>
        </div>
        <div className="text-xs text-zinc-500">
          Updated just now
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {trending.map((item) => (
          <TrendingCard
            key={item.restaurant.id}
            trending={item}
            onSelect={onSelectRestaurant}
          />
        ))}
      </div>

      <div className="text-center">
        <p className="text-xs text-zinc-500">
          Trend scores calculated from social signals, reviews, and media coverage
        </p>
      </div>
    </div>
  );
}
