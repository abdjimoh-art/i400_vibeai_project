'use client'

import { useState } from 'react'
import { enrollInClass } from '@/app/parent/actions'

export function EnrollButton({ classId }: { classId: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleEnroll() {
    setLoading(true)
    setError('')
    const result = await enrollInClass(classId)
    if (result.error) setError(result.error)
    setLoading(false)
  }

  return (
    <div>
      <button
        onClick={handleEnroll}
        disabled={loading}
        className="bg-[#7B1113] text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-[#5e0d0f] transition disabled:opacity-50"
      >
        {loading ? 'Enrolling...' : 'Enroll'}
      </button>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}
