'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles, Check, X, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Testimonial } from '@/types';
import Button from '@/components/ui/Button';
import { prettyDate } from '@/lib/dates';
import { cn } from '@/lib/cn';

export default function AdminTestimonialsPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'all'>('pending');
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const load = async () => {
    const { data } = await supabase.from('testimonials').select('*').order('created_at', { ascending: false });
    setItems((data as Testimonial[]) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const approve = async (t: Testimonial) => {
    const message = drafts[t.id] ?? t.message ?? '';
    await supabase.from('testimonials').update({ message, approved: true }).eq('id', t.id);
    load();
  };
  const unapprove = async (t: Testimonial) => {
    await supabase.from('testimonials').update({ approved: false }).eq('id', t.id);
    load();
  };
  const remove = async (id: string) => {
    if (!confirm('Delete this testimonial permanently?')) return;
    await supabase.from('testimonials').delete().eq('id', id);
    load();
  };

  const shown = items.filter((t) => filter === 'all' || (filter === 'approved' ? t.approved : !t.approved));

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-extrabold"><Sparkles className="h-6 w-6 text-gold" /> Wins &amp; testimonials</h1>
          <p className="text-sm text-muted">Auto-drafted whenever a seeker confirms an employer got back to them. Approve to show on the homepage.</p>
        </div>
        <div className="flex gap-2">
          {(['pending', 'approved', 'all'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={cn('rounded-full px-3 py-1.5 text-sm font-semibold capitalize', filter === f ? 'bg-green text-white' : 'border border-line text-muted')}>{f}</button>
          ))}
        </div>
      </div>

      {loading ? <p className="text-muted">Loading…</p> : shown.length === 0 ? (
        <div className="rounded-2xl border border-line bg-white p-10 text-center text-sm text-muted shadow-soft">No {filter !== 'all' ? filter : ''} wins yet.</div>
      ) : (
        <div className="space-y-4">
          {shown.map((t) => (
            <div key={t.id} className="rounded-2xl border border-line bg-white p-5 shadow-soft">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div>
                  <p className="font-bold">{t.seeker_name || 'A job seeker'}</p>
                  <p className="text-xs text-muted">{t.job_title}{t.company ? ` · ${t.company}` : ''} · {prettyDate(t.created_at)}</p>
                </div>
                <span className={cn('rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold uppercase', t.approved ? 'bg-green-light text-green' : 'bg-gold-light text-gold')}>{t.approved ? 'Live' : 'Pending'}</span>
              </div>
              <textarea
                value={drafts[t.id] ?? t.message ?? ''}
                onChange={(e) => setDrafts({ ...drafts, [t.id]: e.target.value })}
                rows={2}
                className="w-full rounded-xl border border-line px-3 py-2 text-sm outline-none focus:border-green"
              />
              <p className="mt-1 text-xs text-muted">Edit the wording if you like — this is what shows publicly (first name only is safest).</p>
              <div className="mt-3 flex gap-2">
                {!t.approved
                  ? <Button size="sm" onClick={() => approve(t)}><Check className="h-4 w-4" /> Approve &amp; show</Button>
                  : <Button size="sm" variant="secondary" onClick={() => unapprove(t)}><X className="h-4 w-4" /> Unpublish</Button>}
                <button onClick={() => remove(t.id)} className="rounded-lg p-2 text-muted hover:bg-red-50 hover:text-red-600" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
