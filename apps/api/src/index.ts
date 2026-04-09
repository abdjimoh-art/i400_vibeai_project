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

async function fetchUserRole(userId: string): Promise<UserRole | null> {
  const { data, error } = await dbClient
    .from("users")
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

// Auth Endpoints
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
    const { error: userError } = await dbClient
      .from("users")
      .upsert({ id: data.user.id, role: "parent" }, { onConflict: "id" });
    if (userError) {
      response.status(500).json({ error: "Account created but user role could not be saved." });
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

// Users handling (Admin)
app.get("/api/admin/users", async (request, response) => {
  const user = await requireUser(request, response, ["admin"]);
  if (!user) return;

  const { data, error } = await dbClient
    .from("users")
    .select("id, role, created_at");

  if (error) {
    response.status(500).json({ error: error.message });
    return;
  }

  response.json(data);
});

app.patch("/api/admin/users/:userId/role", async (request, response) => {
  const user = await requireUser(request, response, ["admin"]);
  if (!user) return;

  const roleSchema = z.object({ role: z.enum(["admin", "instructor", "parent"]) });
  const parsed = roleSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ error: "Invalid role" });
    return;
  }

  const { error } = await dbClient
    .from("users")
    .update({ role: parsed.data.role })
    .eq("id", request.params.userId);

  if (error) {
    response.status(500).json({ error: error.message });
    return;
  }

  response.json({ message: "Role updated" });
});

// Sessions
app.get("/api/sessions", async (request, response) => {
  const { data, error } = await dbClient.from("sessions").select("*").order("start_date", { ascending: true });
  if (error) {
    response.status(500).json({ error: error.message });
    return;
  }
  response.json(data);
});

app.post("/api/admin/sessions", async (request, response) => {
  const user = await requireUser(request, response, ["admin"]);
  if (!user) return;

  const sessionSchema = z.object({
    name: z.string().min(1),
    startDate: z.string(),
    endDate: z.string()
  });

  const parsed = sessionSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ error: "Invalid payload" });
    return;
  }

  const { data, error } = await dbClient
    .from("sessions")
    .insert({
      name: parsed.data.name,
      start_date: parsed.data.startDate,
      end_date: parsed.data.endDate
    })
    .select()
    .single();

  if (error) {
    response.status(500).json({ error: error.message });
    return;
  }
  response.status(201).json(data);
});

// Kids
app.get("/api/parent/kids", async (request, response) => {
  const user = await requireUser(request, response, ["parent"]);
  if (!user) return;

  const { data, error } = await dbClient.from("kids").select("*").eq("parent_id", user.id);
  if (error) {
    response.status(500).json({ error: error.message });
    return;
  }
  response.json(data);
});

app.post("/api/parent/kids", async (request, response) => {
  const user = await requireUser(request, response, ["parent"]);
  if (!user) return;

  const kidSchema = z.object({ name: z.string().min(1) });
  const parsed = kidSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ error: "Invalid payload" });
    return;
  }

  const { data, error } = await dbClient
    .from("kids")
    .insert({ parent_id: user.id, name: parsed.data.name })
    .select()
    .single();

  if (error) {
    response.status(500).json({ error: error.message });
    return;
  }
  response.status(201).json(data);
});

// Classes
app.get("/api/classes", async (request, response) => {
  const { data, error } = await dbClient
    .from("classes")
    .select("*, sessions(*)"); // Simplified relation
  if (error) {
    response.status(500).json({ error: error.message });
    return;
  }

  const { data: allRegistrations, error: regError } = await dbClient.from("class_enrollments").select("class_id");
  if (regError) {
    response.status(500).json({ error: regError.message });
    return;
  }

  const registrationCounts = new Map<string, number>();
  for (const reg of allRegistrations ?? []) {
    registrationCounts.set(reg.class_id, (registrationCounts.get(reg.class_id) ?? 0) + 1);
  }

  const payload = (data ?? []).map((cls: any) => ({
    ...cls,
    registrationCount: registrationCounts.get(cls.id) ?? 0
  }));

  response.json(payload);
});

