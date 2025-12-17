'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { PhotoGrid, vibePhotos, PhoneInput, VerificationCodeInput, VibeProfile, calculateVibeFromPhotos } from '@/components/onboarding';
import { Button } from '@/components/shared';
import { usePlanStore } from '@/stores/planStore';

type Step = 'photos' | 'phone' | 'verify' | 'profile';

export default function OnboardingPage() {
  const router = useRouter();
  const { updateVibeVector, setFavoritePhotos, setUserPhone } = usePlanStore();

  const [step, setStep] = useState<Step>('photos');
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [codeError, setCodeError] = useState('');
  const [loading, setLoading] = useState(false);

  const vibeProfile = calculateVibeFromPhotos(selectedPhotos);

  const handlePhotosContinue = () => {
    if (selectedPhotos.length >= 3) {
      setStep('phone');
    }
  };

  const handlePhoneSubmit = async () => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) {
      setPhoneError('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    setPhoneError('');

    try {
      const res = await fetch('/api/verify/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPhoneError(data.error || 'Failed to send code');
        setLoading(false);
        return;
      }

      setLoading(false);
      setStep('verify');
    } catch {
      setPhoneError('Failed to send verification code');
      setLoading(false);
    }
  };

  const handleCodeSubmit = async () => {
    if (code.length !== 6) {
      setCodeError('Please enter the 6-digit code');
      return;
    }

    setLoading(true);
    setCodeError('');

    try {
      const res = await fetch('/api/verify/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code }),
      });

      const data = await res.json();

      if (!res.ok) {
        setCodeError(data.error || 'Invalid code');
        setLoading(false);
        return;
      }

      // Save verified phone number
      setUserPhone(data.phone);
      setLoading(false);
      setStep('profile');
    } catch {
      setCodeError('Verification failed');
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setCode('');
    setCodeError('');
    setLoading(true);

    try {
      await fetch('/api/verify/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
    } catch {
      // Silent fail
    }

    setLoading(false);
  };

  const handleComplete = () => {
    updateVibeVector(vibeProfile);
    setFavoritePhotos(selectedPhotos);
    router.push('/plan');
  };

  const goBack = () => {
    if (step === 'phone') setStep('photos');
    else if (step === 'verify') setStep('phone');
    else if (step === 'profile') setStep('verify');
  };

  const stepIndex = ['photos', 'phone', 'verify', 'profile'].indexOf(step);

  return (
    <main className="min-h-screen bg-slate-black">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-charcoal z-50">
        <motion.div
          className="h-full bg-slate-red"
          initial={{ width: '25%' }}
          animate={{ width: `${(stepIndex + 1) * 25}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="max-w-2xl mx-auto px-6 py-16">
        {/* Back button */}
        {step !== 'photos' && (
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={goBack}
            className="flex items-center gap-2 text-warm-gray hover:text-slate-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </motion.button>
        )}

        <AnimatePresence mode="wait">
          {/* Step 1: Photo Selection */}
          {step === 'photos' && (
            <motion.div
              key="photos"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-8">
                <h1 className="font-display text-3xl font-bold text-slate-white mb-2">
                  What&apos;s your vibe?
                </h1>
                <p className="text-warm-gray">
                  Pick scenes that speak to you. We&apos;ll find spots that match.
                </p>
              </div>

              <PhotoGrid
                photos={vibePhotos}
                selectedIds={selectedPhotos}
                onSelectionChange={setSelectedPhotos}
                minSelection={3}
                maxSelection={6}
              />

              <motion.div
                className="mt-8"
                animate={{ opacity: selectedPhotos.length >= 3 ? 1 : 0.5 }}
              >
                <Button
                  onClick={handlePhotosContinue}
                  disabled={selectedPhotos.length < 3}
                  fullWidth
                  size="lg"
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                >
                  {selectedPhotos.length < 3
                    ? `Select ${3 - selectedPhotos.length} more`
                    : 'Continue'}
                </Button>
              </motion.div>
            </motion.div>
          )}

          {/* Step 2: Phone Input */}
          {step === 'phone' && (
            <motion.div
              key="phone"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-sm mx-auto"
            >
              <div className="text-center mb-8">
                <h1 className="font-display text-3xl font-bold text-slate-white mb-2">
                  Get your plans via text
                </h1>
                <p className="text-warm-gray">
                  We&apos;ll send confirmations and reminders right to your phone.
                </p>
              </div>

              <div className="space-y-6">
                <PhoneInput
                  value={phone}
                  onChange={setPhone}
                  error={phoneError}
                  disabled={loading}
                />

                <Button
                  onClick={handlePhoneSubmit}
                  loading={loading}
                  fullWidth
                  size="lg"
                  rightIcon={!loading && <ArrowRight className="w-5 h-5" />}
                >
                  Send Code
                </Button>

                <button
                  onClick={() => setStep('profile')}
                  className="w-full text-center text-sm text-warm-gray hover:text-slate-white transition-colors"
                >
                  Skip for now
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Verification */}
          {step === 'verify' && (
            <motion.div
              key="verify"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-sm mx-auto"
            >
              <div className="text-center mb-8">
                <h1 className="font-display text-3xl font-bold text-slate-white mb-2">
                  Enter your code
                </h1>
                <p className="text-warm-gray">
                  We sent a 6-digit code to {phone}
                </p>
              </div>

              <div className="space-y-6">
                <VerificationCodeInput
                  value={code}
                  onChange={setCode}
                  error={codeError}
                  disabled={loading}
                />

                <Button
                  onClick={handleCodeSubmit}
                  loading={loading}
                  fullWidth
                  size="lg"
                  rightIcon={!loading && <Check className="w-5 h-5" />}
                >
                  Verify
                </Button>

                <button
                  onClick={handleResendCode}
                  disabled={loading}
                  className="w-full text-center text-sm text-warm-gray hover:text-slate-white transition-colors disabled:opacity-50"
                >
                  Resend code
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Vibe Profile */}
          {step === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <VibeProfile profile={vibeProfile} />

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="mt-8"
              >
                <Button
                  onClick={handleComplete}
                  fullWidth
                  size="lg"
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                >
                  Start Planning
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
