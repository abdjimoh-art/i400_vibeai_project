-- ============================================================
-- IceTrack — Full reset + rebuild
-- Run this ONCE in the Supabase SQL Editor.
-- It will:
--   1. Drop every IceTrack public table (in FK-safe order)
--   2. Delete the 3 demo auth users so passwords reseed cleanly
--   3. Recreate the schema (profiles, levels, classes, skaters,
--      enrollments, skills, attendance, skill completions, shows)
--   4. Seed the 8 levels and 53 Learn-to-Skate skills
--   5. Seed the 3 demo logins:
--        parent@icetrack.com     / parent123
--        instructor@icetrack.com / instructor123
--        admin@icetrack.com      / frankSouth
--   6. Seed the 2026 Spring Ice Show + groups + practices
-- ============================================================

create extension if not exists pgcrypto;

-- ============================================================
-- 1. DROP everything (children first)
-- ============================================================
drop table if exists public.show_practices       cascade;
drop table if exists public.show_group_levels    cascade;
drop table if exists public.show_groups          cascade;
drop table if exists public.skating_shows        cascade;
drop table if exists public.skill_completions    cascade;
drop table if exists public.attendance_records   cascade;
drop table if exists public.enrollments          cascade;
drop table if exists public.class_instructors    cascade;
drop table if exists public.skills               cascade;
drop table if exists public.skaters              cascade;
drop table if exists public.classes              cascade;
drop table if exists public.levels               cascade;
drop table if exists public.profiles             cascade;

-- Wipe the 3 demo auth users so we can re-seed their passwords cleanly.
delete from auth.users where email in (
  'parent@icetrack.com',
  'instructor@icetrack.com',
  'admin@icetrack.com'
);

-- ============================================================
-- 2. CORE TABLES (parent of FKs first)
-- ============================================================

-- profiles — extends auth.users with role + name
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null,
  role        text not null check (role in ('admin','instructor','parent')),
  created_at  timestamptz default now()
);
alter table public.profiles enable row level security;

-- SECURITY DEFINER helper — lets a profiles policy ask
-- "is the current user an admin?" without recursing back
-- into RLS (which would cause a "Database error querying
-- schema" failure during Supabase Auth login).
-- SET row_security = off: inner SELECT must not re-evaluate
-- profiles RLS while we're already inside a profiles policy.
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

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for select
  using (public.is_admin());

create policy "Allow profile creation on signup"
  on public.profiles for insert
  with check (
    auth.uid() = id and role in ('parent','instructor')
  );

-- levels — 8 skating levels
create table public.levels (
  id           uuid primary key default gen_random_uuid(),
  name         text not null unique,
  order_index  integer not null,
  created_at   timestamptz default now()
);
alter table public.levels enable row level security;

create policy "Anyone authenticated can view levels"
  on public.levels for select
  using (auth.role() = 'authenticated');

create policy "Only admins can manage levels"
  on public.levels for all
  using (public.is_admin());

insert into public.levels (name, order_index) values
  ('Parent Tot',    1),
  ('Tot 2',         2),
  ('Tot 3',         3),
  ('Level 1',       4),
  ('Level 2',       5),
  ('Level 3',       6),
  ('Level 4',       7),
  ('Level 5',       8),
  -- Higher / performance-only levels (no Learn-to-Skate skill cards in the PDF;
  -- used by the show-group key on PDF page 13 + admin roster placement)
  ('Level 6',       9),
  ('Level 7',       10),
  ('Level 8',       11),
  ('Adults',        12),
  ('Figure Skating',13);

-- classes
create table public.classes (
  id              uuid primary key default gen_random_uuid(),
  level_id        uuid not null references public.levels(id) on delete cascade,
  instructor_id   uuid references public.profiles(id) on delete set null,
  day_of_week     text not null check (day_of_week in
    ('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday')),
  time_slot       text not null,
  ice_location    text not null default 'Zone A',
  season          text not null default 'Spring 2026',
  created_at      timestamptz default now()
);
alter table public.classes enable row level security;

create policy "Admins can manage all classes"
  on public.classes for all
  using (public.is_admin());

create policy "Instructors can view their classes"
  on public.classes for select
  using (instructor_id = auth.uid());

create policy "Parents can view all classes"
  on public.classes for select
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'parent')
  );

