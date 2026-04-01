import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { email, password } = await request.json()

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })

  if (signInError || !data.user) {
    return NextResponse.json({ error: signInError?.message || 'Login failed.' }, { status: 401 })
  }

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: profile, error: profileError } = await adminClient
    .from('profiles')
    .select('role, full_name')
    .eq('id', data.user.id)
    .single()

  if (profileError || !profile) {
    return NextResponse.json({ error: 'Profile not found.' }, { status: 404 })
  }

  return NextResponse.json({
    role: profile.role,
    full_name: profile.full_name,
    access_token: data.session?.access_token,
    refresh_token: data.session?.refresh_token,
  })
}
