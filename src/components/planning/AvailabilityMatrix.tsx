'use client';

import { motion } from 'framer-motion';
import { AvailabilityMatrix as MatrixType, CellStatus } from '@/lib/types';

interface Props {
  matrix: MatrixType;
}

const statusConfig: Record<CellStatus, { bg: string; icon?: string }> = {
  idle: { bg: 'bg-zinc-800' },
  checking: { bg: 'bg-amber-500/50' },
  available: { bg: 'bg-emerald-500', icon: '✓' },
  unavailable: { bg: 'bg-red-500/60', icon: '✗' },
  selected: { bg: 'bg-emerald-400 ring-2 ring-emerald-300' },
  booking: { bg: 'bg-amber-400' },
  booked: { bg: 'bg-emerald-400 ring-2 ring-white', icon: '★' },
  failed: { bg: 'bg-red-600', icon: '!' },
};

export function AvailabilityMatrix({ matrix }: Props) {
  return (
    <div className="overflow-x-auto bg-zinc-900/50 rounded-xl p-4 border border-zinc-800">
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="text-left p-2 text-zinc-400 font-medium">Restaurant</th>
            {matrix.timeSlots.map((time) => (
              <th key={time} className="p-2 text-zinc-400 font-medium text-center">
                {time}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.restaurants.map((restaurant, ri) => (
            <tr key={restaurant.id} className="border-t border-zinc-800/50">
              <td className="p-2">
                <div className="font-medium text-white truncate max-w-[150px]">
                  {restaurant.name}
                </div>
                <div className="text-xs text-zinc-500">
                  {restaurant.vibeMatchScore}% match
                </div>
              </td>
              {matrix.cells[ri].map((cell, ti) => {
                const config = statusConfig[cell.status];
                const isSelected = matrix.selectedCell?.row === ri && matrix.selectedCell?.col === ti;

                return (
                  <td key={`${ri}-${ti}`} className="p-1">
                    <motion.div
                      className={`w-12 h-8 rounded flex items-center justify-center text-xs font-medium ${config.bg} ${
                        cell.status === 'checking' ? 'animate-pulse' : ''
                      } ${isSelected ? 'ring-2 ring-white' : ''}`}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.2, delay: ri * 0.05 + ti * 0.02 }}
                    >
                      {config.icon && (
                        <span className="text-white">{config.icon}</span>
                      )}
                    </motion.div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex gap-4 mt-4 text-xs text-zinc-500">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-emerald-500" /> Available
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-red-500/60" /> Unavailable
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-amber-500/50 animate-pulse" /> Checking
        </div>
      </div>
    </div>
  );
}
