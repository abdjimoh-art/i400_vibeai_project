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
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-10 max-w-md w-full text-center">
          <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Account created!</h2>
          <p className="text-slate-500 text-sm mb-8">Check your email to confirm your account, then sign in.</p>
          <Link
            href="/login"
            className="block w-full bg-[#7B1113] text-white py-2.5 rounded-lg font-semibold hover:bg-[#6a0f10] shadow-sm text-center"
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
      {/* Left brand panel — desktop only */}
      <div className="hidden lg:flex lg:w-[44%] bg-[#7B1113] flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06]" aria-hidden>
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="hex2" width="56" height="56" patternUnits="userSpaceOnUse">
                <path d="M28 4 L52 18 L52 46 L28 60 L4 46 L4 18 Z" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hex2)"/>
          </svg>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-16">
            <span className="text-white text-xl">⛸️</span>
            <span className="text-white font-bold text-lg tracking-tight">IceTrack</span>
          </div>
          <div>
            <h2 className="text-white text-4xl font-bold leading-tight mb-5">
              Join Frank Southern<br />Ice Arena
            </h2>
            <p className="text-red-200 text-base leading-relaxed max-w-xs">
              Create your account to access your child&apos;s progress, class schedule, and upcoming shows.
            </p>
          </div>
        </div>

        <div className="relative z-10 space-y-3">
          {[
            'View your child\'s skill card',
            'Track attendance and sessions',
            'Stay updated on skating shows',
          ].map(item => (
            <div key={item} className="flex items-center gap-3 text-red-100 text-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-red-300 shrink-0" />
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-sm">
          {/* Mobile-only logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="text-3xl mb-2">⛸️</div>
            <h1 className="text-xl font-bold text-[#7B1113]">IceTrack</h1>
            <p className="text-slate-500 text-sm">Frank Southern Ice Arena</p>
          </div>

          <h2 className="text-2xl font-semibold text-slate-900 mb-1">Create your account</h2>
          <p className="text-slate-500 text-sm mb-8">Fill in your details to get started</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-5 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Full name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Jane Smith"
                className="w-full border border-slate-300 bg-white rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7B1113] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="jane@example.com"
                className="w-full border border-slate-300 bg-white rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7B1113] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full border border-slate-300 bg-white rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7B1113] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                className={`w-full border bg-white rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7B1113] focus:border-transparent ${
                  passwordMismatch ? 'border-red-400 bg-red-50' : 'border-slate-300'
                }`}
              />
              {passwordMismatch && (
                <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">I am a…</label>
              <div className="grid grid-cols-2 gap-2.5">
                {(['parent', 'instructor'] as const).map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-2.5 px-4 rounded-lg border-2 text-sm font-medium capitalize transition ${
                      role === r
                        ? 'border-[#7B1113] bg-[#7B1113] text-white'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-[#7B1113]/50'
                    }`}
                  >
                    {r === 'parent' ? '👨‍👩‍👧 Parent' : '🏒 Instructor'}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || passwordMismatch}
              className="w-full bg-[#7B1113] text-white py-2.5 rounded-lg font-semibold hover:bg-[#6a0f10] active:bg-[#5e0d0f] disabled:opacity-50 shadow-sm mt-1"
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-[#7B1113] font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
