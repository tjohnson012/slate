'use client';

import {
  Navigation,
  HeroSection,
  HowItWorksSection,
  FeaturesSection,
  Footer,
} from '@/components/landing';

export default function Home() {
  return (
    <>
      <Navigation />
      <main id="main-content" className="scroll-smooth">
        <HeroSection />
        <HowItWorksSection />
        <FeaturesSection />
      </main>
      <Footer />
    </>
  );
}
