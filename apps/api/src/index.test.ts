/**
 * API Unit Tests — apps/api/src/index.test.ts
 *
 * Strategy: Vitest + Supertest.
 * Both Supabase clients and Groq SDK are mocked with vi.mock() so no real
 * network calls are made and no .env is required at runtime.
 *
 * Setting VITEST=true in the environment prevents index.ts from calling
 * app.listen(), so Supertest can import the Express app cleanly.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";

// ── 1. Stub env vars BEFORE any module import ─────────────────────────────────
vi.stubEnv("SUPABASE_URL", "https://fake.supabase.co");
vi.stubEnv("SUPABASE_PUBLISHABLE_KEY", "fake-publishable-key");
vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "fake-service-role-key");
vi.stubEnv("GROQ_API_KEY", "fake-groq-key");
vi.stubEnv("VITEST", "true");

// ── 2. Mock Supabase and Groq BEFORE importing the app ───────────────────────
const mockGetUser = vi.fn();
const mockAuthSignUp = vi.fn();
const mockAuthSignIn = vi.fn();

// dbClient.from() mock — each queued return value handles one .from() call
const mockDbFrom = vi.fn();

// A "null-safe" chainable that always resolves to null so tests don't hang
const nullChain = () => {
  const q: Record<string, unknown> = {};
  const self = () => Promise.resolve({ data: null, error: null });
  q.select = vi.fn(() => q);
  q.insert = vi.fn(() => q);
  q.upsert = vi.fn(() => q);
  q.eq = vi.fn(() => q);
  q.order = vi.fn(() => q);
  q.maybeSingle = vi.fn(self);
  q.single = vi.fn(self);
  return q;
};

// Default implementation so unqueued calls never hang
mockDbFrom.mockImplementation(nullChain);

let createClientCallCount = 0;

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => {
    createClientCallCount++;
    // First call → authClient (uses publishable key), second → dbClient
    if (createClientCallCount === 1) {
      return {
        auth: {
          getUser: mockGetUser,
          signUp: mockAuthSignUp,
          signInWithPassword: mockAuthSignIn,
        },
        from: vi.fn(nullChain), // authClient.from is unused in our routes
      };
    }
    // Second call → dbClient
    return { from: mockDbFrom };
  }),
}));

const mockGroqCreate = vi.fn().mockResolvedValue({
  choices: [{ message: { content: "Mock Groq answer" } }],
});

vi.mock("groq-sdk", () => {
  class MockGroq {
    chat = { completions: { create: mockGroqCreate } };
    constructor(_options?: unknown) { }
  }
  return { default: MockGroq };
});

// ── 3. Import app AFTER mocks are registered ──────────────────────────────────
const { app } = await import("./index.js");

const ADMIN_TOKEN = "Bearer valid-admin-token";
const MEMBER_TOKEN = "Bearer valid-member-token";
const FAKE_UUID = "00000000-0000-0000-0000-000000000001";
const ADMIN_UUID = "11111111-1111-1111-1111-111111111111";
const MEMBER_UUID = "22222222-2222-2222-2222-222222222222";

/** Make auth return a valid admin session + role lookup. */
function mockAsAdmin() {
  mockGetUser.mockResolvedValueOnce({ data: { user: { id: ADMIN_UUID } }, error: null });
  mockDbFrom.mockReturnValueOnce({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data: { role: "admin" }, error: null }),
  });
}

/** Make auth return a valid member session + role lookup. */
function mockAsMember() {
  mockGetUser.mockResolvedValueOnce({ data: { user: { id: MEMBER_UUID } }, error: null });
  mockDbFrom.mockReturnValueOnce({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data: { role: "member" }, error: null }),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  // Restore the fallback so unqueued mockDbFrom calls resolve (not hang)
  mockDbFrom.mockImplementation(nullChain);
  mockGroqCreate.mockResolvedValue({
    choices: [{ message: { content: "Mock Groq answer" } }],
  });
});

// ── 5. Tests ──────────────────────────────────────────────────────────────────

describe("GET /health", () => {
  /**
   * Test 1 — GET /health → 200
   * Health-check always responds { status: "ok" }; no auth needed.
   * Verified by hitting the route with Supertest and asserting body + status.
   */
  it("returns 200 { status: 'ok' }", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});

describe("POST /api/auth/signup", () => {
  /**
   * Test 2 — bad email → 400
   * Zod rejects email fields that are not valid email addresses before
   * the request ever reaches Supabase.
   */
  it("returns 400 when email is invalid", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({ email: "notanemail", password: "longenough" });
    expect(res.status).toBe(400);
  });

  /**
   * Test 3 — short password → 400
   * Zod enforces a minimum password length of 8 characters.
   */
  it("returns 400 when password is too short", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({ email: "test@example.com", password: "short" });
    expect(res.status).toBe(400);
  });
});

