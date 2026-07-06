'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft, Mail, Phone, MapPin, FilePlus2, ChevronRight, Sparkles, Send,
  FileDown, Clock, FileText, MessageSquare, Check, RotateCcw, Copy, Bell,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAdmin } from '@/lib/adminContext';
import {
  Application, ClientMaterial, CvDeliverable, JobPosting, Profile, Subscription, Message, Notification,
} from '@/types';
import { PLANS, STATUS_MAP, APPLICATION_LIMITS, PLAN_CHANNELS } from '@/lib/constants';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import ErrorBox from '@/components/ui/ErrorBox';
import { cn } from '@/lib/cn';

const CHANNEL_LABEL: Record<string, string> = { whatsapp: 'WhatsApp', email: 'Email', sms: 'SMS' };

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
  const [messages, setMessages] = useState<Message[]>([]);
  const [notifs, setNotifs] = useState<Notification[]>([]);

  const [jobId, setJobId] = useState('');
  const [assignTo, setAssignTo] = useState('');
  const [dueAt, setDueAt] = useState('');
  const [cv, setCv] = useState({ final_cv_url: '', final_cover_letter_url: '' });
  const [plan, setPlan] = useState({ tier: 'free_trial', used: 0, limit: 1 });
  const [msgText, setMsgText] = useState('');
  const [assignedStaffId, setAssignedStaffId] = useState('');
  const [error, setError] = useState('');
  const [flashMsg, setFlashMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const flash = (m: string) => { setFlashMsg(m); setTimeout(() => setFlashMsg(''), 2500); };

  const assignStaff = async (staffId: string) => {
    setAssignedStaffId(staffId);
    await supabase.from('profiles').update({ assigned_staff_id: staffId || null }).eq('id', clientId);
    flash(staffId ? 'Job seeker assigned.' : 'Unassigned.');
  };

  const confirmPayment = async () => {
    if (!sub) return;
    setBusy(true);
    const { error: e } = await supabase.from('subscriptions').update({ status: 'active' }).eq('id', sub.id);
    setBusy(false);
    if (e) { setError(e.message); return; }
    flash('Payment confirmed — subscription is now active.'); load();
  };

  const quickCreateApp = async (jid: string) => {
    if (!sub) { setError('No subscription.'); return; }
    setBusy(true);
    const { error: e } = await supabase.from('applications').insert({
      user_id: clientId, subscription_id: sub.id, job_id: jid,
      assigned_to: assignedStaffId || null, status: 'queued', why_picked: [],
    });
    setBusy(false);
    if (e) { setError(e.message); return; }
    flash('Application created from suggested job.'); load();
  };

  const load = async () => {
    const [{ data: c }, { data: s }, { data: m }, { data: dv }, { data: a }, { data: n }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', clientId).single(),
      supabase.from('subscriptions').select('*').eq('user_id', clientId).order('started_at', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('client_materials').select('*').eq('user_id', clientId).maybeSingle(),
      supabase.from('cv_deliverables').select('*').eq('user_id', clientId).maybeSingle(),
      supabase.from('applications').select('*, job_postings(*)').eq('user_id', clientId).order('created_at', { ascending: false }),
      supabase.from('notifications').select('*').eq('user_id', clientId).order('created_at', { ascending: false }),
    ]);
    setClient(c as Profile); setSub(s as Subscription); setMaterials(m as ClientMaterial);
    setDeliverable(dv as CvDeliverable); setApps((a as Application[]) || []); setNotifs((n as Notification[]) || []);
    if (dv) { const x = dv as CvDeliverable; setCv({ final_cv_url: x.final_cv_url || '', final_cover_letter_url: x.final_cover_letter_url || '' }); }
    if (s) { const x = s as Subscription; setPlan({ tier: x.tier, used: x.applications_used, limit: x.applications_limit }); }
    if (c) setAssignedStaffId((c as Profile).assigned_staff_id || '');

    const { data: j } = await supabase.from('job_postings').select('*').eq('filled', false).order('created_at', { ascending: false });
    setJobs((j as JobPosting[]) || []);
    if (isAdmin) {
      const { data: st } = await supabase.from('profiles').select('*').eq('role', 'staff');
      setStaff((st as Profile[]) || []);
    }
    setLoading(false);
  };

  const loadMessages = async () => {
    const { data } = await supabase.from('messages').select('*').eq('thread_user_id', clientId).order('created_at', { ascending: true });
    setMessages((data as Message[]) || []);
  };

  useEffect(() => { if (me) { load(); loadMessages(); } /* eslint-disable-next-line */ }, [me, clientId]);

  const cvStatus = materials?.cv_review_status || 'drafting';
  const surveyData = (materials?.survey_responses || materials?.quick_fill || {}) as any;
  const planChannels = PLAN_CHANNELS[sub?.tier || 'free_trial'] || ['email'];
  const whatsappNo = client?.whatsapp_number || surveyData?.whatsapp || '';

  const setCvStatus = async (status: string) => {
    setError(''); setBusy(true);
    const { error: e } = await supabase.from('client_materials').update({ cv_review_status: status }).eq('user_id', clientId);
    setBusy(false);
    if (e) { setError(e.message); return; }
    flash(`Marked ${status.replace('_', ' ')}.`); load();
  };

  const saveCvLinks = async () => {
    setError(''); setBusy(true);
    const { error: e } = await supabase.from('cv_deliverables').upsert(
      { user_id: clientId, final_cv_url: cv.final_cv_url || null, final_cover_letter_url: cv.final_cover_letter_url || null, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' });
    setBusy(false);
    if (e) { setError(e.message); return; }
    flash('Saved.'); load();
  };

  const deliverCv = async () => {
    setError('');
    if (sub && sub.status !== 'active') { setError('Confirm this job seeker\u2019s payment before delivering.'); return; }
    if (!cv.final_cv_url || !cv.final_cover_letter_url) { setError('Add both the CV and cover letter links before delivering.'); return; }
    setBusy(true);
    await supabase.from('cv_deliverables').upsert(
      { user_id: clientId, final_cv_url: cv.final_cv_url, final_cover_letter_url: cv.final_cover_letter_url, delivered: true, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' });
    const { error: e } = await supabase.from('client_materials').update({ cv_review_status: 'delivered' }).eq('user_id', clientId);
    setBusy(false);
    if (e) { setError(e.message); return; }
    flash('CV delivered to the job seeker.'); load();
  };

  const generateAi = async () => {
    setError(''); setBusy(true);
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch('/api/ai/draft-cv', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token || ''}` },
      body: JSON.stringify({ targetUserId: clientId }),
    });
    const json = await res.json(); setBusy(false);
    if (!res.ok) { setError(json.error || 'AI draft failed.'); return; }
    flash('AI draft generated.'); load();
  };

  const markNotified = async (channel: string, note: string) => {
    await supabase.from('notifications').insert({ user_id: clientId, channel, note, context: 'cv' });
    flash(`Marked ${CHANNEL_LABEL[channel]} sent.`);
    const { data: n } = await supabase.from('notifications').select('*').eq('user_id', clientId).order('created_at', { ascending: false });
    setNotifs((n as Notification[]) || []);
  };

  const createApplication = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (!jobId) { setError('Pick a job posting.'); return; }
    if (!sub) { setError('This job seeker has no subscription.'); return; }
    setBusy(true);
    const { error: insErr } = await supabase.from('applications').insert({
      user_id: clientId, subscription_id: sub.id, job_id: jobId, assigned_to: assignTo || null,
      due_at: dueAt ? new Date(dueAt).toISOString() : null, status: 'queued', why_picked: [],
    });
    setBusy(false);
    if (insErr) { setError(insErr.message); return; }
    setJobId(''); setAssignTo(''); setDueAt(''); flash('Application created.'); load();
  };

  const setTier = async (tier: string) => {
    if (!sub) return;
    setBusy(true);
    const lim = APPLICATION_LIMITS[tier] ?? 1;
    const { error: e } = await supabase.from('subscriptions').update({ tier, applications_limit: lim, status: 'active' }).eq('id', sub.id);
    setBusy(false);
    if (e) { setError(e.message); return; }
    flash(`Moved to ${PLANS.find((p) => p.id === tier)?.name}.`); load();
  };

  const resetCycle = async () => {
    if (!sub) return;
    setBusy(true);
    const { error: e } = await supabase.from('subscriptions').update({
      applications_used: 0, applications_limit: APPLICATION_LIMITS[sub.tier] ?? 1,
      renews_at: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(), status: 'active',
    }).eq('id', sub.id);
    setBusy(false);
    if (e) { setError(e.message); return; }
    flash('30-day cycle reset.'); load();
  };

  const adjustApps = async (delta: number) => {
    if (!sub) return;
    const used = Math.max(0, sub.applications_used + delta);
    await supabase.from('subscriptions').update({ applications_used: used }).eq('id', sub.id);
    load();
  };

  const sendMessage = async () => {
    const body = msgText.trim(); if (!body || !me) return;
    const { error: e } = await supabase.from('messages').insert({ thread_user_id: clientId, sender_id: me.id, sender_role: me.role, body, read_by_client: false });
    if (!e) { setMsgText(''); loadMessages(); } else setError(e.message);
  };

  if (loading) return <div className="text-muted">Loading…</div>;
  if (!client) return <div className="text-muted">Job seeker not found.</div>;

  const planName = PLANS.find((p) => p.id === sub?.tier)?.name || '—';
  const remaining = sub ? Math.max(0, sub.applications_limit - sub.applications_used) : 0;
  const subActive = sub?.status === 'active';
  const isPaidPending = sub && sub.tier !== 'free_trial' && sub.status === 'pending';
  const daysLeft = sub?.renews_at ? Math.max(0, Math.ceil((new Date(sub.renews_at).getTime() - Date.now()) / 86400000)) : null;
  const dreamKw = (materials?.dream_job || '').toLowerCase().split(/\s+/).filter((w) => w.length > 3);
  const suggested = jobs.filter((j) => {
    const hay = `${j.title} ${j.public_teaser} ${j.company}`.toLowerCase();
    return dreamKw.some((k) => hay.includes(k));
  }).slice(0, 5);
  const notifyMsg = `Hi ${client.full_name?.split(' ')[0] || 'there'}, your JobDeyEasy CV is ready. Please log in and check your dashboard: ${typeof window !== 'undefined' ? window.location.origin : ''}/dashboard`;
  const lastSent = (ch: string) => notifs.find((n) => n.channel === ch && n.context === 'cv');

  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/admin/clients" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> All job seekers
      </Link>

      {flashMsg && <div className="mb-4 rounded-xl border border-green/30 bg-green-light px-4 py-2.5 text-sm font-medium text-green">{flashMsg}</div>}
      <ErrorBox message={error} />

      {/* Header */}
      <div className="mb-6 rounded-2xl border border-line bg-white p-6 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green text-xl font-bold text-white">{client.full_name?.charAt(0) || 'C'}</div>
            <div>
              <h1 className="text-xl font-extrabold">{client.full_name}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">
                <span className="inline-flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {client.email}</span>
                {whatsappNo && <span className="inline-flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {whatsappNo}</span>}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-green-light px-3 py-1 text-xs font-bold text-green">{planName}</span>
            <span className={cn('rounded-full px-3 py-1 text-xs font-semibold', subActive ? 'bg-green-light text-green' : 'bg-gold-light text-gold')}>
              {subActive ? 'Active' : 'Payment pending'}
            </span>
            <span className="rounded-full bg-cream px-3 py-1 text-xs font-semibold text-muted">{remaining} of {sub?.applications_limit ?? 0} apps left</span>
            {daysLeft !== null && sub?.tier !== 'free_trial' && (
              <span className="rounded-full bg-cream px-3 py-1 text-xs font-semibold text-muted">{daysLeft} days left in cycle</span>
            )}
          </div>
        </div>

        {isPaidPending && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gold/40 bg-gold-light p-3.5">
            <p className="text-sm font-medium text-gold">Payment not confirmed yet. Nothing is delivered until you confirm.</p>
            <Button size="sm" onClick={confirmPayment} disabled={busy}>Confirm payment &amp; activate</Button>
          </div>
        )}
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm">
          {materials?.dream_job && <p><span className="text-muted">Dream job:</span> <span className="font-semibold">{materials.dream_job}</span></p>}
          {materials?.delivery_channels && <p><span className="text-muted">Alerts via:</span> <span className="font-semibold capitalize">{materials.delivery_channels.join(', ')}</span></p>}
          {materials?.uploaded_cv_url && (
            <button onClick={async () => { const { data } = await supabase.storage.from('cvs').createSignedUrl(materials.uploaded_cv_url!, 3600); if (data?.signedUrl) window.open(data.signedUrl, '_blank'); }} className="inline-flex items-center gap-1 font-semibold text-green">
              <FileDown className="h-4 w-4" /> Uploaded CV
            </button>
          )}
        </div>
      </div>

      {/* CV deliverable — CV + cover letter ONLY (the post-registration deliverable) */}
      <div className="mb-6 rounded-2xl border border-line bg-white p-6 shadow-soft">
        <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 font-bold"><FileText className="h-5 w-5 text-green" /> Professional CV &amp; cover letter</h2>
          {materials?.cv_due_at && cvStatus !== 'delivered' && (
            <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold', new Date(materials.cv_due_at) < new Date() ? 'bg-red-50 text-red-600' : 'bg-cream text-muted')}>
              <Clock className="h-3.5 w-3.5" /> due {new Date(materials.cv_due_at).toLocaleString()}
            </span>
          )}
        </div>
        <p className="mb-4 text-xs text-muted">The first deliverable after registration — the CV and cover letter only. Job-specific emails belong to applications below.</p>

        {/* status stepper */}
        <div className="mb-5 flex items-center gap-2">
          {['human_review', 'ready', 'delivered'].map((st, i) => {
            const order = ['drafting', 'human_review', 'ready', 'delivered'];
            const active = order.indexOf(cvStatus) >= order.indexOf(st);
            return (
              <React.Fragment key={st}>
                <span className={cn('rounded-full px-3 py-1 text-xs font-semibold capitalize', active ? 'bg-green text-white' : 'bg-cream text-muted')}>{st.replace('_', ' ')}</span>
                {i < 2 && <span className={cn('h-0.5 w-6', active ? 'bg-green' : 'bg-line')} />}
              </React.Fragment>
            );
          })}
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={generateAi} disabled={busy}><Sparkles className="h-4 w-4" /> {deliverable?.ai_cv_draft ? 'Re-draft with AI' : 'AI draft'}</Button>
        </div>

        {(deliverable?.ai_cv_draft || deliverable?.ai_cover_letter_draft) && (
          <div className="mb-4 grid gap-3 md:grid-cols-2">
            <details className="rounded-xl border border-line bg-cream p-3"><summary className="cursor-pointer text-sm font-semibold">AI CV draft</summary><pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap font-sans text-xs">{deliverable?.ai_cv_draft}</pre></details>
            <details className="rounded-xl border border-line bg-cream p-3"><summary className="cursor-pointer text-sm font-semibold">AI cover letter draft</summary><pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap font-sans text-xs">{deliverable?.ai_cover_letter_draft}</pre></details>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Final CV link (Google Drive)" value={cv.final_cv_url} onChange={(e) => setCv({ ...cv, final_cv_url: e.target.value })} placeholder="https://drive.google.com/…" />
          <FormField label="Final cover letter link" value={cv.final_cover_letter_url} onChange={(e) => setCv({ ...cv, final_cover_letter_url: e.target.value })} placeholder="https://drive.google.com/…" />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="sm" onClick={saveCvLinks} disabled={busy}>Save links</Button>
          {cvStatus !== 'ready' && cvStatus !== 'delivered' && <Button size="sm" onClick={() => setCvStatus('ready')} disabled={busy}>Mark ready</Button>}
          <Button variant="whatsapp" size="sm" onClick={deliverCv} disabled={busy || cvStatus === 'delivered'}><Send className="h-4 w-4" /> {cvStatus === 'delivered' ? 'Delivered' : 'Deliver to job seeker'}</Button>
        </div>

        {/* Notify */}
        <div className="mt-5 rounded-xl border border-line bg-cream p-4">
          <p className="mb-3 flex items-center gap-2 text-sm font-bold"><Bell className="h-4 w-4 text-gold" /> Notify the job seeker <span className="font-normal text-muted">(their plan: {planChannels.map((c) => CHANNEL_LABEL[c]).join(', ')})</span></p>
          <div className="space-y-2">
            {planChannels.map((ch) => {
              const to = ch === 'email' ? client.email : whatsappNo;
              const sent = lastSent(ch);
              return (
                <div key={ch} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white px-3 py-2">
                  <div className="text-sm"><span className="font-semibold">{CHANNEL_LABEL[ch]}</span> <span className="text-muted">→ {to || '—'}</span></div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => navigator.clipboard.writeText(notifyMsg)} className="inline-flex items-center gap-1 text-xs font-semibold text-green"><Copy className="h-3.5 w-3.5" /> Copy message</button>
                    {sent ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-green"><Check className="h-3.5 w-3.5" /> sent</span>
                      : <button onClick={() => markNotified(ch, notifyMsg)} className="rounded-full bg-green px-3 py-1 text-xs font-semibold text-white">Mark sent</button>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* raw data */}
          <div className="rounded-2xl border border-line bg-white p-6 shadow-soft">
            <h2 className="mb-3 font-bold">Onboarding details (raw data)</h2>
            <dl className="space-y-2.5">
              {Object.entries(surveyData).map(([k, v]) => (
                <div key={k} className="grid grid-cols-3 gap-3 border-b border-line pb-2.5 last:border-0">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{k.replace(/([A-Z])/g, ' $1')}</dt>
                  <dd className="col-span-2 text-sm">{typeof v === 'object' ? <pre className="whitespace-pre-wrap break-words font-sans text-sm">{JSON.stringify(v, null, 2)}</pre> : String(v || '—')}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Suggested jobs matching the dream role */}
          {suggested.length > 0 && (
            <div className="rounded-2xl border border-line bg-white p-6 shadow-soft">
              <h2 className="mb-1 font-bold">Suggested jobs for {materials?.dream_job || 'this seeker'}</h2>
              <p className="mb-4 text-xs text-muted">Open roles that match their goal. Create an application, or find your own and attach it below.</p>
              <ul className="space-y-3">
                {suggested.map((j) => (
                  <li key={j.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line p-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{j.title}</p>
                      <p className="truncate text-xs text-muted">{j.company} · {j.location}{j.work_mode ? ` · ${j.work_mode}` : ''}</p>
                    </div>
                    <Button size="sm" variant="secondary" onClick={() => quickCreateApp(j.id)} disabled={busy}>Create application</Button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* chat */}
          <div className="rounded-2xl border border-line bg-white shadow-soft">
            <div className="flex items-center gap-2 border-b border-line px-6 py-4"><MessageSquare className="h-5 w-5 text-green" /><h2 className="font-bold">Chat with this job seeker</h2></div>
            <div className="max-h-[340px] min-h-[140px] space-y-3 overflow-y-auto p-5">
              {messages.length === 0 ? <p className="py-8 text-center text-sm text-muted">No messages yet. Message them to open a reply window.</p> :
                messages.map((m) => {
                  const fromTeam = m.sender_role !== 'client';
                  return (
                    <div key={m.id} className={cn('max-w-[80%] rounded-2xl px-3.5 py-2 text-sm', fromTeam ? 'ml-auto rounded-br-md bg-green-light text-green-dark' : 'mr-auto rounded-bl-md bg-paper text-ink')}>
                      {!fromTeam && <p className="mb-0.5 text-[0.68rem] font-bold uppercase tracking-wide text-gold">Job seeker</p>}
                      <p className="whitespace-pre-wrap">{m.body}</p>
                      <p className="mt-1 text-[0.62rem] text-muted">{new Date(m.created_at).toLocaleString()}</p>
                    </div>
                  );
                })}
            </div>
            <div className="flex gap-2 border-t border-line p-3">
              <input value={msgText} onChange={(e) => setMsgText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); sendMessage(); } }} placeholder="Message the job seeker…" className="w-full rounded-full border border-line px-4 py-2.5 text-sm outline-none focus:border-green focus:ring-2 focus:ring-green/15" />
              <Button onClick={sendMessage}><Send className="h-4 w-4" /></Button>
            </div>
          </div>
        </div>

        {/* right column */}
        <div className="space-y-6">
          {isAdmin && (
            <div className="rounded-2xl border border-line bg-white p-6 shadow-soft">
              <h2 className="mb-3 font-bold">Assigned staff</h2>
              <select value={assignedStaffId} onChange={(e) => assignStaff(e.target.value)} className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-green focus:ring-2 focus:ring-green/15">
                <option value="">Unassigned</option>
                {staff.map((s) => <option key={s.id} value={s.id}>{s.full_name}</option>)}
              </select>
              <p className="mt-2 text-xs text-muted">Staff only see the job seekers assigned to them.</p>
            </div>
          )}

          {isAdmin && (
            <div className="rounded-2xl border border-line bg-white p-6 shadow-soft">
              <h2 className="mb-1 font-bold">Plan</h2>
              <p className="mb-4 text-sm"><span className="text-2xl font-extrabold">{planName}</span></p>
              <div className="mb-4 rounded-xl bg-cream p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">Applications</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => adjustApps(-1)} className="h-6 w-6 rounded-full border border-line font-bold">−</button>
                    <span className="font-bold">{sub?.applications_used ?? 0} / {sub?.applications_limit ?? 0}</span>
                    <button onClick={() => adjustApps(1)} className="h-6 w-6 rounded-full border border-line font-bold">+</button>
                  </div>
                </div>
              </div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Move to plan</p>
              <div className="mb-3 grid grid-cols-2 gap-2">
                {PLANS.map((p) => (
                  <button key={p.id} onClick={() => setTier(p.id)} disabled={busy}
                    className={cn('rounded-xl border px-3 py-2 text-sm font-semibold transition-colors', sub?.tier === p.id ? 'border-green bg-green text-white' : 'border-line hover:border-green')}>
                    {p.name}
                  </button>
                ))}
              </div>
              <Button variant="secondary" size="sm" fullWidth onClick={resetCycle} disabled={busy}><RotateCcw className="h-4 w-4" /> Reset 30-day cycle</Button>
            </div>
          )}

          {isAdmin && (
            <div className="rounded-2xl border border-line bg-white p-6 shadow-soft">
              <h2 className="mb-4 flex items-center gap-2 font-bold"><FilePlus2 className="h-5 w-5 text-green" /> New application</h2>
              <form onSubmit={createApplication}>
                <FormField as="select" label="Job posting" value={jobId} onChange={(e) => setJobId(e.target.value)} required>
                  <option value="">Select a job…</option>
                  {jobs.filter((j) => !j.filled).map((j) => <option key={j.id} value={j.id}>{j.title} — {j.company}</option>)}
                </FormField>
                <FormField as="select" label="Assign to staff" value={assignTo} onChange={(e) => setAssignTo(e.target.value)}>
                  <option value="">Unassigned</option>
                  {staff.map((s) => <option key={s.id} value={s.id}>{s.full_name}</option>)}
                </FormField>
                <FormField label="Deliver by" type="datetime-local" value={dueAt} onChange={(e) => setDueAt(e.target.value)} />
                <Button type="submit" disabled={busy || jobs.length === 0} fullWidth className="mt-2">Create application</Button>
              </form>
            </div>
          )}

          <div className="rounded-2xl border border-line bg-white shadow-soft">
            <div className="border-b border-line px-5 py-4"><h2 className="font-bold">Applications ({apps.length})</h2></div>
            {apps.length === 0 ? <div className="px-5 py-8 text-center text-sm text-muted">None yet.</div> :
              <ul className="divide-y divide-line">{apps.map((app) => { const st = STATUS_MAP[app.status]; return (
                <li key={app.id}><Link href={`/admin/applications/${app.id}`} className="flex items-center justify-between gap-2 px-5 py-3 hover:bg-cream">
                  <div className="min-w-0"><p className="truncate text-sm font-semibold">{app.job_postings?.title || 'Application'}</p><p className="truncate text-xs text-muted">{app.job_postings?.company}</p></div>
                  <span className="shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold" style={{ backgroundColor: st.bg, color: st.color }}>{st.label}</span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted" />
                </Link></li>); })}</ul>}
          </div>
        </div>
      </div>
    </div>
  );
}
