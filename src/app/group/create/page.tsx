'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Navigation } from '@/components/landing';
import { Button, Input } from '@/components/shared';

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
    <>
      <Navigation />
      <main className="min-h-screen bg-slate-black pt-20">
        <div className="max-w-md mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="font-display text-3xl font-bold text-slate-white mb-2">Plan with friends</h1>
            <p className="text-warm-gray">
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
            <Input
              label="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
            />

            <div>
              <label className="block text-sm font-medium text-slate-white mb-2">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full bg-charcoal border border-light-gray/20 rounded-lg px-4 py-3 text-slate-white focus:outline-none focus:border-slate-red"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-white mb-2">
                Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-charcoal border border-light-gray/20 rounded-lg px-4 py-3 text-slate-white focus:outline-none focus:border-slate-red"
              />
            </div>

            <Input
              label="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="New York, NY"
            />

            <Button
              type="submit"
              loading={isCreating}
              disabled={!name || !date || !time || !location}
              fullWidth
              size="lg"
            >
              Create group session
            </Button>
          </motion.form>
        </div>
      </main>
    </>
  );
}
