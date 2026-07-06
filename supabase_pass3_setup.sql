-- =====================================================================
-- JobDeyEasy — Pass 3 setup
-- FIX: let staff/admin update client_materials (CV status now saves).
-- NEW: messages thread between a job seeker and the team.
-- Run once in SQL Editor. Safe on an existing database.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) FIX: staff/admin can update client_materials.
--    Without this, the CV status silently reverts and "Deliver" fails.
-- ---------------------------------------------------------------------
drop policy if exists "Staff update materials" on public.client_materials;
create policy "Staff update materials" on public.client_materials
  for update using (public.is_staff_or_admin());

-- ---------------------------------------------------------------------
-- 2) Messages: a simple thread per job seeker.
-- ---------------------------------------------------------------------
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  thread_user_id uuid not null references auth.users(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  sender_role text not null default 'client',
  body text not null,
  created_at timestamptz default now()
);

alter table public.messages enable row level security;

-- The job seeker sees their own thread; staff/admin see all threads.
drop policy if exists "Thread read" on public.messages;
create policy "Thread read" on public.messages
  for select using (thread_user_id = auth.uid() or public.is_staff_or_admin());

-- Seeker can post to their own thread; staff/admin can post to any thread.
drop policy if exists "Thread insert" on public.messages;
create policy "Thread insert" on public.messages
  for insert with check (
    sender_id = auth.uid()
    and (thread_user_id = auth.uid() or public.is_staff_or_admin())
  );

grant select, insert on public.messages to authenticated;
grant all privileges on public.messages to service_role;

create index if not exists messages_thread_idx on public.messages (thread_user_id, created_at);

-- =====================================================================
-- DONE.
-- =====================================================================
