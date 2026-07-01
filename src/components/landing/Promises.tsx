'use client';

import React from 'react';
import { HeartHandshake } from 'lucide-react';
import { PROMISES } from '@/lib/constants';
import Reveal from '@/components/ui/Reveal';

export default function Promises() {
  return (
    <section className="relative overflow-hidden bg-green py-20 text-white md:py-28">
      <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/5 blur-2xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-black/10 blur-2xl" />

      <div className="container-tight relative">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 text-[0.72rem] font-bold uppercase tracking-[0.2em] text-gold">
            Our promises
          </span>
          <h2 className="mt-3 text-3xl md:text-4xl">What JobDeyEasy will never do</h2>
          <p className="mt-4 text-white/80">
            Honesty is the product, not a tagline. These are the lines we hold, every time.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PROMISES.map((promise, i) => (
            <Reveal
              key={promise}
              delay={i * 70}
              className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-5 py-4 backdrop-blur-sm"
            >
              <HeartHandshake className="h-5 w-5 shrink-0 text-gold" />
              <p className="text-[0.95rem] font-medium">{promise}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
