'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { MapPin, Building2, Clock, ArrowLeft, MessageCircle, Send } from 'lucide-react';
import { supabase, buildWhatsappLink } from '@/lib/supabase';
import { JobPosting } from '@/types';
import Logo from '@/components/ui/Logo';
import Button from '@/components/ui/Button';

export default function JobDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [job, setJob] = useState<JobPosting | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('job_postings')
        .select('id, title, company, location, salary, work_mode, public_teaser, closes_at, filled')
        .eq('id', id).maybeSingle();
      setJob(data as JobPosting);
      setLoading(false);
    })();
  }, [id]);

  return (
    <div className="min-h-screen bg-cream">
      <header className="sticky top-0 z-40 border-b border-line bg-cream/85 backdrop-blur-md">
        <div className="container-tight flex h-16 items-center justify-between">
          <Logo />
          <Button href="/jobs" variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /> All jobs</Button>
        </div>
      </header>

      <section className="container-tight max-w-2xl py-12">
        {loading ? (
          <p className="text-muted">Loading…</p>
        ) : !job ? (
          <p className="text-muted">This job could not be found. <Link href="/jobs" className="font-semibold text-green">Browse all jobs</Link>.</p>
        ) : (
          <>
            <h1 className="text-3xl font-extrabold">{job.title}</h1>
            <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
              <span className="flex items-center gap-1"><Building2 className="h-4 w-4" /> {job.company}</span>
              <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {job.location}</span>
              {job.work_mode && <span className="rounded-full bg-white px-2.5 py-0.5 capitalize shadow-soft">{job.work_mode}</span>}
              {job.closes_at && <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> closes {new Date(job.closes_at).toLocaleDateString()}</span>}
            </p>
            {job.salary && <p className="mt-3 text-lg font-bold text-green">{job.salary}</p>}

            <div className="mt-6 rounded-2xl border border-line bg-white p-6 shadow-soft">
              <p className="whitespace-pre-wrap text-[0.97rem] leading-relaxed text-ink">{job.public_teaser}</p>
            </div>

            <div className="mt-8 rounded-2xl border border-green/30 bg-green-light p-6 text-center">
              <h2 className="text-xl font-extrabold">Want this job? Let us do the hard part.</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-green-dark">We&apos;ll tailor your CV and cover letter to this exact role and hand you a ready-to-send email. You just hit Send.</p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <Button href="/signup"><Send className="h-4 w-4" /> Start free trial</Button>
                <Button href={buildWhatsappLink(`Hi! I'm interested in the ${job.title} role at ${job.company}. Can you help me apply?`)} variant="whatsapp"><MessageCircle className="h-4 w-4" /> Ask on WhatsApp</Button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
