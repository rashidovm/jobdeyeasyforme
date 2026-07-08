'use client';

import React, { useEffect, useState } from 'react';
import { UserPlus, Mail, Copy, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAdmin } from '@/lib/adminContext';
import { Profile } from '@/types';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import ErrorBox from '@/components/ui/ErrorBox';
import { cn } from '@/lib/cn';

export default function StaffPage() {
  const { profile } = useAdmin();
  const [staff, setStaff] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [created, setCreated] = useState<{ email: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const loadStaff = async () => {
    const { data } = await supabase
      .from('profiles').select('*').eq('role', 'staff').order('created_at', { ascending: false });
    setStaff((data as Profile[]) || []);
    setLoading(false);
  };

  const toggleCanPost = async (s: Profile) => {
    await supabase.from('profiles').update({ can_post_jobs: !s.can_post_jobs }).eq('id', s.id);
    loadStaff();
  };

  const toggleCanPostBlog = async (s: Profile) => {
    await supabase.from('profiles').update({ can_post_blog: !s.can_post_blog }).eq('id', s.id);
    loadStaff();
  };

  useEffect(() => { loadStaff(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCreated(null);
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch('/api/admin/create-staff', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token || ''}`,
      },
      body: JSON.stringify({ full_name: fullName, email, password }),
    });
    const json = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(json.error || 'Could not create staff account.');
      return;
    }
    setCreated({ email, password });
    setFullName('');
    setEmail('');
    setPassword('');
    loadStaff();
  };

  const copyDetails = () => {
    if (!created) return;
    navigator.clipboard.writeText(
      `JobDeyEasy staff login\nURL: ${window.location.origin}/login\nEmail: ${created.email}\nPassword: ${created.password}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (profile?.role !== 'admin') {
    return <div className="text-muted">Admins only.</div>;
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-extrabold">Staff</h1>
      <p className="mb-6 text-sm text-muted">Create logins for the people who source, write, and check applications.</p>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Create form */}
        <div className="rounded-2xl border border-line bg-white p-6 shadow-soft">
          <h2 className="mb-4 flex items-center gap-2 font-bold">
            <UserPlus className="h-5 w-5 text-green" /> Add a staff member
          </h2>

          {created && (
            <div className="mb-4 rounded-xl border border-green/30 bg-green-light p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-green">
                <CheckCircle2 className="h-4 w-4" /> Account created
              </p>
              <p className="mt-2 text-sm text-ink">
                Share these login details with them (they can sign in right away — no email confirmation needed):
              </p>
              <div className="mt-2 rounded-lg bg-white p-3 text-sm">
                <div><span className="text-muted">Email:</span> <strong>{created.email}</strong></div>
                <div><span className="text-muted">Password:</span> <strong>{created.password}</strong></div>
              </div>
              <button onClick={copyDetails} className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-green">
                {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied' : 'Copy login details'}
              </button>
            </div>
          )}

          <ErrorBox message={error} />
          <form onSubmit={handleCreate}>
            <FormField label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            <FormField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <FormField label="Temporary password" type="text" value={password} onChange={(e) => setPassword(e.target.value)} required helperText="At least 8 characters. Share it with them; they can change it later." />
            <Button type="submit" disabled={saving} fullWidth className="mt-2">
              {saving ? 'Creating…' : 'Create staff login'}
            </Button>
          </form>
        </div>

        {/* Staff list */}
        <div className="rounded-2xl border border-line bg-white p-6 shadow-soft">
          <h2 className="mb-4 font-bold">Current staff ({staff.length})</h2>
          {loading ? (
            <p className="text-sm text-muted">Loading…</p>
          ) : staff.length === 0 ? (
            <p className="text-sm text-muted">No staff yet. Add your first team member on the left.</p>
          ) : (
            <ul className="divide-y divide-line">
              {staff.map((s) => (
                <li key={s.id} className="flex items-center gap-3 py-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green font-bold text-white">
                    {s.full_name?.charAt(0) || 'S'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{s.full_name}</p>
                    <p className="flex items-center gap-1 truncate text-xs text-muted">
                      <Mail className="h-3 w-3" /> {s.email}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleCanPost(s)}
                    className={cn('rounded-full px-3 py-1 text-xs font-semibold transition-colors',
                      s.can_post_jobs ? 'bg-green text-white' : 'border border-line text-muted hover:border-green')}
                  >
                    {s.can_post_jobs ? 'Can post jobs' : 'Enable job posting'}
                  </button>
                  <button
                    onClick={() => toggleCanPostBlog(s)}
                    className={cn('rounded-full px-3 py-1 text-xs font-semibold transition-colors',
                      s.can_post_blog ? 'bg-gold text-white' : 'border border-line text-muted hover:border-gold')}
                  >
                    {s.can_post_blog ? 'Can write blog' : 'Enable blog'}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
