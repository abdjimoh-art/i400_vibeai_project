'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
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

/* IceTrack logo mark */
function ITLogo({ size = 15, color = '#0c1a2b' }: { size?: number; color?: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <svg width={size + 4} height={size + 4} viewBox="0 0 28 28" fill="none" aria-hidden>
        <path d="M5 19 Q 14 22, 23 19" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M9 19 L 12 8 L 14 8 L 13 19" stroke={color} strokeWidth="1.6" fill="none" strokeLinejoin="round" />
        <circle cx="6" cy="20" r="1.2" fill={color} />
        <circle cx="22" cy="20" r="1.2" fill={color} />
      </svg>
      <span className="font-display" style={{ fontWeight: 500, fontSize: size + 4, letterSpacing: '-0.02em', color }}>
        Ice<span style={{ fontStyle: 'italic', fontWeight: 400 }}>Track</span>
      </span>
    </span>
  )
}

/* Avatar orb with radial gradient seeded from name */
function ITAvatar({ name = '', size = 40 }: { name?: string; size?: number }) {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?'
  const hue = (name.charCodeAt(0) || 200) % 360
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: `radial-gradient(circle at 30% 30%, hsl(${hue} 35% 92%), hsl(${(hue + 20) % 360} 30% 80%))`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: `hsl(${hue} 30% 30%)`, fontWeight: 600, fontSize: size * 0.35,
      border: '1px solid var(--hairline)',
    }}>{initials}</div>
  )
}

