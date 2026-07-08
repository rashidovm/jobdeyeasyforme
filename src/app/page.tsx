import Nav from '@/components/landing/Nav';
import Hero from '@/components/landing/Hero';
import TrustStrip from '@/components/landing/TrustStrip';
import HowItWorks from '@/components/landing/HowItWorks';
import FeaturedJobs from '@/components/landing/FeaturedJobs';
import LatestPosts from '@/components/landing/LatestPosts';
import Wins from '@/components/landing/Wins';
import WinsToast from '@/components/landing/WinsToast';
import Pricing from '@/components/landing/Pricing';
import Promises from '@/components/landing/Promises';
import FAQ from '@/components/landing/FAQ';
import CTAAndFooter from '@/components/landing/CTAAndFooter';

export default function Home() {
  return (
    <>
      <WinsToast />
      <Nav />
      <main>
        <Hero />
        <TrustStrip />
        <HowItWorks />
        <FeaturedJobs />
        <LatestPosts />
        <Wins />
        <Pricing />
        <Promises />
        <FAQ />
        <CTAAndFooter />
      </main>
    </>
  );
}
