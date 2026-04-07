'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Profile = { id: string; full_name: string; role: string }
type Skater = {
  id: string; full_name: string
  level: { id: string; name: string } | null
}
type Enrollment = {
  id: string; class_id: string
  class: { id: string; day_of_week: string; time_slot: string; ice_location: string; levels: { name: string } }
}
type AttendanceRecord = { id: string; class_id: string; skater_id: string; session_date: string; present: boolean }
type Skill = { id: string; name: string; passing_standard: string | null; order_index: number }
type SkillCompletion = { id: string; skill_id: string; completed_date: string }
type Show = {
  id: string; name: string; theme: string | null; show_date: string; show_time: string | null; location: string | null
  groups: ShowGroup[]
}
type ShowGroup = {
  id: string; name: string; show_half: string
  levels: { id: string; level: { id: string; name: string } }[]
  practices: { id: string; practice_date: string; start_time: string; end_time: string; label: string | null }[]
}

export default function ParentDashboard() {
  const router = useRouter()
  const supabase = createClient()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [skaters, setSkaters] = useState<Skater[]>([])
  const [selectedSkaterId, setSelectedSkaterId] = useState('')

  // Per-skater data
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [skills, setSkills] = useState<Skill[]>([])
  const [completions, setCompletions] = useState<SkillCompletion[]>([])
  const [shows, setShows] = useState<Show[]>([])
  const [skaterView, setSkaterView] = useState<'classes' | 'skills' | 'show'>('classes')

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user
    if (!user) { router.push('/login'); return }

    const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (prof?.role !== 'parent') { router.push('/login'); return }
    setProfile(prof)

    // Get my children
    const skatersRes = await fetch('/api/skaters')
    if (skatersRes.ok) {
      const allSkaters: (Skater & { parent: { id: string } | null })[] = await skatersRes.json()
      const myKids = allSkaters.filter(s => s.parent?.id === user.id)
      setSkaters(myKids)
      if (myKids.length > 0) selectSkater(myKids[0].id, myKids[0].level?.id)
    }

    // Load shows
    const showsRes = await fetch('/api/skating-shows')
    if (showsRes.ok) setShows(await showsRes.json())

    setLoading(false)
  }

  async function selectSkater(skaterId: string, levelId?: string) {
    setSelectedSkaterId(skaterId)
    setSkaterView('classes')

    // Get enrollments (we need to find which classes this skater is in)
    // We'll fetch all classes and check enrollments
    const { data: allClasses } = await supabase
      .from('classes')
      .select('id, day_of_week, time_slot, ice_location, levels(name)')

    const enrolledClasses: Enrollment[] = []
    const allAttendance: AttendanceRecord[] = []

    if (allClasses) {
      for (const cls of allClasses) {
        const res = await fetch(`/api/enrollments?class_id=${cls.id}`)
        if (res.ok) {
          const enrs = await res.json()
          const match = enrs.find((e: { skater_id: string }) => e.skater_id === skaterId)
          if (match) {
            enrolledClasses.push({ id: match.id, class_id: cls.id, class: cls as unknown as Enrollment['class'] })
            // Get attendance for this class
            const attRes = await fetch(`/api/attendance?class_id=${cls.id}`)
            if (attRes.ok) {
              const attRecords: AttendanceRecord[] = await attRes.json()
              allAttendance.push(...attRecords.filter(a => a.skater_id === skaterId))
            }
          }
        }
      }
    }

    setEnrollments(enrolledClasses)
    setAttendance(allAttendance)

    // Get skills + completions
    if (levelId) {
      const [skillsRes, compRes] = await Promise.all([
        fetch(`/api/skills?level_id=${levelId}`),
        fetch(`/api/skill-completions?skater_id=${skaterId}`),
      ])
      if (skillsRes.ok) setSkills(await skillsRes.json())
      if (compRes.ok) setCompletions(await compRes.json())
    }
  }

  function generateICS(show: Show, group: ShowGroup) {
    let ics = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//IceTrack//EN\n'

    // Add show event
    const showDate = show.show_date.replace(/-/g, '')
    ics += `BEGIN:VEVENT\nSUMMARY:${show.name}\nDTSTART;VALUE=DATE:${showDate}\n`
    if (show.location) ics += `LOCATION:${show.location}\n`
    if (show.theme) ics += `DESCRIPTION:Theme: ${show.theme}\\nGroup: ${group.name} (${group.show_half})\n`
    ics += 'END:VEVENT\n'

    // Add practice events
    for (const p of group.practices) {
      const pDate = p.practice_date.replace(/-/g, '')
      const startTime = p.start_time.replace(/:/g, '') + '00'
      const endTime = p.end_time.replace(/:/g, '') + '00'
      ics += `BEGIN:VEVENT\nSUMMARY:Practice — ${group.name}${p.label ? ` (${p.label})` : ''}\nDTSTART:${pDate}T${startTime}\nDTEND:${pDate}T${endTime}\n`
      if (show.location) ics += `LOCATION:${show.location}\n`
      ics += 'END:VEVENT\n'
    }

    ics += 'END:VCALENDAR'

    const blob = new Blob([ics], { type: 'text/calendar' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${show.name.replace(/\s+/g, '_')}_schedule.ics`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleLogout() { await supabase.auth.signOut(); router.push('/login') }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>
  )

  const selectedSkater = skaters.find(s => s.id === selectedSkaterId)
  const completedIds = new Set(completions.map(c => c.skill_id))

  // Find shows relevant to this skater's level
  const skaterShows = selectedSkater?.level ? shows.filter(show =>
    show.groups?.some(g => g.levels?.some(gl => gl.level?.id === selectedSkater.level?.id))
  ) : []

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
          <span className="text-sm hidden sm:block">👤 {profile?.full_name}</span>
          <button onClick={handleLogout} className="text-sm bg-white text-[#7B1113] px-3 py-1 rounded-lg font-medium hover:bg-red-50 transition">Logout</button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800">Hello, {profile?.full_name} 👋</h2>
          <p className="text-gray-500 text-sm mt-1">You are logged in as <span className="font-semibold text-[#7B1113]">Parent</span></p>
        </div>

        {/* Children */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-3">My Children</h3>
          {skaters.length === 0 ? (
            <p className="text-gray-400 text-sm">No children linked to your account yet. Contact the admin to add your children.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {skaters.map(s => (
                <button key={s.id} onClick={() => selectSkater(s.id, s.level?.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition border ${selectedSkaterId === s.id ? 'bg-[#7B1113] text-white border-[#7B1113]' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
                  {s.full_name} <span className="opacity-70">({s.level?.name || 'No level'})</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Skater Details */}
        {selectedSkater && (
          <>
            <div className="flex gap-1 mb-4 bg-white rounded-xl shadow-sm p-1">
              <button onClick={() => setSkaterView('classes')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition ${skaterView === 'classes' ? 'bg-[#7B1113] text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                Classes & Attendance
              </button>
              <button onClick={() => setSkaterView('skills')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition ${skaterView === 'skills' ? 'bg-[#7B1113] text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                Skill Card
              </button>
              {skaterShows.length > 0 && (
                <button onClick={() => setSkaterView('show')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition ${skaterView === 'show' ? 'bg-[#7B1113] text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                  Skating Show
                </button>
              )}
            </div>

            {/* CLASSES & ATTENDANCE */}
            {skaterView === 'classes' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">{selectedSkater.full_name} — Classes & Attendance</h3>
                {enrollments.length === 0 ? (
                  <p className="text-gray-400 text-sm">Not enrolled in any classes.</p>
                ) : enrollments.map(en => {
                  const classAttendance = attendance.filter(a => a.class_id === en.class_id).sort((a, b) => a.session_date.localeCompare(b.session_date))
                  const presentCount = classAttendance.filter(a => a.present).length
                  return (
                    <div key={en.id} className="border border-gray-200 rounded-lg p-4 mb-3">
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <span className="font-medium text-gray-800">{en.class.levels.name}</span>
                          <span className="text-sm text-gray-500 ml-2">{en.class.day_of_week} {en.class.time_slot} — {en.class.ice_location}</span>
                        </div>
                        <span className="text-sm text-gray-600">{presentCount}/{classAttendance.length} sessions attended</span>
                      </div>
                      {classAttendance.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {classAttendance.map(a => (
                            <span key={a.id || a.session_date}
                              className={`text-xs px-2 py-1 rounded ${a.present ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {new Date(a.session_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              {a.present ? ' ✓' : ' ✗'}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* SKILL CARD */}
            {skaterView === 'skills' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-1">{selectedSkater.full_name} — Skill Card</h3>
                <p className="text-sm text-gray-500 mb-4">Level: {selectedSkater.level?.name || 'Unknown'}</p>
                <div className="space-y-2">
                  {skills.length === 0 ? (
                    <p className="text-gray-400 text-sm">No skills defined for this level.</p>
                  ) : skills.map(skill => {
                    const done = completedIds.has(skill.id)
                    const completion = completions.find(c => c.skill_id === skill.id)
                    return (
                      <div key={skill.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border ${done ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${done ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                          {done ? '✓' : skill.order_index}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${done ? 'text-green-800' : 'text-gray-800'}`}>{skill.name}</p>
                          {skill.passing_standard && <p className="text-xs text-gray-500 truncate">{skill.passing_standard}</p>}
                        </div>
                        {done && completion && (
                          <span className="text-xs text-green-600 flex-shrink-0">
                            Completed {new Date(completion.completed_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-600">
                    Progress: <span className="font-semibold text-[#7B1113]">{completions.length}</span> / {skills.length} skills completed
                  </p>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-[#7B1113] h-2 rounded-full transition-all" style={{ width: skills.length > 0 ? `${(completions.length / skills.length) * 100}%` : '0%' }} />
                  </div>
                </div>
              </div>
            )}

            {/* SKATING SHOW */}
            {skaterView === 'show' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">{selectedSkater.full_name} — Skating Show</h3>
                {skaterShows.map(show => {
                  const relevantGroups = show.groups?.filter(g =>
                    g.levels?.some(gl => gl.level?.id === selectedSkater.level?.id)
                  ) || []
                  return (
                    <div key={show.id} className="border border-gray-200 rounded-lg p-4 mb-3">
                      <h4 className="font-bold text-gray-800">{show.name}</h4>
                      <p className="text-sm text-gray-500">
                        {show.show_date}{show.show_time ? ` at ${show.show_time}` : ''}{show.location ? ` — ${show.location}` : ''}
                      </p>
                      {show.theme && <p className="text-sm text-purple-600 mt-1">Theme: {show.theme}</p>}

                      {relevantGroups.map(g => (
                        <div key={g.id} className="mt-3 bg-gray-50 rounded-lg p-3">
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="font-medium text-gray-800 text-sm">{g.name}</span>
                              <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{g.show_half}</span>
                            </div>
                            <button onClick={() => generateICS(show, g)}
                              className="text-[#7B1113] text-xs font-medium hover:underline">
                              Add to Calendar
                            </button>
                          </div>
                          {g.practices && g.practices.length > 0 && (
                            <div className="mt-2 space-y-1">
                              <p className="text-xs font-semibold text-gray-600">Practice Schedule:</p>
                              {g.practices
                                .sort((a, b) => a.practice_date.localeCompare(b.practice_date))
                                .map(p => (
                                  <div key={p.id} className="flex items-center bg-white rounded px-2 py-1 text-xs text-gray-700">
                                    {new Date(p.practice_date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                    {' '}{p.start_time}–{p.end_time}
                                    {p.label && <span className="text-gray-400 ml-1">({p.label})</span>}
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
