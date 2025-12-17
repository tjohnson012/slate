'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import Image from 'next/image';

interface Photo {
  id: string;
  url: string;
  alt: string;
}

interface PhotoGridProps {
  photos: Photo[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  minSelection?: number;
  maxSelection?: number;
}

export function PhotoGrid({
  photos,
  selectedIds,
  onSelectionChange,
  minSelection = 3,
  maxSelection = 6,
}: PhotoGridProps) {
  const toggleSelection = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((s) => s !== id));
    } else if (selectedIds.length < maxSelection) {
      onSelectionChange([...selectedIds, id]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-warm-gray">
          Select {minSelection}-{maxSelection} photos that match your vibe
        </p>
        <span className="text-sm font-medium text-slate-white">
          {selectedIds.length} selected
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {photos.map((photo, index) => (
          <PhotoCard
            key={photo.id}
            photo={photo}
            selected={selectedIds.includes(photo.id)}
            onToggle={() => toggleSelection(photo.id)}
            delay={index * 0.05}
          />
        ))}
      </div>
    </div>
  );
}

interface PhotoCardProps {
  photo: Photo;
  selected: boolean;
  onToggle: () => void;
  delay?: number;
}

function PhotoCard({ photo, selected, onToggle, delay = 0 }: PhotoCardProps) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onToggle}
      className={`
        relative aspect-square rounded-lg overflow-hidden
        transition-all duration-200
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-red focus-visible:ring-offset-2 focus-visible:ring-offset-slate-black
        ${selected ? 'ring-2 ring-slate-red ring-offset-2 ring-offset-slate-black' : ''}
      `}
    >
      <Image
        src={photo.url}
        alt={photo.alt}
        fill
        className="object-cover"
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
      />

      {/* Overlay on hover */}
      <div
        className={`
          absolute inset-0 transition-opacity duration-200
          ${selected ? 'bg-slate-red/20' : 'bg-black/0 hover:bg-black/20'}
        `}
      />

      {/* Selection badge */}
      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-slate-red flex items-center justify-center"
        >
          <Check className="w-4 h-4 text-white" />
        </motion.div>
      )}
    </motion.button>
  );
}

// Sample photos for the vibe selection - verified working Unsplash URLs
export const vibePhotos: Photo[] = [
  { id: '1', url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=400&fit=crop', alt: 'Elegant restaurant' },
  { id: '2', url: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=400&h=400&fit=crop', alt: 'Cozy bar' },
  { id: '3', url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=400&fit=crop', alt: 'Busy restaurant' },
  { id: '4', url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=400&fit=crop', alt: 'Fine dining' },
  { id: '5', url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=400&fit=crop', alt: 'Outdoor patio' },
  { id: '6', url: 'https://images.unsplash.com/photo-1529543544277-750e04f96e74?w=400&h=400&fit=crop', alt: 'Candlelit dinner' },
  { id: '7', url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&h=400&fit=crop', alt: 'Sushi counter' },
  { id: '8', url: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=400&h=400&fit=crop', alt: 'Neighborhood spot' },
  { id: '9', url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=400&fit=crop', alt: 'Wine bar' },
  { id: '10', url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&h=400&fit=crop', alt: 'Chef kitchen' },
  { id: '11', url: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&h=400&fit=crop', alt: 'Rooftop dining' },
  { id: '12', url: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&h=400&fit=crop', alt: 'Japanese izakaya' },
];
