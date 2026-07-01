'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
    const checkSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) router.push(nextPath);
    };
    checkSession();
  }, [router, nextPath]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push(nextPath);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      backgroundColor: 'var(--cream)'
    }}>
      <div style={{ marginBottom: '32px' }}>
        <Logo />
      </div>

      <div style={{
        width: '100%',
        maxWidth: '400px',
        backgroundColor: 'var(--white)',
        padding: '40px',
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow)',
        border: '1px solid var(--border)'
      }}>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '8px', textAlign: 'center' }}>Welcome back</h1>
        <p style={{ color: 'var(--grey)', textAlign: 'center', marginBottom: '32px', fontSize: '0.9rem' }}>
          Log in to check your applications
        </p>

        <ErrorBox message={error} />

        <form onSubmit={handleSubmit}>
          <FormField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <FormField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <Button type="submit" fullWidth disabled={loading} style={{ marginTop: '8px' }}>
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem', color: 'var(--grey)' }}>
          Don't have an account?{' '}
          <a href="/signup" style={{ color: 'var(--green)', fontWeight: 600 }}>Start free trial</a>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Loading...
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
