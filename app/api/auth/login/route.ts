import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { email, password } = await request.json()
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })

  if (signInError || !data.user) {
    return NextResponse.json({ error: signInError?.message || 'Login failed.' }, { status: 401 })
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', data.user.id)
    .single()

  if (!profile && profileError?.code === 'PGRST116') {
    const fallbackName =
      (typeof data.user.user_metadata?.full_name === 'string' && data.user.user_metadata.full_name.trim()) ||
      data.user.email?.split('@')[0] ||
      'Skater Parent'

    const { error: createProfileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      full_name: fallbackName,
      role: 'parent',
    })

    if (createProfileError) {
      return NextResponse.json({ error: 'Signed in but failed to create profile.' }, { status: 500 })
    }

    const { data: createdProfile, error: createdProfileError } = await supabase
      .from('profiles')
      .select('role, full_name')
      .eq('id', data.user.id)
      .single()

    if (createdProfileError || !createdProfile) {
      return NextResponse.json({ error: 'Signed in but profile lookup failed.' }, { status: 500 })
    }

    return NextResponse.json({ role: createdProfile.role, full_name: createdProfile.full_name })
  }

  if (profileError || !profile) {
    return NextResponse.json({ error: 'Profile lookup failed after sign-in.' }, { status: 500 })
  }

  return NextResponse.json({ role: profile.role, full_name: profile.full_name })
}
