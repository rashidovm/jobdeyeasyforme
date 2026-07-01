'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, buildWhatsappLink } from '@/lib/supabase';
import { Profile, Subscription, Application } from '@/types';
import { STATUS_MAP, PLANS } from '@/lib/constants';
import Logo from '@/components/ui/Logo';
import Button from '@/components/ui/Button';
import ErrorBox from '@/components/ui/ErrorBox';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [activeTab, setActiveTab] = useState<'apps' | 'profile' | 'upgrade'>('apps');
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: materials } = await supabase
        .from('client_materials')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!materials) {
        router.push('/onboarding');
        return;
      }

      try {
        const { data: profileData, error: profileErr } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        if (profileErr) throw profileErr;
        setProfile(profileData);

        const { data: subData, error: subErr } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        if (subErr) throw subErr;
        setSubscription(subData);

        const { data: appData, error: appErr } = await supabase
          .from('applications')
          .select('*, job_postings(*)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (appErr) throw appErr;
        setApplications(appData || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
  }

  const usagePct = subscription ? (subscription.applications_used / subscription.applications_limit) * 100 : 0;
  const currentPlanObj = PLANS.find(p => p.id === subscription?.tier);
  const upgradePlans = PLANS.filter(p => p.price > (currentPlanObj?.price || 0));

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: 'var(--cream)' }}>
      {/* Desktop Sidebar */}
      <aside className="desktop-sidebar" style={{
        width: '260px',
        backgroundColor: 'var(--dark)',
        color: 'white',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        position: 'fixed',
        height: '100vh',
        top: 0,
        left: 0
      }}>
        <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '4px' }}>
          <Logo />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'var(--green)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700
          }}>
            {profile?.full_name?.charAt(0) || 'U'}
          </div>
          <div>
            <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{profile?.full_name}</p>
            <p style={{ fontSize: '0.8rem', color: '#888' }}>{currentPlanObj?.name}</p>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('apps')}
            style={{ textAlign: 'left', padding: '10px', borderRadius: 'var(--radius-sm)', color: activeTab === 'apps' ? 'white' : '#aaa', backgroundColor: activeTab === 'apps' ? 'var(--green)' : 'transparent', fontWeight: 500, border: 'none', cursor: 'pointer' }}
          >
            📄 My Applications
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            style={{ textAlign: 'left', padding: '10px', borderRadius: 'var(--radius-sm)', color: activeTab === 'profile' ? 'white' : '#aaa', backgroundColor: activeTab === 'profile' ? 'var(--green)' : 'transparent', fontWeight: 500, border: 'none', cursor: 'pointer' }}
          >
            👤 My Profile
          </button>
          <button
            onClick={() => setActiveTab('upgrade')}
            style={{ textAlign: 'left', padding: '10px', borderRadius: 'var(--radius-sm)', color: activeTab === 'upgrade' ? 'white' : '#aaa', backgroundColor: activeTab === 'upgrade' ? 'var(--green)' : 'transparent', fontWeight: 500, border: 'none', cursor: 'pointer' }}
          >
            ⬆️ Upgrade Plan
          </button>
        </nav>

        <a
          href={buildWhatsappLink("Hi JobDeyEasy team!")}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--whatsapp)', fontSize: '0.9rem', fontWeight: 500, padding: '10px 0' }}
        >
          💬 Message Us
        </a>

        <div style={{ marginTop: 'auto' }}>
          <p style={{ fontSize: '0.8rem', marginBottom: '4px', color: '#888' }}>
            Applications used: {subscription?.applications_used || 0} / {subscription?.applications_limit || 0}
          </p>
          <div style={{ width: '100%', height: '6px', backgroundColor: '#333', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${usagePct}%`, height: '100%', backgroundColor: 'var(--green)' }} />
          </div>
          <button
            onClick={handleSignOut}
            style={{ marginTop: '16px', width: '100%', padding: '8px', borderRadius: 'var(--radius-sm)', border: '1px solid #444', color: '#aaa', fontSize: '0.8rem', cursor: 'pointer', backgroundColor: 'transparent' }}
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div className="mobile-topbar" style={{
        display: 'none',
        position: 'sticky',
        top: 0,
        backgroundColor: 'var(--dark)',
        color: 'white',
        padding: '16px 24px',
        zIndex: 50,
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%'
      }}>
        <div style={{ transform: 'scale(0.8)', transformOrigin: 'left' }}>
          <Logo />
        </div>
        <button onClick={handleSignOut} style={{ color: '#aaa', fontSize: '0.8rem', border: '1px solid #444', padding: '6px 12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'transparent', cursor: 'pointer' }}>
          Sign Out
        </button>
      </div>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '40px', maxWidth: '800px', margin: '0 auto', marginLeft: '260px' }} className="dashboard-main">
        <ErrorBox message={error} />

        {activeTab === 'apps' && (
          <div>
            <h1 style={{ fontSize: '1.8rem', marginBottom: '24px' }}>My Applications</h1>

            {applications.length === 0 ? (
              <div style={{
                backgroundColor: 'var(--white)',
                padding: '40px',
                borderRadius: 'var(--radius)',
                textAlign: 'center',
                border: '1px solid var(--border)'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '16px' }}>⏳</div>
                <h3 style={{ marginBottom: '8px' }}>The team is working on it</h3>
                <p style={{ color: 'var(--grey)', marginBottom: '24px', fontSize: '0.9rem' }}>
                  We're sourcing the best jobs for you. Check back soon!
                </p>
                <Button
                  href={buildWhatsappLink("Hi! Just checking in on my first application.")}
                  variant="whatsapp"
                >
                  Check in on WhatsApp
                </Button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {applications.map(app => {
                  const statusInfo = STATUS_MAP[app.status];
                  const trackerSteps = [
                    { label: 'CV Ready', done: !!app.tailored_cv_url },
                    { label: 'Cover Letter', done: !!app.tailored_cover_letter_url },
                    { label: 'Human Reviewed', done: ['human_review', 'ready', 'sent_to_client', 'client_applied', 'interview', 'offer', 'rejected'].includes(app.status) },
                    { label: 'Delivered to you', done: ['ready', 'sent_to_client', 'client_applied', 'interview', 'offer', 'rejected'].includes(app.status) },
                  ];

                  return (
                    <div key={app.id} style={{
                      backgroundColor: 'var(--white)',
                      borderRadius: 'var(--radius)',
                      boxShadow: 'var(--shadow-sm)',
                      border: '1px solid var(--border)',
                      padding: '24px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                          <h3 style={{ fontSize: '1.1rem' }}>{app.job_postings?.title || 'Job Title'}</h3>
                          <p style={{ color: 'var(--grey)', fontSize: '0.9rem' }}>
                            {app.job_postings?.company} • {app.job_postings?.location}
                          </p>
                        </div>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          backgroundColor: `${statusInfo.color}20`,
                          color: statusInfo.color,
                          padding: '4px 12px',
                          borderRadius: '50px',
                          fontSize: '0.8rem',
                          fontWeight: 600
                        }}>
                          {statusInfo.icon} {statusInfo.label}
                        </span>
                      </div>

                      {/* Tracker */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: '12px', left: '0', right: '0', height: '2px', backgroundColor: 'var(--border)', zIndex: 0 }} />
                        {trackerSteps.map((step, i) => (
                          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', zIndex: 1, flex: 1 }}>
                            <div style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              backgroundColor: step.done ? 'var(--green)' : 'var(--white)',
                              border: `2px solid ${step.done ? 'var(--green)' : 'var(--border)'}`,
                              color: step.done ? 'white' : 'var(--grey)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.7rem',
                              fontWeight: 700
                            }}>
                              {step.done ? '✓' : i + 1}
                            </div>
                            <span style={{ fontSize: '0.7rem', color: step.done ? 'var(--dark)' : 'var(--grey)', textAlign: 'center' }}>{step.label}</span>
                          </div>
                        ))}
                      </div>

                      {/* Why Picked */}
                      {app.why_picked && app.why_picked.length > 0 && (
                        <div style={{
                          backgroundColor: 'var(--gold-light)',
                          borderLeft: '3px solid var(--gold)',
                          padding: '12px 16px',
                          borderRadius: 'var(--radius-sm)',
                          marginBottom: '16px'
                        }}>
                          <p style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--gold)', marginBottom: '4px' }}>WHY WE PICKED THIS JOB</p>
                          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.85rem', color: 'var(--dark)' }}>
                            {app.why_picked.map((reason, i) => <li key={i}>{reason}</li>)}
                          </ul>
                        </div>
                      )}

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        {app.tailored_cv_url && (
                          <Button href={app.tailored_cv_url} variant="secondary">📄 Tailored CV</Button>
                        )}
                        {app.tailored_cover_letter_url && (
                          <Button href={app.tailored_cover_letter_url} variant="secondary">✉️ Cover Letter</Button>
                        )}
                        {app.apply_to_email_or_link && (
                          <Button
                            href={app.apply_to_email_or_link.startsWith('http') ? app.apply_to_email_or_link : `mailto:${app.apply_to_email_or_link}`}
                          >
                            🚀 Send your application
                          </Button>
                        )}
                      </div>

                      {app.client_outcome && (
                        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)', fontSize: '0.85rem' }}>
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

        {activeTab === 'profile' && (
          <div>
            <h1 style={{ fontSize: '1.8rem', marginBottom: '24px' }}>My Profile</h1>

            <div style={{
              backgroundColor: 'var(--white)',
              padding: '24px',
              borderRadius: 'var(--radius)',
              marginBottom: '16px',
              border: '1px solid var(--border)'
            }}>
              <h3 style={{ marginBottom: '16px' }}>Account Details</h3>
              <p><strong>Name:</strong> {profile?.full_name}</p>
              <p><strong>Email:</strong> {profile?.email}</p>
              <p><strong>Delivery Channel:</strong> {profile?.preferred_delivery_channel || 'email'}</p>
            </div>

            <div style={{
              backgroundColor: 'var(--white)',
              padding: '24px',
              borderRadius: 'var(--radius)',
              marginBottom: '24px',
              border: '1px solid var(--border)'
            }}>
              <h3 style={{ marginBottom: '16px' }}>Subscription</h3>
              <p><strong>Plan:</strong> {currentPlanObj?.name}</p>
              <p><strong>Status:</strong> <span style={{ textTransform: 'capitalize' }}>{subscription?.status}</span></p>
              <p><strong>Applications:</strong> {subscription?.applications_used} / {subscription?.applications_limit}</p>
              {subscription?.renews_at && (
                <p><strong>Renews:</strong> {new Date(subscription.renews_at).toLocaleDateString()}</p>
              )}
            </div>

            <div style={{
              backgroundColor: 'var(--green-light)',
              padding: '16px',
              borderRadius: 'var(--radius-sm)',
              textAlign: 'center'
            }}>
              <p style={{ marginBottom: '12px', fontSize: '0.9rem', color: 'var(--green-dark)' }}>
                Need to update your CV or contact info? We handle edits manually for now.
              </p>
              <Button
                href={buildWhatsappLink("Hi! I need to update my profile details.")}
                variant="whatsapp"
              >
                Message us to update
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'upgrade' && (
          <div>
            <h1 style={{ fontSize: '1.8rem', marginBottom: '24px' }}>Upgrade Plan</h1>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {upgradePlans.map(plan => (
                <div key={plan.id} style={{
                  backgroundColor: 'var(--white)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  padding: '24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '16px'
                }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{plan.name}</h3>
                    <p style={{ fontWeight: 800, marginBottom: '8px' }}>{plan.priceLabel}{plan.period}</p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--grey)' }}>{plan.description}</p>
                  </div>
                  <Button
                    href={buildWhatsappLink(`Hi! I'd like to upgrade to the ${plan.name} plan (${plan.priceLabel}${plan.period}).`)}
                    variant="whatsapp"
                  >
                    Upgrade
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="mobile-bottomnav" style={{
        display: 'none',
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'var(--white)',
        borderTop: '1px solid var(--border)',
        padding: '12px 0',
        zIndex: 50
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          <button
            onClick={() => setActiveTab('apps')}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: activeTab === 'apps' ? 'var(--green)' : 'var(--grey)', border: 'none', background: 'none', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}
          >
            <span style={{ fontSize: '1.2rem' }}>📄</span> Apps
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: activeTab === 'profile' ? 'var(--green)' : 'var(--grey)', border: 'none', background: 'none', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}
          >
            <span style={{ fontSize: '1.2rem' }}>👤</span> Profile
          </button>
          <button
            onClick={() => setActiveTab('upgrade')}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: activeTab === 'upgrade' ? 'var(--green)' : 'var(--grey)', border: 'none', background: 'none', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}
          >
            <span style={{ fontSize: '1.2rem' }}>⬆️</span> Upgrade
          </button>
        </div>
      </nav>

      <style jsx global>{`
        @media (max-width: 768px) {
          .desktop-sidebar {
            display: none !important;
          }
          .mobile-topbar {
            display: flex !important;
          }
          .mobile-bottomnav {
            display: block !important;
          }
          .dashboard-main {
            margin-left: 0 !important;
            padding: 24px 16px 100px 16px !important;
          }
        }
      `}</style>
    </div>
  );
}
