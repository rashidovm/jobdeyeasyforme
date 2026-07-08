-- =====================================================================
-- JobDeyEasy — Pass 9 setup (run once in SQL Editor)
-- (1) Manual applications (fill in directly, job listing optional)
-- (2) "Did you send it?" reminders + "Have you heard back?" follow-ups
-- (3) Follow-up email + reference/guide document per application
-- (4) Jobs: manual close (auto-close by deadline handled in the app)
-- (5) Blog posts
-- =====================================================================

-- 1) Manual applications
alter table public.applications alter column job_id drop not null;
alter table public.applications add column if not exists manual_job_title text;
alter table public.applications add column if not exists manual_company text;

-- 2) Send confirmation + reminders
alter table public.applications add column if not exists client_sent boolean not null default false;
alter table public.applications add column if not exists client_sent_at timestamptz;
alter table public.applications add column if not exists remind_after timestamptz;

-- Heard-back follow-up
alter table public.applications add column if not exists heard_back boolean not null default false;
alter table public.applications add column if not exists heard_back_at timestamptz;
alter table public.applications add column if not exists heard_remind_after timestamptz;
alter table public.applications add column if not exists needs_followup boolean not null default false;

-- 3) Follow-up email + reference document
alter table public.applications add column if not exists followup_to text;
alter table public.applications add column if not exists followup_email text;
alter table public.applications add column if not exists reference_doc_url text;

-- Seekers can update their own applications (confirm sent / heard back)
drop policy if exists "Client update own applications" on public.applications;
create policy "Client update own applications" on public.applications
  for update using (user_id = auth.uid());
grant update on public.applications to authenticated;

-- 4) Jobs: manual close toggle (deadline auto-close is computed in the app)
alter table public.job_postings add column if not exists closed boolean not null default false;

-- 5) Blog
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  hook text,
  content text not null,
  featured_image_url text,
  published boolean not null default false,
  author_id uuid references auth.users(id),
  created_at timestamptz default now(),
  published_at timestamptz
);
alter table public.posts enable row level security;

drop policy if exists "Posts public read" on public.posts;
create policy "Posts public read" on public.posts
  for select using (published = true or public.is_staff_or_admin());

drop policy if exists "Posts staff insert" on public.posts;
create policy "Posts staff insert" on public.posts
  for insert with check (public.is_staff_or_admin());

drop policy if exists "Posts staff update" on public.posts;
create policy "Posts staff update" on public.posts
  for update using (public.is_staff_or_admin());

drop policy if exists "Posts staff delete" on public.posts;
create policy "Posts staff delete" on public.posts
  for delete using (public.is_staff_or_admin());

grant select on public.posts to anon;
grant select, insert, update, delete on public.posts to authenticated;
grant all privileges on public.posts to service_role;

-- =====================================================================
-- DONE.
-- =====================================================================
