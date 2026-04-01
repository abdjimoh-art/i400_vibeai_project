# IceTrack — Skating School Administration
**Frank Southern Ice Arena · Indiana University I400 · Spring 2026**

## Setup Instructions

### 1. Install dependencies
```bash
npm install
```

### 2. Set up Supabase
1. Go to [supabase.com](https://supabase.com) and create a free project
2. Go to **SQL Editor** and paste + run the contents of `supabase-schema.sql`
3. Go to **Settings > API** and copy your Project URL and anon key

### 3. Configure environment variables
Fill in your real values in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```
> ⚠️ Never commit `.env.local` to GitHub. It is already in `.gitignore`.

### 4. Create an Admin user
Because admin is a privileged role, create it directly in Supabase:
1. Register a user via `/register` (any role)
2. In Supabase **Table Editor > profiles**, manually change their role to `admin`

### 5. Run the dev server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure
```
app/
  login/               → Login page (role-based redirect)
  register/            → Registration page (parent or instructor)
  admin/dashboard/     → Admin: class management CRUD (+1 feature)
  instructor/dashboard → Instructor stub (Phase 2)
  parent/dashboard     → Parent stub (Phase 2)
  auth/callback/       → Supabase auth callback handler
lib/supabase/
  client.ts            → Browser Supabase client
  server.ts            → Server Supabase client
middleware.ts          → Protects all /admin /instructor /parent routes
supabase-schema.sql    → Run this in Supabase SQL Editor
```

## Tech Stack
- **Frontend:** Next.js 14 + TypeScript + Tailwind CSS (Vercel)
- **Database:** Supabase (PostgreSQL + Auth + RLS)
- **AI Coding Agent:** Claude Code / Claude (claude.ai)

## Phase 1 Checklist
- [x] Supabase Auth (register + login + logout)
- [x] Role-based redirect (admin / instructor / parent)
- [x] Protected routes via middleware
- [x] DB schema with RLS policies
- [x] .env.local gitignored
- [x] +1 Feature: Admin Class Management CRUD
