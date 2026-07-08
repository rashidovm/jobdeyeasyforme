'use client';

import React, { useEffect, useState } from 'react';
import { Briefcase, Plus, MapPin, Building2, Trash2, Pencil } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAdmin } from '@/lib/adminContext';
import { JobPosting } from '@/types';
import { WORK_MODES } from '@/lib/constants';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import RichTextEditor from '@/components/ui/RichTextEditor';
import ErrorBox from '@/components/ui/ErrorBox';

const EMPTY = {
  title: '', company: '', location: '', salary: '',
  source_link: '', public_teaser: '', description: '', internal_description: '',
  work_mode: 'onsite', closes_at: '',
};

export default function JobsPage() {
  const { profile } = useAdmin();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ ...EMPTY });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await supabase.from('job_postings').select('*').order('created_at', { ascending: false });
    setJobs((data as JobPosting[]) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.title || !form.company || !form.location || !form.source_link || !form.public_teaser || !form.internal_description) {
      setError('Please fill in all fields except salary.');
      return;
    }
    setSaving(true);
    const payload = { ...form, salary: form.salary || null, closes_at: form.closes_at ? new Date(form.closes_at).toISOString() : null };
    const { error: e1 } = editingId
      ? await supabase.from('job_postings').update(payload).eq('id', editingId)
      : await supabase.from('job_postings').insert(payload);
    setSaving(false);
    if (e1) { setError(e1.message); return; }
    setForm({ ...EMPTY });
    setEditingId(null);
    load();
  };

  const edit = (j: JobPosting) => {
    setEditingId(j.id);
    setForm({
      title: j.title, company: j.company, location: j.location, salary: j.salary || '',
      source_link: j.source_link, public_teaser: j.public_teaser, description: j.description || '', internal_description: j.internal_description,
      work_mode: j.work_mode || 'onsite', closes_at: j.closes_at ? j.closes_at.slice(0, 16) : '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => { setEditingId(null); setForm({ ...EMPTY }); };

  const toggleFilled = async (j: JobPosting) => {
    await supabase.from('job_postings').update({ filled: !j.filled }).eq('id', j.id);
    load();
  };

  const toggleClosed = async (j: JobPosting) => {
    await supabase.from('job_postings').update({ closed: !j.closed }).eq('id', j.id);
    load();
  };

  const isExpired = (j: JobPosting) => !!j.closes_at && new Date(j.closes_at) < new Date();
  const isUrgent = (j: JobPosting) => !!j.closes_at && !isExpired(j) && new Date(j.closes_at).getTime() - Date.now() < 3 * 24 * 3600 * 1000;

  const remove = async (id: string) => {
    if (!confirm('Delete this job posting?')) return;
    await supabase.from('job_postings').delete().eq('id', id);
    load();
  };

  const canPost = profile?.role === 'admin' || (profile?.role === 'staff' && profile?.can_post_jobs);
  if (!canPost) return <div className="text-muted">You don\u2019t have permission to post jobs. Ask an admin to enable it.</div>;

  return (
    <div>
      <h1 className="mb-1 text-2xl font-extrabold">Job postings</h1>
      <p className="mb-6 text-sm text-muted">
        Jobs you add here can be attached to client applications, and will power your public jobs page.
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-white p-6 shadow-soft">
          <h2 className="mb-4 flex items-center gap-2 font-bold">
            <Plus className="h-5 w-5 text-green" /> {editingId ? 'Edit job' : 'Add a job'}
          </h2>
          <ErrorBox message={error} />
          <form onSubmit={create}>
            <FormField label="Job title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <div className="flex gap-4">
              <FormField label="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} required />
              <FormField label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
            </div>
            <FormField label="Salary (optional)" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} placeholder="₦150,000 – ₦250,000" />
            <div className="mb-4">
              <label className="mb-1.5 block text-sm font-semibold">Work mode</label>
              <select value={form.work_mode} onChange={(e) => setForm({ ...form, work_mode: e.target.value })} className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-[0.95rem] outline-none focus:border-green focus:ring-2 focus:ring-green/15">
                {WORK_MODES.map((w) => <option key={w.id} value={w.id}>{w.label}</option>)}
              </select>
            </div>
            <FormField label="Applications close (optional)" type="datetime-local" value={form.closes_at} onChange={(e) => setForm({ ...form, closes_at: e.target.value })} />
            <FormField label="Source link" value={form.source_link} onChange={(e) => setForm({ ...form, source_link: e.target.value })} placeholder="https://…" required />
            <FormField as="textarea" label="Public teaser" value={form.public_teaser} onChange={(e) => setForm({ ...form, public_teaser: e.target.value })} helperText="One-line blurb shown on the jobs list." required />
            <RichTextEditor
              label="Full job description (public)"
              value={form.description}
              onChange={(v) => setForm({ ...form, description: v })}
              helperText="Select text and use the buttons above (or Ctrl+B for bold) to format. Shown on the job's own public page."
              minHeight="min-h-[160px]"
            />
            <FormField as="textarea" label="Internal description" value={form.internal_description} onChange={(e) => setForm({ ...form, internal_description: e.target.value })} helperText="Private notes for writing the application. Never shown publicly." required />
            <Button type="submit" disabled={saving} fullWidth className="mt-2">
              {saving ? 'Saving…' : editingId ? 'Update job posting' : 'Add job posting'}
            </Button>
            {editingId && (
              <button type="button" onClick={cancelEdit} className="mt-2 w-full text-center text-sm text-muted hover:text-ink">
                Cancel edit
              </button>
            )}
          </form>
        </div>

        <div className="rounded-2xl border border-line bg-white p-6 shadow-soft">
          <h2 className="mb-4 flex items-center gap-2 font-bold">
            <Briefcase className="h-5 w-5 text-green" /> Postings ({jobs.length})
          </h2>
          {loading ? (
            <p className="text-sm text-muted">Loading…</p>
          ) : jobs.length === 0 ? (
            <p className="text-sm text-muted">No job postings yet.</p>
          ) : (
            <ul className="space-y-3">
              {jobs.map((j) => (
                <li key={j.id} className="rounded-xl border border-line p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 truncate font-semibold">
                        {j.title}
                        {j.filled && <span className="rounded-full bg-red-50 px-2 py-0.5 text-[0.6rem] font-bold uppercase text-red-600">Filled</span>}
                        {(j.closed || isExpired(j)) && <span className="rounded-full bg-ink/10 px-2 py-0.5 text-[0.6rem] font-bold uppercase text-ink">Closed</span>}
                        {isUrgent(j) && !j.closed && !j.filled && <span className="rounded-full bg-gold px-2 py-0.5 text-[0.6rem] font-bold uppercase text-white">Urgent</span>}
                      </p>
                      <p className="flex flex-wrap items-center gap-3 text-xs text-muted">
                        <span className="flex items-center gap-1"><Building2 className="h-3 w-3" /> {j.company}</span>
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {j.location}</span>
                        {j.work_mode && <span className="rounded-full bg-cream px-2 py-0.5 capitalize">{j.work_mode}</span>}
                      </p>
                      <p className="mt-1.5 line-clamp-2 text-sm text-muted">{j.public_teaser}</p>
                      <div className="mt-2 flex gap-4">
                        <button onClick={() => toggleFilled(j)} className="text-xs font-semibold text-green hover:underline">
                          {j.filled ? 'Unmark filled' : 'Mark role filled'}
                        </button>
                        <button onClick={() => toggleClosed(j)} className="text-xs font-semibold text-muted hover:text-ink hover:underline">
                          {j.closed ? 'Reopen applications' : 'Close applications'}
                        </button>
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <button onClick={() => edit(j)} className="rounded-lg p-2 text-muted hover:bg-green-light hover:text-green" aria-label="Edit">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => remove(j.id)} className="rounded-lg p-2 text-muted hover:bg-red-50 hover:text-red-600" aria-label="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
