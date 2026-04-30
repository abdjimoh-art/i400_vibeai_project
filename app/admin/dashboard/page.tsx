'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { upsertClass, deleteClass } from '@/app/admin/actions'

type Profile = { id: string; full_name: string; role: string }
type Level = { id: string; name: string; order_index: number }
type ClassRow = {
  id: string
  level_id?: string
  day_of_week: string; time_slot: string; ice_location: string; season: string
  levels: { name: string }; profiles: { full_name: string } | null
}
type ClassInstructorAssignment = {
  class_id: string
  instructor_id: string
  profiles: { id: string; full_name: string } | null
}
type Skater = {
  id: string; full_name: string
  level: { id: string; name: string } | null
  parent: { id: string; full_name: string } | null
}
type Enrollment = {
  id: string; class_id: string; skater_id: string
  skater: Skater
}
type Show = {
  id: string; name: string; theme: string | null; show_date: string; show_time: string | null; location: string | null
  groups: ShowGroup[]
}
type ShowGroup = {
  id: string; name: string; show_half: string
  levels: { id: string; level: Level }[]
  practices: Practice[]
}
type Practice = {
  id: string; practice_date: string; start_time: string; end_time: string; label: string | null
}

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
const TABS = ['Overview', 'Classes', 'Skaters', 'Enrollment', 'Instructors', 'Skating Show', 'Reports'] as const
type Tab = typeof TABS[number]

function tabNavLabel(t: Tab): string {
  return t === 'Skating Show' ? 'Show' : t
}

type OverviewLevelBar = { level_id: string; name: string; enrolled: number; cap: number }
type OverviewShowcase = {
  id: string; name: string; theme: string | null; show_date: string; show_time: string | null
  group_count: number; practice_count: number
}

// — SVG Icons —
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
const IconEdit = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)
const IconTrash = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
    <path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
)
const IconX = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const IconSearch = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
    <circle cx="11" cy="11" r="7" /><path d="M21 21 L 16 16" />
  </svg>
)

// — Helpers —
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
function getZoneBadge(zone: string) {
  if (zone === 'Zone A') return 'bg-blue-50 text-blue-700 border-blue-200'
  if (zone === 'Zone B') return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  if (zone === 'Zone C') return 'bg-orange-50 text-orange-700 border-orange-200'
  if (zone === 'Zone D') return 'bg-purple-50 text-purple-700 border-purple-200'
  return 'bg-teal-50 text-teal-700 border-teal-200'
}

const inputCls = "w-full border border-[var(--hairline)] bg-[var(--surface)] rounded-[var(--r-sm)] px-3 py-2.5 text-sm text-[var(--ink)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ice)]/[0.13] focus:border-[var(--ice)]"
const labelCls = "block text-xs font-medium text-[var(--ink-soft)] mb-1.5"

