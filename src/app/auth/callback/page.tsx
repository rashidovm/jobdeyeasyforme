'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Logo from '@/components/ui/Logo';

function Callback() {
  const router = useRouter();
  const params = useSearchParams();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let done = false;
    const next = params.get('next') || '/onboarding';

    const finish = () => {
      if (!done) {
        done = true;
        router.replace(next);
      }
    };

    (async () => {
      // 1) Session may already be set (implicit flow via detectSessionInUrl).
      const existing = await supabase.auth.getSession();
      if (existing.data.session) return finish();

      // 2) PKCE flow: exchange the ?code for a session.
      const code = params.get('code');
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
        if (!error) return finish();
      }

      // 3) OTP-style link: verify token_hash + type.
      const tokenHash = params.get('token_hash');
      const type = params.get('type');
      if (tokenHash && type) {
        const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: type as any });
        if (!error) return finish();
      }

      // 4) Give detectSessionInUrl a moment, then re-check once.
      const { data } = await supabase.auth.getSession();
      if (data.session) return finish();

      setFailed(true);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) finish();
    });

    return () => sub.subscription.unsubscribe();
  }, [router, params]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-cream px-6 text-center">
      <Logo />
      {!failed ? (
        <p className="mt-8 flex items-center gap-3 text-muted">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-green border-t-transparent" />
          Confirming your email…
        </p>
      ) : (
        <div className="mt-8 max-w-sm">
          <p className="font-semibold text-ink">We couldn&apos;t confirm this link automatically.</p>
          <p className="mt-2 text-sm text-muted">
            It may have expired or already been used. Try logging in — if it&apos;s confirmed, you&apos;ll go
            straight through.
          </p>
          <Link href="/login" className="mt-5 inline-block font-semibold text-green hover:underline">
            Go to log in
          </Link>
        </div>
      )}
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-cream text-muted">Loading…</div>}>
      <Callback />
    </Suspense>
  );
}
