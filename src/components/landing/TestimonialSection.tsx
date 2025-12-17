'use client';

import { motion } from 'framer-motion';

export function TestimonialSection() {
  return (
    <section className="py-24 bg-charcoal relative overflow-hidden">
      {/* Large quotation mark watermark */}
      <div className="absolute top-8 left-8 font-display text-[200px] leading-none text-slate-white/[0.03] select-none">
        &ldquo;
      </div>

      <div className="max-w-container mx-auto px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <blockquote className="font-display text-2xl md:text-3xl text-slate-white italic leading-relaxed mb-8">
            &ldquo;I used to spend 30 minutes every Friday trying to plan date night.
            Now I just text Slate and it&apos;s done. Last week it found us a hidden
            omakase spot I never would have discovered.&rdquo;
          </blockquote>

          <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-full bg-light-gray/20" />
            <div className="text-left">
              <p className="font-medium text-slate-white">Sarah K.</p>
              <p className="text-sm text-warm-gray">New York, NY</p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {[
            { value: '2,400+', label: 'Evenings planned' },
            { value: '98%', label: 'Booking success rate' },
            { value: '< 60s', label: 'Avg. time to book' },
            { value: '4.9', label: 'User rating' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="text-center"
            >
              <p className="font-display text-3xl md:text-4xl font-bold text-slate-red mb-2">
                {stat.value}
              </p>
              <p className="text-sm text-warm-gray">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
