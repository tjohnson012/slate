'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: number;
  sender: 'user' | 'slate';
  text: string;
  delay: number;
}

const messages: Message[] = [
  { id: 1, sender: 'user', text: 'romantic dinner for 2 in the west village, somewhere quiet with good wine', delay: 0 },
  { id: 2, sender: 'slate', text: 'I found 3 perfect spots. Via Carota has a table at 7:30pm—intimate, candlelit, incredible wine list.', delay: 1500 },
  { id: 3, sender: 'slate', text: 'Want me to book it? I can also grab you a spot at Dante for after-dinner drinks, 5 min walk away.', delay: 3500 },
  { id: 4, sender: 'user', text: 'yes, book both', delay: 5500 },
  { id: 5, sender: 'slate', text: '✓ Done. Via Carota 7:30pm, Dante 9:30pm. Confirmation sent to your phone. Enjoy your evening.', delay: 7000 },
];

export function PhoneMockup() {
  const [visibleMessages, setVisibleMessages] = useState<number[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    messages.forEach((msg) => {
      // Show typing indicator before slate messages
      if (msg.sender === 'slate') {
        setTimeout(() => setIsTyping(true), msg.delay - 800);
      }

      setTimeout(() => {
        setIsTyping(false);
        setVisibleMessages((prev) => [...prev, msg.id]);
      }, msg.delay);
    });

    // Reset and loop
    const totalDuration = messages[messages.length - 1].delay + 4000;
    const interval = setInterval(() => {
      setVisibleMessages([]);
      setIsTyping(false);
    }, totalDuration);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="relative"
      style={{
        perspective: '1000px',
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Phone frame */}
      <motion.div
        className="relative w-[280px] md:w-[320px] bg-slate-black rounded-[40px] p-3 shadow-xl border border-light-gray/10"
        style={{
          transform: 'rotateY(-5deg) rotateX(5deg)',
        }}
        animate={{
          rotateY: [-5, -3, -5],
          rotateX: [5, 3, 5],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* Screen */}
        <div className="bg-charcoal rounded-[32px] overflow-hidden">
          {/* Status bar */}
          <div className="flex items-center justify-between px-6 py-3 bg-charcoal">
            <span className="text-xs text-slate-white">9:41</span>
            <div className="flex items-center gap-1">
              <div className="w-4 h-2 border border-slate-white rounded-sm">
                <div className="w-3/4 h-full bg-slate-white rounded-sm" />
              </div>
            </div>
          </div>

          {/* Chat header */}
          <div className="px-4 py-3 border-b border-light-gray/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-red flex items-center justify-center">
              <span className="font-display text-white font-bold text-sm">S</span>
            </div>
            <div>
              <p className="font-medium text-slate-white text-sm">Slate</p>
              <p className="text-xs text-success">Online</p>
            </div>
          </div>

          {/* Messages */}
          <div className="h-[380px] md:h-[420px] p-4 space-y-3 overflow-hidden">
            <AnimatePresence mode="popLayout">
              {messages
                .filter((msg) => visibleMessages.includes(msg.id))
                .map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm ${
                        msg.sender === 'user'
                          ? 'bg-slate-red text-white rounded-br-md'
                          : 'bg-light-gray/10 text-slate-white rounded-bl-md'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </motion.div>
                ))}

              {/* Typing indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-light-gray/10 px-4 py-3 rounded-2xl rounded-bl-md">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 bg-warm-gray rounded-full"
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            delay: i * 0.2,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Input area */}
          <div className="px-4 py-3 border-t border-light-gray/10 flex items-center gap-2">
            <div className="flex-1 bg-light-gray/10 rounded-full px-4 py-2">
              <span className="text-warm-gray text-sm">Message...</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-red flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Home indicator */}
        <div className="flex justify-center mt-2">
          <div className="w-32 h-1 bg-slate-white/30 rounded-full" />
        </div>
      </motion.div>

      {/* Glow effect */}
      <div className="absolute -inset-10 bg-slate-red/10 blur-3xl rounded-full -z-10" />
    </div>
  );
}
