# Ice Skating School Full-Stack App

This repository is a full-stack application built for an Ice Skating School.

## Each student will add a branch with their own code 
#remember to use **git pull** before starting to work to get other students work.
They are a few duplicate features, in which case, for example rating, in which case you may add a button taking to rating1 or rating2 with the different feel.
If necessary to add additional tables for your features, please make sure to add them also to the supabase.sql file.

Remeber to add and admin user (after login in once) and use the password you see in canvas. user admin@admin.com

List here your feature description, image and video (remember to add image and video to docs folder)

## Features

### Feature: Attendance Tracking & Skill Check-offs (skilltracker-abdjimoh)

**Branch:** `skilltracker-abdjimoh` | **Author:** abdjimoh

Instructors can now take attendance and sign off on individual skating skills for every skater in their assigned classes.

#### What it does

- **Attendance grid** — Instructor selects their class and a session date. Each enrolled skater appears as a card; clicking toggles between Present (green) and Absent. Changes are saved to the database instantly (optimistic UI with server persistence).

- **Skill check-off matrix** — Below the attendance grid, all skills for the class level are listed as rows, with each enrolled skater as a column. Clicking a circle marks that skater as having passed the skill (green ✓) or removes the completion. Passing standards are shown under each skill name.

- **Class & date selectors** — Instructors only see their own assigned classes. Attendance is tracked per date so historical records are preserved.

#### How to use

1. Log in as a user with the `instructor` role
2. Select a class from the dropdown (only assigned classes appear)
3. Pick a session date — today is pre-selected
4. Toggle attendance for each skater
5. Check off skills as skaters pass them during the session

#### New API endpoints (Express backend)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/instructor/classes` | Classes assigned to the calling instructor |
| `GET` | `/api/instructor/classes/:classId/enrollments` | Skaters enrolled in a class |
| `GET` | `/api/instructor/attendance?classId=&date=` | Attendance records for a class/date |
| `POST` | `/api/instructor/attendance` | Upsert an attendance record |
| `GET` | `/api/skills?levelId=` | Skills for a given level |
| `GET` | `/api/instructor/skill-completions/:classId` | Skill completions for all skaters in a class |
| `POST` | `/api/instructor/skill-completions` | Mark or unmark a skill complete |
| `GET` | `/api/levels` | All skating levels |

#### Database tables used

These tables already exist in the Supabase project:
- `attendance_records` — `(class_id, skater_id, session_date, present)` — unique per class/skater/date
- `skill_completions` — `(skater_id, skill_id, completed_date, instructor_id)` — unique per skater/skill
- `skills` — `(level_id, name, passing_standard, order_index)` — pre-seeded for all 8 levels
- `enrollments` — existing table linking skaters to classes



## Technical details

Stack:
- Frontend: React + Vite (`apps/web`)
- Backend: Express + TypeScript (`apps/api`)
- Auth + Database: Supabase

Three roles are supported:
- `admin`: can manage users, create 8-week sessions, schedule classes, and assign instructors.
- `instructor`: can view the classes they have been assigned to teach.
- `parent`: can sign up, add kids to their profile, and enroll them in available classes within capacity limits.

Role permissions are dynamically enforced by Row Level Security (RLS) in the database and guarded endpoints in the Express backend API.

## Data Model (Supabase)

Run `apps/api/supabase/schema.sql` in the Supabase SQL editor. It wipes any existing demo data and creates:
- `user_role` enum (`admin`, `instructor`, `parent`)
- `users` (syncs with auth system, defaults to parent on signup)
- `kids` (associated with a parent)
- `sessions` (8-week duration metadata)
- `classes` (levels, times, days, capacities)
- `class_enrollments` (maps a kid to a class)

The initial seed will auto-generate an admin user.
**Initial Admin Credentials:**
- **Email**: `frank@admin.com`
- **Password**: `frank`

`apps/api/prisma/schema.prisma` mirrors these tables for code reference if using Prisma.

## 1. Create a Supabase project

Collect from your Supabase dashboard:
- Project URL
- Publishable key
- Service role key

## 2. Run Database Initialization

Execute the full script in the Supabase SQL Editor:
- `apps/api/supabase/schema.sql`

## 3. Configure backend env (local)

From repo root:

```powershell
copy apps\api\.env.example apps\api\.env
```

Set values in `apps/api/.env`:

```env
SUPABASE_URL="https://YOUR-PROJECT-ID.supabase.co"
SUPABASE_PUBLISHABLE_KEY="YOUR_SUPABASE_PUBLISHABLE_KEY"
SUPABASE_SERVICE_ROLE_KEY="YOUR_SUPABASE_SERVICE_ROLE_KEY"
CORS_ORIGINS="https://YOUR-VERCEL-DOMAIN.vercel.app,http://localhost:5173"
PORT=4000
```

## 4. Configure frontend env (local)

```powershell
copy apps\web\.env.example apps\web\.env.local
```

Set:

```env
VITE_API_BASE_URL="http://localhost:4000"
```

## 5. Install dependencies

```bash
npm install
```

## 6. Run locally

```bash
npm run dev
```

- Web: `http://localhost:5173`
- API health: `http://localhost:4000/health`

## 7. Main API endpoints

Auth:
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`

Admin:
- `GET /api/admin/users`
- `PATCH /api/admin/users/:userId/role`
- `POST /api/admin/sessions`
- `POST /api/admin/classes`
- `PATCH /api/admin/classes/:id/instructor`

Parent:
- `GET /api/parent/kids`
- `POST /api/parent/kids`
- `POST /api/parent/enrollments`
- `DELETE /api/parent/enrollments/:classId/:kidId`

Instructor:
- `GET /api/instructor/classes`
- `GET /api/instructor/classes/:classId/enrollments`
- `GET /api/instructor/attendance?classId=&date=`
- `POST /api/instructor/attendance`
- `GET /api/instructor/skill-completions/:classId`
- `POST /api/instructor/skill-completions`

Public:
- `GET /api/sessions`
- `GET /api/classes`
- `GET /api/levels`
- `GET /api/skills?levelId=`

## 8. Production setup (Render API + Vercel Web)

Important:
- Keep backend routes unchanged (`/api/...`).
- Do not add a trailing slash in `VITE_API_BASE_URL`.
- Deployment definitions are included in `render.yaml` and `apps/web/vercel.json`.

### 8.1 Render API service

Use `render.yaml` as the source of truth for Render.
Set environment variables: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `CORS_ORIGINS`.

### 8.2 Vercel Web project

Use `apps/web/vercel.json` as the source of truth for Vercel.
Set environment variable: `VITE_API_BASE_URL=https://YOUR-RENDER-API.onrender.com`.

### 8.3 Verify production

1. Open `https://YOUR-RENDER-API.onrender.com/health` and confirm `{"status":"ok"}`.
2. Open your Vercel URL and test sign-in with the seed admin credentials.
