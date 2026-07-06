import React from 'react';
import { Send, MessageCircle, ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import Logo from '@/components/ui/Logo';
import Reveal from '@/components/ui/Reveal';
import { buildWhatsappLink } from '@/lib/supabase';

export default function CTAAndFooter() {
  return (
    <>
      <section className="bg-cream px-6 py-20 md:py-28">
        <Reveal className="grain relative mx-auto max-w-[1160px] overflow-hidden rounded-[34px] bg-forest px-6 py-16 text-center text-cream shadow-lift md:px-16 md:py-20">
          <div aria-hidden className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-green/20 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-gold/15 blur-3xl" />
          {/* flight path motif */}
          <svg aria-hidden className="pointer-events-none absolute inset-x-0 top-8 mx-auto hidden h-16 w-[70%] text-gold/40 md:block" viewBox="0 0 600 60" fill="none">
            <path d="M8 52C160 52 220 8 592 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 9" />
          </svg>

          <div className="relative">
            <span className="eyebrow justify-center text-gold">Your move</span>
            <h2 className="display mx-auto mt-5 max-w-2xl text-[2.5rem] leading-[1.02] md:text-[3.3rem]">
              Ready to let us do the <span className="font-display italic font-medium text-gold-bright">hard part</span>?
            </h2>
            <p className="mx-auto mt-5 max-w-md text-cream/70">
              Start with one free application. No card required — see the work before you pay a naira.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Button href="/signup" variant="gold" size="lg">Start free trial <ArrowRight className="h-4 w-4" /></Button>
              <Button href={buildWhatsappLink('Hi! I want to start my free trial.')} variant="whatsapp" size="lg"><MessageCircle className="h-4 w-4" /> Chat on WhatsApp</Button>
            </div>
          </div>
        </Reveal>
      </section>

      <footer className="grain relative overflow-hidden bg-forest-700 text-cream">
        <div className="container-tight flex flex-col justify-between gap-10 py-16 md:flex-row">
          <div className="max-w-xs">
            <Logo invert />
            <p className="mt-4 font-display text-lg italic text-cream/70">We send. You shine.</p>
            <a href={buildWhatsappLink('Hi JobDeyEasy!')} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-whatsapp hover:brightness-110">
              <MessageCircle className="h-4 w-4" /> Message us on WhatsApp
            </a>
          </div>

          <div className="flex gap-14">
            <div>
              <h4 className="mb-4 text-[0.7rem] font-bold uppercase tracking-[0.2em] text-cream/50">Company</h4>
              <ul className="space-y-2.5 text-sm">
                <li><a href="#how-it-works" className="text-cream/70 transition-colors hover:text-cream">How it works</a></li>
                <li><a href="/jobs" className="text-cream/70 transition-colors hover:text-cream">Jobs</a></li>
                <li><a href="#pricing" className="text-cream/70 transition-colors hover:text-cream">Pricing</a></li>
                <li><a href="#faq" className="text-cream/70 transition-colors hover:text-cream">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-[0.7rem] font-bold uppercase tracking-[0.2em] text-cream/50">Legal</h4>
              <ul className="space-y-2.5 text-sm">
                <li><a href="/privacy" className="text-cream/70 transition-colors hover:text-cream">Privacy Policy</a></li>
                <li><a href="/terms" className="text-cream/70 transition-colors hover:text-cream">Terms of Service</a></li>
                <li><a href="/login" className="text-cream/70 transition-colors hover:text-cream">Log in</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-cream/10">
          <div className="container-tight py-6 text-center text-xs text-cream/40">© {new Date().getFullYear()} JobDeyEasy. All rights reserved.</div>
        </div>
      </footer>
    </>
  );
}
