'use client';

import React from 'react';
import { UserRound, Search, PenLine, Send, CheckCheck } from 'lucide-react';
import { HOW_IT_WORKS_STEPS } from '@/lib/constants';
import Reveal from '@/components/ui/Reveal';

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  UserRound,
  Search,
  PenLine,
  Send,
  CheckCheck,
};

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white py-20 md:py-28">
      <div className="container-tight">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">How it works</span>
          <h2 className="display mt-4 text-[2.4rem] md:text-[3.1rem]">Five steps between you and your next job</h2>
          <p className="mt-4 text-muted">
            You do two things: tell us about yourself, and hit Send. We handle everything in the middle.
          </p>
        </Reveal>

        <div className="relative mt-16">
          {/* connecting rail (desktop) */}
          <div aria-hidden className="absolute left-0 right-0 top-7 hidden h-px bg-line lg:block" />

          <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
            {HOW_IT_WORKS_STEPS.map((step, i) => {
              const Icon = ICONS[step.icon] ?? UserRound;
              return (
                <Reveal as="li" key={step.num} delay={i * 90} className="relative flex flex-col items-start">
                  <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-green text-white shadow-card">
                    <Icon className="h-6 w-6" />
                    <span className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-gold text-[0.7rem] font-extrabold text-white">
                      {step.num}
                    </span>
                  </div>
                  <h3 className="mt-5 text-base font-bold">{step.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{step.desc}</p>
                </Reveal>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
