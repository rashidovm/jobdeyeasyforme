'use client';

import React, { useEffect, useState } from 'react';
import { PartyPopper } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Testimonial } from '@/types';

function firstName(name?: string | null) {
  if (!name) return 'A job seeker';
  return name.split(' ')[0];
}

/** A small rotating toast in the corner: "Gloria just got a response 🎉" */
export default function WinsToast() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('testimonials')
        .select('*')
        .eq('approved', true)
        .order('created_at', { ascending: false })
        .limit(12);
      setItems((data as Testimonial[]) || []);
    })();
  }, []);

  useEffect(() => {
    if (items.length === 0) return;
    const showFirst = setTimeout(() => setVisible(true), 4000);
    const cycle = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % items.length);
        setVisible(true);
      }, 500);
    }, 9000);
    const hideEach = setInterval(() => {}, 0); // placeholder, cleared below
    return () => { clearTimeout(showFirst); clearInterval(cycle); clearInterval(hideEach); };
  }, [items.length]);

  // Auto-hide each toast after a few seconds so it doesn't linger
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => setVisible(false), 6000);
    return () => clearTimeout(t);
  }, [visible, index]);

  if (items.length === 0) return null;
  const current = items[index];

  return (
    <div
      aria-live="polite"
      className={`fixed bottom-6 left-6 z-40 max-w-xs rounded-2xl border border-line bg-white p-4 shadow-lift transition-all duration-500 ${
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-light text-gold"><PartyPopper className="h-4.5 w-4.5" /></span>
        <div>
          <p className="text-sm font-bold text-ink">{firstName(current.seeker_name)} just got a response! 🎉</p>
          {current.job_title && <p className="mt-0.5 text-xs text-muted">{current.job_title}{current.company ? ` at ${current.company}` : ''}</p>}
        </div>
      </div>
    </div>
  );
}
