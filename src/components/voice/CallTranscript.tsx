'use client';

import { useEffect, useRef } from 'react';
import { Bot, User } from 'lucide-react';
import { TranscriptEntry } from '@/lib/types';

interface CallTranscriptProps {
  entries: TranscriptEntry[];
}

export function CallTranscript({ entries }: CallTranscriptProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [entries]);

  if (entries.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-zinc-500 text-sm">
        Waiting for conversation to start...
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-48 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-zinc-700"
    >
      {entries.map((entry, i) => (
        <div
          key={i}
          className={`flex gap-3 ${
            entry.speaker === 'agent' ? 'justify-start' : 'justify-end'
          }`}
        >
          {entry.speaker === 'agent' && (
            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-amber-400" />
            </div>
          )}
          <div
            className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
              entry.speaker === 'agent'
                ? 'bg-zinc-800 text-zinc-100'
                : 'bg-blue-600/20 text-blue-100'
            }`}
          >
            {entry.text}
          </div>
          {entry.speaker === 'restaurant' && (
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-blue-400" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
