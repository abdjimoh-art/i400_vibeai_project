-- ============================================================
-- IceTrack Phase 2: Attendance, Skills, Skating Show
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Skaters (children managed by admin; linked to parent account)
CREATE TABLE skaters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  level_id UUID REFERENCES levels(id) ON DELETE SET NULL,
  parent_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE skaters DISABLE ROW LEVEL SECURITY;

-- 2. Enrollments — recreate with skater FK (old table had no data)
DROP TABLE IF EXISTS enrollments;
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
  skater_id UUID REFERENCES skaters(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, skater_id)
);
ALTER TABLE enrollments DISABLE ROW LEVEL SECURITY;

-- 3. Skills — per-level skill definitions
CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level_id UUID REFERENCES levels(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  passing_standard TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE skills DISABLE ROW LEVEL SECURITY;

-- 4. Attendance records
CREATE TABLE attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
  skater_id UUID REFERENCES skaters(id) ON DELETE CASCADE NOT NULL,
  session_date DATE NOT NULL,
  present BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, skater_id, session_date)
);
ALTER TABLE attendance_records DISABLE ROW LEVEL SECURITY;

-- 5. Skill completions
CREATE TABLE skill_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skater_id UUID REFERENCES skaters(id) ON DELETE CASCADE NOT NULL,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE NOT NULL,
  completed_date DATE NOT NULL,
  instructor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(skater_id, skill_id)
);
ALTER TABLE skill_completions DISABLE ROW LEVEL SECURITY;

-- 6. Skating shows
CREATE TABLE skating_shows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  theme TEXT,
  show_date DATE NOT NULL,
  show_time TIME,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE skating_shows DISABLE ROW LEVEL SECURITY;

