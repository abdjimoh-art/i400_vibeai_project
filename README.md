# IceTrack — Skating School Administration
**Indiana University · I400-Vibe and AI Programming · Spring 2026**

IceTrack is a full-stack web application for managing a skating school (Frank Southern Ice Arena). It provides role-based dashboards for admins, instructors, and parents to manage classes, track attendance, record skill progress, and coordinate skating shows.

**App entry:** there is no public marketing site in this repo. `/` redirects to **`/login`**. After sign-in, users are sent to **`/parent`**, **`/instructor`**, or **`/admin`** (short URLs), which immediately redirect to the corresponding **`/*/dashboard`** routes.

---

## Design fidelity (hi-fi / wireframes)

- Canonical reference files live in **`docs/design-handoff/`** (exported from the course wireframe pack: `hifi-*.jsx`, `screens-*.jsx`, HTML artboards, `README.md`).
- **Admin** follows the handoff choice **Overview first** (`hifi-admin.jsx`): default tab is **Overview** (KPI strip, enrollment-by-level bars, activity + showcase rail). **Classes**, **Skaters**, **Enrollment**, **Show**, and **Reports** remain for day-to-day CRUD and placeholders.
- **Login / register** are aligned to **`hifi-auth.jsx`** (split login hero, register sidebar, admin callout). **Marketing landing** from the handoff is intentionally **not** implemented.

---

## Demo Video

