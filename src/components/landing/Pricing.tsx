'use client';

import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { PLANS } from '@/lib/constants';
import { supabase } from '@/lib/supabase';
import Button from '@/components/ui/Button';
import Reveal from '@/components/ui/Reveal';
import { cn } from '@/lib/cn';

export default function Pricing() {
  const [spotsLeft, setSpotsLeft] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase
        .from('launch_slots')
        .select('filled_count, cap')
        .eq('id', 1)
        .single();
      if (active && data) setSpotsLeft(Math.max(0, data.cap - data.filled_count));
    })();
    return () => {
      active = false;
    };
  }, []);

  const showFounding = spotsLeft === null || spotsLeft > 0;

  return (
    <section id="pricing" className="bg-cream py-20 md:py-28">
      <div className="container-tight">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Pricing</span>
          <h2 className="mt-3 text-3xl md:text-4xl">Simple, honest pricing</h2>
          <p className="mt-4 text-muted">
            Pick a plan by how many jobs you want us to prepare each month. No hidden fees. Cancel anytime.
          </p>
        </Reveal>

        <div className="mt-14 grid items-stretch gap-6 md:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((plan, i) => {
            const featured = plan.id === 'starter';
            return (
              <Reveal
                key={plan.id}
                delay={i * 80}
                className={cn(
                  'relative flex h-full flex-col rounded-2xl border bg-white p-7 transition-shadow',
                  featured ? 'border-green shadow-card ring-1 ring-green/20' : 'border-line shadow-soft hover:shadow-card'
                )}
              >
                {featured && plan.founding20 && showFounding && (
                  <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-gold px-3 py-1 text-xs font-bold text-white shadow-soft">
                    <span className="h-1.5 w-1.5 animate-dot rounded-full bg-white" />
                    Founding 20
                  </span>
                )}

                <div>
                  <h3 className="text-lg font-bold">{plan.name}</h3>
                  <p className="mt-1 text-sm font-medium text-gold">{plan.bestFor}</p>
                </div>

                <div className="mt-5 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold tracking-tight">{plan.priceLabel}</span>
                  {plan.period && <span className="text-sm text-muted">{plan.period}</span>}
                </div>

                <p className="mt-3 min-h-[48px] text-sm leading-relaxed text-muted">{plan.description}</p>

                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-ink">
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-green-light">
                        <Check className="h-3 w-3 text-green" strokeWidth={3} />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>

                <div className="mt-7">
                  <Button href="/signup" variant={featured ? 'primary' : 'secondary'} fullWidth>
                    {plan.cta}
                  </Button>
                </div>
              </Reveal>
            );
          })}
        </div>

        {showFounding && (
          <Reveal className="mx-auto mt-8 max-w-xl rounded-2xl border border-gold/40 bg-gold-light px-5 py-4 text-center text-sm font-medium text-gold">
            {spotsLeft === null
              ? 'Founding 20: the first 20 Starter sign-ups lock ₦1,500/mo for life.'
              : `Only ${spotsLeft} of 20 Founding spots left — lock ₦1,500/mo for life.`}
          </Reveal>
        )}
      </div>
    </section>
  );
}
