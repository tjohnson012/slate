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

// Sample photos for the vibe selection
export const vibePhotos: Photo[] = [
  { id: '1', url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400', alt: 'Elegant restaurant interior' },
  { id: '2', url: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400', alt: 'Cozy bar atmosphere' },
  { id: '3', url: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400', alt: 'Busy restaurant scene' },
  { id: '4', url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400', alt: 'Fine dining plating' },
  { id: '5', url: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?w=400', alt: 'Outdoor dining patio' },
  { id: '6', url: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=400', alt: 'Intimate candlelit dinner' },
  { id: '7', url: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400', alt: 'Modern sushi counter' },
  { id: '8', url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400', alt: 'Casual neighborhood spot' },
  { id: '9', url: 'https://images.unsplash.com/photo-1578474846511-04ba529f0b88?w=400', alt: 'Wine bar shelves' },
  { id: '10', url: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=400', alt: 'Chef kitchen action' },
  { id: '11', url: 'https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=400', alt: 'Rooftop dining view' },
  { id: '12', url: 'https://images.unsplash.com/photo-1579027989536-b7b1f875659b?w=400', alt: 'Japanese izakaya' },
];
