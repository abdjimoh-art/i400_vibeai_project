# Handoff: IceTrack — Skating School Admin Platform

## Overview

IceTrack is a web application for **Frank Southern Ice Arena** (Bloomington, IN) that consolidates skating school operations into one tool. It serves three user roles — **parents**, **instructors**, and **admins** — and is anchored by a "skill tracker" feature that follows skaters through the 8-level Learn-to-Skate curriculum (Parent Tot → Level 5, 53 skills total).

This handoff packages the **picked hi-fi design directions** for: marketing landing, login, register, parent dashboard, instructor (tablet) dashboard, admin dashboard, and the skill-journey detail page.

## About the Design Files

The files in this bundle (`*.html`, `*.jsx`) are **design references created in HTML/React via in-browser Babel** — prototypes that show intended look, layout, and feel. They are **not production code to copy directly**.

Your job is to **recreate these designs in the target codebase's existing environment**. The IceTrack repo is a Next.js + Tailwind + Prisma app, so the React structure here will translate naturally — but routing, data, styling utilities, and component primitives should follow the patterns already established in that repo (App Router pages, Tailwind classes, server actions / API routes, Prisma models). If a Tailwind config doesn't yet have the tokens below, add them; don't ship raw inline styles.

## Fidelity

**High-fidelity.** Final colors, typography, spacing, and component shapes are intentional. Recreate pixel-faithfully using Tailwind utilities mapped to the tokens in the **Design Tokens** section. Any "icy gradient" or decorative SVG arc shown in the mocks is part of the brand language — keep them.

## Screens / Views

The design canvas (`IceTrack Hi-Fi.html`) shows seven artboards. Each maps to a route:

### 1. Marketing landing — `/`
- **Purpose**: Anonymous home page; convert visitors into accounts (parent or instructor).
- **Layout**: Sticky top nav (logo left, links + auth buttons right). Hero section with two-column grid (1.05fr / 1fr) — left is copy + CTAs, right is a decorative composition of three rotated product-peek cards (class card, "Just passed" celebration card, progress ring card). Below: an "eyebrow + centered heading" intro, then a 3-column feature grid (parent / instructor / admin "moments"). Below: a dark CTA strip in a 1.4fr/1fr two-column. Footer with logo + small links.
- **Hero copy**: "Skating school, *finally on one rink.*" — italic accent on the second line in `#1e5a91` (deep ice). Subtitle 17px, `inkSoft`, 460px max-width.
- **Background**: Aurora — `radial-gradient(1200px 600px at 0% 0%, #e3eef9 0%, transparent 60%), radial-gradient(800px 400px at 100% 100%, #f1f7fc 0%, transparent 50%), #f7f9fb`. Decorative SVG arc lines layered on top at 30% opacity.
- **CTA strip**: Background `#0c1a2b` (ink), italic accent in ice blue, decorative arc SVG at 18% opacity.
- See: `hifi-marketing.jsx`.

### 2. Login — `/login`
- **Purpose**: Email/password sign-in; IU SSO option.
- **Layout**: 50/50 split. Left = brand hero (gradient `linear-gradient(160deg, #1e5a91 0%, #3b82c4 60%, #4f9bd5 100%)` with arc-line SVG decoration, logo top-left, large headline, 3 stat tiles bottom — "53 / Skills tracked", "8 / Skating levels", "3 / Roles, one app"). Right = centered form (max-width 320px): email, password, "Forgot?" link, custom checkbox "Keep me signed in", primary submit, divider, "Continue with IU SSO" secondary, "Create an account →" footer link.
- **Headline**: "One rink. *Every skater.*" — italic accent, 56px, weight 300, `letter-spacing: -0.03em`.
- See: `hifi-auth.jsx` → `ITLoginHiFi`.

### 3. Register — `/register`
- **Purpose**: 3-step account creation; step 1 = role choice (parent or instructor; admin gated to staff).
- **Layout**: 260px sidebar (logo, numbered step list, info callout). Main column: eyebrow "Step 1 of 3", h1, subtitle, then 2-column role cards. Selected card has `#3b82c4` border, `0 0 0 3px #3b82c422` ring, and a checkmark badge top-right.
- **Admin callout**: Bottom of sidebar in `iceTint` background — "Admin? Admin accounts are created by IU staff." with `icetrack@iu.edu` mono inline.
- See: `hifi-auth.jsx` → `ITRegisterHiFi`.

