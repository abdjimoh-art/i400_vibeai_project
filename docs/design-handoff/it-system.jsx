// IceTrack hi-fi design system + tokens.
// Anchored on icy blue accent + IU crimson reserved for celebratory moments.
// Type: Instrument Serif (display, distinctive italic) + Geist (body) + Geist Mono (data).
// NOTE: project guidance says avoid Inter — pivoting to Sohne-like fallback
//       via Geist (next-friendly, also from Vercel ecosystem the repo uses).

const IT = {
  // Cool/neutral foundation — subtle icy whites, deep ink for text
  paper:    '#f7f9fb',   // app bg
  surface:  '#ffffff',   // cards
  surface2: '#f0f4f8',   // soft fills
  ink:      '#0c1a2b',   // primary text — deep navy-ink (not pure black)
  inkSoft:  '#324a63',
  muted:    '#6c8198',
  hairline: '#dde6ef',
  hairlineSoft: '#eaf0f6',

  // Accent system (icy blue primary)
  ice:        '#3b82c4',  // primary
  iceDeep:    '#1e5a91',
  iceSoft:    '#e3eef9',
  iceTint:    '#f1f7fc',

  // Accents — celebration moments
  crimson:    '#7B1113',  // IU — reserved for "passed!" wins, identity
  crimsonSoft:'#fae5e6',
  honey:      '#d4a651',  // medals, milestone
  honeySoft:  '#faf1de',
  spring:     '#3a9a76',  // attendance present
  springSoft: '#e3f1ec',
  rust:       '#c66b4a',  // absent
  rustSoft:   '#f9e5dc',

  // Type
  display: "'Instrument Serif', 'Charter', 'Iowan Old Style', Georgia, serif",
  body:    "'Geist', -apple-system, 'SF Pro Display', system-ui, sans-serif",
  mono:    "'Geist Mono', 'JetBrains Mono', ui-monospace, monospace",

  // Radii / shadow
  rSm: 6, rMd: 10, rLg: 14, rXl: 20,
  shadowCard: '0 1px 0 rgba(12,26,43,0.04), 0 1px 2px rgba(12,26,43,0.05)',
  shadowLift: '0 1px 0 rgba(12,26,43,0.04), 0 8px 28px -8px rgba(30,90,145,0.18)',
  shadowEdge: '0 0 0 1px #dde6ef',
};