create table public.class_instructors (
  id            uuid primary key default gen_random_uuid(),
  class_id      uuid not null references public.classes(id) on delete cascade,
  instructor_id uuid not null references public.profiles(id) on delete cascade,
  created_at    timestamptz default now(),
  unique(class_id, instructor_id)
);
alter table public.class_instructors enable row level security;

create policy "Admins can manage class instructors"
  on public.class_instructors for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Instructors can view their class mappings"
  on public.class_instructors for select
  using (instructor_id = auth.uid());

-- skaters (children, owned by a parent profile)
create table public.skaters (
  id          uuid primary key default gen_random_uuid(),
  full_name   text not null,
  level_id    uuid references public.levels(id) on delete set null,
  parent_id   uuid references public.profiles(id) on delete set null,
  created_at  timestamptz default now()
);
alter table public.skaters disable row level security;

-- enrollments (skater <-> class)
create table public.enrollments (
  id          uuid primary key default gen_random_uuid(),
  class_id    uuid not null references public.classes(id) on delete cascade,
  skater_id   uuid not null references public.skaters(id) on delete cascade,
  created_at  timestamptz default now(),
  unique(class_id, skater_id)
);
alter table public.enrollments disable row level security;

-- skills (per-level skill definitions)
create table public.skills (
  id                 uuid primary key default gen_random_uuid(),
  level_id           uuid not null references public.levels(id) on delete cascade,
  name               text not null,
  passing_standard   text,
  order_index        integer not null,
  created_at         timestamptz default now()
);
alter table public.skills disable row level security;

-- attendance records
create table public.attendance_records (
  id            uuid primary key default gen_random_uuid(),
  class_id      uuid not null references public.classes(id) on delete cascade,
  skater_id     uuid not null references public.skaters(id) on delete cascade,
  session_date  date not null,
  present       boolean default false,
  created_at    timestamptz default now(),
  unique(class_id, skater_id, session_date)
);
alter table public.attendance_records disable row level security;

-- skill completions
create table public.skill_completions (
  id              uuid primary key default gen_random_uuid(),
  skater_id       uuid not null references public.skaters(id) on delete cascade,
  skill_id        uuid not null references public.skills(id) on delete cascade,
  completed_date  date not null,
  instructor_id   uuid references public.profiles(id) on delete set null,
  created_at      timestamptz default now(),
  unique(skater_id, skill_id)
);
alter table public.skill_completions disable row level security;

-- skating shows
create table public.skating_shows (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  theme       text,
  show_date   date not null,
  show_time   time,
  location    text,
  created_at  timestamptz default now()
);
alter table public.skating_shows disable row level security;

create table public.show_groups (
  id          uuid primary key default gen_random_uuid(),
  show_id     uuid not null references public.skating_shows(id) on delete cascade,
  name        text not null,
  show_half   text not null check (show_half in ('First Half','Second Half')),
  created_at  timestamptz default now()
);
alter table public.show_groups disable row level security;

create table public.show_group_levels (
  id        uuid primary key default gen_random_uuid(),
  group_id  uuid not null references public.show_groups(id) on delete cascade,
  level_id  uuid not null references public.levels(id) on delete cascade,
  unique(group_id, level_id)
);
alter table public.show_group_levels disable row level security;

create table public.show_practices (
  id             uuid primary key default gen_random_uuid(),
  show_id        uuid not null references public.skating_shows(id) on delete cascade,
  group_id       uuid not null references public.show_groups(id) on delete cascade,
  practice_date  date not null,
  start_time     time not null,
  end_time       time not null,
  label          text,
  created_at     timestamptz default now()
);
alter table public.show_practices disable row level security;


