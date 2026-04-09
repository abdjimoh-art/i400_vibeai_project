import { ChangeEvent, FormEvent, useMemo, useState } from "react";

type AuthMode = "signup" | "login";
type UserRole = "admin" | "instructor" | "parent";

type Kid = { id: string; name: string };
type Session = { id: string; name: string; start_date: string; end_date: string };
type IceClass = {
  id: string;
  session_id: string;
  instructor_id: string | null;
  level: string;
  skill_set: string;
  time: string;
  day_of_week: string;
  capacity: number;
  sessions?: Session;
  instructor?: { role: string };
  registrationCount?: string | number;
};
type User = { id: string; role: string; created_at: string };

type AuthResponse = {
  error?: string;
  message?: string;
  accessToken?: string | null;
  role?: UserRole;
  userId?: string;
};

const envApiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "").trim();
const apiBaseUrl = (envApiBaseUrl || "http://localhost:4000").replace(/\/$/, "");

function apiUrl(path: string) {
  return `${apiBaseUrl}${path}`;
}

async function parseApiJson<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return (await response.json()) as T;
  }
  const body = await response.text();
  if (body.trimStart().startsWith("<!DOCTYPE")) {
    throw new Error("Received HTML instead of API JSON.");
  }
  throw new Error(`Unexpected response from API (${response.status}).`);
}

