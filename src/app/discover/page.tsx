'use client';

import { motion } from 'framer-motion';
import { TrendingUp, MapPin } from 'lucide-react';
import { Navigation } from '@/components/landing';
import { TrendingCard } from '@/components/discover';

const mockTrending = [
  {
    id: '1',
    name: 'Tatiana',
    imageUrl: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=400',
    cuisine: 'Contemporary',
    neighborhood: 'Lincoln Center',
    rating: 4.9,
    reviewCount: 342,
    vibeMatch: 94,
    signals: [
      { platform: 'Eater', metric: 'Featured', change: 0 },
      { platform: 'Instagram', metric: 'Saves', change: 240 },
    ],
    currentWait: 'Available',
    predictedWait: '2-week wait',
    urgencyMessage: 'Book now before 3-week waits',
  },
  {
    id: '2',
    name: 'Dhamaka',
    imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400',
    cuisine: 'Indian',
    neighborhood: 'Lower East Side',
    rating: 4.7,
    reviewCount: 1243,
    vibeMatch: 88,
    signals: [
      { platform: 'TikTok', metric: 'Viral', change: 450 },
      { platform: 'Yelp', metric: 'Reviews', change: 89 },
    ],
    currentWait: '3-day wait',
    predictedWait: '3-week wait',
    urgencyMessage: 'Getting buzz - grab a spot now',
  },
  {
    id: '3',
    name: 'Via Carota',
    imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400',
    cuisine: 'Italian',
    neighborhood: 'West Village',
    rating: 4.6,
    reviewCount: 2156,
    vibeMatch: 91,
    signals: [
      { platform: 'NYT', metric: 'Feature', change: 0 },
      { platform: 'Instagram', metric: 'Tags', change: 120 },
    ],
    currentWait: '1-week wait',
    predictedWait: '2-week wait',
    urgencyMessage: 'Consistently popular - plan ahead',
  },
];

export default function DiscoverPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-slate-black pt-20">
        <div className="max-w-container mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-red to-red-600 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-slate-white">Trending Now</h1>
                <p className="text-sm text-warm-gray flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> New York
                </p>
              </div>
            </div>
            <span className="text-xs text-warm-gray">Updated just now</span>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockTrending.map((restaurant, index) => (
              <motion.div
                key={restaurant.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <TrendingCard restaurant={restaurant} onBook={() => {}} />
              </motion.div>
            ))}
          </div>

          <p className="text-center text-xs text-warm-gray mt-8">
            Trend scores calculated from social signals, reviews, and media coverage
          </p>
        </div>
      </main>
    </>
  );
}
