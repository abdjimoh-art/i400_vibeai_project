// Admin dashboard — hi-fi (Direction B: KPI overview + drill-in)

function ITAdminHiFi() {
  return (
    <ITBrowser url="icetrack.app/admin">
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: IT.paper }}>
        {/* Top nav */}
        <div style={{ padding: '12px 28px', background: IT.surface, borderBottom: `1px solid ${IT.hairline}`, display: 'flex', alignItems: 'center', gap: 22 }}>
          <ITLogo size={15} />
          <span className="it-pill it-pill-crimson">Admin</span>
          <div style={{ display: 'flex', gap: 2, marginLeft: 16 }}>
            {['Overview', 'Classes', 'Skaters', 'Instructors', 'Show', 'Reports'].map((l, i) => (
              <span key={l} style={{
                padding: '8px 12px', fontSize: 13, fontWeight: i === 0 ? 500 : 400,
                color: i === 0 ? IT.ink : IT.muted, borderRadius: IT.rSm,
                background: i === 0 ? IT.surface2 : 'transparent',
              }}>{l}</span>
            ))}
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="it-input" style={{ width: 200, padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <ITIcon name="search" size={13} color={IT.muted} />
              <span style={{ fontSize: 12, color: IT.muted }}>Search · ⌘K</span>
            </div>
            <ITAvatar name="Admin User" size={28} hue={250} />
          </div>
        </div>

        <div style={{ flex: 1, padding: 28, overflow: 'auto' }}>
          <ITHeader
            eyebrow="Spring 2026 · Week 8 of 12"
            title="At a glance"
            subtitle="Apr 27 – May 3 · Frank Southern Ice Arena"
            right={[
              <button key="e" className="it-btn">Export</button>,
              <button key="n" className="it-btn it-btn-primary"><ITIcon name="plus" size={13} color="#fff" /> New class</button>,
            ]}
          />

          {/* KPI strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 22 }}>
            {[
              { l: 'Active classes', n: '18', sub: '+2 vs Fall', tone: 'ice' },
              { l: 'Skaters enrolled', n: '94', sub: '6 waitlisted', tone: 'ink' },
              { l: 'Instructors', n: '7', sub: 'all active', tone: 'ink' },
              { l: 'Avg attendance', n: '89%', sub: '↑ 4 pts vs last wk', tone: 'spring' },
            ].map((s, i) => (
              <div key={i} className="it-card" style={{ padding: 18 }}>
                <div className="it-eyebrow">{s.l}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8 }}>
                  <span style={{ fontFamily: IT.display, fontSize: 38, fontWeight: 400, letterSpacing: '-0.02em', color: s.tone === 'ice' ? IT.iceDeep : s.tone === 'spring' ? IT.spring : IT.ink }}>{s.n}</span>
                </div>
                <div style={{ fontSize: 12, color: IT.muted, marginTop: 4 }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Two columns */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 14 }}>
            {/* Enrollment by level */}
            <div className="it-card" style={{ padding: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 500 }}>Enrollment by level</h3>
                  <div style={{ fontSize: 12, color: IT.muted, marginTop: 2 }}>Filled vs capacity, all 8 levels</div>
                </div>
                <span className="it-pill">Spring 2026</span>
              </div>
              {[
                { l: 'Parent Tot', e: 8, cap: 10 }, { l: 'Tot 2', e: 7, cap: 10 },
                { l: 'Tot 3', e: 9, cap: 10 }, { l: 'Level 1', e: 12, cap: 12 },
                { l: 'Level 2', e: 14, cap: 16 }, { l: 'Level 3', e: 11, cap: 16 },
                { l: 'Level 4', e: 8, cap: 12 }, { l: 'Level 5', e: 5, cap: 8 },
              ].map((r, i) => {
                const pct = r.e / r.cap;
                const full = r.e === r.cap;
                return (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '90px 1fr 60px', alignItems: 'center', gap: 14, padding: '7px 0' }}>
                    <span style={{ fontSize: 13, color: IT.inkSoft }}>{r.l}</span>
                    <div style={{ position: 'relative', height: 22, background: IT.hairlineSoft, borderRadius: IT.rSm, overflow: 'hidden' }}>
                      <div style={{ width: `${pct * 100}%`, height: '100%', background: full ? IT.crimson : IT.ice, borderRadius: IT.rSm, transition: 'width 0.3s' }} />
                      {full && <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 10, color: '#fff', fontFamily: IT.mono, fontWeight: 600 }}>FULL</span>}
                    </div>
                    <span className="it-mono" style={{ fontSize: 12, textAlign: 'right', color: full ? IT.crimson : IT.ink, fontWeight: 500 }}>{r.e}/{r.cap}</span>
                  </div>
                );
              })}
            </div>

            {/* Right rail */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="it-card" style={{ padding: 18 }}>
                <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: 14 }}>Recent activity</h3>
                {[
                  { who: 'Coach Maya', what: 'logged 6 attendance for Level 2', when: '2h ago', hue: 290 },
                  { who: 'Sarah Mitchell', what: 'enrolled Leo in Sat Tot 3', when: '5h ago', hue: 210 },
                  { who: 'Coach Ben', what: 'passed Liam on 3 skills', when: '1d ago', hue: 150 },
                  { who: 'You', what: 'created Sat 11:00 Tot 2 class', when: '2d ago', hue: 250 },
                ].map((a, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: i < 3 ? `1px solid ${IT.hairlineSoft}` : 'none', alignItems: 'flex-start' }}>
                    <ITAvatar name={a.who} size={26} hue={a.hue} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12 }}><strong style={{ fontWeight: 600 }}>{a.who}</strong> {a.what}</div>
                      <div style={{ fontSize: 11, color: IT.muted, marginTop: 2 }}>{a.when}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="it-card" style={{ padding: 0, overflow: 'hidden', background: `linear-gradient(155deg, ${IT.iceDeep}, ${IT.ice})`, color: '#fff' }}>
                <div style={{ padding: 18 }}>
                  <div className="it-eyebrow" style={{ color: 'rgba(255,255,255,0.75)' }}>Spring showcase</div>
                  <h3 style={{ fontSize: 22, color: '#fff', fontWeight: 400, marginTop: 4 }}>
                    May 16 · <span style={{ fontStyle: 'italic' }}>Under the Stars</span>
                  </h3>
                  <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div><div className="it-mono" style={{ fontSize: 22 }}>4</div><div style={{ fontSize: 11, opacity: 0.8 }}>groups</div></div>
                    <div><div className="it-mono" style={{ fontSize: 22 }}>12</div><div style={{ fontSize: 11, opacity: 0.8 }}>practices</div></div>
                  </div>
                  <button className="it-btn" style={{ marginTop: 14, background: '#fff', color: IT.iceDeep, borderColor: '#fff' }}>Manage <ITIcon name="arrow-right" size={13} color={IT.iceDeep} /></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ITBrowser>
  );
}

Object.assign(window, { ITAdminHiFi });