function roleTitle(role: UserRole) {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

export default function App() {
  const [authMode, setAuthMode] = useState<AuthMode>("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);
  const [status, setStatus] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Entities
  const [kids, setKids] = useState<Kid[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [classes, setClasses] = useState<IceClass[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [enrollments, setEnrollments] = useState<{ id: string; class_id: string; kid_id: string }[]>([]);

  // Forms
  const [newKidName, setNewKidName] = useState("");
  const [newSessionName, setNewSessionName] = useState("");
  const [newSessionStart, setNewSessionStart] = useState("");
  const [newSessionEnd, setNewSessionEnd] = useState("");
  
  const [newClassSessionId, setNewClassSessionId] = useState("");
  const [newClassLevel, setNewClassLevel] = useState("");
  const [newClassSkillSet, setNewClassSkillSet] = useState("");
  const [newClassTime, setNewClassTime] = useState("");
  const [newClassDay, setNewClassDay] = useState("");
  const [newClassCapacity, setNewClassCapacity] = useState("10");

  const dashboardTitle = useMemo(() => {
    if (!currentRole) return "Ice Skating School";
    return `${roleTitle(currentRole)} Dashboard`;
  }, [currentRole]);

  async function authFetch(path: string, options: RequestInit = {}) {
    const headers = new Headers(options.headers || {});
    if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
    return fetch(apiUrl(path), { ...options, headers });
  }

  async function loadAdminData() {
    try {
      const [uRes, sRes, cRes] = await Promise.all([
        authFetch("/api/admin/users"),
        authFetch("/api/sessions"),
        authFetch("/api/classes"),
      ]);
      setUsers(await parseApiJson<User[]>(uRes));
      setSessions(await parseApiJson<Session[]>(sRes));
      setClasses(await parseApiJson<IceClass[]>(cRes));
    } catch (e) {
      console.error(e);
      setStatus("Error loading admin data");
    }
  }

  async function loadParentData() {
    try {
      const [kRes, cRes, eRes] = await Promise.all([
        authFetch("/api/parent/kids"),
        authFetch("/api/classes"),
        authFetch("/api/parent/enrollments"),
      ]);
      setKids(await parseApiJson<Kid[]>(kRes));
      setClasses(await parseApiJson<IceClass[]>(cRes));
      setEnrollments(await parseApiJson<any[]>(eRes));
    } catch (e) {
      console.error(e);
      setStatus("Error loading parent data");
    }
  }

  async function loadInstructorData() {
    try {
      const cRes = await authFetch("/api/classes");
      setClasses(await parseApiJson<IceClass[]>(cRes));
    } catch (e) {
      console.error(e);
      setStatus("Error loading instructor data");
    }
  }

  async function loadDashboard(role: UserRole) {
    if (role === "admin") await loadAdminData();
    else if (role === "parent") await loadParentData();
    else if (role === "instructor") await loadInstructorData();
  }

  async function handleAuthSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthLoading(true);
    setStatus("");

    try {
      const endpoint = authMode === "signup" ? "/api/auth/signup" : "/api/auth/login";
      const response = await fetch(apiUrl(endpoint), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await parseApiJson<AuthResponse>(response);

      if (!response.ok) {
        setStatus(data.error ?? "Authentication failed.");
        return;
      }

      if (!data.accessToken) {
        setStatus("Account created. Please login.");
        setAuthMode("login");
        return;
      }

      setAccessToken(data.accessToken);
      setCurrentRole(data.role as UserRole);
      setStatus(data.message ?? "Authenticated.");
    } catch (error) {
      setStatus("Could not reach backend API.");
    } finally {
      setAuthLoading(false);
    }
  }

  // Effect on authentication
  useMemo(() => {
    if (accessToken && currentRole) {
      loadDashboard(currentRole);
    }
  }, [accessToken, currentRole]);

  // Actions
  async function addKid(e: FormEvent) {
    e.preventDefault();
    try {
      const res = await authFetch("/api/parent/kids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKidName })
      });
      if (res.ok) {
        setNewKidName("");
        loadDashboard("parent");
      }
    } catch (e) {
      setStatus("Error adding kid");
    }
  }

  async function addSession(e: FormEvent) {
    e.preventDefault();
    try {
      const res = await authFetch("/api/admin/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newSessionName, startDate: newSessionStart, endDate: newSessionEnd })
      });
      if (res.ok) {
        setNewSessionName(""); setNewSessionStart(""); setNewSessionEnd("");
        loadDashboard("admin");
      }
    } catch(e) {
      setStatus("Error adding session");
    }
  }

  async function addClass(e: FormEvent) {
    e.preventDefault();
    try {
      const res = await authFetch("/api/admin/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: newClassSessionId,
          level: newClassLevel,
          skillSet: newClassSkillSet,
          time: newClassTime,
          dayOfWeek: newClassDay,
          capacity: Number(newClassCapacity)
        })
      });
      if (res.ok) {
        setNewClassSessionId(""); setNewClassLevel(""); setNewClassSkillSet("");
        setNewClassTime(""); setNewClassDay("");
        loadDashboard("admin");
      }
    } catch(e) {
      setStatus("Error adding class");
    }
  }

  async function updateAssignInstructor(classId: string, instructorId: string) {
    await authFetch(`/api/admin/classes/${classId}/instructor`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ instructorId })
    });
    loadDashboard("admin");
  }

  async function updateRole(userId: string, role: string) {
    await authFetch(`/api/admin/users/${userId}/role`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role })
    });
    loadDashboard("admin");
  }

  async function enrollKid(classId: string, kidId: string) {
    await authFetch("/api/parent/enrollments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classId, kidId })
    });
    loadDashboard("parent");
  }

  async function unenrollKid(classId: string, kidId: string) {
    await authFetch(`/api/parent/enrollments/${classId}/${kidId}`, { method: "DELETE" });
    loadDashboard("parent");
  }

  return (
    <main className="page" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <section className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <header>
          <h1>{dashboardTitle}</h1>
          {accessToken && <button onClick={() => { setAccessToken(null); setCurrentRole(null); }}>Log Out</button>}
        </header>

        {status && <div style={{background: 'var(--surface)', padding: '1rem', color: 'red'}}>{status}</div>}

        {!accessToken ? (
          <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="button" onClick={() => setAuthMode('signup')} style={{ flex: 1, background: authMode === 'signup' ? '#ccc' : ''}}>Sign Up</button>
              <button type="button" onClick={() => setAuthMode('login')} style={{ flex: 1, background: authMode === 'login' ? '#ccc' : ''}}>Log In</button>
            </div>
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
            <button type="submit" disabled={authLoading}>{authLoading ? 'Loading...' : authMode === 'signup' ? 'Sign Up' : 'Log In'}</button>
          </form>
        ) : (
          <div>
            {currentRole === 'parent' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div>
                  <h2>My Kids</h2>
                  <ul>
                    {kids.map(kid => <li key={kid.id}>{kid.name}</li>)}
                  </ul>
                  <form onSubmit={addKid} style={{display: 'flex', gap: '0.5rem', marginTop: '1rem'}}>
                    <input type="text" placeholder="Kid Name" value={newKidName} onChange={e => setNewKidName(e.target.value)} required />
                    <button type="submit">Add Kid</button>
                  </form>
                </div>
                
                <div>
                  <h2>Available Classes</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {classes.map(cls => (
                      <div key={cls.id} style={{ border: '1px solid #ccc', padding: '1rem' }}>
                        <h3>{cls.level} - {cls.day_of_week} at {cls.time}</h3>
                        <p>Skills: {cls.skill_set}</p>
                        <p>Capacity: {cls.registrationCount} / {cls.capacity}</p>
                        <hr style={{ margin: '1rem 0' }}/>
                        <p>Enroll a kid:</p>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {kids.map(kid => {
                            const isEnrolled = enrollments.some(e => e.class_id === cls.id && e.kid_id === kid.id);
                            return (
                              <button key={kid.id} onClick={() => isEnrolled ? unenrollKid(cls.id, kid.id) : enrollKid(cls.id, kid.id)}>
                                {kid.name} ({isEnrolled ? "Unenroll" : "Enroll"})
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentRole === 'admin' && (
               <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                 <div>
                   <h2>Manage Users</h2>
                   <ul>
                     {users.map(u => (
                       <li key={u.id} style={{ marginBottom: '0.5rem'}}>
                         ID: {u.id.substring(0,8)}... | Current Role: {u.role}
                         <select value={u.role} onChange={e => updateRole(u.id, e.target.value)} style={{marginLeft: '1rem'}}>
                           <option value="parent">Parent</option>
                           <option value="instructor">Instructor</option>
                           <option value="admin">Admin</option>
                         </select>
                       </li>
                     ))}
                   </ul>
                 </div>

                 <div>
                   <h2>Sessions</h2>
                   <ul>{sessions.map(s => <li key={s.id}>{s.name} ({s.start_date} - {s.end_date})</li>)}</ul>
                   <form onSubmit={addSession} style={{display: 'flex', gap: '0.5rem', marginTop: '1rem'}}>
                     <input type="text" placeholder="Session Name" value={newSessionName} onChange={e => setNewSessionName(e.target.value)} required />
                     <input type="date" value={newSessionStart} onChange={e => setNewSessionStart(e.target.value)} required />
                     <input type="date" value={newSessionEnd} onChange={e => setNewSessionEnd(e.target.value)} required />
                     <button type="submit">Create Session</button>
                   </form>
                 </div>

                 <div>
                   <h2>Classes</h2>
                   <ul>
                     {classes.map(c => (
                       <li key={c.id} style={{ marginBottom: '1rem' }}>
                         {c.level} - {c.day_of_week} at {c.time}
                         <div style={{ marginTop: '0.5rem' }}>
                           Assign Instructor: 
                           <select value={c.instructor_id || ""} onChange={e => updateAssignInstructor(c.id, e.target.value)}>
                             <option value="">None</option>
                             {users.filter(u => u.role === 'instructor').map(u => <option key={u.id} value={u.id}>{u.id.substring(0,8)}</option>)}
                           </select>
                         </div>
                       </li>
                     ))}
                   </ul>
                   <form onSubmit={addClass} style={{display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem', maxWidth: '300px'}}>
                     <select value={newClassSessionId} onChange={e => setNewClassSessionId(e.target.value)} required>
                       <option value="">Select Session...</option>
                       {sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                     </select>
                     <input type="text" placeholder="Level" value={newClassLevel} onChange={e => setNewClassLevel(e.target.value)} required />
                     <input type="text" placeholder="Skill Set" value={newClassSkillSet} onChange={e => setNewClassSkillSet(e.target.value)} required />
                     <input type="text" placeholder="Day of Week" value={newClassDay} onChange={e => setNewClassDay(e.target.value)} required />
                     <input type="text" placeholder="Time" value={newClassTime} onChange={e => setNewClassTime(e.target.value)} required />
                     <input type="number" placeholder="Capacity" value={newClassCapacity} onChange={e => setNewClassCapacity(e.target.value)} required />
                     <button type="submit">Create Class</button>
                   </form>
                 </div>
               </div>
            )}

            {currentRole === 'instructor' && (
              <div>
                <h2>My Classes to Teach</h2>
                <p>Welcome Instructor. Here are your assigned classes:</p>
                <ul>
                  {classes.map(c => <li key={c.id}>{c.level} - {c.day_of_week} at {c.time} (Skills: {c.skill_set})</li>)}
                </ul>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
