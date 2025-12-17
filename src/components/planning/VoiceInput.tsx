'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

interface Props {
  onTranscript: (text: string) => void;
  onListeningChange?: (listening: boolean) => void;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: Event) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => ISpeechRecognition;
    webkitSpeechRecognition: new () => ISpeechRecognition;
  }
}

export function VoiceInput({ onTranscript, onListeningChange }: Props) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number>(0);

  const drawWaveform = useCallback(() => {
    if (!canvasRef.current || !analyserRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = '#18181b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    };

    draw();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let final = '';
      let interim = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      setTranscript(final || interim);
      if (final) onTranscript(final);
    };

    recognition.onend = () => {
      setListening(false);
      onListeningChange?.(false);
      cancelAnimationFrame(animationRef.current);
    };

    recognitionRef.current = recognition;

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [onTranscript, onListeningChange]);

  const toggleListening = async () => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      onListeningChange?.(false);
      cancelAnimationFrame(animationRef.current);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analyserRef.current = analyser;
        drawWaveform();
      } catch {
        console.error('Microphone access denied');
      }

      recognitionRef.current?.start();
      setListening(true);
      onListeningChange?.(true);
      setTranscript('');
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {listening && (
        <motion.canvas
          ref={canvasRef}
          width={300}
          height={60}
          className="rounded-lg"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        />
      )}

      <motion.button
        onClick={toggleListening}
        className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg ${
          listening ? 'bg-red-500' : 'bg-amber-500'
        }`}
        whileTap={{ scale: 0.95 }}
        animate={listening ? { scale: [1, 1.1, 1] } : {}}
        transition={{ repeat: listening ? Infinity : 0, duration: 1.5 }}
      >
        {listening ? (
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-zinc-900" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 14a3 3 0 003-3V5a3 3 0 00-6 0v6a3 3 0 003 3z" />
            <path d="M19 11a1 1 0 00-2 0 5 5 0 01-10 0 1 1 0 00-2 0 7 7 0 006 6.93V21h-3a1 1 0 000 2h8a1 1 0 000-2h-3v-3.07A7 7 0 0019 11z" />
          </svg>
        )}
      </motion.button>

      {transcript && (
        <motion.p
          className="text-zinc-400 text-center max-w-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {transcript}
        </motion.p>
      )}

      <p className="text-xs text-zinc-500">
        {listening ? 'Listening... speak your request' : 'Tap to speak'}
      </p>
    </div>
  );
}
