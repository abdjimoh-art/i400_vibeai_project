import cors from "cors";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";
import Groq from "groq-sdk";
import { z } from "zod";

dotenv.config();

type UserRole = "admin" | "instructor" | "parent";

type AuthResponse = {
  error?: string;
  message?: string;
};

type AuthenticatedUser = {
  id: string;
  role: UserRole;
};

const port = Number(process.env.PORT ?? 4000);
const supabaseUrl = process.env.SUPABASE_URL;
const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const groqApiKey = process.env.GROQ_API_KEY;
const corsOriginsRaw =
  process.env.CORS_ORIGINS ?? process.env.CORS_ORIGIN ?? "http://localhost:5173";
const allowedOrigins = corsOriginsRaw
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

if (!supabaseUrl || !supabasePublishableKey || !supabaseServiceRoleKey) {
  throw new Error(
    "Missing Supabase configuration. Set SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, and SUPABASE_SERVICE_ROLE_KEY."
  );
}

const groqApiKeyVal = groqApiKey || "missing_key";
const groq = new Groq({ apiKey: groqApiKeyVal });

const authClient = createClient(supabaseUrl, supabasePublishableKey);
const dbClient = createClient(supabaseUrl, supabaseServiceRoleKey);

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  })
);
app.use(express.json());

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100)
});

function readBearerToken(request: Request) {
  const header = request.headers.authorization;
  if (!header) return null;
  const [scheme, token] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;
  return token;
}

// Real schema uses "profiles" table (not "users")
async function fetchUserRole(userId: string): Promise<UserRole | null> {
  const { data, error } = await dbClient
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data?.role) return null;
  if (data.role !== "admin" && data.role !== "instructor" && data.role !== "parent") return null;
  return data.role;
}

async function requireUser(
  request: Request,
  response: Response,
  allowedRoles?: UserRole[]
): Promise<AuthenticatedUser | null> {
  const token = readBearerToken(request);
  if (!token) {
    response.status(401).json({ error: "Missing Bearer token" });
    return null;
  }

  const { data, error } = await authClient.auth.getUser(token);
  if (error || !data.user) {
    response.status(401).json({ error: "Invalid or expired token" });
    return null;
  }

  const role = await fetchUserRole(data.user.id);
  if (!role) {
    response.status(403).json({ error: "No user role found for this account." });
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    response.status(403).json({ error: "Insufficient role permissions." });
    return null;
  }

  return { id: data.user.id, role };
}

app.get("/health", (_request, response) => {
  response.json({ status: "ok" });
});

// ─── Auth Endpoints ────────────────────────────────────────────────────────

app.post("/api/auth/signup", async (request, response) => {
  const parsed = signupSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ error: "Invalid signup payload" });
    return;
  }

  const { data, error } = await authClient.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password
  });

  if (error) {
    response.status(400).json({ error: error.message });
    return;
  }

  if (data.user?.id) {
    const fullName = parsed.data.email.split("@")[0];
    const { error: profileError } = await dbClient
      .from("profiles")
      .upsert({ id: data.user.id, role: "parent", full_name: fullName }, { onConflict: "id" });
    if (profileError) {
      response.status(500).json({ error: "Account created but profile could not be saved." });
      return;
    }
  }

  response.status(201).json({
    message: "Account created.",
    userId: data.user?.id ?? null,
    accessToken: data.session?.access_token ?? null,
    role: "parent"
  });
});

app.post("/api/auth/login", async (request, response) => {
  const parsed = loginSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ error: "Invalid login payload" });
    return;
  }

  const { data, error } = await authClient.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password
  });

  if (error || !data.session) {
    response.status(401).json({ error: error?.message ?? "Login failed" });
    return;
  }

  const role = await fetchUserRole(data.user.id);
  if (!role) {
    response.status(403).json({ error: "No user role found for this account." });
    return;
  }

  response.json({
    message: "Login successful",
    userId: data.user.id,
    accessToken: data.session.access_token,
    role
  });
});

