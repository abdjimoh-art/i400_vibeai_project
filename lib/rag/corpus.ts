/**
 * Static knowledge base for IceTrack RAG (Frank Southern skating school context).
 * Keep chunks factual and aligned with in-app behavior; the model must not invent policy.
 */
export type RagChunk = {
  id: string
  source: string
  title: string
  text: string
}

export const RAG_CHUNKS: RagChunk[] = [
  {
    id: 'intro-1',
    source: 'IceTrack README',
    title: 'What IceTrack is',
    text: 'IceTrack is a web application for skating school administration at Frank Southern Ice Arena, used in Indiana University I400-Vibe and AI Programming. It is not a public marketing site: the home route redirects to login. After sign-in, users are routed to role-specific dashboards.',
  },
  {
    id: 'roles-1',
    source: 'IceTrack README',
    title: 'User roles',
    text: 'There are three roles: admin, instructor, and parent. Each role has a dedicated dashboard under /admin/dashboard, /instructor/dashboard, and /parent/dashboard. Middleware enforces that a signed-in user may only open routes matching their profile role.',
  },
  {
    id: 'admin-1',
    source: 'IceTrack README',
    title: 'Admin capabilities',
    text: 'Admins manage skating classes (level, instructor, schedule, ice zone), skater profiles linked to parent accounts, enrollments, and skating shows (themes, dates, locations). Admins see an Overview tab with KPIs, enrollment by level, and show-related summaries.',
  },
  {
    id: 'instructor-1',
    source: 'IceTrack README',
    title: 'Instructor capabilities',
    text: 'Instructors take attendance per class and session date: each enrolled skater can be marked present or absent. Instructors record skill check-offs against level-specific skills (the program tracks many skills across multiple levels). Instructors only see classes they are assigned to.',
  },
  {
    id: 'parent-1',
    source: 'IceTrack README',
    title: 'Parent capabilities',
    text: 'Parents see their children’s enrolled classes, attendance history, read-only skill progress with completion dates, skating show group assignments and practice schedules, and can download an .ics calendar file for show and practice dates.',
  },
  {
    id: 'skills-1',
    source: 'IceTrack README',
    title: 'Skills system',
    text: 'Skills are organized by skating level. Instructors mark when a skater has passed a skill; passing standards are stored with each skill. Parents view completed skills and dates on the skill card and skill journey pages.',
  },
  {
    id: 'shows-1',
    source: 'IceTrack README',
    title: 'Skating shows',
    text: 'Skating shows include a name, theme, date, time, and location. Admins organize skaters into performance groups and schedule practice sessions. Parents and instructors consume this information according to their permissions.',
  },
  {
    id: 'auth-1',
    source: 'IceTrack README',
    title: 'Authentication',
    text: 'Authentication uses Supabase Auth. Environment variables include NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY for server operations. Users register and log in through the app; role is stored on the profile record.',
  },
  {
    id: 'tech-1',
    source: 'IceTrack README',
    title: 'Tech stack',
    text: 'IceTrack uses Next.js App Router, React, TypeScript, Tailwind CSS, and Supabase (PostgreSQL, Auth, Row Level Security). API routes and server actions implement server-side logic.',
  },
  {
    id: 'arena-1',
    source: 'Course context',
    title: 'Frank Southern Ice Arena',
    text: 'The product copy positions IceTrack for Frank Southern Ice Arena in Bloomington, Indiana, as part of the Spring 2026 course narrative. Class schedules reference day of week, time slot, and ice location or zone.',
  },
  {
    id: 'enrollment-1',
    source: 'IceTrack README',
    title: 'Enrollment',
    text: 'Enrollment links skaters to classes. Admins and the enrollment UI handle enrolling and unenrolling skaters. Capacity and level matching are part of class configuration.',
  },
  {
    id: 'journey-1',
    source: 'IceTrack README',
    title: 'Skill journey',
    text: 'Parents can open a per-skater skill journey route under /parent/journey/[skaterId] to see progress in more detail alongside the dashboard skill card.',
  },
  {
    id: 'security-1',
    source: 'IceTrack SECURITY.md',
    title: 'Security posture',
    text: 'The project documents a security review and fixes. Row Level Security in Supabase restricts data by role. Server routes that aggregate sensitive data should verify the caller’s role before returning data.',
  },
  {
    id: 'demo-1',
    source: 'IceTrack README',
    title: 'Demo accounts',
    text: 'After running the provided Supabase reset or demo SQL, demo logins may include parent@icetrack.com, instructor@icetrack.com, and admin@icetrack.com with passwords documented in the README. These are for local and course demos only.',
  },
  {
    id: 'assistant-1',
    source: 'IceTrack RAG',
    title: 'IceTrack Assistant',
    text: 'The IceTrack Assistant uses retrieval-augmented generation: it retrieves short excerpts from this knowledge base, then answers using a Groq language model. If the answer is not supported by the retrieved excerpts, the assistant should say it does not have that information and suggest contacting program staff.',
  },
  {
    id: 'calendar-1',
    source: 'IceTrack README',
    title: 'Calendar export',
    text: 'Parents can export show and practice times as an ICS file for use in calendar applications such as Google Calendar or Outlook.',
  },
  {
    id: 'attendance-1',
    source: 'IceTrack README',
    title: 'Attendance records',
    text: 'Attendance is tracked per class, skater, and session date. Historical attendance is preserved when parents review their child’s attendance history.',
  },
  {
    id: 'instructor-assign-1',
    source: 'IceTrack README',
    title: 'Instructor assignment',
    text: 'Classes have a primary instructor and may support additional instructors per class via a class-instructor support table described in setup SQL. Instructors only interact with classes they are assigned to.',
  },
  {
    id: 'levels-1',
    source: 'IceTrack README',
    title: 'Levels',
    text: 'Skating levels are ordered and used to filter skills and class configuration. The admin overview may show enrollment counts relative to estimated capacity by level.',
  },
  {
    id: 'reports-1',
    source: 'IceTrack README',
    title: 'Reports',
    text: 'The Reports area in the admin dashboard is described as a placeholder for future exportable program analytics.',
  },
  {
    id: 'design-1',
    source: 'IceTrack README',
    title: 'Design handoff',
    text: 'High-fidelity and wireframe references live under docs/design-handoff. Admin Overview follows the handoff direction with KPI strip, enrollment-by-level visualization, and activity rail.',
  },
]
