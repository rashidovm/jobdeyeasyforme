'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { MapPin, Building2, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { JobPosting } from '@/types';
import Button from '@/components/ui/Button';
import Reveal from '@/components/ui/Reveal';

export default function FeaturedJobs() {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('job_postings')
        .select('id, title, company, location, work_mode, salary, public_teaser, created_at, filled')
        .eq('filled', false)
        .order('created_at', { ascending: false })
        .limit(4);
      setJobs((data as JobPosting[]) || []);
      setLoading(false);
    })();
  }, []);

  if (!loading && jobs.length === 0) return null;

  return (
    <section id="jobs" className="bg-paper/60 py-20 md:py-28">
      <div className="container-tight">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl">
            <span className="eyebrow">Live roles</span>
            <h2 className="display mt-4 text-[2.4rem] md:text-[3.1rem]">Jobs we&apos;re helping people land</h2>
            <p className="mt-3 text-muted">Real openings across Nigeria. See one you like? We prepare everything — you just hit Send.</p>
          </div>
          <Button href="/jobs" variant="secondary">Browse all jobs <ArrowRight className="h-4 w-4" /></Button>
        </Reveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {jobs.map((j, i) => (
            <Reveal key={j.id} delay={i * 70}>
              <Link href={`/jobs/${j.id}`} className="group block h-full rounded-2xl border border-line bg-white p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-card">
                <h3 className="font-bold group-hover:text-green">{j.title}</h3>
                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                  <span className="flex items-center gap-1"><Building2 className="h-3 w-3" /> {j.company}</span>
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {j.location}</span>
                  {j.work_mode && <span className="rounded-full bg-cream px-2 py-0.5 capitalize">{j.work_mode}</span>}
                </p>
                <p className="mt-2 line-clamp-2 text-sm text-muted">{j.public_teaser}</p>
                {j.salary && <p className="mt-2 text-sm font-semibold text-ink">{j.salary}</p>}
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