app.get("/api/auth/me", async (request, response) => {
  const user = await requireUser(request, response);
  if (!user) return;
  response.json({ userId: user.id, role: user.role });
});

// ─── Admin: Users (profiles table) ────────────────────────────────────────

app.get("/api/admin/users", async (request, response) => {
  const user = await requireUser(request, response, ["admin"]);
  if (!user) return;

  const { data, error } = await dbClient
    .from("profiles")
    .select("id, role, full_name, created_at");

  if (error) { response.status(500).json({ error: error.message }); return; }
  response.json(data);
});

app.patch("/api/admin/users/:userId/role", async (request, response) => {
  const user = await requireUser(request, response, ["admin"]);
  if (!user) return;

  const roleSchema = z.object({ role: z.enum(["admin", "instructor", "parent"]) });
  const parsed = roleSchema.safeParse(request.body);
  if (!parsed.success) { response.status(400).json({ error: "Invalid role" }); return; }

  const { error } = await dbClient
    .from("profiles")
    .update({ role: parsed.data.role })
    .eq("id", request.params.userId);

  if (error) { response.status(500).json({ error: error.message }); return; }
  response.json({ message: "Role updated" });
});

// ─── Sessions (virtual — real schema uses season TEXT on classes) ──────────

app.get("/api/sessions", async (request, response) => {
  const { data, error } = await dbClient.from("classes").select("season");
  if (error) { response.status(500).json({ error: error.message }); return; }

  const seasons = [...new Set((data ?? []).map((c: any) => c.season).filter(Boolean))];
  const sessions = seasons.map((s: string) => ({
    id: s,
    name: s,
    start_date: "2026-01-06",
    end_date: "2026-06-30"
  }));
  response.json(sessions);
});

app.post("/api/admin/sessions", async (request, response) => {
  const user = await requireUser(request, response, ["admin"]);
  if (!user) return;

  const sessionSchema = z.object({ name: z.string().min(1), startDate: z.string(), endDate: z.string() });
  const parsed = sessionSchema.safeParse(request.body);
  if (!parsed.success) { response.status(400).json({ error: "Invalid payload" }); return; }

  // No sessions table — return virtual session; season name is used as the ID
  response.status(201).json({
    id: parsed.data.name,
    name: parsed.data.name,
    start_date: parsed.data.startDate,
    end_date: parsed.data.endDate
  });
});

// ─── Levels ────────────────────────────────────────────────────────────────

app.get("/api/levels", async (request, response) => {
  const { data, error } = await dbClient.from("levels").select("*").order("order_index");
  if (error) { response.status(500).json({ error: error.message }); return; }
  response.json(data ?? []);
});

// ─── Classes ───────────────────────────────────────────────────────────────

app.get("/api/classes", async (request, response) => {
  const { data, error } = await dbClient
    .from("classes")
    .select("*, levels(id, name)");

  if (error) { response.status(500).json({ error: error.message }); return; }

  const { data: allEnrollments, error: enrollError } = await dbClient
    .from("enrollments")
    .select("class_id");

  if (enrollError) { response.status(500).json({ error: enrollError.message }); return; }

  const countMap = new Map<string, number>();
  for (const e of allEnrollments ?? []) {
    countMap.set(e.class_id, (countMap.get(e.class_id) ?? 0) + 1);
  }

  const payload = (data ?? []).map((cls: any) => ({
    id: cls.id,
    session_id: cls.season,
    instructor_id: cls.instructor_id,
    level: cls.levels?.name ?? cls.level_id,
    level_id: cls.level_id,
    level_name: cls.levels?.name ?? "",
    skill_set: cls.levels?.name ?? "",
    time: cls.time_slot,
    day_of_week: cls.day_of_week,
    capacity: 20,
    season: cls.season,
    ice_location: cls.ice_location,
    registrationCount: countMap.get(cls.id) ?? 0,
    sessions: { id: cls.season, name: cls.season }
  }));

  response.json(payload);
});

