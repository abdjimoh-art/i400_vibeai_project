-- ============================================================
-- IceTrack — Quick patch: fix login + update demo passwords
-- Run this AFTER supabase-reset.sql (or any time you need to reset
-- the recursive admin policy / change the demo passwords).
-- ============================================================

-- 1. Drop the recursive policy that breaks login.
--    The original "Admins can view all profiles" policy did
--    SELECT FROM public.profiles inside a profiles policy,
--    which makes Postgres recurse forever and Supabase Auth
--    fails with "Database error querying schema".
drop policy if exists "Admins can view all profiles" on public.profiles;

-- 2. Replace it with a SECURITY DEFINER helper that truly bypasses
--    RLS for the inner read. On Supabase, SECURITY DEFINER alone
--    still applies row security to SELECTs inside the function,
--    which re-enters the same policies and recurses →
--    "Database error querying schema".  SET row_security = off
--    applies for the duration of the function body (Postgres 15+).
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select coalesce(
    (select role = 'admin' from public.profiles where id = auth.uid()),
    false
  );
$$;

grant execute on function public.is_admin() to anon, authenticated, service_role;

create policy "Admins can view all profiles"
  on public.profiles for select
  using (public.is_admin());

-- 3. Update demo passwords:
--    parent     → parent123
--    instructor → instructor123
--    admin      → frankSouth (unchanged)
update auth.users
   set encrypted_password = crypt('parent123', gen_salt('bf')),
       updated_at = now()
 where email = 'parent@icetrack.com';

update auth.users
   set encrypted_password = crypt('instructor123', gen_salt('bf')),
       updated_at = now()
 where email = 'instructor@icetrack.com';

update auth.users
   set encrypted_password = crypt('frankSouth', gen_salt('bf')),
       updated_at = now()
 where email = 'admin@icetrack.com';
