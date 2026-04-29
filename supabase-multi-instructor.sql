-- IceTrack multi-instructor support for classes
-- Run in Supabase SQL Editor.

create table if not exists public.class_instructors (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  instructor_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(class_id, instructor_id)
);

alter table public.class_instructors enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'class_instructors' and policyname = 'Admins can manage class instructors'
  ) then
    create policy "Admins can manage class instructors"
      on public.class_instructors for all
      using (public.is_admin())
      with check (public.is_admin());
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'class_instructors' and policyname = 'Instructors can view their class mappings'
  ) then
    create policy "Instructors can view their class mappings"
      on public.class_instructors for select
      using (instructor_id = auth.uid());
  end if;
end $$;

insert into public.class_instructors (class_id, instructor_id)
select c.id, c.instructor_id
from public.classes c
where c.instructor_id is not null
on conflict (class_id, instructor_id) do nothing;