app.post("/api/admin/classes", async (request, response) => {
  const user = await requireUser(request, response, ["admin"]);
  if (!user) return;

  const classSchema = z.object({
    sessionId: z.string().min(1),          // season name used as ID
    levelId: z.string().uuid().optional(), // preferred
    level: z.string().optional(),          // fallback: resolve by name
    instructorId: z.string().uuid().nullable().optional(),
    time: z.string().min(1),
    dayOfWeek: z.string().min(1),
    capacity: z.number().int().min(1).optional()
  });

  const parsed = classSchema.safeParse(request.body);
  if (!parsed.success) { response.status(400).json({ error: "Invalid payload", details: parsed.error }); return; }

  let levelId = parsed.data.levelId;
  if (!levelId && parsed.data.level) {
    const { data: lvl } = await dbClient.from("levels").select("id").eq("name", parsed.data.level).maybeSingle();
    levelId = lvl?.id;
  }
  if (!levelId) { response.status(400).json({ error: "Valid levelId or level name required" }); return; }

  const { data, error } = await dbClient
    .from("classes")
    .insert({
      level_id: levelId,
      instructor_id: parsed.data.instructorId ?? null,
      time_slot: parsed.data.time,
      day_of_week: parsed.data.dayOfWeek,
      season: parsed.data.sessionId,
      ice_location: "Zone A"
    })
    .select()
    .single();

  if (error) { response.status(500).json({ error: error.message }); return; }
  response.status(201).json(data);
});

app.patch("/api/admin/classes/:id/instructor", async (request, response) => {
  const user = await requireUser(request, response, ["admin"]);
  if (!user) return;

  const patchSchema = z.object({ instructorId: z.string().uuid().nullable() });
  const parsed = patchSchema.safeParse(request.body);
  if (!parsed.success) { response.status(400).json({ error: "Invalid payload" }); return; }

  const { data, error } = await dbClient
    .from("classes")
    .update({ instructor_id: parsed.data.instructorId })
    .eq("id", request.params.id)
    .select()
    .single();

  if (error) { response.status(500).json({ error: error.message }); return; }
  response.json(data);
});

// ─── Parent: Skaters (kids) ────────────────────────────────────────────────

app.get("/api/parent/kids", async (request, response) => {
  const user = await requireUser(request, response, ["parent"]);
  if (!user) return;

  const { data, error } = await dbClient
    .from("skaters")
    .select("id, full_name")
    .eq("parent_id", user.id);

  if (error) { response.status(500).json({ error: error.message }); return; }
  // Normalize: return name field so frontend doesn't need changing
  response.json((data ?? []).map((s: any) => ({ id: s.id, name: s.full_name })));
});

app.post("/api/parent/kids", async (request, response) => {
  const user = await requireUser(request, response, ["parent"]);
  if (!user) return;

  const kidSchema = z.object({ name: z.string().min(1) });
  const parsed = kidSchema.safeParse(request.body);
  if (!parsed.success) { response.status(400).json({ error: "Invalid payload" }); return; }

  // Get parent's level_id (default to first level)
  const { data: firstLevel } = await dbClient.from("levels").select("id").order("order_index").limit(1).maybeSingle();

  const { data, error } = await dbClient
    .from("skaters")
    .insert({ parent_id: user.id, full_name: parsed.data.name, level_id: firstLevel?.id ?? null })
    .select()
    .single();

  if (error) { response.status(500).json({ error: error.message }); return; }
  response.status(201).json({ id: data.id, name: data.full_name });
});

// ─── Parent: Enrollments ───────────────────────────────────────────────────

app.post("/api/parent/enrollments", async (request, response) => {
  const user = await requireUser(request, response, ["parent"]);
  if (!user) return;

  const rollSchema = z.object({ classId: z.string().uuid(), kidId: z.string().uuid() });
  const parsed = rollSchema.safeParse(request.body);
  if (!parsed.success) { response.status(400).json({ error: "Invalid payload" }); return; }

  // Ensure skater belongs to parent
  const { data: skater, error: skaterError } = await dbClient
    .from("skaters").select("id").eq("id", parsed.data.kidId).eq("parent_id", user.id).maybeSingle();
  if (skaterError || !skater) { response.status(403).json({ error: "Skater not found or access denied" }); return; }

  const { error: insertError } = await dbClient
    .from("enrollments")
    .insert({ class_id: parsed.data.classId, skater_id: parsed.data.kidId });

  if (insertError) { response.status(500).json({ error: insertError.message }); return; }
  response.status(201).json({ message: "Enrollment successful." });
});

