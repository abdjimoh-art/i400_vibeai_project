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

export async function GET() {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = getAdminClient()
  const { data, error } = await admin
    .from('skating_shows')
    .select(`
      *,
      groups:show_groups(
        *,
        levels:show_group_levels(*, level:levels(*)),
        practices:show_practices(*)
      )
    `)
    .order('show_date', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, theme, show_date, show_time, location } = await request.json()
  if (!name || !show_date) {
    return NextResponse.json({ error: 'name and show_date are required' }, { status: 400 })
  }

  const admin = getAdminClient()
  const { data, error } = await admin
    .from('skating_shows')
    .insert({ name, theme: theme || null, show_date, show_time: show_time || null, location: location || null })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

export async function PUT(request: Request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, name, theme, show_date, show_time, location } = await request.json()
  if (!id || !name || !show_date) {
    return NextResponse.json({ error: 'id, name, and show_date are required' }, { status: 400 })
  }

  const admin = getAdminClient()
  const { data, error } = await admin
    .from('skating_shows')
    .update({ name, theme: theme || null, show_date, show_time: show_time || null, location: location || null })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(request: Request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id query param is required' }, { status: 400 })

  const admin = getAdminClient()
  const { error } = await admin.from('skating_shows').delete().eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