- Standalone demo (MP4, GitHub.com): [Watch IceTrack demo](docs/videos/ice-track-demo.mp4)
- Direct download/play fallback (GitHub.iu): [IceTrack demo MP4](https://github.iu.edu/I400sp25Vibe/ice_skating_fullstack/raw/skatingshow-abdjimoh/docs/videos/ice-track-demo.mp4)

---

## Features

### Admin Dashboard
- **Overview (default)** — KPI cards, enrollment-by-level visualization (vs estimated capacity), recent-activity rail, spring-showcase card; matches `hifi-admin.jsx` direction B
- **Class Management** — Create, edit, and delete skating classes (level, instructor, schedule, ice zone)
- **Skater Profiles** — Add and manage skater records linked to parent accounts
- **Enrollment** — Enroll/unenroll skaters into classes with one click
- **Instructors** — Read-only directory of instructor-role profiles (assign from class editor)
- **Reports** — Placeholder for future exportable program analytics
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
2. In **SQL Editor**, run **`supabase-reset.sql`** once — it drops/recreates every IceTrack table, seeds levels + 53 skills, the spring show calendar, and the three demo logins (fastest path for a clean project).
3. If you already ran the older split scripts and only need the login fix, run **`supabase-fix-login.sql`** (updates `is_admin()` + demo passwords).
4. If login still returns **"Database error querying schema"**, run **`supabase-hard-auth-fix.sql`** (repairs recursive RLS and older malformed `auth.users` demo rows in one pass).
5. Run **`supabase-multi-instructor.sql`** to enable one-or-more instructors per class (keeps current `classes.instructor_id` as primary + adds support table for additional instructors).
6. Go to **Settings > API** and copy your Project URL, anon key, and **service role** key.

### 4. Configure environment variables
Copy `.env.example` to `.env.local` and fill in your values:
```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GROQ_API_KEY=your-groq-api-key
```
Optional: `GROQ_CHAT_MODEL` (default `llama-3.1-8b-instant`). See **IceTrack Assistant** below.

> `.env.local` is gitignored and will never be committed.

### 5. Admin access & demo logins

**If you ran `supabase-reset.sql`:** an `admin` profile and user already exist — no manual promotion step.

**Otherwise (self-registered project):** create an admin by registering any account at `/register`, then in Supabase **Table Editor → `public.profiles`** set that row’s **`role`** to **`admin`**.

**If the database has schema but almost no rows** (common after auth repair), run **`supabase-seed-demo-data.sql`** for a light class + skater + enrollment sample, or **`supabase-reset.sql`** for a full reseed.

**Demo accounts** (after `supabase-reset.sql` or `supabase-demo-users.sql` + schema):
- `parent@icetrack.com` / `parent123`
- `instructor@icetrack.com` / `instructor123`
- `admin@icetrack.com` / `frankSouth`

**Login shows “Database error querying schema”?** That was caused by RLS evaluating `profiles` inside a `profiles` policy. The `is_admin()` helper must run with `SET row_security = off` on the function — run `supabase-fix-login.sql` (or re-run `supabase-reset.sql`).

### 6. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
app/
  page.tsx                → Redirects `/` → `/login` (no marketing site)
  login/                  → Login (hi-fi split layout; redirects by role)
  register/               → Registration (parent or instructor)
  admin/dashboard/        → Admin UI (Overview default + CRUD tabs)
  instructor/dashboard/   → Instructor: attendance + skill check-offs
  parent/dashboard/       → Parent: children, schedule, skills, show info
  parent/journey/[id]/    → Skill journey (per skater)
  auth/callback/          → Supabase auth callback
  api/
    auth/login/           → Password sign-in + profile bootstrap
    rag/chat/             → RAG chat (Groq embeddings + chat; all roles, session auth)
    admin/overview/       → Admin-only aggregates (enrollment by level, show counts)
    skaters/              → Skater CRUD
    enrollments/          → Enrollment management
    attendance/           → Attendance records
    skills/               → Skills by level
    skill-completions/    → Skill passes
    skating-shows/        → Shows, groups, practices

docs/design-handoff/      → Hi-fi + wireframe JSX/HTML from the course pack

lib/supabase/
  client.ts               → Browser Supabase client
  server.ts               → Server Supabase client

assistant/                → IceTrack Assistant UI (RAG + Groq; all roles)
middleware.ts             → Role checks for `/admin`, `/instructor`, `/parent`; `/assistant` for any app role
next.config.ts            → Short URLs `/admin` `/parent` `/instructor` → `/*/dashboard`
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

*Developed in the class I400-Vibe and AI Programming, Spring 2026, IUB, with the assistance of models (claude/codex/gemini) within Cursor.*

---

## Phase 3 (Standalone + Integration)

- Standalone reference implementation: this repository (`i400_vibeai_project`).
- Class integration target: `https://github.iu.edu/I400sp25Vibe/ice_skating_fullstack` on branch `skilltracker-abdjimoh`.
- **Design source:** `docs/design-handoff/` (hi-fi + wireframes; keep in sync with the course ZIP when it updates).
- For deliverables, add/update demo assets in `docs/images/` + `docs/videos/` and keep links in this README working.

---

## IceTrack Assistant (RAG + Groq)

Signed-in **admin**, **instructor**, and **parent** users can open **IceTrack Assistant** from each dashboard or at **`/assistant`**. The feature is a small **retrieval-augmented** pipeline:

1. **Retrieve** — The latest user question and every corpus chunk are embedded with Groq **`nomic-embed-text-v1.5`**. Top chunks by cosine similarity are selected.
2. **Augment** — Those chunk texts are injected into the system prompt as `CONTEXT`.
3. **Generate** — Groq **`llama-3.1-8b-instant`** (override with `GROQ_CHAT_MODEL`) completes the reply. The API returns `sources` (titles) for transparency.

**Code:** `lib/rag/corpus.ts` (knowledge snippets), `lib/rag/corpus-embeddings.ts`, `app/api/rag/chat/route.ts`, `app/assistant/page.tsx`.

**Local:** add `GROQ_API_KEY` to `.env.local` (see [Groq Console](https://console.groq.com/keys)).

**Deploying to Indiana University GitHub (`github.iu.edu`)** — same as any Next host: push this repo, then configure **server-side** secrets where you run production (for example GitHub Actions → environment secrets, or your platform’s env UI). Required for the assistant:

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (unchanged)
- **`GROQ_API_KEY`** (new; never expose as `NEXT_PUBLIC_*`)

Optional: `GROQ_CHAT_MODEL` if your Groq account uses a different chat model id.

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

### Extra credit — RAG + Groq
- [x] Functional RAG (Groq `nomic-embed-text-v1.5` retrieval + Groq chat) with UI at `/assistant` and dashboard entry points for admin, instructor, and parent