-- ============================================================
-- 3. SEED — 53 Learn-to-Skate skills
-- ============================================================

-- Parent Tot (5)
insert into public.skills (level_id, name, passing_standard, order_index)
select l.id, s.name, s.passing_standard, s.idx
from public.levels l,
(values
  (1, 'Proper way to fall and recover', 'Push up from a kneeling position to a standing position (on- and off-ice)'),
  (2, 'March in place (10 steps)', 'Ten marching steps in place'),
  (3, 'March forward (8-10 steps)', 'Eight - ten forward marching steps'),
  (4, 'Beginning two-foot glide', 'Forward marching steps followed by a glide held for a count of three'),
  (5, 'Dip in place', 'Bend knees while balancing on two feet')
) as s(idx, name, passing_standard)
where l.name = 'Parent Tot';

-- Tot 2 (5)
insert into public.skills (level_id, name, passing_standard, order_index)
select l.id, s.name, s.passing_standard, s.idx
from public.levels l,
(values
  (1, 'Forward two-foot glide', 'Forward marching steps followed by a glide held for a count of four'),
  (2, 'Dip', 'Forward marching steps followed by a dip held for a count of four'),
  (3, 'Forward swizzles (3)', 'Three forward swizzles in a row'),
  (4, 'Backward wiggles (6)', 'Six backward wiggles in a row'),
  (5, 'Two-foot hop', 'From a standstill position, do a small jump in place')
) as s(idx, name, passing_standard)
where l.name = 'Tot 2';

-- Tot 3 (6)
insert into public.skills (level_id, name, passing_standard, order_index)
select l.id, s.name, s.passing_standard, s.idx
from public.levels l,
(values
  (1, 'Forward skating (width of rink)', 'Skate forward with alternating pushes across the rink'),
  (2, 'Backward wiggles (1/2 width of rink)', 'Backward wiggles for 1/2 the width of the rink'),
  (3, 'Rocking horse (1 set)', 'One forward swizzle followed by one backward swizzle'),
  (4, 'Snowplow stop in place', 'From a standstill position, scrap foot to side creating snow (1 or 2 feet)'),
  (5, 'Glide Turns or U-Turns (C & CC)', 'Skate toward an object, glide around the object, return to starting position'),
  (6, 'Sequence: hop / swizzles / dip', 'Two-foot hop in place, three forward swizzles, dip held for a count of three')
) as s(idx, name, passing_standard)
where l.name = 'Tot 3';

-- Level 1 (11)
insert into public.skills (level_id, name, passing_standard, order_index)
select l.id, s.name, s.passing_standard, s.idx
from public.levels l,
(values
  (1,  'Proper way to fall and recover', 'Push up from a kneeling position to a standing position (on- and off-ice)'),
  (2,  'March in place (10 steps)', 'Ten marching steps in place'),
  (3,  'March forward (width of rink)', 'Forward marching steps across the rink'),
  (4,  'Glide Turns or U-Turns (C & CC)', 'Skate toward an object, glide around the object, return to starting position'),
  (5,  'Forward two-foot glide', 'Forward marching steps followed by a glide held for a count of four'),
  (6,  'Dip in place', 'Bend knees while balancing on two feet'),
  (7,  'Dip', 'Forward marching or skating followed by a dip held for a count of four'),
  (8,  'Forward swizzles (6)', 'Six forward swizzles in a row'),
  (9,  'Backward wiggles (1/2 width of rink)', 'Backward wiggles for 1/2 the width of the rink'),
  (10, 'Rocking horse (1 set)', 'One forward swizzle followed by one backward swizzle'),
  (11, 'Snowplow stop in place', 'From a standstill position, scrap foot to side creating snow (1 or 2 feet)')
) as s(idx, name, passing_standard)
where l.name = 'Level 1';

