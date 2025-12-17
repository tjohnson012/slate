'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { usePlanStore } from '@/stores/planStore';

export default function Home() {
  const router = useRouter();
  const userVibeProfile = usePlanStore((s) => s.userVibeProfile);

  const handleGetStarted = () => {
    router.push(userVibeProfile ? '/plan' : '/onboarding');
  };

  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4">
      <motion.div
        className="max-w-2xl mx-auto text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h1
          className="text-6xl font-bold text-white mb-4 tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Slate
        </motion.h1>

        <motion.p
          className="text-xl text-zinc-400 mb-8 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Plan your perfect evening with one prompt.
          <br />
          Dinner, drinks, dessert—all booked in seconds.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <motion.button
            onClick={handleGetStarted}
            className="px-8 py-4 bg-amber-500 text-zinc-900 font-semibold text-lg rounded-xl"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Plan My Evening
          </motion.button>

          <motion.button
            onClick={() => router.push('/group/create')}
            className="px-8 py-4 bg-zinc-800 text-white font-semibold text-lg rounded-xl border border-zinc-700"
            whileHover={{ scale: 1.02, borderColor: '#f59e0b' }}
            whileTap={{ scale: 0.98 }}
          >
            Plan with Friends
          </motion.button>
        </motion.div>

        <motion.div
          className="mt-16 grid grid-cols-3 gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {[
            { icon: '✨', label: 'Learns your vibe' },
            { icon: '📊', label: 'Live availability' },
            { icon: '🎯', label: 'Books instantly' },
          ].map((feature, i) => (
            <motion.div
              key={feature.label}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.1 }}
            >
              <div className="text-3xl mb-2">{feature.icon}</div>
              <p className="text-sm text-zinc-400">{feature.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      <motion.footer
        className="absolute bottom-6 text-zinc-600 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        Powered by Yelp AI
      </motion.footer>
    </main>
  );
}
