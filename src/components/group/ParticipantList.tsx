'use client';

import { motion } from 'framer-motion';
import { Check, Clock } from 'lucide-react';

interface Participant {
  id: string;
  name: string;
  status: 'completed' | 'pending';
  constraintsSummary?: string;
}

interface ParticipantListProps {
  participants: Participant[];
}

export function ParticipantList({ participants }: ParticipantListProps) {
  return (
    <div className="space-y-3">
      {participants.map((participant, index) => (
        <motion.div
          key={participant.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center gap-4 p-4 bg-charcoal rounded-xl"
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            participant.status === 'completed' ? 'bg-success/20' : 'bg-light-gray/10'
          }`}>
            {participant.status === 'completed' ? (
              <Check className="w-5 h-5 text-success" />
            ) : (
              <Clock className="w-5 h-5 text-warm-gray" />
            )}
          </div>
          <div className="flex-1">
            <p className="font-medium text-slate-white">{participant.name || 'Waiting...'}</p>
            {participant.constraintsSummary && (
              <p className="text-sm text-warm-gray">{participant.constraintsSummary}</p>
            )}
          </div>
          <span className={`text-xs px-2 py-1 rounded-full ${
            participant.status === 'completed'
              ? 'bg-success/20 text-success'
              : 'bg-warning/20 text-warning'
          }`}>
            {participant.status === 'completed' ? 'Ready' : 'Waiting'}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
