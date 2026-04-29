// Auth screens — Login + Register, 2 variations each.
// V1: classic centered card. V2: split-screen with rink imagery.

function AuthLoginV1() {
  return (
    <WFBrowser url="icetrack.app/login">
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }} className="wf-dot-bg">
        <div className="wf-rough" style={{ background: '#fff', padding: 32, width: 340, boxShadow: '4px 4px 0 ' + WF.ink }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <WFLogo size={20} />
            <div className="wf-mono" style={{ fontSize: 10, color: WF.muted, marginTop: 6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Frank Southern Ice Arena</div>
          </div>
          <div className="wf-h2" style={{ fontSize: 22, marginBottom: 18 }}>Welcome back, skater!</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <div className="wf-hand" style={{ fontSize: 12, marginBottom: 4 }}>Email</div>
              <div className="wf-input" style={{ color: WF.pencil }}>jane@example.com</div>
            </div>
            <div>
              <div className="wf-hand" style={{ fontSize: 12, marginBottom: 4 }}>Password</div>
              <div className="wf-input" style={{ color: WF.pencil }}>••••••••</div>
            </div>
            <button className="wf-btn wf-btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 6 }}>Log In →</button>
            <div style={{ textAlign: 'center', fontSize: 12, color: WF.muted, marginTop: 6 }}>
              New here? <span style={{ color: 'var(--wf-accent)', fontWeight: 700 }}>Register</span>
            </div>
          </div>
        </div>
        <div style={{ position: 'absolute', top: 60, right: 80 }}>
          <WFCallout rotate={6}>↙ classic centered card</WFCallout>
        </div>
      </div>
    </WFBrowser>
  );
}

function AuthLoginV2() {
  return (
    <WFBrowser url="icetrack.app/login">
      <div style={{ height: '100%', display: 'grid', gridTemplateColumns: '1.1fr 1fr' }}>
        {/* Left: hero */}
        <div style={{ background: 'var(--wf-accent)', color: '#fff', padding: 40, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }} className="wf-stripe-bg">
          <WFLogo size={20} />
          <div>
            <div className="wf-h1" style={{ fontSize: 44, color: '#fff', marginBottom: 10 }}>One rink.<br/>Every skater.</div>
            <div className="wf-hand" style={{ fontSize: 14, opacity: 0.9, maxWidth: 300 }}>Skating school admin for parents, instructors & staff at Frank Southern Ice Arena.</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <span className="wf-pill" style={{ background: '#fff', color: WF.ink }}>⛸ 8 levels</span>
            <span className="wf-pill" style={{ background: '#fff', color: WF.ink }}>53 skills</span>
          </div>
          <div style={{ position: 'absolute', bottom: -30, right: -30, width: 180, height: 180, border: `2px dashed #fff8`, borderRadius: '50%' }} />
        </div>
        {/* Right: form */}
        <div style={{ padding: 40, display: 'flex', flexDirection: 'column', justifyContent: 'center', background: WF.paper }}>
          <div className="wf-h2" style={{ fontSize: 24, marginBottom: 4 }}>Sign in</div>
          <div style={{ fontSize: 12, color: WF.muted, marginBottom: 20 }}>Continue to your dashboard</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 280 }}>
            <div className="wf-input" style={{ color: WF.pencil }}>email</div>
            <div className="wf-input" style={{ color: WF.pencil }}>password</div>
            <button className="wf-btn wf-btn-primary" style={{ justifyContent: 'center' }}>Log In</button>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: WF.muted }}>
              <span>Forgot password?</span>
              <span style={{ color: 'var(--wf-accent)', fontWeight: 700 }}>Register →</span>
            </div>
          </div>
        </div>
        <div style={{ position: 'absolute', top: 80, left: '52%' }}>
          <WFCallout rotate={-4}>← brand moment + value prop</WFCallout>
        </div>
      </div>
    </WFBrowser>
  );
}

