// Sketchy wireframe primitives — low-fi, hand-drawn-ish UI atoms.
// All components are stateless. Use these to compose wireframe screens.

const WF = {
  ink: '#1a1a1a',
  inkSoft: '#3a3a3a',
  muted: '#8a8580',
  pencil: '#b8b3ac',
  paper: '#fafaf7',
  accent: '#7B1113',  // IU crimson
  ice: '#5b8dbe',     // cool accent
  warm: '#d4a574',    // warm accent
  yellow: '#f4d35e',
  green: '#8fb98b',
  display: "'Caveat', 'Bradley Hand', cursive",
  hand: "'Kalam', 'Marker Felt', cursive",
  body: "'Patrick Hand', 'Comic Sans MS', cursive",
  mono: "'JetBrains Mono', 'Courier New', monospace",
};

// Inject sketchy global styles once
if (typeof document !== 'undefined' && !document.getElementById('wf-styles')) {
  const s = document.createElement('style');
  s.id = 'wf-styles';
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&family=Kalam:wght@300;400;700&family=Patrick+Hand&family=JetBrains+Mono:wght@400;500&display=swap');

    .wf-screen { font-family: ${WF.body}; color: ${WF.ink}; background: ${WF.paper}; position: relative; overflow: hidden; }
    .wf-screen * { box-sizing: border-box; }
    .wf-h1 { font-family: ${WF.display}; font-weight: 700; line-height: 1; letter-spacing: -0.01em; }
    .wf-h2 { font-family: ${WF.display}; font-weight: 600; line-height: 1.05; }
    .wf-hand { font-family: ${WF.hand}; }
    .wf-mono { font-family: ${WF.mono}; }

    .wf-box { border: 1.5px solid ${WF.ink}; border-radius: 4px; background: ${WF.paper}; }
    .wf-box-soft { border: 1.5px dashed ${WF.pencil}; border-radius: 4px; background: transparent; }
    .wf-box-fill { border: 1.5px solid ${WF.ink}; border-radius: 4px; background: #fff; }
    .wf-rough { border: 1.5px solid ${WF.ink}; border-radius: 6px 4px 7px 5px / 4px 6px 5px 7px; }

    .wf-btn { font-family: ${WF.hand}; font-weight: 700; border: 1.5px solid ${WF.ink}; padding: 8px 18px; background: #fff; border-radius: 6px 4px 7px 5px / 4px 6px 5px 7px; display: inline-flex; align-items: center; gap: 6px; cursor: pointer; box-shadow: 2px 2px 0 ${WF.ink}; }
    .wf-btn-primary { background: var(--wf-accent, ${WF.accent}); color: #fff; box-shadow: 2px 2px 0 ${WF.ink}; }
    .wf-btn-ghost { background: transparent; box-shadow: none; border-style: dashed; }

    .wf-input { border: 1.5px solid ${WF.ink}; background: #fff; padding: 8px 10px; border-radius: 4px; font-family: ${WF.body}; font-size: 14px; width: 100%; }
    .wf-input::placeholder { color: ${WF.pencil}; }

    .wf-line { height: 1.5px; background: ${WF.ink}; }
    .wf-line-soft { height: 1px; background: ${WF.pencil}; }

    .wf-scribble-bg { background-image: repeating-linear-gradient(45deg, ${WF.pencil} 0 1px, transparent 1px 6px); }
    .wf-stripe-bg { background-image: repeating-linear-gradient(135deg, rgba(0,0,0,0.06) 0 6px, transparent 6px 12px); }

    .wf-pill { display: inline-flex; align-items: center; gap: 4px; padding: 2px 10px; border: 1.5px solid ${WF.ink}; border-radius: 999px; background: #fff; font-family: ${WF.hand}; font-size: 12px; font-weight: 700; }
    .wf-pill-accent { background: var(--wf-accent, ${WF.accent}); color: #fff; }
    .wf-pill-ice { background: ${WF.ice}; color: #fff; }
    .wf-pill-green { background: ${WF.green}; color: #fff; }
    .wf-pill-yellow { background: ${WF.yellow}; }

    .wf-check { display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; border: 1.5px solid ${WF.ink}; border-radius: 4px; background: #fff; }
    .wf-check.on { background: var(--wf-accent, ${WF.accent}); color: #fff; }

    .wf-callout { font-family: ${WF.display}; color: var(--wf-accent, ${WF.accent}); font-size: 14px; transform: rotate(-2deg); display: inline-block; }
    .wf-arrow { font-family: ${WF.display}; color: ${WF.muted}; font-size: 18px; }

    .wf-photo { background: ${WF.paper}; border: 1.5px solid ${WF.ink}; position: relative; overflow: hidden; }
    .wf-photo::before { content: ''; position: absolute; inset: 0; background-image: repeating-linear-gradient(45deg, rgba(0,0,0,0.08) 0 1px, transparent 1px 8px); }
    .wf-photo::after { content: attr(data-label); position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-family: ${WF.mono}; font-size: 10px; color: ${WF.muted}; text-transform: uppercase; letter-spacing: 0.08em; padding: 4px; text-align: center; }

    .wf-icon { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border: 1.5px solid ${WF.ink}; border-radius: 6px; background: #fff; font-family: ${WF.mono}; font-size: 11px; }

    .wf-tag { display: inline-block; padding: 1px 6px; border: 1px solid ${WF.muted}; border-radius: 3px; font-family: ${WF.mono}; font-size: 10px; color: ${WF.muted}; text-transform: uppercase; letter-spacing: 0.06em; }

    .wf-grid-bg { background-image: linear-gradient(${WF.pencil}33 1px, transparent 1px), linear-gradient(90deg, ${WF.pencil}33 1px, transparent 1px); background-size: 24px 24px; }
    .wf-dot-bg { background-image: radial-gradient(${WF.pencil}55 1px, transparent 1.2px); background-size: 16px 16px; }

    .wf-arrow-svg { stroke: ${WF.ink}; stroke-width: 1.5; fill: none; stroke-linecap: round; stroke-linejoin: round; }

    /* tweakable theme variables */
    .wf-theme-crimson { --wf-accent: ${WF.accent}; --wf-accent-soft: #f4e4e5; }
    .wf-theme-ice { --wf-accent: ${WF.ice}; --wf-accent-soft: #e3edf6; }
    .wf-theme-warm { --wf-accent: ${WF.warm}; --wf-accent-soft: #f7ecdb; }

    /* density */
    .wf-density-cozy { --wf-pad: 18px; --wf-gap: 14px; }
    .wf-density-compact { --wf-pad: 10px; --wf-gap: 8px; }
  `;
  document.head.appendChild(s);
}

// Browser chrome for desktop wireframes
function WFBrowser({ url = 'icetrack.app', children, style }) {
  return (
    <div className="wf-screen" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', ...style }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderBottom: `1.5px solid ${WF.ink}`, background: '#f0ece4' }}>
        <div style={{ display: 'flex', gap: 5 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', border: `1.5px solid ${WF.ink}`, background: '#fff' }} />
          <span style={{ width: 10, height: 10, borderRadius: '50%', border: `1.5px solid ${WF.ink}`, background: '#fff' }} />
          <span style={{ width: 10, height: 10, borderRadius: '50%', border: `1.5px solid ${WF.ink}`, background: '#fff' }} />
        </div>
        <div style={{ flex: 1, height: 22, border: `1.5px solid ${WF.ink}`, borderRadius: 4, background: '#fff', display: 'flex', alignItems: 'center', padding: '0 10px', fontFamily: WF.mono, fontSize: 11, color: WF.muted }}>
          {url}
        </div>
      </div>
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>{children}</div>
    </div>
  );
}

// Phone chrome
function WFPhone({ children, style }) {
  return (
    <div className="wf-screen" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 28, border: `2px solid ${WF.ink}`, padding: 8, background: WF.paper, ...style }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 18px', fontFamily: WF.mono, fontSize: 10, color: WF.inkSoft }}>
        <span>9:41</span>
        <span style={{ width: 60, height: 14, borderRadius: 8, background: WF.ink }} />
        <span>•••</span>
      </div>
      <div style={{ flex: 1, overflow: 'hidden', borderRadius: 22, border: `1px solid ${WF.pencil}`, background: WF.paper, position: 'relative' }}>{children}</div>
    </div>
  );
}

// Tablet (landscape) — for instructor rink-side use
function WFTablet({ children, style }) {
  return (
    <div className="wf-screen" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 18, border: `2px solid ${WF.ink}`, padding: 10, background: WF.paper, ...style }}>
      <div style={{ flex: 1, overflow: 'hidden', borderRadius: 12, border: `1px solid ${WF.pencil}`, background: WF.paper, position: 'relative' }}>{children}</div>
    </div>
  );
}

// Sketchy logo
function WFLogo({ size = 18, withText = true }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
      <svg width={size + 4} height={size + 4} viewBox="0 0 24 24" className="wf-arrow-svg">
        {/* skate blade silhouette */}
        <path d="M5 18 Q 8 16, 12 16 L 20 16 Q 21 16, 20 18 L 6 18 Z" fill={`var(--wf-accent, ${WF.accent})`} stroke={WF.ink} />
        <path d="M9 16 L 11 6 L 13 6 L 12 16" stroke={WF.ink} fill="#fff" />
        <circle cx="6" cy="18" r="1" fill={WF.ink} />
        <circle cx="19" cy="18" r="1" fill={WF.ink} />
      </svg>
      {withText && <span className="wf-h2" style={{ fontSize: size + 4 }}>IceTrack</span>}
    </span>
  );
}

// Annotation arrows / callouts for wireframe explanations
function WFCallout({ children, rotate = -3, color, style }) {
  return (
    <span className="wf-callout" style={{ transform: `rotate(${rotate}deg)`, color: color || `var(--wf-accent, ${WF.accent})`, ...style }}>
      {children}
    </span>
  );
}

// Small "wireframe mock-photo" placeholder
function WFPhoto({ label = 'photo', width = 80, height = 80, style }) {
  return <div className="wf-photo" data-label={label} style={{ width, height, borderRadius: 4, ...style }} />;
}

// Skill checkbox
function WFCheck({ on = false, label, size = 16 }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: WF.body, fontSize: 13 }}>
      <span className={`wf-check${on ? ' on' : ''}`} style={{ width: size, height: size, fontSize: size - 4 }}>
        {on && <svg width={size - 4} height={size - 4} viewBox="0 0 12 12"><path d="M2 6 L 5 9 L 10 3" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>}
      </span>
      {label && <span>{label}</span>}
    </span>
  );
}

// A "sketchy nav" sidebar
function WFNavItem({ icon, label, active, density = 'cozy' }) {
  const pad = density === 'compact' ? '6px 8px' : '8px 10px';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: pad, borderRadius: 5,
      background: active ? `var(--wf-accent-soft, ${WF.accent}22)` : 'transparent',
      border: active ? `1.5px solid var(--wf-accent, ${WF.accent})` : '1.5px solid transparent',
      fontFamily: WF.hand, fontSize: 14, fontWeight: active ? 700 : 400,
      color: active ? `var(--wf-accent, ${WF.accent})` : WF.ink,
    }}>
      <span className="wf-icon" style={{ width: 22, height: 22, fontSize: 11, borderColor: active ? `var(--wf-accent, ${WF.accent})` : WF.ink }}>{icon}</span>
      <span>{label}</span>
    </div>
  );
}

// Curvy hand-drawn arrow (for callouts between elements)
function WFArrowSVG({ from, to, curve = 30, label, style }) {
  const [x1, y1] = from;
  const [x2, y2] = to;
  const cx = (x1 + x2) / 2 + curve;
  const cy = (y1 + y2) / 2 - curve;
  return (
    <svg style={{ position: 'absolute', inset: 0, pointerEvents: 'none', ...style }} width="100%" height="100%">
      <path d={`M ${x1} ${y1} Q ${cx} ${cy}, ${x2} ${y2}`} className="wf-arrow-svg" />
      <path d={`M ${x2} ${y2} L ${x2 - 6} ${y2 - 4} M ${x2} ${y2} L ${x2 - 4} ${y2 + 6}`} className="wf-arrow-svg" />
      {label && <text x={cx} y={cy - 6} fontFamily={WF.display} fontSize="13" fill={WF.accent}>{label}</text>}
    </svg>
  );
}

// Skill ribbon for celebration moments
function WFRibbon({ children, color }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px',
      background: color || `var(--wf-accent, ${WF.accent})`, color: '#fff',
      fontFamily: WF.display, fontWeight: 700, fontSize: 14,
      clipPath: 'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)',
      paddingLeft: 14, paddingRight: 14,
    }}>{children}</span>
  );
}

// Export to window
Object.assign(window, {
  WF, WFBrowser, WFPhone, WFTablet, WFLogo, WFCallout, WFPhoto, WFCheck, WFNavItem, WFArrowSVG, WFRibbon,
});
