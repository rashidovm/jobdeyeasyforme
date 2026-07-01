import Nav from '@/components/landing/Nav';
import Hero from '@/components/landing/Hero';
import TrustStrip from '@/components/landing/TrustStrip';
import HowItWorks from '@/components/landing/HowItWorks';
import Pricing from '@/components/landing/Pricing';
import Promises from '@/components/landing/Promises';
import FAQ from '@/components/landing/FAQ';
import CTAAndFooter from '@/components/landing/CTAAndFooter';

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <TrustStrip />
        <HowItWorks />
        <Pricing />
        <Promises />
        <FAQ />
        <CTAAndFooter />
      </main>
    </>
  );
}
