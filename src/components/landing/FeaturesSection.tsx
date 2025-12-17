'use client';

import { motion } from 'framer-motion';
import { Mic, Users, TrendingUp, Zap, Calendar, MapPin } from 'lucide-react';

const features = [
  {
    icon: Mic,
    title: 'Voice or text',
    description: 'Say it or type it. Slate understands natural language—no menus, no filters.',
  },
  {
    icon: Calendar,
    title: 'Real-time availability',
    description: 'We check actual reservation availability across restaurants as you plan.',
  },
  {
    icon: MapPin,
    title: 'Full evening planning',
    description: 'Dinner, drinks, dessert—all coordinated with walking times between spots.',
  },
  {
    icon: Users,
    title: 'Group coordination',
    description: 'Planning with friends? Everyone adds constraints, we find what works for all.',
  },
  {
    icon: TrendingUp,
    title: 'Trend detection',
    description: 'Know about rising spots before they blow up. Book early, skip the wait.',
  },
  {
    icon: Zap,
    title: 'Autonomy mode',
    description: 'Set your preferences once. Wake up to planned and booked evenings.',
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 bg-charcoal">
      <div className="max-w-container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-slate-white mb-4">
            Everything you need
          </h2>
          <p className="text-warm-gray text-lg max-w-xl mx-auto">
            One place to plan any evening, any way you want.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-6 bg-slate-black rounded-xl border border-light-gray/10 hover:border-slate-red/30 transition-colors"
            >
              <div className="w-12 h-12 rounded-lg bg-slate-red/10 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-slate-red" />
              </div>
              <h3 className="font-display text-lg font-semibold text-slate-white mb-2">
                {feature.title}
              </h3>
              <p className="text-warm-gray text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