describe("POST /api/auth/login", () => {
  /**
   * Test 4 — bad payload → 400
   * An empty body (missing email + password) is rejected by Zod validation
   * before Supabase is contacted.
   */
  it("returns 400 when payload is empty", async () => {
    const res = await request(app).post("/api/auth/login").send({});
    expect(res.status).toBe(400);
  });
});

describe("GET /api/auth/me", () => {
  /**
   * Test 5 — no token → 401
   * Protected routes must reject requests that carry no Authorization header.
   */
  it("returns 401 when no token is provided", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  /**
   * Test 6 — invalid token → 401
   * When Supabase getUser() returns an error (expired / forged JWT),
   * the route responds with 401.
   */
  it("returns 401 when token is invalid", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: new Error("bad token") });
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer bad-token");
    expect(res.status).toBe(401);
  });
});

describe("GET /api/admin/classes", () => {
  /**
   * Test 7 — no token → 401
   * Admin-only routes must refuse unauthenticated callers before querying the DB.
   */
  it("returns 401 when no token is provided", async () => {
    const res = await request(app).get("/api/admin/classes");
    expect(res.status).toBe(401);
  });

  /**
   * Test 8 — member token → 403
   * A valid JWT with role='member' must be refused on admin-only endpoints.
   */
  it("returns 403 when caller is a member", async () => {
    mockAsMember();
    const res = await request(app)
      .get("/api/admin/classes")
      .set("Authorization", MEMBER_TOKEN);
    expect(res.status).toBe(403);
  });
});

describe("POST /api/admin/classes", () => {
  /**
   * Test 9 — missing fields → 400
   * Zod validates all required class fields. An empty body must return 400
   * with a details field describing which fields failed.
   */
  it("returns 400 when required fields are missing", async () => {
    mockAsAdmin();
    const res = await request(app)
      .post("/api/admin/classes")
      .set("Authorization", ADMIN_TOKEN)
      .send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("details");
  });

  /**
   * Test 10 — happy path → 201
   * A valid admin request with all required fields inserts the class and
   * returns the newly created record with status 201.
   */
  it("returns 201 with the created class on success", async () => {
    mockAsAdmin();
    const fakeClass = {
      id: FAKE_UUID,
      title: "Yoga for Beginners",
      description: "A relaxing introductory yoga class for all skill levels.",
      instructor_name: "Jane Doe",
      location: "Room 101",
      starts_at: "2026-06-01T10:00:00.000Z",
      capacity: 20,
      created_at: "2026-01-01T00:00:00.000Z",
      created_by: ADMIN_UUID,
    };
    mockDbFrom.mockReturnValueOnce({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: fakeClass, error: null }),
    });

    const res = await request(app)
      .post("/api/admin/classes")
      .set("Authorization", ADMIN_TOKEN)
      .send({
        title: "Yoga for Beginners",
        description: "A relaxing introductory yoga class for all skill levels.",
        instructorName: "Jane Doe",
        location: "Room 101",
        startsAt: "2026-06-01T10:00:00.000Z",
        capacity: 20,
      });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ title: "Yoga for Beginners" });
  });
});

describe("GET /api/member/classes", () => {
  /**
   * Test 11 — no token → 401
   * Member-only routes must reject callers without a token.
   */
  it("returns 401 when no token is provided", async () => {
    const res = await request(app).get("/api/member/classes");
    expect(res.status).toBe(401);
  });

  /**
   * Test 12 — admin token → 403
   * An admin JWT must be refused on member-only routes (roles are distinct).
   */
  it("returns 403 when caller is an admin", async () => {
    mockAsAdmin();
    const res = await request(app)
      .get("/api/member/classes")
      .set("Authorization", ADMIN_TOKEN);
    expect(res.status).toBe(403);
  });
});

