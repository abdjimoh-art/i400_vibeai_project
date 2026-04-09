# Ice Skating School Full-Stack App

This repository is a full-stack application built for an Ice Skating School.

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

Instructor & Public:
- `GET /api/sessions`
- `GET /api/classes`

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