### 4. Parent dashboard — `/parent`
- **Purpose**: Parent's home; see all enrolled skaters at a glance.
- **Layout**: 224px sidebar (nav with badges) + main. Main = header band ("Hi Sarah." + subtitle + Search/Add buttons), then 2-column skater-card grid, then bottom 1.5fr/1fr split — "Recent skill passes" list + "Spring showcase" gradient teaser card.
- **Skater card**: 56px avatar orb (radial-gradient w/ initials), name + level pill + age pill, progress bar (`5/8 skills`), 2-column footer in `surface2` showing "Next class" and "Last passed" (last passed in `crimson`).
- **Sidebar nav items**: Overview, My skaters, Schedule, Skill journeys, Spring show, Notifications (with badge `2`).
- See: `hifi-parent.jsx`.

### 5. Instructor — `/instructor` (tablet-first, 1180×820 viewport)
- **Purpose**: Rink-side tool for taking attendance and marking skill passes during class.
- **Layout**: Tablet bezel wrapper. Top bar (logo + "Instructor" pill + clock + avatar). Below: 240px class-list rail (today's classes vertically; active class highlighted with ice border + ring) + main roster panel.
- **Roster**: Header with eyebrow ("Tue 4:30 PM · Zone A · 6 skaters"), h1 "Level 2 *roster*" (italic), tab nav (Attendance / Skill passes / Notes), then a 2-column grid of skater cards. **Each skater card has two 44×44 tap targets** for present (green check) / absent (red ✕) — minimum hit target. Active state has `0 0 0 3px <color>22` ring. Absent skaters get `rustSoft` background + note line ("note: sick").
- **Top right**: "All present" + "Save session" buttons.
- See: `hifi-instructor.jsx`.

### 6. Admin — `/admin`
- **Purpose**: Operations overview for the program lead.
- **Layout**: Top nav (logo + "Admin" pill + tab nav: Overview/Classes/Skaters/Instructors/Show/Reports + ⌘K search + avatar). Main = header ("At a glance"), 4-column KPI strip, then 1.5fr/1fr — "Enrollment by level" (8 horizontal bars, full classes show in crimson with "FULL" label) + right rail (recent activity + showcase gradient card).
- **KPI cards**: Eyebrow, 38px display number, sub-line. Tones: ice (active classes), ink (skaters/instructors), spring (avg attendance — green for "good").
- See: `hifi-admin.jsx`.

### 7. Skill journey — `/parent/[skater]/level-[n]`
- **Purpose**: The +1 differentiator; celebrates skill progress per skater per level.
- **Layout**: Gradient header band (deep ice → ice → light ice) with breadcrumb, eyebrow ("Emma Mitchell · Age 7"), h1 "Level 2 *journey*", meta line, and a 130px circular progress ring (white stroke, dasharray driven by % complete). Body = 1fr/320px split. Left = vertical timeline of all 8 skills (dotted vertical line, colored dot per status, colored card with skill name + date + coach note). Right rail = "Just passed" celebration card (crimson gradient, medal icon, italic display copy, coach quote), "What's next after Level 2?" CTA, practice video placeholder (skate-blade pattern fill).
- **Timeline statuses**: passed (`crimson` dot, `crimsonSoft` card), working (`honey` dot, `honeySoft` card), next (`ice` dot, `iceSoft` card), locked (default, opacity 0.55).
- See: `hifi-skills.jsx`.

## Interactions & Behavior

- **Auth**: Standard email/password with "Keep me signed in"; IU SSO is a secondary option (probably SAML via NextAuth IU IdP). After login, route by role: parent → `/parent`, instructor → `/instructor`, admin → `/admin`.
- **Register**: Multi-step. Role choice persists in URL or local state through steps 2 (details) and 3 (verify email). Admin signup is **disabled** in the public flow — show the staff-contact callout.
- **Parent dashboard**: Skater cards click through to skill-journey page. "Add skater" opens a modal/drawer (not designed yet — follow your codebase's pattern). Notifications badge count comes from unread coach notes / show updates.
- **Instructor**:
  - Class-list rail items are clickable — switching classes swaps the roster.
  - Attendance toggles: tapping the green check sets `present=true`, the red ✕ sets `present=false`. Both buttons can be unset (null = unmarked). Active state shows ring.
  - "All present" mass-assigns. "Save session" persists the session record.
  - Tabs: Attendance / Skill passes / Notes. Skill-passes tab shows the same roster but each skater expands into a skill checklist (use the same colored-dot system from the skill journey).
- **Admin**: KPI cards are clickable → drill into the relevant detail view. Enrollment bars click → class roster. "FULL" classes need a waitlist hint on hover. ⌘K opens a global search palette.
- **Skill journey**: Each timeline entry expands on click to show full coach note + history. The "What's next" card routes to the next level's journey when current level hits 100%.
- **Animations**: Keep restrained — `transition: all 0.15s` on buttons, `transition: width 0.3s` on progress bars, `transition: border-color 0.15s, box-shadow 0.15s` on inputs. No bouncy / spring animations.

## State Management

Follow the existing IceTrack repo conventions (Next.js App Router → likely server components for read paths, server actions for writes, Prisma for data). Key entities (already in the schema):

- `User` — with `role` enum (parent | instructor | admin)
- `Skater` — belongs to a parent `User`
- `Class` — has level, capacity, schedule, instructor
- `Enrollment` — Skater ↔ Class
- `Session` — one class meeting; has attendance records
- `Attendance` — Session ↔ Skater + status
- `Skill` — 53 rows seeded across 8 levels
- `SkillPass` — Skater + Skill + passed date + coach + note
- `Show` / `ShowGroup` / `Practice` — for the spring showcase

Client-side state needed: form state (login/register/class CRUD), roster attendance toggles (optimistic), skill-pass checklist toggles. Use the codebase's existing form library (likely `react-hook-form` + `zod`) and toast/notification system.

## Design Tokens

Drop these into `tailwind.config.ts` under `theme.extend`:

### Colors
```ts
colors: {
  paper:    '#f7f9fb',  // app bg
  surface:  '#ffffff',
  surface2: '#f0f4f8',
  ink:      '#0c1a2b',  // primary text
  inkSoft:  '#324a63',
  muted:    '#6c8198',
  hairline: '#dde6ef',
  hairlineSoft: '#eaf0f6',
  ice: {
    DEFAULT: '#3b82c4',  // primary brand
    deep:    '#1e5a91',
    soft:    '#e3eef9',
    tint:    '#f1f7fc',
  },
  crimson: {              // IU — celebration only
    DEFAULT: '#7B1113',
    soft:    '#fae5e6',
  },
  honey:   { DEFAULT: '#d4a651', soft: '#faf1de' },  // milestones
  spring:  { DEFAULT: '#3a9a76', soft: '#e3f1ec' },  // attendance: present
  rust:    { DEFAULT: '#c66b4a', soft: '#f9e5dc' },  // attendance: absent
}
```

### Typography
```ts
fontFamily: {
  display: ['"Instrument Serif"', 'Charter', '"Iowan Old Style"', 'Georgia', 'serif'],
  sans:    ['Geist', '-apple-system', '"SF Pro Display"', 'system-ui', 'sans-serif'],
  mono:    ['"Geist Mono"', '"JetBrains Mono"', 'ui-monospace', 'monospace'],
}
```
- Load via `next/font/google` for `Instrument_Serif`, `Geist`, `Geist_Mono`.
- **Display rules**: weight 400, `letter-spacing: -0.015em` to `-0.035em` (tighter at larger sizes), `line-height: 0.95` for hero (72px) up to `1.05` for h3 (16px). **Italic accents** on key phrases (`*Every skater.*`, `*finally on one rink.*`, `*roster*`, `*journey*`, `*Under the Stars*`) — Instrument Serif's italic is the entire visual signature.
- **Body**: Geist 14px / line-height 1.45 default; 13px in dense UI (skater cards, table rows); 17px for marketing subhead.
- **Mono**: 11–13px. Use for: eyebrow microcopy (`UPPERCASE`, `letter-spacing: 0.12em`, `font-weight: 500`), timestamps (`Tue · Apr 28 · 4:18 PM`), IDs/emails, ratios (`5/8`), percentages (`62%`).

### Radius / shadow / spacing
```ts
borderRadius: { sm: '6px', md: '10px', lg: '14px', xl: '20px' }
boxShadow: {
  card: '0 1px 0 rgba(12,26,43,0.04), 0 1px 2px rgba(12,26,43,0.05)',
  lift: '0 1px 0 rgba(12,26,43,0.04), 0 8px 28px -8px rgba(30,90,145,0.18)',
}
```
- Standard padding scale: 8 / 12 / 14 / 18 / 20 / 22 / 24 / 28 / 32 / 40 / 44 px.
- Card padding: 18–24px. Card gap: 10–14px.

### Component primitives (build these once)
- `<Button>` variants: `primary` (ice bg, white text, blue lift shadow), `ghost` (transparent → surface2 on hover), default (white bg, hairline border), sizes `sm`/`md`/`lg`. See `.it-btn` rules in `it-system.jsx`.
- `<Pill>` variants: `default`, `ice`, `crimson`, `spring`, `honey`, `solidIce` — all with soft background + matching border color at 22–55% opacity.
- `<Avatar>`: circular orb with `radial-gradient` derived from a hue seed (use the user's name char-code; see `ITAvatar` for the algorithm). Initials inside.
- `<Card>`: `bg-surface border border-hairline rounded-lg shadow-card`.
- `<Eyebrow>`: `font-mono text-[11px] uppercase tracking-[0.12em] text-muted font-medium`.
- `<Progress>`: 6px track in `hairlineSoft`, fill in `ice`, fully rounded.
- `<Input>`: `border-hairline focus:border-ice focus:ring-3 focus:ring-ice/[0.13]`, 10px×12px padding, 6px radius.

### Decorative SVG patterns
Aurora arcs (used in marketing hero, login brand, skill-journey header, admin showcase tile):
```tsx
<svg className="absolute inset-0 opacity-15" viewBox="0 0 1200 600" preserveAspectRatio="none">
  <path d="M-50 460 Q 300 340, 600 420 T 1300 380" stroke="currentColor" strokeWidth="1.5" fill="none" />
  <path d="M-50 500 Q 300 390, 600 460 T 1300 420" stroke="currentColor" strokeWidth="1.2" fill="none" />
</svg>
```
Concentric rings (top-right of dark surfaces): two circles, radius 40 + 60, no fill, white/ice stroke.

## Assets

- **Logo**: SVG mark = abstract skate blade arc + figure (see `ITLogo` in `it-system.jsx`). Pair with wordmark "Ice*Track*" (italic on second word, Instrument Serif). Implement as a React component, not an `.svg` file, so the color can swap.
- **Icons**: Custom 24×24 line icons at `strokeWidth: 1.6` — see `ITIcon` for the full set (home, skater, cal, star, show, check, plus, arrow-right, chevron, search, bell, users, chart, settings, sparkle, medal, pin, clock, menu, logout, edit, trash). Replace with a real icon library (Lucide is closest in stroke weight) or extract these as a small SVG component set.
- **Avatars**: Stylized initial orbs — **no real photos in v1**. Algorithm: hue seeded from name's first char-code; `radial-gradient` from `hsl(h 35% 92%)` to `hsl(h+20 30% 80%)`; text `hsl(h 30% 30%)`.
- **Photographic placeholder pattern**: `repeating-linear-gradient(115deg, <iceTint> 0 18px, <iceSoft> 18px 19px)` — the "skate blade keyline" pattern. Used for video thumbnails until real footage exists.

## Files

In this handoff folder:

- `IceTrack Hi-Fi.html` — entry point; loads all jsx files into a pannable design canvas with all 7 artboards.
- `it-system.jsx` — design tokens (`IT.*` object), global styles injection, shared primitives (`ITLogo`, `ITIcon`, `ITAvatar`, `ITHeader`, `ITBrowser`, `ITTablet`).
- `hifi-auth.jsx` — `ITLoginHiFi`, `ITRegisterHiFi`.
- `hifi-parent.jsx` — `ITParentHiFi`.
- `hifi-instructor.jsx` — `ITInstructorHiFi` (wrapped in tablet bezel).
- `hifi-admin.jsx` — `ITAdminHiFi`.
- `hifi-skills.jsx` — `ITSkillsHiFi` (the +1 feature).
- `hifi-marketing.jsx` — `ITMarketingHiFi`.
- `design-canvas.jsx` — the pan/zoom canvas wrapper (NOT for production — design tool only).
- `IceTrack Wireframes.html` (+ `screens-*.jsx`, `wireframe-primitives.jsx`, `tweaks-panel.jsx`) — earlier-phase low-fi wireframes; reference only, shows the full exploration before picks were made.

To open: serve the folder over any static server (`npx serve .`) and open `IceTrack Hi-Fi.html`.

## Implementation Order Suggestion

1. Tokens + base components (Button, Card, Pill, Avatar, Eyebrow, Input, Progress) into Tailwind + shadcn-style primitives.
2. Auth (login + register) — simplest, exercises tokens + form patterns.
3. Parent dashboard — exercises Skater data layer.
4. Skill journey — adds Skill + SkillPass.
5. Instructor tablet — exercises attendance writes + tap-target ergonomics.
6. Admin — adds aggregations + reports.
7. Marketing — last; depends on stable brand bits.

## Out of Scope (not designed)

- Modals/drawers for "Add skater", "Create class", "Pass skill" — follow your codebase's pattern.
- Empty states for zero-skater / zero-class views.
- Error states (auth failures, network errors).
- Mobile parent dashboard (designed for desktop; phone version is in the wireframes — `screens-show-marketing.jsx`).
- Dark mode.
- The Show/Practice planner detail view.

Ping the designer if any token, copy, or interaction is unclear — many decisions are documented in the inline JSX comments and the wireframe phase had alternatives explored that may inform follow-ups.
