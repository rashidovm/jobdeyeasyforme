'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { markSeen } from '@/lib/seen';

/** Silently marks the given blog post IDs as seen for the logged-in seeker. Renders nothing. */
export default function MarkSeenEffect({ ids }: { ids: string[] }) {
  useEffect(() => {
    if (ids.length === 0) return;
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) markSeen('posts', data.user.id, ids);
    });
  }, [ids]);
  return null;
}
