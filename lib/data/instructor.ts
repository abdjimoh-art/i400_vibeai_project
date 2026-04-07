import { createClient } from '@/lib/supabase/server'

export type EnrolledSkater = {
  skater_id: string
  profiles: { full_name: string }
}

export type ClassWithRoster = {
  id: string
  day_of_week: string
  time_slot: string
  ice_location: string
  season: string
  levels: { name: string }
  enrollments: EnrolledSkater[]
}

export async function getInstructorClasses(instructorId: string): Promise<ClassWithRoster[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('classes')
    .select(`
      id, day_of_week, time_slot, ice_location, season,
      levels(name),
      enrollments(skater_id, profiles(full_name))
    `)
    .eq('instructor_id', instructorId)
    .order('day_of_week')

  if (error) throw new Error(error.message)
  return (data as unknown as ClassWithRoster[]) ?? []
}
