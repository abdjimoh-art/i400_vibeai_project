'use client'

import { useState } from 'react'
import Link from 'next/link'

/* IceTrack logo mark — abstract skate blade arc */
function ITLogo({ size = 16, color = '#0c1a2b' }: { size?: number; color?: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <svg width={size + 4} height={size + 4} viewBox="0 0 28 28" fill="none" aria-hidden>
        <path d="M5 19 Q 14 22, 23 19" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M9 19 L 12 8 L 14 8 L 13 19" stroke={color} strokeWidth="1.6" fill="none" strokeLinejoin="round" />
        <circle cx="6" cy="20" r="1.2" fill={color} />
        <circle cx="22" cy="20" r="1.2" fill={color} />
      </svg>
      <span className="font-display" style={{ fontWeight: 500, fontSize: size + 4, letterSpacing: '-0.02em', color }}>
        Ice<span style={{ fontStyle: 'italic', fontWeight: 400 }}>Track</span>
      </span>
    </span>
  )
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [keepSignedIn, setKeepSignedIn] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Login failed.'); setLoading(false); return }
      const redirectMap: Record<string, string> = {
        admin: '/admin',
        instructor: '/instructor',
        parent: '/parent',
      }
      window.location.href = redirectMap[data.role] || '/login'
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ display: 'grid', gridTemplateColumns: '1.05fr 1fr' }}>
      {/* Left brand hero — icy blue gradient */}
      <div className="hidden lg:flex flex-col justify-between p-11 relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #1e5a91 0%, #3b82c4 60%, #4f9bd5 100%)' }}>
        {/* Decorative arcs */}
        <svg className="absolute inset-0 opacity-[0.18]" viewBox="0 0 600 700" preserveAspectRatio="none" aria-hidden>
          <path d="M-50 400 Q 200 200, 400 350 T 700 320" stroke="#fff" strokeWidth="1.5" fill="none" />
          <path d="M-50 460 Q 200 280, 400 410 T 700 380" stroke="#fff" strokeWidth="1.2" fill="none" />
          <path d="M-50 520 Q 200 360, 400 470 T 700 440" stroke="#fff" strokeWidth="1" fill="none" />
          <circle cx="520" cy="120" r="80" stroke="#fff" strokeWidth="1" fill="none" opacity="0.4" />
          <circle cx="520" cy="120" r="50" stroke="#fff" strokeWidth="1" fill="none" opacity="0.5" />
        </svg>

        <ITLogo size={18} color="#fff" />

        <div className="relative z-10">
          <div className="eyebrow" style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 14 }}>
            Frank Southern Ice Arena · Bloomington, IN
          </div>
          <h1 className="font-display" style={{ fontSize: 54, color: '#fff', fontWeight: 300, letterSpacing: '-0.02em', lineHeight: 1.02 }}>
            One rink.<br />
            <span style={{ fontStyle: 'italic', fontWeight: 400 }}>Every skater.</span>
          </h1>
          <p style={{ marginTop: 18, fontSize: 15, color: 'rgba(255,255,255,0.85)', maxWidth: 360, lineHeight: 1.5 }}>
            Roster, attendance, skill passes, and the spring show — together for the first time. Built at Indiana University.
          </p>
        </div>

        <div className="relative z-10 flex gap-6">
          {[
            { n: '53', l: 'Skills tracked' },
            { n: '8', l: 'Skating levels' },
            { n: '3', l: 'Roles, one app' },
          ].map(s => (
            <div key={s.l}>
              <div className="font-display" style={{ fontSize: 28, fontWeight: 400, color: '#fff' }}>{s.n}</div>
              <div className="eyebrow" style={{ color: 'rgba(255,255,255,0.7)' }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex items-center justify-center p-11" style={{ background: 'var(--surface)' }}>
        <div style={{ maxWidth: 320, width: '100%' }}>
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-10">
            <ITLogo size={20} color="#1e5a91" />
          </div>

          <h2 className="font-display" style={{ fontSize: 28, fontWeight: 400, marginBottom: 6, color: 'var(--ink)' }}>Welcome back</h2>
          <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 28 }}>Sign in to your IceTrack dashboard.</p>

          {error && (
            <div className="flex items-start gap-2.5 rounded-lg p-3.5 mb-6 text-sm" style={{ background: 'var(--rust-soft)', border: '1px solid var(--rust)', color: '#8b3a25' }}>
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink-soft)', marginBottom: 6, display: 'block' }}>Email</label>
              <input
                id="email" type="email" required value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="jane@example.com"
                style={{ width: '100%', fontSize: 14, padding: '10px 12px', borderRadius: 'var(--r-sm)', border: '1px solid var(--hairline)', background: 'var(--surface)', color: 'var(--ink)', outline: 'none', transition: 'border-color 0.15s, box-shadow 0.15s', fontFamily: 'inherit' }}
                onFocus={e => { e.target.style.borderColor = 'var(--ice)'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,196,0.13)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--hairline)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
            <div>
              <div className="flex justify-between items-baseline">
                <label htmlFor="password" style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink-soft)', marginBottom: 6, display: 'block' }}>Password</label>
                <a style={{ fontSize: 12, color: 'var(--ice)', textDecoration: 'none', cursor: 'pointer' }}>Forgot?</a>
              </div>
              <input
                id="password" type="password" required value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Your password"
                style={{ width: '100%', fontSize: 14, padding: '10px 12px', borderRadius: 'var(--r-sm)', border: '1px solid var(--hairline)', background: 'var(--surface)', color: 'var(--ink)', outline: 'none', transition: 'border-color 0.15s, box-shadow 0.15s', fontFamily: 'inherit' }}
                onFocus={e => { e.target.style.borderColor = 'var(--ice)'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,196,0.13)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--hairline)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none" style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 4 }}>
              <input
                type="checkbox"
                checked={keepSignedIn}
                onChange={e => setKeepSignedIn(e.target.checked)}
                className="sr-only"
              />
              <span
                className="inline-flex items-center justify-center flex-shrink-0"
                style={{
                  width: 16, height: 16, borderRadius: 4,
                  border: keepSignedIn ? '1.5px solid var(--ice)' : '1.5px solid var(--hairline)',
                  background: keepSignedIn ? 'var(--ice)' : 'transparent',
                }}
                aria-hidden
              >
                {keepSignedIn ? (
                  <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 12 L 9 17 L 20 6" />
                  </svg>
                ) : null}
              </span>
              Keep me signed in
            </label>

            <button
              type="submit" disabled={loading}
              className="flex items-center justify-center gap-2 w-full cursor-pointer min-h-[44px] rounded-md border border-[#3b82c4] bg-[#3b82c4] text-white text-sm font-medium shadow-[0_1px_0_#1e5a9155,0_4px_12px_-4px_rgba(59,130,196,0.33)] hover:bg-[#2f74b3] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24" aria-hidden>
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M5 12 H 19 M 13 6 L 19 12 L 13 18" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-2.5 my-5">
            <div className="flex-1 h-px" style={{ background: 'var(--hairline)' }} />
            <span className="font-mono text-xs uppercase tracking-widest" style={{ color: 'var(--muted)' }}>or</span>
            <div className="flex-1 h-px" style={{ background: 'var(--hairline)' }} />
          </div>

          <button
            type="button"
            disabled
            aria-disabled="true"
            title="IU SSO integration is planned for a future release"
            className="w-full flex items-center justify-center gap-2 cursor-not-allowed"
            style={{
              padding: '8px 14px', fontSize: 13, fontWeight: 500,
              borderRadius: 'var(--r-sm)', border: '1px solid var(--hairline)',
              background: 'var(--surface2)', color: 'var(--muted)',
              fontFamily: 'inherit', opacity: 0.7,
            }}
          >
            Continue with IU SSO
            <span className="font-mono" style={{ fontSize: 10, padding: '1px 6px', borderRadius: 999, background: 'var(--surface)', border: '1px solid var(--hairline)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Soon
            </span>
          </button>

          <p className="text-center mt-6" style={{ fontSize: 13, color: 'var(--muted)' }}>
            New to IceTrack?{' '}
            <Link href="/register" style={{ color: 'var(--ice)', fontWeight: 500, textDecoration: 'none' }}>
              Create an account →
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
