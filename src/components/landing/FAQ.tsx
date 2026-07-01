'use client';

import React, { useState } from 'react';
import { ChevronDown, MessageCircle } from 'lucide-react';
import { FAQS } from '@/lib/constants';
import { buildWhatsappLink } from '@/lib/supabase';
import Reveal from '@/components/ui/Reveal';
import { cn } from '@/lib/cn';

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-white py-20 md:py-28">
      <div className="container-tight max-w-3xl">
        <Reveal className="text-center">
          <span className="eyebrow">FAQ</span>
          <h2 className="mt-3 text-3xl md:text-4xl">Questions, answered plainly</h2>
        </Reveal>

        <div className="mt-12 space-y-3">
          {FAQS.map((faq, i) => {
            const isOpen = open === i;
            return (
              <Reveal
                key={faq.q}
                delay={i * 40}
                className={cn(
                  'overflow-hidden rounded-2xl border transition-colors',
                  isOpen ? 'border-green/40 bg-green-light/40' : 'border-line bg-cream'
                )}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="font-semibold text-ink">{faq.q}</span>
                  <ChevronDown
                    className={cn('h-5 w-5 shrink-0 text-green transition-transform duration-300', isOpen && 'rotate-180')}
                  />
                </button>
                <div
                  className="grid transition-all duration-300 ease-out"
                  style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-[0.95rem] leading-relaxed text-muted">{faq.a}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal className="mt-10 flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-muted">Still not sure? Ask us directly — a human replies.</p>
          <a
            href={buildWhatsappLink('Hi! I have a question about JobDeyEasy.')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-whatsapp px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-transform hover:-translate-y-0.5"
          >
            <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
          </a>
        </Reveal>
      </div>
    </section>
  );
}
