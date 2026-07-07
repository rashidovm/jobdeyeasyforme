'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { LogIn } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import AuthShell from '@/components/ui/AuthShell';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import ErrorBox from '@/components/ui/ErrorBox';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next') || '/dashboard';

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) routeByRole(data.user.id);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, nextPath]);

  const routeByRole = async (userId: string) => {
    const { data: roleRow } = await supabase.from('profiles').select('role').eq('id', userId).maybeSingle();
    if (roleRow && (roleRow.role === 'admin' || roleRow.role === 'staff')) router.push('/admin');
    else router.push(nextPath);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); }
    else if (data.user) routeByRole(data.user.id);
  };

  return (
    <AuthShell>
      <span className="eyebrow">Welcome back</span>
      <h1 className="display mt-3 text-4xl">Log in to your desk.</h1>
      <p className="mt-2 text-sm text-muted">Check your applications and messages.</p>

      <div className="mt-8">
        <ErrorBox message={error} />
        <form onSubmit={handleSubmit}>
          <FormField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          <FormField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
          <Button type="submit" fullWidth disabled={loading} className="mt-2">
            {loading ? 'Signing in…' : <>Sign in <LogIn className="h-4 w-4" /></>}
          </Button>
        </form>
      </div>

      <p className="mt-6 text-sm text-muted">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="font-semibold text-green hover:underline">Start free trial</Link>
      </p>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-cream text-muted">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
