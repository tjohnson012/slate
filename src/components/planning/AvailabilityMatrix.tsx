'use client';

import { motion } from 'framer-motion';
import { Check, X, Loader2 } from 'lucide-react';
import { AvailabilityMatrix as MatrixType, AvailabilityCell, CellStatus } from '@/lib/types';

interface AvailabilityMatrixProps {
  matrix: MatrixType;
  onSelect?: (row: number, col: number) => void;
}

export function AvailabilityMatrix({ matrix, onSelect }: AvailabilityMatrixProps) {
  return (
    <div className="overflow-x-auto bg-charcoal rounded-xl p-4 border border-light-gray/10">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="sticky left-0 bg-charcoal z-10 p-3 text-left text-sm font-medium text-warm-gray">
              Restaurant
            </th>
            {matrix.timeSlots.map((time) => (
              <th key={time} className="p-3 text-center text-sm font-medium text-warm-gray min-w-[80px]">
                {time}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.restaurants.map((restaurant, rowIndex) => (
            <motion.tr
              key={restaurant.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: rowIndex * 0.1 }}
              className="border-t border-light-gray/10"
            >
              <td className="sticky left-0 bg-charcoal z-10 p-3">
                <p className="font-medium text-slate-white">{restaurant.name}</p>
                {restaurant.vibeMatchScore !== undefined && (
                  <p className="text-xs text-slate-red">{restaurant.vibeMatchScore}% match</p>
                )}
              </td>
              {matrix.cells[rowIndex]?.map((cell, colIndex) => {
                const isSelected = matrix.selectedCell?.row === rowIndex && matrix.selectedCell?.col === colIndex;
                return (
                  <td key={`${rowIndex}-${colIndex}`} className="p-2">
                    <SlotCell
                      cell={cell}
                      isSelected={isSelected}
                      onClick={() => cell.status === 'available' && onSelect?.(rowIndex, colIndex)}
                    />
                  </td>
                );
              })}
            </motion.tr>
          ))}
        </tbody>
      </table>

      <div className="flex gap-4 mt-4 text-xs text-warm-gray">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-success" /> Available
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-red-500/60" /> Unavailable
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-warning animate-pulse" /> Checking
        </div>
      </div>
    </div>
  );
}

interface SlotCellProps {
  cell: AvailabilityCell;
  isSelected: boolean;
  onClick: () => void;
}

function SlotCell({ cell, isSelected, onClick }: SlotCellProps) {
  const baseClasses = "w-full h-10 rounded-lg flex items-center justify-center transition-all";

  const statusConfig: Record<CellStatus, { bg: string; icon: React.ReactNode }> = {
    idle: { bg: 'bg-light-gray/5', icon: null },
    checking: { bg: 'bg-warning/20', icon: <Loader2 className="w-4 h-4 text-warning animate-spin" /> },
    available: { bg: isSelected ? 'bg-slate-red ring-2 ring-slate-red ring-offset-2 ring-offset-charcoal' : 'bg-success/20 hover:bg-success/30', icon: <Check className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-success'}`} /> },
    unavailable: { bg: 'bg-red-500/10', icon: <X className="w-4 h-4 text-red-400/50" /> },
    selected: { bg: 'bg-slate-red ring-2 ring-slate-red ring-offset-2 ring-offset-charcoal', icon: <Check className="w-4 h-4 text-white" /> },
    booking: { bg: 'bg-warning/30', icon: <Loader2 className="w-4 h-4 text-warning animate-spin" /> },
    booked: { bg: 'bg-success', icon: <Check className="w-4 h-4 text-white" /> },
    failed: { bg: 'bg-red-500/20', icon: <X className="w-4 h-4 text-red-400" /> },
  };

  const config = statusConfig[cell.status];

  if (cell.status === 'available' && !isSelected) {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className={`${baseClasses} cursor-pointer ${config.bg}`}
      >
        {config.icon}
      </motion.button>
    );
  }

  return (
    <div className={`${baseClasses} ${config.bg}`}>
      {config.icon}
    </div>
  );
}
