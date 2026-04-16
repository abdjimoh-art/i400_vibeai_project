'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Profile = { id: string; full_name: string; role: string }
type ClassRow = {
  id: string; day_of_week: string; time_slot: string; ice_location: string
  levels: { id: string; name: string }
}
type Enrollment = {
  id: string; skater_id: string
  skater: { id: string; full_name: string; level: { id: string; name: string } | null }
}
type AttendanceRecord = { id: string; skater_id: string; session_date: string; present: boolean }
type Skill = { id: string; name: string; passing_standard: string | null; order_index: number; level_id: string }
type SkillCompletion = { id: string; skill_id: string; completed_date: string }

export default function InstructorDashboard() {
  const router = useRouter()
  const supabase = createClient()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [classes, setClasses] = useState<ClassRow[]>([])

  // Selected class
  const [selectedClassId, setSelectedClassId] = useState('')
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [sessionDates, setSessionDates] = useState<string[]>([])

  // Skills view
  const [view, setView] = useState<'attendance' | 'skills'>('attendance')
  const [selectedSkaterId, setSelectedSkaterId] = useState('')
  const [skills, setSkills] = useState<Skill[]>([])
  const [completions, setCompletions] = useState<SkillCompletion[]>([])

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user
    if (!user) { router.push('/login'); return }

    const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (prof?.role !== 'instructor') { router.push('/login'); return }
    setProfile(prof)

    const { data: cls } = await supabase
      .from('classes')
      .select('id, day_of_week, time_slot, ice_location, levels(id, name)')
      .eq('instructor_id', user.id)
      .order('day_of_week')

    setClasses((cls as unknown as ClassRow[]) || [])
    setLoading(false)
  }

  async function selectClass(classId: string) {
    setSelectedClassId(classId)
    setSelectedSkaterId('')
    setView('attendance')

    const [enrollRes, attendRes] = await Promise.all([
      fetch(`/api/enrollments?class_id=${classId}`),
      fetch(`/api/attendance?class_id=${classId}`),
    ])

    if (enrollRes.ok) setEnrollments(await enrollRes.json())
    if (attendRes.ok) {
      const records: AttendanceRecord[] = await attendRes.json()
      setAttendance(records)
      const dates = [...new Set(records.map(r => r.session_date))].sort()
      setSessionDates(dates)
    }
  }

  async function addSessionDate() {
    const today = new Date().toISOString().split('T')[0]
    if (sessionDates.includes(today)) return
    setSessionDates([...sessionDates, today].sort())
    // Create absent records for all enrolled skaters
    const records = enrollments.map(e => ({ skater_id: e.skater_id, session_date: today, present: false }))
    await fetch('/api/attendance', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ class_id: selectedClassId, records })
    })
    const res = await fetch(`/api/attendance?class_id=${selectedClassId}`)
    if (res.ok) setAttendance(await res.json())
  }

  async function toggleAttendance(skaterId: string, date: string) {
    const existing = attendance.find(a => a.skater_id === skaterId && a.session_date === date)
    const newPresent = !existing?.present
    await fetch('/api/attendance', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ class_id: selectedClassId, records: [{ skater_id: skaterId, session_date: date, present: newPresent }] })
    })
    setAttendance(prev =>
      prev.some(a => a.skater_id === skaterId && a.session_date === date)
        ? prev.map(a => a.skater_id === skaterId && a.session_date === date ? { ...a, present: newPresent } : a)
        : [...prev, { id: '', skater_id: skaterId, session_date: date, present: newPresent }]
    )
  }

  async function selectSkater(skaterId: string) {
    setSelectedSkaterId(skaterId)
    setView('skills')
    const skater = enrollments.find(e => e.skater_id === skaterId)?.skater
    if (!skater?.level?.id) return

    const [skillsRes, compRes] = await Promise.all([
      fetch(`/api/skills?level_id=${skater.level.id}`),
      fetch(`/api/skill-completions?skater_id=${skaterId}`),
    ])
    if (skillsRes.ok) setSkills(await skillsRes.json())
    if (compRes.ok) setCompletions(await compRes.json())
  }

  async function toggleSkill(skillId: string) {
    const existing = completions.find(c => c.skill_id === skillId)
    if (existing) {
      await fetch('/api/skill-completions', {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skater_id: selectedSkaterId, skill_id: skillId })
      })
      setCompletions(prev => prev.filter(c => c.skill_id !== skillId))
    } else {
      const today = new Date().toISOString().split('T')[0]
      const res = await fetch('/api/skill-completions', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skater_id: selectedSkaterId, skill_id: skillId, completed_date: today, instructor_id: profile?.id })
      })
      if (res.ok) {
        const data = await res.json()
        setCompletions(prev => [...prev, data])
      }
    }
  }

  function getAttendance(skaterId: string, date: string): boolean {
    return attendance.find(a => a.skater_id === skaterId && a.session_date === date)?.present || false
  }

  async function handleLogout() { await supabase.auth.signOut(); router.push('/login') }

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center"><p className="text-slate-400">Loading…</p></div>
  )

  const selectedSkater = enrollments.find(e => e.skater_id === selectedSkaterId)?.skater
  const completedIds = new Set(completions.map(c => c.skill_id))

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-[#7B1113] text-white px-6 py-3.5 flex justify-between items-center border-b border-[#6a0f10]">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">⛸️</span>
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-base tracking-tight">IceTrack</span>
            <span className="text-xs text-red-200 font-normal">Instructor</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-red-100 hidden sm:block">{profile?.full_name}</span>
          <button onClick={handleLogout} className="text-sm bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg font-medium">Sign out</button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
          <h2 className="text-base font-semibold text-slate-900">Hello, {profile?.full_name}</h2>
          <p className="text-slate-500 text-sm mt-0.5">Frank Southern Ice Arena · <span className="text-[#7B1113] font-medium">Instructor</span></p>
        </div>

        {/* My Classes */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
          <h3 className="text-base font-semibold text-slate-900 mb-3">My Classes</h3>
          {classes.length === 0 ? (
            <p className="text-slate-400 text-sm">You have no classes assigned.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {classes.map(c => (
                <button key={c.id} onClick={() => selectClass(c.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition border ${selectedClassId === c.id ? 'bg-[#7B1113] text-white border-[#7B1113]' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}`}>
                  {c.levels.name} — {c.day_of_week} {c.time_slot}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Attendance / Skills Content */}
        {selectedClassId && (
          <>
            {/* Sub-tabs */}
            <div className="flex gap-1 mb-4 bg-white rounded-xl shadow-sm p-1">
              <button onClick={() => setView('attendance')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition ${view === 'attendance' ? 'bg-[#7B1113] text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                Attendance
              </button>
              <button onClick={() => { if (selectedSkaterId) setView('skills') }}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition ${view === 'skills' ? 'bg-[#7B1113] text-white' : 'text-gray-600 hover:bg-gray-100'} ${!selectedSkaterId ? 'opacity-50 cursor-not-allowed' : ''}`}>
                Skill Check-offs {selectedSkater ? `— ${selectedSkater.full_name}` : ''}
              </button>
            </div>

            {/* ATTENDANCE VIEW */}
            {view === 'attendance' && (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-gray-800">Attendance Grid</h3>
                  <button onClick={addSessionDate} className="bg-[#7B1113] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#5e0d0f] transition">
                    + Add Today&apos;s Session
                  </button>
                </div>
                {enrollments.length === 0 ? (
                  <p className="text-gray-400 text-sm">No skaters enrolled in this class.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="text-left px-3 py-2 text-gray-600 text-xs uppercase sticky left-0 bg-gray-50 min-w-[150px]">Skater</th>
                          {sessionDates.map(d => (
                            <th key={d} className="text-center px-2 py-2 text-gray-600 text-xs min-w-[80px]">
                              {new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </th>
                          ))}
                          <th className="text-center px-3 py-2 text-gray-600 text-xs uppercase">Skills</th>
                        </tr>
                      </thead>
                      <tbody>
                        {enrollments.map((en, i) => (
                          <tr key={en.skater_id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-3 py-2 font-medium text-gray-800 sticky left-0 bg-inherit">{en.skater.full_name}</td>
                            {sessionDates.map(d => {
                              const present = getAttendance(en.skater_id, d)
                              return (
                                <td key={d} className="text-center px-2 py-2">
                                  <button onClick={() => toggleAttendance(en.skater_id, d)}
                                    className={`w-8 h-8 rounded-full text-sm font-bold transition ${present ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400 hover:bg-gray-300'}`}>
                                    {present ? '✓' : '—'}
                                  </button>
                                </td>
                              )
                            })}
                            <td className="text-center px-3 py-2">
                              <button onClick={() => selectSkater(en.skater_id)}
                                className="text-[#7B1113] hover:underline text-xs font-medium">View Skills</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* SKILLS VIEW */}
            {view === 'skills' && selectedSkater && (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-800">
                    Skills — {selectedSkater.full_name}
                  </h3>
                  <p className="text-sm text-gray-500">Level: {selectedSkater.level?.name || 'Unknown'}</p>
                  <p className="text-xs text-gray-400 mt-1">Check off skills as the skater demonstrates them. One skill per session is typical.</p>
                </div>
                <div className="space-y-2">
                  {skills.length === 0 ? (
                    <p className="text-gray-400 text-sm">No skills defined for this level.</p>
                  ) : skills.map(skill => {
                    const done = completedIds.has(skill.id)
                    const completion = completions.find(c => c.skill_id === skill.id)
                    return (
                      <div key={skill.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition cursor-pointer ${done ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                        onClick={() => toggleSkill(skill.id)}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${done ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                          {done ? '✓' : skill.order_index}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${done ? 'text-green-800' : 'text-gray-800'}`}>{skill.name}</p>
                          {skill.passing_standard && <p className="text-xs text-gray-500 truncate">{skill.passing_standard}</p>}
                        </div>
                        {done && completion && (
                          <span className="text-xs text-green-600 flex-shrink-0">
                            {new Date(completion.completed_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
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
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
