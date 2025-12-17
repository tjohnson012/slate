'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Navigation } from '@/components/landing';
import { AutonomySetup } from '@/components/autonomy';
import { AutonomyConfig } from '@/lib/types';

export default function AutonomySettingsPage() {
  const [saved, setSaved] = useState(false);

  const handleSave = async (config: AutonomyConfig) => {
    try {
      await fetch('/api/autonomy/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save:', error);
    }
  };

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-slate-black pt-20">
        <div className="max-w-2xl mx-auto px-6 py-12">
          <Link
            href="/plan"
            className="inline-flex items-center gap-2 text-warm-gray hover:text-slate-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Planning
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-red to-red-600 flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-slate-white">
                  Autonomy Mode
                </h1>
                <p className="text-warm-gray">Let Slate handle your regular plans</p>
              </div>
            </div>

            <div className="p-4 bg-slate-red/10 border border-slate-red/20 rounded-xl">
              <p className="text-sm text-slate-white">
                <span className="font-medium">How it works:</span> Set your preferences once, and Slate will
                automatically plan and book your regular outings. Wake up to confirmed reservations.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-charcoal rounded-xl p-6"
          >
            <AutonomySetup onSave={handleSave} />
          </motion.div>

          {saved && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-success text-white rounded-lg flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Settings saved!
            </motion.div>
          )}
        </div>
      </main>
    </>
  );
}
