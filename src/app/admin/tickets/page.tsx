'use client';

import React, { useEffect, useState } from 'react';
import { LifeBuoy, Check, Send, RotateCcw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAdmin } from '@/lib/adminContext';
import { Ticket, TicketMessage, Profile } from '@/types';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/cn';

export default function TicketsPage() {
  const { profile: me } = useAdmin();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'open' | 'all'>('open');
  const [creating, setCreating] = useState(false);
  const [subj, setSubj] = useState('');
  const [bodyText, setBodyText] = useState('');

  const createTicket = async () => {
    if (!me || !subj.trim() || !bodyText.trim()) return;
    await supabase.from('tickets').insert({ user_id: me.id, subject: subj.trim(), body: bodyText.trim(), assigned_to: me.id });
    setSubj(''); setBodyText(''); setCreating(false); load();
  };

  const load = async () => {
    const { data } = await supabase.from('tickets').select('*').order('created_at', { ascending: false });
    const list = (data as Ticket[]) || [];
    setTickets(list);
    const ids = Array.from(new Set([
      ...list.map((t) => t.user_id),
      ...list.map((t) => t.assigned_to).filter(Boolean) as string[],
    ]));
    if (ids.length) {
      const { data: profs } = await supabase.from('profiles').select('id, full_name, email').in('id', ids);
      const map: Record<string, string> = {};
      (profs as Profile[])?.forEach((p) => (map[p.id] = p.full_name || p.email));
      setNames(map);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const isAdmin = me?.role === 'admin';

  const setStatus = async (t: Ticket, status: string) => {
    await supabase.from('tickets').update({ status, updated_at: new Date().toISOString() }).eq('id', t.id);
    load();
  };

  const shown = tickets.filter((t) => filter === 'all' || t.status === 'open');

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-extrabold"><LifeBuoy className="h-6 w-6 text-green" /> Support tickets</h1>
          <p className="text-sm text-muted">Reply back and forth, then close the ticket when it&apos;s resolved.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setCreating((v) => !v)} className="rounded-full bg-green px-3 py-1.5 text-sm font-semibold text-white">+ New ticket</button>
          {(['open', 'all'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={cn('rounded-full px-3 py-1.5 text-sm font-semibold capitalize', filter === f ? 'bg-green text-white' : 'border border-line text-muted')}>{f}</button>
          ))}
        </div>
      </div>

      {creating && (
        <div className="mb-5 space-y-2 rounded-2xl border border-line bg-white p-4 shadow-soft">
          <input value={subj} onChange={(e) => setSubj(e.target.value)} placeholder="Subject" className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-green" />
          <textarea value={bodyText} onChange={(e) => setBodyText(e.target.value)} rows={3} placeholder="Describe the issue…" className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-green" />
          <div className="flex gap-2">
            <Button size="sm" onClick={createTicket}>Create ticket</Button>
            <button onClick={() => setCreating(false)} className="text-sm text-muted hover:text-ink">Cancel</button>
          </div>
        </div>
      )}

      {loading ? <p className="text-muted">Loading…</p> : shown.length === 0 ? (
        <div className="rounded-2xl border border-line bg-white p-10 text-center text-sm text-muted shadow-soft">No {filter === 'open' ? 'open ' : ''}tickets.</div>
      ) : (
        <div className="space-y-4">
          {shown.map((t) => (
            <AdminTicketThread key={t.id} ticket={t} me={me} isAdmin={isAdmin} name={names[t.user_id] || 'Job seeker'} handlerName={t.assigned_to ? names[t.assigned_to] : null} onStatus={setStatus} onReload={load} />
          ))}
        </div>
      )}
    </div>
  );
}

function AdminTicketThread({ ticket, me, isAdmin, name, handlerName, onStatus, onReload }: { ticket: Ticket; me: Profile | null; isAdmin: boolean; name: string; handlerName: string | null; onStatus: (t: Ticket, s: string) => void; onReload: () => void }) {
  const [thread, setThread] = useState<TicketMessage[]>([]);
  const [reply, setReply] = useState('');
  const [loaded, setLoaded] = useState(false);

  const loadThread = async () => {
    const { data } = await supabase.from('ticket_messages').select('*').eq('ticket_id', ticket.id).order('created_at', { ascending: true });
    setThread((data as TicketMessage[]) || []);
    setLoaded(true);
  };
  useEffect(() => { loadThread(); /* eslint-disable-next-line */ }, [ticket.id]);

  const send = async () => {
    const b = reply.trim(); if (!b || !me) return;
    const { error } = await supabase.from('ticket_messages').insert({ ticket_id: ticket.id, sender_id: me.id, sender_role: me.role, sender_name: me.full_name, body: b });
    if (!error) {
      // Claim the ticket for whoever first replies
      if (!ticket.assigned_to) { await supabase.from('tickets').update({ assigned_to: me.id }).eq('id', ticket.id); onReload(); }
      setReply(''); loadThread();
    }
  };

  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-soft">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div>
          <p className="font-bold">{ticket.subject}</p>
          <p className="text-xs text-muted">
            {name} · {new Date(ticket.created_at).toLocaleString()}
            {handlerName && <> · <span className="font-semibold text-green">Handled by {handlerName}</span></>}
          </p>
        </div>
        <span className={cn('rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold uppercase', ticket.status === 'open' ? 'bg-gold-light text-gold' : 'bg-green-light text-green')}>{ticket.status}</span>
      </div>

      <div className="mb-3 rounded-xl bg-cream p-3 text-sm text-ink">{ticket.body}</div>

      <div className="space-y-2">
        {loaded && thread.map((m) => {
          const fromTeam = m.sender_role !== 'client';
          return (
            <div key={m.id} className={cn('max-w-[85%] rounded-2xl px-3 py-2 text-sm', fromTeam ? 'ml-auto rounded-br-md bg-green-light text-green-dark' : 'mr-auto rounded-bl-md bg-paper text-ink')}>
              <p className="text-[0.62rem] font-bold uppercase text-gold">{fromTeam ? (m.sender_name || 'Support') : 'Job seeker'}</p>
              <p className="whitespace-pre-wrap">{m.body}</p>
            </div>
          );
        })}
      </div>

      {ticket.status === 'open' ? (
        <>
          <div className="mt-3 flex gap-2">
            <input value={reply} onChange={(e) => setReply(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); send(); } }} placeholder="Type a reply…" className="w-full rounded-full border border-line px-3 py-2 text-sm outline-none focus:border-green" />
            <Button size="sm" onClick={send}><Send className="h-4 w-4" /></Button>
          </div>
          {isAdmin && (
            <div className="mt-2 flex justify-end">
              <button onClick={() => onStatus(ticket, 'closed')} className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-muted hover:border-green hover:text-green">
                <Check className="h-3.5 w-3.5" /> Close ticket
              </button>
            </div>
          )}
          {!isAdmin && <p className="mt-2 text-right text-xs text-muted">Only an admin can close a ticket.</p>}
        </>
      ) : (
        <div className="mt-3 flex items-center justify-between">
          <p className="text-xs text-muted">This ticket is closed.</p>
          {isAdmin && (
            <button onClick={() => onStatus(ticket, 'open')} className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-muted hover:border-green hover:text-green">
              <RotateCcw className="h-3.5 w-3.5" /> Reopen
            </button>
          )}
        </div>
      )}
    </div>
  );
}
