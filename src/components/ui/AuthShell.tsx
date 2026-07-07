'use client';

import React from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
import Logo from '@/components/ui/Logo';

const POINTS = ['Tailored CV + cover letter', 'Ready-to-send email', 'A human checks every word', 'Delivered on WhatsApp'];

export default function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      {/* Editorial forest panel */}
      <aside className="grain relative hidden overflow-hidden bg-forest p-12 text-cream lg:flex lg:flex-col lg:justify-between">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-green/20 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-gold/15 blur-3xl" />
        <svg aria-hidden className="pointer-events-none absolute inset-x-10 top-28 h-24 text-gold/40" viewBox="0 0 500 80" fill="none">
          <path d="M6 70C140 70 200 12 494 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 9"
            style={{ strokeDasharray: 620, animation: 'draw 1.9s cubic-bezier(0.22,1,0.36,1) 0.3s both' }} />
        </svg>

        <div className="relative"><Logo invert /></div>

        <div className="relative">
          <p className="eyebrow text-gold">The hard part, handled</p>
          <h2 className="display mt-4 text-[2.7rem] leading-[1.02]">
            We do the hard part.<br />You just hit <span className="serif-italic text-gold-bright">Send</span>.
          </h2>
          <ul className="mt-8 space-y-3">
            {POINTS.map((p) => (
              <li key={p} className="flex items-center gap-3 text-cream/85">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold text-forest"><Check className="h-3 w-3" strokeWidth={3} /></span>
                {p}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative font-display text-lg italic text-cream/60">&ldquo;We send. You shine.&rdquo;</p>
      </aside>

      {/* Form side */}
      <section className="flex flex-col items-center justify-center bg-cream px-6 py-12">
        <div className="mb-8 lg:hidden"><Logo /></div>
        <div className="w-full max-w-md">{children}</div>
        <p className="mt-8 text-center text-xs text-muted">
          <Link href="/" className="link-muted">← Back to home</Link>
        </p>
      </section>
    </main>
  );
}
