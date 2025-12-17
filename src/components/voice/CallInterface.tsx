'use client';

import { useState, useEffect, useCallback } from 'react';
import { Phone, PhoneOff, Mic, Volume2 } from 'lucide-react';
import { VoiceCall, TranscriptEntry } from '@/lib/types';
import { CallTranscript } from './CallTranscript';
import { CallWaveform } from './CallWaveform';

interface CallInterfaceProps {
  restaurantId: string;
  restaurantName: string;
  date: string;
  time: string;
  partySize: number;
  guestName: string;
  onComplete?: (result: VoiceCall) => void;
  onCancel?: () => void;
}

export function CallInterface({
  restaurantId,
  restaurantName,
  date,
  time,
  partySize,
  guestName,
  onComplete,
  onCancel,
}: CallInterfaceProps) {
  const [call, setCall] = useState<VoiceCall | null>(null);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [status, setStatus] = useState<string>('idle');
  const [error, setError] = useState<string | null>(null);

  const initiateCall = useCallback(async () => {
    setStatus('initiating');
    setError(null);

    try {
      const response = await fetch('/api/voice/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId,
          date,
          time,
          partySize,
          guestName,
        }),
      });

      if (!response.ok) throw new Error('Failed to initiate call');

      const { call: newCall } = await response.json();
      setCall(newCall);

      const eventSource = new EventSource(`/api/voice/stream?callId=${newCall.id}`);

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === 'status') {
          setStatus(data.status);
        } else if (data.type === 'transcript') {
          setTranscript((prev) => [...prev, data.entry]);
        } else if (data.type === 'result') {
          setCall((prev) => prev ? { ...prev, result: data.result, status: 'completed' } : null);
          setStatus('completed');
          eventSource.close();
          if (onComplete && call) {
            onComplete({ ...call, result: data.result, status: 'completed' });
          }
        } else if (data.type === 'failed' || data.type === 'error') {
          setStatus('failed');
          setError(data.message || 'Call failed');
          eventSource.close();
        } else if (data.type === 'timeout') {
          setStatus('timeout');
          setError('Call timed out');
          eventSource.close();
        }
      };

      eventSource.onerror = () => {
        setError('Connection lost');
        eventSource.close();
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start call');
      setStatus('failed');
    }
  }, [restaurantId, date, time, partySize, guestName, call, onComplete]);

  useEffect(() => {
    initiateCall();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getStatusDisplay = () => {
    switch (status) {
      case 'initiating':
        return 'Preparing call...';
      case 'dialing':
        return 'Dialing restaurant...';
      case 'ringing':
        return 'Ringing...';
      case 'connected':
        return 'Connected';
      case 'completed':
        return 'Call complete';
      case 'failed':
        return 'Call failed';
      default:
        return status;
    }
  };

  const isActive = ['dialing', 'ringing', 'connected'].includes(status);

  return (
    <div className="bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800">
      <div className="p-6 border-b border-zinc-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">{restaurantName}</h3>
            <p className="text-sm text-zinc-400">
              {date} at {time} for {partySize}
            </p>
          </div>
          <div
            className={`px-3 py-1 rounded-full text-sm ${
              status === 'completed'
                ? 'bg-green-500/20 text-green-400'
                : status === 'failed'
                ? 'bg-red-500/20 text-red-400'
                : 'bg-amber-500/20 text-amber-400'
            }`}
          >
            {getStatusDisplay()}
          </div>
        </div>

        {isActive && (
          <div className="flex items-center gap-4 p-4 bg-zinc-800/50 rounded-xl">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <Phone className="w-5 h-5 text-green-400" />
              </div>
              {isActive && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              )}
            </div>
            <div className="flex-1">
              <CallWaveform active={status === 'connected'} />
            </div>
            <div className="flex gap-2">
              <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center">
                <Mic className="w-4 h-4 text-zinc-300" />
              </div>
              <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center">
                <Volume2 className="w-4 h-4 text-zinc-300" />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}
      </div>

      <div className="p-6">
        <h4 className="text-sm font-medium text-zinc-400 mb-3">Live Transcript</h4>
        <CallTranscript entries={transcript} />
      </div>

      {call?.result && (
        <div className="p-6 border-t border-zinc-800 bg-green-500/5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
              <Phone className="w-4 h-4 text-green-400" />
            </div>
            <div>
              <p className="font-medium text-green-400">Reservation Confirmed!</p>
              {call.result.confirmationNumber && (
                <p className="text-sm text-zinc-400 mt-1">
                  Confirmation: <span className="font-mono">{call.result.confirmationNumber}</span>
                </p>
              )}
              <p className="text-sm text-zinc-400">
                {call.result.confirmedTime} for {call.result.confirmedPartySize} guests
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 border-t border-zinc-800 flex justify-end gap-3">
        {status === 'completed' ? (
          <button
            onClick={() => onComplete?.(call!)}
            className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-medium transition-colors"
          >
            Done
          </button>
        ) : (
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <PhoneOff className="w-4 h-4" />
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
