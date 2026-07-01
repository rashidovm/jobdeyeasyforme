'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Profile, Subscription } from '@/types';
import { PLANS } from '@/lib/constants';

export default function ClientsPage() {
  const [clients, setClients] = useState<Profile[]>([]);
  const [subs, setSubs] = useState<Record<string, Subscription>>({});
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  useEffect(() => {
    (async () => {
      const { data: profs } = await supabase
        .from('profiles').select('*').eq('role', 'client').order('created_at', { ascending: false });
      const list = (profs as Profile[]) || [];
      setClients(list);

      const ids = list.map((p) => p.id);
      if (ids.length) {
        const { data: subData } = await supabase.from('subscriptions').select('*').in('user_id', ids);
        const map: Record<string, Subscription> = {};
        (subData as Subscription[])?.forEach((s) => {
          // keep the most recent per user
          if (!map[s.user_id] || new Date(s.started_at) > new Date(map[s.user_id].started_at)) {
            map[s.user_id] = s;
          }
        });
        setSubs(map);
      }
      setLoading(false);
    })();
  }, []);

  const filtered = clients.filter(
    (c) =>
      c.full_name?.toLowerCase().includes(q.toLowerCase()) ||
      c.email?.toLowerCase().includes(q.toLowerCase())
  );

  const planName = (tier?: string) => PLANS.find((p) => p.id === tier)?.name || tier || '—';

  return (
    <div>
      <h1 className="mb-1 text-2xl font-extrabold">Clients</h1>
      <p className="mb-6 text-sm text-muted">Everyone who signed up. Open a client to see their profile and manage applications.</p>

      <div className="mb-4 flex items-center gap-2 rounded-xl border border-line bg-white px-3 py-2 shadow-soft">
        <Search className="h-4 w-4 text-muted" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name or email"
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-soft">
        {loading ? (
          <div className="px-5 py-10 text-center text-sm text-muted">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-muted">No clients found.</div>
        ) : (
          <ul className="divide-y divide-line">
            {filtered.map((c) => {
              const sub = subs[c.id];
              return (
                <li key={c.id}>
                  <Link href={`/admin/clients/${c.id}`} className="flex items-center gap-3 px-5 py-3.5 hover:bg-cream">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green font-bold text-white">
                      {c.full_name?.charAt(0) || 'C'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{c.full_name || 'Unnamed'}</p>
                      <p className="truncate text-xs text-muted">{c.email}</p>
                    </div>
                    <div className="hidden text-right sm:block">
                      <p className="text-xs font-semibold">{planName(sub?.tier)}</p>
                      {sub && (
                        <p className="text-xs text-muted">
                          {sub.applications_used}/{sub.applications_limit} used
                        </p>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
