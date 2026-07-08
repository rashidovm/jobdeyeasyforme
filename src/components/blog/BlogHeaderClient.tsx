'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Button from '@/components/ui/Button';

export default function BlogHeaderClient({ variant = 'blog' }: { variant?: 'blog' | 'article' }) {
  const [authed, setAuthed] = useState(false);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setAuthed(!!data.user));
  }, []);

  if (authed) return <Button href="/dashboard" variant="secondary" size="sm">← Back to dashboard</Button>;
  if (variant === 'article') return <Button href="/blog" variant="ghost" size="sm">All articles</Button>;
  return <Button href="/" variant="ghost" size="sm">← Home</Button>;
}
