'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText, UserRound, ArrowUpCircle, MessageCircle, LogOut, Rocket, Mail, Send,
  Hourglass, PenLine, Eye, CheckCircle2, Inbox, PartyPopper, Trophy, XCircle,
} from 'lucide-react';
import { supabase, buildWhatsappLink } from '@/lib/supabase';
import { Profile, Subscription, Application } from '@/types';
import { STATUS_MAP, PLANS } from '@/lib/constants';
import Logo from '@/components/ui/Logo';
import Button from '@/components/ui/Button';
import ErrorBox from '@/components/ui/ErrorBox';
import { cn } from '@/lib/cn';

const STATUS_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Hourglass, PenLine, Eye, CheckCircle2, Inbox, Rocket, PartyPopper, Trophy, XCircle,
};

type Tab = 'apps' | 'profile' | 'upgrade';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [tab, setTab] = useState<Tab>('apps');
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: roleRow } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
      if (roleRow && (roleRow.role === 'admin' || roleRow.role === 'staff')) {
        router.replace('/admin');
        return;
      }

      const { data: materials } = await supabase
        .from('client_materials').select('id').eq('user_id', user.id).maybeSingle();
      if (!materials) {
        router.push('/onboarding');
        return;
      }

      try {
        const { data: profileData, error: profileErr } = await supabase
          .from('profiles').select('*').eq('id', user.id).single();
        if (profileErr) throw profileErr;
        setProfile(profileData);

        const { data: subData, error: subErr } = await supabase
          .from('subscriptions').select('*').eq('user_id', user.id)
          .order('created_at', { ascending: false }).limit(1).single();
        if (subErr) throw subErr;
        setSubscription(subData);

        const { data: appData, error: appErr } = await supabase
          .from('applications').select('*, job_postings(*)').eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (appErr) throw appErr;
        setApplications(appData || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream text-muted">
        <span className="mr-3 h-4 w-4 animate-spin rounded-full border-2 border-green border-t-transparent" />
        Loading…
      </div>
    );
  }

  const limit = subscription?.applications_limit || 0;
  const used = subscription?.applications_used || 0;
  const usagePct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;
  const currentPlan = PLANS.find((p) => p.id === subscription?.tier);
  const upgradePlans = PLANS.filter((p) => p.price > (currentPlan?.price || 0));

  const navItems: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'apps', label: 'My Applications', icon: FileText },
    { id: 'profile', label: 'My Profile', icon: UserRound },
    { id: 'upgrade', label: 'Upgrade Plan', icon: ArrowUpCircle },
  ];

  return (
    <div className="min-h-screen bg-cream">
      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 hidden h-screen w-[260px] flex-col gap-6 bg-ink p-6 text-white md:flex">
        <div className="rounded-xl bg-white/10 p-2">
          <Logo invert />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green font-extrabold">
            {profile?.full_name?.charAt(0) || 'U'}
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold">{profile?.full_name}</p>
            <p className="text-xs text-white/50">{currentPlan?.name}</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                tab === item.id ? 'bg-green text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'
              )}
            >
              <item.icon className="h-4 w-4" /> {item.label}
            </button>
          ))}
        </nav>

        <a
          href={buildWhatsappLink('Hi JobDeyEasy team!')}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-whatsapp hover:brightness-110"
        >
          <MessageCircle className="h-4 w-4" /> Message us
        </a>

        <div className="mt-auto">
          <p className="mb-1.5 text-xs text-white/50">Applications used: {used} / {limit}</p>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-green" style={{ width: `${usagePct}%` }} />
          </div>
          <button
            onClick={handleSignOut}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 py-2 text-xs text-white/70 transition-colors hover:bg-white/5"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between bg-ink px-5 py-3.5 text-white md:hidden">
        <Logo invert />
        <button onClick={handleSignOut} className="flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white/70">
          <LogOut className="h-3.5 w-3.5" /> Sign out
        </button>
      </div>

      {/* Main */}
      <main className="mx-auto max-w-3xl px-5 pb-28 pt-8 md:ml-[260px] md:px-10 md:pb-10">
        <ErrorBox message={error} />

        {tab === 'apps' && (
          <div>
            <h1 className="mb-6 text-2xl font-extrabold">My Applications</h1>
            {applications.length === 0 ? (
              <div className="rounded-2xl border border-line bg-white p-10 text-center shadow-soft">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cream text-gold">
                  <Hourglass className="h-7 w-7" />
                </div>
                <h3 className="mt-4 text-lg font-bold">The team is on it</h3>
                <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted">
                  We&apos;re sourcing the best jobs for you. Your first application will appear here soon.
                </p>
                <div className="mt-6 flex justify-center">
                  <Button href={buildWhatsappLink('Hi! Just checking in on my first application.')} variant="whatsapp">
                    <MessageCircle className="h-4 w-4" /> Check in on WhatsApp
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {applications.map((app) => {
                  const status = STATUS_MAP[app.status];
                  const StatusIcon = STATUS_ICONS[status.icon] ?? Hourglass;
                  const trackerSteps = [
                    { label: 'CV Ready', done: !!app.tailored_cv_url },
                    { label: 'Cover Letter', done: !!app.tailored_cover_letter_url },
                    { label: 'Human Reviewed', done: ['human_review', 'ready', 'sent_to_client', 'client_applied', 'interview', 'offer', 'rejected'].includes(app.status) },
                    { label: 'Delivered', done: ['ready', 'sent_to_client', 'client_applied', 'interview', 'offer', 'rejected'].includes(app.status) },
                  ];
                  return (
                    <div key={app.id} className="rounded-2xl border border-line bg-white p-6 shadow-soft">
                      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="font-bold">{app.job_postings?.title || 'Job Title'}</h3>
                          <p className="text-sm text-muted">
                            {app.job_postings?.company} · {app.job_postings?.location}
                          </p>
                        </div>
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
                          style={{ backgroundColor: status.bg, color: status.color }}
                        >
                          <StatusIcon className="h-3.5 w-3.5" /> {status.label}
                        </span>
                      </div>

                      {/* Tracker */}
                      <div className="relative mb-5 flex justify-between">
                        <div className="absolute left-0 right-0 top-3 h-0.5 bg-line" />
                        {trackerSteps.map((step, i) => (
                          <div key={i} className="relative z-10 flex flex-1 flex-col items-center gap-1.5">
                            <div
                              className={cn(
                                'flex h-6 w-6 items-center justify-center rounded-full border-2 text-[0.65rem] font-bold',
                                step.done ? 'border-green bg-green text-white' : 'border-line bg-white text-muted'
                              )}
                            >
                              {step.done ? '✓' : i + 1}
                            </div>
                            <span className={cn('text-center text-[0.68rem]', step.done ? 'text-ink' : 'text-muted')}>
                              {step.label}
                            </span>
                          </div>
                        ))}
                      </div>

                      {app.why_picked && app.why_picked.length > 0 && (
                        <div className="mb-4 rounded-xl border-l-[3px] border-gold bg-gold-light p-3.5">
                          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-gold">Why we picked this job</p>
                          <ul className="list-disc pl-5 text-sm text-ink">
                            {app.why_picked.map((reason, i) => <li key={i}>{reason}</li>)}
                          </ul>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2.5">
                        {app.tailored_cv_url && (
                          <Button href={app.tailored_cv_url} variant="secondary" size="sm">
                            <FileText className="h-4 w-4" /> Tailored CV
                          </Button>
                        )}
                        {app.tailored_cover_letter_url && (
                          <Button href={app.tailored_cover_letter_url} variant="secondary" size="sm">
                            <Mail className="h-4 w-4" /> Cover Letter
                          </Button>
                        )}
                        {app.apply_to_email_or_link && (
                          <Button
                            href={app.apply_to_email_or_link.startsWith('http') ? app.apply_to_email_or_link : `mailto:${app.apply_to_email_or_link}`}
                            size="sm"
                          >
                            <Send className="h-4 w-4" /> Send your application
                          </Button>
                        )}
                      </div>

                      {app.client_outcome && (
                        <div className="mt-4 border-t border-line pt-4 text-sm">
                          <strong>Outcome:</strong> {app.client_outcome.replace('_', ' ')}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {tab === 'profile' && (
          <div>
            <h1 className="mb-6 text-2xl font-extrabold">My Profile</h1>
            <div className="mb-4 rounded-2xl border border-line bg-white p-6 shadow-soft">
              <h3 className="mb-4 font-bold">Account details</h3>
              <dl className="space-y-2 text-sm">
                <Row label="Name" value={profile?.full_name} />
                <Row label="Email" value={profile?.email} />
                <Row label="Delivery channel" value={profile?.preferred_delivery_channel || 'email'} />
              </dl>
            </div>

            <div className="mb-6 rounded-2xl border border-line bg-white p-6 shadow-soft">
              <h3 className="mb-4 font-bold">Subscription</h3>
              <dl className="space-y-2 text-sm">
                <Row label="Plan" value={currentPlan?.name} />
                <Row label="Status" value={subscription?.status} capitalize />
                <Row label="Applications" value={`${used} / ${limit}`} />
                {subscription?.renews_at && (
                  <Row label="Renews" value={new Date(subscription.renews_at).toLocaleDateString()} />
                )}
              </dl>
            </div>

            <div className="rounded-2xl bg-green-light p-5 text-center">
              <p className="mb-3 text-sm text-green-dark">
                Need to update your CV or contact info? We handle edits manually for now.
              </p>
              <div className="flex justify-center">
                <Button href={buildWhatsappLink('Hi! I need to update my profile details.')} variant="whatsapp">
                  <MessageCircle className="h-4 w-4" /> Message us to update
                </Button>
              </div>
            </div>
          </div>
        )}

        {tab === 'upgrade' && (
          <div>
            <h1 className="mb-6 text-2xl font-extrabold">Upgrade Plan</h1>
            {upgradePlans.length === 0 ? (
              <div className="rounded-2xl border border-line bg-white p-8 text-center text-muted shadow-soft">
                You&apos;re on our top plan. 🎉
              </div>
            ) : (
              <div className="space-y-4">
                {upgradePlans.map((plan) => (
                  <div key={plan.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-white p-6 shadow-soft">
                    <div>
                      <h3 className="font-bold">{plan.name}</h3>
                      <p className="font-extrabold">{plan.priceLabel}<span className="text-sm font-normal text-muted">{plan.period}</span></p>
                      <p className="mt-1 text-sm text-muted">{plan.description}</p>
                    </div>
                    <Button href={buildWhatsappLink(`Hi! I'd like to upgrade to the ${plan.name} plan (${plan.priceLabel}${plan.period}).`)} variant="whatsapp">
                      Upgrade
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-line bg-white md:hidden">
        <div className="flex justify-around py-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={cn('flex flex-col items-center gap-1 px-4 py-1 text-[0.68rem] font-semibold', tab === item.id ? 'text-green' : 'text-muted')}
            >
              <item.icon className="h-5 w-5" />
              {item.label.replace('My ', '').replace(' Plan', '')}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

function Row({ label, value, capitalize }: { label: string; value?: string | null; capitalize?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className={cn('font-semibold text-ink', capitalize && 'capitalize')}>{value || '—'}</dd>
    </div>
  );
}