function AuthRegisterV1() {
  return (
    <WFBrowser url="icetrack.app/register">
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 30 }} className="wf-dot-bg">
        <div className="wf-rough" style={{ background: '#fff', padding: 28, width: 360, boxShadow: '4px 4px 0 ' + WF.ink }}>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <WFLogo size={18} />
          </div>
          <div className="wf-h2" style={{ fontSize: 20, marginBottom: 14 }}>Create your account</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div className="wf-input" style={{ color: WF.pencil }}>Full name</div>
            <div className="wf-input" style={{ color: WF.pencil }}>Email</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div className="wf-input" style={{ color: WF.pencil }}>password</div>
              <div className="wf-input" style={{ color: WF.pencil }}>confirm</div>
            </div>
            <div>
              <div className="wf-hand" style={{ fontSize: 12, marginBottom: 6 }}>I am a...</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div className="wf-box" style={{ padding: 10, textAlign: 'center', borderColor: 'var(--wf-accent)', background: 'var(--wf-accent-soft)' }}>
                  <div style={{ fontSize: 18 }}>👨‍👩‍👧</div>
                  <div className="wf-hand" style={{ fontWeight: 700, color: 'var(--wf-accent)' }}>Parent</div>
                </div>
                <div className="wf-box-soft" style={{ padding: 10, textAlign: 'center' }}>
                  <div style={{ fontSize: 18 }}>🏒</div>
                  <div className="wf-hand">Instructor</div>
                </div>
              </div>
            </div>
            <button className="wf-btn wf-btn-primary" style={{ justifyContent: 'center', marginTop: 4 }}>Register</button>
          </div>
        </div>
        <div style={{ position: 'absolute', bottom: 80, right: 60 }}>
          <WFCallout rotate={4}>role toggle = clear ↗</WFCallout>
        </div>
      </div>
    </WFBrowser>
  );
}

function AuthRegisterV2() {
  return (
    <WFBrowser url="icetrack.app/register">
      <div style={{ height: '100%', display: 'flex', padding: 30, gap: 20, background: WF.paper }} className="wf-grid-bg">
        {/* Stepper sidebar */}
        <div style={{ width: 200, padding: 16 }}>
          <WFLogo size={16} />
          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {['Pick role', 'Your details', 'Confirm'].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="wf-icon" style={{ width: 24, height: 24, background: i === 0 ? 'var(--wf-accent)' : '#fff', color: i === 0 ? '#fff' : WF.ink, borderColor: i === 0 ? 'var(--wf-accent)' : WF.ink, fontWeight: 700 }}>{i + 1}</div>
                <span className="wf-hand" style={{ fontSize: 13, fontWeight: i === 0 ? 700 : 400, color: i === 0 ? 'var(--wf-accent)' : WF.ink }}>{s}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 30, padding: 10, border: `1.5px dashed ${WF.pencil}`, borderRadius: 6, fontSize: 11, color: WF.muted, fontFamily: WF.hand }}>
            Admins are created by IU staff — ask the rink office.
          </div>
        </div>
        <div style={{ flex: 1, padding: 24, background: '#fff', border: `1.5px solid ${WF.ink}`, borderRadius: 6, boxShadow: '4px 4px 0 ' + WF.ink }}>
          <div className="wf-h2" style={{ fontSize: 26, marginBottom: 4 }}>Who's this account for?</div>
          <div style={{ fontSize: 13, color: WF.muted, marginBottom: 24 }}>Pick one — you can add skaters later.</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="wf-box" style={{ padding: 18, borderColor: 'var(--wf-accent)', background: 'var(--wf-accent-soft)', minHeight: 160 }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>👨‍👩‍👧</div>
              <div className="wf-h2" style={{ fontSize: 18, color: 'var(--wf-accent)' }}>I'm a parent</div>
              <div style={{ fontSize: 12, color: WF.inkSoft, marginTop: 6 }}>Enroll my child, see progress, view show schedule.</div>
            </div>
            <div className="wf-box" style={{ padding: 18, minHeight: 160 }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>🏒</div>
              <div className="wf-h2" style={{ fontSize: 18 }}>I'm an instructor</div>
              <div style={{ fontSize: 12, color: WF.inkSoft, marginTop: 6 }}>Take attendance, mark skill passes, see my classes.</div>
            </div>
          </div>
          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: WF.muted }}>Already registered? <span style={{ color: 'var(--wf-accent)', fontWeight: 700 }}>Log in</span></span>
            <button className="wf-btn wf-btn-primary">Continue →</button>
          </div>
        </div>
        <div style={{ position: 'absolute', top: 50, right: 60 }}>
          <WFCallout rotate={5}>multi-step, less form fatigue ↘</WFCallout>
        </div>
      </div>
    </WFBrowser>
  );
}

Object.assign(window, { AuthLoginV1, AuthLoginV2, AuthRegisterV1, AuthRegisterV2 });
