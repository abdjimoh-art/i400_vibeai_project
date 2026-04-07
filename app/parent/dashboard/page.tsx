import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAvailableClasses, getParentEnrollments } from '@/lib/data/parent'
import { filterAvailableClasses, sortClassesByDayAndTime } from '@/lib/utils/classHelpers'
import { EnrollButton } from './EnrollButton'
import { WithdrawButton } from './WithdrawButton'
import { LogoutButton } from './LogoutButton'

export default async function ParentDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'parent') redirect('/login')

  const [allClasses, myEnrollments] = await Promise.all([
    getAvailableClasses(),
    getParentEnrollments(user.id),
  ])

  const enrolledClassIds = myEnrollments.map(e => e.class_id)
  const availableClasses = sortClassesByDayAndTime(
    filterAvailableClasses(allClasses, enrolledClassIds)
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-[#7B1113] text-white px-6 py-4 flex justify-between items-center shadow">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⛸️</span>
          <div>
            <h1 className="font-bold text-lg leading-tight">IceTrack</h1>
            <p className="text-xs text-red-200">Parent Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm hidden sm:block">👤 {profile.full_name}</span>
          <LogoutButton />
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-800">Hello, {profile.full_name} 👋</h2>
          <p className="text-gray-500 text-sm mt-1">
            You are logged in as <span className="font-semibold text-[#7B1113]">Parent</span> — Frank Southern Ice Arena · Spring 2026
          </p>
        </div>

        {/* My Enrollments */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">My Enrollments</h3>

          {myEnrollments.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">
              You haven&apos;t enrolled in any classes yet. Browse available classes below.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wide">
                    <th className="text-left px-3 py-2 rounded-l">Level</th>
                    <th className="text-left px-3 py-2">Day & Time</th>
                    <th className="text-left px-3 py-2">Location</th>
                    <th className="text-left px-3 py-2">Instructor</th>
                    <th className="text-left px-3 py-2 rounded-r">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {myEnrollments.map((enr, i) => (
                    <tr key={enr.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-3 py-3 font-medium text-gray-800">{enr.classes.levels.name}</td>
                      <td className="px-3 py-3 text-gray-600">{enr.classes.day_of_week} at {enr.classes.time_slot}</td>
                      <td className="px-3 py-3">
                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">
                          {enr.classes.ice_location}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-gray-600">
                        {enr.classes.profiles?.full_name || <span className="text-gray-400 italic">TBD</span>}
                      </td>
                      <td className="px-3 py-3">
                        <WithdrawButton enrollmentId={enr.id} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Browse Available Classes */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Available Classes</h3>

          {availableClasses.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">
              You are enrolled in all available classes.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wide">
                    <th className="text-left px-3 py-2 rounded-l">Level</th>
                    <th className="text-left px-3 py-2">Day & Time</th>
                    <th className="text-left px-3 py-2">Location</th>
                    <th className="text-left px-3 py-2">Instructor</th>
                    <th className="text-left px-3 py-2 rounded-r">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {availableClasses.map((cls, i) => (
                    <tr key={cls.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-3 py-3 font-medium text-gray-800">{cls.levels.name}</td>
                      <td className="px-3 py-3 text-gray-600">{cls.day_of_week} at {cls.time_slot}</td>
                      <td className="px-3 py-3">
                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">
                          {cls.ice_location}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-gray-600">
                        {cls.profiles?.full_name || <span className="text-gray-400 italic">TBD</span>}
                      </td>
                      <td className="px-3 py-3">
                        <EnrollButton classId={cls.id} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
