'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { createProfile } from './actions'

/* IceTrack logo mark */
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

/* Icons */
const IconCheck = ({ size = 12, color = '#fff' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M4 12 L 9 17 L 20 6" />
  </svg>
)
const IconUsers = ({ size = 22, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="9" cy="9" r="3" /><path d="M3 19 a 6 6 0 0 1 12 0" /><path d="M16 8 a 3 3 0 0 1 0 5" /><path d="M16 19 a 4 4 0 0 1 5 -4" />
  </svg>
)
const IconStar = ({ size = 22, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M12 4 L 14 9.5 L 20 10 L 15.5 14 L 17 20 L 12 16.8 L 7 20 L 8.5 14 L 4 10 L 10 9.5 Z" />
  </svg>
)
const IconArrowRight = ({ size = 14, color = '#fff' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M5 12 H 19 M 13 6 L 19 12 L 13 18" />
  </svg>
)

const STEPS = [
  { n: 1, t: 'Choose your role', s: 'Parent or instructor' },
  { n: 2, t: 'Your details', s: 'Name, email, password' },
  { n: 3, t: 'Verify email', s: 'Quick confirmation' },
]

export default function RegisterPage() {
  const [step, setStep] = useState(1)
  const [role, setRole] = useState<'parent' | 'instructor'>('parent')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) { setError('Passwords do not match.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true)

    const supabase = createClient()
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })

    if (signUpError || !data.user) {
      setError(signUpError?.message || 'Registration failed.')
      setLoading(false)
      return
    }

    const { error: profileError } = await createProfile(data.user.id, fullName, role)
    if (profileError) {
      setError(profileError)
      setLoading(false)
      return
    }

    setSuccess(true)
    setStep(3)
    setLoading(false)
  }

  const passwordMismatch = !!confirmPassword && password !== confirmPassword

  return (
    <div className="min-h-screen" style={{ display: 'grid', gridTemplateColumns: '260px 1fr', background: 'var(--paper)' }}>
      {/* Sidebar */}
      <div className="hidden md:flex flex-col" style={{ padding: 28, borderRight: '1px solid var(--hairline)', background: 'var(--surface)' }}>
        <ITLogo size={16} />

        <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {STEPS.map((s) => {
            const state = step === s.n ? 'active' : step > s.n ? 'done' : 'pending'
            return (
              <div key={s.n} style={{ display: 'flex', gap: 12, padding: '10px 0' }}>
                <div style={{
                  width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: state === 'active' ? 'var(--ice)' : state === 'done' ? 'var(--spring)' : 'var(--surface2)',
                  color: state === 'active' || state === 'done' ? '#fff' : 'var(--muted)',
                  border: `1px solid ${state === 'active' ? 'var(--ice)' : state === 'done' ? 'var(--spring)' : 'var(--hairline)'}`,
                  fontFamily: 'var(--font-mono, "Geist Mono", monospace)', fontSize: 12, fontWeight: 600, flexShrink: 0,
                }}>
                  {state === 'done' ? <IconCheck size={12} color="#fff" /> : s.n}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: state === 'active' ? 'var(--ink)' : 'var(--muted)' }}>{s.t}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>{s.s}</div>
                </div>
              </div>
            )
          })}
        </div>

        <div style={{
          marginTop: 'auto', padding: 12, background: 'var(--ice-tint)', border: '1px solid var(--ice-soft)',
          borderRadius: 'var(--r-md)', fontSize: 12, color: 'var(--ice-deep)', lineHeight: 1.45,
        }}>
          <strong>Admin?</strong> Admin accounts are created by IU staff. Stop by the rink office or email{' '}
          <span className="font-mono">icetrack@iu.edu</span>.
        </div>
      </div>

      {/* Main content */}
      <div style={{ padding: 44, overflow: 'auto' }}>
        {/* Mobile logo */}
        <div className="md:hidden mb-8">
          <ITLogo size={18} color="var(--ice-deep)" />
        </div>

        {/* Step 1: Role selection */}
        {step === 1 && (
          <>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Step 1 of 3</div>
            <h1 className="font-display" style={{ fontSize: 36, fontWeight: 400, marginBottom: 6, color: 'var(--ink)' }}>
              Who&apos;s this account for?
            </h1>
            <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 28, maxWidth: 460 }}>
              Pick the role that fits — you can add skaters and link family members in the next steps.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, maxWidth: 640 }}>
              {/* Parent card */}
              <button
                type="button"
                onClick={() => setRole('parent')}
                className="card text-left cursor-pointer"
                style={{
                  padding: 22, position: 'relative', minHeight: 220, display: 'flex', flexDirection: 'column',
                  borderColor: role === 'parent' ? 'var(--ice)' : undefined,
                  boxShadow: role === 'parent' ? '0 0 0 3px rgba(59,130,196,0.13), 0 1px 0 rgba(12,26,43,0.04), 0 8px 28px -8px rgba(30,90,145,0.18)' : undefined,
                }}
              >
                {role === 'parent' && (
                  <div style={{ position: 'absolute', top: 14, right: 14, width: 22, height: 22, borderRadius: '50%', background: '#3b82c4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <IconCheck size={12} color="#fff" />
                  </div>
                )}
                <div style={{ position: 'relative', zIndex: 1, width: 50, height: 50, borderRadius: 14, background: role === 'parent' ? 'var(--ice-soft)' : 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14, border: '1px solid var(--hairline)' }}>
                  <IconUsers size={22} color={role === 'parent' ? 'var(--ice-deep)' : 'var(--ink-soft)'} />
                </div>
                <h3 className="font-display" style={{ position: 'relative', zIndex: 1, fontSize: 20, fontWeight: 500, marginBottom: 4, color: 'var(--ink)' }}>I&apos;m a parent</h3>
                <p style={{ position: 'relative', zIndex: 1, fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.5, maxWidth: 360 }}>
                  Enroll your child, follow their skill progress, and stay on top of show practices.
                </p>
                <div style={{ flex: 1, minHeight: 28 }} aria-hidden />
              </button>

              {/* Instructor card */}
              <button
                type="button"
                onClick={() => setRole('instructor')}
                className="card text-left cursor-pointer"
                style={{
                  padding: 22, position: 'relative', minHeight: 220, display: 'flex', flexDirection: 'column',
                  borderColor: role === 'instructor' ? 'var(--ice)' : undefined,
                  boxShadow: role === 'instructor' ? '0 0 0 3px rgba(59,130,196,0.13), 0 1px 0 rgba(12,26,43,0.04), 0 8px 28px -8px rgba(30,90,145,0.18)' : undefined,
                }}
              >
                {role === 'instructor' && (
                  <div style={{ position: 'absolute', top: 14, right: 14, width: 22, height: 22, borderRadius: '50%', background: '#3b82c4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <IconCheck size={12} color="#fff" />
                  </div>
                )}
                <div style={{ position: 'relative', zIndex: 1, width: 50, height: 50, borderRadius: 14, background: role === 'instructor' ? 'var(--ice-soft)' : 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14, border: '1px solid var(--hairline)' }}>
                  <IconStar size={22} color={role === 'instructor' ? 'var(--ice-deep)' : 'var(--ink-soft)'} />
                </div>
                <h3 className="font-display" style={{ position: 'relative', zIndex: 1, fontSize: 20, fontWeight: 500, marginBottom: 4, color: 'var(--ink)' }}>I&apos;m an instructor</h3>
                <p style={{ position: 'relative', zIndex: 1, fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.5, maxWidth: 360 }}>
                  Take attendance, mark skill passes, and manage your weekly classes from the rink.
                </p>
                <div style={{ flex: 1, minHeight: 28 }} aria-hidden />
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 36, maxWidth: 640 }}>
              <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
                Already have an account?{' '}
                <Link href="/login" style={{ color: 'var(--ice)', fontWeight: 500, textDecoration: 'none' }}>Sign in</Link>
              </p>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-1.5 cursor-pointer min-h-[44px] rounded-md border border-[#3b82c4] bg-[#3b82c4] px-5 text-sm font-medium text-white shadow-[0_1px_0_#1e5a9155,0_4px_12px_-4px_rgba(59,130,196,0.33)] hover:bg-[#2f74b3]"
              >
                Continue <IconArrowRight size={14} color="#fff" />
              </button>
            </div>
          </>
        )}

        {/* Step 2: Details form */}
        {step === 2 && !success && (
          <>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Step 2 of 3</div>
            <h1 className="font-display" style={{ fontSize: 36, fontWeight: 400, marginBottom: 6, color: 'var(--ink)' }}>
              Your details
            </h1>
            <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 28, maxWidth: 460 }}>
              {role === 'parent'
                ? 'Create your parent account — you\'ll add your skaters next.'
                : 'Set up your instructor account to start managing classes.'}
            </p>

            {error && (
              <div className="flex items-start gap-2.5 rounded-lg p-3.5 mb-6 text-sm" style={{ background: 'var(--rust-soft)', border: '1px solid var(--rust)', color: '#8b3a25', maxWidth: 460 }}>
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleRegister} style={{ maxWidth: 460 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink-soft)', marginBottom: 6, display: 'block' }}>Full name</label>
                  <input
                    type="text" required value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Jane Smith"
                    style={{
                      width: '100%', fontSize: 14, padding: '10px 12px', borderRadius: 'var(--r-sm)',
                      border: '1px solid var(--hairline)', background: 'var(--surface)', color: 'var(--ink)',
                      outline: 'none', fontFamily: 'inherit',
                    }}
                    onFocus={e => { e.target.style.borderColor = 'var(--ice)'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,196,0.13)'; }}
                    onBlur={e => { e.target.style.borderColor = 'var(--hairline)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink-soft)', marginBottom: 6, display: 'block' }}>Email</label>
                  <input
                    type="email" required value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="jane@example.com"
                    style={{
                      width: '100%', fontSize: 14, padding: '10px 12px', borderRadius: 'var(--r-sm)',
                      border: '1px solid var(--hairline)', background: 'var(--surface)', color: 'var(--ink)',
                      outline: 'none', fontFamily: 'inherit',
                    }}
                    onFocus={e => { e.target.style.borderColor = 'var(--ice)'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,196,0.13)'; }}
                    onBlur={e => { e.target.style.borderColor = 'var(--hairline)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink-soft)', marginBottom: 6, display: 'block' }}>Password</label>
                  <input
                    type="password" required minLength={6} value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    style={{
                      width: '100%', fontSize: 14, padding: '10px 12px', borderRadius: 'var(--r-sm)',
                      border: '1px solid var(--hairline)', background: 'var(--surface)', color: 'var(--ink)',
                      outline: 'none', fontFamily: 'inherit',
                    }}
                    onFocus={e => { e.target.style.borderColor = 'var(--ice)'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,196,0.13)'; }}
                    onBlur={e => { e.target.style.borderColor = 'var(--hairline)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink-soft)', marginBottom: 6, display: 'block' }}>Confirm password</label>
                  <input
                    type="password" required value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    style={{
                      width: '100%', fontSize: 14, padding: '10px 12px', borderRadius: 'var(--r-sm)',
                      border: `1px solid ${passwordMismatch ? 'var(--rust)' : 'var(--hairline)'}`,
                      background: passwordMismatch ? 'var(--rust-soft)' : 'var(--surface)', color: 'var(--ink)',
                      outline: 'none', fontFamily: 'inherit',
                    }}
                    onFocus={e => { if (!passwordMismatch) { e.target.style.borderColor = 'var(--ice)'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,196,0.13)'; } }}
                    onBlur={e => { if (!passwordMismatch) { e.target.style.borderColor = 'var(--hairline)'; e.target.style.boxShadow = 'none'; } }}
                  />
                  {passwordMismatch && (
                    <p style={{ color: 'var(--rust)', fontSize: 12, marginTop: 4 }}>Passwords do not match</p>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 28 }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="cursor-pointer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 500, fontSize: 13,
                    padding: '8px 14px', borderRadius: 'var(--r-sm)', border: '1px solid var(--hairline)',
                    background: 'var(--surface)', color: 'var(--ink)', fontFamily: 'inherit',
                  }}
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={loading || passwordMismatch}
                  className="inline-flex items-center gap-1.5 min-h-[44px] cursor-pointer rounded-md border border-[#3b82c4] bg-[#3b82c4] px-5 text-sm font-medium text-white shadow-[0_1px_0_#1e5a9155,0_4px_12px_-4px_rgba(59,130,196,0.33)] hover:bg-[#2f74b3] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24" aria-hidden>
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Creating account…
                    </>
                  ) : (
                    <>Create account <IconArrowRight size={14} color="#fff" /></>
                  )}
                </button>
              </div>
            </form>
          </>
        )}

        {/* Step 3: Verify email / success */}
        {step === 3 && success && (
          <div style={{ maxWidth: 400 }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--spring-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
              <IconCheck size={24} color="var(--spring)" />
            </div>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Step 3 of 3</div>
            <h1 className="font-display" style={{ fontSize: 36, fontWeight: 400, marginBottom: 6, color: 'var(--ink)' }}>
              Check your email
            </h1>
            <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 28, lineHeight: 1.6 }}>
              We sent a confirmation link to <strong style={{ color: 'var(--ink)' }}>{email}</strong>. Click it to verify your account, then sign in.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 min-h-[44px] rounded-md border border-[#3b82c4] bg-[#3b82c4] px-5 text-sm font-medium text-white no-underline shadow-[0_1px_0_#1e5a9155,0_4px_12px_-4px_rgba(59,130,196,0.33)] hover:bg-[#2f74b3]"
            >
              Go to sign in <IconArrowRight size={14} color="#fff" />
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
