'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Mail, Phone, MapPin, FilePlus2, ChevronRight, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAdmin } from '@/lib/adminContext';
import { Application, ClientMaterial, JobPosting, Profile, Subscription } from '@/types';
import { PLANS, STATUS_MAP } from '@/lib/constants';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import ErrorBox from '@/components/ui/ErrorBox';

export default function ClientDetailPage() {
  const { profile: me } = useAdmin();
  const isAdmin = me?.role === 'admin';
  const params = useParams();
  const clientId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState<Profile | null>(null);
  const [sub, setSub] = useState<Subscription | null>(null);
  const [materials, setMaterials] = useState<ClientMaterial | null>(null);
  const [apps, setApps] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [staff, setStaff] = useState<Profile[]>([]);

  const [jobId, setJobId] = useState('');
  const [assignTo, setAssignTo] = useState('');
  const [dueAt, setDueAt] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [{ data: c }, { data: s }, { data: m }, { data: a }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', clientId).single(),
      supabase.from('subscriptions').select('*').eq('user_id', clientId).order('started_at', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('client_materials').select('*').eq('user_id', clientId).maybeSingle(),
      supabase.from('applications').select('*, job_postings(*)').eq('user_id', clientId).order('created_at', { ascending: false }),
    ]);
    setClient(c as Profile);
    setSub(s as Subscription);
    setMaterials(m as ClientMaterial);
    setApps((a as Application[]) || []);

    if (isAdmin) {
      const [{ data: j }, { data: st }] = await Promise.all([
        supabase.from('job_postings').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*').eq('role', 'staff'),
      ]);
      setJobs((j as JobPosting[]) || []);
      setStaff((st as Profile[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => { if (me) load(); /* eslint-disable-next-line */ }, [me, clientId]);

  const createApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!jobId) { setError('Pick a job posting.'); return; }
    if (!sub) { setError('This client has no subscription record.'); return; }
    setSaving(true);
    const { error: insErr } = await supabase.from('applications').insert({
      user_id: clientId,
      subscription_id: sub.id,
      job_id: jobId,
      assigned_to: assignTo || null,
      due_at: dueAt ? new Date(dueAt).toISOString() : null,
      status: 'queued',
      why_picked: [],
    });
    setSaving(false);
    if (insErr) { setError(insErr.message); return; }
    setJobId(''); setAssignTo(''); setDueAt('');
    load();
  };

  if (loading) return <div className="text-muted">Loading…</div>;
  if (!client) return <div className="text-muted">Client not found.</div>;

  const planName = PLANS.find((p) => p.id === sub?.tier)?.name || sub?.tier || '—';
  const surveyData = materials?.survey_responses || materials?.quick_fill || null;

  return (
    <div>
      <Link href="/admin/clients" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> All clients
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: profile + materials */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-line bg-white p-6 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green text-lg font-bold text-white">
                {client.full_name?.charAt(0) || 'C'}
              </div>
              <div>
                <h1 className="text-xl font-extrabold">{client.full_name}</h1>
                <p className="text-sm text-muted">{planName} · {sub?.status || 'no plan'}</p>
              </div>
            </div>
            <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              <p className="flex items-center gap-2 text-muted"><Mail className="h-4 w-4" /> {client.email}</p>
              <p className="flex items-center gap-2 text-muted"><Phone className="h-4 w-4" /> {client.whatsapp_number || client.phone_number || '—'}</p>
              <p className="flex items-center gap-2 text-muted"><MapPin className="h-4 w-4" /> {client.city_state || '—'}</p>
              <p className="flex items-center gap-2 text-muted"><User className="h-4 w-4" /> {sub ? `${sub.applications_used}/${sub.applications_limit} applications used` : '—'}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-white p-6 shadow-soft">
            <h2 className="mb-3 font-bold">Onboarding details</h2>
            {surveyData ? (
              <dl className="space-y-2.5">
                {Object.entries(surveyData).map(([k, v]) => (
                  <div key={k} className="grid grid-cols-3 gap-3 border-b border-line pb-2.5 last:border-0">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{k.replace(/([A-Z])/g, ' $1')}</dt>
                    <dd className="col-span-2 text-sm text-ink">
                      {typeof v === 'object' ? (
                        <pre className="whitespace-pre-wrap break-words font-sans text-sm">{JSON.stringify(v, null, 2)}</pre>
                      ) : (
                        String(v || '—')
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="text-sm text-muted">No onboarding details captured.</p>
            )}
            {materials?.hidden_skills_notes && (
              <div className="mt-4 rounded-xl border-l-[3px] border-gold bg-gold-light p-3.5">
                <p className="text-xs font-bold uppercase tracking-wide text-gold">Standout notes</p>
                <p className="mt-1 text-sm">{materials.hidden_skills_notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: applications + create */}
        <div className="space-y-6">
          {isAdmin && (
            <div className="rounded-2xl border border-line bg-white p-6 shadow-soft">
              <h2 className="mb-4 flex items-center gap-2 font-bold">
                <FilePlus2 className="h-5 w-5 text-green" /> New application
              </h2>
              <ErrorBox message={error} />
              <form onSubmit={createApplication}>
                <FormField as="select" label="Job posting" value={jobId} onChange={(e) => setJobId(e.target.value)} required>
                  <option value="">Select a job…</option>
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id}>{j.title} — {j.company}</option>
                  ))}
                </FormField>
                <FormField as="select" label="Assign to staff" value={assignTo} onChange={(e) => setAssignTo(e.target.value)}>
                  <option value="">Unassigned</option>
                  {staff.map((s) => (
                    <option key={s.id} value={s.id}>{s.full_name}</option>
                  ))}
                </FormField>
                <FormField label="Deliver by" type="datetime-local" value={dueAt} onChange={(e) => setDueAt(e.target.value)} helperText="Sets the client's delivery countdown." />
                <Button type="submit" disabled={saving || jobs.length === 0} fullWidth className="mt-2">
                  {saving ? 'Creating…' : 'Create application'}
                </Button>
                {jobs.length === 0 && (
                  <p className="mt-2 text-xs text-muted">Add a job posting first under “Job postings”.</p>
                )}
              </form>
            </div>
          )}

          <div className="rounded-2xl border border-line bg-white shadow-soft">
            <div className="border-b border-line px-5 py-4">
              <h2 className="font-bold">Applications ({apps.length})</h2>
            </div>
            {apps.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-muted">None yet.</div>
            ) : (
              <ul className="divide-y divide-line">
                {apps.map((app) => {
                  const s = STATUS_MAP[app.status];
                  return (
                    <li key={app.id}>
                      <Link href={`/admin/applications/${app.id}`} className="flex items-center justify-between gap-2 px-5 py-3 hover:bg-cream">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{app.job_postings?.title || 'Application'}</p>
                          <p className="truncate text-xs text-muted">{app.job_postings?.company}</p>
                        </div>
                        <span className="shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold" style={{ backgroundColor: s.bg, color: s.color }}>
                          {s.label}
                        </span>
                        <ChevronRight className="h-4 w-4 shrink-0 text-muted" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
