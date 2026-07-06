'use client';

import React, { useEffect, useState } from 'react';
import { LifeBuoy, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Ticket, Profile } from '@/types';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/cn';

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'open' | 'all'>('open');

  const load = async () => {
    const { data } = await supabase.from('tickets').select('*').order('created_at', { ascending: false });
    const list = (data as Ticket[]) || [];
    setTickets(list);
    const ids = Array.from(new Set(list.map((t) => t.user_id)));
    if (ids.length) {
      const { data: profs } = await supabase.from('profiles').select('id, full_name, email').in('id', ids);
      const map: Record<string, string> = {};
      (profs as Profile[])?.forEach((p) => (map[p.id] = p.full_name || p.email));
      setNames(map);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const reply = async (t: Ticket, close: boolean) => {
    const response = drafts[t.id] ?? t.response ?? '';
    await supabase.from('tickets').update({
      response: response || null,
      status: close ? 'closed' : t.status,
      updated_at: new Date().toISOString(),
    }).eq('id', t.id);
    load();
  };

  const setStatus = async (t: Ticket, status: string) => {
    await supabase.from('tickets').update({ status }).eq('id', t.id);
    load();
  };

  const shown = tickets.filter((t) => filter === 'all' || t.status === 'open');

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-extrabold"><LifeBuoy className="h-6 w-6 text-green" /> Support tickets</h1>
          <p className="text-sm text-muted">Questions and issues raised by job seekers.</p>
        </div>
        <div className="flex gap-2">
          {(['open', 'all'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={cn('rounded-full px-3 py-1.5 text-sm font-semibold capitalize', filter === f ? 'bg-green text-white' : 'border border-line text-muted')}>{f}</button>
          ))}
        </div>
      </div>

      {loading ? <p className="text-muted">Loading…</p> : shown.length === 0 ? (
        <div className="rounded-2xl border border-line bg-white p-10 text-center text-sm text-muted shadow-soft">No {filter === 'open' ? 'open ' : ''}tickets.</div>
      ) : (
        <div className="space-y-4">
          {shown.map((t) => (
            <div key={t.id} className="rounded-2xl border border-line bg-white p-5 shadow-soft">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div>
                  <p className="font-bold">{t.subject}</p>
                  <p className="text-xs text-muted">{names[t.user_id] || 'Job seeker'} · {new Date(t.created_at).toLocaleString()}</p>
                </div>
                <span className={cn('rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold uppercase', t.status === 'open' ? 'bg-gold-light text-gold' : 'bg-green-light text-green')}>{t.status}</span>
              </div>
              <p className="mb-3 rounded-xl bg-cream p-3 text-sm text-ink">{t.body}</p>

              <textarea
                value={drafts[t.id] ?? t.response ?? ''}
                onChange={(e) => setDrafts({ ...drafts, [t.id]: e.target.value })}
                placeholder="Write a reply…"
                rows={2}
                className="w-full rounded-xl border border-line px-3 py-2 text-sm outline-none focus:border-green"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                <Button size="sm" variant="secondary" onClick={() => reply(t, false)}>Save reply</Button>
                {t.status === 'open'
                  ? <Button size="sm" onClick={() => reply(t, true)}><Check className="h-4 w-4" /> Reply &amp; close</Button>
                  : <Button size="sm" variant="secondary" onClick={() => setStatus(t, 'open')}>Reopen</Button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
