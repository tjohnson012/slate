'use client';

import { motion } from 'framer-motion';

interface HowItWorksCardProps {
  number: string;
  title: string;
  description: string;
  delay?: number;
}

export function HowItWorksCard({ number, title, description, delay = 0 }: HowItWorksCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.5, delay }}
      className="relative bg-charcoal rounded-xl p-8 group hover:shadow-medium transition-all duration-300"
    >
      {/* Large number watermark */}
      <span className="absolute top-4 right-4 font-display text-6xl font-bold text-slate-white/[0.05] select-none">
        {number}
      </span>

      <div className="relative">
        <div className="w-12 h-12 rounded-lg bg-slate-red/10 flex items-center justify-center mb-6">
          <span className="font-display text-xl font-bold text-slate-red">{number}</span>
        </div>

        <h3 className="font-display text-xl font-semibold text-slate-white mb-3">
          {title}
        </h3>

        <p className="text-warm-gray leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  );
}

export function HowItWorksSection() {
  const steps = [
    {
      number: '1',
      title: 'Tell us what you want',
      description: 'Type naturally—"romantic dinner in SoHo" or "something fun for a birthday." No forms, no filters.',
    },
    {
      number: '2',
      title: 'We find the perfect spots',
      description: 'Our AI searches real-time availability, matches your vibe, and handles the logistics.',
    },
    {
      number: '3',
      title: 'Show up and enjoy',
      description: 'Get your confirmations. Walk in knowing everything\'s taken care of.',
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-slate-black">
      <div className="max-w-container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-slate-white mb-4">
            How it works
          </h2>
          <p className="text-warm-gray text-lg max-w-xl mx-auto">
            From idea to confirmation in under a minute.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step, index) => (
            <HowItWorksCard
              key={step.number}
              {...step}
              delay={index * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
