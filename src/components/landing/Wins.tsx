'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Testimonial } from '@/types';
import Reveal from '@/components/ui/Reveal';

function firstName(name?: string | null) {
  if (!name) return 'A job seeker';
  return name.split(' ')[0];
}

export default function Wins() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('testimonials')
        .select('*')
        .eq('approved', true)
        .order('created_at', { ascending: false })
        .limit(9);
      setItems((data as Testimonial[]) || []);
      setLoading(false);
    })();
  }, []);

  if (!loading && items.length === 0) return null;

  return (
    <section className="bg-paper/60 py-20 md:py-28">
      <div className="container-tight">
        <Reveal className="mx-auto max-w-xl text-center">
          <span className="eyebrow justify-center">Real wins</span>
          <h2 className="display mt-4 text-[2.4rem] md:text-[3.1rem]">People are getting responses</h2>
          <p className="mt-3 text-muted">Real seekers, real employers getting back to them — this is what &ldquo;we do the hard part&rdquo; looks like in practice.</p>
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {items.slice(0, 6).map((t, i) => (
            <Reveal key={t.id} delay={i * 70}>
              <div className="h-full rounded-2xl border border-line bg-white p-6 shadow-soft">
                <Sparkles className="h-5 w-5 text-gold" />
                <p className="mt-3 text-[0.95rem] leading-relaxed text-ink">{t.message}</p>
                <p className="mt-4 text-sm font-bold text-green">{firstName(t.seeker_name)}{t.job_title ? ` · ${t.job_title}` : ''}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
