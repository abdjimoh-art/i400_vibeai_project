# IceTrack Wireframe Execution Plan (No Marketing)

## Objective
Make the app feel fully populated with realistic skating-school data from the supplied materials and align all implemented screens to the Vibe AI hi-fi handoff **except** marketing.

## Hard constraints
- Do not implement a marketing/landing page.
- Do not add UI changes unrelated to the handoff files.
- Preserve I400-critical behavior: auth, role routing, RLS-safe access, class/skater/enrollment CRUD, attendance, skill check-offs, skating-show scheduling.
- Keep routes stable (`/login`, `/register`, `/admin`, `/instructor`, `/parent`, `/parent/journey/[skaterId]`).

## Source of truth
- Data intent: `IceSkating Materials-2.pdf`
- Visual reference:
  - `docs/design-handoff/hifi-auth.jsx`
  - `docs/design-handoff/hifi-parent.jsx`
  - `docs/design-handoff/hifi-instructor.jsx`
  - `docs/design-handoff/hifi-admin.jsx`
  - `docs/design-handoff/hifi-skills.jsx`

## Phase 1 — Data population baseline (complete)
### Completed checks
- `profiles`: 3
- `levels`: 13
- `classes`: 8
- `skaters`: 7
- `enrollments`: 7
- `attendance_records`: 28
- `skills`: 54
- `skill_completions`: 24
- `skating_shows`: 1
- `show_groups`: 4
- `show_group_levels`: 13
- `show_practices`: 24

### Why this matters
This removes the "empty UI" problem so hi-fi screens can be validated with realistic content.

## Phase 2 — Visual parity pass (wireframe-only)

### 2.1 Login (`/login`) — target `hifi-auth.jsx::ITLoginHiFi`
Acceptance checklist:
- [ ] 1.05fr/1fr split layout
- [ ] Left hero gradient and decorative arcs
- [ ] Hero stats row (53/8/3)
- [ ] Right form width and spacing parity
- [ ] Keep-me-signed-in row appearance parity
- [ ] Primary + secondary CTA visual parity

### 2.2 Register (`/register`) — target `hifi-auth.jsx::ITRegisterHiFi`
Acceptance checklist:
- [ ] 260px sidebar with numbered steps
- [ ] Admin callout card in sidebar
- [ ] Step-1 role cards with selected ring + check badge
- [ ] Step-2/3 spacing/typography parity
- [ ] No behavior regressions in signup/profile create

### 2.3 Parent dashboard (`/parent/dashboard`) — target `hifi-parent.jsx`
Acceptance checklist:
- [ ] 224px sidebar structure/nav styles
- [ ] Header typography + right controls
- [ ] 2-column skater cards with progress + footer blocks
- [ ] Bottom split: Recent passes + Spring showcase card
- [ ] Empty states still styled in same visual language

### 2.4 Instructor dashboard (`/instructor/dashboard`) — target `hifi-instructor.jsx`
Acceptance checklist:
- [ ] Top bar and class rail proportions
- [ ] Roster header and tab row parity
- [ ] Attendance card rhythm and spacing
- [ ] 44x44 present/absent hit targets with active ring states
- [ ] Save/all-present controls visual parity
- [ ] Skill-pass tab remains functional

### 2.5 Admin dashboard (`/admin/dashboard`) — target `hifi-admin.jsx`
Acceptance checklist:
- [x] Overview-first nav/tab model
- [x] KPI strip
- [x] Enrollment-by-level visualization
- [x] Right rail (activity + showcase card)
- [ ] Final spacing/typography polish pass against hi-fi
- [ ] CRUD tabs kept intact

### 2.6 Skill journey (`/parent/journey/[skaterId]`) — target `hifi-skills.jsx`
Acceptance checklist:
- [ ] Header gradient, breadcrumb, and progress ring
- [ ] Timeline line/dots/card treatments for passed/working/next/locked
- [ ] Right rail cards (celebration, next, practice)
- [ ] Data-driven values preserved (no fake-only state)

## Phase 3 — Verification gates
- [ ] `npm run lint` passes for touched files
- [ ] `npm run build` passes
- [ ] Role login smoke tests (admin/instructor/parent)
- [ ] Parent dashboard shows skaters + recent passes + showcase
- [ ] Instructor dashboard shows class rail + roster attendance controls
- [ ] Admin overview shows level bars and showcase counts
- [ ] Journey page renders timeline with completions

## Phase 4 — README sync
- [ ] Keep "no marketing page" statement
- [ ] Keep route map + redirect behavior
- [ ] Keep seed/reset troubleshooting section
- [ ] Keep handoff source paths (`docs/design-handoff`)

## Guardrails during implementation
- No schema rewrites unless absolutely necessary.
- No unrelated feature additions.
- No destructive git operations.
- Only wireframe-scoped UI edits.
