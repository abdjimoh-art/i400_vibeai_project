'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Profile = { id: string; full_name: string; role: string }
type Skater = {
  id: string; full_name: string
  level: { id: string; name: string } | null
}
type Enrollment = {
  id: string; class_id: string
  class: { id: string; day_of_week: string; time_slot: string; ice_location: string; levels: { name: string }; profiles: { full_name: string } | null }
}
type AttendanceRecord = { id: string; class_id: string; skater_id: string; session_date: string; present: boolean }
type Skill = { id: string; name: string; passing_standard: string | null; order_index: number }
type SkillCompletion = { id: string; skill_id: string; completed_date: string; skater_id?: string; skill?: { id: string; name: string } }
type Show = {
  id: string; name: string; theme: string | null; show_date: string; show_time: string | null; location: string | null
  groups: ShowGroup[]
}
type ShowGroup = {
  id: string; name: string; show_half: string
  levels: { id: string; level: { id: string; name: string } }[]
  practices: { id: string; practice_date: string; start_time: string; end_time: string; label: string | null }[]
}

/* — IceTrack logo mark — */
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

/* — Avatar orb seeded by name — */
function ITAvatar({ name = '', size = 40, hue }: { name?: string; size?: number; hue?: number }) {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?'
  const h = hue ?? ((name.charCodeAt(0) || 200) % 360)
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: `radial-gradient(circle at 30% 30%, hsl(${h} 35% 92%), hsl(${(h + 20) % 360} 30% 80%))`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: `hsl(${h} 30% 30%)`, fontWeight: 600, fontSize: size * 0.34,
      border: '1px solid var(--hairline)',
    }}>{initials}</div>
  )
}

/* — Icons — */
const I = {
  home: () => <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11 L 12 3 L 21 11" /><path d="M5 10 V 20 H 19 V 10" /></svg>,
  skater: () => <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="7" r="3" /><path d="M5 21 V 18 a 4 4 0 0 1 4 -4 h 6 a 4 4 0 0 1 4 4 V 21" /></svg>,
  cal: () => <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
  star: () => <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
  show: () => <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4 H 20 V 16 H 13 L 12 19 L 11 16 H 4 Z" /></svg>,
  bell: () => <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M18 16 V 11 a 6 6 0 0 0 -12 0 V 16 L 4 18 H 20 Z" /><path d="M10 22 a 2 2 0 0 0 4 0" /></svg>,
  search: () => <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="M21 21 L 16 16" /></svg>,
  plus: () => <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
  arrowRight: () => <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12 H 19 M 13 6 L 19 12 L 13 18" /></svg>,
  chevron: () => <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 6 15 12 9 18" /></svg>,
  pin: () => <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22 S 4 14 4 9 a 8 8 0 0 1 16 0 c 0 5 -8 13 -8 13 z" /><circle cx="12" cy="9" r="2.5" /></svg>,
  users: () => <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="9" r="3.5" /><path d="M2 20 V 18 a 4 4 0 0 1 4 -4 h 6 a 4 4 0 0 1 4 4 V 20" /><circle cx="17" cy="8" r="2.5" /><path d="M22 18 a 3 3 0 0 0 -3 -3" /></svg>,
  check: () => <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
  download: () => <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>,
  logout: () => <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M14 4 H 5 V 20 H 14" /><path d="M10 12 H 21 M 17 8 L 21 12 L 17 16" /></svg>,
}

