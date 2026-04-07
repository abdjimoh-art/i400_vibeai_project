'use client'

import { useState } from 'react'
import { withdrawFromClass } from '@/app/parent/actions'

export function WithdrawButton({ enrollmentId }: { enrollmentId: string }) {
  const [loading, setLoading] = useState(false)

  async function handleWithdraw() {
    if (!confirm('Withdraw from this class?')) return
    setLoading(true)
    await withdrawFromClass(enrollmentId)
    setLoading(false)
  }

  return (
    <button
      onClick={handleWithdraw}
      disabled={loading}
      className="text-gray-400 hover:text-red-600 text-xs font-medium transition disabled:opacity-50"
    >
      {loading ? 'Removing...' : 'Withdraw'}
    </button>
  )
}
