-- =====================================================================
-- JobDeyEasy — Pass 7 setup
-- Fix application delete, add a public job description, and make
-- tickets a real back-and-forth conversation. Run once in SQL Editor.
-- =====================================================================

-- 1) FIX: staff/admin can delete applications (delete was blocked)
drop policy if exists "Staff delete applications" on public.applications;
create policy "Staff delete applications" on public.applications
  for delete using (public.is_staff_or_admin());

-- 2) Public, full job description (separate from the short teaser + internal notes)
alter table public.job_postings add column if not exists description text;

-- 3) Ticket conversation thread
create table if not exists public.ticket_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.tickets(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  sender_role text not null default 'client',
  body text not null,
  created_at timestamptz default now()
);
alter table public.ticket_messages enable row level security;

drop policy if exists "TM read" on public.ticket_messages;
create policy "TM read" on public.ticket_messages
  for select using (
    exists (select 1 from public.tickets t
            where t.id = ticket_id and (t.user_id = auth.uid() or public.is_staff_or_admin()))
  );

drop policy if exists "TM insert" on public.ticket_messages;
create policy "TM insert" on public.ticket_messages
  for insert with check (
    sender_id = auth.uid()
    and exists (select 1 from public.tickets t
                where t.id = ticket_id and (t.user_id = auth.uid() or public.is_staff_or_admin()))
  );

grant select, insert on public.ticket_messages to authenticated;
grant all privileges on public.ticket_messages to service_role;
create index if not exists tm_ticket_idx on public.ticket_messages (ticket_id, created_at);

-- =====================================================================
-- DONE.
-- =====================================================================
