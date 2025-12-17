'use client';

import { HTMLAttributes, forwardRef } from 'react';

type BadgeVariant = 'default' | 'red' | 'success' | 'warning' | 'gray' | 'outline';
type BadgeSize = 'sm' | 'md';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
}

const variants: Record<BadgeVariant, string> = {
  default: 'bg-slate-red/20 text-slate-red',
  red: 'bg-slate-red/20 text-slate-red',
  success: 'bg-success/20 text-success',
  warning: 'bg-warning/20 text-warning',
  gray: 'bg-warm-gray/20 text-warm-gray',
  outline: 'bg-transparent border border-light-gray/30 text-slate-white',
};

const sizes: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'default', size = 'sm', dot = false, className = '', children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={`
          inline-flex items-center gap-1.5 rounded-full font-medium
          ${variants[variant]}
          ${sizes[size]}
          ${className}
        `}
        {...props}
      >
        {dot && (
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              variant === 'success'
                ? 'bg-success'
                : variant === 'warning'
                ? 'bg-warning'
                : variant === 'gray'
                ? 'bg-warm-gray'
                : 'bg-slate-red'
            }`}
          />
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

// Status badge for confirmed/pending/etc states
interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  status: 'confirmed' | 'pending' | 'checking' | 'unavailable' | 'no-reservation';
}

const statusConfig: Record<StatusBadgeProps['status'], { label: string; variant: BadgeVariant }> = {
  confirmed: { label: 'CONFIRMED', variant: 'success' },
  pending: { label: 'PENDING', variant: 'warning' },
  checking: { label: 'CHECKING', variant: 'warning' },
  unavailable: { label: 'UNAVAILABLE', variant: 'gray' },
  'no-reservation': { label: 'NO RESERVATION NEEDED', variant: 'gray' },
};

export const StatusBadge = forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ status, className = '', ...props }, ref) => {
    const config = statusConfig[status];
    return (
      <Badge
        ref={ref}
        variant={config.variant}
        dot={status === 'checking'}
        className={`uppercase tracking-wide ${className}`}
        {...props}
      >
        {config.label}
      </Badge>
    );
  }
);

StatusBadge.displayName = 'StatusBadge';
