'use client';

import React from 'react';
import { ShieldCheck, Clock, MessageCircle, PenLine } from 'lucide-react';
import Reveal from '@/components/ui/Reveal';

const POINTS = [
  { icon: PenLine, title: 'AI-drafted, human-checked', sub: 'A real person refines every word' },
  { icon: Clock, title: 'Delivered in 24–48 hrs', sub: 'Priority review on higher tiers' },
  { icon: MessageCircle, title: 'Straight to WhatsApp', sub: 'No app to download, ever' },
  { icon: ShieldCheck, title: 'You always approve first', sub: 'Nothing goes out without you' },
];

export default function TrustStrip() {
  return (
    <section className="border-y border-line bg-paper/60">
      <div className="container-tight grid gap-x-8 gap-y-6 py-8 sm:grid-cols-2 lg:grid-cols-4">
        {POINTS.map((p, i) => (
          <Reveal key={p.title} delay={i * 70} className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-green shadow-soft">
              <p.icon className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-bold text-ink">{p.title}</div>
              <div className="text-xs text-muted">{p.sub}</div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
