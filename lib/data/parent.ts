import { createClient } from '@/lib/supabase/server'

export type AvailableClass = {
  id: string
  day_of_week: string
  time_slot: string
  ice_location: string
  season: string
  levels: { name: string; order_index: number }
  profiles: { full_name: string } | null
}

export type Enrollment = {
  id: string
  class_id: string
  classes: AvailableClass
}

export async function getAvailableClasses(): Promise<AvailableClass[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('classes')
    .select('id, day_of_week, time_slot, ice_location, season, levels(name, order_index), profiles(full_name)')
    .order('day_of_week')

  if (error) throw new Error(error.message)
  return (data as unknown as AvailableClass[]) ?? []
}

export async function getParentEnrollments(parentId: string): Promise<Enrollment[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('enrollments')
    .select('id, class_id, classes(id, day_of_week, time_slot, ice_location, season, levels(name, order_index), profiles(full_name))')
    .eq('parent_id', parentId)

  if (error) throw new Error(error.message)
  return (data as unknown as Enrollment[]) ?? []
}
