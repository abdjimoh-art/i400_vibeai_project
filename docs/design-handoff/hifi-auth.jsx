// Auth — hi-fi: Login B (split brand hero) + Register B (multi-step / role-first)

function ITLoginHiFi() {
  return (
    <ITBrowser url="icetrack.app/login">
      <div style={{ height: '100%', display: 'grid', gridTemplateColumns: '1.05fr 1fr' }}>
        {/* Left brand hero */}
        <div style={{ background: `linear-gradient(160deg, ${IT.iceDeep} 0%, ${IT.ice} 60%, #4f9bd5 100%)`, color: '#fff', padding: 44, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          {/* Decorative arcs */}
          <svg style={{ position: 'absolute', inset: 0, opacity: 0.18 }} viewBox="0 0 600 700" preserveAspectRatio="none">
            <path d="M-50 400 Q 200 200, 400 350 T 700 320" stroke="#fff" strokeWidth="1.5" fill="none" />
            <path d="M-50 460 Q 200 280, 400 410 T 700 380" stroke="#fff" strokeWidth="1.2" fill="none" />
            <path d="M-50 520 Q 200 360, 400 470 T 700 440" stroke="#fff" strokeWidth="1" fill="none" />
            <circle cx="520" cy="120" r="80" stroke="#fff" strokeWidth="1" fill="none" opacity="0.4" />
            <circle cx="520" cy="120" r="50" stroke="#fff" strokeWidth="1" fill="none" opacity="0.5" />
          </svg>
          <ITLogo size={18} color="#fff" />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div className="it-eyebrow" style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 14 }}>Frank Southern Ice Arena · Bloomington, IN</div>
            <h1 style={{ fontSize: 56, color: '#fff', fontWeight: 300, letterSpacing: '-0.03em', lineHeight: 0.95 }}>
              One rink.<br/>
              <span style={{ fontStyle: 'italic', fontWeight: 400 }}>Every skater.</span>
            </h1>
            <p style={{ marginTop: 18, fontSize: 15, color: 'rgba(255,255,255,0.85)', maxWidth: 360, lineHeight: 1.5 }}>
              Roster, attendance, skill passes, and the spring show — together for the first time. Built at Indiana University.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 24, position: 'relative', zIndex: 1 }}>
            <div>
              <div style={{ fontFamily: IT.display, fontSize: 28, fontWeight: 400 }}>53</div>
              <div className="it-eyebrow" style={{ color: 'rgba(255,255,255,0.7)' }}>Skills tracked</div>
            </div>
            <div>
              <div style={{ fontFamily: IT.display, fontSize: 28, fontWeight: 400 }}>8</div>
              <div className="it-eyebrow" style={{ color: 'rgba(255,255,255,0.7)' }}>Skating levels</div>
            </div>
            <div>
              <div style={{ fontFamily: IT.display, fontSize: 28, fontWeight: 400 }}>3</div>
              <div className="it-eyebrow" style={{ color: 'rgba(255,255,255,0.7)' }}>Roles, one app</div>
            </div>
          </div>
        </div>

        {/* Right form */}
        <div style={{ padding: 44, display: 'flex', flexDirection: 'column', justifyContent: 'center', background: IT.surface, position: 'relative' }}>
          <div style={{ maxWidth: 320 }}>
            <h2 style={{ fontSize: 28, fontWeight: 400, marginBottom: 6 }}>Welcome back</h2>
            <p style={{ fontSize: 14, color: IT.muted, marginBottom: 28 }}>Sign in to your IceTrack dashboard.</p>

            <div style={{ marginBottom: 14 }}>
              <label className="it-label">Email</label>
              <input className="it-input" defaultValue="sarah.mitchell@iu.edu" />
            </div>
            <div style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <label className="it-label">Password</label>
                <a style={{ fontSize: 12, color: IT.ice, textDecoration: 'none' }}>Forgot?</a>
              </div>
              <input className="it-input" type="password" defaultValue="••••••••••" />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: IT.inkSoft, margin: '14px 0 22px' }}>
              <span style={{ width: 16, height: 16, borderRadius: 4, border: `1.5px solid ${IT.ice}`, background: IT.ice, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <ITIcon name="check" size={11} color="#fff" />
              </span>
              Keep me signed in
            </label>
            <button className="it-btn it-btn-primary it-btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
              Sign in <ITIcon name="arrow-right" size={14} color="#fff" />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '20px 0' }}>
              <div style={{ flex: 1, height: 1, background: IT.hairline }} />
              <span style={{ fontSize: 11, color: IT.muted, fontFamily: IT.mono, textTransform: 'uppercase', letterSpacing: '0.08em' }}>or</span>
              <div style={{ flex: 1, height: 1, background: IT.hairline }} />
            </div>
            <button className="it-btn" style={{ width: '100%', justifyContent: 'center' }}>
              Continue with IU SSO
            </button>
            <p style={{ fontSize: 13, color: IT.muted, marginTop: 24, textAlign: 'center' }}>
              New to IceTrack? <span style={{ color: IT.ice, fontWeight: 500 }}>Create an account →</span>
            </p>
          </div>
        </div>
      </div>
    </ITBrowser>
  );
}

