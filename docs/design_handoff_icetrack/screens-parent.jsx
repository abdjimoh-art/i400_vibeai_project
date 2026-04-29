// Parent dashboard — 2 variations.
// V1: skater-card focused (warm, photo-forward, celebrates progress).
// V2: timeline / activity feed (compact, scannable).

function ParentDashV1() {
  return (
    <WFBrowser url="icetrack.app/parent">
      <div style={{ height: '100%', display: 'grid', gridTemplateColumns: '200px 1fr', background: WF.paper }}>
        {/* Sidebar */}
        <div style={{ padding: 16, borderRight: `1.5px solid ${WF.ink}`, background: '#fff' }}>
          <WFLogo size={16} />
          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <WFNavItem icon="⌂" label="Overview" active />
            <WFNavItem icon="⛸" label="My Skaters" />
            <WFNavItem icon="📅" label="Classes" />
            <WFNavItem icon="★" label="Skills" />
            <WFNavItem icon="🎭" label="Show" />
          </div>
          <div style={{ marginTop: 'auto', position: 'absolute', bottom: 16, fontSize: 11, color: WF.muted }}>
            <div className="wf-hand">Logged in as</div>
            <div style={{ fontWeight: 700, color: WF.ink }}>Sarah Mitchell</div>
          </div>
        </div>
        {/* Main */}
        <div style={{ padding: 24, overflow: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
            <div>
              <div className="wf-h1" style={{ fontSize: 32 }}>Hi Sarah! ☀</div>
              <div style={{ fontSize: 13, color: WF.muted }}>Spring 2026 · 2 skaters enrolled</div>
            </div>
            <button className="wf-btn">+ Add skater</button>
          </div>

          {/* Skater cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
            {[
              { name: 'Emma', level: 'Level 2', progress: 5, total: 8, next: 'Tue 4:30pm' },
              { name: 'Leo', level: 'Tot 3', progress: 4, total: 6, next: 'Sat 9:00am' },
            ].map((s, i) => (
              <div key={i} className="wf-rough" style={{ background: '#fff', padding: 16, boxShadow: '3px 3px 0 ' + WF.ink }}>
                <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                  <WFPhoto label={s.name} width={56} height={56} style={{ borderRadius: '50%' }} />
                  <div style={{ flex: 1 }}>
                    <div className="wf-h2" style={{ fontSize: 20 }}>{s.name}</div>
                    <span className="wf-pill wf-pill-accent">{s.level}</span>
                  </div>
                </div>
                <div style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                    <span className="wf-hand">Skills passed</span>
                    <span className="wf-mono">{s.progress}/{s.total}</span>
                  </div>
                  <div style={{ height: 10, border: `1.5px solid ${WF.ink}`, borderRadius: 5, overflow: 'hidden', background: '#fff' }}>
                    <div style={{ width: `${s.progress / s.total * 100}%`, height: '100%', background: 'var(--wf-accent)' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: WF.inkSoft }}>
                  <span className="wf-mono" style={{ fontSize: 10 }}>NEXT CLASS</span>
                  <span className="wf-hand" style={{ fontWeight: 700 }}>{s.next}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Recent + show */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14 }}>
            <div className="wf-box" style={{ background: '#fff', padding: 16 }}>
              <div className="wf-h2" style={{ fontSize: 16, marginBottom: 10 }}>Recent skill passes 🎉</div>
              {[
                { name: 'Emma', skill: 'Forward swizzles (8)', date: 'Apr 22', new: true },
                { name: 'Leo', skill: 'Two-foot hop', date: 'Apr 18', new: false },
                { name: 'Emma', skill: 'One-foot glide (left)', date: 'Apr 15', new: false },
              ].map((r, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < 2 ? `1px dashed ${WF.pencil}` : 'none' }}>
                  <WFCheck on size={16} />
                  <div style={{ flex: 1, fontSize: 13 }}>
                    <span style={{ fontWeight: 700 }}>{r.name}</span> · {r.skill}
                  </div>
                  {r.new && <WFRibbon>NEW</WFRibbon>}
                  <span className="wf-mono" style={{ fontSize: 10, color: WF.muted }}>{r.date}</span>
                </div>
              ))}
            </div>
            <div className="wf-box" style={{ background: 'var(--wf-accent-soft)', padding: 16, borderColor: 'var(--wf-accent)' }}>
              <div className="wf-mono" style={{ fontSize: 10, color: 'var(--wf-accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>UPCOMING SHOW</div>
              <div className="wf-h2" style={{ fontSize: 18 }}>Spring Showcase</div>
              <div className="wf-hand" style={{ fontSize: 13, color: WF.inkSoft }}>"Under the Stars" theme</div>
              <div style={{ marginTop: 10, fontSize: 12 }}>📅 May 16 · 6:00 PM</div>
              <div style={{ fontSize: 12 }}>📍 Frank Southern, Zone A</div>
              <button className="wf-btn" style={{ marginTop: 10, fontSize: 12, padding: '5px 12px' }}>Practice schedule →</button>
            </div>
          </div>
        </div>
      </div>
      <div style={{ position: 'absolute', top: 90, left: 240 }}>
        <WFCallout rotate={-4}>↓ skater-first, warm</WFCallout>
      </div>
    </WFBrowser>
  );
}

function ParentDashV2() {
  return (
    <WFBrowser url="icetrack.app/parent">
      <div style={{ height: '100%', background: WF.paper, display: 'flex', flexDirection: 'column' }}>
        {/* Top nav */}
        <div style={{ padding: '12px 24px', borderBottom: `1.5px solid ${WF.ink}`, background: '#fff', display: 'flex', alignItems: 'center', gap: 24 }}>
          <WFLogo size={16} />
          <div style={{ display: 'flex', gap: 4 }}>
            {['Activity', 'Skaters', 'Schedule', 'Skills', 'Show'].map((l, i) => (
              <span key={l} className="wf-hand" style={{ padding: '4px 10px', fontSize: 13, borderBottom: i === 0 ? `2px solid var(--wf-accent)` : 'none', color: i === 0 ? 'var(--wf-accent)' : WF.inkSoft, fontWeight: i === 0 ? 700 : 400 }}>{l}</span>
            ))}
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10, fontSize: 12 }}>
            <span style={{ color: WF.muted }}>Sarah M.</span>
            <div className="wf-icon" style={{ borderRadius: '50%' }}>SM</div>
          </div>
        </div>

        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20, padding: 24, overflow: 'hidden' }}>
          {/* Timeline feed */}
          <div>
            <div className="wf-h1" style={{ fontSize: 26, marginBottom: 4 }}>This week on the ice</div>
            <div style={{ fontSize: 12, color: WF.muted, marginBottom: 16 }}>Apr 21 — Apr 27 · 2 classes attended · 3 skills passed</div>

            <div style={{ position: 'relative', paddingLeft: 22 }}>
              <div style={{ position: 'absolute', left: 7, top: 6, bottom: 6, width: 1.5, background: WF.pencil }} />
              {[
                { dot: 'var(--wf-accent)', when: 'Today', kind: 'pass', who: 'Emma', what: 'passed Forward swizzles (8)', detail: 'Coach Maya · Tue Level 2 class' },
                { dot: WF.green, when: 'Tue', kind: 'attend', who: 'Emma', what: 'attended Tue 4:30 Level 2', detail: '✓ Present · 6/6 in class today' },
                { dot: WF.ice, when: 'Sat', kind: 'pass', who: 'Leo', what: 'passed Two-foot hop', detail: 'Coach Ben · Sat Tot 3 class' },
                { dot: WF.green, when: 'Sat', kind: 'attend', who: 'Leo', what: 'attended Sat 9:00 Tot 3', detail: '✓ Present · 4/5 in class' },
                { dot: WF.muted, when: 'Apr 18', kind: 'note', who: '', what: 'Show practice scheduled', detail: 'Spring Showcase · Group B · May 9, 2:00pm' },
              ].map((e, i) => (
                <div key={i} style={{ position: 'relative', marginBottom: 12 }}>
                  <div style={{ position: 'absolute', left: -22, top: 6, width: 14, height: 14, borderRadius: '50%', background: e.dot, border: `1.5px solid ${WF.ink}` }} />
                  <div style={{ display: 'flex', gap: 12, alignItems: 'baseline' }}>
                    <span className="wf-mono" style={{ fontSize: 10, color: WF.muted, width: 50 }}>{e.when.toUpperCase()}</span>
                    <div style={{ flex: 1, padding: '8px 12px', border: `1.5px solid ${WF.ink}`, borderRadius: 5, background: '#fff' }}>
                      <div style={{ fontSize: 13 }}>
                        {e.who && <span style={{ fontWeight: 700 }}>{e.who} </span>}
                        {e.what}
                      </div>
                      <div style={{ fontSize: 11, color: WF.muted, marginTop: 2 }}>{e.detail}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right rail */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="wf-box" style={{ background: '#fff', padding: 12 }}>
              <div className="wf-mono" style={{ fontSize: 10, color: WF.muted, marginBottom: 8 }}>NEXT UP</div>
              <div className="wf-h2" style={{ fontSize: 16 }}>Tue 4:30 PM</div>
              <div style={{ fontSize: 12 }}>Emma · Level 2</div>
              <div style={{ fontSize: 11, color: WF.muted, marginTop: 4 }}>Coach Maya · Zone A</div>
              <div style={{ marginTop: 8, fontSize: 11 }}>in <span style={{ fontFamily: WF.mono, fontWeight: 700 }}>2d 3h</span></div>
            </div>
            <div className="wf-box" style={{ background: '#fff', padding: 12 }}>
              <div className="wf-mono" style={{ fontSize: 10, color: WF.muted, marginBottom: 8 }}>SKATERS</div>
              {[{ n: 'Emma', l: 'Lvl 2', p: '5/8' }, { n: 'Leo', l: 'Tot 3', p: '4/6' }].map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderTop: i > 0 ? `1px dashed ${WF.pencil}` : 'none' }}>
                  <WFPhoto label="" width={28} height={28} style={{ borderRadius: '50%' }} />
                  <div style={{ flex: 1, fontSize: 12 }}>
                    <div style={{ fontWeight: 700 }}>{s.n}</div>
                    <div style={{ fontSize: 10, color: WF.muted }}>{s.l} · {s.p}</div>
                  </div>
                  <span className="wf-arrow">→</span>
                </div>
              ))}
            </div>
            <div className="wf-box" style={{ padding: 12, background: 'var(--wf-accent-soft)', borderColor: 'var(--wf-accent)' }}>
              <div className="wf-h2" style={{ fontSize: 14 }}>🎭 Spring Showcase</div>
              <div style={{ fontSize: 11, marginTop: 4 }}>May 16 · 6 PM</div>
              <div style={{ fontSize: 11, color: WF.inkSoft }}>3 practices scheduled</div>
            </div>
          </div>
        </div>

        <div style={{ position: 'absolute', top: 70, right: 320 }}>
          <WFCallout rotate={-3}>← timeline = scannable, mobile-friendly later</WFCallout>
        </div>
      </div>
    </WFBrowser>
  );
}

Object.assign(window, { ParentDashV1, ParentDashV2 });
