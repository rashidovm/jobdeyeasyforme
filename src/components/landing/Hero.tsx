'use client';

import React from 'react';
import { FileText, Mail, Send, Sparkles, Check } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* soft ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 right-[-10%] h-[420px] w-[420px] rounded-full bg-green/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 left-[-10%] h-[360px] w-[360px] rounded-full bg-gold/10 blur-3xl"
      />

      <div className="container-tight grid items-center gap-14 py-16 md:grid-cols-12 md:py-24">
        {/* Copy */}
        <div className="md:col-span-6 lg:col-span-6">
          <div className="animate-fadeup">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold-light px-3.5 py-1.5 text-xs font-bold text-gold">
              <Sparkles className="h-3.5 w-3.5" />
              Founding 20 — lock ₦1,500/mo for life
            </span>
          </div>

          <h1 className="mt-6 animate-fadeup text-[2.4rem] font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-[3.4rem]" style={{ animationDelay: '60ms' }}>
            We do the hard part.
            <br />
            You just hit{' '}
            <span className="relative whitespace-nowrap text-green">
              Send
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 120 12" fill="none" preserveAspectRatio="none" aria-hidden>
                <path d="M2 9C28 3 92 3 118 9" stroke="#D4881E" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </span>
            .
          </h1>

          <p className="mt-7 max-w-lg animate-fadeup text-lg leading-relaxed text-muted" style={{ animationDelay: '120ms' }}>
            JobDeyEasy finds jobs that fit you and prepares everything: a tailored CV, a
            matching cover letter, and a ready-to-send email. All you do is attach and send.
          </p>

          <div className="mt-7 flex animate-fadeup flex-wrap gap-2.5" style={{ animationDelay: '180ms' }}>
            {[
              { icon: FileText, label: 'Tailored CV' },
              { icon: Mail, label: 'Cover letter' },
              { icon: Send, label: 'Send-ready email' },
            ].map(({ icon: Icon, label }) => (
              <span key={label} className="inline-flex items-center gap-2 rounded-full bg-green-light px-3.5 py-1.5 text-sm font-semibold text-green">
                <Icon className="h-4 w-4" />
                {label}
              </span>
            ))}
          </div>

          <div className="mt-9 flex animate-fadeup flex-wrap items-center gap-3" style={{ animationDelay: '240ms' }}>
            <Button href="/signup" size="lg">
              Start free trial <Send className="h-4 w-4" />
            </Button>
            <Button href="#how-it-works" variant="secondary" size="lg">
              See how it works
            </Button>
          </div>

          <div className="mt-8 flex animate-fadeup flex-wrap gap-x-6 gap-y-2 text-sm text-muted" style={{ animationDelay: '300ms' }}>
            {['AI-drafted, human-checked', 'No CV? We build one', 'Delivered on WhatsApp'].map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5">
                <Check className="h-4 w-4 text-green" /> {t}
              </span>
            ))}
          </div>
        </div>

        {/* Signature: the delivery moment */}
        <div className="md:col-span-6 lg:col-span-6">
          <DeliveryVisual />
        </div>
      </div>
    </section>
  );
}

function DeliveryVisual() {
  return (
    <div className="relative mx-auto max-w-[420px] animate-fadeup" style={{ animationDelay: '200ms' }}>
      {/* gold dotted flight path */}
      <svg aria-hidden className="absolute -left-6 -top-6 h-24 w-40 text-gold/50" viewBox="0 0 160 96" fill="none">
        <path d="M4 92C40 92 60 8 156 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="2 10" />
      </svg>

      {/* back stack of documents */}
      <div className="absolute -right-3 top-6 hidden w-56 rotate-6 rounded-2xl border border-line bg-white p-4 shadow-card sm:block">
        <div className="mb-2 flex items-center gap-2 text-xs font-bold text-muted">
          <Mail className="h-3.5 w-3.5 text-green" /> Cover letter
        </div>
        <div className="space-y-1.5">
          {[100, 92, 80, 96, 70].map((w, i) => (
            <div key={i} className="h-1.5 rounded-full bg-line" style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>

      {/* chat card */}
      <div className="relative z-10 animate-floaty rounded-3xl border border-line bg-white p-4 shadow-lift">
        <div className="flex items-center gap-3 border-b border-line pb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green font-extrabold text-white">J</div>
          <div className="leading-tight">
            <div className="text-sm font-bold">JobDeyEasy</div>
            <div className="flex items-center gap-1.5 text-xs text-green">
              <span className="h-1.5 w-1.5 rounded-full bg-green" /> online
            </div>
          </div>
        </div>

        <div className="space-y-2.5 pt-3">
          <Bubble>Hi! I need help applying. I don&apos;t have a CV 😭</Bubble>
          <Bubble me>No wahala. We&apos;ll build your CV, cover letter and send-ready email from scratch 👇</Bubble>

          {/* attachment: the tailored CV */}
          <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-green-light p-3">
            <div className="flex items-center gap-2.5 rounded-xl bg-white p-2.5 shadow-soft">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green/10 text-green">
                <FileText className="h-4 w-4" />
              </div>
              <div className="min-w-0 leading-tight">
                <div className="truncate text-xs font-bold text-ink">Adaeze_CV_Frontend.pdf</div>
                <div className="text-[0.68rem] text-muted">Tailored · ready to send</div>
              </div>
            </div>
            <button className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-full bg-green py-2 text-sm font-semibold text-white shadow-soft">
              <Send className="h-4 w-4" /> Send application
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Bubble({ children, me }: { children: React.ReactNode; me?: boolean }) {
  return (
    <div
      className={
        me
          ? 'ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-green-light px-3.5 py-2 text-sm text-green-dark'
          : 'mr-auto max-w-[85%] rounded-2xl rounded-bl-md bg-paper px-3.5 py-2 text-sm text-ink'
      }
    >
      {children}
    </div>
  );
}