app.post("/api/admin/classes", async (request, response) => {
  const user = await requireUser(request, response, ["admin"]);
  if (!user) return;

  const classSchema = z.object({
    sessionId: z.string().uuid(),
    instructorId: z.string().uuid().nullable().optional(),
    level: z.string().min(1),
    skillSet: z.string().min(1),
    time: z.string().min(1),
    dayOfWeek: z.string().min(1),
    capacity: z.number().int().min(1)
  });

  const parsed = classSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ error: "Invalid payload", details: parsed.error });
    return;
  }

  const { data, error } = await dbClient
    .from("classes")
    .insert({
      session_id: parsed.data.sessionId,
      instructor_id: parsed.data.instructorId,
      level: parsed.data.level,
      skill_set: parsed.data.skillSet,
      time: parsed.data.time,
      day_of_week: parsed.data.dayOfWeek,
      capacity: parsed.data.capacity
    })
    .select()
    .single();

  if (error) {
    response.status(500).json({ error: error.message });
    return;
  }
  response.status(201).json(data);
});

app.patch("/api/admin/classes/:id/instructor", async (request, response) => {
  const user = await requireUser(request, response, ["admin"]);
  if (!user) return;

  const patchSchema = z.object({ instructorId: z.string().uuid().nullable() });
  const parsed = patchSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ error: "Invalid payload" });
    return;
  }

  const { data, error } = await dbClient
    .from("classes")
    .update({ instructor_id: parsed.data.instructorId })
    .eq("id", request.params.id)
    .select()
    .single();

  if (error) {
    response.status(500).json({ error: error.message });
    return;
  }
  response.json(data);
});

// Enrollments
app.post("/api/parent/enrollments", async (request, response) => {
  const user = await requireUser(request, response, ["parent"]);
  if (!user) return;

  const rollSchema = z.object({
    classId: z.string().uuid(),
    kidId: z.string().uuid()
  });

  const parsed = rollSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ error: "Invalid payload" });
    return;
  }

  // Ensure kid belongs to parent
  const { data: kid, error: kidError } = await dbClient.from("kids").select("id").eq("id", parsed.data.kidId).eq("parent_id", user.id).maybeSingle();
  if (kidError || !kid) {
    response.status(403).json({ error: "Kid not found or access denied" });
    return;
  }

  // Check capacity
  const { data: cls, error: clsError } = await dbClient.from("classes").select("capacity").eq("id", parsed.data.classId).maybeSingle();
  if (clsError || !cls) {
    response.status(404).json({ error: "Class not found" });
    return;
  }

  const { count, error: countError } = await dbClient.from("class_enrollments").select("id", { count: "exact", head: true }).eq("class_id", parsed.data.classId);
  if (countError) {
    response.status(500).json({ error: countError.message });
    return;
  }

  if ((count ?? 0) >= cls.capacity) {
    response.status(409).json({ error: "This class is full." });
    return;
  }

  const { error: insertError } = await dbClient
    .from("class_enrollments")
    .insert({ class_id: parsed.data.classId, kid_id: parsed.data.kidId });

  if (insertError) {
    response.status(500).json({ error: insertError.message });
    return;
  }

  response.status(201).json({ message: "Registration successful." });
});

app.delete("/api/parent/enrollments/:classId/:kidId", async (request, response) => {
  const user = await requireUser(request, response, ["parent"]);
  if (!user) return;

  const { classId, kidId } = request.params;

  // Ensure kid belongs to parent
  const { data: kid, error: kidError } = await dbClient.from("kids").select("id").eq("id", kidId).eq("parent_id", user.id).maybeSingle();
  if (kidError || !kid) {
    response.status(403).json({ error: "Kid not found or access denied" });
    return;
  }

  const { error: deleteError } = await dbClient
    .from("class_enrollments")
    .delete()
    .eq("class_id", classId)
    .eq("kid_id", kidId);

  if (deleteError) {
    response.status(500).json({ error: deleteError.message });
    return;
  }

  response.status(200).json({ message: "Unregistration successful." });
});

app.get("/api/parent/enrollments", async (request, response) => {
  const user = await requireUser(request, response, ["parent"]);
  if (!user) return;

  const { data: kids, error: kidsError } = await dbClient.from("kids").select("id").eq("parent_id", user.id);
  if (kidsError) {
    response.status(500).json({ error: kidsError.message });
    return;
  }

  const kidIds = (kids ?? []).map((k: any) => k.id);
  if (kidIds.length === 0) {
    response.json([]);
    return;
  }

  const { data, error } = await dbClient.from("class_enrollments").select("*").in("kid_id", kidIds);
  if (error) {
    response.status(500).json({ error: error.message });
    return;
  }
  
  response.json(data);
});

export { app };

if (!process.env.VITEST) {
  app.listen(port, () => {
    console.log(`API listening on port ${port}`);
  });
}