-- Level 2 (8)
insert into public.skills (level_id, name, passing_standard, order_index)
select l.id, s.name, s.passing_standard, s.idx
from public.levels l,
(values
  (1, 'Forward skating (width of rink)', 'Skate forward with alternating pushes across the rink'),
  (2, 'One-foot glide (right & left)', 'Forward skating followed by a glide held for a count of four - six'),
  (3, 'Forward swizzles (8)', 'Eight forward swizzles in a row, maintaining a glide in between each swizzle'),
  (4, 'Rocking horse (3 sets)', 'One forward swizzle followed by one backward swizzle'),
  (5, 'Backward swizzles (6)', 'Six backward swizzles in a row'),
  (6, 'Forward alternating pumps / Beg. slalom (6)', 'Six alternating 1/2 swizzle pumps in a straight line'),
  (7, 'Snowplow stop (moving)', 'Forward skating followed by a complete stop & a three-second hold (1 or 2 feet)'),
  (8, 'Two-foot hop', 'From a standstill position, do a small jump in place')
) as s(idx, name, passing_standard)
where l.name = 'Level 2';

-- Level 3 (5)
insert into public.skills (level_id, name, passing_standard, order_index)
select l.id, s.name, s.passing_standard, s.idx
from public.levels l,
(values
  (1, 'T-position push (R & L)', 'From a standstill with feet in a T position, push with inside edge of back foot'),
  (2, 'Backward swizzles (8)', 'Eight backward swizzles in a row, maintaining a glide in between each swizzle'),
  (3, 'Forward stroking (width of rink)', 'Stroke forward with correct use of blade & correct body positions'),
  (4, 'Forward slalom', 'Six alternating pumps with feet parallel, soft knee action, & body twist'),
  (5, 'Forward pumping (C & CC) (8)', 'Eight consecutive forward pumps in a circle, clockwise & counterclockwise')
) as s(idx, name, passing_standard)
where l.name = 'Level 3';

-- Level 4 (7)
insert into public.skills (level_id, name, passing_standard, order_index)
select l.id, s.name, s.passing_standard, s.idx
from public.levels l,
(values
  (1, 'Backward two-foot glide', 'Optional start followed by a backward glide held for a count of four - six'),
  (2, '2-foot turn forward to backward in place', 'Turn from forward to backward on two feet, clockwise & counter clockwise'),
  (3, 'Lateral marching crossovers (both directions)', 'From a standstill, pick up foot, crossover & hold cross-footed position'),
  (4, 'Forward outside edge on a circle (R & L)', 'Three pumps followed by a f. one-foot glide on the circle held for a count of four'),
  (5, 'Forward inside edge on a circle (R & L)', 'Three pumps followed by a f. one-foot glide on the circle held for a count of four'),
  (6, 'Beginning two-foot spin', 'Optional entry, minimum of two revolutions'),
  (7, 'Backward alternating pumps (6)', 'Six alternating 1/2 swizzle pumps in a straight line')
) as s(idx, name, passing_standard)
where l.name = 'Level 4';

-- Level 5 (7)
insert into public.skills (level_id, name, passing_standard, order_index)
select l.id, s.name, s.passing_standard, s.idx
from public.levels l,
(values
  (1, '2-foot turn forward to backward (moving)', 'Moving in a circle, turn from forward to backward, clockwise & counter clockwise'),
  (2, 'Beginning forward crossovers (5 C & CC)', 'Forward pump, crossover & hold cross-footed position / five consecutive'),
  (3, 'Backward one-foot glide (R & L)', 'Backward skating followed by a glide held for a count of four - six'),
  (4, 'Backward snowplow stop (moving)', 'B. skating followed by a complete stop with one foot & a three-second hold'),
  (5, 'Side-toe hop (both directions) / two-foot hop', 'Hop to the side from one toe to the other / Hockey skaters may do a 2-foot hop'),
  (6, 'Backward stroking (width of rink)', 'Push from inside edge, hold free foot in front / strong glides in between pushes'),
  (7, 'Two-foot spin', 'Optional entry, minimum of four revolutions')
) as s(idx, name, passing_standard)
where l.name = 'Level 5';


