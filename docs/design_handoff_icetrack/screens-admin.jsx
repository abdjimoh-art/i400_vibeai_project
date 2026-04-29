// Admin dashboard — 2 variations.
// V1: Class management CRUD table-first.
// V2: KPI overview + drill-in (richer landing).

function AdminDashV1() {
  return (
    <WFBrowser url="icetrack.app/admin">
      <div style={{ height: '100%', display: 'grid', gridTemplateColumns: '210px 1fr', background: WF.paper }}>
        <div style={{ padding: 16, borderRight: `1.5px solid ${WF.ink}`, background: '#fff' }}>
          <WFLogo size={16} />
          <span className="wf-pill wf-pill-accent" style={{ fontSize: 10, marginTop: 6, display: 'inline-flex' }}>ADMIN</span>
          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <WFNavItem icon="⌂" label="Overview" />
            <WFNavItem icon="📚" label="Classes" active />
            <WFNavItem icon="🧑" label="Skaters" />
            <WFNavItem icon="🏒" label="Instructors" />
            <WFNavItem icon="★" label="Levels & Skills" />
            <WFNavItem icon="🎭" label="Skating Show" />
            <WFNavItem icon="📊" label="Reports" />
          </div>
        </div>

        <div style={{ padding: 22, overflow: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
            <div>
              <div className="wf-h1" style={{ fontSize: 28 }}>Class management</div>
              <div style={{ fontSize: 12, color: WF.muted }}>Spring 2026 · 18 classes</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="wf-btn">Import CSV</button>
              <button className="wf-btn wf-btn-primary">+ New class</button>
            </div>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <div className="wf-input" style={{ width: 200, color: WF.pencil, fontSize: 12 }}>🔍 Search class…</div>
            <span className="wf-pill" style={{ background: '#fff' }}>Day ▾</span>
            <span className="wf-pill" style={{ background: '#fff' }}>Level ▾</span>
            <span className="wf-pill" style={{ background: '#fff' }}>Instructor ▾</span>
            <span className="wf-pill wf-pill-accent">Spring 2026</span>
          </div>

          <div className="wf-box" style={{ background: '#fff', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '110px 110px 1fr 1fr 80px 90px 110px', padding: '10px 14px', background: WF.paper, borderBottom: `1.5px solid ${WF.ink}`, fontFamily: WF.mono, fontSize: 10, color: WF.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              <span>Day</span><span>Time</span><span>Level</span><span>Instructor</span><span>Zone</span><span>Roster</span><span></span>
            </div>
            {[
              { d: 'Mon', t: '4:30 PM', l: 'Level 1', i: 'Coach Ben', z: 'A', r: '5/6' },
              { d: 'Tue', t: '4:30 PM', l: 'Level 2', i: 'Coach Maya', z: 'A', r: '6/8' },
              { d: 'Tue', t: '5:30 PM', l: 'Level 3', i: 'Coach Maya', z: 'A', r: '5/8' },
              { d: 'Wed', t: '4:30 PM', l: 'Tot 2', i: 'Coach Sam', z: 'B', r: '4/5' },
              { d: 'Thu', t: '6:00 PM', l: 'Level 4', i: 'Coach Ben', z: 'A', r: '4/8' },
              { d: 'Sat', t: '9:00 AM', l: 'Tot 3', i: 'Coach Ben', z: 'B', r: '5/6' },
              { d: 'Sat', t: '10:00 AM', l: 'Level 1', i: 'Coach Maya', z: 'A', r: '4/6' },
            ].map((r, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '110px 110px 1fr 1fr 80px 90px 110px', padding: '10px 14px', alignItems: 'center', fontSize: 12, borderBottom: i < 6 ? `1px dashed ${WF.pencil}` : 'none' }}>
                <span style={{ fontWeight: 700 }}>{r.d}</span>
                <span className="wf-mono">{r.t}</span>
                <span><span className="wf-pill" style={{ background: '#fff', fontSize: 11 }}>{r.l}</span></span>
                <span>{r.i}</span>
                <span className="wf-hand">Zone {r.z}</span>
                <span className="wf-mono" style={{ color: r.r.split('/')[0] === r.r.split('/')[1] ? 'var(--wf-accent)' : WF.ink }}>{r.r}</span>
                <span style={{ display: 'flex', gap: 4 }}>
                  <button className="wf-btn" style={{ padding: '3px 8px', fontSize: 10 }}>Edit</button>
                  <button className="wf-btn wf-btn-ghost" style={{ padding: '3px 8px', fontSize: 10 }}>•••</button>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ position: 'absolute', top: 80, right: 40 }}>
        <WFCallout rotate={3}>CRUD-first ↗ admin's main job</WFCallout>
      </div>
    </WFBrowser>
  );
}

function AdminDashV2() {
  return (
    <WFBrowser url="icetrack.app/admin">
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: WF.paper }}>
        <div style={{ padding: '12px 24px', borderBottom: `1.5px solid ${WF.ink}`, background: '#fff', display: 'flex', alignItems: 'center', gap: 18 }}>
          <WFLogo size={16} />
          <span className="wf-pill wf-pill-accent" style={{ fontSize: 10 }}>ADMIN</span>
          <div style={{ marginLeft: 20, display: 'flex', gap: 4 }}>
            {['Overview', 'Classes', 'Skaters', 'Instructors', 'Show', 'Reports'].map((l, i) => (
              <span key={l} className="wf-hand" style={{ padding: '4px 10px', fontSize: 13, borderBottom: i === 0 ? `2px solid var(--wf-accent)` : 'none', color: i === 0 ? 'var(--wf-accent)' : WF.inkSoft, fontWeight: i === 0 ? 700 : 400 }}>{l}</span>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, padding: 22, overflow: 'auto' }}>
          <div className="wf-h1" style={{ fontSize: 28, marginBottom: 4 }}>Spring 2026 · at a glance</div>
          <div style={{ fontSize: 12, color: WF.muted, marginBottom: 18 }}>Week 8 of 12 · Apr 27 – May 3</div>

          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 18 }}>
            {[
              { n: '18', l: 'Active classes', sub: '+2 vs Fall' },
              { n: '94', l: 'Skaters enrolled', sub: '6 waitlisted' },
              { n: '7', l: 'Instructors', sub: 'all active' },
              { n: '89%', l: 'Avg attendance', sub: '↑ 4 pts' },
            ].map((s, i) => (
              <div key={i} className="wf-box" style={{ padding: 14, background: '#fff' }}>
                <div className="wf-mono" style={{ fontSize: 10, color: WF.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.l}</div>
                <div className="wf-h1" style={{ fontSize: 32, color: i === 3 ? WF.green : 'var(--wf-accent)', marginTop: 4 }}>{s.n}</div>
                <div className="wf-hand" style={{ fontSize: 11, color: WF.muted }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Two-column body */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14 }}>
            {/* Enrollment by level */}
            <div className="wf-box" style={{ padding: 14, background: '#fff' }}>
              <div className="wf-h2" style={{ fontSize: 16, marginBottom: 10 }}>Enrollment by level</div>
              {[
                { l: 'Parent Tot', e: 8, cap: 10 },
                { l: 'Tot 2', e: 7, cap: 10 },
                { l: 'Tot 3', e: 9, cap: 10 },
                { l: 'Level 1', e: 12, cap: 12 },
                { l: 'Level 2', e: 14, cap: 16 },
                { l: 'Level 3', e: 11, cap: 16 },
                { l: 'Level 4', e: 8, cap: 12 },
                { l: 'Level 5', e: 5, cap: 8 },
              ].map((r, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '90px 1fr 60px', alignItems: 'center', gap: 10, padding: '5px 0' }}>
                  <span style={{ fontSize: 12, fontFamily: WF.hand }}>{r.l}</span>
                  <div style={{ height: 14, border: `1.5px solid ${WF.ink}`, borderRadius: 4, position: 'relative', background: '#fff' }}>
                    <div style={{ width: `${r.e / r.cap * 100}%`, height: '100%', background: r.e === r.cap ? 'var(--wf-accent)' : WF.ice }} />
                  </div>
                  <span className="wf-mono" style={{ fontSize: 11, textAlign: 'right' }}>{r.e}/{r.cap}</span>
                </div>
              ))}
            </div>

            {/* Activity + show */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="wf-box" style={{ padding: 14, background: '#fff' }}>
                <div className="wf-h2" style={{ fontSize: 14, marginBottom: 8 }}>Recent activity</div>
                {[
                  { who: 'Coach Maya', what: 'logged 6 attendance · Level 2', when: '2h' },
                  { who: 'Sarah Mitchell', what: 'enrolled Leo in Sat Tot 3', when: '5h' },
                  { who: 'Coach Ben', what: 'passed Liam on 3 skills', when: '1d' },
                ].map((a, i) => (
                  <div key={i} style={{ padding: '6px 0', fontSize: 12, borderBottom: i < 2 ? `1px dashed ${WF.pencil}` : 'none' }}>
                    <div><span style={{ fontWeight: 700 }}>{a.who}</span> {a.what}</div>
                    <div className="wf-mono" style={{ fontSize: 10, color: WF.muted }}>{a.when} ago</div>
                  </div>
                ))}
              </div>
              <div className="wf-box" style={{ padding: 14, background: 'var(--wf-accent-soft)', borderColor: 'var(--wf-accent)' }}>
                <div className="wf-mono" style={{ fontSize: 10, color: 'var(--wf-accent)' }}>SPRING SHOWCASE</div>
                <div className="wf-h2" style={{ fontSize: 18 }}>May 16 · "Under the Stars"</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>4 groups · 12 practices booked</div>
                <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                  <button className="wf-btn" style={{ padding: '4px 10px', fontSize: 11 }}>Manage →</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div style={{ position: 'absolute', top: 70, right: 40 }}>
        <WFCallout rotate={-4}>KPI landing → drill-in ↗</WFCallout>
      </div>
    </WFBrowser>
  );
}

Object.assign(window, { AdminDashV1, AdminDashV2 });
