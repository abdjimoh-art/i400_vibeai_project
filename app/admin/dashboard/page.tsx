'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { upsertClass, deleteClass } from '@/app/admin/actions'

type Profile = { id: string; full_name: string; role: string }
type Level = { id: string; name: string; order_index: number }
type ClassRow = {
  id: string; day_of_week: string; time_slot: string; ice_location: string; season: string
  levels: { name: string }; profiles: { full_name: string } | null
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
const TABS = ['Classes', 'Skaters', 'Enrollment', 'Skating Show'] as const
type Tab = typeof TABS[number]

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

const inputCls = "w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7B1113]/20 focus:border-[#7B1113] focus:bg-white"
const labelCls = "block text-sm font-semibold text-slate-700 mb-1.5"

export default function AdminDashboard() {
  const router = useRouter()
  const supabase = createClient()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [tab, setTab] = useState<Tab>('Classes')
  const [loading, setLoading] = useState(true)

  const [classes, setClasses] = useState<ClassRow[]>([])
  const [levels, setLevels] = useState<Level[]>([])
  const [instructors, setInstructors] = useState<Profile[]>([])
  const [parents, setParents] = useState<Profile[]>([])
  const [skaters, setSkaters] = useState<Skater[]>([])
  const [shows, setShows] = useState<Show[]>([])

  const [showClassForm, setShowClassForm] = useState(false)
  const [editClassId, setEditClassId] = useState<string | null>(null)
  const [cfLevel, setCfLevel] = useState('')
  const [cfInstructor, setCfInstructor] = useState('')
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

  useEffect(() => { loadAll() }, [])

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
    if (showsRes.ok) setShows(await showsRes.json())

    setLoading(false)
  }

  async function loadEnrollments(classId: string) {
    setEnrollLoading(true)
    const res = await fetch(`/api/enrollments?class_id=${classId}`)
    if (res.ok) setEnrollments(await res.json())
    setEnrollLoading(false)
  }

  function openClassCreate() {
    setEditClassId(null); setCfLevel(levels[0]?.id || ''); setCfInstructor('')
    setCfDay('Monday'); setCfTime('9:00 AM'); setCfLocation('Zone A'); setCfError(''); setShowClassForm(true)
  }
  function openClassEdit(cls: ClassRow) {
    const level = levels.find(l => l.name === cls.levels.name)
    const instructor = instructors.find(i => i.full_name === cls.profiles?.full_name)
    setEditClassId(cls.id); setCfLevel(level?.id || ''); setCfInstructor(instructor?.id || '')
    setCfDay(cls.day_of_week); setCfTime(cls.time_slot); setCfLocation(cls.ice_location); setCfError(''); setShowClassForm(true)
  }
  async function handleClassSubmit(e: React.FormEvent) {
    e.preventDefault(); setCfError(''); setCfLoading(true)
    const result = await upsertClass({
      levelId: cfLevel, instructorId: cfInstructor, day: cfDay, time: cfTime, location: cfLocation, editId: editClassId,
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

  const enrolledIds = new Set(enrollments.map(e => e.skater_id))
  const unenrolledSkaters = skaters.filter(s => !enrolledIds.has(s.id))

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
            <span className="text-xs text-red-200 font-medium px-2 py-0.5 bg-white/10 rounded-full">Admin</span>
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
          <div className="flex flex-col items-end gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-50 text-[#7B1113] border border-red-200">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7B1113]" />
              Administrator
            </span>
            <div className="flex gap-3 text-xs text-slate-500">
              <span><span className="font-semibold text-slate-800">{classes.length}</span> classes</span>
              <span><span className="font-semibold text-slate-800">{skaters.length}</span> skaters</span>
              <span><span className="font-semibold text-slate-800">{shows.length}</span> shows</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-1.5">
          {TABS.map(t => (
            <button key={t} onClick={() => { setTab(t); if (t === 'Enrollment' && enrollClassId) loadEnrollments(enrollClassId) }}
              className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-semibold transition cursor-pointer ${tab === t ? 'bg-[#7B1113] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
              {t}
            </button>
          ))}
        </div>

        {/* CLASSES TAB */}
        {tab === 'Classes' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Classes</h3>
                <p className="text-sm text-slate-500 mt-0.5">{classes.length} class{classes.length !== 1 ? 'es' : ''} scheduled</p>
              </div>
              <button onClick={openClassCreate} className="flex items-center gap-2 bg-[#7B1113] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#6a0f10] active:bg-[#5e0d0f] transition shadow-sm cursor-pointer">
                <IconPlus />
                Create Class
              </button>
            </div>
            {classes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                  <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </div>
                <p className="text-slate-800 font-semibold">No classes yet</p>
                <p className="text-slate-500 text-sm mt-1">Create your first class to get started.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/60">
                      <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Level</th>
                      <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Instructor</th>
                      <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Day</th>
                      <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Time</th>
                      <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Location</th>
                      <th className="text-right px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {classes.map((cls) => (
                      <tr key={cls.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getLevelBadge(cls.levels.name)}`}>
                            {cls.levels.name}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-800">
                          {cls.profiles?.full_name || <span className="text-slate-400 italic text-xs">Unassigned</span>}
                        </td>
                        <td className="px-6 py-4 text-slate-600">{cls.day_of_week}</td>
                        <td className="px-6 py-4 text-slate-700 font-medium">{cls.time_slot}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getZoneBadge(cls.ice_location)}`}>
                            {cls.ice_location}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openClassEdit(cls)} className="flex items-center gap-1.5 text-slate-500 hover:text-[#7B1113] hover:bg-red-50 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer">
                              <IconEdit /> Edit
                            </button>
                            <button onClick={() => handleClassDelete(cls.id)} className="flex items-center gap-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer">
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
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Skaters</h3>
                <p className="text-sm text-slate-500 mt-0.5">{skaters.length} skater{skaters.length !== 1 ? 's' : ''} registered</p>
              </div>
              <button onClick={openSkaterCreate} className="flex items-center gap-2 bg-[#7B1113] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#6a0f10] transition shadow-sm cursor-pointer">
                <IconPlus />
                Add Skater
              </button>
            </div>
            {skaters.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                  <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
                  </svg>
                </div>
                <p className="text-slate-800 font-semibold">No skaters yet</p>
                <p className="text-slate-500 text-sm mt-1">Add skaters to enroll them in classes.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/60">
                      <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                      <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Level</th>
                      <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Parent</th>
                      <th className="text-right px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {skaters.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#7B1113]/10 flex items-center justify-center text-[#7B1113] text-xs font-bold flex-shrink-0">
                              {s.full_name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-semibold text-slate-900">{s.full_name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getLevelBadge(s.level?.name || '')}`}>
                            {s.level?.name || '—'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {s.parent?.full_name || <span className="text-slate-400 italic text-xs">None</span>}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openSkaterEdit(s)} className="flex items-center gap-1.5 text-slate-500 hover:text-[#7B1113] hover:bg-red-50 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer">
                              <IconEdit /> Edit
                            </button>
                            <button onClick={() => handleSkaterDelete(s.id)} className="flex items-center gap-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer">
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

        {/* ENROLLMENT TAB */}
        {tab === 'Enrollment' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-5">Enrollment</h3>
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
                <div className="flex items-center gap-2 text-slate-400 text-sm py-8 justify-center">
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
                      <h4 className="text-sm font-semibold text-slate-700">Enrolled</h4>
                      <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold">{enrollments.length}</span>
                    </div>
                    {enrollments.length === 0 ? (
                      <p className="text-slate-400 text-sm italic">No skaters enrolled.</p>
                    ) : (
                      <div className="space-y-1.5">
                        {enrollments.map(en => (
                          <div key={en.id} className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 text-sm">
                            <div className="flex items-center gap-2.5">
                              <div className="w-6 h-6 rounded-full bg-green-200 flex items-center justify-center text-green-700 text-xs font-bold flex-shrink-0">
                                {en.skater.full_name.charAt(0)}
                              </div>
                              <span className="font-medium text-slate-800">{en.skater.full_name}</span>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getLevelBadge(en.skater.level?.name || '')}`}>
                                {en.skater.level?.name || '—'}
                              </span>
                            </div>
                            <button onClick={() => handleUnenroll(en.skater_id)} className="text-red-500 hover:text-red-700 text-xs font-semibold transition cursor-pointer">Remove</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <h4 className="text-sm font-semibold text-slate-700">Available to Enroll</h4>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">{unenrolledSkaters.length}</span>
                    </div>
                    {unenrolledSkaters.length === 0 ? (
                      <p className="text-slate-400 text-sm italic">All skaters are enrolled in this class.</p>
                    ) : (
                      <div className="space-y-1.5">
                        {unenrolledSkaters.map(s => (
                          <div key={s.id} className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm hover:bg-slate-100 transition-colors">
                            <div className="flex items-center gap-2.5">
                              <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold flex-shrink-0">
                                {s.full_name.charAt(0)}
                              </div>
                              <span className="font-medium text-slate-800">{s.full_name}</span>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getLevelBadge(s.level?.name || '')}`}>
                                {s.level?.name || '—'}
                              </span>
                            </div>
                            <button onClick={() => handleEnroll(s.id)} className="text-[#7B1113] hover:text-[#6a0f10] text-xs font-semibold transition cursor-pointer">+ Enroll</button>
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
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Skating Shows</h3>
                  <p className="text-sm text-slate-500 mt-0.5">{shows.length} show{shows.length !== 1 ? 's' : ''}</p>
                </div>
                <button onClick={openShowCreate} className="flex items-center gap-2 bg-[#7B1113] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#6a0f10] transition shadow-sm cursor-pointer">
                  <IconPlus />
                  Create Show
                </button>
              </div>
              {shows.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                    <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  </div>
                  <p className="text-slate-800 font-semibold">No shows yet</p>
                  <p className="text-slate-500 text-sm mt-1">Create a show to organize your performances.</p>
                </div>
              ) : (
                <div className="p-6 space-y-4">
                  {shows.map(show => (
                    <div key={show.id} className="border border-slate-200 rounded-2xl overflow-hidden">
                      {/* Show header */}
                      <div className="flex justify-between items-start px-5 py-4 bg-slate-50 border-b border-slate-200">
                        <div>
                          <h4 className="font-bold text-slate-900">{show.name}</h4>
                          <div className="flex flex-wrap items-center gap-2 mt-1.5">
                            <span className="text-xs text-slate-500">{show.show_date}{show.show_time ? ` at ${show.show_time}` : ''}</span>
                            {show.location && <span className="text-xs text-slate-500">· {show.location}</span>}
                            {show.theme && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">Theme: {show.theme}</span>}
                          </div>
                        </div>
                        <div className="flex gap-1.5 flex-shrink-0 ml-4">
                          <button onClick={() => openShowEdit(show)} className="flex items-center gap-1 text-slate-500 hover:text-[#7B1113] hover:bg-red-50 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer border border-slate-200">
                            <IconEdit /> Edit
                          </button>
                          <button onClick={() => handleShowDelete(show.id)} className="flex items-center gap-1 text-slate-400 hover:text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer border border-slate-200">
                            <IconTrash /> Delete
                          </button>
                        </div>
                      </div>
                      {/* Groups */}
                      <div className="p-5">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-semibold text-slate-700">Performance Groups</span>
                          <button onClick={() => openGroupCreate(show.id)} className="flex items-center gap-1.5 text-[#7B1113] text-xs font-semibold hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition cursor-pointer">
                            <IconPlus />
                            Add Group
                          </button>
                        </div>
                        {(!show.groups || show.groups.length === 0) ? (
                          <p className="text-slate-400 text-sm italic">No groups defined yet.</p>
                        ) : (
                          <div className="space-y-3">
                            {show.groups.map(g => (
                              <div key={g.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                <div className="flex justify-between items-start mb-2">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-semibold text-slate-800 text-sm">{g.name}</span>
                                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">{g.show_half}</span>
                                    {g.levels?.map(gl => gl.level?.name).filter(Boolean).map(ln => (
                                      <span key={ln} className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getLevelBadge(ln!)}`}>{ln}</span>
                                    ))}
                                  </div>
                                  <div className="flex gap-1 flex-shrink-0 ml-2">
                                    <button onClick={() => openPracticeCreate(show.id, g.id)} className="flex items-center gap-1 text-[#7B1113] text-xs font-semibold hover:bg-red-50 px-2 py-1 rounded-lg transition cursor-pointer">
                                      <IconPlus />
                                      Practice
                                    </button>
                                    <button onClick={() => handleGroupDelete(g.id)} className="text-slate-400 hover:text-red-600 hover:bg-red-50 w-6 h-6 flex items-center justify-center rounded-lg transition cursor-pointer">
                                      <IconX />
                                    </button>
                                  </div>
                                </div>
                                {g.practices && g.practices.length > 0 && (
                                  <div className="mt-3 space-y-1.5">
                                    {g.practices.map(p => (
                                      <div key={p.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 text-xs border border-slate-200">
                                        <span className="text-slate-700 font-medium">
                                          {p.practice_date} · {p.start_time}–{p.end_time}
                                          {p.label && <span className="text-slate-400 ml-1.5">({p.label})</span>}
                                        </span>
                                        <button onClick={() => handlePracticeDelete(p.id)} className="text-slate-400 hover:text-red-600 transition cursor-pointer w-5 h-5 flex items-center justify-center">
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
              )}
            </div>
          </div>
        )}
      </div>

      {/* CLASS MODAL */}
      {showClassForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">{editClassId ? 'Edit Class' : 'Create New Class'}</h3>
              <button onClick={() => setShowClassForm(false)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition cursor-pointer">
                <IconX />
              </button>
            </div>
            <div className="px-6 py-5">
              {cfError && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-4 text-sm">{cfError}</div>}
              <form id="classForm" onSubmit={handleClassSubmit} className="space-y-4">
                <div>
                  <label className={labelCls}>Level</label>
                  <select value={cfLevel} onChange={e => setCfLevel(e.target.value)} required className={inputCls}>
                    {levels.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Instructor</label>
                  <select value={cfInstructor} onChange={e => setCfInstructor(e.target.value)} className={inputCls}>
                    <option value="">— Unassigned —</option>
                    {instructors.map(i => <option key={i.id} value={i.id}>{i.full_name}</option>)}
                  </select>
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
              <button type="button" onClick={() => setShowClassForm(false)} className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 transition cursor-pointer">Cancel</button>
              <button type="submit" form="classForm" disabled={cfLoading} className="flex-1 bg-[#7B1113] text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-[#6a0f10] transition disabled:opacity-50 cursor-pointer shadow-sm">
                {cfLoading ? 'Saving…' : editClassId ? 'Save Changes' : 'Create Class'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SKATER MODAL */}
      {showSkaterForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">{editSkaterId ? 'Edit Skater' : 'Add Skater'}</h3>
              <button onClick={() => setShowSkaterForm(false)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition cursor-pointer">
                <IconX />
              </button>
            </div>
            <div className="px-6 py-5">
              {sfError && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-4 text-sm">{sfError}</div>}
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
              <button type="button" onClick={() => setShowSkaterForm(false)} className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 transition cursor-pointer">Cancel</button>
              <button type="submit" form="skaterForm" disabled={sfLoading} className="flex-1 bg-[#7B1113] text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-[#6a0f10] transition disabled:opacity-50 cursor-pointer shadow-sm">
                {sfLoading ? 'Saving…' : editSkaterId ? 'Save Changes' : 'Add Skater'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SHOW MODAL */}
      {showShowForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">{editShowId ? 'Edit Show' : 'Create Show'}</h3>
              <button onClick={() => setShowShowForm(false)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition cursor-pointer">
                <IconX />
              </button>
            </div>
            <div className="px-6 py-5">
              {shError && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-4 text-sm">{shError}</div>}
              <form id="showForm" onSubmit={handleShowSubmit} className="space-y-4">
                <div>
                  <label className={labelCls}>Show Name</label>
                  <input type="text" value={shName} onChange={e => setShName(e.target.value)} required placeholder="Spring Showcase 2026" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Theme <span className="font-normal text-slate-400">(optional)</span></label>
                  <input type="text" value={shTheme} onChange={e => setShTheme(e.target.value)} placeholder="e.g. Frozen Wonderland" className={inputCls} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Date</label>
                    <input type="date" value={shDate} onChange={e => setShDate(e.target.value)} required className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Time <span className="font-normal text-slate-400">(opt.)</span></label>
                    <input type="time" value={shTime} onChange={e => setShTime(e.target.value)} className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Location <span className="font-normal text-slate-400">(optional)</span></label>
                  <input type="text" value={shLocation} onChange={e => setShLocation(e.target.value)} placeholder="Frank Southern Ice Arena" className={inputCls} />
                </div>
              </form>
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button type="button" onClick={() => setShowShowForm(false)} className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 transition cursor-pointer">Cancel</button>
              <button type="submit" form="showForm" disabled={shLoading} className="flex-1 bg-[#7B1113] text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-[#6a0f10] transition disabled:opacity-50 cursor-pointer shadow-sm">
                {shLoading ? 'Saving…' : editShowId ? 'Save Changes' : 'Create Show'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GROUP MODAL */}
      {showGroupForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Add Group</h3>
              <button onClick={() => setShowGroupForm(false)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition cursor-pointer">
                <IconX />
              </button>
            </div>
            <div className="px-6 py-5">
              {grError && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-4 text-sm">{grError}</div>}
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
                  <div className="space-y-2 max-h-40 overflow-y-auto border border-slate-200 rounded-xl p-3 bg-slate-50">
                    {levels.map(l => (
                      <label key={l.id} className="flex items-center gap-2.5 text-sm cursor-pointer group">
                        <input type="checkbox" checked={grLevels.includes(l.id)}
                          onChange={e => setGrLevels(e.target.checked ? [...grLevels, l.id] : grLevels.filter(x => x !== l.id))}
                          className="w-4 h-4 accent-[#7B1113] rounded" />
                        <span className="text-slate-700 group-hover:text-slate-900">{l.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </form>
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button type="button" onClick={() => setShowGroupForm(false)} className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 transition cursor-pointer">Cancel</button>
              <button type="submit" form="groupForm" className="flex-1 bg-[#7B1113] text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-[#6a0f10] transition cursor-pointer shadow-sm">Add Group</button>
            </div>
          </div>
        </div>
      )}

      {/* PRACTICE MODAL */}
      {showPracticeForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Add Practice Session</h3>
              <button onClick={() => setShowPracticeForm(false)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition cursor-pointer">
                <IconX />
              </button>
            </div>
            <div className="px-6 py-5">
              {prError && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-4 text-sm">{prError}</div>}
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
                  <label className={labelCls}>Label <span className="font-normal text-slate-400">(optional)</span></label>
                  <input type="text" value={prLabel} onChange={e => setPrLabel(e.target.value)} placeholder="e.g. Full run-through" className={inputCls} />
                </div>
              </form>
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button type="button" onClick={() => setShowPracticeForm(false)} className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 transition cursor-pointer">Cancel</button>
              <button type="submit" form="practiceForm" className="flex-1 bg-[#7B1113] text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-[#6a0f10] transition cursor-pointer shadow-sm">Add Practice</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
