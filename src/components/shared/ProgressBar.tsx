'use client';

import { forwardRef, HTMLAttributes } from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  value: number; // 0-100
  max?: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'red' | 'success' | 'warning' | 'gradient';
  animated?: boolean;
}

const heights = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

const colors = {
  red: 'bg-slate-red',
  success: 'bg-success',
  warning: 'bg-warning',
  gradient: 'bg-gradient-to-r from-slate-red to-[#e63e58]',
};

export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    {
      value,
      max = 100,
      showLabel = false,
      size = 'md',
      color = 'red',
      animated = true,
      className = '',
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    return (
      <div ref={ref} className={`w-full ${className}`} {...props}>
        {showLabel && (
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-sm text-warm-gray">Progress</span>
            <span className="text-sm font-medium text-slate-white">{Math.round(percentage)}%</span>
          </div>
        )}
        <div
          className={`w-full bg-light-gray/20 rounded-full overflow-hidden ${heights[size]}`}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        >
          <motion.div
            className={`h-full rounded-full ${colors[color]}`}
            initial={animated ? { width: 0 } : { width: `${percentage}%` }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>
    );
  }
);

ProgressBar.displayName = 'ProgressBar';

// Vibe dimension bar for profile display
interface VibeDimensionBarProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  lowLabel: string;
  highLabel: string;
  value: number; // 0-100
  description?: string;
  animationDelay?: number;
}

export const VibeDimensionBar = forwardRef<HTMLDivElement, VibeDimensionBarProps>(
  (
    {
      label,
      lowLabel,
      highLabel,
      value,
      description,
      animationDelay = 0,
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <div ref={ref} className={className} {...props}>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-slate-white">{label}</span>
          {description && (
            <span className="text-xs text-warm-gray">{description}</span>
          )}
        </div>
        <div className="relative">
          <div className="h-2 bg-light-gray/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-slate-red to-[#e63e58] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${value}%` }}
              transition={{ duration: 0.6, delay: animationDelay, ease: 'easeOut' }}
            />
          </div>
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-warm-gray">{lowLabel}</span>
          <span className="text-xs text-warm-gray">{highLabel}</span>
        </div>
      </div>
    );
  }
);

VibeDimensionBar.displayName = 'VibeDimensionBar';