function ITRegisterHiFi() {
  return (
    <ITBrowser url="icetrack.app/register">
      <div style={{ height: '100%', display: 'grid', gridTemplateColumns: '260px 1fr', background: IT.paper }}>
        <div style={{ padding: 28, borderRight: `1px solid ${IT.hairline}`, background: IT.surface, display: 'flex', flexDirection: 'column' }}>
          <ITLogo size={16} />
          <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[
              { n: 1, t: 'Choose your role', s: 'Parent or instructor', state: 'active' },
              { n: 2, t: 'Your details', s: 'Name, email, password', state: 'pending' },
              { n: 3, t: 'Verify email', s: 'Quick confirmation', state: 'pending' },
            ].map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 0' }}>
                <div style={{
                  width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: step.state === 'active' ? IT.ice : IT.surface2, color: step.state === 'active' ? '#fff' : IT.muted,
                  border: `1px solid ${step.state === 'active' ? IT.ice : IT.hairline}`, fontFamily: IT.mono, fontSize: 12, fontWeight: 600, flexShrink: 0,
                }}>{step.n}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: step.state === 'active' ? IT.ink : IT.muted }}>{step.t}</div>
                  <div style={{ fontSize: 12, color: IT.muted }}>{step.s}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 'auto', padding: 12, background: IT.iceTint, border: `1px solid ${IT.iceSoft}`, borderRadius: IT.rMd, fontSize: 12, color: IT.iceDeep, lineHeight: 1.45 }}>
            <strong>Admin?</strong> Admin accounts are created by IU staff. Stop by the rink office or email <span className="it-mono">icetrack@iu.edu</span>.
          </div>
        </div>

        <div style={{ padding: 44, overflow: 'auto' }}>
          <div className="it-eyebrow" style={{ marginBottom: 8 }}>Step 1 of 3</div>
          <h1 style={{ fontSize: 36, fontWeight: 400, marginBottom: 6 }}>Who's this account for?</h1>
          <p style={{ fontSize: 14, color: IT.muted, marginBottom: 28, maxWidth: 460 }}>
            Pick the role that fits — you can add skaters and link family members in the next steps.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, maxWidth: 640 }}>
            <div className="it-card" style={{ padding: 22, borderColor: IT.ice, boxShadow: `0 0 0 3px ${IT.ice}22, ${IT.shadowLift}`, position: 'relative' }}>
              <div style={{ position: 'absolute', top: 14, right: 14, width: 22, height: 22, borderRadius: '50%', background: IT.ice, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ITIcon name="check" size={12} color="#fff" />
              </div>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: IT.iceSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <ITIcon name="users" size={22} color={IT.iceDeep} />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 500, marginBottom: 4 }}>I'm a parent</h3>
              <p style={{ fontSize: 13, color: IT.inkSoft, lineHeight: 1.5 }}>Enroll your child, follow their skill progress, and stay on top of show practices.</p>
            </div>
            <div className="it-card" style={{ padding: 22, cursor: 'pointer' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: IT.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <ITIcon name="star" size={22} color={IT.inkSoft} />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 500, marginBottom: 4 }}>I'm an instructor</h3>
              <p style={{ fontSize: 13, color: IT.inkSoft, lineHeight: 1.5 }}>Take attendance, mark skill passes, and manage your weekly classes from the rink.</p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 36, maxWidth: 640 }}>
            <a style={{ fontSize: 13, color: IT.muted }}>Already have an account? <span style={{ color: IT.ice, fontWeight: 500 }}>Sign in</span></a>
            <button className="it-btn it-btn-primary it-btn-lg">Continue <ITIcon name="arrow-right" size={14} color="#fff" /></button>
          </div>
        </div>
      </div>
    </ITBrowser>
  );
}

Object.assign(window, { ITLoginHiFi, ITRegisterHiFi });
