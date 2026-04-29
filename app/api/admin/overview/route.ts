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

async function requireAdminProfile() {
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
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: prof } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (prof?.role !== 'admin') return null
  return user
}

const SLOTS_PER_SECTION = 8

/** Aggregates enrollments per level + synthetic capacity from class sections (hi-fi “enrollment by level”). */
export async function GET() {
  const ok = await requireAdminProfile()
  if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = getAdminClient()

  const [{ data: levels }, { data: classes }, { data: enrollments }] = await Promise.all([
    admin.from('levels').select('id, name, order_index').order('order_index'),
    admin.from('classes').select('id, level_id'),
    admin.from('enrollments').select('class_id'),
  ])

  const classToLevel = new Map<string, string>()
  for (const c of classes || []) {
    if (c.level_id) classToLevel.set(c.id, c.level_id)
  }

  const sectionsByLevel = new Map<string, number>()
  for (const c of classes || []) {
    if (!c.level_id) continue
    sectionsByLevel.set(c.level_id, (sectionsByLevel.get(c.level_id) || 0) + 1)
  }

  const enrolledByLevel = new Map<string, number>()
  for (const e of enrollments || []) {
    const lid = classToLevel.get(e.class_id)
    if (!lid) continue
    enrolledByLevel.set(lid, (enrolledByLevel.get(lid) || 0) + 1)
  }

  const levelBars = (levels || []).map((l) => {
    const sections = sectionsByLevel.get(l.id) || 0
    const enrolled = enrolledByLevel.get(l.id) || 0
    const cap = Math.max(sections * SLOTS_PER_SECTION, enrolled, 1)
    return { level_id: l.id, name: l.name, enrolled, cap }
  })

  const { data: showList } = await admin
    .from('skating_shows')
    .select('id, name, theme, show_date, show_time')
    .order('show_date', { ascending: true })
    .limit(1)

  const first = showList?.[0]
  let showcase: {
    id: string
    name: string
    theme: string | null
    show_date: string
    show_time: string | null
    group_count: number
    practice_count: number
  } | null = null

  if (first) {
    const [{ count: gc }, { count: pc }] = await Promise.all([
      admin.from('show_groups').select('id', { count: 'exact', head: true }).eq('show_id', first.id),
      admin.from('show_practices').select('id', { count: 'exact', head: true }).eq('show_id', first.id),
    ])
    showcase = {
      id: first.id,
      name: first.name,
      theme: first.theme,
      show_date: first.show_date,
      show_time: first.show_time,
      group_count: gc ?? 0,
      practice_count: pc ?? 0,
    }
  }

  return NextResponse.json({ levelBars, showcase })
}
