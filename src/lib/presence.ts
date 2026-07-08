import { supabase } from '@/lib/supabase';

/** Stamps the current user's profile with "now" — call on login and periodically while active. */
export async function touchPresence() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from('profiles').update({ last_seen_at: new Date().toISOString() }).eq('id', user.id);
}

const ONLINE_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

export function isOnline(lastSeenAt?: string | null) {
  if (!lastSeenAt) return false;
  return Date.now() - new Date(lastSeenAt).getTime() < ONLINE_WINDOW_MS;
}

export function timeAgo(lastSeenAt?: string | null) {
  if (!lastSeenAt) return 'never logged in';
  const ms = Date.now() - new Date(lastSeenAt).getTime();
  if (ms < ONLINE_WINDOW_MS) return 'Online now';
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(lastSeenAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}
