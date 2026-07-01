'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, buildWhatsappLink } from '@/lib/supabase';
import { PLANS } from '@/lib/constants';
import Logo from '@/components/ui/Logo';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import ErrorBox from '@/components/ui/ErrorBox';
import { SubscriptionTier } from '@/types';

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionTier | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSelectPlan = (planId: SubscriptionTier) => {
    setSelectedPlan(planId);
    setStep(2);
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    const userId = authData.user?.id;
    if (!userId) {
      setError('Failed to create account. Please try again.');
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase.from('profiles').insert({
      id: userId,
      full_name: fullName,
      email: email,
    });

    if (profileError) {
      setError(`Profile creation failed: ${profileError.message}`);
      setLoading(false);
      return;
    }

    const isPaid = selectedPlan && selectedPlan !== 'free_trial';
    const { error: subError } = await supabase.from('subscriptions').insert({
      user_id: userId,
      tier: selectedPlan,
      status: 'pending',
      applications_used: 0,
      applications_limit: 1,
      started_at: new Date().toISOString(),
      renews_at: isPaid ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null,
    });

    if (subError) {
      setError(`Subscription setup failed: ${subError.message}`);
      setLoading(false);
      return;
    }

    if (isPaid) {
      setStep(3);
      setLoading(false);
    } else {
      router.push('/onboarding');
    }
  };

  const selectedPlanObj = PLANS.find(p => p.id === selectedPlan);

  return (
    <div style={{ minHeight: '100vh', padding: '40px 24px', backgroundColor: 'var(--cream)' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <Logo />
        </div>

        <div style={{
          backgroundColor: 'var(--white)',
          borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow)',
          padding: '40px',
          border: '1px solid var(--border)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <span style={{
              backgroundColor: 'var(--green-light)',
              color: 'var(--green)',
              padding: '4px 12px',
              borderRadius: '50px',
              fontSize: '0.75rem',
              fontWeight: 700
            }}>
              Step {step} of 3
            </span>
          </div>

          {step === 1 && (
            <div>
              <h1 style={{ fontSize: '1.6rem', marginBottom: '8px', textAlign: 'center' }}>Choose your plan</h1>
              <p style={{ color: 'var(--grey)', textAlign: 'center', marginBottom: '32px', fontSize: '0.9rem' }}>
                Start free. Upgrade anytime.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                {PLANS.map(plan => (
                  <button
                    key={plan.id}
                    onClick={() => handleSelectPlan(plan.id)}
                    style={{
                      border: selectedPlan === plan.id ? '2px solid var(--green)' : '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '20px',
                      backgroundColor: selectedPlan === plan.id ? 'var(--green-light)' : 'var(--white)',
                      textAlign: 'left',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer',
                      position: 'relative'
                    }}
                  >
                    {plan.founding20 && (
                      <span style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        backgroundColor: 'var(--gold)',
                        color: 'white',
                        fontSize: '0.6rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '50px'
                      }}>Founding 20</span>
                    )}
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{plan.name}</h3>
                    <p style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: '8px' }}>
                      {plan.priceLabel}<span style={{ fontSize: '0.8rem', color: 'var(--grey)', fontWeight: 400 }}>{plan.period}</span>
                    </p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--grey)' }}>{plan.features[0]}</p>
                  </button>
                ))}
              </div>
              <p style={{ textAlign: 'center', marginTop: '24px' }}>
                <a href="/login" style={{ color: 'var(--grey)', fontSize: '0.9rem' }}>Already have an account? Log in</a>
              </p>
            </div>
          )}

          {step === 2 && (
            <div>
              <h1 style={{ fontSize: '1.6rem', marginBottom: '8px', textAlign: 'center' }}>Create your account</h1>
              <p style={{ color: 'var(--grey)', textAlign: 'center', marginBottom: '32px', fontSize: '0.9rem' }}>
                You selected: <strong>{selectedPlanObj?.name}</strong>
              </p>

              <ErrorBox message={error} />

              <form onSubmit={handleCreateAccount}>
                <FormField label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                <FormField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <FormField
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  helperText="Minimum 8 characters"
                />
                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                  <Button type="button" variant="secondary" onClick={() => setStep(1)}>Back</Button>
                  <Button type="submit" disabled={loading} fullWidth>
                    {loading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {step === 3 && selectedPlanObj && (
            <div style={{ textAlign: 'center' }}>
              <h1 style={{ fontSize: '1.6rem', marginBottom: '8px' }}>Complete your payment</h1>
              <p style={{ color: 'var(--grey)', marginBottom: '32px', fontSize: '0.9rem' }}>
                You're subscribing to <strong>{selectedPlanObj.name}</strong> for <strong>{selectedPlanObj.priceLabel}{selectedPlanObj.period}</strong>.
              </p>

              <div style={{
                backgroundColor: 'var(--cream)',
                padding: '24px',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '32px',
                border: '1px solid var(--border)',
                textAlign: 'left'
              }}>
                <p style={{ fontWeight: 600, marginBottom: '8px' }}>Summary</p>
                <p style={{ fontSize: '0.9rem', color: 'var(--grey)', margin: 0 }}>Plan: {selectedPlanObj.name}</p>
                <p style={{ fontSize: '0.9rem', color: 'var(--grey)', margin: 0 }}>Price: {selectedPlanObj.priceLabel}{selectedPlanObj.period}</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Button
                  href={buildWhatsappLink(`Hi! I just signed up for the ${selectedPlanObj.name} plan (${selectedPlanObj.priceLabel}${selectedPlanObj.period}). My email is ${email}. I'd like to complete my payment.`)}
                  variant="whatsapp"
                  fullWidth
                >
                  💬 Complete via WhatsApp
                </Button>
                <Button href="/onboarding" variant="secondary" fullWidth>
                  Continue for now
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
