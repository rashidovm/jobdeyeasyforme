'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Users, UserCog, Briefcase, LogOut, ShieldCheck,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { AdminContext } from '@/lib/adminContext';
import { Profile } from '@/types';
import Logo from '@/components/ui/Logo';
import { cn } from '@/lib/cn';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/login?next=/admin');
        return;
      }
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (!p || (p.role !== 'admin' && p.role !== 'staff')) {
        router.replace('/dashboard');
        return;
      }
      setProfile(p as Profile);
      setLoading(false);
    })();
  }, [router]);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.replace('/');
  };

  if (loading || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream text-muted">
        <span className="mr-3 h-4 w-4 animate-spin rounded-full border-2 border-green border-t-transparent" />
        Loading…
      </div>
    );
  }

  const isAdmin = profile.role === 'admin';
  const nav = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, show: true },
    { href: '/admin/clients', label: 'Job seekers', icon: Users, show: true },
    { href: '/admin/staff', label: 'Staff', icon: UserCog, show: isAdmin },
    { href: '/admin/jobs', label: 'Job postings', icon: Briefcase, show: isAdmin },
  ].filter((n) => n.show);

  return (
    <AdminContext.Provider value={{ profile }}>
      <div className="min-h-screen bg-paper">
        {/* Sidebar (desktop) */}
        <aside className="fixed left-0 top-0 hidden h-screen w-[240px] flex-col gap-6 border-r border-line bg-white p-5 lg:flex">
          <Logo />
          <div className="flex items-center gap-2 rounded-xl bg-green-light px-3 py-2 text-xs font-semibold text-green">
            <ShieldCheck className="h-4 w-4" />
            {isAdmin ? 'Admin' : 'Staff'} · {profile.full_name}
          </div>
          <nav className="flex flex-col gap-1">
            {nav.map((n) => {
              const active = pathname === n.href || (n.href !== '/admin' && pathname.startsWith(n.href));
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                    active ? 'bg-green text-white' : 'text-muted hover:bg-black/5 hover:text-ink'
                  )}
                >
                  <n.icon className="h-4 w-4" /> {n.label}
                </Link>
              );
            })}
          </nav>
          <button
            onClick={signOut}
            className="mt-auto flex items-center gap-2 rounded-xl border border-line px-3 py-2.5 text-sm text-muted transition-colors hover:bg-black/5"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </aside>

        {/* Mobile top bar */}
        <div className="sticky top-0 z-40 flex items-center justify-between border-b border-line bg-white px-4 py-3 lg:hidden">
          <Logo />
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-green-light px-2.5 py-1 text-xs font-semibold text-green">
              {isAdmin ? 'Admin' : 'Staff'}
            </span>
            <button onClick={signOut} className="rounded-lg border border-line p-2 text-muted">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <nav className="sticky top-[57px] z-30 flex gap-1 overflow-x-auto border-b border-line bg-white px-3 py-2 lg:hidden">
          {nav.map((n) => {
            const active = pathname === n.href || (n.href !== '/admin' && pathname.startsWith(n.href));
            return (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  'flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium',
                  active ? 'bg-green text-white' : 'text-muted'
                )}
              >
                <n.icon className="h-4 w-4" /> {n.label}
              </Link>
            );
          })}
        </nav>

        <main className="px-4 py-6 lg:ml-[240px] lg:px-8 lg:py-8">{children}</main>
      </div>
    </AdminContext.Provider>
  );
}
