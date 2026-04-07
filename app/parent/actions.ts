'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { isValidUuid } from '@/lib/utils/classHelpers'

export async function enrollInClass(classId: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'parent') return { error: 'Forbidden' }

  if (!isValidUuid(classId)) return { error: 'Invalid class ID' }

  // skater_id = parent_id: Phase 2 simplification (no separate skaters table yet)
  const { error } = await supabase.from('enrollments').insert({
    class_id: classId,
    skater_id: user.id,
    parent_id: user.id,
    is_makeup: false,
  })

  if (error) {
    if (error.code === '23505') return { error: 'Already enrolled in this class' }
    return { error: error.message }
  }

  revalidatePath('/parent/dashboard')
  return {}
}

export async function withdrawFromClass(enrollmentId: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  if (!isValidUuid(enrollmentId)) return { error: 'Invalid enrollment ID' }

  // RLS policy ensures parents can only delete their own enrollments
  const { error } = await supabase
    .from('enrollments')
    .delete()
    .eq('id', enrollmentId)
    .eq('parent_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/parent/dashboard')
  return {}
}