describe("POST /api/member/registrations", () => {
  /**
   * Test 13 — bad UUID → 400
   * classId must be a valid UUID format; Zod rejects anything else
   * before a DB look-up is attempted.
   */
  it("returns 400 when classId is not a valid UUID", async () => {
    mockAsMember();
    const res = await request(app)
      .post("/api/member/registrations")
      .set("Authorization", MEMBER_TOKEN)
      .send({ classId: "not-a-uuid" });
    expect(res.status).toBe(400);
  });

  /**
   * Test 14 — class not found → 404
   * When the DB returns null for the classId, the endpoint responds 404
   * without attempting to insert a registration.
   */
  it("returns 404 when the class does not exist", async () => {
    mockAsMember();
    mockDbFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    });

    const res = await request(app)
      .post("/api/member/registrations")
      .set("Authorization", MEMBER_TOKEN)
      .send({ classId: FAKE_UUID });
    expect(res.status).toBe(404);
  });

  /**
   * Test 15 — already registered → 409
   * If the member already has a registration for this class, the endpoint
   * returns 409 with an "already registered" message.
   */
  it("returns 409 when the member is already registered", async () => {
    mockAsMember();
    // Class exists
    mockDbFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: { id: FAKE_UUID, capacity: 10 }, error: null }),
    });
    // Existing registration found
    mockDbFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: { id: "reg-id" }, error: null }),
    });

    const res = await request(app)
      .post("/api/member/registrations")
      .set("Authorization", MEMBER_TOKEN)
      .send({ classId: FAKE_UUID });
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/already registered/i);
  });

  /**
   * Test 16 — class full → 409
   * When registration count reaches capacity the endpoint returns 409
   * with a "full" message instead of inserting a new row.
   */
  it("returns 409 when the class is at capacity", async () => {
    mockAsMember();
    // Class with capacity 1
    mockDbFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: { id: FAKE_UUID, capacity: 1 }, error: null }),
    });
    // No existing registration for this member
    mockDbFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    });
    // Count query returns 1 (equals capacity)
    mockDbFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ count: 1, error: null }),
    });

    const res = await request(app)
      .post("/api/member/registrations")
      .set("Authorization", MEMBER_TOKEN)
      .send({ classId: FAKE_UUID });
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/full/i);
  });
});

describe("POST /api/ai/ask", () => {
  /**
   * Test 17 — no token → 401
   * AI endpoints are login-gated; unauthenticated callers receive 401.
   */
  it("returns 401 when no token is provided", async () => {
    const res = await request(app).post("/api/ai/ask").send({ question: "Hello?" });
    expect(res.status).toBe(401);
  });

  /**
   * Test 18 — empty question → 400
   * Zod requires question to be 1–500 characters; an empty string is rejected.
   */
  it("returns 400 when question is empty", async () => {
    mockAsAdmin();
    const res = await request(app)
      .post("/api/ai/ask")
      .set("Authorization", ADMIN_TOKEN)
      .send({ question: "" });
    expect(res.status).toBe(400);
  });

  /**
   * Test 19 — happy path → 200
   * A valid authenticated request with a non-empty question calls Groq
   * and returns { answer } with status 200.
   */
  it("returns 200 with an answer on success", async () => {
    mockAsAdmin();
    const res = await request(app)
      .post("/api/ai/ask")
      .set("Authorization", ADMIN_TOKEN)
      .send({ question: "What is 2+2?" });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("answer", "Mock Groq answer");
  });
});

describe("POST /api/ai/chat", () => {
  /**
   * Test 20 — no token → 401
   * The RAG endpoint also requires a valid session; anonymous callers get 401.
   */
  it("returns 401 when no token is provided", async () => {
    const res = await request(app).post("/api/ai/chat").send({ userDescription: "I like yoga." });
    expect(res.status).toBe(401);
  });

  /**
   * Test 21 — empty description → 400
   * userDescription must be ≥ 1 character; Zod rejects an empty string.
   */
  it("returns 400 when userDescription is empty", async () => {
    mockAsMember();
    const res = await request(app)
      .post("/api/ai/chat")
      .set("Authorization", MEMBER_TOKEN)
      .send({ userDescription: "" });
    expect(res.status).toBe(400);
  });

  /**
   * Test 22 — happy path → 200
   * Valid input fetches available classes from the DB, builds a RAG prompt,
   * calls Groq, and returns { answer } with status 200.
   */
  it("returns 200 with workshop suggestions on success", async () => {
    mockAsMember();
    // DB returns empty classes list (valid — RAG works with 0 workshops too)
    mockDbFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    });

    const res = await request(app)
      .post("/api/ai/chat")
      .set("Authorization", MEMBER_TOKEN)
      .send({ userDescription: "I enjoy watercolour painting and quiet activities." });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("answer", "Mock Groq answer");
  });
});
