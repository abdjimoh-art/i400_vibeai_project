# IceTrack Security Analysis

_Phase 2 audit — conducted with Claude Code as AI Security Consultant_

---

## 3 Worst-Case Scenarios (Vulnerabilities Found & Fixed)

### 1. Self-Role Escalation on Registration (HIGH) — FIXED

**What could go wrong:**
A malicious user registers through the normal UI, then uses browser devtools to intercept the profile insert request and change `role: "parent"` to `role: "admin"`. The original RLS policy only checked that `auth.uid() = id` — it did not restrict the role value. The attacker gains full admin access: they can create, edit, and delete all classes and view all user data.

**Fix applied:**
- `app/register/actions.ts` — New Server Action `createProfile()` validates the role against a server-side whitelist `['parent', 'instructor']` before inserting. Any attempt to set `role: 'admin'` returns an error without touching the database.
- `supabase-schema.sql` — Updated the `"Allow profile creation on signup"` RLS policy to add `AND role IN ('parent', 'instructor')` as a database-level defense-in-depth constraint.

---

### 2. Middleware Does Not Enforce Role (HIGH) — FIXED

**What could go wrong:**
The original `middleware.ts` only called `supabase.auth.getUser()`. It confirmed you were _logged in_, but not _who you were_. A logged-in parent could navigate directly to `/admin/dashboard`, and the server would render the full admin HTML including the class list and CRUD controls. The only protection was a `router.push('/login')` inside a `useEffect` — which fires after the page is already rendered client-side, meaning the page content flashes and the full HTML is sent to the browser.

**Fix applied:**
- `middleware.ts` — Added `ROLE_ROUTES` map (`/admin → admin`, `/instructor → instructor`, `/parent → parent`). For any protected route, the middleware now fetches the user's role from the `profiles` table and redirects to `/login` if it doesn't match. A parent hitting `/admin/dashboard` never receives the page HTML.

---

### 3. No Server-Side Validation on Class Mutations (HIGH) — FIXED

**What could go wrong:**
The admin class CRUD form originally sent data directly from the browser to Supabase using the anon key. There was no server validating that `level_id` was a real UUID, that `day_of_week` was one of seven valid strings, or that `time_slot` wasn't 10,000 characters long. A malicious admin could probe the schema by sending arbitrary payloads, or corrupt the database with malformed data that would break queries across all dashboards.

**Fix applied:**
- `app/admin/actions.ts` — New Server Actions `upsertClass()` and `deleteClass()` validate all inputs before any database write: UUID format check on `level_id` and `instructor_id`, enum whitelist on `day_of_week` and `ice_location`, length cap on `time_slot`. The admin dashboard now calls these actions instead of writing directly to Supabase.

---

## 3 Scenarios IceTrack Is NOT Prone To

### 1. SQL Injection — Not a Threat

IceTrack uses the Supabase JavaScript client, which communicates with the database through PostgREST. All query parameters are automatically parameterized — there is no raw SQL string concatenation anywhere in the application code. An attacker cannot inject SQL through any form field or URL parameter.

### 2. Stored Cross-Site Scripting (XSS) — Not a Serious Threat

Next.js App Router renders all output through React, which auto-escapes HTML characters in JSX. There is no use of `dangerouslySetInnerHTML` anywhere in the codebase. Even if a user saved a malicious string like `<script>alert(1)</script>` as their name, React would render it as the literal text, not as executable HTML.

### 3. Horizontal Privilege Escalation on Data Reads — Not Exploitable

Supabase Row Level Security (RLS) is enabled on all tables and enforces data isolation at the database layer. The `enrollments` RLS policy uses `parent_id = auth.uid()`, which means even if a parent guessed another parent's enrollment UUID and sent a crafted request, Supabase would return zero rows — the filter is evaluated in PostgreSQL, not in application code that could be bypassed.

---

## Rate Limiting on Authentication

The Supabase Auth endpoint has built-in rate limiting for sign-in attempts. This is configured in the Supabase Dashboard under **Authentication → Rate Limits**. Verify that "Sign-in attempts" rate limiting is enabled. Application-level brute-force protection (CAPTCHA, attempt counters) is Phase 3 scope.

---

## Additional Rules for Future Development

All database mutations **must** go through Next.js Server Actions — never through direct client-to-Supabase calls in `'use client'` components. This ensures:
1. Server-side validation before any write reaches the database
2. CSRF protection via Next.js's built-in origin validation on Server Actions
3. Role verification on every mutating operation
