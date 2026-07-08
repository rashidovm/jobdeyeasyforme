'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { MapPin, Building2, Clock, ArrowRight, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { JobPosting } from '@/types';
import { prettyDate } from '@/lib/dates';
import Logo from '@/components/ui/Logo';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/cn';

function isNew(created?: string) {
  if (!created) return false;
  return Date.now() - new Date(created).getTime() < 7 * 24 * 3600 * 1000;
}
function isClosed(j: JobPosting) {
  return !!j.closed || (!!j.closes_at && new Date(j.closes_at) < new Date());
}
function isUrgent(j: JobPosting) {
  return !isClosed(j) && !!j.closes_at && new Date(j.closes_at).getTime() - Date.now() < 3 * 24 * 3600 * 1000;
}

export default function JobsBoardPage() {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [q, setQ] = useState('');
  const [mode, setMode] = useState('all');

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setAuthed(!!user);
      const { data } = await supabase
        .from('job_postings')
        .select('id, title, company, location, salary, work_mode, public_teaser, closes_at, created_at, filled, closed')
        .eq('filled', false)
        .order('created_at', { ascending: false });
      setJobs((data as JobPosting[]) || []);
      setLoading(false);
    })();
  }, []);

  const filtered = jobs.filter((j) => {
    const matchQ = `${j.title} ${j.company} ${j.location}`.toLowerCase().includes(q.toLowerCase());
    const matchMode = mode === 'all' || j.work_mode === mode;
    return matchQ && matchMode;
  });

  return (
    <div className="min-h-screen bg-cream">
      <header className="sticky top-0 z-40 border-b border-line bg-cream/85 backdrop-blur-md">
        <div className="container-tight flex h-16 items-center justify-between">
          <Logo />
          {authed
            ? <Button href="/dashboard" variant="secondary" size="sm">← Back to dashboard</Button>
            : <Button href="/signup" size="sm">Let us apply for you</Button>}
        </div>
      </header>

      <section className="container-tight py-12">
        <div className="max-w-2xl">
          <span className="eyebrow">Live roles</span>
          <h1 className="display mt-4 text-4xl md:text-5xl">{authed ? 'Browse jobs' : "Jobs we're helping people land"}</h1>
          <p className="mt-3 text-muted">
            {authed
              ? 'Fresh roles across Nigeria. Your team uses these to prepare your applications — you just hit Send.'
              : "Real roles across Nigeria. See one you like? We'll prepare your tailored CV, cover letter, and a ready-to-send email — you just hit Send."}
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-line bg-white px-3 py-2 shadow-soft">
            <Search className="h-4 w-4 text-muted" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title, company, location" className="w-full bg-transparent text-sm outline-none" />
          </div>
          <div className="flex gap-2">
            {['all', 'onsite', 'remote', 'hybrid'].map((m) => (
              <button key={m} onClick={() => setMode(m)}
                className={cn('rounded-xl border px-3 py-2 text-sm font-medium capitalize transition-colors', mode === m ? 'border-green bg-green text-white' : 'border-line bg-white text-muted hover:border-green')}>
                {m === 'all' ? 'All' : m}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {loading ? (
            <p className="text-muted">Loading jobs…</p>
          ) : filtered.length === 0 ? (
            <p className="text-muted">No jobs match your search right now.</p>
          ) : (
            filtered.map((j) => (
              <Link key={j.id} href={`/jobs/${j.id}`} className="group rounded-2xl border border-line bg-white p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-card">
                <div className="mb-1 flex items-start justify-between gap-2">
                  <h3 className="font-bold group-hover:text-green">{j.title}</h3>
                  <span className="flex shrink-0 gap-1.5">
                    {isClosed(j) && <span className="rounded-full bg-ink/10 px-2 py-0.5 text-[0.6rem] font-bold uppercase text-ink">Closed</span>}
                    {isUrgent(j) && <span className="rounded-full bg-red-600 px-2 py-0.5 text-[0.6rem] font-bold uppercase text-white">Urgent</span>}
                    {!isClosed(j) && isNew(j.created_at) && <span className="rounded-full bg-gold px-2 py-0.5 text-[0.6rem] font-bold uppercase text-white">New</span>}
                  </span>
                </div>
                <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                  <span className="flex items-center gap-1"><Building2 className="h-3 w-3" /> {j.company}</span>
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {j.location}</span>
                  {j.work_mode && <span className="rounded-full bg-cream px-2 py-0.5 capitalize">{j.work_mode}</span>}
                </p>
                <p className="mt-2 line-clamp-2 text-sm text-muted">{j.public_teaser}</p>
                {j.salary && <p className="mt-2 text-sm font-semibold text-ink">{j.salary}</p>}
                <div className="mt-3 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-green">View role <ArrowRight className="h-4 w-4" /></span>
                  <span className="text-[0.7rem] font-medium text-muted">Posted {prettyDate(j.created_at)}</span>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
