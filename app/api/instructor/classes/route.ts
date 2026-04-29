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
  if (profile?.role !== 'instructor') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const admin = getAdminClient()
  const { data: primaryClasses, error: primaryErr } = await admin
    .from('classes')
    .select('id, day_of_week, time_slot, ice_location, levels(id, name)')
    .eq('instructor_id', user.id)

  if (primaryErr) return NextResponse.json({ error: primaryErr.message }, { status: 500 })

  const classesById = new Map<string, unknown>()
  for (const c of primaryClasses || []) classesById.set(c.id, c)

  const { data: links, error: linkErr } = await admin
    .from('class_instructors')
    .select('class_id')
    .eq('instructor_id', user.id)

  if (!linkErr && links?.length) {
    const classIds = Array.from(new Set(links.map((l) => l.class_id)))
    const { data: linkedClasses, error: linkedErr } = await admin
      .from('classes')
      .select('id, day_of_week, time_slot, ice_location, levels(id, name)')
      .in('id', classIds)
    if (linkedErr) return NextResponse.json({ error: linkedErr.message }, { status: 500 })
    for (const c of linkedClasses || []) classesById.set(c.id, c)
  }

  return NextResponse.json(Array.from(classesById.values()))
}
