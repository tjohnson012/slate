'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, MapPin, Loader2, Search } from 'lucide-react';
import { Navigation } from '@/components/landing';
import { TrendingRestaurant } from '@/lib/types';

export default function DiscoverPage() {
  const [location, setLocation] = useState('New York');
  const [inputLocation, setInputLocation] = useState('New York');
  const [trending, setTrending] = useState<TrendingRestaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrending(location);
  }, [location]);

  const fetchTrending = async (loc: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/trends?location=${encodeURIComponent(loc)}&limit=9`);
      const data = await res.json();
      setTrending(data.trending || []);
    } catch (error) {
      console.error('Failed to fetch trends:', error);
      setTrending([]);
    }
    setLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLocation(inputLocation);
  };

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-slate-black pt-20">
        <div className="max-w-container mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-red to-red-600 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-slate-white">Rising Spots</h1>
                <p className="text-sm text-warm-gray">Book early, skip the wait</p>
              </div>
            </div>

            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray" />
                <input
                  type="text"
                  value={inputLocation}
                  onChange={(e) => setInputLocation(e.target.value)}
                  placeholder="Enter city..."
                  className="pl-9 pr-4 py-2 bg-charcoal border border-zinc-700 rounded-lg text-slate-white placeholder:text-warm-gray focus:outline-none focus:border-slate-red"
                />
              </div>
              <button
                type="submit"
                className="p-2 bg-slate-red text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
            </form>
          </motion.div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-slate-red animate-spin" />
            </div>
          ) : trending.length === 0 ? (
            <div className="text-center py-20 text-warm-gray">
              No trending restaurants found in {location}. Try another city.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trending.map((item, index) => (
                <motion.div
                  key={item.restaurant.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-charcoal rounded-xl overflow-hidden border border-zinc-800 hover:border-zinc-700 transition-colors"
                >
                  <div className="aspect-video relative">
                    <img
                      src={item.restaurant.imageUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop'}
                      alt={item.restaurant.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3 px-2 py-1 bg-slate-red text-white text-xs font-bold rounded">
                      {item.trendScore}% trending
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-display font-bold text-slate-white">{item.restaurant.name}</h3>
                        <p className="text-sm text-warm-gray">
                          {item.restaurant.categories.slice(0, 2).join(' • ')} • {item.restaurant.priceLevel}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-slate-white font-bold">{item.restaurant.rating}</div>
                        <div className="text-xs text-warm-gray">{item.restaurant.reviewCount} reviews</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {item.signals.slice(0, 2).map((signal, i) => (
                        <span key={i} className="px-2 py-1 bg-zinc-800 text-xs text-warm-gray rounded">
                          {signal.source}: +{signal.change}%
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
                      <div className="text-sm">
                        <span className="text-emerald-400">
                          {item.prediction.currentWaitDays === 0 ? 'Available now' : `${item.prediction.currentWaitDays}-day wait`}
                        </span>
                        <span className="text-warm-gray mx-2">→</span>
                        <span className="text-amber-400">
                          {item.prediction.predictedWaitDays}-day wait soon
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-red mt-2 font-medium">{item.opportunity}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <p className="text-center text-xs text-warm-gray mt-8">
            Trend scores based on review velocity, social mentions, and media coverage
          </p>
        </div>
      </main>
    </>
  );
}
