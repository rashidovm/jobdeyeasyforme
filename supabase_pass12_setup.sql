-- =====================================================================
-- JobDeyEasy — Pass 12 setup (run once in SQL Editor)
-- SEO slugs, blog featured/views, staff blog permission, testimonials,
-- direct-paid signup bonus, presence tracking, application apply-type.
-- =====================================================================

-- 1) Blog: SEO slug, view count, featured flag
alter table public.posts add column if not exists slug text;
alter table public.posts add column if not exists views integer not null default 0;
alter table public.posts add column if not exists featured boolean not null default false;

create unique index if not exists posts_slug_key on public.posts (slug) where slug is not null;

-- Backfill slugs for existing posts from their title (id kept as fallback route)
update public.posts
set slug = trim(both '-' from regexp_replace(lower(trim(title)), '[^a-z0-9]+', '-', 'g'))
where slug is null;

-- 2) Staff permission: who may write/manage blog posts
alter table public.profiles add column if not exists can_post_blog boolean not null default false;

create or replace function public.is_blog_poster()
returns boolean language sql security definer stable set search_path = public as $$
  select coalesce(
    (select role = 'admin' or (role = 'staff' and can_post_blog)
     from public.profiles where id = auth.uid()),
    false
  );
$$;

drop policy if exists "Posts insert" on public.posts;
drop policy if exists "Posts update" on public.posts;
create policy "Posts insert" on public.posts
  for insert with check (
    public.user_role() = 'admin'
    or (public.is_blog_poster() and published = false)
  );
create policy "Posts update" on public.posts
  for update using (
    public.is_blog_poster()
  ) with check (
    public.user_role() = 'admin'
    or (public.is_blog_poster() and published = false)
  );

-- Anyone (incl. anon) may bump the view counter on a published post
drop policy if exists "Posts view count" on public.posts;
create policy "Posts view count" on public.posts
  for update using (published = true) with check (published = true);

-- 3) Presence: last time a job seeker was active
alter table public.profiles add column if not exists last_seen_at timestamptz;

-- 4) Applications: how they apply (email vs a form), for the admin fill form
alter table public.applications add column if not exists apply_type text default 'email';

-- 5) Testimonials (auto-drafted when a seeker confirms "heard back", admin approves)
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  application_id uuid references public.applications(id) on delete set null,
  seeker_name text,
  job_title text,
  company text,
  message text,
  approved boolean not null default false,
  created_at timestamptz default now()
);
alter table public.testimonials enable row level security;

drop policy if exists "Testimonials public read" on public.testimonials;
create policy "Testimonials public read" on public.testimonials
  for select using (approved = true or public.is_staff_or_admin());

drop policy if exists "Testimonials client insert own" on public.testimonials;
create policy "Testimonials client insert own" on public.testimonials
  for insert with check (user_id = auth.uid());

drop policy if exists "Testimonials staff manage" on public.testimonials;
create policy "Testimonials staff manage" on public.testimonials
  for update using (public.is_staff_or_admin());

drop policy if exists "Testimonials staff delete" on public.testimonials;
create policy "Testimonials staff delete" on public.testimonials
  for delete using (public.is_staff_or_admin());

grant select, insert on public.testimonials to authenticated;
grant select on public.testimonials to anon;
grant all privileges on public.testimonials to service_role;

-- 6) Direct-paid signup bonus: +1 application when someone subscribes to a
--    paid plan WITHOUT going through the free trial first.
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
  st          text;
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
    -- Bonus: skipping the free trial and paying straight away earns +1 application.
    if chosen_tier <> 'free_trial' then
      lim := lim + 1;
    end if;
    st := case when chosen_tier = 'free_trial' then 'active' else 'pending' end;

    insert into public.subscriptions (
      user_id, tier, status, applications_used, applications_limit, started_at, renews_at
    )
    values (new.id, chosen_tier, st, 0, lim, now(), now() + interval '30 days');
  end if;

  return new;
end;
$$;

-- =====================================================================
-- DONE. Existing paid subscriptions that started before this change
-- won't retroactively get the +1 — use "Grant +1 bonus application"
-- on their admin page to add it manually.
-- =====================================================================
