// Skating show / practice schedule + Marketing landing page — 2 variations each.

function ShowScheduleV1() {
  return (
    <WFBrowser url="icetrack.app/admin/show">
      <div style={{ height: '100%', background: WF.paper, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '12px 24px', borderBottom: `1.5px solid ${WF.ink}`, background: '#fff', display: 'flex', alignItems: 'center', gap: 14 }}>
          <WFLogo size={14} />
          <span style={{ color: WF.muted, fontSize: 12 }}>›</span>
          <span style={{ fontSize: 12 }}>Spring Showcase</span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
            <button className="wf-btn" style={{ padding: '4px 10px', fontSize: 11 }}>Print run order</button>
            <button className="wf-btn wf-btn-primary" style={{ padding: '4px 10px', fontSize: 11 }}>+ Add practice</button>
          </div>
        </div>

        <div style={{ flex: 1, padding: 20, overflow: 'auto' }}>
          {/* Show header */}
          <div className="wf-rough" style={{ background: 'var(--wf-accent)', color: '#fff', padding: 18, marginBottom: 16, boxShadow: '4px 4px 0 ' + WF.ink, position: 'relative', overflow: 'hidden' }}>
            <div className="wf-stripe-bg" style={{ position: 'absolute', inset: 0, opacity: 0.2 }} />
            <div style={{ position: 'relative' }}>
              <div className="wf-mono" style={{ fontSize: 10, opacity: 0.85 }}>SPRING 2026 SHOW</div>
              <div className="wf-h1" style={{ fontSize: 32, color: '#fff' }}>Under the Stars ✦</div>
              <div style={{ display: 'flex', gap: 18, marginTop: 8, fontSize: 13 }}>
                <span>📅 Saturday, May 16</span>
                <span>🕖 6:00 PM</span>
                <span>📍 Frank Southern · Zone A</span>
                <span>👥 4 groups · 28 skaters</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            {/* First half */}
            {[
              { half: 'First Half', groups: [{ n: 'A · Tots Twinkle', levels: 'Parent Tot, Tot 2, Tot 3', count: 9 }, { n: 'B · Rising Stars', levels: 'Level 1, Level 2', count: 11 }] },
              { half: 'Second Half', groups: [{ n: 'C · Constellations', levels: 'Level 3, Level 4', count: 6 }, { n: 'D · Headliners', levels: 'Level 5', count: 2 }] },
            ].map((h, i) => (
              <div key={i} className="wf-box" style={{ background: '#fff', padding: 14 }}>
                <div className="wf-mono" style={{ fontSize: 10, color: WF.muted }}>{h.half.toUpperCase()}</div>
                {h.groups.map((g, j) => (
                  <div key={j} style={{ marginTop: 10, padding: 10, border: `1.5px solid ${WF.ink}`, borderRadius: 5 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="wf-h2" style={{ fontSize: 16 }}>{g.n}</span>
                      <span className="wf-pill" style={{ fontSize: 10 }}>{g.count} skaters</span>
                    </div>
                    <div style={{ fontSize: 11, color: WF.muted, marginTop: 2 }}>{g.levels}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Practice calendar */}
          <div className="wf-box" style={{ background: '#fff', padding: 14 }}>
            <div className="wf-h2" style={{ fontSize: 16, marginBottom: 10 }}>Practice schedule · 12 sessions</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 6 }}>
              {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
                <div key={d} className="wf-mono" style={{ fontSize: 10, color: WF.muted, textAlign: 'center', padding: 4 }}>{d.toUpperCase()}</div>
              ))}
              {Array.from({length: 21}).map((_, i) => {
                const day = i + 1;
                const has = [3,5,8,10,12,15,17,19,21].includes(day);
                const group = ['A','B','C','D'][i % 4];
                return (
                  <div key={i} style={{ minHeight: 56, padding: 5, border: `1.5px solid ${has ? WF.ink : WF.pencil}`, borderRadius: 4, background: has ? 'var(--wf-accent-soft)' : '#fff', position: 'relative' }}>
                    <div className="wf-mono" style={{ fontSize: 9, color: WF.muted }}>May {day}</div>
                    {has && (
                      <div style={{ marginTop: 3 }}>
                        <span className="wf-pill" style={{ fontSize: 9, padding: '1px 5px', background: 'var(--wf-accent)', color: '#fff', border: 'none' }}>Group {group}</span>
                        <div style={{ fontSize: 9, color: WF.inkSoft, marginTop: 2, fontFamily: WF.mono }}>3:00–4:00</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 70, right: 30 }}>
        <WFCallout rotate={-4}>show overview + groups + calendar</WFCallout>
      </div>
    </WFBrowser>
  );
}

function ShowScheduleV2() {
  return (
    <WFPhone>
      <div style={{ height: '100%', background: WF.paper, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '12px 14px', borderBottom: `1.5px solid ${WF.ink}`, background: 'var(--wf-accent)', color: '#fff', position: 'relative', overflow: 'hidden' }}>
          <div className="wf-stripe-bg" style={{ position: 'absolute', inset: 0, opacity: 0.2 }} />
          <div style={{ position: 'relative' }}>
            <div className="wf-mono" style={{ fontSize: 9, opacity: 0.85 }}>SPRING SHOWCASE</div>
            <div className="wf-h1" style={{ fontSize: 22, color: '#fff' }}>Under the Stars</div>
            <div style={{ fontSize: 11, marginTop: 4 }}>Sat May 16 · 6 PM · Group B</div>
          </div>
        </div>
        <div style={{ flex: 1, padding: 14, overflow: 'auto' }}>
          <div className="wf-mono" style={{ fontSize: 9, color: WF.muted, marginBottom: 6 }}>EMMA'S PRACTICE SCHEDULE</div>
          {[
            { d: 'Sat May 3', t: '3:00–4:00 PM', l: 'Group B · Zone A', when: 'in 6 days', soon: false },
            { d: 'Sat May 10', t: '3:00–4:00 PM', l: 'Group B · Zone A', when: 'in 13 days', soon: false },
            { d: 'Sat May 16', t: '5:30 PM call', l: 'SHOW NIGHT', when: 'in 19 days', soon: true },
          ].map((p, i) => (
            <div key={i} className="wf-box" style={{ padding: 10, marginBottom: 8, background: p.soon ? 'var(--wf-accent-soft)' : '#fff', borderColor: p.soon ? 'var(--wf-accent)' : WF.ink }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span className="wf-h2" style={{ fontSize: 14 }}>{p.d}</span>
                <span className="wf-mono" style={{ fontSize: 10, color: WF.muted }}>{p.when}</span>
              </div>
              <div className="wf-mono" style={{ fontSize: 11, fontWeight: 700, marginTop: 2 }}>{p.t}</div>
              <div style={{ fontSize: 11, color: WF.inkSoft, marginTop: 2 }}>{p.l}</div>
              {p.soon && <span className="wf-pill wf-pill-accent" style={{ fontSize: 9, marginTop: 6 }}>SHOW</span>}
            </div>
          ))}

          <div className="wf-box" style={{ padding: 10, marginTop: 10, background: '#fff' }}>
            <div className="wf-mono" style={{ fontSize: 9, color: WF.muted }}>COSTUME REMINDER</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>Group B wears navy + silver. Pickup by May 9 at front desk.</div>
          </div>

          <button className="wf-btn" style={{ width: '100%', justifyContent: 'center', marginTop: 10, fontSize: 12 }}>Add to calendar 📅</button>
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 80, left: -110, transform: 'rotate(-6deg)' }}>
        <WFCallout>parent mobile view →</WFCallout>
      </div>
    </WFPhone>
  );
}

function MarketingV1() {
  return (
    <WFBrowser url="icetrack.app">
      <div style={{ height: '100%', background: WF.paper, overflow: 'auto' }}>
        {/* Nav */}
        <div style={{ padding: '14px 30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <WFLogo size={18} />
          <div style={{ display: 'flex', gap: 18, fontFamily: WF.hand, fontSize: 13 }}>
            <span>How it works</span>
            <span>For parents</span>
            <span>For coaches</span>
            <span>About</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="wf-btn" style={{ padding: '5px 12px', fontSize: 12 }}>Log in</button>
            <button className="wf-btn wf-btn-primary" style={{ padding: '5px 12px', fontSize: 12 }}>Get started</button>
          </div>
        </div>
        {/* Hero */}
        <div style={{ padding: '40px 30px 30px', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 30, alignItems: 'center' }}>
          <div>
            <span className="wf-pill" style={{ marginBottom: 14 }}>⛸ Frank Southern Ice Arena · IU</span>
            <div className="wf-h1" style={{ fontSize: 56, lineHeight: 0.95, marginTop: 10 }}>
              Every glide,<br/>every skill,<br/><span style={{ color: 'var(--wf-accent)' }}>every win.</span>
            </div>
            <div className="wf-hand" style={{ fontSize: 16, color: WF.inkSoft, marginTop: 14, maxWidth: 380, lineHeight: 1.4 }}>
              IceTrack is the all-in-one tool for parents, instructors, and rink staff. Track 53 skills across 8 levels — from Parent Tot to Level 5.
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
              <button className="wf-btn wf-btn-primary" style={{ padding: '10px 20px' }}>Register your skater →</button>
              <button className="wf-btn">I'm a coach</button>
            </div>
            <div style={{ marginTop: 22, display: 'flex', gap: 18, fontSize: 11, color: WF.muted }}>
              <span>★★★★★ Coaches love it</span>
              <span>· Built at Indiana University I400</span>
            </div>
          </div>
          {/* Hero stack */}
          <div style={{ position: 'relative', height: 320 }}>
            <div className="wf-rough" style={{ position: 'absolute', top: 0, left: 0, width: 220, padding: 12, background: '#fff', boxShadow: '4px 4px 0 ' + WF.ink, transform: 'rotate(-3deg)' }}>
              <div className="wf-mono" style={{ fontSize: 9, color: WF.muted }}>EMMA · LEVEL 2</div>
              <div style={{ height: 8, background: WF.paper, border: `1.5px solid ${WF.ink}`, borderRadius: 4, marginTop: 6, overflow: 'hidden' }}>
                <div style={{ width: '62%', height: '100%', background: 'var(--wf-accent)' }} />
              </div>
              <div className="wf-hand" style={{ fontSize: 12, marginTop: 6 }}>5 of 8 skills passed ★</div>
            </div>
            <div className="wf-rough" style={{ position: 'absolute', top: 100, right: 0, width: 200, padding: 12, background: 'var(--wf-accent)', color: '#fff', boxShadow: '4px 4px 0 ' + WF.ink, transform: 'rotate(4deg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 18 }}>🎉</span>
                <span className="wf-h2" style={{ fontSize: 14, color: '#fff' }}>Forward swizzles!</span>
              </div>
              <div className="wf-hand" style={{ fontSize: 11, marginTop: 4, opacity: 0.9 }}>Coach Maya passed Emma — Apr 22</div>
            </div>
            <div className="wf-rough" style={{ position: 'absolute', bottom: 0, left: 30, width: 230, padding: 10, background: '#fff', boxShadow: '4px 4px 0 ' + WF.ink, transform: 'rotate(-1deg)' }}>
              <div className="wf-mono" style={{ fontSize: 9, color: WF.muted, marginBottom: 4 }}>SPRING SHOWCASE</div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ fontSize: 22 }}>✦</span>
                <div>
                  <div className="wf-h2" style={{ fontSize: 14 }}>Under the Stars</div>
                  <div style={{ fontSize: 10, color: WF.muted }}>May 16 · Group B</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Features strip */}
        <div style={{ padding: '20px 30px 30px', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
          {[
            { i: '⛸', t: 'Skill tracker', d: 'Live progress for every skater across all 8 levels.' },
            { i: '✓', t: 'Easy attendance', d: 'Tap-to-mark on tablet, rink-side. Saved instantly.' },
            { i: '🎭', t: 'Show planning', d: 'Combine levels into groups, schedule practices, share with parents.' },
          ].map((f, i) => (
            <div key={i} className="wf-box" style={{ padding: 14, background: '#fff' }}>
              <div style={{ fontSize: 22 }}>{f.i}</div>
              <div className="wf-h2" style={{ fontSize: 16, marginTop: 6 }}>{f.t}</div>
              <div style={{ fontSize: 12, color: WF.inkSoft, marginTop: 4 }}>{f.d}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: 'absolute', top: 200, left: '40%' }}>
        <WFCallout rotate={-4}>↓ messy stack of real moments</WFCallout>
      </div>
    </WFBrowser>
  );
}

function MarketingV2() {
  return (
    <WFBrowser url="icetrack.app">
      <div style={{ height: '100%', background: WF.paper, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '14px 30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1.5px solid ${WF.ink}`, background: '#fff' }}>
          <WFLogo size={16} />
          <div style={{ display: 'flex', gap: 16, fontSize: 12, color: WF.inkSoft }}>
            <span>Parents</span><span>Coaches</span><span>Schools</span><span>Pricing</span>
          </div>
          <button className="wf-btn wf-btn-primary" style={{ padding: '5px 12px', fontSize: 12 }}>Sign in →</button>
        </div>
        {/* Big editorial hero */}
        <div style={{ flex: 1, padding: '40px 50px 30px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 30, right: 50, fontFamily: WF.mono, fontSize: 10, color: WF.muted, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
            Issue 01 · Spring 2026 — Indiana University I400 capstone
          </div>
          <div className="wf-h1" style={{ fontSize: 110, lineHeight: 0.85, letterSpacing: '-0.02em', maxWidth: 720 }}>
            The skating school,<br/>
            <span style={{ color: 'var(--wf-accent)', fontStyle: 'italic' }}>finally</span> in one place.
          </div>
          <div style={{ position: 'absolute', bottom: 30, left: 50, right: 50, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 30 }}>
            <div className="wf-hand" style={{ fontSize: 14, color: WF.inkSoft, lineHeight: 1.5, maxWidth: 280 }}>
              Built at Indiana University by skaters, for skaters. Roster, attendance, skills, and the spring show — all on one rink-friendly app.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
                <span className="wf-h1" style={{ fontSize: 32, color: 'var(--wf-accent)' }}>53</span>
                <span className="wf-hand" style={{ fontSize: 13 }}>tracked skills</span>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
                <span className="wf-h1" style={{ fontSize: 32, color: 'var(--wf-accent)' }}>8</span>
                <span className="wf-hand" style={{ fontSize: 13 }}>skating levels</span>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
                <span className="wf-h1" style={{ fontSize: 32, color: 'var(--wf-accent)' }}>3</span>
                <span className="wf-hand" style={{ fontSize: 13 }}>roles, one app</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
              <button className="wf-btn wf-btn-primary" style={{ padding: '10px 20px' }}>Get started — free →</button>
              <span className="wf-callout">no credit card needed ↗</span>
            </div>
          </div>
          {/* Decorative skate blade */}
          <svg width="280" height="100" viewBox="0 0 280 100" style={{ position: 'absolute', top: 30, right: 50 }}>
            <path d="M10 80 Q 80 78, 160 78 L 250 78 Q 270 78, 268 90 L 30 90 Z" fill="var(--wf-accent)" stroke={WF.ink} strokeWidth="1.5" />
            <line x1="20" y1="78" x2="260" y2="78" stroke={WF.ink} strokeWidth="1.5" />
          </svg>
        </div>
      </div>
      <div style={{ position: 'absolute', top: 60, left: 60 }}>
        <WFCallout rotate={-2}>editorial / magazine vibe ↘</WFCallout>
      </div>
    </WFBrowser>
  );
}

Object.assign(window, { ShowScheduleV1, ShowScheduleV2, MarketingV1, MarketingV2 });
