'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mic, Send, MicOff } from 'lucide-react';
import { VoiceWaveform } from './VoiceWaveform';

interface MainInputProps {
  onSubmit: (prompt: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function MainInput({ onSubmit, disabled, placeholder = "What are you in the mood for tonight?" }: MainInputProps) {
  const [value, setValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (value.trim() && !disabled) {
      onSubmit(value.trim());
      setValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const toggleVoice = () => {
    setIsListening(!isListening);
    // Voice recognition would be implemented here
  };

  return (
    <div className="relative">
      <div className="relative bg-charcoal rounded-2xl border border-light-gray/20 focus-within:border-slate-red transition-colors">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          rows={3}
          className="w-full px-5 py-4 pr-24 bg-transparent text-slate-white placeholder:text-warm-gray resize-none focus:outline-none disabled:opacity-50"
        />

        <div className="absolute right-3 bottom-3 flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleVoice}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              isListening ? 'bg-slate-red text-white' : 'bg-light-gray/10 text-warm-gray hover:text-slate-white'
            }`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSubmit}
            disabled={!value.trim() || disabled}
            className="w-10 h-10 rounded-full bg-slate-red text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {isListening && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-charcoal rounded-xl"
        >
          <VoiceWaveform active={isListening} />
          <p className="text-center text-sm text-warm-gray mt-2">Listening...</p>
        </motion.div>
      )}
    </div>
  );
}

const quickOptions = [
  "Romantic dinner for 2",
  "Casual drinks with friends",
  "Birthday celebration",
  "Business dinner",
  "Date night in Brooklyn",
];

interface QuickOptionsProps {
  onSelect: (option: string) => void;
}

export function QuickOptions({ onSelect }: QuickOptionsProps) {
  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {quickOptions.map((option) => (
        <motion.button
          key={option}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect(option)}
          className="px-4 py-2 bg-charcoal border border-light-gray/20 rounded-full text-sm text-slate-white hover:border-slate-red/50 transition-colors"
        >
          {option}
        </motion.button>
      ))}
    </div>
  );
}
