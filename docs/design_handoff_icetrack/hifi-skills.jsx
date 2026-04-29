// Skill tracker — hi-fi (Direction B: parent "level journey", celebratory)

function ITSkillsHiFi() {
  const skills = [
    { name: 'Forward swizzles (8)', status: 'passed', date: 'Apr 22' },
    { name: 'Backward swizzles (6)', status: 'passed', date: 'Apr 15' },
    { name: 'Forward two-foot glide', status: 'passed', date: 'Apr 8' },
    { name: 'Snowplow stop (two-foot)', status: 'passed', date: 'Mar 30' },
    { name: 'One-foot glide · left (4 ct)', status: 'passed', date: 'Mar 22' },
    { name: 'One-foot glide · right (4 ct)', status: 'working', date: '3 of 4 attempts' },
    { name: 'Forward stroking (½ rink)', status: 'next', date: 'starts May 5' },
    { name: 'Two-foot turn · forward → backward', status: 'locked' },
  ];
  return (
    <ITBrowser url="icetrack.app/parent/emma/level-2">
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: IT.paper, overflow: 'auto' }}>
        {/* Header band */}
        <div style={{ background: `linear-gradient(160deg, ${IT.iceDeep}, ${IT.ice} 70%, #5fa3d9)`, color: '#fff', padding: '24px 32px 32px', position: 'relative', overflow: 'hidden' }}>
          <svg style={{ position: 'absolute', inset: 0, opacity: 0.18 }} viewBox="0 0 900 280" preserveAspectRatio="none">
            <path d="M0 200 Q 200 80, 450 160 T 900 130" stroke="#fff" strokeWidth="1.5" fill="none" />
            <path d="M0 240 Q 200 130, 450 200 T 900 180" stroke="#fff" strokeWidth="1.2" fill="none" />
            <circle cx="780" cy="50" r="40" stroke="#fff" fill="none" />
            <circle cx="780" cy="50" r="60" stroke="#fff" fill="none" opacity="0.5" />
          </svg>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(255,255,255,0.8)', marginBottom: 14 }}>
            <a style={{ color: 'inherit' }}>← Emma's profile</a>
            <span>·</span>
            <span>Skill journey</span>
          </div>
          <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'center' }}>
            <div>
              <div className="it-eyebrow" style={{ color: 'rgba(255,255,255,0.7)' }}>Emma Mitchell · Age 7</div>
              <h1 style={{ fontSize: 48, color: '#fff', fontWeight: 300, marginTop: 4 }}>
                Level 2 <span style={{ fontStyle: 'italic', fontWeight: 400 }}>journey</span>
              </h1>
              <div style={{ marginTop: 10, display: 'flex', gap: 14, alignItems: 'center', fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>
                <span><strong style={{ color: '#fff' }}>5 of 8</strong> skills passed</span>
                <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,0.5)' }} />
                <span>Started Jan 15, 2026</span>
                <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,0.5)' }} />
                <span>Coach Maya</span>
              </div>
            </div>
            <div style={{ position: 'relative', width: 130, height: 130 }}>
              <svg viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
                <circle cx="50" cy="50" r="44" stroke="rgba(255,255,255,0.2)" strokeWidth="6" fill="none" />
                <circle cx="50" cy="50" r="44" stroke="#fff" strokeWidth="6" fill="none" strokeLinecap="round" strokeDasharray={`${(5/8) * 276} 276`} />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <div style={{ fontFamily: IT.display, fontSize: 36, fontWeight: 400, lineHeight: 1 }}>62<span style={{ fontSize: 18 }}>%</span></div>
                <div className="it-eyebrow" style={{ color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>Complete</div>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: 28, display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
          {/* Skill journey timeline */}
          <div className="it-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
              <h3 style={{ fontSize: 18, fontWeight: 500 }}>The path so far</h3>
              <div style={{ display: 'flex', gap: 12, fontSize: 11, color: IT.muted }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: IT.crimson }} /> Passed</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: IT.honey }} /> Working on</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: IT.ice }} /> Up next</span>
              </div>
            </div>

            <div style={{ position: 'relative', paddingLeft: 30 }}>
              <div style={{ position: 'absolute', left: 11, top: 8, bottom: 8, width: 2, background: `repeating-linear-gradient(to bottom, ${IT.hairline} 0 4px, transparent 4px 8px)` }} />
              {skills.map((s, i) => {
                const passed = s.status === 'passed', working = s.status === 'working', next = s.status === 'next';
                const dotBg = passed ? IT.crimson : working ? IT.honey : next ? IT.ice : IT.surface;
                const dotBorder = passed ? IT.crimson : working ? IT.honey : next ? IT.ice : IT.hairline;
                return (
                  <div key={i} style={{ position: 'relative', padding: '8px 0 14px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <div style={{ position: 'absolute', left: -30, top: 10, width: 24, height: 24, borderRadius: '50%', background: dotBg, border: `2px solid ${dotBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: passed || working || next ? `0 0 0 4px ${IT.surface}` : 'none' }}>
                      {passed && <ITIcon name="check" size={12} color="#fff" />}
                      {working && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
                      {next && <ITIcon name="star" size={11} color="#fff" />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0, padding: '8px 14px', borderRadius: IT.rMd,
                      background: passed ? IT.crimsonSoft : working ? IT.honeySoft : next ? IT.iceSoft : IT.surface2,
                      border: `1px solid ${passed ? IT.crimson + '22' : working ? IT.honey + '55' : next ? IT.iceDeep + '22' : IT.hairlineSoft}`,
                      opacity: s.status === 'locked' ? 0.55 : 1,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                        <div style={{ fontSize: 14, fontWeight: 500, color: passed ? IT.crimson : IT.ink }}>{s.name}</div>
                        {s.date && <span className="it-mono" style={{ fontSize: 11, color: IT.muted }}>{s.date}</span>}
                      </div>
                      {passed && <div style={{ fontSize: 12, color: IT.inkSoft, marginTop: 3 }}>Coach Maya · Tue session</div>}
                      {working && <div style={{ fontSize: 12, color: '#8b6a25', marginTop: 3 }}>Almost! One more clean attempt to pass.</div>}
                      {next && <div style={{ fontSize: 12, color: IT.iceDeep, marginTop: 3 }}>Coming up after the right-foot glide.</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right rail */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Latest celebration */}
            <div className="it-card" style={{ padding: 22, background: `linear-gradient(180deg, ${IT.crimsonSoft}, ${IT.surface})`, borderColor: IT.crimson + '33' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <ITIcon name="medal" size={18} color={IT.crimson} />
                <span className="it-eyebrow" style={{ color: IT.crimson }}>Just passed</span>
              </div>
              <div style={{ fontSize: 18, fontFamily: IT.display, fontWeight: 500, color: IT.crimson, lineHeight: 1.2 }}>
                Forward swizzles, eight in a row.
              </div>
              <p style={{ fontSize: 13, color: IT.inkSoft, marginTop: 10, lineHeight: 1.5 }}>
                "Emma had this one cold today — eight clean swizzles down the rink with a nice glide between each. Onto stroking next!"
              </p>
              <div style={{ marginTop: 12, fontSize: 11, color: IT.muted }}>— Coach Maya, Apr 22</div>
            </div>

            {/* When passed */}
            <div className="it-card" style={{ padding: 18 }}>
              <h4 style={{ fontSize: 14, fontWeight: 500, marginBottom: 10 }}>What's next after Level 2?</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: IT.rMd, background: IT.iceTint }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: IT.ice, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: IT.display, fontWeight: 500 }}>L3</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>Level 3 · Crossovers</div>
                  <div style={{ fontSize: 11, color: IT.muted }}>9 skills · est. 8–12 weeks</div>
                </div>
                <ITIcon name="chevron" size={14} color={IT.muted} />
              </div>
            </div>

            {/* Practice video */}
            <div className="it-card" style={{ padding: 18 }}>
              <h4 style={{ fontSize: 14, fontWeight: 500, marginBottom: 10 }}>Practice between classes</h4>
              <div style={{ aspectRatio: '16/9', background: IT.surface2, borderRadius: IT.rSm, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundImage: `repeating-linear-gradient(115deg, ${IT.iceTint} 0 18px, ${IT.iceSoft} 18px 19px)` }}>
                <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#fff', boxShadow: IT.shadowLift, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 0, height: 0, borderLeft: `10px solid ${IT.iceDeep}`, borderTop: '7px solid transparent', borderBottom: '7px solid transparent', marginLeft: 3 }} />
                </div>
              </div>
              <div style={{ fontSize: 12, color: IT.inkSoft, marginTop: 10 }}>One-foot glide drill · 1:24</div>
            </div>
          </div>
        </div>
      </div>
    </ITBrowser>
  );
}

Object.assign(window, { ITSkillsHiFi });