app.delete("/api/parent/enrollments/:classId/:kidId", async (request, response) => {
  const user = await requireUser(request, response, ["parent"]);
  if (!user) return;

  const { classId, kidId } = request.params;

  const { data: skater, error: skaterError } = await dbClient
    .from("skaters").select("id").eq("id", kidId).eq("parent_id", user.id).maybeSingle();
  if (skaterError || !skater) { response.status(403).json({ error: "Skater not found or access denied" }); return; }

  const { error } = await dbClient
    .from("enrollments")
    .delete()
    .eq("class_id", classId)
    .eq("skater_id", kidId);

  if (error) { response.status(500).json({ error: error.message }); return; }
  response.status(200).json({ message: "Unenrollment successful." });
});

app.get("/api/parent/enrollments", async (request, response) => {
  const user = await requireUser(request, response, ["parent"]);
  if (!user) return;

  const { data: skaters, error: skatersError } = await dbClient
    .from("skaters").select("id").eq("parent_id", user.id);
  if (skatersError) { response.status(500).json({ error: skatersError.message }); return; }

  const skaterIds = (skaters ?? []).map((s: any) => s.id);
  if (skaterIds.length === 0) { response.json([]); return; }

  const { data, error } = await dbClient
    .from("enrollments")
    .select("*")
    .in("skater_id", skaterIds);

  if (error) { response.status(500).json({ error: error.message }); return; }
  // Normalize kid_id so frontend keeps working
  response.json((data ?? []).map((e: any) => ({ ...e, kid_id: e.skater_id })));
});

// ─── Instructor: Classes ───────────────────────────────────────────────────

app.get("/api/instructor/classes", async (request, response) => {
  const user = await requireUser(request, response, ["instructor", "admin"]);
  if (!user) return;

  const { data, error } = await dbClient
    .from("classes")
    .select("*, levels(id, name)")
    .eq("instructor_id", user.id)
    .order("day_of_week");

  if (error) { response.status(500).json({ error: error.message }); return; }

  const payload = (data ?? []).map((cls: any) => ({
    id: cls.id,
    level_id: cls.level_id,
    level: cls.levels?.name ?? "",
    level_name: cls.levels?.name ?? "",
    instructor_id: cls.instructor_id,
    day_of_week: cls.day_of_week,
    time: cls.time_slot,
    season: cls.season,
    ice_location: cls.ice_location
  }));

  response.json(payload);
});

// ─── Instructor: Enrolled skaters for a class ──────────────────────────────

app.get("/api/instructor/classes/:classId/enrollments", async (request, response) => {
  const user = await requireUser(request, response, ["instructor", "admin"]);
  if (!user) return;

  const { data, error } = await dbClient
    .from("enrollments")
    .select("id, skater_id, skaters(id, full_name)")
    .eq("class_id", request.params.classId);

  if (error) { response.status(500).json({ error: error.message }); return; }

  // Normalize to {id, kid_id, kids: {id, name}} for frontend compatibility
  const payload = (data ?? []).map((e: any) => ({
    id: e.id,
    kid_id: e.skater_id,
    kids: { id: e.skaters?.id, name: e.skaters?.full_name }
  }));

  response.json(payload);
});

// ─── Instructor: Attendance ────────────────────────────────────────────────

app.get("/api/instructor/attendance", async (request, response) => {
  const user = await requireUser(request, response, ["instructor", "admin"]);
  if (!user) return;

  const { classId, date } = request.query as { classId?: string; date?: string };
  if (!classId || !date) { response.status(400).json({ error: "classId and date are required" }); return; }

  const { data, error } = await dbClient
    .from("attendance_records")
    .select("*")
    .eq("class_id", classId)
    .eq("session_date", date);

  if (error) { response.status(500).json({ error: error.message }); return; }
  // Normalize skater_id → kid_id
  response.json((data ?? []).map((a: any) => ({ ...a, kid_id: a.skater_id })));
});

