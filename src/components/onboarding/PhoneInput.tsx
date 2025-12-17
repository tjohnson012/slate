'use client';

import { useState, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Phone } from 'lucide-react';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value, onChange, error, disabled }, ref) => {
    const formatPhoneNumber = (input: string) => {
      const digits = input.replace(/\D/g, '');
      const limited = digits.slice(0, 10);

      if (limited.length === 0) return '';
      if (limited.length <= 3) return `(${limited}`;
      if (limited.length <= 6) return `(${limited.slice(0, 3)}) ${limited.slice(3)}`;
      return `(${limited.slice(0, 3)}) ${limited.slice(3, 6)}-${limited.slice(6)}`;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatPhoneNumber(e.target.value);
      onChange(formatted);
    };

    return (
      <div className="w-full">
        <label htmlFor="phone" className="block text-sm font-medium text-slate-white mb-2">
          Phone Number
        </label>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <span className="text-warm-gray text-sm">+1</span>
            <div className="w-px h-5 bg-light-gray/20" />
          </div>
          <input
            ref={ref}
            id="phone"
            type="tel"
            value={value}
            onChange={handleChange}
            disabled={disabled}
            placeholder="(555) 123-4567"
            className={`
              w-full pl-16 pr-4 py-3 bg-charcoal border rounded-lg
              text-slate-white placeholder:text-warm-gray
              transition-all duration-150
              focus:outline-none focus:ring-1
              disabled:opacity-50 disabled:cursor-not-allowed
              ${error
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                : 'border-light-gray/20 focus:border-slate-red focus:ring-slate-red'
              }
            `}
          />
          <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-warm-gray" />
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-red-500" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

PhoneInput.displayName = 'PhoneInput';

interface VerificationCodeInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  length?: number;
}

export function VerificationCodeInput({
  value,
  onChange,
  error,
  disabled,
  length = 6,
}: VerificationCodeInputProps) {
  const [focused, setFocused] = useState<number | null>(null);

  const digits = value.split('').concat(Array(length - value.length).fill(''));

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      const inputs = document.querySelectorAll<HTMLInputElement>('[data-code-input]');
      inputs[index - 1]?.focus();
    }
  };

  const handleInput = (index: number, inputValue: string) => {
    if (!/^\d*$/.test(inputValue)) return;

    const newDigits = [...digits];
    const chars = inputValue.split('');

    // Handle paste
    if (chars.length > 1) {
      chars.slice(0, length - index).forEach((char, i) => {
        newDigits[index + i] = char;
      });
      onChange(newDigits.join('').slice(0, length));
      const nextIndex = Math.min(index + chars.length, length - 1);
      const inputs = document.querySelectorAll<HTMLInputElement>('[data-code-input]');
      inputs[nextIndex]?.focus();
      return;
    }

    // Handle single digit
    newDigits[index] = inputValue;
    onChange(newDigits.join('').slice(0, length));

    if (inputValue && index < length - 1) {
      const inputs = document.querySelectorAll<HTMLInputElement>('[data-code-input]');
      inputs[index + 1]?.focus();
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-slate-white mb-2">
        Verification Code
      </label>
      <div className="flex gap-2 justify-center">
        {digits.map((digit, index) => (
          <motion.input
            key={index}
            data-code-input
            type="text"
            inputMode="numeric"
            maxLength={length}
            value={digit}
            disabled={disabled}
            onFocus={() => setFocused(index)}
            onBlur={() => setFocused(null)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onChange={(e) => handleInput(index, e.target.value)}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.05 }}
            className={`
              w-12 h-14 text-center text-xl font-mono font-bold
              bg-charcoal border rounded-lg
              text-slate-white
              transition-all duration-150
              focus:outline-none focus:ring-1
              disabled:opacity-50 disabled:cursor-not-allowed
              ${error
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                : focused === index
                ? 'border-slate-red focus:border-slate-red focus:ring-slate-red'
                : 'border-light-gray/20'
              }
            `}
          />
        ))}
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-500 text-center" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
