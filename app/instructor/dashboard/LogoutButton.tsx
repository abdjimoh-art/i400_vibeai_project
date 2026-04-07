'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <button
      onClick={handleLogout}
      className="text-sm bg-white text-[#7B1113] px-3 py-1 rounded-lg font-medium hover:bg-red-50 transition"
    >
      Logout
    </button>
  )
}
