-- =====================================================================
-- JobDeyEasy — Pass 5 setup
-- Assign a job seeker to a staff member, and make paid signups start
-- as PENDING (admin confirms payment) while Free Trial is active.
-- Run once in SQL Editor. Safe on an existing database.
-- =====================================================================

-- 1) Which staff member owns this job seeker
alter table public.profiles add column if not exists assigned_staff_id uuid references auth.users(id);

-- 2) Signup trigger: Free Trial = active immediately; paid = pending
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
    -- Free trial needs no payment, so it's active. Paid waits for admin.
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
-- DONE. Existing wrongly-active accounts can be fixed from the admin
-- job-seeker page (Confirm payment / Manage plan).
-- =====================================================================
