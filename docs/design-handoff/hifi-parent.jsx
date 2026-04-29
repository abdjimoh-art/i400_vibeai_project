// Parent dashboard — hi-fi (Direction A: skater cards, warm/family-forward)

function ITParentHiFi() {
  return (
    <ITBrowser url="icetrack.app/parent">
      <div style={{ height: '100%', display: 'grid', gridTemplateColumns: '224px 1fr', background: IT.paper }}>
        {/* Sidebar */}
        <div style={{ background: IT.surface, borderRight: `1px solid ${IT.hairline}`, padding: 20, display: 'flex', flexDirection: 'column' }}>
          <ITLogo size={15} />
          <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[
              { i: 'home', l: 'Overview', active: true },
              { i: 'skater', l: 'My skaters' },
              { i: 'cal', l: 'Schedule' },
              { i: 'star', l: 'Skill journeys' },
              { i: 'show', l: 'Spring show' },
              { i: 'bell', l: 'Notifications', badge: 2 },
            ].map(n => (
              <div key={n.l} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: IT.rSm,
                background: n.active ? IT.iceSoft : 'transparent', color: n.active ? IT.iceDeep : IT.inkSoft, fontSize: 13, fontWeight: n.active ? 500 : 400,
              }}>
                <ITIcon name={n.i} size={16} color={n.active ? IT.iceDeep : IT.muted} />
                <span style={{ flex: 1 }}>{n.l}</span>
                {n.badge && <span className="it-pill it-pill-crimson" style={{ fontSize: 10, padding: '1px 6px' }}>{n.badge}</span>}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 'auto', padding: 12, borderRadius: IT.rMd, background: IT.surface2, display: 'flex', alignItems: 'center', gap: 10 }}>
            <ITAvatar name="Sarah Mitchell" size={32} hue={210} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 500 }}>Sarah Mitchell</div>
              <div style={{ fontSize: 11, color: IT.muted }}>Parent · 2 skaters</div>
            </div>
          </div>
        </div>

        {/* Main */}
        <div style={{ overflow: 'auto', padding: 28 }}>
          <ITHeader
            eyebrow="Spring 2026 · Week 8"
            title="Hi Sarah."
            subtitle="Two skaters, one upcoming class, three skills in motion."
            right={[
              <button key="b" className="it-btn"><ITIcon name="search" size={14} color={IT.muted} /> Search</button>,
              <button key="a" className="it-btn it-btn-primary"><ITIcon name="plus" size={14} color="#fff" /> Add skater</button>,
            ]}
          />

          {/* Skater cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 22 }}>
            {[
              { n: 'Emma Mitchell', age: 7, lvl: 'Level 2', p: 5, t: 8, next: 'Tue · 4:30 PM', coach: 'Coach Maya', hue: 340, recent: 'Forward swizzles (8)', recentDate: 'Apr 22' },
              { n: 'Leo Mitchell', age: 4, lvl: 'Tot 3', p: 4, t: 6, next: 'Sat · 9:00 AM', coach: 'Coach Ben', hue: 30, recent: 'Two-foot hop', recentDate: 'Apr 18' },
            ].map((s, i) => (
              <div key={i} className="it-card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 16 }}>
                  <ITAvatar name={s.n} size={56} hue={s.hue} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h2 style={{ fontSize: 22, fontWeight: 500 }}>{s.n.split(' ')[0]}</h2>
                    <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                      <span className="it-pill it-pill-ice">{s.lvl}</span>
                      <span className="it-pill">Age {s.age}</span>
                    </div>
                  </div>
                  <button className="it-btn it-btn-ghost it-btn-sm" style={{ padding: 6 }}>
                    <ITIcon name="chevron" size={16} color={IT.muted} />
                  </button>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: IT.inkSoft, fontWeight: 500 }}>Skill progress</span>
                    <span className="it-mono" style={{ fontSize: 12, color: IT.ink }}><strong>{s.p}</strong>/{s.t}</span>
                  </div>
                  <div className="it-progress"><span style={{ width: `${s.p / s.t * 100}%` }} /></div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: 12, background: IT.surface2, borderRadius: IT.rMd }}>
                  <div>
                    <div className="it-eyebrow" style={{ marginBottom: 4 }}>Next class</div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{s.next}</div>
                    <div style={{ fontSize: 11, color: IT.muted }}>{s.coach}</div>
                  </div>
                  <div>
                    <div className="it-eyebrow" style={{ marginBottom: 4 }}>Last passed</div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: IT.crimson }}>{s.recent}</div>
                    <div style={{ fontSize: 11, color: IT.muted }}>{s.recentDate}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 14 }}>
            <div className="it-card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
                <h3 style={{ fontSize: 16, fontWeight: 500 }}>Recent skill passes</h3>
                <a style={{ fontSize: 12, color: IT.ice }}>View all →</a>
              </div>
              {[
                { who: 'Emma', skill: 'Forward swizzles (8)', detail: 'Eight in a row, glide between each', when: 'Apr 22', hue: 340, fresh: true },
                { who: 'Leo',  skill: 'Two-foot hop',          detail: 'Small jump in place from standstill', when: 'Apr 18', hue: 30 },
                { who: 'Emma', skill: 'One-foot glide (left)', detail: 'Glide held for a count of 4–6',       when: 'Apr 15', hue: 340 },
              ].map((r, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: i < 2 ? `1px solid ${IT.hairlineSoft}` : 'none' }}>
                  <ITAvatar name={r.who} size={32} hue={r.hue} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13 }}>
                      <strong style={{ fontWeight: 600 }}>{r.who}</strong> passed <span style={{ color: IT.crimson, fontWeight: 500 }}>{r.skill}</span>
                    </div>
                    <div style={{ fontSize: 12, color: IT.muted }}>{r.detail}</div>
                  </div>
                  {r.fresh && <span className="it-pill it-pill-crimson" style={{ fontSize: 10 }}>NEW</span>}
                  <span className="it-mono" style={{ fontSize: 11, color: IT.muted, width: 50, textAlign: 'right' }}>{r.when}</span>
                </div>
              ))}
            </div>

            <div className="it-card" style={{ padding: 0, overflow: 'hidden', background: `linear-gradient(160deg, ${IT.iceDeep}, ${IT.ice})`, color: '#fff', position: 'relative' }}>
              <svg style={{ position: 'absolute', inset: 0, opacity: 0.15 }} viewBox="0 0 300 400" preserveAspectRatio="none">
                <circle cx="240" cy="60" r="30" stroke="#fff" fill="none" />
                <circle cx="240" cy="60" r="50" stroke="#fff" fill="none" />
                <path d="M-20 320 Q 100 240, 220 290 T 400 270" stroke="#fff" strokeWidth="1.2" fill="none" />
              </svg>
              <div style={{ padding: 20, position: 'relative' }}>
                <div className="it-eyebrow" style={{ color: 'rgba(255,255,255,0.75)' }}>Spring showcase</div>
                <h3 style={{ fontSize: 24, color: '#fff', fontWeight: 400, marginTop: 6 }}>
                  Under the <span style={{ fontStyle: 'italic' }}>Stars</span>
                </h3>
                <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><ITIcon name="cal" size={14} color="#fff" /> Sat May 16 · 6:00 PM</div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><ITIcon name="pin" size={14} color="#fff" /> Frank Southern, Zone A</div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><ITIcon name="users" size={14} color="#fff" /> Emma · Group B (Rising Stars)</div>
                </div>
                <button className="it-btn" style={{ marginTop: 16, background: '#fff', color: IT.iceDeep, borderColor: '#fff' }}>
                  Practice schedule <ITIcon name="arrow-right" size={13} color={IT.iceDeep} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ITBrowser>
  );
}

Object.assign(window, { ITParentHiFi });
