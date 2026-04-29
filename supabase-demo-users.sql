-- ============================================================
-- IceTrack demo login seed (parent / instructor / admin)
-- Run this AFTER supabase-schema.sql
-- ============================================================

create extension if not exists pgcrypto;

do $$
declare
  instance_id_val uuid := '00000000-0000-0000-0000-000000000000'::uuid;
  parent_id uuid := gen_random_uuid();
  instructor_id uuid := gen_random_uuid();
  admin_id uuid := gen_random_uuid();
begin
  -- Parent user
  if not exists (select 1 from auth.users where email = 'parent@icetrack.com') then
    insert into auth.users (
      id, instance_id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at
    )
    values (
      parent_id, instance_id_val, 'authenticated', 'authenticated', 'parent@icetrack.com',
      crypt('IceTrack', gen_salt('bf')),
      now(), '{"provider":"email","providers":["email"]}', '{}',
      now(), now()
    );
  else
    select id into parent_id from auth.users where email = 'parent@icetrack.com';
  end if;

  -- Instructor user
  if not exists (select 1 from auth.users where email = 'instructor@icetrack.com') then
    insert into auth.users (
      id, instance_id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at
    )
    values (
      instructor_id, instance_id_val, 'authenticated', 'authenticated', 'instructor@icetrack.com',
      crypt('IceTrack', gen_salt('bf')),
      now(), '{"provider":"email","providers":["email"]}', '{}',
      now(), now()
    );
  else
    select id into instructor_id from auth.users where email = 'instructor@icetrack.com';
  end if;

  -- Admin user (uses frankSouth to match the IU class repo convention)
  if not exists (select 1 from auth.users where email = 'admin@icetrack.com') then
    insert into auth.users (
      id, instance_id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at
    )
    values (
      admin_id, instance_id_val, 'authenticated', 'authenticated', 'admin@icetrack.com',
      crypt('frankSouth', gen_salt('bf')),
      now(), '{"provider":"email","providers":["email"]}', '{}',
      now(), now()
    );
  else
    select id into admin_id from auth.users where email = 'admin@icetrack.com';
    update auth.users
      set encrypted_password = crypt('frankSouth', gen_salt('bf')),
          updated_at = now()
      where email = 'admin@icetrack.com';
  end if;

  insert into public.profiles (id, full_name, role)
  values
    (parent_id, 'Parent Demo', 'parent'),
    (instructor_id, 'Instructor Demo', 'instructor'),
    (admin_id, 'Admin Demo', 'admin')
  on conflict (id) do update set
    full_name = excluded.full_name,
    role = excluded.role;
end $$;

-- Demo credentials
-- parent@icetrack.com     / IceTrack
-- instructor@icetrack.com / IceTrack
-- admin@icetrack.com      / frankSouth