// Inject global styles + Google Fonts once
if (typeof document !== 'undefined' && !document.getElementById('it-styles')) {
  const s = document.createElement('style');
  s.id = 'it-styles';
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500;600&display=swap');

    .it-app * { box-sizing: border-box; }
    .it-app { font-family: ${IT.body}; color: ${IT.ink}; background: ${IT.paper}; -webkit-font-smoothing: antialiased; line-height: 1.45; font-feature-settings: "ss01", "cv11"; }
    .it-app h1,.it-app h2,.it-app h3,.it-app h4 { font-family: ${IT.display}; font-weight: 400; letter-spacing: -0.015em; line-height: 1.0; margin: 0; color: ${IT.ink}; }
    .it-app h1 { font-weight: 400; }
    .it-app p { margin: 0; }
    .it-mono { font-family: ${IT.mono}; font-feature-settings: "ss01"; }
    .it-display { font-family: ${IT.display}; }

    /* Buttons */
    .it-btn { display: inline-flex; align-items: center; gap: 6px; font-family: ${IT.body}; font-weight: 500; font-size: 13px; padding: 8px 14px; border-radius: ${IT.rSm}px; border: 1px solid ${IT.hairline}; background: ${IT.surface}; color: ${IT.ink}; cursor: pointer; transition: all 0.15s; line-height: 1; }
    .it-btn:hover { border-color: ${IT.ink}33; background: ${IT.surface2}; }
    .it-btn-primary { background: ${IT.ice}; color: #fff; border-color: ${IT.ice}; box-shadow: 0 1px 0 ${IT.iceDeep}55, 0 4px 12px -4px ${IT.ice}55; }
    .it-btn-primary:hover { background: ${IT.iceDeep}; border-color: ${IT.iceDeep}; }
    .it-btn-ghost { background: transparent; border-color: transparent; color: ${IT.inkSoft}; }
    .it-btn-ghost:hover { background: ${IT.surface2}; color: ${IT.ink}; }
    .it-btn-sm { padding: 5px 10px; font-size: 12px; }
    .it-btn-lg { padding: 11px 20px; font-size: 14px; }

    /* Cards */
    .it-card { background: ${IT.surface}; border: 1px solid ${IT.hairline}; border-radius: ${IT.rLg}px; box-shadow: ${IT.shadowCard}; }
    .it-card-soft { background: ${IT.surface}; border: 1px solid ${IT.hairlineSoft}; border-radius: ${IT.rLg}px; }

    /* Pills / tags */
    .it-pill { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 999px; font-family: ${IT.body}; font-size: 11px; font-weight: 500; line-height: 1.5; background: ${IT.surface2}; color: ${IT.inkSoft}; border: 1px solid ${IT.hairline}; }
    .it-pill-ice { background: ${IT.iceSoft}; color: ${IT.iceDeep}; border-color: ${IT.iceDeep}22; }
    .it-pill-crimson { background: ${IT.crimsonSoft}; color: ${IT.crimson}; border-color: ${IT.crimson}22; }
    .it-pill-spring { background: ${IT.springSoft}; color: ${IT.spring}; border-color: ${IT.spring}33; }
    .it-pill-honey { background: ${IT.honeySoft}; color: #8b6a25; border-color: ${IT.honey}55; }
    .it-pill-solid-ice { background: ${IT.ice}; color: #fff; border-color: ${IT.ice}; }

    /* Inputs */
    .it-input { width: 100%; font-family: ${IT.body}; font-size: 14px; padding: 10px 12px; border-radius: ${IT.rSm}px; border: 1px solid ${IT.hairline}; background: ${IT.surface}; color: ${IT.ink}; outline: none; transition: border-color 0.15s, box-shadow 0.15s; }
    .it-input:focus { border-color: ${IT.ice}; box-shadow: 0 0 0 3px ${IT.ice}22; }
    .it-input::placeholder { color: ${IT.muted}; }
    .it-label { font-size: 12px; font-weight: 500; color: ${IT.inkSoft}; margin-bottom: 6px; display: block; }

    /* Microcopy / eyebrow */
    .it-eyebrow { font-family: ${IT.mono}; font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; color: ${IT.muted}; font-weight: 500; }

    /* Progress */
    .it-progress { height: 6px; border-radius: 999px; background: ${IT.hairlineSoft}; overflow: hidden; }
    .it-progress > span { display: block; height: 100%; background: ${IT.ice}; border-radius: 999px; }

    /* Subtle icy gradient — backgrounds, brand */
    .it-bg-aurora { background: radial-gradient(1200px 600px at 0% 0%, ${IT.iceSoft} 0%, transparent 60%), radial-gradient(800px 400px at 100% 100%, ${IT.iceTint} 0%, transparent 50%), ${IT.paper}; }
    .it-bg-ink { background: ${IT.ink}; color: #fff; }
    .it-bg-noise { position: relative; }
    .it-bg-noise::before { content: ''; position: absolute; inset: 0; pointer-events: none; opacity: 0.4; background-image: radial-gradient(${IT.hairline} 0.5px, transparent 0.5px); background-size: 18px 18px; }

    /* Skate-blade keyline pattern (subtle, decorative) */
    .it-pattern-blades { background-image: repeating-linear-gradient(115deg, transparent 0 28px, ${IT.hairlineSoft} 28px 29px); }

    /* Scrollbars off in artboards */
    .it-app::-webkit-scrollbar { width: 0; height: 0; }
    .it-app *::-webkit-scrollbar { width: 0; height: 0; }
  `;
  document.head.appendChild(s);
}

// Logo / wordmark
function ITLogo({ size = 16, color, mono = false }) {
  const c = color || IT.ink;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <svg width={size + 4} height={size + 4} viewBox="0 0 28 28" fill="none">
        {/* abstract skate blade arc — minimalist mark */}
        <path d="M5 19 Q 14 22, 23 19" stroke={c} strokeWidth="2" strokeLinecap="round" />
        <path d="M9 19 L 12 8 L 14 8 L 13 19" stroke={c} strokeWidth="1.6" fill="none" strokeLinejoin="round" />
        <circle cx="6" cy="20" r="1.2" fill={c} />
        <circle cx="22" cy="20" r="1.2" fill={c} />
      </svg>
      {!mono && (
        <span style={{ fontFamily: IT.display, fontWeight: 500, fontSize: size + 4, letterSpacing: '-0.02em', color: c }}>
          Ice<span style={{ fontStyle: 'italic', fontWeight: 400 }}>Track</span>
        </span>
      )}
    </span>
  );
}

// Tiny inline icons (stroke style — quiet, geometric)
function ITIcon({ name, size = 16, color }) {
  const c = color || 'currentColor';
  const props = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: c, strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'home': return <svg {...props}><path d="M3 11 L 12 4 L 21 11 V 20 H 3 Z" /><path d="M9 20 V 14 H 15 V 20" /></svg>;
    case 'skater': return <svg {...props}><circle cx="12" cy="6" r="2.5" /><path d="M12 8.5 V 14 L 9 19 M 12 14 L 15 19" /><path d="M9 14 L 14 12" /></svg>;
    case 'cal': return <svg {...props}><rect x="3.5" y="5" width="17" height="15" rx="2" /><path d="M3.5 9 H 20.5 M 8 3 V 7 M 16 3 V 7" /></svg>;
    case 'star': return <svg {...props}><path d="M12 4 L 14 9.5 L 20 10 L 15.5 14 L 17 20 L 12 16.8 L 7 20 L 8.5 14 L 4 10 L 10 9.5 Z" /></svg>;
    case 'show': return <svg {...props}><path d="M4 17 L 12 6 L 20 17" /><path d="M4 17 H 20" /><circle cx="12" cy="13" r="0.8" fill={c} /></svg>;
    case 'check': return <svg {...props}><path d="M4 12 L 9 17 L 20 6" /></svg>;
    case 'plus': return <svg {...props}><path d="M12 5 V 19 M 5 12 H 19" /></svg>;
    case 'arrow-right': return <svg {...props}><path d="M5 12 H 19 M 13 6 L 19 12 L 13 18" /></svg>;
    case 'chevron': return <svg {...props}><path d="M9 6 L 15 12 L 9 18" /></svg>;
    case 'chevron-down': return <svg {...props}><path d="M6 9 L 12 15 L 18 9" /></svg>;
    case 'search': return <svg {...props}><circle cx="11" cy="11" r="6" /><path d="M16 16 L 20 20" /></svg>;
    case 'bell': return <svg {...props}><path d="M6 16 V 11 a 6 6 0 0 1 12 0 V 16" /><path d="M4 16 H 20 M 10 19 a 2 2 0 0 0 4 0" /></svg>;
    case 'users': return <svg {...props}><circle cx="9" cy="9" r="3" /><path d="M3 19 a 6 6 0 0 1 12 0" /><path d="M16 8 a 3 3 0 0 1 0 5" /><path d="M16 19 a 4 4 0 0 1 5 -4" /></svg>;
    case 'chart': return <svg {...props}><path d="M4 19 V 5" /><path d="M4 19 H 20" /><path d="M8 16 V 12 M 12 16 V 8 M 16 16 V 10" /></svg>;
    case 'settings': return <svg {...props}><circle cx="12" cy="12" r="3" /><path d="M19.5 12 L 21 11 L 20 8 L 18 8.5 M 6 15.5 L 4 16 L 3 13 L 4.5 12 M 4.5 12 L 3 11 L 4 8 L 6 8.5 M 18 15.5 L 20 16 L 21 13 L 19.5 12" /></svg>;
    case 'logo': return <svg {...props}><path d="M5 19 Q 14 22, 23 19" /><path d="M9 19 L 12 8 L 14 8 L 13 19" /></svg>;
    case 'sparkle': return <svg {...props}><path d="M12 4 V 10 M 12 14 V 20 M 4 12 H 10 M 14 12 H 20" /></svg>;
    case 'medal': return <svg {...props}><circle cx="12" cy="14" r="5" /><path d="M9 4 L 12 9 L 15 4" /></svg>;
    case 'pin': return <svg {...props}><path d="M12 2 a 7 7 0 0 1 7 7 c 0 5 -7 13 -7 13 s -7 -8 -7 -13 a 7 7 0 0 1 7 -7 z" /><circle cx="12" cy="9" r="2.5" /></svg>;
    case 'clock': return <svg {...props}><circle cx="12" cy="12" r="8" /><path d="M12 8 V 12 L 15 14" /></svg>;
    case 'menu': return <svg {...props}><path d="M4 7 H 20 M 4 12 H 20 M 4 17 H 20" /></svg>;
    case 'logout': return <svg {...props}><path d="M14 4 H 5 V 20 H 14" /><path d="M10 12 H 21 M 17 8 L 21 12 L 17 16" /></svg>;
    case 'edit': return <svg {...props}><path d="M5 19 H 9 L 19 9 L 15 5 L 5 15 Z" /></svg>;
    case 'trash': return <svg {...props}><path d="M5 7 H 19 M 9 7 V 4 H 15 V 7 M 6 7 L 7 20 H 17 L 18 7" /></svg>;
    default: return <svg {...props}><circle cx="12" cy="12" r="8" /></svg>;
  }
}

// Skater "photo" placeholder — soft icy gradient orb w/ initials.
// We do NOT hand-draw faces; this is a stylized stand-in.
function ITAvatar({ name = '', size = 40, hue = 0 }) {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '◦';
  const baseHue = (hue + name.charCodeAt(0) || 200) % 360;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `radial-gradient(circle at 30% 30%, hsl(${baseHue} 35% 92%), hsl(${(baseHue + 20) % 360} 30% 80%))`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: `hsl(${baseHue} 30% 30%)`, fontFamily: IT.body, fontWeight: 600, fontSize: size * 0.35,
      border: `1px solid ${IT.hairline}`, flexShrink: 0,
    }}>{initials}</div>
  );
}

// Section header with optional eyebrow
function ITHeader({ eyebrow, title, subtitle, right, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 18 }}>
      <div>
        {eyebrow && <div className="it-eyebrow" style={{ marginBottom: 6 }}>{eyebrow}</div>}
        <h1 style={{ fontSize: 28, fontWeight: 400 }}>{title}</h1>
        {subtitle && <div style={{ color: IT.muted, fontSize: 14, marginTop: 4 }}>{subtitle}</div>}
        {children}
      </div>
      {right && <div style={{ display: 'flex', gap: 8 }}>{right}</div>}
    </div>
  );
}

// Browser chrome for hi-fi screens
function ITBrowser({ url = 'icetrack.app', children, dark = false }) {
  return (
    <div className="it-app" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 0, overflow: 'hidden', background: dark ? IT.ink : IT.paper }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', background: dark ? '#0a1422' : IT.surface2, borderBottom: `1px solid ${IT.hairline}` }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {['#ff5f57', '#febc2e', '#28c840'].map(c => (
            <span key={c} style={{ width: 11, height: 11, borderRadius: '50%', background: c }} />
          ))}
        </div>
        <div style={{ flex: 1, height: 22, background: dark ? '#0c1a2b' : '#fff', border: `1px solid ${IT.hairline}`, borderRadius: 5, display: 'flex', alignItems: 'center', padding: '0 10px', fontFamily: IT.mono, fontSize: 11, color: IT.muted, gap: 6 }}>
          <ITIcon name="logo" size={11} color={IT.muted} />
          {url}
        </div>
      </div>
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>{children}</div>
    </div>
  );
}

function ITTablet({ children }) {
  return (
    <div className="it-app" style={{ width: '100%', height: '100%', borderRadius: 18, padding: 8, background: '#1a2a3d', boxSizing: 'border-box' }}>
      <div style={{ width: '100%', height: '100%', borderRadius: 12, overflow: 'hidden', background: IT.paper, position: 'relative' }}>
        {children}
      </div>
    </div>
  );
}

Object.assign(window, { IT, ITLogo, ITIcon, ITAvatar, ITHeader, ITBrowser, ITTablet });
