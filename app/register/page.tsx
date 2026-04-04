'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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

    // 1. Sign up with Supabase Auth
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (signUpError || !data.user) {
      setError(signUpError?.message || 'Registration failed.')
      setLoading(false)
      return
    }

    // 2. Insert profile row
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({ id: data.user.id, full_name: fullName, role })

    if (profileError) {
      setError(profileError.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-md p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">You&apos;re registered!</h2>
          <p className="text-gray-500 mb-6">Check your email to confirm your account, then log in.</p>
          <Link href="/login" className="block w-full bg-[#7B1113] text-white py-2 rounded-lg font-semibold hover:bg-[#5e0d0f] transition">
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-md p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">⛸️</div>
          <h1 className="text-2xl font-bold text-[#7B1113]">IceTrack</h1>
          <p className="text-gray-500 text-sm">Frank Southern Ice Arena</p>
        </div>

        <h2 className="text-xl font-semibold text-gray-800 mb-6">Create your account</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Jane Smith"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1113]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="jane@example.com"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1113]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1113]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1113] ${confirmPassword && password !== confirmPassword ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
            {confirmPassword && password !== confirmPassword && <p className="text-red-500 text-xs mt-1">Passwords do not match</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">I am a...</label>
            <div className="grid grid-cols-2 gap-3">
              {(['parent', 'instructor'] as const).map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`py-2 px-4 rounded-lg border-2 text-sm font-medium capitalize transition ${
                    role === r
                      ? 'border-[#7B1113] bg-[#7B1113] text-white'
                      : 'border-gray-200 text-gray-600 hover:border-[#7B1113]'
                  }`}
                >
                  {r === 'parent' ? '👨‍👩‍👧 Parent' : '🏒 Instructor'}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || (!!confirmPassword && password !== confirmPassword)}
            className="w-full bg-[#7B1113] text-white py-2 rounded-lg font-semibold hover:bg-[#5e0d0f] transition disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{' '}
          <Link href="/login" className="text-[#7B1113] font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
