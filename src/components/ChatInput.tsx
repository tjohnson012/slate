'use client';

import { useState, FormEvent, KeyboardEvent } from 'react';

interface ChatInputProps {
  onSubmit: (prompt: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSubmit, disabled, placeholder }: ChatInputProps) {
  const [value, setValue] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!value.trim() || disabled) return;
    onSubmit(value.trim());
    setValue('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder || "Plan my evening..."}
          rows={3}
          className="w-full px-4 py-3 pr-14 bg-charcoal border border-light-gray/20 rounded-xl
                     text-slate-white placeholder-warm-gray resize-none
                     focus:outline-none focus:ring-2 focus:ring-slate-red/50 focus:border-slate-red
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all duration-200"
        />
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          className="absolute right-3 bottom-3 p-2 bg-slate-red rounded-lg
                     text-white font-medium
                     hover:bg-slate-red/90 disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors duration-200"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
      <p className="mt-2 text-xs text-warm-gray">
        Try: &quot;Sushi for 2 in the East Village around 7pm, then drinks&quot;
      </p>
    </form>
  );
}
