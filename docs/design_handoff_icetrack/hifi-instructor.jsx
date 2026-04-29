// Instructor dashboard — hi-fi (Direction A: tablet · today's roster, big tap targets)

function ITInstructorHiFi() {
  return (
    <ITTablet>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: IT.paper }}>
        {/* Top bar */}
        <div style={{ padding: '14px 22px', background: IT.surface, borderBottom: `1px solid ${IT.hairline}`, display: 'flex', alignItems: 'center', gap: 14 }}>
          <ITLogo size={15} />
          <span className="it-pill it-pill-ice">Instructor</span>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: IT.muted }}>
              <ITIcon name="clock" size={14} color={IT.muted} />
              <span className="it-mono">Tue · Apr 28 · 4:18 PM</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ITAvatar name="Maya Chen" size={28} hue={290} />
              <span style={{ fontSize: 13, fontWeight: 500 }}>Coach Maya</span>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '240px 1fr', overflow: 'hidden' }}>
          {/* Class list */}
          <div style={{ padding: 16, borderRight: `1px solid ${IT.hairline}`, background: IT.surface, overflow: 'auto' }}>
            <div className="it-eyebrow" style={{ marginBottom: 10 }}>Today · Tue Apr 28</div>
            {[
              { time: '4:30 PM', level: 'Level 2', n: 6, t: 8, active: true, status: 'starts in 12 min' },
              { time: '5:30 PM', level: 'Level 3', n: 5, t: 8, status: 'in 1h 12m' },
              { time: '6:30 PM', level: 'Level 4', n: 4, t: 8, status: 'in 2h 12m' },
            ].map((c, i) => (
              <div key={i} style={{
                padding: 12, marginBottom: 8, borderRadius: IT.rMd,
                background: c.active ? IT.iceSoft : IT.surface,
                border: c.active ? `1px solid ${IT.ice}` : `1px solid ${IT.hairline}`,
                boxShadow: c.active ? `0 0 0 3px ${IT.ice}22` : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                  <span className="it-mono" style={{ fontSize: 13, fontWeight: 600, color: c.active ? IT.iceDeep : IT.ink }}>{c.time}</span>
                  <span style={{ fontSize: 11, color: IT.muted }}>{c.n}/{c.t}</span>
                </div>
                <div style={{ fontSize: 15, fontWeight: 500, fontFamily: IT.display, marginTop: 2 }}>{c.level}</div>
                <div style={{ fontSize: 11, color: c.active ? IT.iceDeep : IT.muted, marginTop: 4 }}>{c.status} · Zone A</div>
              </div>
            ))}
            <div className="it-eyebrow" style={{ marginTop: 22, marginBottom: 8 }}>Later this week</div>
            {[
              { d: 'Sat 9:00', l: 'Tot 3' }, { d: 'Sat 10:00', l: 'Level 1' },
            ].map((c, i) => (
              <div key={i} style={{ padding: '8px 12px', fontSize: 12, color: IT.inkSoft, display: 'flex', justifyContent: 'space-between' }}>
                <span className="it-mono">{c.d}</span><span>{c.l}</span>
              </div>
            ))}
          </div>

          {/* Roster main */}
          <div style={{ padding: 22, overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div>
                <div className="it-eyebrow">Tue 4:30 PM · Zone A · 6 skaters</div>
                <h1 style={{ fontSize: 32, fontWeight: 400, marginTop: 4 }}>Level 2 <span style={{ color: IT.muted, fontWeight: 300, fontStyle: 'italic' }}>roster</span></h1>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="it-btn"><ITIcon name="check" size={14} color={IT.spring} /> All present</button>
                <button className="it-btn it-btn-primary">Save session <ITIcon name="arrow-right" size={13} color="#fff" /></button>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, borderBottom: `1px solid ${IT.hairline}`, marginBottom: 16 }}>
              {['Attendance', 'Skill passes', 'Notes'].map((t, i) => (
                <span key={t} style={{
                  padding: '8px 14px', fontSize: 13, fontWeight: i === 0 ? 500 : 400,
                  color: i === 0 ? IT.iceDeep : IT.muted,
                  borderBottom: i === 0 ? `2px solid ${IT.ice}` : '2px solid transparent',
                  marginBottom: -1,
                }}>{t}</span>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { n: 'Emma Mitchell', present: true, p: 5, t: 8, hue: 340, ribbon: '+1 today' },
                { n: 'Liam Kowalski', present: true, p: 3, t: 8, hue: 200 },
                { n: 'Ava Reyes', present: true, p: 6, t: 8, hue: 30 },
                { n: 'Noah Tanaka', present: false, p: 2, t: 8, hue: 150, note: 'sick' },
                { n: 'Mia Patel', present: true, p: 4, t: 8, hue: 280 },
                { n: 'Owen Singh', present: null, p: 1, t: 8, hue: 100 },
              ].map((s, i) => (
                <div key={i} className="it-card" style={{
                  padding: 14, display: 'flex', alignItems: 'center', gap: 12,
                  background: s.present === false ? IT.rustSoft : IT.surface,
                  borderColor: s.present === false ? IT.rust + '55' : IT.hairline,
                }}>
                  <ITAvatar name={s.n} size={42} hue={s.hue} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 500 }}>{s.n}</span>
                      {s.ribbon && <span className="it-pill it-pill-crimson" style={{ fontSize: 10 }}>{s.ribbon}</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                      <div style={{ flex: 1, height: 4, background: IT.hairlineSoft, borderRadius: 2, maxWidth: 90 }}>
                        <div style={{ width: `${s.p / s.t * 100}%`, height: '100%', background: IT.ice, borderRadius: 2 }} />
                      </div>
                      <span className="it-mono" style={{ fontSize: 11, color: IT.muted }}>{s.p}/{s.t} skills</span>
                    </div>
                    {s.note && <div style={{ fontSize: 11, color: IT.rust, marginTop: 4 }}>note: {s.note}</div>}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button style={{
                      width: 44, height: 44, borderRadius: IT.rMd, border: `1px solid ${s.present === true ? IT.spring : IT.hairline}`,
                      background: s.present === true ? IT.spring : IT.surface,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                      boxShadow: s.present === true ? `0 0 0 3px ${IT.spring}22` : 'none',
                    }}>
                      <ITIcon name="check" size={18} color={s.present === true ? '#fff' : IT.muted} />
                    </button>
                    <button style={{
                      width: 44, height: 44, borderRadius: IT.rMd, border: `1px solid ${s.present === false ? IT.rust : IT.hairline}`,
                      background: s.present === false ? IT.rust : IT.surface,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 18,
                      color: s.present === false ? '#fff' : IT.muted,
                      boxShadow: s.present === false ? `0 0 0 3px ${IT.rust}22` : 'none',
                    }}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ITTablet>
  );
}

Object.assign(window, { ITInstructorHiFi });
