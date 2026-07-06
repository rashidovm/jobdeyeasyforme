'use client';

import React, { useEffect, useState } from 'react';
import { Briefcase, Plus, MapPin, Building2, Trash2, Pencil } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAdmin } from '@/lib/adminContext';
import { JobPosting } from '@/types';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import ErrorBox from '@/components/ui/ErrorBox';

const EMPTY = {
  title: '', company: '', location: '', salary: '',
  source_link: '', public_teaser: '', internal_description: '',
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
    const payload = { ...form, salary: form.salary || null };
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
      source_link: j.source_link, public_teaser: j.public_teaser, internal_description: j.internal_description,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => { setEditingId(null); setForm({ ...EMPTY }); };

  const remove = async (id: string) => {
    if (!confirm('Delete this job posting?')) return;
    await supabase.from('job_postings').delete().eq('id', id);
    load();
  };

  if (profile?.role !== 'admin') return <div className="text-muted">Admins only.</div>;

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
            <FormField label="Source link" value={form.source_link} onChange={(e) => setForm({ ...form, source_link: e.target.value })} placeholder="https://…" required />
            <FormField as="textarea" label="Public teaser" value={form.public_teaser} onChange={(e) => setForm({ ...form, public_teaser: e.target.value })} helperText="Short blurb shown on the public jobs page." required />
            <FormField as="textarea" label="Internal description" value={form.internal_description} onChange={(e) => setForm({ ...form, internal_description: e.target.value })} helperText="Full details your staff use to write the application." required />
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
                      <p className="truncate font-semibold">{j.title}</p>
                      <p className="flex items-center gap-3 text-xs text-muted">
                        <span className="flex items-center gap-1"><Building2 className="h-3 w-3" /> {j.company}</span>
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {j.location}</span>
                      </p>
                      <p className="mt-1.5 line-clamp-2 text-sm text-muted">{j.public_teaser}</p>
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
