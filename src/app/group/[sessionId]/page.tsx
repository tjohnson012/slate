'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { GroupSession, GroupConstraints, EliminationStep, Restaurant } from '@/lib/types';
import { ConstraintInput } from '@/components/group/ConstraintInput';
import { ConstraintGrid } from '@/components/group/ConstraintGrid';

export default function GroupSessionPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const router = useRouter();

  const [session, setSession] = useState<GroupSession | null>(null);
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [isSolving, setIsSolving] = useState(false);
  const [eliminationSteps, setEliminationSteps] = useState<EliminationStep[]>([]);
  const [solution, setSolution] = useState<Restaurant | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(`slate-group-${sessionId}`);
    if (stored) {
      setParticipantId(stored);
    }

    const loadSession = async () => {
      try {
        const res = await fetch(`/api/group/${sessionId}`);
        if (res.ok) {
          const data = await res.json();
          setSession(data);
          if (data.solution) setSolution(data.solution);
        }
      } catch {
        setError('Failed to load session');
      }
    };

    loadSession();
    const interval = setInterval(loadSession, 3000);
    return () => clearInterval(interval);
  }, [sessionId]);

  const refreshSession = async () => {
    try {
      const res = await fetch(`/api/group/${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        setSession(data);
        if (data.solution) setSolution(data.solution);
      }
    } catch {
      setError('Failed to load session');
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsJoining(true);
    try {
      const res = await fetch(`/api/group/${sessionId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), constraints: null }),
      });

      if (res.ok) {
        const { participantId: pid } = await res.json();
        setParticipantId(pid);
        localStorage.setItem(`slate-group-${sessionId}`, pid);
        refreshSession();
      }
    } finally {
      setIsJoining(false);
    }
  };

  const handleConstraints = async (constraints: GroupConstraints) => {
    if (!participantId) return;

    await fetch(`/api/group/${sessionId}/constraints`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ participantId, constraints }),
    });

    refreshSession();
  };

  const handleSolve = async () => {
    setIsSolving(true);
    setEliminationSteps([]);

    const res = await fetch(`/api/group/${sessionId}/solve`, {
      method: 'POST',
    });

    if (!res.body) return;

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        try {
          const event = JSON.parse(line.slice(6));
          if (event.type === 'elimination_step' && event.data?.eliminated !== undefined) {
            setEliminationSteps(prev => [...prev, {
              constraint: event.message,
              participantName: event.data.participant || 'System',
              eliminatedCount: event.data.eliminated,
              remainingCount: event.data.remaining,
            }]);
          } else if (event.type === 'final') {
            setSession(event.session);
            setSolution(event.result.solution);
          }
        } catch {}
      }
    }

    setIsSolving(false);
  };

  if (error) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-2">Session not found</h1>
          <p className="text-zinc-400 mb-4">This group planning session may have expired.</p>
          <button
            onClick={() => router.push('/')}
            className="text-amber-500 hover:text-amber-400"
          >
            Go home
          </button>
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  const currentParticipant = session.participants.find(p => p.id === participantId);
  const isCreator = participantId === session.creatorId;
  const hasSubmittedConstraints = currentParticipant?.constraints.dietary.length ||
    currentParticipant?.constraints.cuisineYes.length ||
    currentParticipant?.constraints.cuisineNo.length;

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Group Dinner</h1>
          <p className="text-zinc-400">
            {session.date} at {session.time} · {session.location}
          </p>
        </motion.div>

        {!participantId ? (
          <motion.form
            onSubmit={handleJoin}
            className="bg-zinc-900 rounded-xl p-6 border border-zinc-800"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h2 className="text-lg font-semibold mb-4">Join this planning session</h2>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 mb-4"
            />
            <button
              type="submit"
              disabled={isJoining || !name.trim()}
              className="w-full py-3 bg-amber-500 text-zinc-900 font-semibold rounded-xl disabled:opacity-50"
            >
              {isJoining ? 'Joining...' : 'Join session'}
            </button>
          </motion.form>
        ) : (
          <div className="space-y-8">
            <ConstraintGrid
              participants={session.participants}
              eliminationSteps={eliminationSteps}
              solution={solution}
              isProcessing={isSolving}
            />

            {session.status === 'collecting' && !hasSubmittedConstraints && (
              <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
                <h2 className="text-lg font-semibold mb-4">Your preferences</h2>
                <ConstraintInput onSubmit={handleConstraints} />
              </div>
            )}

            {session.status === 'collecting' && isCreator && session.participants.length >= 2 && (
              <motion.button
                onClick={handleSolve}
                disabled={isSolving}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-zinc-900 font-bold rounded-xl text-lg disabled:opacity-50"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                {isSolving ? 'Finding the perfect spot...' : 'Find a restaurant everyone loves'}
              </motion.button>
            )}

            {session.status === 'collecting' && !isCreator && (
              <p className="text-center text-zinc-500">
                Waiting for {session.participants[0]?.name} to start the search...
              </p>
            )}

            {solution && (
              <motion.div
                className="flex gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <button
                  onClick={() => router.push(`/plan?restaurant=${solution.id}`)}
                  className="flex-1 py-3 bg-amber-500 text-zinc-900 font-semibold rounded-xl"
                >
                  Book this restaurant
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                  }}
                  className="py-3 px-4 bg-zinc-800 text-white rounded-xl"
                >
                  Share
                </button>
              </motion.div>
            )}
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-zinc-800">
          <p className="text-xs text-zinc-600 text-center">
            Share this link with your group: {typeof window !== 'undefined' ? window.location.href : ''}
          </p>
        </div>
      </div>
    </main>
  );
}
