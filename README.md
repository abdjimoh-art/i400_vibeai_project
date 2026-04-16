# IceTrack — Skating School Administration
**Indiana University · I400-Vibe and AI Programming · Spring 2026**

IceTrack is a full-stack web application for managing a skating school (Frank Southern Ice Arena). It provides role-based dashboards for admins, instructors, and parents to manage classes, track attendance, record skill progress, and coordinate skating shows.

---

## Demo Video

<!-- After recording, add a screenshot to docs/images/ and the video to docs/videos/, then update the link below -->
<a href="docs/videos/icetrack-demo.mp4">
  <img src="docs/images/icetrack-screenshot.png" alt="IceTrack Demo" width="600">
</a>

*Click the image above to watch the demo video.*

---

## Features

### Admin Dashboard
- **Class Management** — Create, edit, and delete skating classes (level, instructor, schedule, ice zone)
- **Skater Profiles** — Add and manage skater records linked to parent accounts
- **Enrollment** — Enroll/unenroll skaters into classes with one click
- **Skating Show Management** — Create shows with themes, dates, and locations; organize skaters into performance groups; schedule practice sessions

### Instructor Dashboard
- **Attendance Tracking** — Interactive session grid; mark skaters present/absent per class date
- **Skill Check-offs** — Track completion of level-specific skills (53 skills across 8 levels); record completion dates

### Parent Dashboard
- **Children Overview** — View enrolled classes and attendance history per child
- **Skill Card** — Read-only view of child's skill progress with completion dates
- **Skating Show Info** — See group assignments and practice schedule
- **Calendar Export** — Download show/practice schedule as an `.ics` file for Outlook or Google Calendar

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 + React 19 + TypeScript + Tailwind CSS 4 |
| Backend | Next.js App Router (Server Actions + API routes) |
| Database | Supabase (PostgreSQL + Auth + Row Level Security) |
| Testing | Vitest 4 + jsdom |
| AI Coding Agent | Claude Code (claude.ai/code) |

---

## Setup Instructions

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd i400_vibeai_project
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up Supabase
1. Go to [supabase.com](https://supabase.com) and create a free project
2. In **SQL Editor**, run `supabase-schema.sql` first (core schema + RLS)
3. Then run `supabase-phase2.sql` (skaters, skills, attendance, shows)
4. Go to **Settings > API** and copy your Project URL, anon key, and service role key

### 4. Configure environment variables
Copy `.env.example` to `.env.local` and fill in your values:
```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```
> `.env.local` is gitignored and will never be committed.

### 5. Create an Admin user
Because admin is a privileged role, it must be created manually:
1. Register any user via `/register`
2. In Supabase **Table Editor → profiles**, change their `role` to `admin`

### 6. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
app/
  login/                  → Login page (role-based redirect)
  register/               → Registration (parent or instructor)
  admin/dashboard/        → Admin: classes, skaters, enrollments, shows
  instructor/dashboard/   → Instructor: attendance grid + skill check-offs
  parent/dashboard/       → Parent: children, attendance, skills, show info
  auth/callback/          → Supabase auth callback
  api/
    skaters/              → Skater CRUD endpoints
    enrollments/          → Enrollment management
    attendance/           → Attendance records
    skills/               → Skills by level
    skill-completions/    → Skill check-off tracking
    skating-shows/        → Show + group + practice management

lib/supabase/
  client.ts               → Browser Supabase client
  server.ts               → Server Supabase client

middleware.ts             → Protects /admin /instructor /parent routes
supabase-schema.sql       → Core schema (run first)
supabase-phase2.sql       → Phase 2 schema (run second)
.env.example              → Environment variable template
```

---

## Running Tests

```bash
npm run test:run    # Run once
npm test            # Watch mode
```

---

## Acknowledgement

*Developed in the class I400-Vibe and AI Programming, Spring 2026, IUB, with the assistance of models (gemini/codex/...) withing (cursor/antigravity/vscode/...).*

---

## Phase Checklists

### Phase 1
- [x] Supabase Auth (register + login + logout)
- [x] Role-based redirect (admin / instructor / parent)
- [x] Protected routes via middleware
- [x] DB schema with RLS policies
- [x] `.env.local` gitignored
- [x] Admin Class Management CRUD

### Phase 2
- [x] Skater profile management
- [x] Enrollment management
- [x] Instructor attendance tracking
- [x] Skill check-offs (53 skills across 8 levels)
- [x] Skating show management (shows → groups → practices)
- [x] Parent dashboard (attendance, skill card, show info)
- [x] ICS calendar export
- [x] Security audit (3 vulnerabilities fixed — see SECURITY.md)
- [x] Unit tests (Vitest + jsdom)
