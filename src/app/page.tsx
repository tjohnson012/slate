'use client';

import {
  Navigation,
  HeroSection,
  HowItWorksSection,
  TestimonialSection,
  Footer,
} from '@/components/landing';

export default function Home() {
  return (
    <>
      <Navigation />
      <main id="main-content" className="scroll-smooth">
        <HeroSection />
        <HowItWorksSection />
        <TestimonialSection />
      </main>
      <Footer />
    </>
  );
}
