-- =====================================================================
-- JobDeyEasy — Pass 1: Team setup (roles, staff access, work columns)
-- Run AFTER supabase_schema.sql and supabase_auth_setup.sql.
-- Safe to run on an existing database. Run once in SQL Editor.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) ROLE on profiles: 'client' (default), 'staff', or 'admin'
-- ---------------------------------------------------------------------
alter table public.profiles
  add column if not exists role text not null default 'client';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_role_check'
  ) then
    alter table public.profiles
      add constraint profiles_role_check check (role in ('client', 'staff', 'admin'));
  end if;
end $$;

-- ---------------------------------------------------------------------
-- 2) Work columns on applications (assignment, corrections, deadline)
-- ---------------------------------------------------------------------
alter table public.applications add column if not exists assigned_to uuid references auth.users(id);
alter table public.applications add column if not exists correction_notes text;
alter table public.applications add column if not exists due_at timestamptz;

-- ---------------------------------------------------------------------
-- 3) Role helper (SECURITY DEFINER so it bypasses RLS -> no recursion)
-- ---------------------------------------------------------------------
create or replace function public.user_role()
returns text
language sql
security definer
stable
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_staff_or_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce((select role from public.profiles where id = auth.uid()) in ('staff','admin'), false);
$$;

-- ---------------------------------------------------------------------
-- 4) Role-aware signup trigger.
--    - Clients get a profile + a subscription (limits set by tier).
--    - Staff/Admin (created via the admin panel with role in metadata)
--      get a profile only -- no subscription.
-- ---------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta_role   text := coalesce(new.raw_user_meta_data->>'role', 'client');
  chosen_tier text := coalesce(new.raw_user_meta_data->>'tier', 'free_trial');
  lim         int;
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    meta_role
  )
  on conflict (id) do nothing;

  if meta_role = 'client' then
    lim := case chosen_tier
             when 'starter' then 5
             when 'active_search' then 15
             when 'unlimited_hunt' then 30
             else 1
           end;

    insert into public.subscriptions (
      user_id, tier, status, applications_used, applications_limit, started_at, renews_at
    )
    values (
      new.id, chosen_tier, 'pending', 0, lim, now(), now() + interval '30 days'
    );
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- 5) RLS: let staff + admin work across all clients.
--    (Existing "own row" client policies stay in place.)
-- ---------------------------------------------------------------------

-- Profiles
drop policy if exists "Staff read all profiles" on public.profiles;
create policy "Staff read all profiles" on public.profiles
  for select using (public.is_staff_or_admin());

drop policy if exists "Admin update any profile" on public.profiles;
create policy "Admin update any profile" on public.profiles
  for update using (public.user_role() = 'admin');

-- Subscriptions (staff update needed to tick down the quota on delivery)
drop policy if exists "Staff read all subscriptions" on public.subscriptions;
create policy "Staff read all subscriptions" on public.subscriptions
  for select using (public.is_staff_or_admin());

drop policy if exists "Staff update subscriptions" on public.subscriptions;
create policy "Staff update subscriptions" on public.subscriptions
  for update using (public.is_staff_or_admin());

-- Client materials
drop policy if exists "Staff read all materials" on public.client_materials;
create policy "Staff read all materials" on public.client_materials
  for select using (public.is_staff_or_admin());

-- Applications
drop policy if exists "Staff read all applications" on public.applications;
create policy "Staff read all applications" on public.applications
  for select using (public.is_staff_or_admin());

drop policy if exists "Staff insert applications" on public.applications;
create policy "Staff insert applications" on public.applications
  for insert with check (public.is_staff_or_admin());

drop policy if exists "Staff update applications" on public.applications;
create policy "Staff update applications" on public.applications
  for update using (public.is_staff_or_admin());

-- Job postings (admin manages; public read already exists from schema)
drop policy if exists "Admin insert job_postings" on public.job_postings;
create policy "Admin insert job_postings" on public.job_postings
  for insert with check (public.user_role() = 'admin');

drop policy if exists "Admin update job_postings" on public.job_postings;
create policy "Admin update job_postings" on public.job_postings
  for update using (public.user_role() = 'admin');

drop policy if exists "Admin delete job_postings" on public.job_postings;
create policy "Admin delete job_postings" on public.job_postings
  for delete using (public.user_role() = 'admin');

-- =====================================================================
-- 6) MAKE YOURSELF ADMIN
-- After you have signed up once with your own email through the app,
-- run this line ONCE (replace the email), then log out and back in:
--
--   update public.profiles set role = 'admin' where email = 'YOU@EXAMPLE.COM';
--
-- Staff accounts are then created from inside the app (Admin -> Staff).
-- =====================================================================
