import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getInstructorClasses } from '@/lib/data/instructor'
import { sortClassesByDayAndTime } from '@/lib/utils/classHelpers'
import { LogoutButton } from './LogoutButton'

export default async function InstructorDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'instructor') redirect('/login')

  const classes = sortClassesByDayAndTime(await getInstructorClasses(user.id))

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-[#7B1113] text-white px-6 py-4 flex justify-between items-center shadow">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⛸️</span>
          <div>
            <h1 className="font-bold text-lg leading-tight">IceTrack</h1>
            <p className="text-xs text-red-200">Instructor Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm hidden sm:block">👤 {profile.full_name}</span>
          <LogoutButton />
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800">Hello, {profile.full_name} 👋</h2>
          <p className="text-gray-500 text-sm mt-1">
            You are logged in as <span className="font-semibold text-[#7B1113]">Instructor</span> — Frank Southern Ice Arena · Spring 2026
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-5">My Classes</h3>

          {classes.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">
              You have no classes assigned yet. Contact the admin to get assigned to a class.
            </p>
          ) : (
            <div className="space-y-4">
              {classes.map(cls => (
                <div key={cls.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-800">{cls.levels.name}</h4>
                      <p className="text-sm text-gray-500">
                        {cls.day_of_week} at {cls.time_slot} —{' '}
                        <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-xs font-medium">
                          {cls.ice_location}
                        </span>
                      </p>
                    </div>
                    <span className="text-xs text-gray-400">{cls.season}</span>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Enrolled Skaters ({cls.enrollments.length})
                    </p>
                    {cls.enrollments.length === 0 ? (
                      <p className="text-xs text-gray-400 italic">No skaters enrolled yet.</p>
                    ) : (
                      <ul className="space-y-1">
                        {cls.enrollments.map(e => (
                          <li key={e.skater_id} className="text-sm text-gray-700 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#7B1113] inline-block" />
                            {e.profiles.full_name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
