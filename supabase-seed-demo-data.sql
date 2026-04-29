-- ============================================================
-- IceTrack — Light demo seed (no auth wipe)
-- Use when tables exist but are empty after manual auth fixes.
-- Requires: levels + profiles for parent@ / instructor@ (from UI or SQL).
-- Safe to run multiple times (idempotent-ish).
-- ============================================================

do $$
declare
  parent_prof   uuid;
  instr_prof    uuid;
  level_id      uuid;
  class_id      uuid;
  skater_id     uuid;
begin
  select p.id into parent_prof
  from public.profiles p
  join auth.users u on u.id = p.id
  where u.email = 'parent@icetrack.com'
  limit 1;

  select p.id into instr_prof
  from public.profiles p
  join auth.users u on u.id = p.id
  where u.email = 'instructor@icetrack.com'
  limit 1;

  if parent_prof is null then
    raise notice 'Skip: no parent profile for parent@icetrack.com';
    return;
  end if;

  -- One class if none
  if not exists (select 1 from public.classes) then
    select l.id into level_id from public.levels l order by l.order_index nulls last limit 1;
    if level_id is null then
      raise notice 'Skip: public.levels is empty — run supabase-reset.sql first';
      return;
    end if;
    insert into public.classes (level_id, instructor_id, day_of_week, time_slot, ice_location, season)
    values (level_id, instr_prof, 'Saturday', '10:00–11:00', 'Zone A', 'Spring 2026')
    returning id into class_id;
  else
    select c.id into class_id from public.classes c order by c.created_at desc limit 1;
  end if;

  -- One skater for parent if none
  if not exists (select 1 from public.skaters where parent_id = parent_prof) then
    select l.id into level_id from public.levels l where l.name = 'Tot 2' limit 1;
    if level_id is null then
      select l.id into level_id from public.levels l order by l.order_index nulls last limit 1;
    end if;
    insert into public.skaters (full_name, level_id, parent_id)
    values ('Alex Demo', level_id, parent_prof)
    returning id into skater_id;
  else
    select s.id into skater_id from public.skaters s where s.parent_id = parent_prof order by s.created_at desc limit 1;
  end if;

  -- Enrollment if missing
  if skater_id is not null and class_id is not null
     and not exists (select 1 from public.enrollments e where e.class_id = class_id and e.skater_id = skater_id) then
    insert into public.enrollments (class_id, skater_id) values (class_id, skater_id);
  end if;
end $$;

-- Optional: one skating show row if table is empty (groups/practices still empty)
insert into public.skating_shows (name, theme, show_date, show_time, location)
select '2026 Skating School Spring Ice Show',
       'Italian Ice: a tribute to the Milano-Cortina Olympics',
       '2026-05-14'::date,
       '18:30'::time,
       'Frank Southern Ice Arena · Zone A'
where not exists (select 1 from public.skating_shows);
