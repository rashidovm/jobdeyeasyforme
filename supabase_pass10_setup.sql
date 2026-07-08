-- =====================================================================
-- JobDeyEasy — Pass 10 setup (run once in SQL Editor)
-- (1) Blog: staff can write/edit, but only an admin can publish/unpublish.
-- (2) A public storage bucket so staff/admin can upload blog images
--     directly instead of hosting them elsewhere.
-- =====================================================================

-- 1) Blog approval gate
--    Staff keep insert/update/delete (so they can write and edit drafts),
--    but any row they touch is forced to published = false at the
--    database level. Only an admin (checked via public.user_role()) may
--    insert or update a row where published = true.
drop policy if exists "Posts staff insert" on public.posts;
drop policy if exists "Posts staff update" on public.posts;

create policy "Posts insert" on public.posts
  for insert with check (
    public.user_role() = 'admin'
    or (public.is_staff_or_admin() and published = false)
  );

create policy "Posts update" on public.posts
  for update using (
    public.is_staff_or_admin()
  ) with check (
    public.user_role() = 'admin'
    or (public.is_staff_or_admin() and published = false)
  );

-- (delete policy is unchanged — staff/admin can still delete their drafts)

-- 2) Public bucket for blog images
insert into storage.buckets (id, name, public)
values ('blog-images', 'blog-images', true)
on conflict (id) do nothing;

drop policy if exists "Blog images public read" on storage.objects;
create policy "Blog images public read" on storage.objects
  for select using (bucket_id = 'blog-images');

drop policy if exists "Blog images staff upload" on storage.objects;
create policy "Blog images staff upload" on storage.objects
  for insert with check (bucket_id = 'blog-images' and public.is_staff_or_admin());

drop policy if exists "Blog images staff manage" on storage.objects;
create policy "Blog images staff manage" on storage.objects
  for update using (bucket_id = 'blog-images' and public.is_staff_or_admin());

drop policy if exists "Blog images staff delete" on storage.objects;
create policy "Blog images staff delete" on storage.objects
  for delete using (bucket_id = 'blog-images' and public.is_staff_or_admin());

-- =====================================================================
-- DONE. After running this, a staff member who checks "Publish now" (or
-- clicks the eye icon) will simply have it ignored/blocked — publishing
-- is admin-only from here on, matching the app's own UI restriction.
-- =====================================================================
