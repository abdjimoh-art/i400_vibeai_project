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

// — SVG Icons —
const IconSnowflake = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <line x1="12" y1="2" x2="12" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/>
    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/><line x1="19.07" y1="4.93" x2="4.93" y2="19.07"/>
    <polyline points="9 5 12 2 15 5"/><polyline points="9 19 12 22 15 19"/>
    <polyline points="5 9 2 12 5 15"/><polyline points="19 9 22 12 19 15"/>
  </svg>
)
const IconSignOut = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
    <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)
const IconPlus = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)
const IconCheck = () => (
  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

function getLevelBadge(name: string) {
  const n = (name || '').toLowerCase()
  if (n.includes('tot')) return 'bg-pink-50 text-pink-700 border-pink-200'
  if (n.includes('pre-alpha') || n.includes('pre alpha')) return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  if (n.includes('alpha')) return 'bg-amber-50 text-amber-700 border-amber-200'
  if (n.includes('beta')) return 'bg-violet-50 text-violet-700 border-violet-200'
  if (n.includes('gamma')) return 'bg-rose-50 text-rose-700 border-rose-200'
  if (n.includes('delta')) return 'bg-cyan-50 text-cyan-700 border-cyan-200'
  if (n.includes('freestyle')) return 'bg-slate-800 text-white border-slate-700'
  if (n.includes('basic')) return 'bg-blue-50 text-blue-700 border-blue-200'
  return 'bg-slate-100 text-slate-600 border-slate-200'
}

export default function InstructorDashboard() {
  const router = useRouter()
  const supabase = createClient()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [classes, setClasses] = useState<ClassRow[]>([])

  const [selectedClassId, setSelectedClassId] = useState('')
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [sessionDates, setSessionDates] = useState<string[]>([])

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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <svg className="animate-spin w-8 h-8 text-[#7B1113]" fill="none" viewBox="0 0 24 24" aria-hidden>
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        <p className="text-slate-500 text-sm font-medium">Loading dashboard…</p>
      </div>
    </div>
  )

  const selectedSkater = enrollments.find(e => e.skater_id === selectedSkaterId)?.skater
  const completedIds = new Set(completions.map(c => c.skill_id))
  const completionPct = skills.length > 0 ? Math.round((completions.length / skills.length) * 100) : 0

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <nav className="bg-[#7B1113] text-white px-6 py-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center flex-shrink-0">
            <IconSnowflake />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-base tracking-tight">IceTrack</span>
            <span className="text-xs text-red-200 font-medium px-2 py-0.5 bg-white/10 rounded-full">Instructor</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-red-100 font-medium hidden sm:block">{profile?.full_name}</span>
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg font-medium cursor-pointer">
            <IconSignOut />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 font-medium">Welcome back</p>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5">{profile?.full_name}</h2>
            <p className="text-sm text-slate-500 mt-1">Frank Southern Ice Arena</p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Instructor
          </span>
        </div>

        {/* My Classes */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
          <h3 className="text-base font-bold text-slate-900 mb-4">My Classes</h3>
          {classes.length === 0 ? (
            <div className="flex items-center gap-3 text-slate-400 text-sm py-4">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              No classes assigned to you yet.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {classes.map(c => (
                <button key={c.id} onClick={() => selectClass(c.id)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition border cursor-pointer ${
                    selectedClassId === c.id
                      ? 'bg-[#7B1113] text-white border-[#7B1113] shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border mr-2 ${getLevelBadge(c.levels.name)} ${selectedClassId === c.id ? 'bg-white/20 border-white/30 text-white' : ''}`}>
                    {c.levels.name}
                  </span>
                  {c.day_of_week} · {c.time_slot}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Attendance / Skills Content */}
        {selectedClassId && (
          <>
            {/* Sub-tabs */}
            <div className="flex gap-1 mb-5 bg-white rounded-2xl border border-slate-200 shadow-sm p-1.5">
              <button onClick={() => setView('attendance')}
                className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition cursor-pointer ${view === 'attendance' ? 'bg-[#7B1113] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
                Attendance
              </button>
              <button onClick={() => { if (selectedSkaterId) setView('skills') }}
                className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition ${view === 'skills' ? 'bg-[#7B1113] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'} ${!selectedSkaterId ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}>
                Skills {selectedSkater ? `— ${selectedSkater.full_name}` : ''}
              </button>
            </div>

            {/* ATTENDANCE VIEW */}
            {view === 'attendance' && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Attendance Grid</h3>
                    <p className="text-sm text-slate-500 mt-0.5">{enrollments.length} skater{enrollments.length !== 1 ? 's' : ''} · {sessionDates.length} session{sessionDates.length !== 1 ? 's' : ''}</p>
                  </div>
                  <button onClick={addSessionDate} className="flex items-center gap-2 bg-[#7B1113] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#6a0f10] transition shadow-sm cursor-pointer">
                    <IconPlus />
                    Add Today
                  </button>
                </div>
                {enrollments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                      <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
                        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
                      </svg>
                    </div>
                    <p className="text-slate-600 font-semibold text-sm">No skaters enrolled</p>
                    <p className="text-slate-400 text-xs mt-1">Ask an admin to enroll skaters in this class.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/60">
                          <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider sticky left-0 bg-slate-50/60 min-w-[160px]">Skater</th>
                          {sessionDates.map(d => (
                            <th key={d} className="text-center px-3 py-3.5 text-xs font-semibold text-slate-500 min-w-[72px]">
                              {new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </th>
                          ))}
                          <th className="text-center px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Skills</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {enrollments.map((en) => {
                          const presentCount = sessionDates.filter(d => getAttendance(en.skater_id, d)).length
                          const pct = sessionDates.length > 0 ? Math.round((presentCount / sessionDates.length) * 100) : 0
                          return (
                            <tr key={en.skater_id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-3.5 sticky left-0 bg-inherit">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-full bg-[#7B1113]/10 flex items-center justify-center text-[#7B1113] text-xs font-bold flex-shrink-0">
                                    {en.skater.full_name.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-slate-900">{en.skater.full_name}</p>
                                    {sessionDates.length > 0 && (
                                      <p className="text-xs text-slate-400">{pct}% attendance</p>
                                    )}
                                  </div>
                                </div>
                              </td>
                              {sessionDates.map(d => {
                                const present = getAttendance(en.skater_id, d)
                                return (
                                  <td key={d} className="text-center px-3 py-3.5">
                                    <button onClick={() => toggleAttendance(en.skater_id, d)}
                                      title={present ? 'Mark absent' : 'Mark present'}
                                      className={`w-9 h-9 rounded-xl flex items-center justify-center mx-auto font-bold transition cursor-pointer ${
                                        present
                                          ? 'bg-green-500 text-white shadow-sm hover:bg-green-600'
                                          : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                      }`}>
                                      {present ? <IconCheck /> : <span className="w-3 h-0.5 bg-current rounded-full block" />}
                                    </button>
                                  </td>
                                )
                              })}
                              <td className="text-center px-6 py-3.5">
                                <button onClick={() => selectSkater(en.skater_id)}
                                  className="text-[#7B1113] hover:text-[#6a0f10] text-xs font-semibold hover:underline transition cursor-pointer">
                                  View Skills
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* SKILLS VIEW */}
            {view === 'skills' && selectedSkater && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-[#7B1113]/10 flex items-center justify-center text-[#7B1113] font-bold">
                      {selectedSkater.full_name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{selectedSkater.full_name}</h3>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border mt-1 ${getLevelBadge(selectedSkater.level?.name || '')}`}>
                        {selectedSkater.level?.name || 'Unknown Level'}
                      </span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="font-medium text-slate-700">Skill Progress</span>
                    <span className="font-bold text-[#7B1113]">{completions.length} / {skills.length}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5">
                    <div
                      className="bg-[#7B1113] h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${completionPct}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1.5">{completionPct}% complete · click a skill to toggle it</p>
                </div>
                <div className="p-6">
                  {skills.length === 0 ? (
                    <p className="text-slate-400 text-sm text-center py-8">No skills defined for this level.</p>
                  ) : (
                    <div className="space-y-2">
                      {skills.map(skill => {
                        const done = completedIds.has(skill.id)
                        const completion = completions.find(c => c.skill_id === skill.id)
                        return (
                          <div key={skill.id}
                            onClick={() => toggleSkill(skill.id)}
                            className={`flex items-center gap-4 p-4 rounded-xl border transition cursor-pointer select-none ${
                              done
                                ? 'bg-green-50 border-green-200 hover:bg-green-100'
                                : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                            }`}>
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition ${
                              done ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-500'
                            }`}>
                              {done ? <IconCheck /> : skill.order_index}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-semibold ${done ? 'text-green-800' : 'text-slate-800'}`}>{skill.name}</p>
                              {skill.passing_standard && <p className="text-xs text-slate-500 mt-0.5 truncate">{skill.passing_standard}</p>}
                            </div>
                            {done && completion && (
                              <span className="text-xs text-green-600 font-medium flex-shrink-0 bg-green-100 px-2 py-1 rounded-lg">
                                {new Date(completion.completed_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
