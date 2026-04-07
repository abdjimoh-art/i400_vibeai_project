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

export async function POST(request: Request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { show_id, name, show_half, level_ids } = await request.json()
  if (!show_id || !name || !level_ids || !Array.isArray(level_ids)) {
    return NextResponse.json({ error: 'show_id, name, and level_ids are required' }, { status: 400 })
  }

  const admin = getAdminClient()

  const { data: group, error: groupError } = await admin
    .from('show_groups')
    .insert({ show_id, name, show_half: show_half || 'First Half' })
    .select()
    .single()

  if (groupError) return NextResponse.json({ error: groupError.message }, { status: 500 })

  if (level_ids.length > 0) {
    const mappings = level_ids.map((level_id: string) => ({
      group_id: group.id,
      level_id,
    }))

    const { error: mappingError } = await admin
      .from('show_group_levels')
      .insert(mappings)

    if (mappingError) return NextResponse.json({ error: mappingError.message }, { status: 500 })
  }

  return NextResponse.json(group, { status: 201 })
}

export async function DELETE(request: Request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id query param is required' }, { status: 400 })

  const admin = getAdminClient()
  const { error } = await admin.from('show_groups').delete().eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
