-- ============================================================
-- IceTrack — Hard auth + RLS repair
-- Run this once in Supabase SQL Editor when login returns:
--   "Database error querying schema"
-- ============================================================

create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- 1) Repair recursive profiles RLS (safe to re-run)
-- ------------------------------------------------------------
drop policy if exists "Admins can view all profiles" on public.profiles;

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

-- ------------------------------------------------------------
-- 2) Repair manually-seeded auth.users rows
--    Older SQL inserts can leave auth token columns NULL and
--    cause GoTrue login failures ("Database error querying schema").
-- ------------------------------------------------------------
do $$
declare
  v_email text;
  v_password text;
  v_sql text;
begin
  for v_email, v_password in
    select * from (
      values
        ('parent@icetrack.com', 'parent123'),
        ('instructor@icetrack.com', 'instructor123'),
        ('admin@icetrack.com', 'frankSouth')
    ) as creds(email, password)
  loop
    -- Ensure row exists
    if not exists (select 1 from auth.users where email = v_email) then
      insert into auth.users (
        id, instance_id, aud, role, email, encrypted_password,
        email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
        created_at, updated_at
      )
      values (
        gen_random_uuid(),
        '00000000-0000-0000-0000-000000000000'::uuid,
        'authenticated',
        'authenticated',
        v_email,
        crypt(v_password, gen_salt('bf')),
        now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{}'::jsonb,
        now(),
        now()
      );
    end if;

    -- Always refresh password + basic defaults
    update auth.users
      set encrypted_password = crypt(v_password, gen_salt('bf')),
          aud = coalesce(aud, 'authenticated'),
          role = coalesce(role, 'authenticated'),
          raw_app_meta_data = coalesce(raw_app_meta_data, '{"provider":"email","providers":["email"]}'::jsonb),
          raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb),
          email_confirmed_at = coalesce(email_confirmed_at, now()),
          updated_at = now()
    where email = v_email;

    -- Patch optional auth token columns only if they exist in this project version.
    for v_sql in
      select format(
        'update auth.users set %1$I = coalesce(%1$I, '''') where email = %2$L',
        c.column_name,
        v_email
      )
      from information_schema.columns c
      where c.table_schema = 'auth'
        and c.table_name = 'users'
        and c.column_name in (
          'confirmation_token',
          'recovery_token',
          'email_change_token_new',
          'email_change_token_current',
          'reauthentication_token',
          'phone_change_token'
        )
    loop
      execute v_sql;
    end loop;
  end loop;
end $$;

-- ------------------------------------------------------------
-- 3) Ensure profiles exist for demo users
-- ------------------------------------------------------------
insert into public.profiles (id, full_name, role)
select u.id,
       case
         when u.email = 'parent@icetrack.com' then 'Parent Demo'
         when u.email = 'instructor@icetrack.com' then 'Instructor Demo'
         else 'Admin Demo'
       end as full_name,
       case
         when u.email = 'parent@icetrack.com' then 'parent'
         when u.email = 'instructor@icetrack.com' then 'instructor'
         else 'admin'
       end as role
from auth.users u
where u.email in ('parent@icetrack.com', 'instructor@icetrack.com', 'admin@icetrack.com')
on conflict (id) do update set
  full_name = excluded.full_name,
  role = excluded.role;

-- ============================================================
-- Expected demo logins after this script:
--   parent@icetrack.com     / parent123
--   instructor@icetrack.com / instructor123
--   admin@icetrack.com      / frankSouth
-- ============================================================