export default function AdminDashboard() {
  const router = useRouter()
  const supabase = createClient()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [tab, setTab] = useState<Tab>('Overview')
  const [loading, setLoading] = useState(true)
  const [overview, setOverview] = useState<{ levelBars: OverviewLevelBar[]; showcase: OverviewShowcase | null } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const [classes, setClasses] = useState<ClassRow[]>([])
  const [levels, setLevels] = useState<Level[]>([])
  const [instructors, setInstructors] = useState<Profile[]>([])
  const [classInstructorMap, setClassInstructorMap] = useState<Record<string, Profile[]>>({})
  const [parents, setParents] = useState<Profile[]>([])
  const [skaters, setSkaters] = useState<Skater[]>([])
  const [shows, setShows] = useState<Show[]>([])

  const [showClassForm, setShowClassForm] = useState(false)
  const [editClassId, setEditClassId] = useState<string | null>(null)
  const [cfLevel, setCfLevel] = useState('')
  const [cfInstructors, setCfInstructors] = useState<string[]>([])
  const [cfDay, setCfDay] = useState('Monday')
  const [cfTime, setCfTime] = useState('')
  const [cfLocation, setCfLocation] = useState('Zone A')
  const [cfError, setCfError] = useState('')
  const [cfLoading, setCfLoading] = useState(false)

  const [showSkaterForm, setShowSkaterForm] = useState(false)
  const [editSkaterId, setEditSkaterId] = useState<string | null>(null)
  const [sfName, setSfName] = useState('')
  const [sfLevel, setSfLevel] = useState('')
  const [sfParent, setSfParent] = useState('')
  const [sfError, setSfError] = useState('')
  const [sfLoading, setSfLoading] = useState(false)

  const [enrollClassId, setEnrollClassId] = useState('')
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [enrollLoading, setEnrollLoading] = useState(false)

  const [showShowForm, setShowShowForm] = useState(false)
  const [showView, setShowView] = useState<'list' | 'calendar'>('list')
  const [calendarShowId, setCalendarShowId] = useState('')
  const [editShowId, setEditShowId] = useState<string | null>(null)
  const [shName, setShName] = useState('')
  const [shTheme, setShTheme] = useState('')
  const [shDate, setShDate] = useState('')
  const [shTime, setShTime] = useState('')
  const [shLocation, setShLocation] = useState('')
  const [shError, setShError] = useState('')
  const [shLoading, setShLoading] = useState(false)

  const [showGroupForm, setShowGroupForm] = useState(false)
  const [groupShowId, setGroupShowId] = useState('')
  const [grName, setGrName] = useState('')
  const [grHalf, setGrHalf] = useState<'First Half' | 'Second Half'>('First Half')
  const [grLevels, setGrLevels] = useState<string[]>([])
  const [grError, setGrError] = useState('')

  const [showPracticeForm, setShowPracticeForm] = useState(false)
  const [prShowId, setPrShowId] = useState('')
  const [prGroupId, setPrGroupId] = useState('')
  const [prDate, setPrDate] = useState('')
  const [prStart, setPrStart] = useState('')
  const [prEnd, setPrEnd] = useState('')
  const [prLabel, setPrLabel] = useState('')
  const [prError, setPrError] = useState('')

  async function loadAll() {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user
    if (!user) { router.push('/login'); return }

    const [{ data: prof }, { data: cls }, { data: lvl }, { data: inst }, { data: par }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('classes').select('*, levels(name), profiles(full_name)').order('day_of_week'),
      supabase.from('levels').select('*').order('order_index'),
      supabase.from('profiles').select('*').eq('role', 'instructor'),
      supabase.from('profiles').select('*').eq('role', 'parent'),
    ])

    if (prof?.role !== 'admin') { router.push('/login'); return }

    setProfile(prof)
    setClasses((cls as ClassRow[]) || [])
    setLevels(lvl || [])
    setInstructors(inst || [])
    setParents(par || [])

    const skatersRes = await fetch('/api/skaters')
    if (skatersRes.ok) setSkaters(await skatersRes.json())

    const showsRes = await fetch('/api/skating-shows')
    if (showsRes.ok) {
      const loadedShows: Show[] = await showsRes.json()
      setShows(loadedShows)
      if (!calendarShowId && loadedShows.length > 0) {
        setCalendarShowId(loadedShows[0].id)
      }
    }

    const classInstRes = await fetch('/api/class-instructors')
    if (classInstRes.ok) {
      const links: ClassInstructorAssignment[] = await classInstRes.json()
      const grouped: Record<string, Profile[]> = {}
      for (const link of links) {
        if (!link.profiles) continue
        if (!grouped[link.class_id]) grouped[link.class_id] = []
        grouped[link.class_id].push({ id: link.profiles.id, full_name: link.profiles.full_name, role: 'instructor' })
      }
      setClassInstructorMap(grouped)
    } else {
      setClassInstructorMap({})
    }

    const ovRes = await fetch('/api/admin/overview')
    if (ovRes.ok) setOverview(await ovRes.json())

    setLoading(false)
  }

  useEffect(() => {
    void loadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial dashboard load only
  }, [])

  async function loadEnrollments(classId: string) {
    setEnrollLoading(true)
    const res = await fetch(`/api/enrollments?class_id=${classId}`)
    if (res.ok) setEnrollments(await res.json())
    setEnrollLoading(false)
  }

  function openClassCreate() {
    setEditClassId(null); setCfLevel(levels[0]?.id || ''); setCfInstructors(instructors[0]?.id ? [instructors[0].id] : [])
    setCfDay('Monday'); setCfTime('9:00 AM'); setCfLocation('Zone A'); setCfError(''); setShowClassForm(true)
  }
  function openClassEdit(cls: ClassRow) {
    const level = levels.find(l => l.name === cls.levels.name)
    const instructor = instructors.find(i => i.full_name === cls.profiles?.full_name)
    const mapped = classInstructorMap[cls.id]?.map(i => i.id) || []
    const fallback = instructor?.id ? [instructor.id] : (instructors[0]?.id ? [instructors[0].id] : [])
    setEditClassId(cls.id); setCfLevel(level?.id || ''); setCfInstructors(mapped.length > 0 ? mapped : fallback)
    setCfDay(cls.day_of_week); setCfTime(cls.time_slot); setCfLocation(cls.ice_location); setCfError(''); setShowClassForm(true)
  }
  async function handleClassSubmit(e: React.FormEvent) {
    e.preventDefault(); setCfError(''); setCfLoading(true)
    const result = await upsertClass({
      levelId: cfLevel, instructorIds: cfInstructors, day: cfDay, time: cfTime, location: cfLocation, editId: editClassId,
    })
    if (result.error) { setCfError(result.error); setCfLoading(false); return }
    setShowClassForm(false); setCfLoading(false); loadAll()
  }
  async function handleClassDelete(id: string) {
    if (!confirm('Delete this class?')) return
    await deleteClass(id); loadAll()
  }

  function openSkaterCreate() {
    setEditSkaterId(null); setSfName(''); setSfLevel(levels[0]?.id || ''); setSfParent(''); setSfError(''); setShowSkaterForm(true)
  }
  function openSkaterEdit(s: Skater) {
    setEditSkaterId(s.id); setSfName(s.full_name); setSfLevel(s.level?.id || ''); setSfParent(s.parent?.id || ''); setSfError(''); setShowSkaterForm(true)
  }
  async function handleSkaterSubmit(e: React.FormEvent) {
    e.preventDefault(); setSfError(''); setSfLoading(true)
    const payload = { full_name: sfName, level_id: sfLevel, parent_id: sfParent || null }
    const url = editSkaterId ? `/api/skaters/${editSkaterId}` : '/api/skaters'
    const method = editSkaterId ? 'PUT' : 'POST'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    if (!res.ok) { const d = await res.json(); setSfError(d.error || 'Failed'); setSfLoading(false); return }
    setShowSkaterForm(false); setSfLoading(false); loadAll()
  }
  async function handleSkaterDelete(id: string) {
    if (!confirm('Delete this skater?')) return
    await fetch(`/api/skaters/${id}`, { method: 'DELETE' }); loadAll()
  }

  async function handleEnroll(skaterId: string) {
    if (!enrollClassId) return
    await fetch('/api/enrollments', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ class_id: enrollClassId, skater_id: skaterId })
    })
    loadEnrollments(enrollClassId)
  }
  async function handleUnenroll(skaterId: string) {
    if (!enrollClassId) return
    await fetch('/api/enrollments', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ class_id: enrollClassId, skater_id: skaterId })
    })
    loadEnrollments(enrollClassId)
  }

  function openShowCreate() {
    setEditShowId(null); setShName(''); setShTheme(''); setShDate(''); setShTime(''); setShLocation(''); setShError(''); setShowShowForm(true)
  }
  function openShowEdit(s: Show) {
    setEditShowId(s.id); setShName(s.name); setShTheme(s.theme || ''); setShDate(s.show_date); setShTime(s.show_time || ''); setShLocation(s.location || ''); setShError(''); setShowShowForm(true)
  }
  async function handleShowSubmit(e: React.FormEvent) {
    e.preventDefault(); setShError(''); setShLoading(true)
    const payload = { id: editShowId, name: shName, theme: shTheme, show_date: shDate, show_time: shTime, location: shLocation }
    const res = await fetch('/api/skating-shows', {
      method: editShowId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
    })
    if (!res.ok) { const d = await res.json(); setShError(d.error || 'Failed'); setShLoading(false); return }
    setShowShowForm(false); setShLoading(false); loadAll()
  }
  async function handleShowDelete(id: string) {
    if (!confirm('Delete this show and all its groups/practices?')) return
    await fetch(`/api/skating-shows?id=${id}`, { method: 'DELETE' }); loadAll()
  }

  function openGroupCreate(showId: string) {
    setGroupShowId(showId); setGrName(''); setGrHalf('First Half'); setGrLevels([]); setGrError(''); setShowGroupForm(true)
  }
  async function handleGroupSubmit(e: React.FormEvent) {
    e.preventDefault(); setGrError('')
    const res = await fetch('/api/skating-shows/groups', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ show_id: groupShowId, name: grName, show_half: grHalf, level_ids: grLevels })
    })
    if (!res.ok) { const d = await res.json(); setGrError(d.error || 'Failed'); return }
    setShowGroupForm(false); loadAll()
  }
  async function handleGroupDelete(id: string) {
    if (!confirm('Delete this group?')) return
    await fetch(`/api/skating-shows/groups?id=${id}`, { method: 'DELETE' }); loadAll()
  }

  function openPracticeCreate(showId: string, groupId: string) {
    setPrShowId(showId); setPrGroupId(groupId); setPrDate(''); setPrStart(''); setPrEnd(''); setPrLabel(''); setPrError(''); setShowPracticeForm(true)
  }
  async function handlePracticeSubmit(e: React.FormEvent) {
    e.preventDefault(); setPrError('')
    const res = await fetch('/api/skating-shows/practices', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ show_id: prShowId, group_id: prGroupId, practice_date: prDate, start_time: prStart, end_time: prEnd, label: prLabel })
    })
    if (!res.ok) { const d = await res.json(); setPrError(d.error || 'Failed'); return }
    setShowPracticeForm(false); loadAll()
  }
  async function handlePracticeDelete(id: string) {
    if (!confirm('Delete this practice?')) return
    await fetch(`/api/skating-shows/practices?id=${id}`, { method: 'DELETE' }); loadAll()
  }

  async function handleLogout() { await supabase.auth.signOut(); router.push('/login') }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--paper)' }}>
      <div className="flex flex-col items-center gap-4">
        <svg className="animate-spin w-8 h-8" style={{ color: 'var(--ice)' }} fill="none" viewBox="0 0 24 24" aria-hidden>
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        <p style={{ color: 'var(--muted)', fontSize: 13 }}>Loading dashboard…</p>
      </div>
    </div>
  )

  const enrolledIds = new Set(enrollments.map(e => e.skater_id))
  const unenrolledSkaters = skaters.filter(s => !enrolledIds.has(s.id))
  const totalEnrollments = overview?.levelBars.reduce((acc, r) => acc + r.enrolled, 0) ?? 0
  const adminInitials = (profile?.full_name || 'A')
    .split(/\s+/)
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
  const calendarShow = shows.find((s) => s.id === calendarShowId) || shows[0] || null
  const calendarPracticeEvents = (calendarShow?.groups || []).flatMap((g) =>
    (g.practices || []).map((p) => ({
      ...p,
      group_name: g.name,
    }))
  )
  const calendarBaseDate = calendarPracticeEvents[0]?.practice_date || calendarShow?.show_date || null
  const calendarMonth = calendarBaseDate ? new Date(`${calendarBaseDate}T12:00:00`) : null
  const monthStart = calendarMonth ? new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1) : null
  const monthEnd = calendarMonth ? new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0) : null
  const monthName = calendarMonth ? calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : ''
  const leadingMondayOffset = monthStart ? (monthStart.getDay() + 6) % 7 : 0
  const daysInMonth = monthEnd?.getDate() || 0
  const eventsByDate = new Map<string, Array<{ start: string; end: string; label: string; groupName: string }>>()
  for (const p of calendarPracticeEvents) {
    if (!eventsByDate.has(p.practice_date)) eventsByDate.set(p.practice_date, [])
    eventsByDate.get(p.practice_date)?.push({
      start: p.start_time,
      end: p.end_time,
      label: p.label || 'Practice',
      groupName: p.group_name,
    })
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--paper)' }}>
      {/* Nav — hi-fi: tabs + search + avatar */}
      <nav className="px-5 md:px-7 py-3 flex flex-wrap items-center gap-3 md:gap-5" style={{ background: 'var(--surface)', borderBottom: '1px solid var(--hairline)' }}>
        <span className="inline-flex items-center gap-2">
          <svg width={20} height={20} viewBox="0 0 28 28" fill="none" aria-hidden>
            <path d="M5 19 Q 14 22, 23 19" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" />
            <path d="M9 19 L 12 8 L 14 8 L 13 19" stroke="var(--ink)" strokeWidth="1.6" fill="none" strokeLinejoin="round" />
            <circle cx="6" cy="20" r="1.2" fill="var(--ink)" /><circle cx="22" cy="20" r="1.2" fill="var(--ink)" />
          </svg>
          <span className="font-display" style={{ fontSize: 19, fontWeight: 500, letterSpacing: '-0.02em' }}>Ice<span style={{ fontStyle: 'italic', fontWeight: 400 }}>Track</span></span>
        </span>
        <span className="pill pill-crimson">Admin</span>
        <Link
          href="/assistant"
          className="ml-1 inline-flex items-center rounded-md text-sm font-medium cursor-pointer"
          style={{
            padding: '6px 10px',
            border: '1px solid var(--ice)',
            background: 'var(--ice-soft)',
            color: 'var(--ice-deep)',
            textDecoration: 'none',
          }}
        >
          Assistant
        </Link>
        <div className="flex flex-wrap gap-0.5 md:ml-2">
          {TABS.map(t => (
            <button key={t} onClick={() => { setTab(t); if (t === 'Enrollment' && enrollClassId) void loadEnrollments(enrollClassId) }}
              className="cursor-pointer" style={{
                padding: '8px 12px', fontSize: 13, fontWeight: tab === t ? 500 : 400,
                color: tab === t ? 'var(--ink)' : 'var(--muted)', borderRadius: 'var(--r-sm)',
                background: tab === t ? 'var(--surface2)' : 'transparent', border: 'none',
              }}>
              {tabNavLabel(t)}
            </button>
          ))}
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2 md:gap-3">
          <div className="hidden sm:flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs" style={{ border: '1px solid var(--hairline)', background: 'var(--surface2)', color: 'var(--muted)', minWidth: 190 }}>
            <IconSearch />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search · ⌘K"
              style={{
                width: '100%',
                minWidth: 0,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                color: 'var(--ink-soft)',
                fontSize: 12,
                fontFamily: '"Geist Mono","JetBrains Mono",ui-monospace,monospace',
                letterSpacing: '0.04em',
              }}
            />
          </div>
          <div className="flex items-center justify-center text-xs font-semibold flex-shrink-0" style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--ice-soft)', color: 'var(--ice-deep)', border: '1px solid var(--hairline)' }} aria-hidden>
            {adminInitials}
          </div>
          <span className="hidden sm:inline" style={{ fontSize: 13, fontWeight: 500 }}>{profile?.full_name}</span>
          <button type="button" onClick={handleLogout} className="flex items-center gap-1.5 cursor-pointer" style={{ padding: '5px 10px', fontSize: 12, borderRadius: 'var(--r-sm)', border: '1px solid var(--hairline)', background: 'var(--surface)', color: 'var(--ink-soft)' }}>
            <IconSignOut /> Sign out
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-5 md:px-7 py-7">
        {tab === 'Overview' ? (
          <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between" style={{ marginBottom: 22 }}>
            <div>
              <div className="eyebrow">Spring 2026 · Frank Southern Ice Arena</div>
              <h1 className="font-display" style={{ fontSize: 40, fontWeight: 400, marginTop: 6, letterSpacing: '-0.02em' }}>
                At a <span style={{ fontStyle: 'italic' }}>glance.</span>
              </h1>
              <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 4 }}>
                {classes.length} classes · {skaters.length} skaters · {instructors.length} instructors · {shows.length} show{shows.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" className="cursor-pointer rounded-md text-sm font-medium" style={{ padding: '9px 14px', border: '1px solid var(--hairline)', background: 'var(--surface)', color: 'var(--ink-soft)' }} title="Export is planned for a future release">
                Export
              </button>
              <button type="button" onClick={openClassCreate} className="it-btn-primary inline-flex items-center gap-2 cursor-pointer rounded-md text-sm font-medium shadow-[0_1px_0_#1e5a9155,0_4px_12px_-4px_rgba(59,130,196,0.33)]" style={{ padding: '9px 14px' }}>
                <IconPlus />
                New class
              </button>
            </div>
          </header>
        ) : (
          <header style={{ marginBottom: 22 }}>
            <div className="eyebrow">Spring 2026 · Frank Southern Ice Arena</div>
            <h1 className="font-display" style={{ fontSize: 28, fontWeight: 500, marginTop: 6, letterSpacing: '-0.02em' }}>
              {tabNavLabel(tab)}
            </h1>
            <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 4 }}>
              {classes.length} classes · {skaters.length} skaters · {instructors.length} instructors
            </p>
          </header>
        )}

        {/* OVERVIEW — hi-fi KPI + enrollment by level + rail */}
        {tab === 'Overview' && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
              {[
                { label: 'Active classes', n: String(classes.length), sub: 'On the schedule', tone: 'ice' as const },
                { label: 'Skaters enrolled', n: String(skaters.length), sub: `${parents.length} parent accounts`, tone: 'ink' as const },
                { label: 'Instructors', n: String(instructors.length), sub: 'Profiles with instructor role', tone: 'ink' as const },
                { label: 'Total enrollments', n: String(totalEnrollments), sub: 'Seatings across all classes', tone: 'spring' as const },
              ].map((s) => (
                <button type="button" key={s.label} onClick={() => { if (s.label === 'Active classes') setTab('Classes'); if (s.label === 'Skaters enrolled') setTab('Skaters'); if (s.label === 'Instructors') setTab('Instructors'); if (s.label === 'Total enrollments') setTab('Enrollment') }}
                  className="card p-4 md:p-5 text-left cursor-pointer hover:shadow-md transition-shadow w-full">
                  <div className="eyebrow mb-2">{s.label}</div>
                  <div className="font-display" style={{
                    fontSize: 34, fontWeight: 400, letterSpacing: '-0.02em',
                    color: s.tone === 'ice' ? 'var(--ice-deep)' : s.tone === 'spring' ? 'var(--spring)' : 'var(--ink)',
                    lineHeight: 1,
                  }}>{s.n}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>{s.sub}</div>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-4">
              <div className="card" style={{ padding: 22 }}>
                <div className="flex justify-between items-baseline mb-4 md:mb-5 flex-wrap gap-2">
                  <div>
                    <h3 className="font-display" style={{ fontSize: 18, fontWeight: 500 }}>Enrollment by level</h3>
                    <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>Filled vs estimated capacity (8 seats per class section)</p>
                  </div>
                  <span className="pill pill-ice" style={{ fontSize: 11 }}>Spring 2026</span>
                </div>
                {(overview?.levelBars.length ? overview.levelBars : levels.map(l => ({ level_id: l.id, name: l.name, enrolled: 0, cap: 8 }))).map((r) => {
                  const pct = Math.min(1, r.enrolled / r.cap)
                  const full = r.enrolled >= r.cap && r.cap > 0
                  return (
                    <div key={r.level_id} className="grid grid-cols-[minmax(0,88px)_1fr_52px] items-center gap-3 py-2" style={{ borderTop: '1px solid var(--hairline-soft)' }}>
                      <span style={{ fontSize: 13, color: 'var(--ink-soft)' }}>{r.name}</span>
                      <div className="relative h-[22px] rounded-[var(--r-sm)] overflow-hidden" style={{ background: 'var(--hairline-soft)' }}>
                        <div className="h-full rounded-[var(--r-sm)] transition-[width] duration-300" style={{ width: `${pct * 100}%`, background: full ? 'var(--crimson)' : 'var(--ice)' }} />
                        {full ? (
                          <span className="font-mono absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-white">FULL</span>
                        ) : null}
                      </div>
                      <span className="font-mono text-right text-xs font-medium" style={{ color: full ? 'var(--crimson)' : 'var(--ink)' }}>{r.enrolled}/{r.cap}</span>
                    </div>
                  )
                })}
              </div>

              <div className="flex flex-col gap-4">
                <div className="card" style={{ padding: 18 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: 14 }}>Recent activity</h3>
                  {[
                    { who: 'System', what: 'Use Classes and Enrollment tabs for live changes', when: 'Today', hue: 210 },
                    { who: 'Tip', what: 'Run supabase-reset.sql after a blank database', when: 'Setup', hue: 150 },
                    { who: 'Show', what: overview?.showcase ? `${overview.showcase.name} on deck` : 'Create a spring show when ready', when: 'Season', hue: 290 },
                    { who: profile?.full_name || 'Admin', what: 'Signed in to IceTrack admin', when: 'Session', hue: 250 },
                  ].map((a, i) => (
                    <div key={i} className="flex gap-3 py-2 items-start" style={{ borderBottom: i < 3 ? '1px solid var(--hairline-soft)' : 'none' }}>
                      <div className="flex items-center justify-center text-[10px] font-bold flex-shrink-0" style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--surface2)', color: `hsl(${a.hue} 28% 36%)`, border: '1px solid var(--hairline)' }}>
                        {a.who.charAt(0)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12 }}><strong style={{ fontWeight: 600 }}>{a.who}</strong> {a.what}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{a.when}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="card overflow-hidden" style={{ background: 'linear-gradient(155deg, var(--ice-deep), var(--ice))', color: '#fff' }}>
                  <div style={{ padding: 18 }}>
                    <div className="eyebrow" style={{ color: 'rgba(255,255,255,0.75)' }}>Spring showcase</div>
                    {overview?.showcase ? (
                      <>
                        <h3 className="font-display" style={{ fontSize: 22, color: '#fff', fontWeight: 400, marginTop: 4 }}>
                          {overview.showcase.show_date} · <span style={{ fontStyle: 'italic' }}>{overview.showcase.theme || overview.showcase.name}</span>
                        </h3>
                        <div className="mt-3 grid grid-cols-2 gap-3">
                          <div><div className="font-mono" style={{ fontSize: 22 }}>{overview.showcase.group_count}</div><div style={{ fontSize: 11, opacity: 0.85 }}>groups</div></div>
                          <div><div className="font-mono" style={{ fontSize: 22 }}>{overview.showcase.practice_count}</div><div style={{ fontSize: 11, opacity: 0.85 }}>practices</div></div>
                        </div>
                      </>
                    ) : (
                      <>
                        <h3 className="font-display" style={{ fontSize: 22, color: '#fff', fontWeight: 400, marginTop: 4 }}>No show scheduled</h3>
                        <p style={{ fontSize: 12, opacity: 0.85, marginTop: 8 }}>Add a show from the Show tab when your season is ready.</p>
                      </>
                    )}
                    <button type="button" onClick={() => setTab('Skating Show')} className="mt-4 inline-flex items-center gap-2 cursor-pointer rounded-md text-sm font-medium" style={{ padding: '8px 14px', background: '#fff', color: 'var(--ice-deep)', border: '1px solid #fff' }}>
                      Manage <span aria-hidden>→</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* CLASSES TAB */}
        {tab === 'Classes' && (
          <div className="card overflow-hidden">
            <div className="flex justify-between items-center px-6 py-5" style={{ borderBottom: '1px solid var(--hairline-soft)' }}>
              <div>
                <h3 className="font-display" style={{ fontSize: 22, fontWeight: 500 }}>Classes</h3>
                <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>{classes.length} class{classes.length !== 1 ? 'es' : ''} scheduled</p>
              </div>
              <button onClick={openClassCreate} className="it-btn-primary inline-flex items-center gap-2 cursor-pointer rounded-md text-sm font-medium shadow-[0_1px_0_#1e5a9155,0_4px_12px_-4px_rgba(59,130,196,0.33)]" style={{ padding: '9px 14px' }}>
                <IconPlus />
                New class
              </button>
            </div>
            {classes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                <div style={{ width: 56, height: 56, borderRadius: 'var(--r-md)', background: 'var(--ice-soft)', color: 'var(--ice-deep)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </div>
                <p className="font-display" style={{ fontSize: 18, fontWeight: 500 }}>No classes yet</p>
                <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>Create your first class to get started.</p>
                <p style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 14, maxWidth: 420, lineHeight: 1.5 }}>
                  If the whole rink feels empty after a database reset, run <span className="font-mono" style={{ fontSize: 11 }}>i400_vibeai_project/supabase-reset.sql</span> in the Supabase SQL editor to reload levels, skills, classes, show schedule, and demo skaters — or use <span className="font-mono" style={{ fontSize: 11 }}>supabase-seed-demo-data.sql</span> for a lighter refill.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--hairline-soft)', background: 'var(--surface2)' }}>
                      <th className="eyebrow text-left px-6 py-3.5">Level</th>
                      <th className="eyebrow text-left px-6 py-3.5">Instructor</th>
                      <th className="eyebrow text-left px-6 py-3.5">Day</th>
                      <th className="eyebrow text-left px-6 py-3.5">Time</th>
                      <th className="eyebrow text-left px-6 py-3.5">Location</th>
                      <th className="eyebrow text-right px-6 py-3.5">Actions</th>
                    </tr>
                  </thead>
                  <tbody style={{ borderTop: '1px solid var(--hairline-soft)' }}>
                    {classes.map((cls, idx) => (
                      <tr key={cls.id} className="group transition-colors" style={{ borderTop: idx === 0 ? 'none' : '1px solid var(--hairline-soft)' }}>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getLevelBadge(cls.levels.name)}`}>
                            {cls.levels.name}
                          </span>
                        </td>
                        <td className="px-6 py-4" style={{ color: 'var(--ink)', fontWeight: 500 }}>
                          {(() => {
                            const names = classInstructorMap[cls.id]?.map((p) => p.full_name) || []
                            if (names.length > 0) return names.join(', ')
                            return cls.profiles?.full_name || <span style={{ color: 'var(--muted)', fontStyle: 'italic', fontSize: 12 }}>Unassigned</span>
                          })()}
                        </td>
                        <td className="px-6 py-4" style={{ color: 'var(--ink-soft)' }}>{cls.day_of_week}</td>
                        <td className="px-6 py-4 font-mono" style={{ color: 'var(--ink)', fontSize: 13 }}>{cls.time_slot}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getZoneBadge(cls.ice_location)}`}>
                            {cls.ice_location}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openClassEdit(cls)} className="flex items-center gap-1.5 hover:bg-[var(--ice-soft)] px-2.5 py-1.5 rounded-md text-xs font-medium cursor-pointer" style={{ color: 'var(--ink-soft)' }}>
                              <IconEdit /> Edit
                            </button>
                            <button onClick={() => handleClassDelete(cls.id)} className="flex items-center gap-1.5 hover:bg-[var(--rust-soft)] px-2.5 py-1.5 rounded-md text-xs font-medium cursor-pointer" style={{ color: 'var(--muted)' }}>
                              <IconTrash /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* SKATERS TAB */}
        {tab === 'Skaters' && (
          <div className="card overflow-hidden">
            <div className="flex justify-between items-center px-6 py-5" style={{ borderBottom: '1px solid var(--hairline-soft)' }}>
              <div>
                <h3 className="font-display" style={{ fontSize: 22, fontWeight: 500 }}>Skaters</h3>
                <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>{skaters.length} skater{skaters.length !== 1 ? 's' : ''} registered</p>
              </div>
              <button onClick={openSkaterCreate} className="it-btn-primary inline-flex items-center gap-2 cursor-pointer rounded-md text-sm font-medium shadow-[0_1px_0_#1e5a9155,0_4px_12px_-4px_rgba(59,130,196,0.33)]" style={{ padding: '9px 14px' }}>
                <IconPlus />
                Add skater
              </button>
            </div>
            {skaters.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                <div style={{ width: 56, height: 56, borderRadius: 'var(--r-md)', background: 'var(--ice-soft)', color: 'var(--ice-deep)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
                  </svg>
                </div>
                <p className="font-display" style={{ fontSize: 18, fontWeight: 500 }}>No skaters yet</p>
                <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>Add skaters to enroll them in classes.</p>
                <p style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 12, maxWidth: 420, lineHeight: 1.5 }}>
                  Or run <span className="font-mono" style={{ fontSize: 11 }}>supabase-seed-demo-data.sql</span> / <span className="font-mono" style={{ fontSize: 11 }}>supabase-reset.sql</span> in Supabase to refill sample skaters.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--hairline-soft)', background: 'var(--surface2)' }}>
                      <th className="eyebrow text-left px-6 py-3.5">Name</th>
                      <th className="eyebrow text-left px-6 py-3.5">Level</th>
                      <th className="eyebrow text-left px-6 py-3.5">Parent</th>
                      <th className="eyebrow text-right px-6 py-3.5">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {skaters.map((s, idx) => (
                      <tr key={s.id} className="group transition-colors" style={{ borderTop: idx === 0 ? 'none' : '1px solid var(--hairline-soft)' }}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--ice-soft)', color: 'var(--ice-deep)' }}>
                              {s.full_name.charAt(0).toUpperCase()}
                            </div>
                            <span style={{ fontWeight: 500, color: 'var(--ink)' }}>{s.full_name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getLevelBadge(s.level?.name || '')}`}>
                            {s.level?.name || '—'}
                          </span>
                        </td>
                        <td className="px-6 py-4" style={{ color: 'var(--ink-soft)' }}>
                          {s.parent?.full_name || <span style={{ color: 'var(--muted)', fontStyle: 'italic', fontSize: 12 }}>None</span>}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openSkaterEdit(s)} className="flex items-center gap-1.5 hover:bg-[var(--ice-soft)] px-2.5 py-1.5 rounded-md text-xs font-medium cursor-pointer" style={{ color: 'var(--ink-soft)' }}>
                              <IconEdit /> Edit
                            </button>
                            <button onClick={() => handleSkaterDelete(s.id)} className="flex items-center gap-1.5 hover:bg-[var(--rust-soft)] px-2.5 py-1.5 rounded-md text-xs font-medium cursor-pointer" style={{ color: 'var(--muted)' }}>
                              <IconTrash /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* INSTRUCTORS TAB */}
        {tab === 'Instructors' && (
          <div className="card overflow-hidden">
            <div className="px-6 py-5" style={{ borderBottom: '1px solid var(--hairline-soft)' }}>
              <h3 className="font-display" style={{ fontSize: 22, fontWeight: 500 }}>Instructors</h3>
              <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>Staff with the instructor role — assign them when you create or edit classes.</p>
            </div>
            {instructors.length === 0 ? (
              <div className="py-16 text-center px-4" style={{ color: 'var(--muted)', fontSize: 14 }}>No instructor profiles yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--hairline-soft)', background: 'var(--surface2)' }}>
                      <th className="eyebrow text-left px-6 py-3.5">Name</th>
                      <th className="eyebrow text-left px-6 py-3.5">User ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {instructors.map((p, idx) => (
                      <tr key={p.id} style={{ borderTop: idx === 0 ? 'none' : '1px solid var(--hairline-soft)' }}>
                        <td className="px-6 py-4" style={{ fontWeight: 500, color: 'var(--ink)' }}>{p.full_name}</td>
                        <td className="px-6 py-4 font-mono text-xs" style={{ color: 'var(--muted)' }}>{p.id}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* REPORTS TAB */}
        {tab === 'Reports' && (
          <div className="card" style={{ padding: 36, textAlign: 'center', maxWidth: 520, margin: '0 auto' }}>
            <div className="eyebrow" style={{ marginBottom: 10 }}>Coming soon</div>
            <h3 className="font-display" style={{ fontSize: 22, fontWeight: 500, color: 'var(--ink)' }}>Program reports</h3>
            <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 10, lineHeight: 1.55 }}>
              Exportable attendance summaries, skill-pass throughput, and waitlist analytics will live here — aligned with the hi-fi admin artboard.
            </p>
          </div>
        )}

        {/* ENROLLMENT TAB */}
        {tab === 'Enrollment' && (
          <div className="card" style={{ padding: 24 }}>
            <div className="mb-6">
              <label className={labelCls}>Select a class</label>
              <select value={enrollClassId} onChange={e => { setEnrollClassId(e.target.value); if (e.target.value) loadEnrollments(e.target.value) }}
                className={inputCls}>
                <option value="">— Choose a class —</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.levels.name} · {c.day_of_week} {c.time_slot} ({c.profiles?.full_name || 'Unassigned'})</option>
                ))}
              </select>
            </div>

            {enrollClassId && (
              enrollLoading ? (
                <div className="flex items-center gap-2 text-sm py-8 justify-center" style={{ color: 'var(--muted)' }}>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24" aria-hidden>
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Loading…
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <h4 style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-soft)' }}>Enrolled</h4>
                      <span className="pill pill-spring">{enrollments.length}</span>
                    </div>
                    {enrollments.length === 0 ? (
                      <p style={{ fontSize: 13, color: 'var(--muted)', fontStyle: 'italic' }}>No skaters enrolled.</p>
                    ) : (
                      <div className="space-y-1.5">
                        {enrollments.map(en => (
                          <div key={en.id} className="flex items-center justify-between rounded-md px-4 py-2.5 text-sm" style={{ background: 'var(--spring-soft)', border: '1px solid rgba(58,154,118,0.2)' }}>
                            <div className="flex items-center gap-2.5">
                              <div className="flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(58,154,118,0.25)', color: 'var(--spring)' }}>
                                {en.skater.full_name.charAt(0)}
                              </div>
                              <span style={{ fontWeight: 500, color: 'var(--ink)' }}>{en.skater.full_name}</span>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getLevelBadge(en.skater.level?.name || '')}`}>
                                {en.skater.level?.name || '—'}
                              </span>
                            </div>
                            <button onClick={() => handleUnenroll(en.skater_id)} className="text-xs font-medium cursor-pointer" style={{ color: 'var(--rust)' }}>Remove</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <h4 style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-soft)' }}>Available to enroll</h4>
                      <span className="pill">{unenrolledSkaters.length}</span>
                    </div>
                    {unenrolledSkaters.length === 0 ? (
                      <p style={{ fontSize: 13, color: 'var(--muted)', fontStyle: 'italic' }}>All skaters are enrolled in this class.</p>
                    ) : (
                      <div className="space-y-1.5">
                        {unenrolledSkaters.map(s => (
                          <div key={s.id} className="flex items-center justify-between rounded-md px-4 py-2.5 text-sm" style={{ background: 'var(--surface2)', border: '1px solid var(--hairline)' }}>
                            <div className="flex items-center gap-2.5">
                              <div className="flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--hairline)', color: 'var(--ink-soft)' }}>
                                {s.full_name.charAt(0)}
                              </div>
                              <span style={{ fontWeight: 500, color: 'var(--ink)' }}>{s.full_name}</span>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getLevelBadge(s.level?.name || '')}`}>
                                {s.level?.name || '—'}
                              </span>
                            </div>
                            <button onClick={() => handleEnroll(s.id)} className="text-xs font-medium cursor-pointer" style={{ color: 'var(--ice-deep)' }}>+ Enroll</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {/* SKATING SHOW TAB */}
        {tab === 'Skating Show' && (
          <div className="space-y-5">
            <div className="card overflow-hidden">
              <div className="flex justify-between items-center px-6 py-5" style={{ borderBottom: '1px solid var(--hairline-soft)' }}>
                <div>
                  <h3 className="font-display" style={{ fontSize: 22, fontWeight: 500 }}>
                    Skating <span style={{ fontStyle: 'italic' }}>shows</span>
                  </h3>
                  <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>{shows.length} show{shows.length !== 1 ? 's' : ''}</p>
                </div>
                <button onClick={openShowCreate} className="it-btn-primary inline-flex items-center gap-2 cursor-pointer rounded-md text-sm font-medium shadow-[0_1px_0_#1e5a9155,0_4px_12px_-4px_rgba(59,130,196,0.33)]" style={{ padding: '9px 14px' }}>
                  <IconPlus />
                  New show
                </button>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3.5" style={{ borderBottom: '1px solid var(--hairline-soft)', background: 'var(--surface2)' }}>
                <div className="inline-flex rounded-md p-1" style={{ border: '1px solid var(--hairline)', background: 'var(--surface)' }}>
                  <button
                    type="button"
                    onClick={() => setShowView('list')}
                    className="cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium"
                    style={{ background: showView === 'list' ? 'var(--ice-soft)' : 'transparent', color: showView === 'list' ? 'var(--ice-deep)' : 'var(--muted)' }}
                  >
                    List
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowView('calendar')}
                    className="cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium"
                    style={{ background: showView === 'calendar' ? 'var(--ice-soft)' : 'transparent', color: showView === 'calendar' ? 'var(--ice-deep)' : 'var(--muted)' }}
                  >
                    Calendar
                  </button>
                </div>
                {shows.length > 1 && (
                  <select
                    value={calendarShowId}
                    onChange={(e) => setCalendarShowId(e.target.value)}
                    className={inputCls}
                    style={{ maxWidth: 280 }}
                  >
                    {shows.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                )}
              </div>
              {shows.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                  <div style={{ width: 56, height: 56, borderRadius: 'var(--r-md)', background: 'var(--ice-soft)', color: 'var(--ice-deep)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  </div>
                  <p className="font-display" style={{ fontSize: 18, fontWeight: 500 }}>No shows yet</p>
                  <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>Create a show to organize your performances.</p>
                </div>
              ) : showView === 'list' ? (
                <div className="p-6 space-y-4">
                  {shows.map(show => (
                    <div key={show.id} className="overflow-hidden" style={{ border: '1px solid var(--hairline)', borderRadius: 'var(--r-lg)' }}>
                      {/* Show header */}
                      <div className="flex justify-between items-start px-5 py-4" style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--hairline)' }}>
                        <div>
                          <h4 className="font-display" style={{ fontSize: 18, fontWeight: 500 }}>{show.name}</h4>
                          <div className="flex flex-wrap items-center gap-2 mt-1.5">
                            <span className="font-mono" style={{ fontSize: 11, color: 'var(--muted)' }}>{show.show_date}{show.show_time ? ` · ${show.show_time}` : ''}</span>
                            {show.location && <span style={{ fontSize: 12, color: 'var(--muted)' }}>· {show.location}</span>}
                            {show.theme && <span className="pill pill-honey">Theme: {show.theme}</span>}
                          </div>
                        </div>
                        <div className="flex gap-1.5 flex-shrink-0 ml-4">
                          <button onClick={() => openShowEdit(show)} className="flex items-center gap-1 hover:bg-[var(--ice-soft)] px-2.5 py-1.5 rounded-md text-xs font-medium cursor-pointer" style={{ color: 'var(--ink-soft)', border: '1px solid var(--hairline)' }}>
                            <IconEdit /> Edit
                          </button>
                          <button onClick={() => handleShowDelete(show.id)} className="flex items-center gap-1 hover:bg-[var(--rust-soft)] px-2.5 py-1.5 rounded-md text-xs font-medium cursor-pointer" style={{ color: 'var(--muted)', border: '1px solid var(--hairline)' }}>
                            <IconTrash /> Delete
                          </button>
                        </div>
                      </div>
                      {/* Groups */}
                      <div className="p-5">
                        <div className="flex items-center justify-between mb-3">
                          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-soft)' }}>Performance groups</span>
                          <button onClick={() => openGroupCreate(show.id)} className="flex items-center gap-1.5 text-xs font-medium hover:bg-[var(--ice-soft)] px-2.5 py-1.5 rounded-md cursor-pointer" style={{ color: 'var(--ice-deep)' }}>
                            <IconPlus />
                            Add group
                          </button>
                        </div>
                        {(!show.groups || show.groups.length === 0) ? (
                          <p style={{ fontSize: 13, color: 'var(--muted)', fontStyle: 'italic' }}>No groups defined yet.</p>
                        ) : (
                          <div className="space-y-3">
                            {show.groups.map(g => (
                              <div key={g.id} className="p-4" style={{ background: 'var(--surface2)', border: '1px solid var(--hairline)', borderRadius: 'var(--r-md)' }}>
                                <div className="flex justify-between items-start mb-2">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span style={{ fontWeight: 500, color: 'var(--ink)', fontSize: 13 }}>{g.name}</span>
                                    <span className="pill pill-ice">{g.show_half}</span>
                                    {g.levels?.map(gl => gl.level?.name).filter(Boolean).map(ln => (
                                      <span key={ln} className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getLevelBadge(ln!)}`}>{ln}</span>
                                    ))}
                                  </div>
                                  <div className="flex gap-1 flex-shrink-0 ml-2">
                                    <button onClick={() => openPracticeCreate(show.id, g.id)} className="flex items-center gap-1 text-xs font-medium hover:bg-[var(--ice-soft)] px-2 py-1 rounded-md cursor-pointer" style={{ color: 'var(--ice-deep)' }}>
                                      <IconPlus />
                                      Practice
                                    </button>
                                    <button onClick={() => handleGroupDelete(g.id)} className="hover:bg-[var(--rust-soft)] w-6 h-6 flex items-center justify-center rounded-md cursor-pointer" style={{ color: 'var(--muted)' }}>
                                      <IconX />
                                    </button>
                                  </div>
                                </div>
                                {g.practices && g.practices.length > 0 && (
                                  <div className="mt-3 space-y-1.5">
                                    {g.practices.map(p => (
                                      <div key={p.id} className="flex items-center justify-between rounded-md px-3 py-2 text-xs" style={{ background: 'var(--surface)', border: '1px solid var(--hairline)' }}>
                                        <span className="font-mono" style={{ color: 'var(--ink-soft)' }}>
                                          {p.practice_date} · {p.start_time}–{p.end_time}
                                          {p.label && <span style={{ color: 'var(--muted)', marginLeft: 6 }}>({p.label})</span>}
                                        </span>
                                        <button onClick={() => handlePracticeDelete(p.id)} className="cursor-pointer w-5 h-5 flex items-center justify-center" style={{ color: 'var(--muted)' }}>
                                          <IconX />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6">
                  {!calendarShow || !monthStart ? (
                    <p style={{ fontSize: 13, color: 'var(--muted)' }}>No show calendar data available.</p>
                  ) : (
                    <div className="card" style={{ padding: 16 }}>
                      <div className="flex items-end justify-between mb-4">
                        <div>
                          <h4 className="font-display" style={{ fontSize: 20, fontWeight: 500 }}>{calendarShow.name}</h4>
                          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{monthName}</p>
                        </div>
                        <span className="pill pill-ice">{calendarPracticeEvents.length} practices</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0,1fr))', gap: 8 }}>
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                          <div key={d} className="eyebrow" style={{ textAlign: 'center', fontSize: 10 }}>{d}</div>
                        ))}
                        {Array.from({ length: leadingMondayOffset }).map((_, i) => (
                          <div key={`empty-${i}`} style={{ minHeight: 92, borderRadius: 'var(--r-sm)', background: 'var(--surface2)', border: '1px solid var(--hairline-soft)' }} />
                        ))}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                          const day = i + 1
                          const iso = `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                          const dayEvents = eventsByDate.get(iso) || []
                          return (
                            <div key={iso} style={{ minHeight: 92, borderRadius: 'var(--r-sm)', background: dayEvents.length ? 'var(--ice-tint)' : 'var(--surface)', border: `1px solid ${dayEvents.length ? 'rgba(59,130,196,0.35)' : 'var(--hairline)'}`, padding: 6 }}>
                              <div className="font-mono" style={{ fontSize: 10, color: 'var(--muted)' }}>{day}</div>
                              <div className="mt-1.5 space-y-1">
                                {dayEvents.slice(0, 2).map((evt, idx) => (
                                  <div key={`${iso}-${idx}`} style={{ borderRadius: 999, background: 'var(--ice-soft)', color: 'var(--ice-deep)', border: '1px solid rgba(30,90,145,0.2)', padding: '2px 6px', fontSize: 10, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {evt.groupName.split('—')[0].trim()} · {evt.start.slice(0, 5)}
                                  </div>
                                ))}
                                {dayEvents.length > 2 ? (
                                  <div style={{ fontSize: 10, color: 'var(--muted)' }}>+{dayEvents.length - 2} more</div>
                                ) : null}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* CLASS MODAL */}
      {showClassForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md" style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-lift)' }}>
            <div className="flex items-center justify-between px-6 pt-6 pb-4" style={{ borderBottom: '1px solid var(--hairline-soft)' }}>
              <h3 className="font-display" style={{ fontSize: 20, fontWeight: 500 }}>{editClassId ? 'Edit class' : 'New class'}</h3>
              <button onClick={() => setShowClassForm(false)} className="w-8 h-8 rounded-md flex items-center justify-center cursor-pointer" style={{ color: 'var(--muted)' }} aria-label="Close">
                <IconX />
              </button>
            </div>
            <div className="px-6 py-5">
              {cfError && <div className="rounded-md p-3 mb-4 text-sm" style={{ background: 'var(--rust-soft)', border: '1px solid rgba(198,107,74,0.4)', color: '#8b3a25' }}>{cfError}</div>}
              <form id="classForm" onSubmit={handleClassSubmit} className="space-y-4">
                <div>
                  <label className={labelCls}>Level</label>
                  <select value={cfLevel} onChange={e => setCfLevel(e.target.value)} required className={inputCls}>
                    {levels.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Instructor</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto p-3" style={{ border: '1px solid var(--hairline)', borderRadius: 'var(--r-md)', background: 'var(--surface2)' }}>
                    {instructors.map(i => (
                      <label key={i.id} className="flex items-center gap-2.5 text-sm cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={cfInstructors.includes(i.id)}
                          onChange={e =>
                            setCfInstructors((prev) =>
                              e.target.checked ? [...prev, i.id] : prev.filter((id) => id !== i.id)
                            )
                          }
                          className="w-4 h-4 rounded"
                          style={{ accentColor: 'var(--ice)' }}
                        />
                        <span style={{ color: 'var(--ink-soft)' }}>{i.full_name}</span>
                      </label>
                    ))}
                  </div>
                  <p style={{ marginTop: 6, fontSize: 11, color: 'var(--muted)' }}>Select one or more instructors (required).</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Day</label>
                    <select value={cfDay} onChange={e => setCfDay(e.target.value)} required className={inputCls}>
                      {DAYS.map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Time Slot</label>
                    <input type="text" value={cfTime} onChange={e => setCfTime(e.target.value)} required placeholder="e.g. 9:00 AM" className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Ice Location</label>
                  <select value={cfLocation} onChange={e => setCfLocation(e.target.value)} className={inputCls}>
                    {['Zone A','Zone B','Zone C','Zone D','Center Ice'].map(z => <option key={z}>{z}</option>)}
                  </select>
                </div>
              </form>
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button type="button" onClick={() => setShowClassForm(false)} className="flex-1 py-2.5 rounded-md text-sm font-medium cursor-pointer" style={{ border: '1px solid var(--hairline)', background: 'var(--surface)', color: 'var(--ink-soft)' }}>Cancel</button>
              <button type="submit" form="classForm" disabled={cfLoading} className="it-btn-primary flex-1 py-2.5 rounded-md text-sm font-medium shadow-[0_1px_0_#1e5a9155,0_4px_12px_-4px_rgba(59,130,196,0.33)] cursor-pointer">
                {cfLoading ? 'Saving…' : editClassId ? 'Save Changes' : 'Create Class'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SKATER MODAL */}
      {showSkaterForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md" style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-lift)' }}>
            <div className="flex items-center justify-between px-6 pt-6 pb-4" style={{ borderBottom: '1px solid var(--hairline-soft)' }}>
              <h3 className="font-display" style={{ fontSize: 20, fontWeight: 500 }}>{editSkaterId ? 'Edit skater' : 'Add skater'}</h3>
              <button onClick={() => setShowSkaterForm(false)} className="w-8 h-8 rounded-md flex items-center justify-center cursor-pointer" style={{ color: 'var(--muted)' }} aria-label="Close">
                <IconX />
              </button>
            </div>
            <div className="px-6 py-5">
              {sfError && <div className="rounded-md p-3 mb-4 text-sm" style={{ background: 'var(--rust-soft)', border: '1px solid rgba(198,107,74,0.4)', color: '#8b3a25' }}>{sfError}</div>}
              <form id="skaterForm" onSubmit={handleSkaterSubmit} className="space-y-4">
                <div>
                  <label className={labelCls}>Full Name</label>
                  <input type="text" value={sfName} onChange={e => setSfName(e.target.value)} required placeholder="Skater name" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Level</label>
                  <select value={sfLevel} onChange={e => setSfLevel(e.target.value)} required className={inputCls}>
                    {levels.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Parent Account</label>
                  <select value={sfParent} onChange={e => setSfParent(e.target.value)} className={inputCls}>
                    <option value="">— No parent linked —</option>
                    {parents.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                  </select>
                </div>
              </form>
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button type="button" onClick={() => setShowSkaterForm(false)} className="flex-1 py-2.5 rounded-md text-sm font-medium cursor-pointer" style={{ border: '1px solid var(--hairline)', background: 'var(--surface)', color: 'var(--ink-soft)' }}>Cancel</button>
              <button type="submit" form="skaterForm" disabled={sfLoading} className="it-btn-primary flex-1 py-2.5 rounded-md text-sm font-medium shadow-[0_1px_0_#1e5a9155,0_4px_12px_-4px_rgba(59,130,196,0.33)] cursor-pointer">
                {sfLoading ? 'Saving…' : editSkaterId ? 'Save Changes' : 'Add Skater'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SHOW MODAL */}
      {showShowForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md" style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-lift)' }}>
            <div className="flex items-center justify-between px-6 pt-6 pb-4" style={{ borderBottom: '1px solid var(--hairline-soft)' }}>
              <h3 className="font-display" style={{ fontSize: 20, fontWeight: 500 }}>{editShowId ? 'Edit show' : 'New show'}</h3>
              <button onClick={() => setShowShowForm(false)} className="w-8 h-8 rounded-md flex items-center justify-center cursor-pointer" style={{ color: 'var(--muted)' }} aria-label="Close">
                <IconX />
              </button>
            </div>
            <div className="px-6 py-5">
              {shError && <div className="rounded-md p-3 mb-4 text-sm" style={{ background: 'var(--rust-soft)', border: '1px solid rgba(198,107,74,0.4)', color: '#8b3a25' }}>{shError}</div>}
              <form id="showForm" onSubmit={handleShowSubmit} className="space-y-4">
                <div>
                  <label className={labelCls}>Show Name</label>
                  <input type="text" value={shName} onChange={e => setShName(e.target.value)} required placeholder="Spring Showcase 2026" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Theme <span className="font-normal" style={{ color: 'var(--muted)' }}>(optional)</span></label>
                  <input type="text" value={shTheme} onChange={e => setShTheme(e.target.value)} placeholder="e.g. Frozen Wonderland" className={inputCls} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Date</label>
                    <input type="date" value={shDate} onChange={e => setShDate(e.target.value)} required className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Time <span className="font-normal" style={{ color: 'var(--muted)' }}>(opt.)</span></label>
                    <input type="time" value={shTime} onChange={e => setShTime(e.target.value)} className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Location <span className="font-normal" style={{ color: 'var(--muted)' }}>(optional)</span></label>
                  <input type="text" value={shLocation} onChange={e => setShLocation(e.target.value)} placeholder="Frank Southern Ice Arena" className={inputCls} />
                </div>
              </form>
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button type="button" onClick={() => setShowShowForm(false)} className="flex-1 py-2.5 rounded-md text-sm font-medium cursor-pointer" style={{ border: '1px solid var(--hairline)', background: 'var(--surface)', color: 'var(--ink-soft)' }}>Cancel</button>
              <button type="submit" form="showForm" disabled={shLoading} className="it-btn-primary flex-1 py-2.5 rounded-md text-sm font-medium shadow-[0_1px_0_#1e5a9155,0_4px_12px_-4px_rgba(59,130,196,0.33)] cursor-pointer">
                {shLoading ? 'Saving…' : editShowId ? 'Save Changes' : 'Create Show'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GROUP MODAL */}
      {showGroupForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md" style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-lift)' }}>
            <div className="flex items-center justify-between px-6 pt-6 pb-4" style={{ borderBottom: '1px solid var(--hairline-soft)' }}>
              <h3 className="font-display" style={{ fontSize: 20, fontWeight: 500 }}>Add group</h3>
              <button onClick={() => setShowGroupForm(false)} className="w-8 h-8 rounded-md flex items-center justify-center cursor-pointer" style={{ color: 'var(--muted)' }} aria-label="Close">
                <IconX />
              </button>
            </div>
            <div className="px-6 py-5">
              {grError && <div className="rounded-md p-3 mb-4 text-sm" style={{ background: 'var(--rust-soft)', border: '1px solid rgba(198,107,74,0.4)', color: '#8b3a25' }}>{grError}</div>}
              <form id="groupForm" onSubmit={handleGroupSubmit} className="space-y-4">
                <div>
                  <label className={labelCls}>Group Name</label>
                  <input type="text" value={grName} onChange={e => setGrName(e.target.value)} required placeholder="e.g. Group 1 — Tots" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Show Half</label>
                  <select value={grHalf} onChange={e => setGrHalf(e.target.value as 'First Half' | 'Second Half')} className={inputCls}>
                    <option>First Half</option><option>Second Half</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Levels in this Group</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto p-3" style={{ border: '1px solid var(--hairline)', borderRadius: 'var(--r-md)', background: 'var(--surface2)' }}>
                    {levels.map(l => (
                      <label key={l.id} className="flex items-center gap-2.5 text-sm cursor-pointer group">
                        <input type="checkbox" checked={grLevels.includes(l.id)}
                          onChange={e => setGrLevels(e.target.checked ? [...grLevels, l.id] : grLevels.filter(x => x !== l.id))}
                          className="w-4 h-4 rounded" style={{ accentColor: 'var(--ice)' }} />
                        <span style={{ color: 'var(--ink-soft)' }}>{l.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </form>
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button type="button" onClick={() => setShowGroupForm(false)} className="flex-1 py-2.5 rounded-md text-sm font-medium cursor-pointer" style={{ border: '1px solid var(--hairline)', background: 'var(--surface)', color: 'var(--ink-soft)' }}>Cancel</button>
              <button type="submit" form="groupForm" className="it-btn-primary flex-1 py-2.5 rounded-md text-sm font-medium shadow-[0_1px_0_#1e5a9155,0_4px_12px_-4px_rgba(59,130,196,0.33)] cursor-pointer">Add group</button>
            </div>
          </div>
        </div>
      )}

      {/* PRACTICE MODAL */}
      {showPracticeForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md" style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-lift)' }}>
            <div className="flex items-center justify-between px-6 pt-6 pb-4" style={{ borderBottom: '1px solid var(--hairline-soft)' }}>
              <h3 className="font-display" style={{ fontSize: 20, fontWeight: 500 }}>Add practice session</h3>
              <button onClick={() => setShowPracticeForm(false)} className="w-8 h-8 rounded-md flex items-center justify-center cursor-pointer" style={{ color: 'var(--muted)' }} aria-label="Close">
                <IconX />
              </button>
            </div>
            <div className="px-6 py-5">
              {prError && <div className="rounded-md p-3 mb-4 text-sm" style={{ background: 'var(--rust-soft)', border: '1px solid rgba(198,107,74,0.4)', color: '#8b3a25' }}>{prError}</div>}
              <form id="practiceForm" onSubmit={handlePracticeSubmit} className="space-y-4">
                <div>
                  <label className={labelCls}>Date</label>
                  <input type="date" value={prDate} onChange={e => setPrDate(e.target.value)} required className={inputCls} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Start Time</label>
                    <input type="time" value={prStart} onChange={e => setPrStart(e.target.value)} required className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>End Time</label>
                    <input type="time" value={prEnd} onChange={e => setPrEnd(e.target.value)} required className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Label <span className="font-normal" style={{ color: 'var(--muted)' }}>(optional)</span></label>
                  <input type="text" value={prLabel} onChange={e => setPrLabel(e.target.value)} placeholder="e.g. Full run-through" className={inputCls} />
                </div>
              </form>
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button type="button" onClick={() => setShowPracticeForm(false)} className="flex-1 py-2.5 rounded-md text-sm font-medium cursor-pointer" style={{ border: '1px solid var(--hairline)', background: 'var(--surface)', color: 'var(--ink-soft)' }}>Cancel</button>
              <button type="submit" form="practiceForm" className="it-btn-primary flex-1 py-2.5 rounded-md text-sm font-medium shadow-[0_1px_0_#1e5a9155,0_4px_12px_-4px_rgba(59,130,196,0.33)] cursor-pointer">Add practice</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
