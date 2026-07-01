'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, ArrowLeft, ArrowRight, MailCheck, MessageCircle } from 'lucide-react';
import { supabase, buildWhatsappLink } from '@/lib/supabase';
import { PLANS } from '@/lib/constants';
import Logo from '@/components/ui/Logo';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import ErrorBox from '@/components/ui/ErrorBox';
import { cn } from '@/lib/cn';
import { SubscriptionTier } from '@/types';

type Stage = 'plan' | 'account' | 'payment' | 'verify';

export default function SignupPage() {
  const [stage, setStage] = useState<Stage>('plan');
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionTier | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const selectedPlanObj = PLANS.find((p) => p.id === selectedPlan);
  const isPaid = !!selectedPlan && selectedPlan !== 'free_trial';
  const stepNumber = stage === 'plan' ? 1 : stage === 'account' ? 2 : 3;

  const choosePlan = (id: SubscriptionTier) => {
    setSelectedPlan(id);
    setStage('account');
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    setLoading(true);

    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, tier: selectedPlan },
        emailRedirectTo: `${origin}/auth/callback?next=/onboarding`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    setLoading(false);

    // If email confirmation is OFF, Supabase returns a live session immediately.
    if (data.session) {
      if (isPaid) setStage('payment');
      else router.push('/onboarding');
      return;
    }

    // Email confirmation is ON: ask them to confirm.
    setStage('verify');
  };

  return (
    <main className="min-h-screen bg-cream px-6 py-10">
      <div className={cn('mx-auto', stage === 'plan' ? 'max-w-5xl' : 'max-w-xl')}>
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>

        <div className="rounded-3xl border border-line bg-white p-7 shadow-card sm:p-10">
          {stage !== 'verify' && (
            <div className="mb-8 flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-green-light px-3.5 py-1.5 text-xs font-bold text-green">
                Step {stepNumber} of 3
              </span>
            </div>
          )}

          {/* STEP 1 — plan */}
          {stage === 'plan' && (
            <div>
              <div className="text-center">
                <h1 className="text-2xl font-extrabold">Choose your plan</h1>
                <p className="mt-2 text-sm text-muted">
                  A plan sets how many jobs we prepare for you each month. Start free — upgrade anytime.
                </p>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {PLANS.map((plan) => {
                  const featured = plan.id === 'starter';
                  return (
                    <button
                      key={plan.id}
                      onClick={() => choosePlan(plan.id)}
                      className={cn(
                        'relative flex flex-col rounded-2xl border p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-card',
                        featured ? 'border-green ring-1 ring-green/20' : 'border-line'
                      )}
                    >
                      {plan.founding20 && (
                        <span className="absolute right-3 top-3 rounded-full bg-gold px-2 py-0.5 text-[0.6rem] font-bold text-white">
                          Founding 20
                        </span>
                      )}
                      <h3 className="text-base font-bold">{plan.name}</h3>
                      <p className="text-xs font-medium text-gold">{plan.bestFor}</p>
                      <div className="mt-3 flex items-baseline gap-1">
                        <span className="text-2xl font-extrabold">{plan.priceLabel}</span>
                        {plan.period && <span className="text-xs text-muted">{plan.period}</span>}
                      </div>
                      <ul className="mt-4 flex-1 space-y-2">
                        {plan.features.slice(0, 4).map((f) => (
                          <li key={f} className="flex items-start gap-2 text-xs text-muted">
                            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green" strokeWidth={3} />
                            {f}
                          </li>
                        ))}
                        {plan.features.length > 4 && (
                          <li className="text-xs font-medium text-green">+ {plan.features.length - 4} more</li>
                        )}
                      </ul>
                      <span
                        className={cn(
                          'mt-5 inline-flex items-center justify-center gap-1.5 rounded-full py-2 text-sm font-semibold',
                          featured ? 'bg-green text-white' : 'border-2 border-green text-green'
                        )}
                      >
                        {plan.cta} <ArrowRight className="h-4 w-4" />
                      </span>
                    </button>
                  );
                })}
              </div>

              <p className="mt-7 text-center text-sm">
                <Link href="/login" className="text-muted hover:text-ink">
                  Already have an account? Log in
                </Link>
              </p>
            </div>
          )}

          {/* STEP 2 — account */}
          {stage === 'account' && (
            <div>
              <div className="text-center">
                <h1 className="text-2xl font-extrabold">Create your account</h1>
                <p className="mt-2 text-sm text-muted">
                  You selected <span className="font-semibold text-ink">{selectedPlanObj?.name}</span>
                  {selectedPlanObj?.period ? ` · ${selectedPlanObj.priceLabel}${selectedPlanObj.period}` : ' · free'}.
                </p>
              </div>

              {selectedPlanObj && (
                <div className="mt-6 rounded-2xl border border-line bg-cream p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-gold">What&apos;s included</p>
                  <ul className="mt-2.5 grid gap-x-4 gap-y-2 sm:grid-cols-2">
                    {selectedPlanObj.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-ink">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-green" strokeWidth={3} />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-7">
                <ErrorBox message={error} />
                <form onSubmit={handleCreateAccount}>
                  <FormField label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} required autoComplete="name" />
                  <FormField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
                  <FormField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required helperText="Minimum 8 characters" autoComplete="new-password" />
                  <div className="mt-6 flex gap-3">
                    <Button type="button" variant="secondary" onClick={() => setStage('plan')}>
                      <ArrowLeft className="h-4 w-4" /> Back
                    </Button>
                    <Button type="submit" disabled={loading} fullWidth>
                      {loading ? 'Creating account…' : 'Create account'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* STEP 3a — payment (paid, confirmation off) */}
          {stage === 'payment' && selectedPlanObj && (
            <div className="text-center">
              <h1 className="text-2xl font-extrabold">Complete your payment</h1>
              <p className="mt-2 text-sm text-muted">
                You&apos;re subscribing to <span className="font-semibold text-ink">{selectedPlanObj.name}</span> for{' '}
                <span className="font-semibold text-ink">{selectedPlanObj.priceLabel}{selectedPlanObj.period}</span>.
              </p>

              <div className="mx-auto mt-6 max-w-sm rounded-2xl border border-line bg-cream p-5 text-left">
                <p className="text-xs font-bold uppercase tracking-wide text-gold">Summary</p>
                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-muted">Plan</span>
                  <span className="font-semibold">{selectedPlanObj.name}</span>
                </div>
                <div className="mt-1 flex justify-between text-sm">
                  <span className="text-muted">Price</span>
                  <span className="font-semibold">{selectedPlanObj.priceLabel}{selectedPlanObj.period}</span>
                </div>
              </div>

              <div className="mt-7 flex flex-col gap-3">
                <Button
                  href={buildWhatsappLink(`Hi! I just signed up for the ${selectedPlanObj.name} plan (${selectedPlanObj.priceLabel}${selectedPlanObj.period}). My email is ${email}. I'd like to complete my payment.`)}
                  variant="whatsapp"
                  fullWidth
                >
                  <MessageCircle className="h-4 w-4" /> Complete via WhatsApp
                </Button>
                <Button href="/onboarding" variant="secondary" fullWidth>
                  Continue to onboarding
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3b — verify email (confirmation on) */}
          {stage === 'verify' && (
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-light text-green">
                <MailCheck className="h-8 w-8" />
              </div>
              <h1 className="mt-5 text-2xl font-extrabold">Confirm your email</h1>
              <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
                We sent a confirmation link to <span className="font-semibold text-ink">{email}</span>. Click it to
                verify your account — you&apos;ll be taken straight to onboarding.
              </p>

              {isPaid && selectedPlanObj && (
                <div className="mx-auto mt-6 max-w-sm rounded-2xl border border-gold/40 bg-gold-light p-4 text-left">
                  <p className="text-sm font-medium text-gold">
                    You picked {selectedPlanObj.name} ({selectedPlanObj.priceLabel}{selectedPlanObj.period}). You can
                    sort payment now on WhatsApp while you wait for the email.
                  </p>
                  <div className="mt-3">
                    <Button
                      href={buildWhatsappLink(`Hi! I just signed up for the ${selectedPlanObj.name} plan (${selectedPlanObj.priceLabel}${selectedPlanObj.period}). My email is ${email}. I'd like to complete my payment.`)}
                      variant="whatsapp"
                      size="sm"
                      fullWidth
                    >
                      <MessageCircle className="h-4 w-4" /> Complete payment
                    </Button>
                  </div>
                </div>
              )}

              <p className="mt-6 text-sm text-muted">
                Didn&apos;t get it? Check spam, or{' '}
                <Link href="/login" className="font-semibold text-green hover:underline">
                  log in
                </Link>{' '}
                once confirmed.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
