// Marketing landing — hi-fi (Direction A: hero + stacked moments)

function ITMarketingHiFi() {
  return (
    <ITBrowser url="icetrack.app">
      <div style={{ height: '100%', overflow: 'auto', background: IT.paper }}>
        {/* Top nav */}
        <div style={{ position: 'sticky', top: 0, zIndex: 10, padding: '14px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)', borderBottom: `1px solid ${IT.hairlineSoft}` }}>
          <ITLogo size={15} />
          <div style={{ display: 'flex', gap: 22, alignItems: 'center' }}>
            {['For parents', 'For instructors', 'For rinks', 'About'].map(l => (
              <span key={l} style={{ fontSize: 13, color: IT.inkSoft }}>{l}</span>
            ))}
            <button className="it-btn it-btn-sm">Sign in</button>
            <button className="it-btn it-btn-primary it-btn-sm">Get started</button>
          </div>
        </div>

        {/* HERO */}
        <div style={{ padding: '60px 40px 40px', position: 'relative', overflow: 'hidden' }} className="it-bg-aurora">
          <svg style={{ position: 'absolute', inset: 0, opacity: 0.5, pointerEvents: 'none' }} viewBox="0 0 1200 600" preserveAspectRatio="none">
            <path d="M-50 460 Q 300 340, 600 420 T 1300 380" stroke={IT.ice} strokeWidth="1.5" fill="none" opacity="0.3" />
            <path d="M-50 500 Q 300 390, 600 460 T 1300 420" stroke={IT.ice} strokeWidth="1.2" fill="none" opacity="0.25" />
          </svg>
          <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 1fr', gap: 50, alignItems: 'center', maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
            <div>
              <span className="it-pill it-pill-ice" style={{ marginBottom: 18 }}>
                <ITIcon name="sparkle" size={11} color={IT.iceDeep} /> Built for Frank Southern Ice Arena
              </span>
              <h1 style={{ fontSize: 72, fontWeight: 300, letterSpacing: '-0.035em', lineHeight: 0.95 }}>
                Skating school,<br />
                <span style={{ fontStyle: 'italic', fontWeight: 400, color: IT.iceDeep }}>finally on one rink.</span>
              </h1>
              <p style={{ fontSize: 17, color: IT.inkSoft, marginTop: 22, lineHeight: 1.5, maxWidth: 460 }}>
                IceTrack pulls scheduling, attendance, skill passes, and the spring show into one place — so parents see progress, instructors save the clipboard for the rink, and admins skip the spreadsheet.
              </p>
              <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
                <button className="it-btn it-btn-primary it-btn-lg">Start free for parents <ITIcon name="arrow-right" size={14} color="#fff" /></button>
                <button className="it-btn it-btn-lg">Watch the 90s tour</button>
              </div>
              <div style={{ marginTop: 26, display: 'flex', gap: 22, fontSize: 12, color: IT.muted }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><ITIcon name="check" size={13} color={IT.spring} /> 8 levels · 53 skills</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><ITIcon name="check" size={13} color={IT.spring} /> Built at Indiana University</span>
              </div>
            </div>

            {/* Hero composition — stacked product peeks */}
            <div style={{ position: 'relative', height: 460 }}>
              {/* Back card — class card */}
              <div className="it-card" style={{ position: 'absolute', top: 0, right: 0, width: 280, padding: 16, transform: 'rotate(3deg)', boxShadow: IT.shadowLift }}>
                <div className="it-eyebrow">Tue 4:30 PM</div>
                <div style={{ fontSize: 18, fontFamily: IT.display, fontWeight: 500, marginTop: 4 }}>Level 2 · Zone A</div>
                <div style={{ marginTop: 10, display: 'flex', gap: 4 }}>
                  {[340, 200, 30, 150, 280].map((h, i) => <ITAvatar key={i} name={String.fromCharCode(65 + i) + 'X'} size={28} hue={h} />)}
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: IT.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: IT.muted, border: `1px solid ${IT.hairline}` }}>+1</div>
                </div>
              </div>
              {/* Middle — skill pass card */}
              <div className="it-card" style={{ position: 'absolute', top: 100, left: 0, width: 290, padding: 18, transform: 'rotate(-3deg)', boxShadow: IT.shadowLift, background: `linear-gradient(180deg, ${IT.crimsonSoft}, ${IT.surface})`, borderColor: IT.crimson + '33' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <ITIcon name="medal" size={16} color={IT.crimson} />
                  <span className="it-eyebrow" style={{ color: IT.crimson }}>Just passed</span>
                </div>
                <div style={{ fontFamily: IT.display, fontSize: 18, fontWeight: 500, color: IT.crimson, lineHeight: 1.2 }}>
                  Forward swizzles, eight in a row.
                </div>
                <div style={{ fontSize: 11, color: IT.muted, marginTop: 8 }}>Emma · Level 2 · Coach Maya</div>
              </div>
              {/* Front — progress ring */}
              <div className="it-card" style={{ position: 'absolute', bottom: 0, right: 30, width: 260, padding: 18, boxShadow: IT.shadowLift, transform: 'rotate(2deg)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ position: 'relative', width: 56, height: 56 }}>
                    <svg viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
                      <circle cx="50" cy="50" r="42" stroke={IT.hairlineSoft} strokeWidth="10" fill="none" />
                      <circle cx="50" cy="50" r="42" stroke={IT.ice} strokeWidth="10" fill="none" strokeLinecap="round" strokeDasharray={`${(5/8) * 264} 264`} />
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: IT.display, fontSize: 16, fontWeight: 500 }}>62%</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>Level 2 journey</div>
                    <div className="it-mono" style={{ fontSize: 11, color: IT.muted }}>5 of 8 skills</div>
                  </div>
                </div>
                <div style={{ marginTop: 12, display: 'flex', gap: 6 }}>
                  {[1,1,1,1,1,0,0,0].map((p,i)=>(
                    <div key={i} style={{ flex: 1, height: 6, borderRadius: 3, background: p ? IT.crimson : IT.hairlineSoft }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MOMENTS — three columns */}
        <div style={{ padding: '60px 40px', maxWidth: 1100, margin: '0 auto' }}>
          <div className="it-eyebrow" style={{ textAlign: 'center', marginBottom: 12 }}>Three roles · One source of truth</div>
          <h2 style={{ fontSize: 42, fontWeight: 400, textAlign: 'center', maxWidth: 720, margin: '0 auto 40px', letterSpacing: '-0.025em' }}>
            Built for the people who actually <span style={{ fontStyle: 'italic' }}>show up</span> to the rink.
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
            {[
              {
                role: 'For parents', icon: 'users', tone: 'crimson',
                title: 'See progress, not just pickup times.',
                bullets: ['Live skill journey per skater', 'Coach notes & micro-celebrations', 'Show practice schedule auto-synced'],
              },
              {
                role: 'For instructors', icon: 'star', tone: 'ice',
                title: 'Take attendance with one thumb.',
                bullets: ['Tablet-first roster, big tap targets', '53 Learn-to-Skate skills, by level', 'Notes go straight to parents'],
              },
              {
                role: 'For admins', icon: 'chart', tone: 'ink',
                title: 'No more spreadsheet Tetris.',
                bullets: ['Class CRUD with capacity guards', 'Enrollment & attendance reports', 'Show groups & practice planner'],
              },
            ].map((m, i) => (
              <div key={i} className="it-card" style={{ padding: 24 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: m.tone === 'crimson' ? IT.crimsonSoft : m.tone === 'ice' ? IT.iceSoft : IT.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                  <ITIcon name={m.icon} size={20} color={m.tone === 'crimson' ? IT.crimson : m.tone === 'ice' ? IT.iceDeep : IT.ink} />
                </div>
                <div className="it-eyebrow" style={{ marginBottom: 8 }}>{m.role}</div>
                <h3 style={{ fontSize: 22, fontWeight: 500, lineHeight: 1.15, marginBottom: 14, letterSpacing: '-0.015em' }}>{m.title}</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {m.bullets.map((b, j) => (
                    <li key={j} style={{ fontSize: 13, color: IT.inkSoft, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <ITIcon name="check" size={14} color={IT.spring} />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* CTA strip */}
        <div style={{ margin: '0 40px 60px', maxWidth: 1100, marginLeft: 'auto', marginRight: 'auto' }}>
          <div style={{ background: IT.ink, color: '#fff', borderRadius: IT.rXl, padding: '48px 44px', display: 'grid', gridTemplateColumns: '1.4fr 1fr', alignItems: 'center', gap: 32, position: 'relative', overflow: 'hidden' }}>
            <svg style={{ position: 'absolute', inset: 0, opacity: 0.18 }} viewBox="0 0 1000 280" preserveAspectRatio="none">
              <path d="M0 200 Q 250 80, 500 160 T 1000 130" stroke={IT.ice} strokeWidth="1.5" fill="none" />
              <path d="M0 230 Q 250 130, 500 200 T 1000 180" stroke={IT.ice} strokeWidth="1" fill="none" />
              <circle cx="880" cy="60" r="40" stroke={IT.ice} fill="none" />
              <circle cx="880" cy="60" r="60" stroke={IT.ice} fill="none" opacity="0.5" />
            </svg>
            <div style={{ position: 'relative' }}>
              <h2 style={{ fontSize: 36, color: '#fff', fontWeight: 300, letterSpacing: '-0.025em' }}>
                Ready to <span style={{ fontStyle: 'italic', color: IT.ice }}>retire the clipboard</span>?
              </h2>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 10, maxWidth: 380 }}>
                IceTrack is free for parents, free for instructors, and onboards your rink in an afternoon.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, position: 'relative' }}>
              <button className="it-btn it-btn-lg" style={{ background: IT.ice, borderColor: IT.ice, color: '#fff', justifyContent: 'center' }}>
                Create your account <ITIcon name="arrow-right" size={14} color="#fff" />
              </button>
              <button className="it-btn it-btn-lg" style={{ background: 'transparent', borderColor: 'rgba(255,255,255,0.25)', color: '#fff', justifyContent: 'center' }}>
                Talk to the IceTrack team
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '24px 40px 40px', borderTop: `1px solid ${IT.hairlineSoft}`, display: 'flex', justifyContent: 'space-between', fontSize: 12, color: IT.muted }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <ITLogo size={13} />
            <span>· An I400 capstone · Spring 2026</span>
          </div>
          <div style={{ display: 'flex', gap: 18 }}>
            <span>Privacy</span><span>Terms</span><span>Contact</span>
          </div>
        </div>
      </div>
    </ITBrowser>
  );
}

Object.assign(window, { ITMarketingHiFi });
