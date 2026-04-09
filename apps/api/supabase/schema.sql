create extension if not exists pgcrypto;

drop table if exists public.class_registrations cascade;
drop table if exists public.community_classes cascade;
drop table if exists public.class_enrollments cascade;
drop table if exists public.classes cascade;
drop table if exists public.sessions cascade;
drop table if exists public.kids cascade;
drop table if exists public.users cascade;

do $$
begin
  drop type if exists public.user_role;
exception
  when undefined_object then null;
end $$;

create type public.user_role as enum ('admin', 'instructor', 'parent');

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null default 'parent',
  created_at timestamptz not null default now()
);

create table if not exists public.kids (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  start_date date not null,
  end_date date not null,
  created_at timestamptz not null default now()
);

create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  instructor_id uuid references public.users(id) on delete set null,
  level text not null,
  skill_set text not null,
  time text not null,
  day_of_week text not null,
  capacity integer not null check (capacity > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.class_enrollments (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  kid_id uuid not null references public.kids(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (class_id, kid_id)
);

alter table public.users enable row level security;
alter table public.kids enable row level security;
alter table public.sessions enable row level security;
alter table public.classes enable row level security;
alter table public.class_enrollments enable row level security;

-- Keep RLS minimal for now or completely open for authenticated
create policy "allow_all_select" on public.users for select to authenticated using (true);
create policy "allow_all_select" on public.kids for select to authenticated using (true);
create policy "allow_all_select" on public.sessions for select to authenticated using (true);
create policy "allow_all_select" on public.classes for select to authenticated using (true);
create policy "allow_all_select" on public.class_enrollments for select to authenticated using (true);

create policy "users_insert_own_user" on public.users for insert with check (auth.uid() = id);
create policy "admins_all_users" on public.users using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'));

create policy "parents_insert_kids" on public.kids for insert to authenticated with check (parent_id = auth.uid());
create policy "admins_all_kids" on public.kids using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'));

create policy "admins_insert_sessions" on public.sessions for insert to authenticated with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'));
create policy "admins_insert_classes" on public.classes for insert to authenticated with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'));
create policy "parents_insert_enrollment" on public.class_enrollments for insert to authenticated with check (exists (select 1 from public.kids k where k.id = kid_id and k.parent_id = auth.uid()));

-- Insert admin with password frank
do $$
declare
  admin_id uuid := gen_random_uuid();
  instance_id_val uuid := '00000000-0000-0000-0000-000000000000'::uuid;
begin
  if not exists (select 1 from auth.users where email = 'frank@admin.com') then
    insert into auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role)
    values (
      admin_id,
      instance_id_val,
      'frank@admin.com',
      crypt('frank', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      now(),
      now(),
      'authenticated'
    );
    insert into public.users (id, role) values (admin_id, 'admin');
  end if;
end $$;
