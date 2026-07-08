'use client';

import React from 'react';
import { FileText, Mail, Send, Check, ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* ambient warmth */}
      <div aria-hidden className="pointer-events-none absolute -top-40 right-[-12%] h-[520px] w-[520px] rounded-full bg-green/[0.07] blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute top-40 left-[-14%] h-[420px] w-[420px] rounded-full bg-gold/[0.09] blur-3xl" />

      {/* Signature: the flight path that draws itself across the hero */}
      <svg aria-hidden className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block" viewBox="0 0 1160 760" fill="none" preserveAspectRatio="xMidYMid meet">
        <path
          d="M120 250 C 360 140, 560 470, 760 380 S 1010 210, 1080 300"
          stroke="#C08329" strokeOpacity="0.55" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 9"
          style={{ strokeDasharray: 620, animation: 'draw 1.9s cubic-bezier(0.22,1,0.36,1) 0.3s both' }}
        />
        <g style={{ offsetPath: "path('M120 250 C 360 140, 560 470, 760 380 S 1010 210, 1080 300')", animation: 'fly 2.1s cubic-bezier(0.5,0,0.2,1) 0.6s both' }}>
          <path d="M20 0L-14 8l9-8-9-8z" fill="#C08329" transform="rotate(0)" />
        </g>
      </svg>

      <div className="container-tight relative grid items-center gap-14 py-16 md:grid-cols-12 md:py-24">
        {/* Copy */}
        <div className="md:col-span-6">
          <span className="inline-flex animate-fadeup items-center gap-2 rounded-full border border-gold/30 bg-gold-light px-3.5 py-1.5 text-xs font-bold text-gold">
            <span className="h-1.5 w-1.5 animate-dot rounded-full bg-gold" />
            Founding 20 — lock ₦1,500/mo for life
          </span>

          <h1 className="mt-7 text-[2.7rem] leading-[0.98] sm:text-[3.4rem] lg:text-[4.1rem]">
            <span className="block overflow-hidden pb-[0.14em] -mb-[0.14em]"><span className="display block animate-rise">We do the</span></span>
            <span className="block overflow-hidden pb-[0.14em] -mb-[0.14em]"><span className="display block animate-rise" style={{ animationDelay: '90ms' }}>hard part.</span></span>
            <span className="block overflow-hidden pb-[0.14em] -mb-[0.14em]">
              <span className="display block animate-rise" style={{ animationDelay: '180ms' }}>
                You just hit <span className="font-display italic font-medium text-green">Send</span>.
              </span>
            </span>
          </h1>

          <p className="mt-7 max-w-lg animate-fadeup text-lg leading-relaxed text-muted" style={{ animationDelay: '320ms' }}>
            We find jobs that fit you and prepare everything — a tailored CV, a matching cover letter, and a
            ready-to-send email. All you do is attach and send.
          </p>

          <div className="mt-7 flex animate-fadeup flex-wrap gap-2.5" style={{ animationDelay: '380ms' }}>
            {[{ icon: FileText, label: 'Tailored CV' }, { icon: Mail, label: 'Cover letter' }, { icon: Send, label: 'Send-ready email' }].map(({ icon: Icon, label }) => (
              <span key={label} className="inline-flex items-center gap-2 rounded-full border border-line bg-white/70 px-3.5 py-1.5 text-sm font-semibold text-ink shadow-soft backdrop-blur">
                <Icon className="h-4 w-4 text-green" /> {label}
              </span>
            ))}
          </div>

          <div className="mt-9 flex animate-fadeup flex-wrap items-center gap-3" style={{ animationDelay: '440ms' }}>
            <Button href="/signup" size="lg">Start free trial <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" /></Button>
            <Button href="#how-it-works" variant="secondary" size="lg">See how it works</Button>
          </div>

          <div className="mt-8 flex animate-fadeup flex-wrap gap-x-6 gap-y-2 text-sm text-muted" style={{ animationDelay: '500ms' }}>
            {['AI-drafted, human-checked', 'No CV? We build one', 'Delivered on WhatsApp'].map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-green" /> {t}</span>
            ))}
          </div>
        </div>

        {/* Signature visual: the delivery moment */}
        <div className="md:col-span-6">
          <DeliveryVisual />
        </div>
      </div>
    </section>
  );
}

function DeliveryVisual() {
  return (
    <div className="relative mx-auto max-w-[430px] animate-fadeup" style={{ animationDelay: '260ms' }}>
      {/* back document */}
      <div className="absolute -right-4 top-8 hidden w-56 rotate-6 rounded-2xl border border-line bg-white p-4 shadow-card sm:block">
        <div className="mb-2 flex items-center gap-2 text-xs font-bold text-muted"><Mail className="h-3.5 w-3.5 text-green" /> Cover letter</div>
        <div className="space-y-1.5">{[100, 92, 80, 96, 70].map((w, i) => <div key={i} className="h-1.5 rounded-full bg-line" style={{ width: `${w}%` }} />)}</div>
      </div>

      {/* chat card */}
      <div className="relative z-10 animate-floaty rounded-[26px] border border-line bg-white p-4 shadow-lift">
        <div className="flex items-center gap-3 border-b border-line pb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-forest font-display text-lg font-black text-cream">J</div>
          <div className="leading-tight">
            <div className="text-sm font-bold">JobDeyEasy</div>
            <div className="flex items-center gap-1.5 text-xs text-green"><span className="h-1.5 w-1.5 rounded-full bg-green" /> online</div>
          </div>
        </div>

        <div className="space-y-2.5 pt-3">
          <Bubble>Hi! I need help applying. I don&apos;t have a CV 😭</Bubble>
          <Bubble me>No wahala. We&apos;ll build your CV, cover letter and send-ready email from scratch 👇</Bubble>

          <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-green-light p-3">
            <div className="flex items-center gap-2.5 rounded-xl bg-white p-2.5 shadow-soft">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green/10 text-green"><FileText className="h-4 w-4" /></div>
              <div className="min-w-0 leading-tight">
                <div className="truncate text-xs font-bold text-ink">Adaeze_CV_Frontend.pdf</div>
                <div className="text-[0.68rem] text-muted">Tailored · ready to send</div>
              </div>
            </div>
            <button className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-full bg-green py-2 text-sm font-semibold text-white shadow-soft"><Send className="h-4 w-4" /> Send application</button>
          </div>
        </div>
      </div>

      {/* delivered chip */}
      <div className="absolute -bottom-5 -left-4 z-20 flex animate-pop items-center gap-2 rounded-full border border-line bg-white px-4 py-2 shadow-card" style={{ animationDelay: '900ms' }}>
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green text-white"><Check className="h-3 w-3" strokeWidth={3} /></span>
        <span className="text-sm font-bold">Sent · in 48 hrs</span>
      </div>
    </div>
  );
}

function Bubble({ children, me }: { children: React.ReactNode; me?: boolean }) {
  return (
    <div className={me
      ? 'ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-green-light px-3.5 py-2 text-sm text-green-dark'
      : 'mr-auto max-w-[85%] rounded-2xl rounded-bl-md bg-paper px-3.5 py-2 text-sm text-ink'}>
      {children}
    </div>
  );
}
