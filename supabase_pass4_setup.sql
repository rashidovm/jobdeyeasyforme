-- =====================================================================
-- JobDeyEasy — Pass 4 setup
-- Job listing fields, staff posting permission, notifications log,
-- and message read tracking. Run once in SQL Editor.
-- =====================================================================

-- 1) Staff posting permission
alter table public.profiles add column if not exists can_post_jobs boolean not null default false;

-- 2) Job listing fields
alter table public.job_postings add column if not exists work_mode text default 'onsite';
alter table public.job_postings add column if not exists closes_at timestamptz;
alter table public.job_postings add column if not exists filled boolean not null default false;

-- 3) Who may post jobs: admin, or staff the admin approved
create or replace function public.is_job_poster()
returns boolean language sql security definer stable set search_path = public as $$
  select coalesce(
    (select role = 'admin' or (role = 'staff' and can_post_jobs)
     from public.profiles where id = auth.uid()),
    false
  );
$$;

drop policy if exists "Admin insert job_postings" on public.job_postings;
drop policy if exists "Admin update job_postings" on public.job_postings;
create policy "Poster insert job_postings" on public.job_postings
  for insert with check (public.is_job_poster());
create policy "Poster update job_postings" on public.job_postings
  for update using (public.is_job_poster());

-- 4) Notifications log (manual "we alerted you via X")
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  channel text not null,
  note text,
  context text,
  created_at timestamptz default now()
);
alter table public.notifications enable row level security;

drop policy if exists "Notif read" on public.notifications;
create policy "Notif read" on public.notifications
  for select using (user_id = auth.uid() or public.is_staff_or_admin());

drop policy if exists "Notif insert" on public.notifications;
create policy "Notif insert" on public.notifications
  for insert with check (public.is_staff_or_admin());

grant select, insert on public.notifications to authenticated;
grant all privileges on public.notifications to service_role;

-- 5) Message read tracking (for the unread badge)
alter table public.messages add column if not exists read_by_client boolean not null default false;

-- Let the seeker mark their thread's messages read.
drop policy if exists "Thread update read" on public.messages;
create policy "Thread update read" on public.messages
  for update using (thread_user_id = auth.uid() or public.is_staff_or_admin());
grant update on public.messages to authenticated;

-- =====================================================================
-- DONE.
-- =====================================================================