-- ============================================================
-- 4. SEED — Demo logins (parent / instructor / admin)
-- ============================================================
do $$
declare
  instance_id_val uuid := '00000000-0000-0000-0000-000000000000'::uuid;
  parent_id     uuid := gen_random_uuid();
  instructor_id uuid := gen_random_uuid();
  admin_id      uuid := gen_random_uuid();
begin
  insert into auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at
  ) values
    (parent_id, instance_id_val, 'authenticated', 'authenticated',
     'parent@icetrack.com', crypt('parent123', gen_salt('bf')),
     now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
    (instructor_id, instance_id_val, 'authenticated', 'authenticated',
     'instructor@icetrack.com', crypt('instructor123', gen_salt('bf')),
     now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
    (admin_id, instance_id_val, 'authenticated', 'authenticated',
     'admin@icetrack.com', crypt('frankSouth', gen_salt('bf')),
     now(), '{"provider":"email","providers":["email"]}', '{}', now(), now());

  insert into public.profiles (id, full_name, role) values
    (parent_id,     'Parent Demo',     'parent'),
    (instructor_id, 'Instructor Demo', 'instructor'),
    (admin_id,      'Admin Demo',      'admin');
end $$;


-- ============================================================
-- 5. SEED — 2026 Spring Ice Show
-- "Italian Ice: a tribute to the Milano-Cortina Olympics"
-- ============================================================
with new_show as (
  insert into public.skating_shows (name, theme, show_date, show_time, location)
  values (
    '2026 Skating School Spring Ice Show',
    'Italian Ice: a tribute to the Milano-Cortina Olympics',
    '2026-05-14',
    '18:30',
    'Frank Southern Ice Arena · Zone A'
  )
  returning id
),
new_groups as (
  insert into public.show_groups (show_id, name, show_half)
  select ns.id, g.name, g.show_half
  from new_show ns
  cross join (values
    ('Group 1 — All Tots + Level 3',                'First Half'),
    ('Group 2 — Level 2 + Level 5 + Levels 6/7',    'First Half'),
    ('Group 3 — Level 1 + Level 4',                 'Second Half'),
    ('Group 4 — Adults + Level 8/Figure Skating',   'Second Half')
  ) as g(name, show_half)
  returning id, name
)
insert into public.show_practices (show_id, group_id, practice_date, start_time, end_time, label)
select ns.id, ng.id, p.practice_date::date, p.start_time::time, p.end_time::time, p.label
from new_show ns
join new_groups ng on true
join (values
  -- Mon May 4
  ('Group 1 — All Tots + Level 3',                '2026-05-04', '17:00', '17:45', 'Group 1 practice'),
  ('Group 2 — Level 2 + Level 5 + Levels 6/7',    '2026-05-04', '17:45', '18:30', 'Group 2 practice'),
  -- Tue May 5
  ('Group 3 — Level 1 + Level 4',                 '2026-05-05', '17:00', '17:45', 'Group 3 practice'),
  ('Group 4 — Adults + Level 8/Figure Skating',   '2026-05-05', '17:45', '18:30', 'Group 4 practice'),
  -- Thu May 7
  ('Group 1 — All Tots + Level 3',                '2026-05-07', '18:15', '18:55', 'Week 8 + Group 1'),
  ('Group 2 — Level 2 + Level 5 + Levels 6/7',    '2026-05-07', '18:55', '19:30', 'Week 8 + Group 2'),
  -- Fri May 8
  ('Group 3 — Level 1 + Level 4',                 '2026-05-08', '17:45', '18:30', 'Week 8 + Group 3'),
  ('Group 4 — Adults + Level 8/Figure Skating',   '2026-05-08', '18:30', '19:15', 'Week 8 + Group 4'),
  -- Sun May 10 full-cast
  ('Group 1 — All Tots + Level 3',                '2026-05-10', '10:00', '10:45', 'Sunday full-cast practice'),
  ('Group 2 — Level 2 + Level 5 + Levels 6/7',    '2026-05-10', '10:45', '11:30', 'Sunday full-cast practice'),
  ('Group 3 — Level 1 + Level 4',                 '2026-05-10', '11:30', '12:15', 'Sunday full-cast practice'),
  ('Group 4 — Adults + Level 8/Figure Skating',   '2026-05-10', '12:15', '13:00', 'Sunday full-cast practice'),
  -- Show-week tune-ups
  ('Group 1 — All Tots + Level 3',                '2026-05-11', '17:00', '17:45', 'Final week tune-up'),
  ('Group 2 — Level 2 + Level 5 + Levels 6/7',    '2026-05-11', '17:45', '18:30', 'Final week tune-up'),
  ('Group 3 — Level 1 + Level 4',                 '2026-05-12', '17:00', '17:45', 'Final week tune-up'),
  ('Group 4 — Adults + Level 8/Figure Skating',   '2026-05-12', '17:45', '18:30', 'Final week tune-up'),
  -- Wed May 13 dress rehearsals
  ('Group 1 — All Tots + Level 3',                '2026-05-13', '17:00', '18:00', 'Rehearsal: Groups 1 & 2'),
  ('Group 2 — Level 2 + Level 5 + Levels 6/7',    '2026-05-13', '17:00', '18:00', 'Rehearsal: Groups 1 & 2'),
  ('Group 3 — Level 1 + Level 4',                 '2026-05-13', '18:00', '19:00', 'Rehearsal: Groups 3 & 4'),
  ('Group 4 — Adults + Level 8/Figure Skating',   '2026-05-13', '18:00', '19:00', 'Rehearsal: Groups 3 & 4'),
  -- Thu May 14 show day
  ('Group 1 — All Tots + Level 3',                '2026-05-14', '17:45', '18:00', 'Show day: 1st half skaters arrive'),
  ('Group 2 — Level 2 + Level 5 + Levels 6/7',    '2026-05-14', '17:45', '18:00', 'Show day: 1st half skaters arrive'),
  ('Group 3 — Level 1 + Level 4',                 '2026-05-14', '18:00', '18:15', 'Show day: 2nd half skaters arrive'),
  ('Group 4 — Adults + Level 8/Figure Skating',   '2026-05-14', '18:00', '18:15', 'Show day: 2nd half skaters arrive')
) as p(group_name, practice_date, start_time, end_time, label)
  on p.group_name = ng.name;


-- ============================================================
-- 5b. Map levels → show groups (per PDF page 13 group key)
--     Group 1 = All Tots + Level 3
--     Group 2 = Level 2 + Level 5 + Levels 6 & 7
--     Group 3 = Level 1 + Level 4
--     Group 4 = Adults + Level 8 + Figure Skating
-- ============================================================
insert into public.show_group_levels (group_id, level_id)
select g.id, l.id
from public.show_groups g
join public.levels l on (
     (g.name = 'Group 1 — All Tots + Level 3'             and l.name in ('Parent Tot','Tot 2','Tot 3','Level 3'))
  or (g.name = 'Group 2 — Level 2 + Level 5 + Levels 6/7' and l.name in ('Level 2','Level 5','Level 6','Level 7'))
  or (g.name = 'Group 3 — Level 1 + Level 4'              and l.name in ('Level 1','Level 4'))
  or (g.name = 'Group 4 — Adults + Level 8/Figure Skating' and l.name in ('Adults','Level 8','Figure Skating'))
);


-- ============================================================
-- Done. You can now sign in with:
--   parent@icetrack.com     / parent123
--   instructor@icetrack.com / instructor123
--   admin@icetrack.com      / frankSouth
-- ============================================================
