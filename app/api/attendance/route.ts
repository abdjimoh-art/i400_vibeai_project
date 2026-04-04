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

async function getAuthUser() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function GET(request: Request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const class_id = searchParams.get('class_id')
  if (!class_id) return NextResponse.json({ error: 'class_id is required' }, { status: 400 })

  const admin = getAdminClient()
  const { data, error } = await admin
    .from('attendance_records')
    .select('*')
    .eq('class_id', class_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { class_id, records } = await request.json()
  if (!class_id || !records || !Array.isArray(records)) {
    return NextResponse.json({ error: 'class_id and records array are required' }, { status: 400 })
  }

  const rows = records.map((r: { skater_id: string; session_date: string; present: boolean }) => ({
    class_id,
    skater_id: r.skater_id,
    session_date: r.session_date,
    present: r.present,
  }))

  const admin = getAdminClient()
  const { data, error } = await admin
    .from('attendance_records')
    .upsert(rows, { onConflict: 'class_id,skater_id,session_date' })
    .select()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
