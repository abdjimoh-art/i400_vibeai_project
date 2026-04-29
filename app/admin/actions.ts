'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { isValidUuid } from '@/lib/utils/classHelpers'

const VALID_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const VALID_LOCATIONS = ['Zone A', 'Zone B', 'Zone C', 'Zone D', 'Center Ice']

export async function upsertClass(
  payload: {
    levelId: string
    instructorIds: string[]
    day: string
    time: string
    location: string
    editId: string | null
  }
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { error: 'Forbidden' }

  if (!isValidUuid(payload.levelId)) return { error: 'Invalid level' }
  if (!Array.isArray(payload.instructorIds) || payload.instructorIds.length === 0) return { error: 'At least one instructor is required' }
  if (payload.instructorIds.some((id) => !isValidUuid(id))) return { error: 'Invalid instructor selection' }
  if (!VALID_DAYS.includes(payload.day)) return { error: 'Invalid day of week' }
  if (!VALID_LOCATIONS.includes(payload.location)) return { error: 'Invalid ice location' }
  const timeSlot = payload.time?.trim().slice(0, 20)
  if (!timeSlot) return { error: 'Time slot is required' }

  const primaryInstructorId = payload.instructorIds[0]
  const data = {
    level_id: payload.levelId,
    instructor_id: primaryInstructorId,
    day_of_week: payload.day,
    time_slot: timeSlot,
    ice_location: payload.location,
  }

  let classId = payload.editId
  const { error, data: classRows } = payload.editId
    ? await supabase.from('classes').update(data).eq('id', payload.editId).select('id')
    : await supabase.from('classes').insert(data).select('id')

  if (error) return { error: error.message }
  if (!classId) classId = classRows?.[0]?.id
  if (!classId) return { error: 'Failed to resolve class id' }

  // Keep supplemental instructor assignments in sync when the mapping table exists.
  const { error: wipeError } = await supabase.from('class_instructors').delete().eq('class_id', classId)
  if (wipeError && !wipeError.message.toLowerCase().includes('relation "public.class_instructors" does not exist')) {
    return { error: wipeError.message }
  }
  if (!wipeError) {
    const rows = payload.instructorIds.map((instructorId) => ({ class_id: classId, instructor_id: instructorId }))
    const { error: mapError } = await supabase.from('class_instructors').insert(rows)
    if (mapError) return { error: mapError.message }
  }

  revalidatePath('/admin/dashboard')
  return {}
}

export async function deleteClass(classId: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { error: 'Forbidden' }

  if (!isValidUuid(classId)) return { error: 'Invalid class ID' }

  const { error } = await supabase.from('classes').delete().eq('id', classId)
  if (error) return { error: error.message }

  revalidatePath('/admin/dashboard')
  return {}
}
