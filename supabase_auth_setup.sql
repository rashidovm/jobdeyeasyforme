-- =====================================================================
-- JobDeyEasy — Auth setup (run AFTER supabase_schema.sql)
-- Lets you keep "Confirm email" ON permanently, with no RLS timing errors.
--
-- Safe to run on an existing database. Idempotent where possible.
-- Run this whole file once in: Supabase Dashboard -> SQL Editor -> New query
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) GRANTS
-- On newer Supabase projects, RLS policies are not enough on their own:
-- the anon/authenticated roles also need table-level privileges.
-- Missing these is what causes "permission denied for table profiles".
-- ---------------------------------------------------------------------
grant usage on schema public to anon, authenticated;

grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on all tables in schema public to anon;
grant usage, select on all sequences in schema public to anon, authenticated;

-- Apply the same defaults to any tables/sequences created later.
alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public
  grant select on tables to anon;
alter default privileges in schema public
  grant usage, select on sequences to anon, authenticated;

-- ---------------------------------------------------------------------
-- 2) TRIGGER: auto-create profile + subscription on signup
-- Runs as the table owner (security definer), so it bypasses RLS and
-- table grants. This means the client never has to insert the profile
-- itself right after signUp() -- which is what previously failed while
-- the user was still unconfirmed (no session yet).
--
-- It reads full_name + tier from the metadata passed in supabase.auth.signUp:
--   options: { data: { full_name, tier } }
-- ---------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  chosen_tier text := coalesce(new.raw_user_meta_data->>'tier', 'free_trial');
begin
  -- Profile
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email
  )
  on conflict (id) do nothing;

  -- Subscription (defaults; your team confirms payment on paid tiers)
  insert into public.subscriptions (
    user_id, tier, status, applications_used, applications_limit, started_at, renews_at
  )
  values (
    new.id,
    chosen_tier,
    'pending',
    0,
    1,
    now(),
    case when chosen_tier <> 'free_trial' then now() + interval '30 days' else null end
  );

  return new;
end;
$$;

-- (Re)create the trigger.
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================================
-- DONE.
-- After running this:
--   * Keep Authentication -> Providers -> Email -> "Confirm email" ON.
--   * Set Authentication -> URL Configuration:
--       Site URL:        https://YOUR-DOMAIN
--       Redirect URLs:   https://YOUR-DOMAIN/auth/callback
--       (for local dev also add http://localhost:3000/auth/callback)
-- =====================================================================