app.post("/api/instructor/attendance", async (request, response) => {
  const user = await requireUser(request, response, ["instructor", "admin"]);
  if (!user) return;

  const attendanceSchema = z.object({
    classId: z.string().uuid(),
    kidId: z.string().uuid(),
    date: z.string(),
    present: z.boolean()
  });

  const parsed = attendanceSchema.safeParse(request.body);
  if (!parsed.success) { response.status(400).json({ error: "Invalid payload" }); return; }

  const { data, error } = await dbClient
    .from("attendance_records")
    .upsert({
      class_id: parsed.data.classId,
      skater_id: parsed.data.kidId,
      session_date: parsed.data.date,
      present: parsed.data.present
    }, { onConflict: "class_id,skater_id,session_date" })
    .select()
    .single();

  if (error) { response.status(500).json({ error: error.message }); return; }
  response.json({ ...data, kid_id: data.skater_id });
});

// ─── Skills ────────────────────────────────────────────────────────────────

app.get("/api/skills", async (request, response) => {
  const user = await requireUser(request, response);
  if (!user) return;

  const { levelId } = request.query as { levelId?: string };

  let query = dbClient.from("skills").select("*").order("order_index");
  if (levelId) query = (query as any).eq("level_id", levelId);

  const { data, error } = await query;
  if (error) { response.status(500).json({ error: error.message }); return; }
  response.json(data ?? []);
});

// ─── Instructor: Skill completions ────────────────────────────────────────

app.get("/api/instructor/skill-completions/:classId", async (request, response) => {
  const user = await requireUser(request, response, ["instructor", "admin"]);
  if (!user) return;

  const { data: enrollments, error: enrollError } = await dbClient
    .from("enrollments")
    .select("skater_id")
    .eq("class_id", request.params.classId);

  if (enrollError) { response.status(500).json({ error: enrollError.message }); return; }

  const skaterIds = (enrollments ?? []).map((e: any) => e.skater_id);
  if (skaterIds.length === 0) { response.json([]); return; }

  const { data, error } = await dbClient
    .from("skill_completions")
    .select("*")
    .in("skater_id", skaterIds);

  if (error) { response.status(500).json({ error: error.message }); return; }
  // Normalize skater_id → kid_id
  response.json((data ?? []).map((sc: any) => ({ ...sc, kid_id: sc.skater_id })));
});

app.post("/api/instructor/skill-completions", async (request, response) => {
  const user = await requireUser(request, response, ["instructor", "admin"]);
  if (!user) return;

  const completionSchema = z.object({
    kidId: z.string().uuid(),
    skillId: z.string().uuid(),
    completed: z.boolean(),
    date: z.string().optional()
  });

  const parsed = completionSchema.safeParse(request.body);
  if (!parsed.success) { response.status(400).json({ error: "Invalid payload" }); return; }

  if (parsed.data.completed) {
    const { error } = await dbClient
      .from("skill_completions")
      .upsert({
        skater_id: parsed.data.kidId,
        skill_id: parsed.data.skillId,
        completed_date: parsed.data.date ?? new Date().toISOString().split("T")[0],
        instructor_id: user.id
      }, { onConflict: "skater_id,skill_id" });

    if (error) { response.status(500).json({ error: error.message }); return; }
    response.json({ message: "Skill marked complete" });
  } else {
    const { error } = await dbClient
      .from("skill_completions")
      .delete()
      .eq("skater_id", parsed.data.kidId)
      .eq("skill_id", parsed.data.skillId);

    if (error) { response.status(500).json({ error: error.message }); return; }
    response.json({ message: "Skill completion removed" });
  }
});

export { app };

if (!process.env.VITEST) {
  app.listen(port, () => {
    console.log(`API listening on port ${port}`);
  });
}
