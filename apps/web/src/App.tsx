import { FormEvent, useMemo, useState } from "react";

type AuthMode = "signup" | "login";
type UserRole = "admin" | "instructor" | "parent";
type Level = { id: string; name: string; order_index: number };

type Kid = { id: string; name: string };
type Session = { id: string; name: string; start_date: string; end_date: string };
type IceClass = {
  id: string;
  session_id: string;
  instructor_id: string | null;
  level: string;
  level_id?: string;
  level_name?: string;
  skill_set: string;
  time: string;
  day_of_week: string;
  capacity: number;
  sessions?: Session;
  instructor?: { role: string };
  registrationCount?: string | number;
};
type User = { id: string; role: string; created_at: string };
type AttendanceRecord = { kid_id: string; present: boolean };
type Skill = { id: string; level: string; name: string; passing_standard: string; order_index: number };
type SkillCompletion = { kid_id: string; skill_id: string; completed_date: string };
type EnrolledKid = { id: string; name: string };

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
  const [levels, setLevels] = useState<Level[]>([]);
  const [newClassLevelId, setNewClassLevelId] = useState("");

  // Instructor-specific state
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [attendanceDate, setAttendanceDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [enrolledKids, setEnrolledKids] = useState<EnrolledKid[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [skillCompletions, setSkillCompletions] = useState<SkillCompletion[]>([]);
  const [classDataLoading, setClassDataLoading] = useState(false);

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
      const [uRes, sRes, cRes, lRes] = await Promise.all([
        authFetch("/api/admin/users"),
        authFetch("/api/sessions"),
        authFetch("/api/classes"),
        authFetch("/api/levels"),
      ]);
      setUsers(await parseApiJson<User[]>(uRes));
      setSessions(await parseApiJson<Session[]>(sRes));
      setClasses(await parseApiJson<IceClass[]>(cRes));
      setLevels(await parseApiJson<Level[]>(lRes));
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
      const cRes = await authFetch("/api/instructor/classes");
      const myClasses = await parseApiJson<IceClass[]>(cRes);
      setClasses(myClasses);
      if (myClasses.length > 0 && !selectedClassId) {
        setSelectedClassId(myClasses[0].id);
      }
    } catch (e) {
      console.error(e);
      setStatus("Error loading instructor data");
    }
  }

  async function loadClassData(classId: string, date: string) {
    if (!classId) return;
    setClassDataLoading(true);
    try {
      const cls = classes.find(c => c.id === classId);
      const [eRes, aRes] = await Promise.all([
        authFetch(`/api/instructor/classes/${classId}/enrollments`),
        authFetch(`/api/instructor/attendance?classId=${classId}&date=${date}`),
      ]);
      const enrollmentData = await parseApiJson<any[]>(eRes);
      const attendanceData = await parseApiJson<any[]>(aRes);

      setEnrolledKids(enrollmentData.map((e: any) => ({ id: e.kids.id, name: e.kids.name })));
      setAttendance(attendanceData.map((a: any) => ({ kid_id: a.kid_id, present: a.present })));

      if (cls) {
        const levelParam = cls.level_id ? `levelId=${cls.level_id}` : `levelId=`;
        const [sRes, scRes] = await Promise.all([
          authFetch(`/api/skills?${levelParam}`),
          authFetch(`/api/instructor/skill-completions/${classId}`),
        ]);
        setSkills(await parseApiJson<Skill[]>(sRes));
        const scData = await parseApiJson<any[]>(scRes);
        setSkillCompletions(scData.map((sc: any) => ({ kid_id: sc.kid_id, skill_id: sc.skill_id, completed_date: sc.completed_date })));
      }
    } catch (e) {
      console.error(e);
      setStatus("Error loading class data");
    } finally {
      setClassDataLoading(false);
    }
  }

  async function toggleAttendance(kidId: string) {
    const current = attendance.find(a => a.kid_id === kidId);
    const newPresent = !(current?.present ?? false);
    // Optimistic update
    setAttendance(prev => {
      const exists = prev.find(a => a.kid_id === kidId);
      if (exists) return prev.map(a => a.kid_id === kidId ? { ...a, present: newPresent } : a);
      return [...prev, { kid_id: kidId, present: newPresent }];
    });
    try {
      await authFetch("/api/instructor/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId: selectedClassId, kidId, date: attendanceDate, present: newPresent })
      });
    } catch (e) {
      console.error(e);
      setStatus("Error saving attendance");
    }
  }

  async function toggleSkillCompletion(kidId: string, skillId: string) {
    const isCompleted = skillCompletions.some(sc => sc.kid_id === kidId && sc.skill_id === skillId);
    // Optimistic update
    if (isCompleted) {
      setSkillCompletions(prev => prev.filter(sc => !(sc.kid_id === kidId && sc.skill_id === skillId)));
    } else {
      setSkillCompletions(prev => [...prev, { kid_id: kidId, skill_id: skillId, completed_date: attendanceDate }]);
    }
    try {
      await authFetch("/api/instructor/skill-completions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kidId, skillId, completed: !isCompleted, date: attendanceDate })
      });
    } catch (e) {
      console.error(e);
      setStatus("Error saving skill completion");
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

  // Load class-specific data when selection or date changes (instructor only)
  useMemo(() => {
    if (currentRole === "instructor" && selectedClassId) {
      loadClassData(selectedClassId, attendanceDate);
    }
  }, [selectedClassId, attendanceDate]);

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
          levelId: newClassLevelId,
          time: newClassTime,
          dayOfWeek: newClassDay,
          capacity: Number(newClassCapacity)
        })
      });
      if (res.ok) {
        setNewClassSessionId(""); setNewClassLevelId(""); setNewClassSkillSet("");
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
                     <select value={newClassLevelId} onChange={e => setNewClassLevelId(e.target.value)} required>
                       <option value="">Select Level...</option>
                       {levels.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                     </select>
                     <input type="text" placeholder="Day of Week" value={newClassDay} onChange={e => setNewClassDay(e.target.value)} required />
                     <input type="text" placeholder="Time" value={newClassTime} onChange={e => setNewClassTime(e.target.value)} required />
                     <input type="number" placeholder="Capacity" value={newClassCapacity} onChange={e => setNewClassCapacity(e.target.value)} required />
                     <button type="submit">Create Class</button>
                   </form>
                 </div>
               </div>
            )}

            {currentRole === 'instructor' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {/* Class + Date selectors */}
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted)' }}>Class</label>
                    <select
                      value={selectedClassId}
                      onChange={e => setSelectedClassId(e.target.value)}
                      style={{ padding: '0.5rem 0.75rem', border: '1px solid #ccc', borderRadius: '0.5rem', background: 'var(--surface)', minWidth: '200px' }}
                    >
                      <option value="">Select a class…</option>
                      {classes.map(c => (
                        <option key={c.id} value={c.id}>{c.level} — {c.day_of_week} at {c.time}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted)' }}>Session Date</label>
                    <input
                      type="date"
                      value={attendanceDate}
                      onChange={e => setAttendanceDate(e.target.value)}
                      style={{ padding: '0.5rem 0.75rem', border: '1px solid #ccc', borderRadius: '0.5rem', background: 'var(--surface)' }}
                    />
                  </div>
                  {classes.length === 0 && (
                    <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>No classes assigned to you yet.</p>
                  )}
                </div>

                {selectedClassId && (
                  <>
                    {/* Attendance Grid */}
                    <div>
                      <h2 style={{ marginBottom: '0.75rem' }}>Attendance</h2>
                      {classDataLoading ? (
                        <p style={{ color: 'var(--muted)' }}>Loading…</p>
                      ) : enrolledKids.length === 0 ? (
                        <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>No skaters enrolled in this class.</p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {enrolledKids.map(kid => {
                            const record = attendance.find(a => a.kid_id === kid.id);
                            const present = record?.present ?? false;
                            return (
                              <div key={kid.id} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '0.75rem 1rem', border: '1px solid #e5e7eb', borderRadius: '0.75rem',
                                background: present ? '#f0fdf4' : 'var(--surface)',
                                transition: 'background 0.2s'
                              }}>
                                <span style={{ fontWeight: 500 }}>{kid.name}</span>
                                <button
                                  onClick={() => toggleAttendance(kid.id)}
                                  style={{
                                    padding: '0.4rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer',
                                    fontWeight: 600, fontSize: '0.85rem',
                                    background: present ? '#16a34a' : '#e5e7eb',
                                    color: present ? '#fff' : '#374151',
                                    transition: 'background 0.2s, color 0.2s'
                                  }}
                                >
                                  {present ? '✓ Present' : 'Absent'}
                                </button>
                              </div>
                            );
                          })}
                          <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.25rem' }}>
                            {attendance.filter(a => a.present).length} / {enrolledKids.length} present
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Skill Check-offs */}
                    <div>
                      <h2 style={{ marginBottom: '0.75rem' }}>Skill Check-offs</h2>
                      {classDataLoading ? (
                        <p style={{ color: 'var(--muted)' }}>Loading…</p>
                      ) : skills.length === 0 ? (
                        <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>No skills defined for this level yet. An admin can add them via the database.</p>
                      ) : enrolledKids.length === 0 ? (
                        <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>No skaters enrolled.</p>
                      ) : (
                        <div style={{ overflowX: 'auto' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                            <thead>
                              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e5e7eb' }}>
                                <th style={{ textAlign: 'left', padding: '0.6rem 0.75rem', fontWeight: 600, whiteSpace: 'nowrap' }}>Skill</th>
                                {enrolledKids.map(kid => (
                                  <th key={kid.id} style={{ textAlign: 'center', padding: '0.6rem 0.5rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                                    {kid.name}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {skills.map((skill, i) => (
                                <tr key={skill.id} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                                  <td style={{ padding: '0.6rem 0.75rem', color: '#374151' }}>
                                    <div style={{ fontWeight: 500 }}>{skill.name}</div>
                                    {skill.passing_standard && (
                                      <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{skill.passing_standard}</div>
                                    )}
                                  </td>
                                  {enrolledKids.map(kid => {
                                    const completed = skillCompletions.some(sc => sc.kid_id === kid.id && sc.skill_id === skill.id);
                                    return (
                                      <td key={kid.id} style={{ textAlign: 'center', padding: '0.6rem 0.5rem' }}>
                                        <button
                                          onClick={() => toggleSkillCompletion(kid.id, skill.id)}
                                          title={completed ? 'Mark incomplete' : 'Mark complete'}
                                          style={{
                                            width: '2rem', height: '2rem', borderRadius: '50%', border: 'none', cursor: 'pointer',
                                            background: completed ? '#16a34a' : '#e5e7eb',
                                            color: completed ? '#fff' : '#9ca3af',
                                            fontWeight: 700, fontSize: '1rem',
                                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                            transition: 'background 0.2s, color 0.2s'
                                          }}
                                        >
                                          {completed ? '✓' : '—'}
                                        </button>
                                      </td>
                                    );
                                  })}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