/* Icons */
const IconCheck = ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M4 12 L 9 17 L 20 6" />
  </svg>
)
const IconArrowRight = ({ size = 13, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M5 12 H 19 M 13 6 L 19 12 L 13 18" />
  </svg>
)
const IconClock = ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="12" cy="12" r="8" /><path d="M12 8 V 12 L 15 14" />
  </svg>
)
const IconLogout = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M14 4 H 5 V 20 H 14" /><path d="M10 12 H 21 M 17 8 L 21 12 L 17 16" />
  </svg>
)

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

  const [view, setView] = useState<'attendance' | 'skills' | 'notes'>('attendance')
  const [selectedSkaterId, setSelectedSkaterId] = useState('')
  const [skills, setSkills] = useState<Skill[]>([])
  const [completions, setCompletions] = useState<SkillCompletion[]>([])

  async function load() {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user
    if (!user) { router.push('/login'); return }

    const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (prof?.role !== 'instructor') { router.push('/login'); return }
    setProfile(prof)

    const classesRes = await fetch('/api/instructor/classes')
    if (classesRes.ok) {
      const cls = await classesRes.json()
      setClasses((cls as ClassRow[]) || [])
    } else {
      setClasses([])
    }
    setLoading(false)
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial dashboard load only
  }, [])

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

  async function markAllPresent() {
    const today = new Date().toISOString().split('T')[0]
    const records = enrollments.map(e => ({ skater_id: e.skater_id, session_date: today, present: true }))
    if (records.length === 0) return
    if (!sessionDates.includes(today)) {
      setSessionDates(prev => [...prev, today].sort())
    }
    await fetch('/api/attendance', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ class_id: selectedClassId, records })
    })
    setAttendance(prev => {
      const others = prev.filter(a => a.session_date !== today || !records.some(r => r.skater_id === a.skater_id))
      const fresh = records.map(r => ({ id: '', skater_id: r.skater_id, session_date: r.session_date, present: true }))
      return [...others, ...fresh]
    })
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
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--paper)' }}>
      <div className="flex flex-col items-center gap-4">
        <svg className="animate-spin w-8 h-8" style={{ color: 'var(--ice)' }} fill="none" viewBox="0 0 24 24" aria-hidden>
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p style={{ color: 'var(--muted)', fontSize: 13 }}>Loading dashboard…</p>
      </div>
    </div>
  )

  const selectedClass = classes.find(c => c.id === selectedClassId)
  const selectedSkater = enrollments.find(e => e.skater_id === selectedSkaterId)?.skater
  const completedIds = new Set(completions.map(c => c.skill_id))
  const completionPct = skills.length > 0 ? Math.round((completions.length / skills.length) * 100) : 0
  const todayClasses = classes.slice(0, 3)
  const laterClasses = classes.slice(3)
  const now = new Date()
  const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  const dayStr = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

  return (
    <div className="min-h-screen" style={{ background: 'var(--paper)', padding: 16 }}>
      <div className="h-[calc(100vh-32px)] mx-auto overflow-hidden" style={{ maxWidth: 1180, borderRadius: 24, border: '1px solid var(--hairline)', background: 'var(--paper)', boxShadow: 'var(--shadow-lift)' }}>
      <div className="min-h-screen flex flex-col" style={{ background: 'var(--paper)' }}>
      {/* Top bar */}
      <div className="flex items-center gap-3.5 px-5 py-3.5" style={{ background: 'var(--surface)', borderBottom: '1px solid var(--hairline)' }}>
        <ITLogo size={15} />
        <span className="pill pill-ice">Instructor</span>
        <Link
          href="/assistant"
          className="text-sm font-medium rounded-md cursor-pointer"
          style={{
            marginLeft: 8,
            padding: '5px 10px',
            border: '1px solid var(--ice)',
            background: 'var(--ice-soft)',
            color: 'var(--ice-deep)',
            textDecoration: 'none',
          }}
        >
          Assistant
        </Link>
        <div className="ml-auto flex items-center gap-3.5">
          <div className="flex items-center gap-1.5" style={{ fontSize: 12, color: 'var(--muted)' }}>
            <IconClock size={14} color="var(--muted)" />
            <span className="font-mono">{dayStr} · {timeStr}</span>
          </div>
          <div className="flex items-center gap-2">
            <ITAvatar name={profile?.full_name || ''} size={28} />
            <span style={{ fontSize: 13, fontWeight: 500 }}>{profile?.full_name}</span>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-1.5 cursor-pointer" style={{ padding: '5px 10px', fontSize: 12, borderRadius: 'var(--r-sm)', border: '1px solid var(--hairline)', background: 'var(--surface)', color: 'var(--ink-soft)' }}>
            <IconLogout size={14} color="var(--ink-soft)" />
            Sign out
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden" style={{ display: 'grid', gridTemplateColumns: '240px 1fr' }}>
        {/* Class list rail */}
        <div className="overflow-auto p-4" style={{ borderRight: '1px solid var(--hairline)', background: 'var(--surface)' }}>
          <div className="eyebrow mb-2.5">Today · {dayStr}</div>
          {classes.length === 0 ? (
            <p style={{ fontSize: 12, color: 'var(--muted)', padding: 8 }}>No classes assigned.</p>
          ) : (
            <>
            {todayClasses.map(c => (
              <button key={c.id} onClick={() => selectClass(c.id)} className="w-full text-left cursor-pointer mb-2" style={{
                padding: 12, borderRadius: 'var(--r-md)',
                background: selectedClassId === c.id ? 'var(--ice-soft)' : 'var(--surface)',
                border: selectedClassId === c.id ? '1px solid var(--ice)' : '1px solid var(--hairline)',
                boxShadow: selectedClassId === c.id ? '0 0 0 3px rgba(59,130,196,0.13)' : 'none',
              }}>
                <div className="flex items-baseline justify-between">
                  <span className="font-mono" style={{ fontSize: 13, fontWeight: 600, color: selectedClassId === c.id ? 'var(--ice-deep)' : 'var(--ink)' }}>{c.time_slot}</span>
                  <span style={{ fontSize: 11, color: 'var(--muted)' }}>{enrollments.length > 0 && selectedClassId === c.id ? `${enrollments.length} skaters` : ''}</span>
                </div>
                <div className="font-display" style={{ fontSize: 15, fontWeight: 500, marginTop: 2 }}>{c.levels.name}</div>
                <div style={{ fontSize: 11, color: selectedClassId === c.id ? 'var(--ice-deep)' : 'var(--muted)', marginTop: 4 }}>
                  {c.day_of_week} · {c.ice_location || 'Zone A'}
                </div>
              </button>
            ))}
            {laterClasses.length > 0 && (
              <>
                <div className="eyebrow" style={{ marginTop: 18, marginBottom: 8 }}>Later this week</div>
                {laterClasses.map(c => (
                  <div key={c.id} style={{ padding: '8px 12px', fontSize: 12, color: 'var(--ink-soft)', display: 'flex', justifyContent: 'space-between' }}>
                    <span className="font-mono">{c.day_of_week} {c.time_slot}</span>
                    <span>{c.levels.name}</span>
                  </div>
                ))}
              </>
            )}
            </>
          )}
        </div>

        {/* Roster main */}
        <div className="overflow-auto p-5">
          {!selectedClassId ? (
            <div className="flex flex-col items-center justify-center h-full" style={{ color: 'var(--muted)' }}>
              <p style={{ fontSize: 14 }}>Select a class from the sidebar to get started.</p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-start mb-3.5">
                <div>
                  <div className="eyebrow">
                    {selectedClass ? `${selectedClass.day_of_week} ${selectedClass.time_slot} · ${selectedClass.ice_location || 'Zone A'} · ${enrollments.length} skaters` : ''}
                  </div>
                  <h1 className="font-display" style={{ fontSize: 32, fontWeight: 400, marginTop: 4 }}>
                    {selectedClass?.levels.name} <span style={{ color: 'var(--muted)', fontWeight: 300, fontStyle: 'italic' }}>roster</span>
                  </h1>
                </div>
                <div className="flex gap-2">
                  <button onClick={markAllPresent} className="flex items-center gap-1.5 cursor-pointer" style={{ padding: '8px 14px', fontSize: 13, fontWeight: 500, borderRadius: 'var(--r-sm)', border: '1px solid var(--hairline)', background: 'var(--surface)', color: 'var(--ink)' }}>
                    <IconCheck size={14} color="var(--spring)" /> All present
                  </button>
                  <button type="button" className="flex items-center gap-1.5 cursor-pointer rounded-md border border-[#3b82c4] bg-[#3b82c4] px-3.5 py-2 text-[13px] font-medium text-white shadow-[0_1px_0_#1e5a9155,0_4px_12px_-4px_rgba(59,130,196,0.33)] hover:bg-[#2f74b3]">
                    Save session <IconArrowRight size={13} color="#fff" />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 mb-4" style={{ borderBottom: '1px solid var(--hairline)' }}>
                {(['attendance', 'skills', 'notes'] as const).map(t => (
                  <button key={t} onClick={() => { if (t === 'skills' && !selectedSkaterId) return; setView(t) }}
                    className="cursor-pointer capitalize" style={{
                      padding: '8px 14px', fontSize: 13, fontWeight: view === t ? 500 : 400,
                      color: view === t ? 'var(--ice-deep)' : 'var(--muted)',
                      borderBottom: view === t ? '2px solid var(--ice)' : '2px solid transparent',
                      marginBottom: -1, background: 'none', border: 'none',
                      opacity: t === 'skills' && !selectedSkaterId ? 0.4 : 1,
                    }}>
                    {t === 'attendance' ? 'Attendance' : t === 'skills' ? `Skill passes${selectedSkater ? ` — ${selectedSkater.full_name}` : ''}` : 'Notes'}
                  </button>
                ))}
              </div>

              {/* ATTENDANCE VIEW */}
              {view === 'attendance' && (
                enrollments.length === 0 ? (
                  <div className="card flex flex-col items-center justify-center py-16 text-center px-4">
                    <p style={{ color: 'var(--ink-soft)', fontWeight: 600, fontSize: 14 }}>No skaters enrolled</p>
                    <p style={{ color: 'var(--muted)', fontSize: 12, marginTop: 4 }}>Ask an admin to enroll skaters in this class.</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {enrollments.map(en => {
                      const todayStr = new Date().toISOString().split('T')[0]
                      const present = getAttendance(en.skater_id, todayStr)
                      const absent = attendance.some(a => a.skater_id === en.skater_id && a.session_date === todayStr && !a.present)
                      return (
                        <div key={en.skater_id} className="card cursor-pointer" onClick={() => selectSkater(en.skater_id)} style={{
                          padding: 14, display: 'flex', alignItems: 'center', gap: 12,
                          background: absent && !present ? 'var(--rust-soft)' : 'var(--surface)',
                          borderColor: absent && !present ? 'rgba(198,107,74,0.33)' : 'var(--hairline)',
                        }}>
                          <ITAvatar name={en.skater.full_name} size={42} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="flex items-center gap-1.5">
                              <span style={{ fontSize: 14, fontWeight: 500 }}>{en.skater.full_name}</span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-1">
                              <div style={{ flex: 1, height: 4, background: 'var(--hairline-soft)', borderRadius: 2, maxWidth: 90 }}>
                                <div style={{ width: '40%', height: '100%', background: 'var(--ice)', borderRadius: 2 }} />
                              </div>
                              <span className="font-mono" style={{ fontSize: 11, color: 'var(--muted)' }}>
                                {en.skater.level?.name || '—'}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-1.5">
                            {/* Present button */}
                            <button onClick={(e) => { e.stopPropagation(); const today = new Date().toISOString().split('T')[0]; toggleAttendance(en.skater_id, today) }}
                              className="flex items-center justify-center cursor-pointer" style={{
                                width: 44, height: 44, borderRadius: 'var(--r-md)',
                                border: `1px solid ${present ? 'var(--spring)' : 'var(--hairline)'}`,
                                background: present ? 'var(--spring)' : 'var(--surface)',
                                boxShadow: present ? '0 0 0 3px rgba(58,154,118,0.13)' : 'none',
                              }}>
                              <IconCheck size={18} color={present ? '#fff' : 'var(--muted)'} />
                            </button>
                            {/* Absent button */}
                            <button onClick={(e) => {
                              e.stopPropagation()
                              const today = new Date().toISOString().split('T')[0]
                              const exists = attendance.find(a => a.skater_id === en.skater_id && a.session_date === today)
                              if (!exists || exists.present) toggleAttendance(en.skater_id, today)
                            }}
                              className="flex items-center justify-center cursor-pointer" style={{
                                width: 44, height: 44, borderRadius: 'var(--r-md)',
                                border: `1px solid ${absent ? 'var(--rust)' : 'var(--hairline)'}`,
                                background: absent ? 'var(--rust)' : 'var(--surface)',
                                boxShadow: absent ? '0 0 0 3px rgba(198,107,74,0.13)' : 'none',
                              }}>
                              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={absent ? '#fff' : 'var(--muted)'} strokeWidth="2" strokeLinecap="round" aria-hidden>
                                <path d="M6 6 L18 18 M18 6 L6 18" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              )}

              {view === 'notes' && (
                <div className="card" style={{ padding: 20 }}>
                  <h3 className="font-display" style={{ fontSize: 20, fontWeight: 500 }}>Session notes</h3>
                  <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 8, lineHeight: 1.5 }}>
                    Notes mode is reserved for rink-side comments and sticker feedback from the paper sheets.
                    It is intentionally placeholder-only for now to stay aligned with current I400 backend scope.
                  </p>
                </div>
              )}

              {/* SKILLS VIEW */}
              {view === 'skills' && selectedSkater && (
                <div className="card overflow-hidden">
                  <div style={{ padding: '20px 22px', borderBottom: '1px solid var(--hairline-soft)' }}>
                    <div className="flex items-center gap-3 mb-4">
                      <ITAvatar name={selectedSkater.full_name} size={42} />
                      <div>
                        <h3 className="font-display" style={{ fontSize: 22, fontWeight: 500 }}>{selectedSkater.full_name}</h3>
                        <span className="pill pill-ice mt-1">{selectedSkater.level?.name || 'Unknown Level'}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink-soft)' }}>Skill progress</span>
                      <span className="font-mono" style={{ fontSize: 12, color: 'var(--ink)' }}><strong>{completions.length}</strong>/{skills.length}</span>
                    </div>
                    <div className="progress-bar"><span style={{ width: `${completionPct}%` }} /></div>
                    <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>{completionPct}% complete · click a skill to toggle it</p>
                  </div>
                  <div style={{ padding: 22 }}>
                    {skills.length === 0 ? (
                      <p style={{ color: 'var(--muted)', fontSize: 13, textAlign: 'center', padding: '32px 0' }}>No skills defined for this level.</p>
                    ) : (
                      <div className="space-y-2">
                        {skills.map(skill => {
                          const done = completedIds.has(skill.id)
                          const completion = completions.find(c => c.skill_id === skill.id)
                          return (
                            <div key={skill.id} onClick={() => toggleSkill(skill.id)}
                              className="card flex items-center gap-4 p-3.5 cursor-pointer select-none" style={{
                                background: done ? 'var(--spring-soft)' : 'var(--surface)',
                                borderColor: done ? 'rgba(58,154,118,0.33)' : 'var(--hairline)',
                              }}>
                              <div className="flex items-center justify-center flex-shrink-0" style={{
                                width: 28, height: 28, borderRadius: '50%',
                                background: done ? 'var(--spring)' : 'var(--surface2)',
                                color: done ? '#fff' : 'var(--muted)', fontSize: 12, fontWeight: 600,
                              }}>
                                {done ? <IconCheck size={14} color="#fff" /> : skill.order_index}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontSize: 13, fontWeight: 500, color: done ? 'var(--spring)' : 'var(--ink)' }}>{skill.name}</p>
                                {skill.passing_standard && <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{skill.passing_standard}</p>}
                              </div>
                              {done && completion && (
                                <span className="pill pill-spring" style={{ fontSize: 10 }}>
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
      </div>
      </div>
    </div>
  )
}
