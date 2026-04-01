-- ============================================================
-- IceTrack - Supabase Schema
-- Run this in your Supabase SQL Editor (supabase.com > SQL Editor)
-- ============================================================

-- 1. PROFILES TABLE
-- Extends Supabase auth.users with role + full name
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text not null,
  role text not null check (role in ('admin', 'instructor', 'parent')),
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- RLS Policies for profiles
-- Users can read their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Users can update their own profile
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Admins can view all profiles
create policy "Admins can view all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Allow insert during registration (called via service role in API route)
create policy "Allow profile creation on signup"
  on public.profiles for insert
  with check (auth.uid() = id);


-- ============================================================
-- 2. LEVELS TABLE
-- Skating skill levels (Parent Tot, Tot 2, etc.)
-- ============================================================
create table public.levels (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  order_index integer not null,
  created_at timestamp with time zone default now()
);

alter table public.levels enable row level security;

create policy "Anyone authenticated can view levels"
  on public.levels for select
  using (auth.role() = 'authenticated');

create policy "Only admins can manage levels"
  on public.levels for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Seed levels data
insert into public.levels (name, order_index) values
  ('Parent Tot', 1),
  ('Tot 2', 2),
  ('Tot 3', 3),
  ('Level 1', 4),
  ('Level 2', 5),
  ('Level 3', 6),
  ('Level 4', 7),
  ('Level 5', 8);


-- ============================================================
-- 3. CLASSES TABLE
-- ============================================================
create table public.classes (
  id uuid default gen_random_uuid() primary key,
  level_id uuid references public.levels(id) on delete cascade not null,
  instructor_id uuid references public.profiles(id) on delete set null,
  day_of_week text not null check (day_of_week in ('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday')),
  time_slot text not null,
  ice_location text not null default 'Zone A',
  season text not null default 'Spring 2026',
  created_at timestamp with time zone default now()
);

alter table public.classes enable row level security;

create policy "Admins can manage all classes"
  on public.classes for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Instructors can view their classes"
  on public.classes for select
  using (instructor_id = auth.uid());

create policy "Parents can view all classes"
  on public.classes for select
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'parent')
  );


-- ============================================================
-- 4. ENROLLMENTS TABLE
-- ============================================================
create table public.enrollments (
  id uuid default gen_random_uuid() primary key,
  class_id uuid references public.classes(id) on delete cascade not null,
  skater_id uuid references public.profiles(id) on delete cascade not null,
  parent_id uuid references public.profiles(id) on delete cascade not null,
  is_makeup boolean default false,
  created_at timestamp with time zone default now(),
  unique(class_id, skater_id)
);

alter table public.enrollments enable row level security;

create policy "Admins can manage enrollments"
  on public.enrollments for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Parents can view their children enrollments"
  on public.enrollments for select
  using (parent_id = auth.uid());

create policy "Instructors can view enrollments for their classes"
  on public.enrollments for select
  using (
    exists (
      select 1 from public.classes
      where id = enrollments.class_id and instructor_id = auth.uid()
    )
  );
