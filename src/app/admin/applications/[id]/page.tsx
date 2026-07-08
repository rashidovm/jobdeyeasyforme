'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Save, Send, Clock, ExternalLink, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAdmin } from '@/lib/adminContext';
import { Application, JobPosting, Profile, Subscription, ApplicationStatus } from '@/types';
import { STATUS_MAP } from '@/lib/constants';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import ErrorBox from '@/components/ui/ErrorBox';
import { cn } from '@/lib/cn';

const PIPELINE: ApplicationStatus[] = ['queued', 'ai_drafted', 'human_review', 'ready'];
const DELIVERED = ['sent_to_client', 'client_applied', 'interview', 'offer', 'rejected'];

export default function ApplicationWorkPage() {
  const { profile: me } = useAdmin();
  const isAdmin = me?.role === 'admin';
  const params = useParams();
  const appId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [app, setApp] = useState<Application | null>(null);
  const [job, setJob] = useState<JobPosting | null>(null);
  const [client, setClient] = useState<Profile | null>(null);
  const [sub, setSub] = useState<Subscription | null>(null);
  const [staff, setStaff] = useState<Profile[]>([]);

  const [form, setForm] = useState({
    tailored_cv_url: '',
    tailored_cover_letter_url: '',
    apply_to_email_or_link: '',
    apply_type: 'email',
    why_picked: '',
    correction_notes: '',
    followup_to: '',
    followup_email: '',
    reference_doc_url: '',
    status: 'queued' as ApplicationStatus,
    assigned_to: '',
    due_at: '',
  });

  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data: a } = await supabase.from('applications').select('*, job_postings(*)').eq('id', appId).single();
    const application = a as Application;
    setApp(application);
    setJob(application?.job_postings || null);

    setForm({
      tailored_cv_url: application?.tailored_cv_url || '',
      tailored_cover_letter_url: application?.tailored_cover_letter_url || '',
      apply_to_email_or_link: application?.apply_to_email_or_link || '',
      apply_type: application?.apply_type || 'email',
      why_picked: (application?.why_picked || []).join('\n'),
      correction_notes: application?.correction_notes || '',
      followup_to: application?.followup_to || '',
      followup_email: application?.followup_email || '',
      reference_doc_url: application?.reference_doc_url || '',
      status: application?.status || 'queued',
      assigned_to: application?.assigned_to || '',
      due_at: application?.due_at ? toLocalInput(application.due_at) : '',
    });

    if (application?.user_id) {
      const [{ data: c }, { data: s }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', application.user_id).single(),
        supabase.from('subscriptions').select('*').eq('user_id', application.user_id).order('started_at', { ascending: false }).limit(1).maybeSingle(),
      ]);
      setClient(c as Profile);
      setSub(s as Subscription);
    }
    if (isAdmin) {
      const { data: st } = await supabase.from('profiles').select('*').eq('role', 'staff');
      setStaff((st as Profile[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => { if (me) load(); /* eslint-disable-next-line */ }, [me, appId]);

  const generateFollowup = async () => {
    setError(''); setMsg(''); setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch('/api/ai/followup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token || ''}` },
      body: JSON.stringify({ applicationId: appId }),
    });
    const json = await res.json();
    setSaving(false);
    if (!res.ok) { setError(json.error || 'AI follow-up failed.'); return; }
    setForm((f) => ({ ...f, followup_email: json.followup }));
    setMsg('AI follow-up drafted — review it, then Save.');
  };

  const buildPayload = () => ({
    tailored_cv_url: form.tailored_cv_url || null,
    tailored_cover_letter_url: form.tailored_cover_letter_url || null,
    apply_to_email_or_link: form.apply_to_email_or_link || null,
    apply_type: form.apply_type || 'email',
    why_picked: form.why_picked.split('\n').map((s) => s.trim()).filter(Boolean),
    correction_notes: form.correction_notes || null,
    followup_to: form.followup_to || null,
    followup_email: form.followup_email || null,
    reference_doc_url: form.reference_doc_url || null,
    due_at: form.due_at ? new Date(form.due_at).toISOString() : null,
    ...(isAdmin ? { assigned_to: form.assigned_to || null } : {}),
  });

  const save = async () => {
    setError(''); setMsg(''); setSaving(true);
    const { error: e } = await supabase.from('applications').update({ ...buildPayload(), status: form.status }).eq('id', appId);
    setSaving(false);
    if (e) { setError(e.message); return; }
    setMsg('Saved.');
    load();
  };

  const saveFollowup = async () => {
    setError(''); setMsg(''); setSaving(true);
    const { error: e } = await supabase
      .from('applications')
      .update({ followup_to: form.followup_to || null, followup_email: form.followup_email || null })
      .eq('id', appId);
    setSaving(false);
    if (e) { setError(e.message); return; }
    setMsg('Follow-up saved — it now shows on the seeker\u2019s dashboard.');
    load();
  };

  const deliver = async () => {
    setError(''); setMsg('');
    if (!sub) { setError('No subscription found for this client.'); return; }
    if (sub.status !== 'active') { setError('This job seeker\u2019s payment isn\u2019t confirmed yet. An admin must confirm it before delivering.'); return; }
    if (sub.applications_used >= sub.applications_limit) {
      setError('This client has used all their applications for this cycle. They must top up or upgrade before a new one can be delivered.');
      return;
    }
    setSaving(true);
    const { error: e1 } = await supabase
      .from('applications')
      .update({ ...buildPayload(), status: 'sent_to_client', reviewed_by: me?.full_name || 'staff' })
      .eq('id', appId);
    if (e1) { setSaving(false); setError(e1.message); return; }

    const { error: e2 } = await supabase
      .from('subscriptions')
      .update({ applications_used: sub.applications_used + 1 })
      .eq('id', sub.id);
    setSaving(false);
    if (e2) { setError('Delivered, but failed to update quota: ' + e2.message); return; }
    setMsg('Delivered to client. Quota updated.');
    load();
  };

  if (loading) return <div className="text-muted">Loading…</div>;
  if (!app) return <div className="text-muted">Application not found.</div>;

  const alreadyDelivered = DELIVERED.includes(app.status);
  const outOfQuota = sub ? sub.applications_used >= sub.applications_limit : false;
  const s = STATUS_MAP[app.status];

  return (
    <div>
      <Link href={client ? `/admin/clients/${client.id}` : '/admin'} className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Back to client
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">{job?.title || app?.manual_job_title || 'Application'}</h1>
          <p className="text-sm text-muted">
            {job?.company} · for {client?.full_name}
          </p>
        </div>
        <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: s.bg, color: s.color }}>
          {s.label}
        </span>
      </div>

      {app.due_at && !alreadyDelivered && (
        <div className={cn('mb-6 flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm',
          new Date(app.due_at) < new Date() ? 'border-red-200 bg-red-50 text-red-700' : 'border-line bg-white text-muted')}>
          <Clock className="h-4 w-4" />
          Deliver by {new Date(app.due_at).toLocaleString()}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Work form */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-line bg-white p-6 shadow-soft">
            <h2 className="mb-4 font-bold">Deliverables</h2>
            <ErrorBox message={error} />
            {msg && <div className="mb-4 rounded-xl border border-green/30 bg-green-light px-4 py-2.5 text-sm font-medium text-green">{msg}</div>}

            <FormField label="Tailored CV link" value={form.tailored_cv_url} onChange={(e) => setForm({ ...form, tailored_cv_url: e.target.value })} placeholder="https://…" helperText="Paste a shareable link (Google Drive, Dropbox, etc.)" />
            <FormField label="Cover letter link" value={form.tailored_cover_letter_url} onChange={(e) => setForm({ ...form, tailored_cover_letter_url: e.target.value })} placeholder="https://…" />
            <div className="mb-4">
              <label className="mb-1.5 block text-sm font-semibold">How does the seeker apply?</label>
              <div className="flex gap-2">
                <button type="button" onClick={() => setForm({ ...form, apply_type: 'email' })} className={cn('flex-1 rounded-xl border px-3 py-2 text-sm font-semibold', form.apply_type === 'email' ? 'border-green bg-green-light text-green' : 'border-line text-muted')}>✉️ By email</button>
                <button type="button" onClick={() => setForm({ ...form, apply_type: 'form' })} className={cn('flex-1 rounded-xl border px-3 py-2 text-sm font-semibold', form.apply_type === 'form' ? 'border-green bg-green-light text-green' : 'border-line text-muted')}>📝 By form</button>
              </div>
            </div>
            <FormField label={form.apply_type === 'form' ? 'Application form link' : 'Where to apply (email address)'} value={form.apply_to_email_or_link} onChange={(e) => setForm({ ...form, apply_to_email_or_link: e.target.value })} placeholder={form.apply_type === 'form' ? 'https://forms.company.com/…' : 'hr@company.com'} />
            <FormField as="textarea" label="Why we picked this job" value={form.why_picked} onChange={(e) => setForm({ ...form, why_picked: e.target.value })} helperText="One reason per line — the client sees these." />
            <FormField as="textarea" label="Correction / review notes" value={form.correction_notes} onChange={(e) => setForm({ ...form, correction_notes: e.target.value })} helperText="Internal notes for the checker. Not shown to the client." />

            <FormField label="Reference / guide document (optional)" value={form.reference_doc_url} onChange={(e) => setForm({ ...form, reference_doc_url: e.target.value })} placeholder="https://docs.google.com/…" helperText="Instructions doc for the seeker: email subject and body to use, what to attach, or form answers to copy-paste." />
          </div>

          {/* Follow-up is a separate step — only relevant once the application has actually been sent to the client */}
          <div className="rounded-2xl border border-gold/30 bg-gold-light/40 p-6 shadow-soft">
            <h2 className="mb-1 font-bold text-gold">Follow-up email (optional)</h2>
            <p className="mb-4 text-xs text-muted">A separate nudge email the seeker can send a few days after they&apos;ve actually sent this application. It has its own save action and only appears here once the application is delivered.</p>

            {!alreadyDelivered ? (
              <div className="rounded-xl border border-line bg-white/60 px-4 py-3 text-sm text-muted">
                Unlocks once this application is delivered to the client.
              </div>
            ) : (
              <>
                <ErrorBox message={error} />
                {msg && <div className="mb-4 rounded-xl border border-green/30 bg-green-light px-4 py-2.5 text-sm font-medium text-green">{msg}</div>}
                {app?.needs_followup && !app?.heard_back && (
                  <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-600">🔔 The seeker says {app.job_postings?.company || app.manual_company || 'the employer'} hasn\u2019t responded — prepare a follow-up email below. It appears on their dashboard once saved.</p>
                )}
                <div className="mb-3 flex justify-end">
                  <button type="button" onClick={generateFollowup} disabled={saving} className="rounded-full bg-gold px-3 py-1.5 text-xs font-semibold text-white shadow-soft hover:bg-gold-bright disabled:opacity-60">✨ Generate with AI</button>
                </div>
                <FormField label="Follow-up to (email)" value={form.followup_to} onChange={(e) => setForm({ ...form, followup_to: e.target.value })} placeholder="hr@company.com" />
                <FormField as="textarea" label="Follow-up email text" value={form.followup_email} onChange={(e) => setForm({ ...form, followup_email: e.target.value })} placeholder="Dear Hiring Manager, I recently applied for…" />
                <Button onClick={saveFollowup} disabled={saving} fullWidth>
                  <Save className="h-4 w-4" /> {saving ? 'Saving…' : 'Save follow-up'}
                </Button>
              </>
            )}
          </div>

          {job && (
            <div className="rounded-2xl border border-line bg-white p-6 shadow-soft">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="font-bold">Job brief</h2>
                {job.source_link && (
                  <a href={job.source_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-green">
                    Source <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
              <p className="text-sm text-muted">{job.location}{job.salary ? ` · ${job.salary}` : ''}</p>
              <p className="mt-3 whitespace-pre-wrap text-sm">{job.internal_description}</p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-line bg-white p-6 shadow-soft">
            <h2 className="mb-4 font-bold">Status & assignment</h2>
            <FormField as="select" label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ApplicationStatus })}>
              {(Object.keys(STATUS_MAP) as ApplicationStatus[]).map((k) => (
                <option key={k} value={k}>{STATUS_MAP[k].label}</option>
              ))}
            </FormField>

            {isAdmin && (
              <FormField as="select" label="Assigned to" value={form.assigned_to} onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}>
                <option value="">Unassigned</option>
                {staff.map((st) => (<option key={st.id} value={st.id}>{st.full_name}</option>))}
              </FormField>
            )}

            <FormField label="Deliver by" type="datetime-local" value={form.due_at} onChange={(e) => setForm({ ...form, due_at: e.target.value })} />

            <Button onClick={save} disabled={saving} fullWidth className="mt-2">
              <Save className="h-4 w-4" /> {saving ? 'Saving…' : 'Save changes'}
            </Button>
          </div>

          <div className="rounded-2xl border border-line bg-white p-6 shadow-soft">
            <h2 className="mb-2 font-bold">Deliver to client</h2>
            {app?.client_sent ? (
              <p className="mb-2 rounded-lg bg-green-light px-3 py-2 text-xs font-bold text-green">✓ Seeker confirmed they sent this application{app.client_sent_at ? ` on ${new Date(app.client_sent_at).toLocaleDateString()}` : ''}.</p>
            ) : ['sent_to_client', 'client_applied', 'interview', 'offer', 'rejected'].includes(app?.status || '') ? (
              <p className="mb-2 rounded-lg bg-gold-light px-3 py-2 text-xs font-bold text-gold">⏳ Seeker hasn&apos;t confirmed sending yet — they&apos;re being reminded every 12 hours.</p>
            ) : null}
            {sub && (
              <p className="mb-3 text-sm text-muted">
                Quota: <strong className="text-ink">{sub.applications_used}/{sub.applications_limit}</strong> used this cycle.
              </p>
            )}
            {alreadyDelivered ? (
              <div className="rounded-xl bg-green-light px-4 py-3 text-sm font-medium text-green">
                Already delivered to the client.
              </div>
            ) : outOfQuota ? (
              <div className="flex items-start gap-2 rounded-xl border border-gold/40 bg-gold-light px-4 py-3 text-sm text-gold">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                Client is out of applications. They need to top up or upgrade first.
              </div>
            ) : (
              <>
                <p className="mb-3 text-sm text-muted">
                  This marks the application delivered and uses one of the client&apos;s applications.
                </p>
                <Button onClick={deliver} disabled={saving} variant="whatsapp" fullWidth>
                  <Send className="h-4 w-4" /> {saving ? 'Delivering…' : 'Deliver & use 1 application'}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60000);
  return local.toISOString().slice(0, 16);
}
