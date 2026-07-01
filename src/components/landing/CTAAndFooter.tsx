import React from 'react';
import { Send, MessageCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Logo from '@/components/ui/Logo';
import Reveal from '@/components/ui/Reveal';
import { buildWhatsappLink } from '@/lib/supabase';

export default function CTAAndFooter() {
  return (
    <>
      <section className="bg-cream py-20 md:py-28">
        <div className="container-tight">
          <Reveal className="relative overflow-hidden rounded-3xl border border-line bg-white px-6 py-14 text-center shadow-card md:px-16">
            <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-green/10 blur-2xl" />
            <div aria-hidden className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-gold/10 blur-2xl" />
            <div className="relative">
              <h2 className="mx-auto max-w-xl text-3xl md:text-4xl">Ready to let us do the hard part?</h2>
              <p className="mx-auto mt-4 max-w-md text-muted">
                Start with one free application. No card required — see the work before you pay a naira.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button href="/signup" size="lg">
                  Start free trial <Send className="h-4 w-4" />
                </Button>
                <Button href={buildWhatsappLink('Hi! I want to start my free trial.')} variant="whatsapp" size="lg">
                  <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <footer className="bg-ink text-white">
        <div className="container-tight flex flex-col justify-between gap-10 py-14 md:flex-row">
          <div className="max-w-xs">
            <Logo invert />
            <p className="mt-4 text-sm italic text-white/60">We send. You shine.</p>
            <a
              href={buildWhatsappLink('Hi JobDeyEasy!')}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-whatsapp hover:brightness-110"
            >
              <MessageCircle className="h-4 w-4" /> Message us on WhatsApp
            </a>
          </div>

          <div className="flex gap-14">
            <div>
              <h4 className="mb-4 text-sm font-bold text-white/90">Company</h4>
              <ul className="space-y-2.5 text-sm">
                <li><a href="#how-it-works" className="text-white/60 transition-colors hover:text-white">How it works</a></li>
                <li><a href="#pricing" className="text-white/60 transition-colors hover:text-white">Pricing</a></li>
                <li><a href="#faq" className="text-white/60 transition-colors hover:text-white">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-bold text-white/90">Legal</h4>
              <ul className="space-y-2.5 text-sm">
                <li><a href="/privacy" className="text-white/60 transition-colors hover:text-white">Privacy Policy</a></li>
                <li><a href="/terms" className="text-white/60 transition-colors hover:text-white">Terms of Service</a></li>
                <li><a href="/login" className="text-white/60 transition-colors hover:text-white">Log in</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="container-tight py-6 text-center text-xs text-white/40">
            © {new Date().getFullYear()} JobDeyEasy. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  );
}
