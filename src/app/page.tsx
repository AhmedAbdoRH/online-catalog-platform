import LandingHeader from '@/components/landing/LandingHeader';
import HeroSection from '@/components/landing/HeroSection';
import ValueProps from '@/components/landing/ValueProps';
import Features from '@/components/landing/Features';
import Pricing from '@/components/landing/Pricing';
import CTASection from '@/components/landing/CTASection';
import LandingFooter from '@/components/landing/LandingFooter';
import StickyCTA from '@/components/landing/StickyCTA';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden landing-shell">
      <LandingHeader />
      <main>
        <HeroSection />
        <ValueProps />
        <Features />
        <Pricing />
        <CTASection />
      </main>
      <LandingFooter />
      <StickyCTA />
    </div>
  );
}
