-- =====================================================================
-- JobDeyEasy — Pass 6 setup
-- Support tickets (separate from chat) + hide internal job notes from
-- the public jobs page. Run once in SQL Editor.
-- =====================================================================

-- 1) Tickets — separate from chat
create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null,
  body text not null,
  status text not null default 'open',
  response text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.tickets enable row level security;

drop policy if exists "Ticket read" on public.tickets;
create policy "Ticket read" on public.tickets
  for select using (user_id = auth.uid() or public.is_staff_or_admin());

drop policy if exists "Ticket insert own" on public.tickets;
create policy "Ticket insert own" on public.tickets
  for insert with check (user_id = auth.uid());

drop policy if exists "Ticket staff update" on public.tickets;
create policy "Ticket staff update" on public.tickets
  for update using (public.is_staff_or_admin());

grant select, insert, update on public.tickets to authenticated;
grant all privileges on public.tickets to service_role;

-- 2) Keep internal job notes out of the PUBLIC jobs page.
-- The public page never selects this column, and now anon can't either.
revoke select (internal_description) on public.job_postings from anon;

-- =====================================================================
-- DONE.
-- =====================================================================
