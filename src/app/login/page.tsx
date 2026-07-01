'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { LogIn } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Logo from '@/components/ui/Logo';
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
    if (roleRow && (roleRow.role === 'admin' || roleRow.role === 'staff')) {
      router.push('/admin');
    } else {
      router.push(nextPath);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else if (data.user) {
      routeByRole(data.user.id);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-cream px-6 py-12">
      <div className="mb-8">
        <Logo />
      </div>
      <div className="w-full max-w-md rounded-3xl border border-line bg-white p-8 shadow-card sm:p-10">
        <h1 className="text-center text-2xl font-extrabold">Welcome back</h1>
        <p className="mt-1.5 text-center text-sm text-muted">Log in to check your applications.</p>

        <div className="mt-7">
          <ErrorBox message={error} />
          <form onSubmit={handleSubmit}>
            <FormField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            <FormField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
            <Button type="submit" fullWidth disabled={loading} className="mt-2">
              {loading ? 'Signing in…' : <>Sign in <LogIn className="h-4 w-4" /></>}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-semibold text-green hover:underline">
            Start free trial
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-cream text-muted">Loading…</div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
