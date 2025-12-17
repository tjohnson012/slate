'use client';

import { useEffect, useState } from 'react';

interface CallWaveformProps {
  active: boolean;
}

export function CallWaveform({ active }: CallWaveformProps) {
  const [bars, setBars] = useState<number[]>(Array(20).fill(0.2));

  useEffect(() => {
    if (!active) {
      setBars(Array(20).fill(0.2));
      return;
    }

    const interval = setInterval(() => {
      setBars((prev) =>
        prev.map(() => (active ? 0.2 + Math.random() * 0.8 : 0.2))
      );
    }, 100);

    return () => clearInterval(interval);
  }, [active]);

  return (
    <div className="flex items-center gap-0.5 h-8">
      {bars.map((height, i) => (
        <div
          key={i}
          className="w-1 bg-green-500 rounded-full transition-all duration-100"
          style={{
            height: `${height * 100}%`,
            opacity: active ? 1 : 0.3,
          }}
        />
      ))}
    </div>
  );
}
