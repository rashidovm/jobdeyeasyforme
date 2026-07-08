'use client';

import React, { useEffect, useState } from 'react';
import { Share2, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Button from '@/components/ui/Button';
import { markSeen } from '@/lib/seen';

export function ArticleHeaderButton() {
  const [authed, setAuthed] = useState(false);
  useEffect(() => { supabase.auth.getUser().then(({ data }) => setAuthed(!!data.user)); }, []);
  if (authed) return <Button href="/dashboard" variant="secondary" size="sm">← Back to dashboard</Button>;
  return <Button href="/blog" variant="ghost" size="sm">All articles</Button>;
}

export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const share = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (navigator.share) {
      try { await navigator.share({ title, url }); } catch { /* cancelled */ }
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    }
  };
  return (
    <button onClick={share} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-ink shadow-soft transition-colors hover:border-green hover:text-green">
      {copied ? <><Check className="h-4 w-4" /> Copied</> : <><Share2 className="h-4 w-4" /> Share article</>}
    </button>
  );
}

/** Renders nothing. Marks this post as seen and, once per browser, bumps its view count. */
export function ArticleTracking({ postId }: { postId: string }) {
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) markSeen('posts', data.user.id, [postId]);
    });
    const key = `jde_viewed_${postId}`;
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, '1');
      supabase.from('posts').select('views').eq('id', postId).single().then(({ data: row }) => {
        supabase.from('posts').update({ views: (row?.views || 0) + 1 }).eq('id', postId);
      });
    }
  }, [postId]);
  return null;
}

/** Signup / dashboard CTA under an article, auth-aware. */
export function ArticleCTA() {
  const [authed, setAuthed] = useState(false);
  const [checked, setChecked] = useState(false);
  useEffect(() => { supabase.auth.getUser().then(({ data }) => { setAuthed(!!data.user); setChecked(true); }); }, []);
  if (!checked || authed) return null;
  return (
    <div className="mt-12 rounded-3xl border border-green/30 bg-green-light p-8 text-center">
      <h2 className="text-2xl">Ready to stop applying alone?</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-green-dark">We prepare your tailored CV, cover letter and a ready-to-send email. You just hit Send.</p>
      <div className="mt-5 flex justify-center"><Button href="/signup">Start free trial</Button></div>
    </div>
  );
}
