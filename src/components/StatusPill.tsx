type StatusType =
  | 'pending'
  | 'confirmed'
  | 'failed'
  | 'handoff'
  | 'checking'
  | 'available'
  | 'booked'
  | 'unavailable';

interface Props {
  status: StatusType;
}

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-amber-500/20 text-amber-400 animate-pulse' },
  confirmed: { label: 'Confirmed', className: 'bg-emerald-500/20 text-emerald-400' },
  failed: { label: 'Failed', className: 'bg-red-500/20 text-red-400' },
  handoff: { label: 'Complete on Yelp', className: 'bg-blue-500/20 text-blue-400' },
  checking: { label: 'Checking', className: 'bg-zinc-700 text-zinc-300 animate-pulse' },
  available: { label: 'Available', className: 'bg-blue-500/20 text-blue-400' },
  booked: { label: 'Booked', className: 'bg-emerald-500/20 text-emerald-400' },
  unavailable: { label: 'Unavailable', className: 'bg-zinc-700 text-zinc-400' },
};

export function StatusPill({ status }: Props) {
  const config = statusConfig[status];

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {(status === 'checking' || status === 'pending') && (
        <svg className="w-3 h-3 mr-1.5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {(status === 'booked' || status === 'confirmed') && (
        <svg className="w-3 h-3 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      )}
      {config.label}
    </span>
  );
}
