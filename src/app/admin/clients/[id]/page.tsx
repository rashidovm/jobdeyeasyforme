'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft, Mail, Phone, MapPin, FilePlus2, ChevronRight, User, Sparkles, Send,
  FileDown, Settings2, Clock, FileText, MessageSquare,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAdmin } from '@/lib/adminContext';
import { Application, ClientMaterial, CvDeliverable, JobPosting, Profile, Subscription, CvReviewStatus, Message } from '@/types';
import { PLANS, STATUS_MAP, APPLICATION_LIMITS } from '@/lib/constants';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import ErrorBox from '@/components/ui/ErrorBox';
import { cn } from '@/lib/cn';

export default function ClientDetailPage() {
  const { profile: me } = useAdmin();
  const isAdmin = me?.role === 'admin';
  const params = useParams();
  const clientId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState<Profile | null>(null);
  const [sub, setSub] = useState<Subscription | null>(null);
  const [materials, setMaterials] = useState<ClientMaterial | null>(null);
  const [deliverable, setDeliverable] = useState<CvDeliverable | null>(null);
  const [apps, setApps] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [staff, setStaff] = useState<Profile[]>([]);

  // create application form
  const [jobId, setJobId] = useState('');
  const [assignTo, setAssignTo] = useState('');
  const [dueAt, setDueAt] = useState('');

  // cv deliverable form
  const [cv, setCv] = useState({ final_cv_url: '', final_cover_letter_url: '', final_email: '', final_job_link: '', status: 'drafting' as CvReviewStatus });

  // manage plan form
  const [plan, setPlan] = useState({ tier: 'free_trial', status: 'pending', used: 0, limit: 1 });

  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [msgText, setMsgText] = useState('');

  const load = async () => {
    const [{ data: c }, { data: s }, { data: m }, { data: dv }, { data: a }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', clientId).single(),
      supabase.from('subscriptions').select('*').eq('user_id', clientId).order('started_at', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('client_materials').select('*').eq('user_id', clientId).maybeSingle(),
      supabase.from('cv_deliverables').select('*').eq('user_id', clientId).maybeSingle(),
      supabase.from('applications').select('*, job_postings(*)').eq('user_id', clientId).order('created_at', { ascending: false }),
    ]);
    setClient(c as Profile);
    setSub(s as Subscription);
    setMaterials(m as ClientMaterial);
    setDeliverable(dv as CvDeliverable);
    setApps((a as Application[]) || []);

    if (m) setCv((prev) => ({ ...prev, status: (m as ClientMaterial).cv_review_status || 'drafting' }));
    if (dv) {
      const x = dv as CvDeliverable;
      setCv({
        final_cv_url: x.final_cv_url || '', final_cover_letter_url: x.final_cover_letter_url || '',
        final_email: x.final_email || '', final_job_link: x.final_job_link || '',
        status: (m as ClientMaterial)?.cv_review_status || 'drafting',
      });
    }
    if (s) {
      const x = s as Subscription;
      setPlan({ tier: x.tier, status: x.status, used: x.applications_used, limit: x.applications_limit });
    }

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

  const loadMessages = async () => {
    const { data: msgs } = await supabase
      .from('messages').select('*').eq('thread_user_id', clientId).order('created_at', { ascending: true });
    setMessages((msgs as Message[]) || []);
  };

  const sendMessage = async () => {
    const body = msgText.trim();
    if (!body || !me) return;
    const { error: e } = await supabase.from('messages').insert({
      thread_user_id: clientId, sender_id: me.id, sender_role: me.role, body,
    });
    if (!e) { setMsgText(''); loadMessages(); }
    else setError(e.message);
  };

  useEffect(() => { if (me) { load(); loadMessages(); } /* eslint-disable-next-line */ }, [me, clientId]);

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 2500); };

  const generateAi = async () => {
    setError(''); setBusy(true);
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch('/api/ai/draft-cv', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token || ''}` },
      body: JSON.stringify({ targetUserId: clientId }),
    });
    const json = await res.json();
    setBusy(false);
    if (!res.ok) { setError(json.error || 'AI draft failed.'); return; }
    flash('AI draft generated.');
    load();
  };

  const saveCv = async (deliver = false) => {
    setError(''); setBusy(true);
    const { error: e1 } = await supabase.from('cv_deliverables').upsert(
      {
        user_id: clientId,
        final_cv_url: cv.final_cv_url || null,
        final_cover_letter_url: cv.final_cover_letter_url || null,
        final_email: cv.final_email || null,
        final_job_link: cv.final_job_link || null,
        delivered: deliver ? true : (deliverable?.delivered || false),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );
    if (e1) { setBusy(false); setError(e1.message); return; }
    const newStatus: CvReviewStatus = deliver ? 'delivered' : cv.status;
    await supabase.from('client_materials').update({ cv_review_status: newStatus }).eq('user_id', clientId);
    setBusy(false);
    flash(deliver ? 'Delivered to the job seeker.' : 'Saved.');
    load();
  };

  const openUploaded = async () => {
    if (!materials?.uploaded_cv_url) return;
    const { data } = await supabase.storage.from('cvs').createSignedUrl(materials.uploaded_cv_url, 3600);
    if (data?.signedUrl) window.open(data.signedUrl, '_blank');
  };

  const createApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!jobId) { setError('Pick a job posting.'); return; }
    if (!sub) { setError('This job seeker has no subscription record.'); return; }
    setBusy(true);
    const { error: insErr } = await supabase.from('applications').insert({
      user_id: clientId, subscription_id: sub.id, job_id: jobId,
      assigned_to: assignTo || null, due_at: dueAt ? new Date(dueAt).toISOString() : null,
      status: 'queued', why_picked: [],
    });
    setBusy(false);
    if (insErr) { setError(insErr.message); return; }
    setJobId(''); setAssignTo(''); setDueAt('');
    flash('Application created.');
    load();
  };

  const savePlan = async () => {
    if (!sub) return;
    setBusy(true);
    const { error: e } = await supabase.from('subscriptions').update({
      tier: plan.tier, status: plan.status, applications_used: plan.used, applications_limit: plan.limit,
    }).eq('id', sub.id);
    setBusy(false);
    if (e) { setError(e.message); return; }
    flash('Plan updated.');
    load();
  };

  const resetCycle = async () => {
    if (!sub) return;
    setBusy(true);
    const lim = APPLICATION_LIMITS[plan.tier] ?? 1;
    const { error: e } = await supabase.from('subscriptions').update({
      applications_used: 0, applications_limit: lim,
      renews_at: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
    }).eq('id', sub.id);
    setBusy(false);
    if (e) { setError(e.message); return; }
    flash('30-day cycle reset.');
    load();
  };

  if (loading) return <div className="text-muted">Loading…</div>;
  if (!client) return <div className="text-muted">Job seeker not found.</div>;

  const planName = PLANS.find((p) => p.id === sub?.tier)?.name || sub?.tier || '—';
  const surveyData = materials?.survey_responses || materials?.quick_fill || null;
  const cvStatus = materials?.cv_review_status || 'drafting';

  return (
    <div>
      <Link href="/admin/clients" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> All job seekers
      </Link>

      {msg && <div className="mb-4 rounded-xl border border-green/30 bg-green-light px-4 py-2.5 text-sm font-medium text-green">{msg}</div>}
      <ErrorBox message={error} />

      {/* Header */}
      <div className="mb-6 rounded-2xl border border-line bg-white p-6 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green text-lg font-bold text-white">
              {client.full_name?.charAt(0) || 'C'}
            </div>
            <div>
              <h1 className="text-xl font-extrabold">{client.full_name}</h1>
              <p className="text-sm text-muted">{planName} · {sub?.status || 'no plan'}</p>
            </div>
          </div>
          {materials?.uploaded_cv_url && (
            <Button variant="secondary" size="sm" onClick={openUploaded}><FileDown className="h-4 w-4" /> Uploaded CV</Button>
          )}
        </div>
        <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          <p className="flex items-center gap-2 text-muted"><Mail className="h-4 w-4" /> {client.email}</p>
          <p className="flex items-center gap-2 text-muted"><Phone className="h-4 w-4" /> {client.whatsapp_number || client.phone_number || '—'}</p>
          <p className="flex items-center gap-2 text-muted"><MapPin className="h-4 w-4" /> {client.city_state || '—'}</p>
          <p className="flex items-center gap-2 text-muted"><User className="h-4 w-4" /> {sub ? `${sub.applications_used}/${sub.applications_limit} applications used` : '—'}</p>
        </div>
        {materials?.dream_job && <p className="mt-3 text-sm"><span className="text-muted">Dream job:</span> <span className="font-semibold">{materials.dream_job}</span></p>}
        {materials?.delivery_channels && <p className="mt-1 text-sm"><span className="text-muted">Alerts via:</span> <span className="font-semibold capitalize">{materials.delivery_channels.join(', ')}</span></p>}
      </div>

      {/* CV DELIVERABLE — the 24/48h professional CV */}
      <div className="mb-6 rounded-2xl border border-line bg-white p-6 shadow-soft">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 font-bold"><FileText className="h-5 w-5 text-green" /> Professional CV deliverable</h2>
          <div className="flex items-center gap-2">
            {materials?.cv_due_at && cvStatus !== 'delivered' && (
              <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold',
                new Date(materials.cv_due_at) < new Date() ? 'bg-red-50 text-red-600' : 'bg-cream text-muted')}>
                <Clock className="h-3.5 w-3.5" /> due {new Date(materials.cv_due_at).toLocaleString()}
              </span>
            )}
            <span className="rounded-full bg-green-light px-2.5 py-1 text-xs font-semibold text-green capitalize">{cvStatus.replace('_', ' ')}</span>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <Button size="sm" onClick={generateAi} disabled={busy}>
            <Sparkles className="h-4 w-4" /> {deliverable?.ai_cv_draft ? 'Re-generate AI draft' : 'Generate AI draft'}
          </Button>
        </div>

        {(deliverable?.ai_cv_draft || deliverable?.ai_cover_letter_draft) && (
          <div className="mb-4 grid gap-3 md:grid-cols-2">
            <details className="rounded-xl border border-line bg-cream p-3">
              <summary className="cursor-pointer text-sm font-semibold">AI CV draft</summary>
              <pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap font-sans text-xs text-ink">{deliverable?.ai_cv_draft}</pre>
            </details>
            <details className="rounded-xl border border-line bg-cream p-3">
              <summary className="cursor-pointer text-sm font-semibold">AI cover letter draft</summary>
              <pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap font-sans text-xs text-ink">{deliverable?.ai_cover_letter_draft}</pre>
            </details>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Final CV link" value={cv.final_cv_url} onChange={(e) => setCv({ ...cv, final_cv_url: e.target.value })} placeholder="https://…" />
          <FormField label="Final cover letter link" value={cv.final_cover_letter_url} onChange={(e) => setCv({ ...cv, final_cover_letter_url: e.target.value })} placeholder="https://…" />
        </div>
        <FormField as="textarea" label="Ready-to-send email" value={cv.final_email} onChange={(e) => setCv({ ...cv, final_email: e.target.value })} helperText="The email the job seeker can copy and send." />
        <FormField label="Job description link (optional)" value={cv.final_job_link} onChange={(e) => setCv({ ...cv, final_job_link: e.target.value })} placeholder="https://…" helperText="A posting they can read for more context." />

        <div className="mt-2 flex flex-wrap items-center gap-3">
          <FormField as="select" label="" value={cv.status} onChange={(e) => setCv({ ...cv, status: e.target.value as CvReviewStatus })} className="!mb-0">
            <option value="drafting">Drafting</option>
            <option value="human_review">Human review</option>
            <option value="ready">Ready</option>
            <option value="delivered">Delivered</option>
          </FormField>
          <Button variant="secondary" onClick={() => saveCv(false)} disabled={busy}>Save</Button>
          <Button variant="whatsapp" onClick={() => saveCv(true)} disabled={busy}><Send className="h-4 w-4" /> Deliver to job seeker</Button>
        </div>
        <p className="mt-2 text-xs text-muted">The job seeker can only see the final CV, cover letter and email after you tap “Deliver”.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* onboarding details */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-line bg-white p-6 shadow-soft">
            <h2 className="mb-3 font-bold">Onboarding details (raw data)</h2>
            {surveyData ? (
              <dl className="space-y-2.5">
                {Object.entries(surveyData).map(([k, v]) => (
                  <div key={k} className="grid grid-cols-3 gap-3 border-b border-line pb-2.5 last:border-0">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{k.replace(/([A-Z])/g, ' $1')}</dt>
                    <dd className="col-span-2 text-sm text-ink">
                      {typeof v === 'object' ? <pre className="whitespace-pre-wrap break-words font-sans text-sm">{JSON.stringify(v, null, 2)}</pre> : String(v || '—')}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : <p className="text-sm text-muted">No onboarding details captured.</p>}
          </div>

          <div className="rounded-2xl border border-line bg-white shadow-soft">
            <div className="flex items-center gap-2 border-b border-line px-6 py-4">
              <MessageSquare className="h-5 w-5 text-green" />
              <h2 className="font-bold">Chat with this job seeker</h2>
            </div>
            <div className="max-h-[360px] min-h-[160px] space-y-3 overflow-y-auto p-5">
              {messages.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted">No messages yet. Send a tip or ask for more info.</p>
              ) : (
                messages.map((m) => {
                  const fromTeam = m.sender_role !== 'client';
                  return (
                    <div key={m.id} className={cn('max-w-[80%] rounded-2xl px-3.5 py-2 text-sm',
                      fromTeam ? 'ml-auto rounded-br-md bg-green-light text-green-dark' : 'mr-auto rounded-bl-md bg-paper text-ink')}>
                      {!fromTeam && <p className="mb-0.5 text-[0.68rem] font-bold uppercase tracking-wide text-gold">Job seeker</p>}
                      <p className="whitespace-pre-wrap">{m.body}</p>
                      <p className="mt-1 text-[0.62rem] text-muted">{new Date(m.created_at).toLocaleString()}</p>
                    </div>
                  );
                })
              )}
            </div>
            <div className="flex gap-2 border-t border-line p-3">
              <input value={msgText} onChange={(e) => setMsgText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); sendMessage(); } }}
                placeholder="Message the job seeker…"
                className="w-full rounded-full border border-line px-4 py-2.5 text-sm outline-none focus:border-green focus:ring-2 focus:ring-green/15" />
              <Button onClick={sendMessage}><Send className="h-4 w-4" /></Button>
            </div>
          </div>
        </div>

        {/* right column */}
        <div className="space-y-6">
          {isAdmin && (
            <div className="rounded-2xl border border-line bg-white p-6 shadow-soft">
              <h2 className="mb-4 flex items-center gap-2 font-bold"><Settings2 className="h-5 w-5 text-green" /> Manage plan</h2>
              <FormField as="select" label="Tier" value={plan.tier} onChange={(e) => setPlan({ ...plan, tier: e.target.value })}>
                {PLANS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </FormField>
              <FormField as="select" label="Status" value={plan.status} onChange={(e) => setPlan({ ...plan, status: e.target.value })}>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="cancelled">Cancelled</option>
              </FormField>
              <div className="flex gap-4">
                <FormField label="Used" type="number" value={String(plan.used)} onChange={(e) => setPlan({ ...plan, used: Number(e.target.value) })} />
                <FormField label="Limit" type="number" value={String(plan.limit)} onChange={(e) => setPlan({ ...plan, limit: Number(e.target.value) })} />
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={resetCycle} disabled={busy}>Reset cycle</Button>
                <Button onClick={savePlan} disabled={busy} fullWidth>Save plan</Button>
              </div>
            </div>
          )}

          {isAdmin && (
            <div className="rounded-2xl border border-line bg-white p-6 shadow-soft">
              <h2 className="mb-4 flex items-center gap-2 font-bold"><FilePlus2 className="h-5 w-5 text-green" /> New application</h2>
              <form onSubmit={createApplication}>
                <FormField as="select" label="Job posting" value={jobId} onChange={(e) => setJobId(e.target.value)} required>
                  <option value="">Select a job…</option>
                  {jobs.map((j) => <option key={j.id} value={j.id}>{j.title} — {j.company}</option>)}
                </FormField>
                <FormField as="select" label="Assign to staff" value={assignTo} onChange={(e) => setAssignTo(e.target.value)}>
                  <option value="">Unassigned</option>
                  {staff.map((s) => <option key={s.id} value={s.id}>{s.full_name}</option>)}
                </FormField>
                <FormField label="Deliver by" type="datetime-local" value={dueAt} onChange={(e) => setDueAt(e.target.value)} />
                <Button type="submit" disabled={busy || jobs.length === 0} fullWidth className="mt-2">Create application</Button>
                {jobs.length === 0 && <p className="mt-2 text-xs text-muted">Add a job posting first.</p>}
              </form>
            </div>
          )}

          <div className="rounded-2xl border border-line bg-white shadow-soft">
            <div className="border-b border-line px-5 py-4"><h2 className="font-bold">Applications ({apps.length})</h2></div>
            {apps.length === 0 ? <div className="px-5 py-8 text-center text-sm text-muted">None yet.</div> : (
              <ul className="divide-y divide-line">
                {apps.map((app) => {
                  const st = STATUS_MAP[app.status];
                  return (
                    <li key={app.id}>
                      <Link href={`/admin/applications/${app.id}`} className="flex items-center justify-between gap-2 px-5 py-3 hover:bg-cream">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{app.job_postings?.title || 'Application'}</p>
                          <p className="truncate text-xs text-muted">{app.job_postings?.company}</p>
                        </div>
                        <span className="shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold" style={{ backgroundColor: st.bg, color: st.color }}>{st.label}</span>
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
