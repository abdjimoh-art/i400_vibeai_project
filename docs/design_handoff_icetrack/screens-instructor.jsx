// Instructor dashboard — 2 variations.
// V1: Today's class roster card (tablet-friendly, big tap targets).
// V2: Class list + drill-in (desktop dense overview).

function InstructorDashV1() {
  return (
    <WFTablet>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: WF.paper }}>
        {/* Top */}
        <div style={{ padding: '14px 20px', borderBottom: `1.5px solid ${WF.ink}`, background: '#fff', display: 'flex', alignItems: 'center', gap: 14 }}>
          <WFLogo size={16} />
          <span className="wf-pill wf-pill-accent" style={{ fontSize: 11 }}>INSTRUCTOR</span>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10, fontSize: 12 }}>
            <span className="wf-hand">Coach Maya</span>
            <div className="wf-icon" style={{ borderRadius: '50%' }}>M</div>
          </div>
        </div>

        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '230px 1fr', overflow: 'hidden' }}>
          {/* Class picker */}
          <div style={{ padding: 14, borderRight: `1.5px solid ${WF.ink}`, background: '#fff' }}>
            <div className="wf-mono" style={{ fontSize: 10, color: WF.muted, marginBottom: 8 }}>TODAY · TUE APR 28</div>
            {[
              { time: '4:30 PM', level: 'Level 2', n: 6, active: true },
              { time: '5:30 PM', level: 'Level 3', n: 5 },
              { time: '6:30 PM', level: 'Level 4', n: 4 },
            ].map((c, i) => (
              <div key={i} style={{ padding: 10, marginBottom: 8, border: `1.5px solid ${c.active ? 'var(--wf-accent)' : WF.ink}`, borderRadius: 6, background: c.active ? 'var(--wf-accent-soft)' : '#fff' }}>
                <div className="wf-mono" style={{ fontSize: 11, fontWeight: 700, color: c.active ? 'var(--wf-accent)' : WF.ink }}>{c.time}</div>
                <div className="wf-h2" style={{ fontSize: 16 }}>{c.level}</div>
                <div style={{ fontSize: 11, color: WF.muted }}>{c.n} skaters · Zone A</div>
              </div>
            ))}
            <div className="wf-mono" style={{ fontSize: 10, color: WF.muted, marginTop: 18, marginBottom: 8 }}>THIS WEEK</div>
            <div style={{ fontSize: 11, color: WF.inkSoft }}>Sat · 9:00 Tot 3</div>
            <div style={{ fontSize: 11, color: WF.inkSoft }}>Sat · 10:00 Level 1</div>
          </div>

          {/* Roster */}
          <div style={{ padding: 18, overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
              <div>
                <div className="wf-h1" style={{ fontSize: 26 }}>Level 2 · 4:30 PM</div>
                <div style={{ fontSize: 12, color: WF.muted }}>Tap a skater to mark attendance & skill passes</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="wf-btn wf-btn-ghost">All present</button>
                <button className="wf-btn wf-btn-primary">Save session</button>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, marginTop: 14, marginBottom: 12, borderBottom: `1.5px solid ${WF.pencil}` }}>
              {['Roster (6)', 'Skills', 'Notes'].map((t, i) => (
                <span key={t} className="wf-hand" style={{ padding: '6px 14px', fontSize: 13, borderBottom: i === 0 ? `2px solid var(--wf-accent)` : 'none', color: i === 0 ? 'var(--wf-accent)' : WF.muted, fontWeight: i === 0 ? 700 : 400, marginBottom: -1.5 }}>{t}</span>
              ))}
            </div>

            {/* Roster grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { n: 'Emma M.', present: true, passed: 1, total: 8, ribbon: '+1 today' },
                { n: 'Liam K.', present: true, passed: 0, total: 8 },
                { n: 'Ava R.', present: true, passed: 2, total: 8 },
                { n: 'Noah T.', present: false, passed: 0, total: 8 },
                { n: 'Mia P.', present: true, passed: 1, total: 8 },
                { n: 'Owen S.', present: null, passed: 0, total: 8 },
              ].map((s, i) => (
                <div key={i} className="wf-box" style={{ padding: 12, background: '#fff', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <WFPhoto label="" width={40} height={40} style={{ borderRadius: '50%' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontWeight: 700, fontSize: 14 }}>{s.n}</span>
                      {s.ribbon && <WFRibbon>{s.ribbon}</WFRibbon>}
                    </div>
                    <div style={{ fontSize: 11, color: WF.muted, fontFamily: WF.mono }}>{s.passed}/{s.total} skills</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="wf-btn" style={{ padding: '6px 10px', fontSize: 12, background: s.present === true ? WF.green : '#fff', color: s.present === true ? '#fff' : WF.ink, boxShadow: s.present === true ? '2px 2px 0 ' + WF.ink : 'none' }}>✓</button>
                    <button className="wf-btn" style={{ padding: '6px 10px', fontSize: 12, background: s.present === false ? '#d97757' : '#fff', color: s.present === false ? '#fff' : WF.ink, boxShadow: s.present === false ? '2px 2px 0 ' + WF.ink : 'none' }}>✗</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ position: 'absolute', bottom: 60, right: 30 }}>
          <WFCallout rotate={-3}>BIG tap targets ↗ rink-side</WFCallout>
        </div>
      </div>
    </WFTablet>
  );
}

function InstructorDashV2() {
  return (
    <WFBrowser url="icetrack.app/instructor">
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: WF.paper }}>
        <div style={{ padding: '12px 24px', borderBottom: `1.5px solid ${WF.ink}`, background: '#fff', display: 'flex', alignItems: 'center', gap: 18 }}>
          <WFLogo size={16} />
          <span className="wf-pill wf-pill-accent" style={{ fontSize: 11 }}>INSTRUCTOR</span>
          <div style={{ display: 'flex', gap: 4, marginLeft: 18 }}>
            {['My Classes', 'Today', 'Skill Tracker', 'Skaters'].map((l, i) => (
              <span key={l} className="wf-hand" style={{ padding: '4px 10px', fontSize: 13, borderBottom: i === 0 ? `2px solid var(--wf-accent)` : 'none', color: i === 0 ? 'var(--wf-accent)' : WF.inkSoft, fontWeight: i === 0 ? 700 : 400 }}>{l}</span>
            ))}
          </div>
          <div style={{ marginLeft: 'auto', fontSize: 12, color: WF.muted }}>Coach Maya · Spring 2026</div>
        </div>

        <div style={{ flex: 1, padding: 20, overflow: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
            <div className="wf-h1" style={{ fontSize: 26 }}>My classes</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <span className="wf-pill" style={{ background: '#fff' }}>Spring 2026 ▾</span>
              <span className="wf-pill" style={{ background: '#fff' }}>All levels ▾</span>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 18 }}>
            {[
              { n: '5', l: 'Classes' },
              { n: '24', l: 'Skaters' },
              { n: '37', l: 'Skills passed' },
              { n: '92%', l: 'Attendance' },
            ].map((s, i) => (
              <div key={i} className="wf-box" style={{ padding: 12, background: '#fff' }}>
                <div className="wf-h1" style={{ fontSize: 28, color: 'var(--wf-accent)' }}>{s.n}</div>
                <div style={{ fontSize: 11, color: WF.muted, fontFamily: WF.mono, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* Class table */}
          <div className="wf-box" style={{ background: '#fff', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 100px', padding: '10px 14px', background: WF.paper, borderBottom: `1.5px solid ${WF.ink}`, fontFamily: WF.mono, fontSize: 10, color: WF.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              <span>Day · Time</span><span>Level</span><span>Skaters</span><span>Today</span><span>Last passed</span><span></span>
            </div>
            {[
              { d: 'Tue 4:30', l: 'Level 2', n: '6/8', today: 'in 2d', last: 'Apr 22 · Emma' },
              { d: 'Tue 5:30', l: 'Level 3', n: '5/8', today: 'in 2d', last: 'Apr 22 · Maya' },
              { d: 'Tue 6:30', l: 'Level 4', n: '4/8', today: 'in 2d', last: 'Apr 15 · Liam' },
              { d: 'Sat 9:00', l: 'Tot 3', n: '5/6', today: 'in 5d', last: 'Apr 19 · Leo' },
              { d: 'Sat 10:00', l: 'Level 1', n: '4/6', today: 'in 5d', last: 'Apr 19 · Sky' },
            ].map((r, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 100px', padding: '10px 14px', alignItems: 'center', fontSize: 12, borderBottom: i < 4 ? `1px dashed ${WF.pencil}` : 'none' }}>
                <span style={{ fontFamily: WF.mono, fontWeight: 700 }}>{r.d}</span>
                <span><span className="wf-pill" style={{ background: '#fff', fontSize: 11 }}>{r.l}</span></span>
                <span>{r.n}</span>
                <span className="wf-hand" style={{ color: WF.inkSoft }}>{r.today}</span>
                <span style={{ fontSize: 11, color: WF.muted }}>{r.last}</span>
                <span style={{ display: 'flex', gap: 4 }}>
                  <button className="wf-btn" style={{ padding: '4px 10px', fontSize: 11 }}>Open</button>
                </span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 14, padding: 14, border: `1.5px dashed ${WF.pencil}`, borderRadius: 6, fontFamily: WF.hand, fontSize: 13, color: WF.inkSoft }}>
            ✎ Quick note: Tap any class row to take attendance & mark skill passes for that session.
          </div>
        </div>
        <div style={{ position: 'absolute', top: 70, right: 30 }}>
          <WFCallout rotate={4}>desktop overview ↘</WFCallout>
        </div>
      </div>
    </WFBrowser>
  );
}

Object.assign(window, { InstructorDashV1, InstructorDashV2 });
