'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface VoiceWaveformProps {
  active: boolean;
  bars?: number;
}

export function VoiceWaveform({ active, bars = 12 }: VoiceWaveformProps) {
  const [heights, setHeights] = useState<number[]>(Array(bars).fill(0.2));

  useEffect(() => {
    if (!active) {
      setHeights(Array(bars).fill(0.2));
      return;
    }

    const interval = setInterval(() => {
      setHeights(Array(bars).fill(0).map(() => 0.2 + Math.random() * 0.8));
    }, 100);

    return () => clearInterval(interval);
  }, [active, bars]);

  return (
    <div className="flex items-center justify-center gap-1 h-12">
      {heights.map((height, i) => (
        <motion.div
          key={i}
          className="w-1 bg-slate-red rounded-full"
          animate={{ height: `${height * 100}%` }}
          transition={{ duration: 0.1 }}
          style={{ opacity: active ? 1 : 0.3 }}
        />
      ))}
    </div>
  );
}
