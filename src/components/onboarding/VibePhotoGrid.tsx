'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { VIBE_PHOTOS } from '@/lib/vibe';

interface Props {
  onSelect: (selectedIds: string[]) => void;
  maxSelections?: number;
}

export function VibePhotoGrid({ onSelect, maxSelections = 5 }: Props) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggleSelection = (id: string) => {
    setSelected(prev => {
      if (prev.includes(id)) {
        const next = prev.filter(s => s !== id);
        onSelect(next);
        return next;
      }
      if (prev.length >= maxSelections) return prev;
      const next = [...prev, id];
      onSelect(next);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center text-sm text-zinc-400">
        <span>Select {maxSelections} vibes you love</span>
        <span>{selected.length}/{maxSelections}</span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {VIBE_PHOTOS.map((photo, i) => {
          const isSelected = selected.includes(photo.id);
          const isDisabled = !isSelected && selected.length >= maxSelections;

          return (
            <motion.button
              key={photo.id}
              onClick={() => toggleSelection(photo.id)}
              disabled={isDisabled}
              className={`relative aspect-square rounded-xl overflow-hidden ${
                isDisabled ? 'opacity-40' : ''
              }`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: isDisabled ? 1 : 1.02 }}
              whileTap={{ scale: isDisabled ? 1 : 0.98 }}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${
                  photo.vibeVector.lighting < 50
                    ? 'from-zinc-900 to-zinc-800'
                    : 'from-amber-900/30 to-orange-900/30'
                }`}
              />

              <div className="absolute inset-0 flex items-end p-2">
                <span className="text-xs text-white font-medium bg-black/50 px-2 py-1 rounded">
                  {photo.description}
                </span>
              </div>

              {isSelected && (
                <motion.div
                  className="absolute inset-0 bg-amber-500/30 border-2 border-amber-500 rounded-xl flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-zinc-900" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
