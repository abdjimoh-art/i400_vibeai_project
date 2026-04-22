'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
        admin: '/admin/dashboard',
        instructor: '/instructor/dashboard',
        parent: '/parent/dashboard',
      }
      window.location.href = redirectMap[data.role] || '/login'
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left brand panel — desktop only */}
      <div className="hidden lg:flex lg:w-[44%] bg-[#7B1113] flex-col justify-between p-12 relative overflow-hidden">
        {/* Hex pattern overlay */}
        <div className="absolute inset-0 opacity-[0.07]" aria-hidden>
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="hex" width="56" height="56" patternUnits="userSpaceOnUse">
                <path d="M28 4 L52 18 L52 46 L28 60 L4 46 L4 18 Z" fill="none" stroke="white" strokeWidth="1.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hex)"/>
          </svg>
        </div>
        {/* Gradient fade at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#5e0d0f]/60 to-transparent pointer-events-none" aria-hidden />

        <div className="relative z-10">
          {/* Logo */}
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
            <h2 className="text-white text-[2.6rem] font-bold leading-tight mb-5">
              Frank Southern<br />Ice Arena
            </h2>
            <p className="text-red-200 text-base leading-relaxed max-w-[22rem]">
              Manage classes, track skill progress, and celebrate every milestone on the ice.
            </p>
          </div>
        </div>

        <div className="relative z-10 space-y-4">
          {[
            { label: 'Skill check-offs for all 8 levels', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
            { label: 'Real-time attendance tracking', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
            { label: 'Skating show & practice management', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-3 text-red-100 text-sm">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon}/>
                </svg>
              </div>
              <span className="font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-slate-50">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-10">
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

          <h2 className="text-2xl font-bold text-slate-900 mb-1">Welcome back</h2>
          <p className="text-slate-500 text-sm mb-8">Sign in to your account to continue</p>

          {error && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl p-3.5 mb-6 text-sm">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
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
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Your password"
                className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7B1113]/20 focus:border-[#7B1113] focus:bg-white"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#7B1113] text-white py-3 rounded-xl font-semibold hover:bg-[#6a0f10] active:bg-[#5e0d0f] disabled:opacity-50 shadow-sm cursor-pointer text-sm mt-1"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24" aria-hidden>
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Signing in…
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-[#7B1113] font-semibold hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
