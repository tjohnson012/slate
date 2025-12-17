'use client';

import { motion } from 'framer-motion';
import { Check, Circle, Loader2 } from 'lucide-react';

interface StatusItem {
  id: string;
  text: string;
  status: 'completed' | 'current' | 'pending';
}

interface StatusFeedProps {
  items: StatusItem[];
}

export function StatusFeed({ items }: StatusFeedProps) {
  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-start gap-3"
        >
          <div className="flex-shrink-0 mt-0.5">
            {item.status === 'completed' && (
              <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center">
                <Check className="w-3 h-3 text-success" />
              </div>
            )}
            {item.status === 'current' && (
              <div className="w-5 h-5 rounded-full bg-slate-red/20 flex items-center justify-center">
                <Loader2 className="w-3 h-3 text-slate-red animate-spin" />
              </div>
            )}
            {item.status === 'pending' && (
              <Circle className="w-5 h-5 text-warm-gray" />
            )}
          </div>
          <p className={`text-sm ${
            item.status === 'completed' ? 'text-success' :
            item.status === 'current' ? 'text-slate-white font-medium' :
            'text-warm-gray'
          }`}>
            {item.text}
          </p>
        </motion.div>
      ))}
    </div>
  );
}