export default function ParentDashboard() {
  const router = useRouter()
  const supabase = createClient()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [skaters, setSkaters] = useState<Skater[]>([])
  const [skaterEnrollments, setSkaterEnrollments] = useState<Record<string, Enrollment[]>>({})
  const [skaterAttendance, setSkaterAttendance] = useState<Record<string, AttendanceRecord[]>>({})
  const [skaterSkills, setSkaterSkills] = useState<Record<string, Skill[]>>({})
  const [skaterCompletions, setSkaterCompletions] = useState<Record<string, SkillCompletion[]>>({})
  const [recentPasses, setRecentPasses] = useState<Array<{ skater: Skater; skill: string; date: string }>>([])
  const [shows, setShows] = useState<Show[]>([])
  const [activeNav, setActiveNav] = useState<'overview' | 'skaters' | 'schedule' | 'journeys' | 'show' | 'notifications'>('overview')

  async function load() {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user
    if (!user) { router.push('/login'); return }

    const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (prof?.role !== 'parent') { router.push('/login'); return }
    setProfile(prof)

    const skatersRes = await fetch('/api/skaters')
    if (!skatersRes.ok) { setLoading(false); return }
    const allSkaters: (Skater & { parent: { id: string } | null })[] = await skatersRes.json()
    const myKids = allSkaters.filter(s => s.parent?.id === user.id)
    setSkaters(myKids)

    const showsRes = await fetch('/api/skating-shows')
    if (showsRes.ok) setShows(await showsRes.json())

    const enrollmentsByKid: Record<string, Enrollment[]> = {}
    const attendanceByKid: Record<string, AttendanceRecord[]> = {}
    const skillsByKid: Record<string, Skill[]> = {}
    const completionsByKid: Record<string, SkillCompletion[]> = {}
    const passes: Array<{ skater: Skater; skill: string; date: string }> = []

    const { data: allClasses } = await supabase
      .from('classes')
      .select('id, day_of_week, time_slot, ice_location, levels(name), profiles(full_name)')

    for (const kid of myKids) {
      enrollmentsByKid[kid.id] = []
      attendanceByKid[kid.id] = []
      skillsByKid[kid.id] = []
      completionsByKid[kid.id] = []

      if (allClasses) {
        for (const cls of allClasses) {
          const enRes = await fetch(`/api/enrollments?class_id=${cls.id}`)
          if (!enRes.ok) continue
          const enrs: Array<{ id: string; skater_id: string }> = await enRes.json()
          const match = enrs.find(e => e.skater_id === kid.id)
          if (!match) continue
          enrollmentsByKid[kid.id].push({ id: match.id, class_id: cls.id, class: cls as unknown as Enrollment['class'] })
          const attRes = await fetch(`/api/attendance?class_id=${cls.id}`)
          if (attRes.ok) {
            const attRecords: AttendanceRecord[] = await attRes.json()
            attendanceByKid[kid.id].push(...attRecords.filter(a => a.skater_id === kid.id))
          }
        }
      }

      if (kid.level?.id) {
        const [skillsRes, compRes] = await Promise.all([
          fetch(`/api/skills?level_id=${kid.level.id}`),
          fetch(`/api/skill-completions?skater_id=${kid.id}`),
        ])
        if (skillsRes.ok) skillsByKid[kid.id] = await skillsRes.json()
        if (compRes.ok) {
          const comps: SkillCompletion[] = await compRes.json()
          completionsByKid[kid.id] = comps
          for (const c of comps) {
            const skill = skillsByKid[kid.id].find(s => s.id === c.skill_id) || (c.skill as Skill | undefined)
            if (skill) passes.push({ skater: kid, skill: skill.name, date: c.completed_date })
          }
        }
      }
    }

    setSkaterEnrollments(enrollmentsByKid)
    setSkaterAttendance(attendanceByKid)
    setSkaterSkills(skillsByKid)
    setSkaterCompletions(completionsByKid)
    passes.sort((a, b) => b.date.localeCompare(a.date))
    setRecentPasses(passes.slice(0, 4))

    setLoading(false)
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial dashboard load only
  }, [])

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
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--paper)' }}>
      <div className="flex flex-col items-center gap-4">
        <svg className="animate-spin w-8 h-8" style={{ color: 'var(--ice)' }} fill="none" viewBox="0 0 24 24" aria-hidden>
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p style={{ color: 'var(--muted)', fontSize: 13 }}>Loading your dashboard…</p>
      </div>
    </div>
  )

  const firstName = (profile?.full_name || 'there').split(' ')[0]
  const totalUpcoming = Object.values(skaterEnrollments).reduce((acc, arr) => acc + arr.length, 0)
  const upcomingShow = shows.length > 0 ? shows[0] : null
  const upcomingGroup = upcomingShow?.groups?.find(g =>
    g.levels?.some(gl => skaters.some(k => k.level?.id === gl.level?.id))
  )
  const scheduleRows = skaters.flatMap(s =>
    (skaterEnrollments[s.id] || []).map(en => ({
      skaterId: s.id,
      skaterName: s.full_name,
      levelName: s.level?.name || 'No level',
      cls: en.class,
    }))
  )

  const navItems = [
    { id: 'overview' as const, l: 'Overview', icon: I.home },
    { id: 'skaters' as const, l: 'My skaters', icon: I.skater },
    { id: 'schedule' as const, l: 'Schedule', icon: I.cal },
    { id: 'journeys' as const, l: 'Skill journeys', icon: I.star },
    { id: 'show' as const, l: 'Spring show', icon: I.show },
    { id: 'notifications' as const, l: 'Notifications', icon: I.bell, badge: recentPasses.length || undefined },
  ]

  return (
    <div className="min-h-screen" style={{ background: 'var(--paper)', display: 'grid', gridTemplateColumns: '224px 1fr' }}>
      {/* — Sidebar — */}
      <aside style={{ background: 'var(--surface)', borderRight: '1px solid var(--hairline)', padding: 20, display: 'flex', flexDirection: 'column' }}>
        <ITLogo size={15} />
        <nav style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {navItems.map(n => {
            const active = activeNav === n.id
            const Icon = n.icon
            return (
              <button
                key={n.id}
                onClick={() => setActiveNav(n.id)}
                className="cursor-pointer text-left"
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 10px', borderRadius: 'var(--r-sm)',
                  background: active ? 'var(--ice-soft)' : 'transparent',
                  color: active ? 'var(--ice-deep)' : 'var(--ink-soft)',
                  fontSize: 13, fontWeight: active ? 500 : 400,
                  border: 'none', fontFamily: 'inherit',
                }}
              >
                <span style={{ color: active ? 'var(--ice-deep)' : 'var(--muted)', display: 'inline-flex' }}><Icon /></span>
                <span style={{ flex: 1 }}>{n.l}</span>
                {n.badge ? <span className="pill pill-crimson" style={{ fontSize: 10, padding: '1px 6px' }}>{n.badge}</span> : null}
              </button>
            )
          })}
          <Link
            href="/assistant"
            className="mt-3 flex items-center gap-2 rounded-md text-left text-sm font-medium"
            style={{
              padding: '8px 10px',
              color: 'var(--ice-deep)',
              background: 'var(--ice-soft)',
              border: '1px solid var(--ice)',
              textDecoration: 'none',
            }}
          >
            <span aria-hidden>✦</span> IceTrack Assistant
          </Link>
        </nav>

        <div style={{ marginTop: 'auto', padding: 12, borderRadius: 'var(--r-md)', background: 'var(--surface2)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <ITAvatar name={profile?.full_name || ''} size={32} hue={210} />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 500 }}>{profile?.full_name}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>Parent · {skaters.length} skater{skaters.length !== 1 ? 's' : ''}</div>
          </div>
          <button onClick={handleLogout} aria-label="Sign out" className="cursor-pointer" style={{ width: 28, height: 28, borderRadius: 'var(--r-sm)', background: 'var(--surface)', border: '1px solid var(--hairline)', color: 'var(--ink-soft)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <I.logout />
          </button>
        </div>
      </aside>

      {/* — Main — */}
      <main style={{ overflow: 'auto', padding: 28 }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, marginBottom: 22 }}>
          <div>
            <div className="eyebrow">Spring 2026 · Week 8</div>
            <h1 className="font-display" style={{ fontSize: 40, fontWeight: 400, marginTop: 6, color: 'var(--ink)', lineHeight: 1 }}>
              Hi <span style={{ fontStyle: 'italic' }}>{firstName}.</span>
            </h1>
            <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 6 }}>
              {skaters.length === 0
                ? 'No skaters linked yet — contact the admin to add your child.'
                : `${skaters.length} skater${skaters.length !== 1 ? 's' : ''}, ${totalUpcoming} class${totalUpcoming !== 1 ? 'es' : ''}, ${recentPasses.length} skill${recentPasses.length !== 1 ? 's' : ''} in motion.`}
            </p>
          </div>
          <div className="flex gap-2">
            <button className="cursor-pointer flex items-center gap-1.5" style={{ padding: '8px 14px', fontSize: 13, fontWeight: 500, borderRadius: 'var(--r-sm)', border: '1px solid var(--hairline)', background: 'var(--surface)', color: 'var(--ink)', fontFamily: 'inherit' }}>
              <span style={{ color: 'var(--muted)' }}><I.search /></span> Search
            </button>
            <button
              type="button"
              disabled
              title="Skaters are linked by admin"
              className="it-btn-primary cursor-not-allowed flex items-center gap-1.5"
              style={{ padding: '8px 14px', fontSize: 13, fontWeight: 500, borderRadius: 'var(--r-sm)', fontFamily: 'inherit' }}
            >
              <I.plus /> Add skater
            </button>
          </div>
        </header>

        {/* — Overview / Skaters — */}
        {(activeNav === 'overview' || activeNav === 'skaters') && (skaters.length === 0 ? (
          <div className="card" style={{ padding: 28, textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: 'var(--r-md)', background: 'var(--ice-soft)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ice-deep)', marginBottom: 14 }}>
              <I.skater />
            </div>
            <h3 className="font-display" style={{ fontSize: 22, fontWeight: 400 }}>No skaters yet</h3>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
              Contact the admin to link your skaters to your account.
            </p>
            <p className="font-mono" style={{ fontSize: 12, color: 'var(--ice-deep)', marginTop: 6 }}>icetrack@iu.edu</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: skaters.length === 1 ? '1fr' : '1fr 1fr', gap: 14, marginBottom: 22 }}>
            {skaters.map((s, idx) => {
              const enrolls = skaterEnrollments[s.id] || []
              const completions = skaterCompletions[s.id] || []
              const skills = skaterSkills[s.id] || []
              const passed = completions.length
              const total = skills.length
              const pct = total ? Math.round((passed / total) * 100) : 0
              const nextClass = enrolls[0]?.class
              const lastPass = completions
                .map(c => ({ c, skill: skills.find(sk => sk.id === c.skill_id) }))
                .filter(x => x.skill)
                .sort((a, b) => b.c.completed_date.localeCompare(a.c.completed_date))[0]
              const hue = (s.full_name.charCodeAt(0) || 200) * (idx + 1) % 360
              return (
                <div key={s.id} className="card" style={{ padding: 20 }}>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 16 }}>
                    <ITAvatar name={s.full_name} size={56} hue={hue} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h2 className="font-display" style={{ fontSize: 22, fontWeight: 500, color: 'var(--ink)' }}>{s.full_name.split(' ')[0]}</h2>
                      <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                        <span className="pill pill-ice">{s.level?.name || 'No level'}</span>
                      </div>
                    </div>
                    <Link
                      href={`/parent/journey/${s.id}`}
                      aria-label="Open skill journey"
                      className="cursor-pointer"
                      style={{
                        width: 32, height: 32, borderRadius: 'var(--r-sm)',
                        border: '1px solid var(--hairline)', background: 'var(--surface)',
                        color: 'var(--muted)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <I.chevron />
                    </Link>
                  </div>

                  {total > 0 && (
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                        <span style={{ fontSize: 12, color: 'var(--ink-soft)', fontWeight: 500 }}>Skill progress</span>
                        <span className="font-mono" style={{ fontSize: 12, color: 'var(--ink)' }}>
                          <strong>{passed}</strong>/{total} <span style={{ color: 'var(--muted)' }}>· {pct}%</span>
                        </span>
                      </div>
                      <div className="progress-bar"><span style={{ width: `${pct}%` }} /></div>
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: 12, background: 'var(--surface2)', borderRadius: 'var(--r-md)' }}>
                    <div>
                      <div className="eyebrow" style={{ marginBottom: 4 }}>Next class</div>
                      {nextClass ? (
                        <>
                          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>{nextClass.day_of_week} · {nextClass.time_slot}</div>
                          <div style={{ fontSize: 11, color: 'var(--muted)' }}>{nextClass.profiles?.full_name || nextClass.ice_location}</div>
                        </>
                      ) : (
                        <div style={{ fontSize: 13, color: 'var(--muted)', fontStyle: 'italic' }}>No class enrolled</div>
                      )}
                    </div>
                    <div>
                      <div className="eyebrow" style={{ marginBottom: 4 }}>Last passed</div>
                      {lastPass?.skill ? (
                        <>
                          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--crimson)' }}>{lastPass.skill.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--muted)' }}>{new Date(lastPass.c.completed_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                        </>
                      ) : (
                        <div style={{ fontSize: 13, color: 'var(--muted)', fontStyle: 'italic' }}>—</div>
                      )}
                    </div>
                  </div>

                  {/* Class attendance row */}
                  {enrolls.length > 0 && (
                    <div style={{ marginTop: 14 }}>
                      <div className="eyebrow" style={{ marginBottom: 6 }}>Recent attendance</div>
                      <div className="flex flex-wrap gap-1.5">
                        {(skaterAttendance[s.id] || [])
                          .slice()
                          .sort((a, b) => b.session_date.localeCompare(a.session_date))
                          .slice(0, 6)
                          .map(a => (
                            <span
                              key={a.id || a.session_date}
                              className="font-mono"
                              style={{
                                fontSize: 11, padding: '2px 8px', borderRadius: 999,
                                background: a.present ? 'var(--spring-soft)' : 'var(--rust-soft)',
                                color: a.present ? 'var(--spring)' : 'var(--rust)',
                                border: `1px solid ${a.present ? 'rgba(58,154,118,0.2)' : 'rgba(198,107,74,0.25)'}`,
                              }}
                            >
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
        ))}

        {/* — Overview extras — */}
        {activeNav === 'overview' && skaters.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 14 }}>
            <div className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
                <h3 className="font-display" style={{ fontSize: 18, fontWeight: 500 }}>Recent skill passes</h3>
                {skaters.length > 0 && (
                  <Link href={`/parent/journey/${skaters[0].id}`} style={{ fontSize: 12, color: 'var(--ice)', textDecoration: 'none' }}>View all →</Link>
                )}
              </div>
              {recentPasses.length === 0 ? (
                <p style={{ fontSize: 13, color: 'var(--muted)', padding: '14px 0' }}>
                  No skill passes yet. Coach updates will show here.
                </p>
              ) : (
                recentPasses.map((r, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: i < recentPasses.length - 1 ? '1px solid var(--hairline-soft)' : 'none' }}>
                    <ITAvatar name={r.skater.full_name} size={32} hue={(r.skater.full_name.charCodeAt(0) || 200) % 360} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, color: 'var(--ink)' }}>
                        <strong style={{ fontWeight: 600 }}>{r.skater.full_name.split(' ')[0]}</strong> passed{' '}
                        <span style={{ color: 'var(--crimson)', fontWeight: 500 }}>{r.skill}</span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{r.skater.level?.name || 'No level'}</div>
                    </div>
                    {i === 0 && <span className="pill pill-crimson" style={{ fontSize: 10 }}>NEW</span>}
                    <span className="font-mono" style={{ fontSize: 11, color: 'var(--muted)', minWidth: 50, textAlign: 'right' }}>
                      {new Date(r.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Spring showcase teaser */}
            <div className="card" style={{ padding: 0, overflow: 'hidden', background: 'linear-gradient(160deg, var(--ice-deep), var(--ice))', color: '#fff', position: 'relative', border: 'none' }}>
              <svg style={{ position: 'absolute', inset: 0, opacity: 0.15 }} viewBox="0 0 300 400" preserveAspectRatio="none" aria-hidden>
                <circle cx="240" cy="60" r="30" stroke="#fff" fill="none" />
                <circle cx="240" cy="60" r="50" stroke="#fff" fill="none" />
                <path d="M-20 320 Q 100 240, 220 290 T 400 270" stroke="#fff" strokeWidth="1.2" fill="none" />
              </svg>
              <div style={{ padding: 22, position: 'relative' }}>
                <div className="eyebrow" style={{ color: 'rgba(255,255,255,0.75)' }}>Spring showcase</div>
                {upcomingShow ? (
                  <>
                    <h3 className="font-display" style={{ fontSize: 24, color: '#fff', fontWeight: 400, marginTop: 6 }}>
                      {upcomingShow.theme ? (
                        <>{upcomingShow.theme.split(' ').slice(0, -1).join(' ')} <span style={{ fontStyle: 'italic' }}>{upcomingShow.theme.split(' ').slice(-1)[0]}</span></>
                      ) : (
                        <>{upcomingShow.name}</>
                      )}
                    </h3>
                    <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <I.cal /> {new Date(upcomingShow.show_date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}{upcomingShow.show_time ? ` · ${upcomingShow.show_time}` : ''}
                      </div>
                      {upcomingShow.location && (
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <I.pin /> {upcomingShow.location}
                        </div>
                      )}
                      {upcomingGroup && (
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <I.users /> {upcomingGroup.name}
                        </div>
                      )}
                    </div>
                    {upcomingGroup && (
                      <button
                        onClick={() => generateICS(upcomingShow, upcomingGroup)}
                        className="cursor-pointer"
                        style={{
                          marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 6,
                          padding: '8px 14px', borderRadius: 'var(--r-sm)', background: '#fff',
                          color: 'var(--ice-deep)', border: '1px solid #fff',
                          fontSize: 13, fontWeight: 500, fontFamily: 'inherit',
                        }}
                      >
                        <I.download /> Practice schedule
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <h3 className="font-display" style={{ fontSize: 22, color: '#fff', fontWeight: 400, marginTop: 6 }}>
                      No upcoming <span style={{ fontStyle: 'italic' }}>show</span>
                    </h3>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 8 }}>
                      The next showcase will appear here once it&apos;s scheduled by the admin.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* — Schedule — */}
        {activeNav === 'schedule' && (
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
              <h3 className="font-display" style={{ fontSize: 22, fontWeight: 500 }}>Class schedule</h3>
              <span className="pill">{scheduleRows.length}</span>
            </div>
            {scheduleRows.length === 0 ? (
              <p style={{ fontSize: 14, color: 'var(--muted)' }}>No class sessions are linked to your skaters yet.</p>
            ) : (
              <div style={{ display: 'grid', gap: 8 }}>
                {scheduleRows.map((row, idx) => (
                  <div key={`${row.skaterId}-${row.cls.id}-${idx}`} style={{ border: '1px solid var(--hairline)', borderRadius: 'var(--r-md)', background: 'var(--surface2)', padding: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>{row.cls.day_of_week} · {row.cls.time_slot}</div>
                      <span className="pill pill-ice">{row.levelName}</span>
                    </div>
                    <div style={{ marginTop: 6, fontSize: 12, color: 'var(--muted)' }}>
                      {row.skaterName} · {row.cls.ice_location} · {row.cls.profiles?.full_name || 'Instructor TBD'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* — Skill journeys — */}
        {activeNav === 'journeys' && (
          <div className="card" style={{ padding: 20 }}>
            <h3 className="font-display" style={{ fontSize: 22, fontWeight: 500, marginBottom: 14 }}>Skill journeys</h3>
            {skaters.length === 0 ? (
              <p style={{ fontSize: 14, color: 'var(--muted)' }}>No skaters linked yet.</p>
            ) : (
              <div style={{ display: 'grid', gap: 10 }}>
                {skaters.map(s => (
                  <Link key={s.id} href={`/parent/journey/${s.id}`} className="card" style={{ textDecoration: 'none', padding: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 14, color: 'var(--ink)' }}>{s.full_name}</span>
                    <span style={{ color: 'var(--ice-deep)', fontSize: 13, fontWeight: 500 }}>Open journey →</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* — Spring show — */}
        {activeNav === 'show' && (
          <div className="card" style={{ padding: 20 }}>
            <h3 className="font-display" style={{ fontSize: 22, fontWeight: 500, marginBottom: 14 }}>Spring show</h3>
            {!upcomingShow ? (
              <p style={{ fontSize: 14, color: 'var(--muted)' }}>No upcoming showcase has been published yet.</p>
            ) : (
              <div>
                <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--ink)' }}>{upcomingShow.name}</div>
                <div style={{ marginTop: 6, fontSize: 13, color: 'var(--muted)' }}>
                  {upcomingShow.show_date}{upcomingShow.show_time ? ` · ${upcomingShow.show_time}` : ''}{upcomingShow.location ? ` · ${upcomingShow.location}` : ''}
                </div>
                {upcomingGroup ? (
                  <button onClick={() => generateICS(upcomingShow, upcomingGroup)} className="it-btn-primary cursor-pointer" style={{ marginTop: 14, padding: '8px 14px', borderRadius: 'var(--r-sm)', fontSize: 13, fontWeight: 500 }}>
                    Download practice schedule
                  </button>
                ) : null}
              </div>
            )}
          </div>
        )}

        {/* — Notifications — */}
        {activeNav === 'notifications' && (
          <div className="card" style={{ padding: 20 }}>
            <h3 className="font-display" style={{ fontSize: 22, fontWeight: 500, marginBottom: 14 }}>Notifications</h3>
            {recentPasses.length === 0 ? (
              <p style={{ fontSize: 14, color: 'var(--muted)' }}>No notifications yet.</p>
            ) : (
              <div style={{ display: 'grid', gap: 8 }}>
                {recentPasses.map((r, i) => (
                  <div key={`${r.skater.id}-${r.date}-${i}`} style={{ border: '1px solid var(--hairline)', borderRadius: 'var(--r-md)', background: 'var(--surface2)', padding: 12, fontSize: 13, color: 'var(--ink)' }}>
                    <strong style={{ fontWeight: 600 }}>{r.skater.full_name}</strong> passed <span style={{ color: 'var(--crimson)', fontWeight: 500 }}>{r.skill}</span>
                    <div style={{ marginTop: 4, color: 'var(--muted)', fontSize: 12 }}>{new Date(r.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
