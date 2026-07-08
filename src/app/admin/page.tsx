'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, FileText, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAdmin } from '@/lib/adminContext';
import { Application, Profile } from '@/types';
import { STATUS_MAP } from '@/lib/constants';
import { cn } from '@/lib/cn';

export default function AdminDashboard() {
  const { profile } = useAdmin();
  const isAdmin = profile?.role === 'admin';
  const [loading, setLoading] = useState(true);
  const [apps, setApps] = useState<Application[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [counts, setCounts] = useState({ clients: 0, staff: 0 });

  useEffect(() => {
    (async () => {
      if (!profile) return;

      let query = supabase
        .from('applications')
        .select('*, job_postings(*)')
        .order('created_at', { ascending: false });
      if (!isAdmin) query = query.eq('assigned_to', profile.id);
      const { data: appData } = await query;
      const list = (appData as Application[]) || [];
      setApps(list);

      // Resolve client names for the applications shown.
      const ids = Array.from(new Set(list.map((a) => a.user_id)));
      if (ids.length) {
        const { data: profs } = await supabase.from('profiles').select('id, full_name').in('id', ids);
        const map: Record<string, string> = {};
        (profs as Profile[])?.forEach((p) => (map[p.id] = p.full_name));
        setNames(map);
      }

      if (isAdmin) {
        const { count: clients } = await supabase
          .from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'client');
        const { count: staff } = await supabase
          .from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'staff');
        setCounts({ clients: clients || 0, staff: staff || 0 });
      }
      setLoading(false);
    })();
  }, [profile, isAdmin]);

  if (loading) {
    return <div className="text-muted">Loading…</div>;
  }

  const openCount = apps.filter((a) => !['sent_to_client', 'client_applied', 'interview', 'offer', 'rejected'].includes(a.status)).length;
  const deliveredCount = apps.filter((a) => ['sent_to_client', 'client_applied', 'interview', 'offer', 'rejected'].includes(a.status)).length;

  const tiles = isAdmin
    ? [
        { label: 'Clients', value: counts.clients, icon: Users },
        { label: 'Staff', value: counts.staff, icon: Users },
        { label: 'Open applications', value: openCount, icon: Clock },
        { label: 'Delivered', value: deliveredCount, icon: CheckCircle2 },
      ]
    : [
        { label: 'Assigned to me', value: apps.length, icon: FileText },
        { label: 'Still open', value: openCount, icon: Clock },
        { label: 'Delivered', value: deliveredCount, icon: CheckCircle2 },
      ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">{isAdmin ? 'Operations overview' : 'My work queue'}</h1>
          <p className="text-sm text-muted">
            {isAdmin ? 'Everything happening across JobDeyEasy.' : 'Applications assigned to you.'}
          </p>
        </div>
      </div>

      <div className={cn('mb-8 grid gap-4', isAdmin ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-3')}>
        {tiles.map((t) => (
          <div key={t.label} className="rounded-2xl border border-line bg-white p-5 shadow-soft">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
              <t.icon className="h-4 w-4" /> {t.label}
            </div>
            <div className="mt-2 text-3xl font-extrabold">{t.value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-line bg-white shadow-soft">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-bold">{isAdmin ? 'Recent applications' : 'My applications'}</h2>
          {isAdmin && (
            <Link href="/admin/clients" className="inline-flex items-center gap-1 text-sm font-semibold text-green">
              All job seekers <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        {apps.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-muted">
            No applications yet.{isAdmin && ' Create one from a client\u2019s page.'}
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {apps.slice(0, 12).map((app) => {
              const s = STATUS_MAP[app.status] ?? { label: app.status || 'Unknown', color: '#4B5563', bg: '#F3F4F6', icon: 'Hourglass' };
              const overdue = app.due_at && new Date(app.due_at) < new Date() &&
                !['sent_to_client', 'client_applied', 'interview', 'offer', 'rejected'].includes(app.status);
              return (
                <li key={app.id}>
                  <Link href={`/admin/applications/${app.id}`} className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-cream">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {app.job_postings?.title || 'Application'}
                        <span className="font-normal text-muted"> · {names[app.user_id] || 'Client'}</span>
                      </p>
                      <p className="truncate text-xs text-muted">
                        {app.job_postings?.company}
                        {app.due_at && (
                          <span className={cn('ml-2', overdue ? 'font-semibold text-red-600' : '')}>
                            · due {new Date(app.due_at).toLocaleDateString()}
                          </span>
                        )}
                      </p>
                    </div>
                    <span
                      className="shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold"
                      style={{ backgroundColor: s.bg, color: s.color }}
                    >
                      {s.label}
                    </span>
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
