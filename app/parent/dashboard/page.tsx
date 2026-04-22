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
const IconCheck = () => (
  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const IconCalendar = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)
const IconDownload = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
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

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

const avatarColors = [
  'bg-pink-100 text-pink-700',
  'bg-blue-100 text-blue-700',
  'bg-amber-100 text-amber-700',
  'bg-violet-100 text-violet-700',
  'bg-emerald-100 text-emerald-700',
  'bg-orange-100 text-orange-700',
]

export default function ParentDashboard() {
  const router = useRouter()
  const supabase = createClient()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [skaters, setSkaters] = useState<Skater[]>([])
  const [selectedSkaterId, setSelectedSkaterId] = useState('')

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

    const skatersRes = await fetch('/api/skaters')
    if (skatersRes.ok) {
      const allSkaters: (Skater & { parent: { id: string } | null })[] = await skatersRes.json()
      const myKids = allSkaters.filter(s => s.parent?.id === user.id)
      setSkaters(myKids)
      if (myKids.length > 0) selectSkater(myKids[0].id, myKids[0].level?.id)
    }

    const showsRes = await fetch('/api/skating-shows')
    if (showsRes.ok) setShows(await showsRes.json())

    setLoading(false)
  }

  async function selectSkater(skaterId: string, levelId?: string) {
    setSelectedSkaterId(skaterId)
    setSkaterView('classes')

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
    const showDate = show.show_date.replace(/-/g, '')
    ics += `BEGIN:VEVENT\nSUMMARY:${show.name}\nDTSTART;VALUE=DATE:${showDate}\n`
    if (show.location) ics += `LOCATION:${show.location}\n`
    if (show.theme) ics += `DESCRIPTION:Theme: ${show.theme}\\nGroup: ${group.name} (${group.show_half})\n`
    ics += 'END:VEVENT\n'
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <svg className="animate-spin w-8 h-8 text-[#7B1113]" fill="none" viewBox="0 0 24 24" aria-hidden>
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        <p className="text-slate-500 text-sm font-medium">Loading your dashboard…</p>
      </div>
    </div>
  )

  const selectedSkater = skaters.find(s => s.id === selectedSkaterId)
  const completedIds = new Set(completions.map(c => c.skill_id))
  const completionPct = skills.length > 0 ? Math.round((completions.length / skills.length) * 100) : 0
  const skaterShows = selectedSkater?.level ? shows.filter(show =>
    show.groups?.some(g => g.levels?.some(gl => gl.level?.id === selectedSkater.level?.id))
  ) : []

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
            <span className="text-xs text-red-200 font-medium px-2 py-0.5 bg-white/10 rounded-full">Parent</span>
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

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 font-medium">Welcome back</p>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5">{profile?.full_name}</h2>
            <p className="text-sm text-slate-500 mt-1">Frank Southern Ice Arena</p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Parent
          </span>
        </div>

        {/* Children Selector */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
          <h3 className="text-base font-bold text-slate-900 mb-4">My Children</h3>
          {skaters.length === 0 ? (
            <div className="flex items-start gap-3 text-slate-500 text-sm bg-slate-50 rounded-xl p-4 border border-slate-200">
              <svg className="w-5 h-5 mt-0.5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <p>No children linked to your account yet. Contact the admin to add your children.</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {skaters.map((s, idx) => (
                <button key={s.id} onClick={() => selectSkater(s.id, s.level?.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition cursor-pointer ${
                    selectedSkaterId === s.id
                      ? 'border-[#7B1113] bg-red-50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${avatarColors[idx % avatarColors.length]}`}>
                    {getInitials(s.full_name)}
                  </div>
                  <div className="text-left">
                    <p className={`text-sm font-semibold ${selectedSkaterId === s.id ? 'text-[#7B1113]' : 'text-slate-900'}`}>{s.full_name}</p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border mt-0.5 ${getLevelBadge(s.level?.name || '')}`}>
                      {s.level?.name || 'No level'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Skater Detail */}
        {selectedSkater && (
          <>
            {/* View tabs */}
            <div className="flex gap-1 mb-5 bg-white rounded-2xl border border-slate-200 shadow-sm p-1.5">
              <button onClick={() => setSkaterView('classes')}
                className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition cursor-pointer ${skaterView === 'classes' ? 'bg-[#7B1113] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
                Classes & Attendance
              </button>
              <button onClick={() => setSkaterView('skills')}
                className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition cursor-pointer ${skaterView === 'skills' ? 'bg-[#7B1113] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
                Skill Card
              </button>
              {skaterShows.length > 0 && (
                <button onClick={() => setSkaterView('show')}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition cursor-pointer ${skaterView === 'show' ? 'bg-[#7B1113] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
                  Skating Show
                </button>
              )}
            </div>

            {/* CLASSES & ATTENDANCE */}
            {skaterView === 'classes' && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100">
                  <h3 className="text-lg font-bold text-slate-900">{selectedSkater.full_name} — Classes</h3>
                  <p className="text-sm text-slate-500 mt-0.5">{enrollments.length} class{enrollments.length !== 1 ? 'es' : ''} enrolled</p>
                </div>
                <div className="p-6">
                  {enrollments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                        <IconCalendar />
                      </div>
                      <p className="text-slate-600 font-semibold text-sm">No classes enrolled</p>
                      <p className="text-slate-400 text-xs mt-1">Ask the admin to enroll your child in a class.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {enrollments.map(en => {
                        const classAttendance = attendance.filter(a => a.class_id === en.class_id).sort((a, b) => a.session_date.localeCompare(b.session_date))
                        const presentCount = classAttendance.filter(a => a.present).length
                        const attPct = classAttendance.length > 0 ? Math.round((presentCount / classAttendance.length) * 100) : 0
                        return (
                          <div key={en.id} className="border border-slate-200 rounded-2xl overflow-hidden">
                            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getLevelBadge(en.class.levels.name)}`}>
                                    {en.class.levels.name}
                                  </span>
                                  <span className="text-sm text-slate-600 font-medium">{en.class.day_of_week} · {en.class.time_slot}</span>
                                  <span className="text-xs text-slate-400">{en.class.ice_location}</span>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-bold text-slate-900">{attPct}%</p>
                                  <p className="text-xs text-slate-400">{presentCount}/{classAttendance.length} sessions</p>
                                </div>
                              </div>
                              {classAttendance.length > 0 && (
                                <div className="mt-3 w-full bg-slate-200 rounded-full h-1.5">
                                  <div className={`h-1.5 rounded-full transition-all ${attPct >= 80 ? 'bg-green-500' : attPct >= 60 ? 'bg-amber-500' : 'bg-red-400'}`} style={{ width: `${attPct}%` }} />
                                </div>
                              )}
                            </div>
                            {classAttendance.length > 0 && (
                              <div className="px-5 py-3">
                                <div className="flex flex-wrap gap-1.5">
                                  {classAttendance.map(a => (
                                    <span key={a.id || a.session_date}
                                      className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${
                                        a.present ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'
                                      }`}>
                                      {a.present ? <IconCheck /> : <span className="w-2 h-0.5 bg-current rounded-full" />}
                                      {new Date(a.session_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SKILL CARD */}
            {skaterView === 'skills' && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-12 h-12 rounded-full bg-[#7B1113]/10 flex items-center justify-center text-[#7B1113] font-bold text-lg">
                      {getInitials(selectedSkater.full_name)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{selectedSkater.full_name}</h3>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border mt-1 ${getLevelBadge(selectedSkater.level?.name || '')}`}>
                        {selectedSkater.level?.name || 'Unknown Level'}
                      </span>
                    </div>
                  </div>
                  {/* Big progress display */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-700">Skill Progress</p>
                        <p className="text-xs text-slate-500 mt-0.5">{completions.length} of {skills.length} skills completed</p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-[#7B1113]">{completionPct}<span className="text-lg">%</span></p>
                      </div>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-[#7B1113] to-red-400 h-3 rounded-full transition-all duration-700"
                        style={{ width: `${completionPct}%` }}
                      />
                    </div>
                  </div>
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
                            className={`flex items-center gap-4 p-4 rounded-xl border ${
                              done ? 'bg-green-50 border-green-200' : 'bg-white border-slate-200'
                            }`}>
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                              done ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-500'
                            }`}>
                              {done ? <IconCheck /> : skill.order_index}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-semibold ${done ? 'text-green-800' : 'text-slate-800'}`}>{skill.name}</p>
                              {skill.passing_standard && <p className="text-xs text-slate-500 mt-0.5 truncate">{skill.passing_standard}</p>}
                            </div>
                            {done && completion && (
                              <span className="text-xs text-green-700 font-medium flex-shrink-0 bg-green-100 px-2.5 py-1 rounded-lg border border-green-200">
                                {new Date(completion.completed_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
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

            {/* SKATING SHOW */}
            {skaterView === 'show' && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100">
                  <h3 className="text-lg font-bold text-slate-900">{selectedSkater.full_name} — Skating Shows</h3>
                  <p className="text-sm text-slate-500 mt-0.5">{skaterShows.length} show{skaterShows.length !== 1 ? 's' : ''} with your child&apos;s level</p>
                </div>
                <div className="p-6 space-y-4">
                  {skaterShows.map(show => {
                    const relevantGroups = show.groups?.filter(g =>
                      g.levels?.some(gl => gl.level?.id === selectedSkater.level?.id)
                    ) || []
                    return (
                      <div key={show.id} className="border border-slate-200 rounded-2xl overflow-hidden">
                        {/* Show header */}
                        <div className="px-5 py-4 bg-gradient-to-r from-slate-50 to-red-50 border-b border-slate-200">
                          <h4 className="font-bold text-slate-900">{show.name}</h4>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600">
                              <IconCalendar />
                              {new Date(show.show_date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                              {show.show_time ? ` at ${show.show_time}` : ''}
                            </span>
                            {show.location && <span className="text-xs text-slate-500">· {show.location}</span>}
                            {show.theme && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">Theme: {show.theme}</span>}
                          </div>
                        </div>
                        <div className="p-5 space-y-3">
                          {relevantGroups.map(g => (
                            <div key={g.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-slate-800 text-sm">{g.name}</span>
                                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">{g.show_half}</span>
                                </div>
                                <button onClick={() => generateICS(show, g)}
                                  className="flex items-center gap-1.5 text-[#7B1113] hover:text-[#6a0f10] text-xs font-semibold hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition cursor-pointer border border-red-200">
                                  <IconDownload />
                                  Add to Calendar
                                </button>
                              </div>
                              {g.practices && g.practices.length > 0 && (
                                <>
                                  <p className="text-xs font-semibold text-slate-600 mb-2">Practice Schedule</p>
                                  <div className="space-y-1.5">
                                    {g.practices
                                      .sort((a, b) => a.practice_date.localeCompare(b.practice_date))
                                      .map(p => (
                                        <div key={p.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 text-xs border border-slate-200">
                                          <div className="flex items-center gap-2 text-slate-700 font-medium">
                                            <IconCalendar />
                                            {new Date(p.practice_date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                          </div>
                                          <span className="text-slate-500">{p.start_time}–{p.end_time}{p.label && ` (${p.label})`}</span>
                                        </div>
                                      ))}
                                  </div>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
