'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { isValidUuid } from '@/lib/utils/classHelpers'

const VALID_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const VALID_LOCATIONS = ['Zone A', 'Zone B', 'Zone C', 'Zone D', 'Center Ice']

export async function upsertClass(
  payload: {
    levelId: string
    instructorId: string
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
  if (payload.instructorId && !isValidUuid(payload.instructorId)) return { error: 'Invalid instructor' }
  if (!VALID_DAYS.includes(payload.day)) return { error: 'Invalid day of week' }
  if (!VALID_LOCATIONS.includes(payload.location)) return { error: 'Invalid ice location' }
  const timeSlot = payload.time?.trim().slice(0, 20)
  if (!timeSlot) return { error: 'Time slot is required' }

  const data = {
    level_id: payload.levelId,
    instructor_id: payload.instructorId || null,
    day_of_week: payload.day,
    time_slot: timeSlot,
    ice_location: payload.location,
  }

  const { error } = payload.editId
    ? await supabase.from('classes').update(data).eq('id', payload.editId)
    : await supabase.from('classes').insert(data)

  if (error) return { error: error.message }
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
