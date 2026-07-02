-- =====================================================================
-- JobDeyEasy — Pass 2 setup
-- CV deliverable pipeline, real CV uploads, and the 1/3/7/15 counts.
-- Run AFTER the schema + auth_setup + team_setup files. Run once.
-- Safe to run on an existing database.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) New columns on client_materials (intake + CV pipeline status)
-- ---------------------------------------------------------------------
alter table public.client_materials add column if not exists dream_job text;
alter table public.client_materials add column if not exists cv_review_status text not null default 'drafting';
alter table public.client_materials add column if not exists cv_due_at timestamptz;
alter table public.client_materials add column if not exists delivery_channels text[] default '{whatsapp}';
alter table public.client_materials add column if not exists uploaded_cv_url text;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'cm_cv_status_check') then
    alter table public.client_materials
      add constraint cm_cv_status_check
      check (cv_review_status in ('drafting','human_review','ready','delivered'));
  end if;
end $$;

-- ---------------------------------------------------------------------
-- 2) cv_deliverables: the actual CV/cover-letter/email content.
--    Kept in its own table so clients CANNOT read it until delivered.
-- ---------------------------------------------------------------------
create table if not exists public.cv_deliverables (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  ai_cv_draft text,
  ai_cover_letter_draft text,
  final_cv_url text,
  final_cover_letter_url text,
  final_email text,
  final_job_link text,
  delivered boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.cv_deliverables enable row level security;

-- Staff/admin: full access.
drop policy if exists "Staff read deliverables" on public.cv_deliverables;
create policy "Staff read deliverables" on public.cv_deliverables
  for select using (public.is_staff_or_admin());

drop policy if exists "Staff write deliverables" on public.cv_deliverables;
create policy "Staff write deliverables" on public.cv_deliverables
  for insert with check (public.is_staff_or_admin());

drop policy if exists "Staff update deliverables" on public.cv_deliverables;
create policy "Staff update deliverables" on public.cv_deliverables
  for update using (public.is_staff_or_admin());

-- Client: can ONLY read their own row, and ONLY once delivered.
drop policy if exists "Client read delivered" on public.cv_deliverables;
create policy "Client read delivered" on public.cv_deliverables
  for select using (user_id = auth.uid() and delivered = true);

-- ---------------------------------------------------------------------
-- 3) Storage bucket for uploaded CVs (private).
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('cvs', 'cvs', false)
on conflict (id) do nothing;

drop policy if exists "cv upload own" on storage.objects;
create policy "cv upload own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'cvs' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "cv read own or staff" on storage.objects;
create policy "cv read own or staff" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'cvs'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_staff_or_admin())
  );

drop policy if exists "cv update own" on storage.objects;
create policy "cv update own" on storage.objects
  for update to authenticated
  using (bucket_id = 'cvs' and (storage.foldername(name))[1] = auth.uid()::text);

-- ---------------------------------------------------------------------
-- 4) Update the signup trigger to the new counts: 1 / 3 / 7 / 15
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
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''), new.email, meta_role)
  on conflict (id) do nothing;

  if meta_role = 'client' then
    lim := case chosen_tier
             when 'starter' then 3
             when 'active_search' then 7
             when 'unlimited_hunt' then 15
             else 1
           end;
    insert into public.subscriptions (
      user_id, tier, status, applications_used, applications_limit, started_at, renews_at
    )
    values (new.id, chosen_tier, 'pending', 0, lim, now(), now() + interval '30 days');
  end if;

  return new;
end;
$$;

-- Optional: bring EXISTING clients' limits in line with the new counts.
-- (Uncomment to run.)
-- update public.subscriptions set applications_limit = 3  where tier = 'starter';
-- update public.subscriptions set applications_limit = 7  where tier = 'active_search';
-- update public.subscriptions set applications_limit = 15 where tier = 'unlimited_hunt';
-- update public.subscriptions set applications_limit = 1  where tier = 'free_trial';

-- =====================================================================
-- DONE. Also add GROQ_API_KEY to Vercel (server-only) for AI drafting.
-- =====================================================================