-- 7. Show groups (combine levels into performance groups)
CREATE TABLE show_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  show_id UUID REFERENCES skating_shows(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  show_half TEXT NOT NULL CHECK (show_half IN ('First Half', 'Second Half')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE show_groups DISABLE ROW LEVEL SECURITY;

-- 8. Show group ↔ level mapping
CREATE TABLE show_group_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES show_groups(id) ON DELETE CASCADE NOT NULL,
  level_id UUID REFERENCES levels(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(group_id, level_id)
);
ALTER TABLE show_group_levels DISABLE ROW LEVEL SECURITY;

-- 9. Show practice sessions
CREATE TABLE show_practices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  show_id UUID REFERENCES skating_shows(id) ON DELETE CASCADE NOT NULL,
  group_id UUID REFERENCES show_groups(id) ON DELETE CASCADE NOT NULL,
  practice_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  label TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE show_practices DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- SEED: Skills per level (53 skills from the PDF skill cards)
-- ============================================================

-- Parent Tot (5 skills)
INSERT INTO skills (level_id, name, passing_standard, order_index)
SELECT l.id, s.name, s.passing_standard, s.idx
FROM levels l,
(VALUES
  (1, 'Proper way to fall and recover', 'Push up from a kneeling position to a standing position (on- and off-ice)'),
  (2, 'March in place (10 steps)', 'Ten marching steps in place'),
  (3, 'March forward (8-10 steps)', 'Eight - ten forward marching steps'),
  (4, 'Beginning two-foot glide', 'Forward marching steps followed by a glide held for a count of three'),
  (5, 'Dip in place', 'Bend knees while balancing on two feet')
) AS s(idx, name, passing_standard)
WHERE l.name = 'Parent Tot';

-- Tot 2 (5 skills)
INSERT INTO skills (level_id, name, passing_standard, order_index)
SELECT l.id, s.name, s.passing_standard, s.idx
FROM levels l,
(VALUES
  (1, 'Forward two-foot glide', 'Forward marching steps followed by a glide held for a count of four'),
  (2, 'Dip', 'Forward marching steps followed by a dip held for a count of four'),
  (3, 'Forward swizzles (3)', 'Three forward swizzles in a row'),
  (4, 'Backward wiggles (6)', 'Six backward wiggles in a row'),
  (5, 'Two-foot hop', 'From a standstill position, do a small jump in place')
) AS s(idx, name, passing_standard)
WHERE l.name = 'Tot 2';

-- Tot 3 (6 skills)
INSERT INTO skills (level_id, name, passing_standard, order_index)
SELECT l.id, s.name, s.passing_standard, s.idx
FROM levels l,
(VALUES
  (1, 'Forward skating (width of rink)', 'Skate forward with alternating pushes across the rink'),
  (2, 'Backward wiggles (1/2 width of rink)', 'Backward wiggles for 1/2 the width of the rink'),
  (3, 'Rocking horse (1 set)', 'One forward swizzle followed by one backward swizzle'),
  (4, 'Snowplow stop in place', 'From a standstill position, scrap foot to side creating snow (1 or 2 feet)'),
  (5, 'Glide Turns or U-Turns (C & CC)', 'Skate toward an object, glide around the object, return to starting position'),
  (6, 'Sequence: hop / swizzles / dip', 'Two-foot hop in place, three forward swizzles, dip held for a count of three')
) AS s(idx, name, passing_standard)
WHERE l.name = 'Tot 3';

-- Level 1 (10 skills)
INSERT INTO skills (level_id, name, passing_standard, order_index)
SELECT l.id, s.name, s.passing_standard, s.idx
FROM levels l,
(VALUES
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
) AS s(idx, name, passing_standard)
WHERE l.name = 'Level 1';

-- Level 2 (8 skills)
INSERT INTO skills (level_id, name, passing_standard, order_index)
SELECT l.id, s.name, s.passing_standard, s.idx
FROM levels l,
(VALUES
  (1, 'Forward skating (width of rink)', 'Skate forward with alternating pushes across the rink'),
  (2, 'One-foot glide (right & left)', 'Forward skating followed by a glide held for a count of four - six'),
  (3, 'Forward swizzles (8)', 'Eight forward swizzles in a row, maintaining a glide in between each swizzle'),
  (4, 'Rocking horse (3 sets)', 'One forward swizzle followed by one backward swizzle'),
  (5, 'Backward swizzles (6)', 'Six backward swizzles in a row'),
  (6, 'Forward alternating pumps / Beg. slalom (6)', 'Six alternating 1/2 swizzle pumps in a straight line'),
  (7, 'Snowplow stop (moving)', 'Forward skating followed by a complete stop & a three-second hold (1 or 2 feet)'),
  (8, 'Two-foot hop', 'From a standstill position, do a small jump in place')
) AS s(idx, name, passing_standard)
WHERE l.name = 'Level 2';

-- Level 3 (5 skills)
INSERT INTO skills (level_id, name, passing_standard, order_index)
SELECT l.id, s.name, s.passing_standard, s.idx
FROM levels l,
(VALUES
  (1, 'T-position push (R & L)', 'From a standstill with feet in a T position, push with inside edge of back foot'),
  (2, 'Backward swizzles (8)', 'Eight backward swizzles in a row, maintaining a glide in between each swizzle'),
  (3, 'Forward stroking (width of rink)', 'Stroke forward with correct use of blade & correct body positions'),
  (4, 'Forward slalom', 'Six alternating pumps with feet parallel, soft knee action, & body twist'),
  (5, 'Forward pumping (C & CC) (8)', 'Eight consecutive forward pumps in a circle, clockwise & counterclockwise')
) AS s(idx, name, passing_standard)
WHERE l.name = 'Level 3';

-- Level 4 (7 skills)
INSERT INTO skills (level_id, name, passing_standard, order_index)
SELECT l.id, s.name, s.passing_standard, s.idx
FROM levels l,
(VALUES
  (1, 'Backward two-foot glide', 'Optional start followed by a backward glide held for a count of four - six'),
  (2, '2-foot turn forward to backward in place', 'Turn from forward to backward on two feet, clockwise & counter clockwise'),
  (3, 'Lateral marching crossovers (both directions)', 'From a standstill, pick up foot, crossover & hold cross-footed position'),
  (4, 'Forward outside edge on a circle (R & L)', 'Three pumps followed by a f. one-foot glide on the circle held for a count of four'),
  (5, 'Forward inside edge on a circle (R & L)', 'Three pumps followed by a f. one-foot glide on the circle held for a count of four'),
  (6, 'Beginning two-foot spin', 'Optional entry, minimum of two revolutions'),
  (7, 'Backward alternating pumps (6)', 'Six alternating 1/2 swizzle pumps in a straight line')
) AS s(idx, name, passing_standard)
WHERE l.name = 'Level 4';

-- Level 5 (7 skills)
INSERT INTO skills (level_id, name, passing_standard, order_index)
SELECT l.id, s.name, s.passing_standard, s.idx
FROM levels l,
(VALUES
  (1, '2-foot turn forward to backward (moving)', 'Moving in a circle, turn from forward to backward, clockwise & counter clockwise'),
  (2, 'Beginning forward crossovers (5 C & CC)', 'Forward pump, crossover & hold cross-footed position / five consecutive'),
  (3, 'Backward one-foot glide (R & L)', 'Backward skating followed by a glide held for a count of four - six'),
  (4, 'Backward snowplow stop (moving)', 'B. skating followed by a complete stop with one foot & a three-second hold'),
  (5, 'Side-toe hop (both directions) / two-foot hop', 'Hop to the side from one toe to the other / Hockey skaters may do a 2-foot hop'),
  (6, 'Backward stroking (width of rink)', 'Push from inside edge, hold free foot in front / strong glides in between pushes'),
  (7, 'Two-foot spin', 'Optional entry, minimum of four revolutions')
) AS s(idx, name, passing_standard)
WHERE l.name = 'Level 5';

-- ============================================================
-- SEED: 2026 Spring Ice Show (shifted to current timeline)
-- Source: "Italian Ice: a tribute to the Milano-Cortina Olympics"
-- ============================================================

-- Keep seed idempotent for repeated local resets.
DELETE FROM show_practices;
DELETE FROM show_group_levels;
DELETE FROM show_groups;
DELETE FROM skating_shows;

WITH new_show AS (
  INSERT INTO skating_shows (name, theme, show_date, show_time, location)
  VALUES (
    '2026 Skating School Spring Ice Show',
    'Italian Ice: a tribute to the Milano-Cortina Olympics',
    '2026-05-14',
    '18:30',
    'Frank Southern Ice Arena · Zone A'
  )
  RETURNING id
),
new_groups AS (
  INSERT INTO show_groups (show_id, name, show_half)
  SELECT ns.id, g.name, g.show_half
  FROM new_show ns
  CROSS JOIN (
    VALUES
      ('Group 1 — All Tots + Level 3', 'First Half'),
      ('Group 2 — Level 2 + Level 5 + Levels 6/7', 'First Half'),
      ('Group 3 — Level 1 + Level 4', 'Second Half'),
      ('Group 4 — Adults + Level 8/Figure Skating', 'Second Half')
  ) AS g(name, show_half)
  RETURNING id, name
)
INSERT INTO show_practices (show_id, group_id, practice_date, start_time, end_time, label)
SELECT
  ns.id,
  ng.id,
  p.practice_date,
  p.start_time::time,
  p.end_time::time,
  p.label
FROM new_show ns
JOIN new_groups ng ON TRUE
JOIN (
  VALUES
    -- Mon May 4
    ('Group 1 — All Tots + Level 3', '2026-05-04', '17:00', '17:45', 'Group 1 practice'),
    ('Group 2 — Level 2 + Level 5 + Levels 6/7', '2026-05-04', '17:45', '18:30', 'Group 2 practice'),
    -- Tue May 5
    ('Group 3 — Level 1 + Level 4', '2026-05-05', '17:00', '17:45', 'Group 3 practice'),
    ('Group 4 — Adults + Level 8/Figure Skating', '2026-05-05', '17:45', '18:30', 'Group 4 practice'),
    -- Thu May 7
    ('Group 1 — All Tots + Level 3', '2026-05-07', '18:15', '18:55', 'Week 8 + Group 1'),
    ('Group 2 — Level 2 + Level 5 + Levels 6/7', '2026-05-07', '18:55', '19:30', 'Week 8 + Group 2'),
    -- Fri May 8
    ('Group 3 — Level 1 + Level 4', '2026-05-08', '17:45', '18:30', 'Week 8 + Group 3'),
    ('Group 4 — Adults + Level 8/Figure Skating', '2026-05-08', '18:30', '19:15', 'Week 8 + Group 4'),
    -- Sun May 10 (all groups)
    ('Group 1 — All Tots + Level 3', '2026-05-10', '10:00', '10:45', 'Sunday full-cast practice'),
    ('Group 2 — Level 2 + Level 5 + Levels 6/7', '2026-05-10', '10:45', '11:30', 'Sunday full-cast practice'),
    ('Group 3 — Level 1 + Level 4', '2026-05-10', '11:30', '12:15', 'Sunday full-cast practice'),
    ('Group 4 — Adults + Level 8/Figure Skating', '2026-05-10', '12:15', '13:00', 'Sunday full-cast practice'),
    -- Mon/Tue of show week
    ('Group 1 — All Tots + Level 3', '2026-05-11', '17:00', '17:45', 'Final week tune-up'),
    ('Group 2 — Level 2 + Level 5 + Levels 6/7', '2026-05-11', '17:45', '18:30', 'Final week tune-up'),
    ('Group 3 — Level 1 + Level 4', '2026-05-12', '17:00', '17:45', 'Final week tune-up'),
    ('Group 4 — Adults + Level 8/Figure Skating', '2026-05-12', '17:45', '18:30', 'Final week tune-up'),
    -- Wed May 13 rehearsal blocks
    ('Group 1 — All Tots + Level 3', '2026-05-13', '17:00', '18:00', 'Rehearsal: Groups 1 & 2'),
    ('Group 2 — Level 2 + Level 5 + Levels 6/7', '2026-05-13', '17:00', '18:00', 'Rehearsal: Groups 1 & 2'),
    ('Group 3 — Level 1 + Level 4', '2026-05-13', '18:00', '19:00', 'Rehearsal: Groups 3 & 4'),
    ('Group 4 — Adults + Level 8/Figure Skating', '2026-05-13', '18:00', '19:00', 'Rehearsal: Groups 3 & 4'),
    -- Thu May 14 show-day call times
    ('Group 1 — All Tots + Level 3', '2026-05-14', '17:45', '18:00', 'Show day: 1st half skaters arrive'),
    ('Group 2 — Level 2 + Level 5 + Levels 6/7', '2026-05-14', '17:45', '18:00', 'Show day: 1st half skaters arrive'),
    ('Group 3 — Level 1 + Level 4', '2026-05-14', '18:00', '18:15', 'Show day: 2nd half skaters arrive'),
    ('Group 4 — Adults + Level 8/Figure Skating', '2026-05-14', '18:00', '18:15', 'Show day: 2nd half skaters arrive')
) AS p(group_name, practice_date, start_time, end_time, label)
  ON p.group_name = ng.name;
