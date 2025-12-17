'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function CreateGroupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('19:00');
  const [location, setLocation] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !date || !time || !location) return;

    setIsCreating(true);

    try {
      const res = await fetch('/api/group/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorName: name,
          date,
          time,
          location,
        }),
      });

      if (res.ok) {
        const { sessionId, creatorId } = await res.json();
        localStorage.setItem(`slate-group-${sessionId}`, creatorId);
        router.push(`/group/${sessionId}`);
      }
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-md mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Plan with friends</h1>
          <p className="text-zinc-400">
            Create a group session and let everyone share their preferences
          </p>
        </motion.div>

        <motion.form
          onSubmit={handleCreate}
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Your name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Time
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="San Francisco, CA"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <motion.button
            type="submit"
            disabled={isCreating || !name || !date || !time || !location}
            className="w-full py-4 bg-amber-500 text-zinc-900 font-bold rounded-xl text-lg disabled:opacity-50"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            {isCreating ? 'Creating...' : 'Create group session'}
          </motion.button>
        </motion.form>
      </div>
    </main>
  );
}
