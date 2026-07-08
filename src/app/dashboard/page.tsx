'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FileText, UserRound, ArrowUpCircle, MessageCircle, LogOut, Rocket, Mail, Send,
  Hourglass, PenLine, Eye, CheckCircle2, Inbox, PartyPopper, Trophy, XCircle,
} from 'lucide-react';
import { Clock, Sparkles, FileCheck2, MessageSquare, Zap, Bell, Briefcase, Plus, CheckCircle2 as CheckC, Copy, BookOpen } from 'lucide-react';
import Celebration from '@/components/ui/Celebration';
import { prettyDate } from '@/lib/dates';
import { supabase, buildWhatsappLink } from '@/lib/supabase';
import { Profile, Subscription, Application, ClientMaterial, CvDeliverable, Message, Notification, JobPosting, Ticket, TicketMessage } from '@/types';
import { STATUS_MAP, PLANS, TOPUP_PRICES } from '@/lib/constants';
import Logo from '@/components/ui/Logo';
import Button from '@/components/ui/Button';
import ErrorBox from '@/components/ui/ErrorBox';
import { cn } from '@/lib/cn';

const STATUS_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Hourglass, PenLine, Eye, CheckCircle2, Inbox, Rocket, PartyPopper, Trophy, XCircle,
};

type Tab = 'apps' | 'messages' | 'profile' | 'upgrade';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [material, setMaterial] = useState<ClientMaterial | null>(null);
  const [cvDeliverable, setCvDeliverable] = useState<CvDeliverable | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [postings, setPostings] = useState<JobPosting[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [tab, setTab] = useState<Tab>('apps');
  const [celebration, setCelebration] = useState<{ title: string; message: string } | null>(null);
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

        let activeSub = subData as Subscription;
        // If a paid cycle has ended, drop back to Free Trial.
        if (activeSub && activeSub.tier !== 'free_trial' && activeSub.renews_at && new Date(activeSub.renews_at) < new Date()) {
          const { data: reverted } = await supabase.from('subscriptions')
            .update({ tier: 'free_trial', applications_limit: 1, applications_used: 0, status: 'active', renews_at: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString() })
            .eq('id', activeSub.id).select().single();
          if (reverted) activeSub = reverted as Subscription;
        }
        setSubscription(activeSub);

        const { data: jp } = await supabase.from('job_postings').select('*').eq('filled', false).order('created_at', { ascending: false });
        setPostings((jp as JobPosting[]) || []);

        const { data: appData, error: appErr } = await supabase
          .from('applications').select('*, job_postings(*)').eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (appErr) throw appErr;
        setApplications(appData || []);

        const { data: matFull } = await supabase
          .from('client_materials').select('*').eq('user_id', user.id).maybeSingle();
        setMaterial(matFull as ClientMaterial);

        // Only returns a row once the CV has been delivered (RLS-protected).
        const { data: dv } = await supabase
          .from('cv_deliverables').select('*').eq('user_id', user.id).maybeSingle();
        setCvDeliverable(dv as CvDeliverable);

        const { data: msgs } = await supabase
          .from('messages').select('*').eq('thread_user_id', user.id)
          .order('created_at', { ascending: true });
        setMessages((msgs as Message[]) || []);

        const { data: notifs } = await supabase
          .from('notifications').select('*').eq('user_id', user.id)
          .order('created_at', { ascending: false });
        setNotifications((notifs as Notification[]) || []);

        const { data: tks } = await supabase
          .from('tickets').select('*').eq('user_id', user.id)
          .order('created_at', { ascending: false });
        setTickets((tks as Ticket[]) || []);
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

  const sendMessage = async (body: string) => {
    if (!profile) return;
    const { error: e } = await supabase.from('messages').insert({
      thread_user_id: profile.id, sender_id: profile.id, sender_role: 'client', body,
    });
    if (!e) {
      const { data: msgs } = await supabase
        .from('messages').select('*').eq('thread_user_id', profile.id).order('created_at', { ascending: true });
      setMessages((msgs as Message[]) || []);
    }
  };

  useEffect(() => {
    if (tab !== 'messages') return;
    const ids = messages.filter((m) => m.sender_role !== 'client' && !m.read_by_client).map((m) => m.id);
    if (!ids.length) return;
    supabase.from('messages').update({ read_by_client: true }).in('id', ids).then(() => {
      setMessages((prev) => prev.map((m) => (ids.includes(m.id) ? { ...m, read_by_client: true } : m)));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, messages]);

  // Celebrate plan upgrades and interviews (once each, tracked locally)
  useEffect(() => {
    if (!profile || !subscription) return;
    const rank: Record<string, number> = { free_trial: 0, starter: 1, active_search: 2, unlimited_hunt: 3 };
    const tierKey = `jde_tier_${profile.id}`;
    const prev = typeof window !== 'undefined' ? localStorage.getItem(tierKey) : null;
    if (prev && (rank[subscription.tier] ?? 0) > (rank[prev] ?? 0) && subscription.status === 'active') {
      const planName = PLANS.find((p) => p.id === subscription.tier)?.name || 'your new plan';
      setCelebration({ title: `Welcome to ${planName}! 🎉`, message: 'Your upgrade is live. More applications, faster turnaround — let\u2019s get you hired.' });
    }
    if (subscription.status === 'active') localStorage.setItem(tierKey, subscription.tier);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id, subscription?.tier, subscription?.status]);

  useEffect(() => {
    if (!profile || applications.length === 0) return;
    const key = `jde_intv_${profile.id}`;
    const seen: string[] = JSON.parse(localStorage.getItem(key) || '[]');
    const interview = applications.find((a) => (a.status === 'interview' || a.client_outcome === 'interview') && !seen.includes(a.id));
    if (interview) {
      const jobName = interview.job_postings?.title || interview.manual_job_title || 'your application';
      setCelebration({ title: 'You got an interview! 🎉', message: `Massive congratulations — ${jobName} moved to interview. Message us in chat and we\u2019ll help you prepare.` });
      localStorage.setItem(key, JSON.stringify([...seen, interview.id]));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id, applications]);

  const createTicket = async (subject: string, body: string) => {
    if (!profile) return;
    const { error: e } = await supabase.from('tickets').insert({ user_id: profile.id, subject, body });
    if (!e) {
      const { data: tks } = await supabase.from('tickets').select('*').eq('user_id', profile.id).order('created_at', { ascending: false });
      setTickets((tks as Ticket[]) || []);
    }
  };

  const refreshApps = async () => {
    if (!profile) return;
    const { data: apps } = await supabase
      .from('applications').select('*, job_postings(*)').eq('user_id', profile.id)
      .order('created_at', { ascending: false });
    setApplications((apps as Application[]) || []);
  };

  const confirmSent = async (appId: string) => {
    await supabase.from('applications')
      .update({
        client_sent: true,
        client_sent_at: new Date().toISOString(),
        client_outcome: 'still_waiting',
        heard_remind_after: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(),
      })
      .eq('id', appId);
    setCelebration({ title: 'Application sent! 🎉', message: 'Well done — your application is out there. We\u2019ll check in with you in a couple of days to see if they\u2019ve responded.' });
    refreshApps();
  };

  const remindLater = async (appId: string) => {
    await supabase.from('applications')
      .update({ remind_after: new Date(Date.now() + 12 * 3600 * 1000).toISOString() })
      .eq('id', appId);
    refreshApps();
  };

  const heardYes = async (appId: string) => {
    await supabase.from('applications')
      .update({ heard_back: true, heard_back_at: new Date().toISOString(), needs_followup: false })
      .eq('id', appId);
    setCelebration({ title: 'They responded! 🎉', message: 'That\u2019s huge — an employer got back to you. Update us in chat with the details and we\u2019ll help you with the next step.' });
    refreshApps();
  };

  const heardNo = async (appId: string) => {
    await supabase.from('applications')
      .update({ needs_followup: true, heard_remind_after: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString() })
      .eq('id', appId);
    refreshApps();
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
  const outOfApps = limit > 0 && used >= limit;
  const topupPrice = TOPUP_PRICES[subscription?.tier || 'free_trial'] || 0;
  const isPaidPending = !!subscription && subscription.tier !== 'free_trial' && subscription.status === 'pending';
  const daysLeft = subscription?.renews_at && subscription.tier !== 'free_trial'
    ? Math.max(0, Math.ceil((new Date(subscription.renews_at).getTime() - Date.now()) / 86400000)) : null;
  const newJobsCount = postings.filter((j) => Date.now() - new Date(j.created_at || 0).getTime() < 7 * 24 * 3600 * 1000).length;

  const lastMsg = messages[messages.length - 1];
  const canReply = !!lastMsg && lastMsg.sender_role !== 'client';
  const unreadCount = messages.filter((m) => m.sender_role !== 'client' && !m.read_by_client).length;

  const navItems: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [
    { id: 'apps', label: 'My Applications', icon: FileText },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: unreadCount },
    { id: 'profile', label: 'My Profile', icon: UserRound },
    { id: 'upgrade', label: 'Upgrade Plan', icon: ArrowUpCircle },
  ];

  return (
    <div className="min-h-screen bg-cream">
      {/* Desktop sidebar */}
      <aside className="grain fixed left-0 top-0 hidden h-screen w-[264px] flex-col gap-6 overflow-hidden bg-forest p-6 text-cream md:flex">
        <div className="relative rounded-xl border border-cream/10 bg-cream/[0.06] p-2">
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
              {item.badge ? <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1.5 text-[0.65rem] font-bold text-white">{item.badge}</span> : null}
            </button>
          ))}
        </nav>

        <a
          href="/jobs"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/60 transition-colors hover:bg-white/5 hover:text-white"
        >
          <Briefcase className="h-4 w-4" /> Browse jobs
          {newJobsCount > 0 && <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1.5 text-[0.65rem] font-bold text-white">{newJobsCount} new</span>}
        </a>

        <a
          href={buildWhatsappLink('Hi JobDeyEasy team!')}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-whatsapp hover:brightness-110"
        >
          <MessageCircle className="h-4 w-4" /> Message us
        </a>

        <div className="mt-auto">
          <p className="mb-1.5 text-xs font-semibold text-white/80">
            {limit - used > 0 ? `${limit - used} application${limit - used === 1 ? '' : 's'} left this cycle` : 'No applications left'}
          </p>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-green" style={{ width: `${usagePct}%` }} />
          </div>
          {daysLeft !== null && (
            <p className="mt-2 text-xs text-white/50">{daysLeft} day{daysLeft === 1 ? '' : 's'} left in your plan</p>
          )}
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
            {isPaidPending && (
              <div className="mb-6 rounded-2xl border border-gold/40 bg-gold-light p-5 text-sm text-gold">
                <p className="font-bold">Payment being confirmed</p>
                <p className="mt-1">Your {currentPlan?.name} plan is active on your account, but we&apos;re still confirming your payment. Your CV and applications start once it&apos;s confirmed — usually quickly. Questions? Message us on WhatsApp.</p>
              </div>
            )}

            {material && <CvCard material={material} deliverable={cvDeliverable} />}

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
                {applications.map((app, appIdx) => {
                  const status = STATUS_MAP[app.status];
                  const StatusIcon = STATUS_ICONS[status.icon] ?? Hourglass;
                  const isDelivered = ['sent_to_client', 'client_applied', 'interview', 'offer', 'rejected'].includes(app.status);
                  // applications are loaded newest-first, so number them oldest -> newest (Application 1, 2, 3…)
                  const appNumber = applications.length - appIdx;

                  if (!isDelivered) {
                    return (
                      <div key={app.id} className="flex items-start gap-4 rounded-2xl border border-green/30 bg-green-light/50 p-6 shadow-soft">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green text-white">
                          <PartyPopper className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-green">Application {appNumber}</p>
                          <h3 className="font-bold text-green-dark">We found a match for you!</h3>
                          <p className="mt-1.5 text-sm text-muted">We&apos;re getting your tailored CV and cover letter ready for this role. We&apos;ll let you know the moment it&apos;s ready to send.</p>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={app.id} className="rounded-2xl border border-line bg-white p-6 shadow-soft">
                      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-muted">Application {appNumber}</p>
                          <h3 className="font-bold">{app.job_postings?.title || app.manual_job_title || 'Job Title'}</h3>
                          <p className="text-sm text-muted">{app.job_postings?.company || app.manual_company || ''}{app.job_postings?.location ? ` · ${app.job_postings.location}` : ''}</p>
                        </div>
                        <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: status.bg, color: status.color }}>
                          <StatusIcon className="h-3.5 w-3.5" /> {status.label}
                        </span>
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
                        {app.tailored_cv_url && <Button href={app.tailored_cv_url} variant="secondary" size="sm"><FileText className="h-4 w-4" /> Tailored CV</Button>}
                        {app.tailored_cover_letter_url && <Button href={app.tailored_cover_letter_url} variant="secondary" size="sm"><Mail className="h-4 w-4" /> Cover Letter</Button>}
                        {app.apply_to_email_or_link && (
                          <Button href={app.apply_to_email_or_link.startsWith('http') ? app.apply_to_email_or_link : `mailto:${app.apply_to_email_or_link}`} size="sm">
                            <Send className="h-4 w-4" /> Send your application
                          </Button>
                        )}
                      </div>

                      {app.reference_doc_url && (
                        <div className="mt-3">
                          <Button href={app.reference_doc_url} variant="secondary" size="sm"><BookOpen className="h-4 w-4" /> Application guide</Button>
                          <p className="mt-1.5 text-xs text-muted">Step-by-step instructions for this application — what to write, what to attach, and how to send it.</p>
                        </div>
                      )}

                      {/* Did you send it? */}
                      {!app.client_sent && (!app.remind_after || new Date(app.remind_after) < new Date()) && (
                        <div className="mt-4 rounded-xl border border-gold/40 bg-gold-light p-4">
                          <p className="text-sm font-bold text-ink">Quick check-in — have you sent this application yet?</p>
                          <div className="mt-3 flex gap-2">
                            <button onClick={() => confirmSent(app.id)} className="rounded-full bg-green px-5 py-2 text-sm font-semibold text-white shadow-soft transition-transform hover:-translate-y-0.5">Yes, I&apos;ve sent it ✓</button>
                            <button onClick={() => remindLater(app.id)} className="rounded-full border border-line bg-white px-5 py-2 text-sm font-semibold text-muted hover:border-gold hover:text-gold">Not yet</button>
                          </div>
                          <p className="mt-2 text-xs text-muted">If not yet, no wahala — we&apos;ll gently remind you again in 12 hours.</p>
                        </div>
                      )}
                      {!app.client_sent && app.remind_after && new Date(app.remind_after) >= new Date() && (
                        <p className="mt-4 rounded-xl bg-cream px-3.5 py-2.5 text-xs text-muted">⏰ We&apos;ll check in again soon to see if you&apos;ve sent this one.</p>
                      )}

                      {/* Have you heard back? */}
                      {app.client_sent && !app.heard_back && app.heard_remind_after && new Date(app.heard_remind_after) < new Date() && (
                        <div className="mt-4 rounded-xl border border-green/30 bg-green-light p-4">
                          <p className="text-sm font-bold text-green-dark">It&apos;s been a few days — has {app.job_postings?.company || app.manual_company || 'the employer'} gotten back to you?</p>
                          <div className="mt-3 flex gap-2">
                            <button onClick={() => heardYes(app.id)} className="rounded-full bg-green px-5 py-2 text-sm font-semibold text-white shadow-soft transition-transform hover:-translate-y-0.5">Yes! 🎉</button>
                            <button onClick={() => heardNo(app.id)} className="rounded-full border border-line bg-white px-5 py-2 text-sm font-semibold text-muted hover:border-green hover:text-green">Not yet</button>
                          </div>
                        </div>
                      )}
                      {app.client_sent && !app.heard_back && app.needs_followup && (
                        <p className="mt-4 rounded-xl bg-cream px-3.5 py-2.5 text-xs text-muted">📮 Noted — our team is preparing a follow-up email to nudge {app.job_postings?.company || app.manual_company || 'the employer'}. It&apos;ll appear here when ready.</p>
                      )}
                      {app.client_sent && !app.heard_back && !app.needs_followup && app.heard_remind_after && new Date(app.heard_remind_after) >= new Date() && (
                        <p className="mt-4 rounded-xl bg-cream px-3.5 py-2.5 text-xs text-muted">✅ Sent on {prettyDate(app.client_sent_at)} — we&apos;ll check in about a response in a couple of days.</p>
                      )}
                      {app.heard_back && (
                        <p className="mt-4 rounded-xl bg-green-light px-3.5 py-2.5 text-xs font-semibold text-green-dark">🎉 Employer responded on {prettyDate(app.heard_back_at)} — keep us posted in chat!</p>
                      )}

                      {/* Follow-up email prepared by the team */}
                      {app.followup_email && app.client_sent && !app.heard_back && (
                        <div className="mt-4 rounded-xl border border-gold/40 bg-gold-light/70 p-4">
                          <div className="mb-2 flex items-center justify-between">
                            <p className="text-xs font-bold uppercase tracking-wide text-gold">Your follow-up email{app.followup_to ? ` → ${app.followup_to}` : ''}</p>
                            <button onClick={() => navigator.clipboard.writeText(app.followup_email || '')} className="inline-flex items-center gap-1 text-xs font-semibold text-green"><Copy className="h-3.5 w-3.5" /> Copy</button>
                          </div>
                          <pre className="whitespace-pre-wrap font-sans text-sm text-ink">{app.followup_email}</pre>
                          {app.followup_to && (
                            <div className="mt-3"><Button href={`mailto:${app.followup_to}`} size="sm"><Send className="h-4 w-4" /> Send follow-up</Button></div>
                          )}
                        </div>
                      )}

                      {app.client_outcome && app.client_outcome !== 'still_waiting' && (
                        <div className="mt-4 border-t border-line pt-4 text-sm"><strong>Outcome:</strong> {app.client_outcome.replace('_', ' ')}</div>
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

        {tab === 'messages' && (
          <div className="space-y-6">
            <div>
              <h1 className="mb-1 text-2xl font-extrabold">Support tickets</h1>
              <p className="mb-4 text-sm text-muted">Have a question or a problem? Open a ticket and the team will respond.</p>
              <TicketsPanel tickets={tickets} onCreate={createTicket} profile={profile} />
            </div>

            <div>
              <h2 className="mb-1 text-xl font-extrabold">Chat</h2>
              <p className="mb-4 text-sm text-muted">The team reaches you here. You can reply after they message you.</p>
              {notifications.length > 0 && (
                <div className="mb-4 rounded-2xl border border-line bg-white p-4 shadow-soft">
                  <p className="mb-2 flex items-center gap-2 text-sm font-bold"><Bell className="h-4 w-4 text-gold" /> Recent alerts</p>
                  <ul className="space-y-1.5">
                    {notifications.slice(0, 5).map((n) => (
                      <li key={n.id} className="text-sm text-muted">We notified you via <span className="font-semibold capitalize text-ink">{n.channel}</span> · {new Date(n.created_at).toLocaleString()}</li>
                    ))}
                  </ul>
                </div>
              )}
              <MessagesPanel messages={messages} onSend={sendMessage} meId={profile?.id} canReply={canReply} />
            </div>
          </div>
        )}

        {tab === 'upgrade' && (
          <div>
            <h1 className="mb-6 text-2xl font-extrabold">Upgrade &amp; top-ups</h1>

            {/* Top-up card — active only when applications are used up */}
            <div className={cn('mb-5 rounded-2xl border p-6 shadow-soft', outOfApps && topupPrice > 0 ? 'border-gold bg-gold-light' : 'border-line bg-white')}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="flex items-center gap-2 font-bold"><Zap className="h-5 w-5 text-gold" /> Buy extra applications</h3>
                  {topupPrice > 0 ? (
                    <p className="mt-1 text-sm text-muted">₦{topupPrice.toLocaleString()} per extra application on your plan.</p>
                  ) : (
                    <p className="mt-1 text-sm text-muted">Free Trial has no top-ups — upgrade to a paid plan for more applications.</p>
                  )}
                  {!outOfApps && topupPrice > 0 && (
                    <p className="mt-1 text-xs text-muted">Available once you&apos;ve used all {limit} of this cycle&apos;s applications.</p>
                  )}
                </div>
                {topupPrice > 0 ? (
                  outOfApps ? (
                    <Button
                      href={buildWhatsappLink(`Hi! I'd like to buy extra applications on my ${currentPlan?.name} plan (₦${topupPrice} each).`)}
                      variant="whatsapp"
                    >
                      Top up now
                    </Button>
                  ) : (
                    <button disabled className="cursor-not-allowed rounded-full border border-line bg-cream px-6 py-3 text-sm font-semibold text-muted opacity-70">
                      Top up (locked)
                    </button>
                  )
                ) : null}
              </div>
            </div>

            {/* Upgrade options — only higher tiers */}
            {upgradePlans.length === 0 ? (
              <div className="rounded-2xl border border-line bg-white p-8 text-center text-muted shadow-soft">
                You&apos;re on our top plan. 🎉 Use top-ups above when you run out.
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wide text-muted">Move up a plan</h2>
                {upgradePlans.map((plan) => (
                  <div key={plan.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-white p-6 shadow-soft">
                    <div>
                      <h3 className="font-bold">{plan.name}</h3>
                      <p className="font-extrabold">{plan.priceLabel}<span className="text-sm font-normal text-muted">{plan.period}</span> · {plan.applications} applications</p>
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
              <span className="relative">
                <item.icon className="h-5 w-5" />
                {item.badge ? <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[0.55rem] font-bold text-white">{item.badge}</span> : null}
              </span>
              {item.label.replace('My ', '').replace(' Plan', '')}
            </button>
          ))}
        </div>
      </nav>

      {celebration && (
        <Celebration title={celebration.title} message={celebration.message} onClose={() => setCelebration(null)} />
      )}
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

function useCountdown(target?: string | null) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(t);
  }, []);
  if (!target) return null;
  const diff = new Date(target).getTime() - now;
  if (diff <= 0) return 'Any moment now';
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h >= 24) return `${Math.floor(h / 24)}d ${h % 24}h left`;
  return `${h}h ${m}m left`;
}

function CvCard({ material, deliverable }: { material: ClientMaterial; deliverable: CvDeliverable | null }) {
  const status = material.cv_review_status || 'drafting';
  const countdown = useCountdown(material.cv_due_at);
  const delivered = status === 'delivered';

  const steps = [
    { label: 'CV Ready', done: ['human_review', 'ready', 'delivered'].includes(status) },
    { label: 'Cover Letter Ready', done: ['human_review', 'ready', 'delivered'].includes(status) },
    { label: 'Human Reviewed', done: ['ready', 'delivered'].includes(status) },
    { label: 'Delivered', done: delivered },
  ];


  return (
    <div className="mb-6 rounded-2xl border border-line bg-white p-6 shadow-soft">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-bold">
          <FileCheck2 className="h-5 w-5 text-green" /> Your professional CV
        </h2>
        {!delivered ? (
          countdown && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-cream px-3 py-1 text-xs font-semibold text-muted">
              <Clock className="h-3.5 w-3.5" /> Ready in {countdown}
            </span>
          )
        ) : (
          <span className="rounded-full bg-green-light px-3 py-1 text-xs font-semibold text-green">Delivered</span>
        )}
      </div>

      {!delivered && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-gold/30 bg-gold-light p-3.5 text-sm text-gold">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0" />
          {status === 'drafting'
            ? 'Our AI is drafting your CV now. A human will refine it before it reaches you.'
            : 'Your CV is written and a human is giving it the final polish. You\u2019ll get it very soon.'}
        </div>
      )}

      <div className="relative mb-2 flex justify-between">
        <div className="absolute left-0 right-0 top-3 h-0.5 bg-line" />
        {steps.map((s, i) => (
          <div key={i} className="relative z-10 flex flex-1 flex-col items-center gap-1.5">
            <div className={cn('flex h-6 w-6 items-center justify-center rounded-full border-2 text-[0.65rem] font-bold',
              s.done ? 'border-green bg-green text-white' : 'border-line bg-white text-muted')}>
              {s.done ? '\u2713' : i + 1}
            </div>
            <span className={cn('text-center text-[0.68rem]', s.done ? 'text-ink' : 'text-muted')}>{s.label}</span>
          </div>
        ))}
      </div>

      {delivered && deliverable && (
        <div className="mt-5 space-y-3 border-t border-line pt-5">
          <div className="flex flex-wrap gap-2.5">
            {deliverable.final_cv_url && <Button href={deliverable.final_cv_url} variant="secondary" size="sm"><FileText className="h-4 w-4" /> Your CV</Button>}
            {deliverable.final_cover_letter_url && <Button href={deliverable.final_cover_letter_url} variant="secondary" size="sm"><Mail className="h-4 w-4" /> Cover Letter</Button>}
          </div>
          <p className="text-xs text-muted">This is your professional CV and cover letter. Job-specific applications appear below as we prepare them.</p>
        </div>
      )}
    </div>
  );
}

function MessagesPanel({ messages, onSend, meId, canReply }: { messages: Message[]; onSend: (b: string) => void; meId?: string; canReply: boolean }) {
  const [text, setText] = useState('');
  const submit = () => {
    const b = text.trim();
    if (!b) return;
    onSend(b);
    setText('');
  };
  return (
    <div className="rounded-2xl border border-line bg-white shadow-soft">
      <div className="max-h-[440px] min-h-[240px] space-y-3 overflow-y-auto p-5">
        {messages.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted">No messages yet. Open a support ticket below if you have a question.</p>
        ) : (
          messages.map((m) => {
            const mine = m.sender_id === meId;
            return (
              <div key={m.id} className={cn('max-w-[80%] rounded-2xl px-3.5 py-2 text-sm',
                mine ? 'ml-auto rounded-br-md bg-green-light text-green-dark' : 'mr-auto rounded-bl-md bg-paper text-ink')}>
                {!mine && (
                  <p className="mb-0.5 text-[0.68rem] font-bold uppercase tracking-wide text-gold">
                    Customer Support{m.sender_name ? ` · ${m.sender_name}` : ''}
                  </p>
                )}
                <p className="whitespace-pre-wrap">{m.body}</p>
                <p className="mt-1 text-[0.62rem] text-muted">{new Date(m.created_at).toLocaleString()}</p>
              </div>
            );
          })
        )}
      </div>

      <div className="border-t border-line p-3">
        {canReply ? (
          <div className="flex gap-2">
            <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); submit(); } }}
              placeholder="Reply to the team…" className="w-full rounded-full border border-line px-4 py-2.5 text-sm outline-none focus:border-green focus:ring-2 focus:ring-green/15" />
            <Button onClick={submit}><Send className="h-4 w-4" /></Button>
          </div>
        ) : (
          <p className="py-2 text-center text-xs text-muted">You can reply here once the team messages you. For a new question, open a support ticket above.</p>
        )}
      </div>
    </div>
  );
}

function TicketsPanel({ tickets, onCreate, profile }: { tickets: Ticket[]; onCreate: (s: string, b: string) => void; profile: Profile | null }) {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const submit = () => {
    if (!subject.trim() || !body.trim()) return;
    onCreate(subject.trim(), body.trim());
    setSubject(''); setBody(''); setOpen(false);
  };
  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-soft">
      {!open ? (
        <Button variant="secondary" size="sm" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Open a ticket</Button>
      ) : (
        <div className="mb-4 space-y-2 rounded-xl border border-line bg-cream p-4">
          <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-green" />
          <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Describe your question or issue…" rows={3} className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-green" />
          <div className="flex gap-2">
            <Button size="sm" onClick={submit}>Submit ticket</Button>
            <button onClick={() => setOpen(false)} className="text-sm text-muted hover:text-ink">Cancel</button>
          </div>
        </div>
      )}

      {tickets.length > 0 && (
        <ul className="mt-4 space-y-3">
          {tickets.map((t) => <TicketThread key={t.id} ticket={t} profile={profile} />)}
        </ul>
      )}
    </div>
  );
}

function TicketThread({ ticket, profile }: { ticket: Ticket; profile: Profile | null }) {
  const [expanded, setExpanded] = useState(false);
  const [thread, setThread] = useState<TicketMessage[]>([]);
  const [reply, setReply] = useState('');

  const loadThread = async () => {
    const { data } = await supabase.from('ticket_messages').select('*').eq('ticket_id', ticket.id).order('created_at', { ascending: true });
    setThread((data as TicketMessage[]) || []);
  };
  const toggle = () => { const n = !expanded; setExpanded(n); if (n) loadThread(); };
  const send = async () => {
    const b = reply.trim(); if (!b || !profile) return;
    const { error } = await supabase.from('ticket_messages').insert({ ticket_id: ticket.id, sender_id: profile.id, sender_role: 'client', body: b });
    if (!error) { setReply(''); loadThread(); }
  };

  return (
    <li className="rounded-xl border border-line">
      <button onClick={toggle} className="flex w-full items-center justify-between gap-2 p-3 text-left">
        <span className="text-sm font-semibold">{ticket.subject}</span>
        <span className={cn('rounded-full px-2 py-0.5 text-[0.65rem] font-bold uppercase', ticket.status === 'open' ? 'bg-gold-light text-gold' : 'bg-green-light text-green')}>{ticket.status}</span>
      </button>
      {expanded && (
        <div className="border-t border-line p-3">
          <div className="mb-2 rounded-lg bg-cream px-3 py-2 text-sm">{ticket.body}</div>
          <div className="space-y-2">
            {thread.map((m) => {
              const mine = m.sender_role === 'client';
              return (
                <div key={m.id} className={cn('max-w-[85%] rounded-2xl px-3 py-2 text-sm', mine ? 'ml-auto rounded-br-md bg-green-light text-green-dark' : 'mr-auto rounded-bl-md bg-paper text-ink')}>
                  {!mine && <p className="text-[0.62rem] font-bold uppercase text-gold">Customer Support{m.sender_name ? ` · ${m.sender_name}` : ''}</p>}
                  <p className="whitespace-pre-wrap">{m.body}</p>
                </div>
              );
            })}
          </div>
          {ticket.status === 'open' ? (
            <div className="mt-3 flex gap-2">
              <input value={reply} onChange={(e) => setReply(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); send(); } }} placeholder="Reply…" className="w-full rounded-full border border-line px-3 py-2 text-sm outline-none focus:border-green" />
              <Button size="sm" onClick={send}><Send className="h-4 w-4" /></Button>
            </div>
          ) : (
            <p className="mt-3 text-center text-xs text-muted">This ticket is closed.</p>
          )}
        </div>
      )}
    </li>
  );
}
