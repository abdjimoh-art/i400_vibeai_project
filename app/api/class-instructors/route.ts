import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET() {
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
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const admin = getAdminClient()
  const { data, error } = await admin
    .from('class_instructors')
    .select('class_id, instructor_id')

  if (error) {
    if (error.message.toLowerCase().includes('relation "public.class_instructors" does not exist')) {
      return NextResponse.json([])
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const instructorIds = Array.from(new Set((data || []).map((r) => r.instructor_id)))
  const { data: profiles } = instructorIds.length
    ? await admin.from('profiles').select('id, full_name').in('id', instructorIds)
    : { data: [] as Array<{ id: string; full_name: string }> }

  const names = new Map((profiles || []).map((p) => [p.id, p.full_name]))
  const out = (data || []).map((r) => ({
    class_id: r.class_id,
    instructor_id: r.instructor_id,
    profiles: names.has(r.instructor_id) ? { id: r.instructor_id, full_name: names.get(r.instructor_id)! } : null,
  }))

  return NextResponse.json(out)
}
