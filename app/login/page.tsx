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
        {/* Subtle geometric overlay */}
        <div className="absolute inset-0 opacity-[0.06]" aria-hidden>
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="hex" width="56" height="56" patternUnits="userSpaceOnUse">
                <path d="M28 4 L52 18 L52 46 L28 60 L4 46 L4 18 Z" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hex)"/>
          </svg>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-16">
            <span className="text-white text-xl">⛸️</span>
            <span className="text-white font-bold text-lg tracking-tight">IceTrack</span>
          </div>
          <div>
            <h2 className="text-white text-4xl font-bold leading-tight mb-5">
              Frank Southern<br />Ice Arena
            </h2>
            <p className="text-red-200 text-base leading-relaxed max-w-xs">
              Manage classes, track skill progress, and celebrate every milestone on the ice.
            </p>
          </div>
        </div>

        <div className="relative z-10 space-y-3">
          {[
            'Skill check-offs for all 8 levels',
            'Real-time attendance tracking',
            'Skating show & practice management',
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
          <div className="lg:hidden text-center mb-10">
            <div className="text-3xl mb-2">⛸️</div>
            <h1 className="text-xl font-bold text-[#7B1113]">IceTrack</h1>
            <p className="text-slate-500 text-sm">Frank Southern Ice Arena</p>
          </div>

          <h2 className="text-2xl font-semibold text-slate-900 mb-1">Welcome back</h2>
          <p className="text-slate-500 text-sm mb-8">Sign in to your account to continue</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
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
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Your password"
                className="w-full border border-slate-300 bg-white rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7B1113] focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#7B1113] text-white py-2.5 rounded-lg font-semibold hover:bg-[#6a0f10] active:bg-[#5e0d0f] disabled:opacity-50 shadow-sm"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-[#7B1113] font-medium hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
