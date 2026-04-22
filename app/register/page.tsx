'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createProfile } from './actions'

export default function RegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState<'parent' | 'instructor'>('parent')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) { setError('Passwords do not match.'); return }
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
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-10 max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Account created!</h2>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed">Check your email to confirm your account, then sign in.</p>
          <Link
            href="/login"
            className="block w-full bg-[#7B1113] text-white py-3 rounded-xl font-semibold hover:bg-[#6a0f10] shadow-sm text-center text-sm"
          >
            Go to Sign In
          </Link>
        </div>
      </div>
    )
  }

  const passwordMismatch = !!confirmPassword && password !== confirmPassword

  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-[44%] bg-[#7B1113] flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.07]" aria-hidden>
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="hex2" width="56" height="56" patternUnits="userSpaceOnUse">
                <path d="M28 4 L52 18 L52 46 L28 60 L4 46 L4 18 Z" fill="none" stroke="white" strokeWidth="1.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hex2)"/>
          </svg>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#5e0d0f]/60 to-transparent pointer-events-none" aria-hidden />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <line x1="12" y1="2" x2="12" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/>
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/><line x1="19.07" y1="4.93" x2="4.93" y2="19.07"/>
                <polyline points="9 5 12 2 15 5"/><polyline points="9 19 12 22 15 19"/>
                <polyline points="5 9 2 12 5 15"/><polyline points="19 9 22 12 19 15"/>
              </svg>
            </div>
            <span className="text-white font-bold text-xl tracking-tight">IceTrack</span>
          </div>
          <div>
            <h2 className="text-white text-[2.4rem] font-bold leading-tight mb-5">
              Join Frank Southern<br />Ice Arena
            </h2>
            <p className="text-red-200 text-base leading-relaxed max-w-[22rem]">
              Create your account to access your child&apos;s progress, class schedule, and upcoming shows.
            </p>
          </div>
        </div>

        <div className="relative z-10 space-y-4">
          {[
            "View your child's skill card",
            "Track attendance and sessions",
            "Stay updated on skating shows",
          ].map(item => (
            <div key={item} className="flex items-center gap-3 text-red-100 text-sm">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <span className="font-medium">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-slate-50">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-14 h-14 bg-[#7B1113]/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-7 h-7 text-[#7B1113]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <line x1="12" y1="2" x2="12" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/>
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/><line x1="19.07" y1="4.93" x2="4.93" y2="19.07"/>
                <polyline points="9 5 12 2 15 5"/><polyline points="9 19 12 22 15 19"/>
                <polyline points="5 9 2 12 5 15"/><polyline points="19 9 22 12 19 15"/>
              </svg>
            </div>
            <h1 className="text-xl font-bold text-[#7B1113]">IceTrack</h1>
            <p className="text-slate-500 text-sm">Frank Southern Ice Arena</p>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-1">Create your account</h2>
          <p className="text-slate-500 text-sm mb-8">Fill in your details to get started</p>

          {error && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl p-3.5 mb-5 text-sm">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-semibold text-slate-700 mb-1.5">Full name</label>
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Jane Smith"
                className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7B1113]/20 focus:border-[#7B1113] focus:bg-white"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5">Email address</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="jane@example.com"
                className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7B1113]/20 focus:border-[#7B1113] focus:bg-white"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7B1113]/20 focus:border-[#7B1113] focus:bg-white"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700 mb-1.5">Confirm password</label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                className={`w-full border rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7B1113]/20 focus:border-[#7B1113] focus:bg-white ${
                  passwordMismatch ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50'
                }`}
              />
              {passwordMismatch && (
                <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                  Passwords do not match
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">I am a…</label>
              <div className="grid grid-cols-2 gap-2.5">
                {(['parent', 'instructor'] as const).map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-2.5 px-4 rounded-xl border-2 text-sm font-semibold capitalize transition cursor-pointer ${
                      role === r
                        ? 'border-[#7B1113] bg-[#7B1113] text-white shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {r === 'parent' ? 'Parent' : 'Instructor'}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || passwordMismatch}
              className="w-full bg-[#7B1113] text-white py-3 rounded-xl font-semibold hover:bg-[#6a0f10] active:bg-[#5e0d0f] disabled:opacity-50 shadow-sm cursor-pointer text-sm mt-1"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24" aria-hidden>
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Creating account…
                </span>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-[#7B1113] font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
