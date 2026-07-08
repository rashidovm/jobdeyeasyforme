'use client';

/**
 * Tracks which job/blog IDs a job seeker has already seen, so sidebar
 * badges only count genuinely new items since their last visit — not
 * everything posted in the last 7 days.
 */

function key(kind: 'jobs' | 'posts', userId: string) {
  return `jde_seen_${kind}_${userId}`;
}

export function getSeenIds(kind: 'jobs' | 'posts', userId: string): string[] | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(key(kind, userId));
  if (raw === null) return null; // never visited — caller should seed
  try { return JSON.parse(raw); } catch { return []; }
}

export function markSeen(kind: 'jobs' | 'posts', userId: string, ids: string[]) {
  if (typeof window === 'undefined') return;
  const existing = getSeenIds(kind, userId) || [];
  const merged = Array.from(new Set([...existing, ...ids]));
  localStorage.setItem(key(kind, userId), JSON.stringify(merged));
}

/** Count of ids not yet seen. Seeds (marks all as seen, returns 0) on first-ever visit. */
export function countUnseen(kind: 'jobs' | 'posts', userId: string, currentIds: string[]): number {
  const seen = getSeenIds(kind, userId);
  if (seen === null) {
    markSeen(kind, userId, currentIds);
    return 0;
  }
  return currentIds.filter((id) => !seen.includes(id)).length;
}
