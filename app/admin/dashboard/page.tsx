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

export default function AdminDashboard() {
  const router = useRouter()
  const supabase = createClient()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [tab, setTab] = useState<Tab>('Classes')
  const [loading, setLoading] = useState(true)

  // Shared data
  const [classes, setClasses] = useState<ClassRow[]>([])
  const [levels, setLevels] = useState<Level[]>([])
  const [instructors, setInstructors] = useState<Profile[]>([])
  const [parents, setParents] = useState<Profile[]>([])
  const [skaters, setSkaters] = useState<Skater[]>([])
  const [shows, setShows] = useState<Show[]>([])

  // Class form
  const [showClassForm, setShowClassForm] = useState(false)
  const [editClassId, setEditClassId] = useState<string | null>(null)
  const [cfLevel, setCfLevel] = useState('')
  const [cfInstructor, setCfInstructor] = useState('')
  const [cfDay, setCfDay] = useState('Monday')
  const [cfTime, setCfTime] = useState('')
  const [cfLocation, setCfLocation] = useState('Zone A')
  const [cfError, setCfError] = useState('')
  const [cfLoading, setCfLoading] = useState(false)

  // Skater form
  const [showSkaterForm, setShowSkaterForm] = useState(false)
  const [editSkaterId, setEditSkaterId] = useState<string | null>(null)
  const [sfName, setSfName] = useState('')
  const [sfLevel, setSfLevel] = useState('')
  const [sfParent, setSfParent] = useState('')
  const [sfError, setSfError] = useState('')
  const [sfLoading, setSfLoading] = useState(false)

  // Enrollment
  const [enrollClassId, setEnrollClassId] = useState('')
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [enrollLoading, setEnrollLoading] = useState(false)

  // Show form
  const [showShowForm, setShowShowForm] = useState(false)
  const [editShowId, setEditShowId] = useState<string | null>(null)
  const [shName, setShName] = useState('')
  const [shTheme, setShTheme] = useState('')
  const [shDate, setShDate] = useState('')
  const [shTime, setShTime] = useState('')
  const [shLocation, setShLocation] = useState('')
  const [shError, setShError] = useState('')
  const [shLoading, setShLoading] = useState(false)

  // Group form
  const [showGroupForm, setShowGroupForm] = useState(false)
  const [groupShowId, setGroupShowId] = useState('')
  const [grName, setGrName] = useState('')
  const [grHalf, setGrHalf] = useState<'First Half' | 'Second Half'>('First Half')
  const [grLevels, setGrLevels] = useState<string[]>([])
  const [grError, setGrError] = useState('')

  // Practice form
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

    // Load skaters via API
    const skatersRes = await fetch('/api/skaters')
    if (skatersRes.ok) setSkaters(await skatersRes.json())

    // Load shows via API
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

  // === CLASS HANDLERS ===
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

  // === SKATER HANDLERS ===
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

  // === ENROLLMENT HANDLERS ===
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

  // === SHOW HANDLERS ===
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

  // === GROUP HANDLERS ===
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

  // === PRACTICE HANDLERS ===
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>
  )

  const enrolledIds = new Set(enrollments.map(e => e.skater_id))
  const unenrolledSkaters = skaters.filter(s => !enrolledIds.has(s.id))

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-[#7B1113] text-white px-6 py-4 flex justify-between items-center shadow">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⛸️</span>
          <div>
            <h1 className="font-bold text-lg leading-tight">IceTrack</h1>
            <p className="text-xs text-red-200">Admin Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm hidden sm:block">👤 {profile?.full_name}</span>
          <button onClick={handleLogout} className="text-sm bg-white text-[#7B1113] px-3 py-1 rounded-lg font-medium hover:bg-red-50 transition">Logout</button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800">Hello, {profile?.full_name} 👋</h2>
          <p className="text-gray-500 text-sm mt-1">You are logged in as <span className="font-semibold text-[#7B1113]">Admin</span> — Frank Southern Ice Arena</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-xl shadow-sm p-1">
          {TABS.map(t => (
            <button key={t} onClick={() => { setTab(t); if (t === 'Enrollment' && enrollClassId) loadEnrollments(enrollClassId) }}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition ${tab === t ? 'bg-[#7B1113] text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
              {t}
            </button>
          ))}
        </div>

        {/* CLASSES TAB */}
        {tab === 'Classes' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-gray-800">Classes</h3>
              <button onClick={openClassCreate} className="bg-[#7B1113] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#5e0d0f] transition">+ Create Class</button>
            </div>
            {classes.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">No classes yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wide">
                      <th className="text-left px-3 py-2">Level</th><th className="text-left px-3 py-2">Instructor</th>
                      <th className="text-left px-3 py-2">Day</th><th className="text-left px-3 py-2">Time</th>
                      <th className="text-left px-3 py-2">Location</th><th className="text-left px-3 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classes.map((cls, i) => (
                      <tr key={cls.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-3 py-3 font-medium text-gray-800">{cls.levels.name}</td>
                        <td className="px-3 py-3 text-gray-600">{cls.profiles?.full_name || <span className="text-gray-400 italic">Unassigned</span>}</td>
                        <td className="px-3 py-3 text-gray-600">{cls.day_of_week}</td>
                        <td className="px-3 py-3 text-gray-600">{cls.time_slot}</td>
                        <td className="px-3 py-3"><span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">{cls.ice_location}</span></td>
                        <td className="px-3 py-3">
                          <div className="flex gap-2">
                            <button onClick={() => openClassEdit(cls)} className="text-[#7B1113] hover:underline text-xs font-medium">Edit</button>
                            <button onClick={() => handleClassDelete(cls.id)} className="text-gray-400 hover:text-red-600 text-xs font-medium">Delete</button>
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
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-gray-800">Skaters ({skaters.length})</h3>
              <button onClick={openSkaterCreate} className="bg-[#7B1113] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#5e0d0f] transition">+ Add Skater</button>
            </div>
            {skaters.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">No skaters yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wide">
                      <th className="text-left px-3 py-2">Name</th><th className="text-left px-3 py-2">Level</th>
                      <th className="text-left px-3 py-2">Parent</th><th className="text-left px-3 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {skaters.map((s, i) => (
                      <tr key={s.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-3 py-3 font-medium text-gray-800">{s.full_name}</td>
                        <td className="px-3 py-3 text-gray-600">{s.level?.name || '—'}</td>
                        <td className="px-3 py-3 text-gray-600">{s.parent?.full_name || <span className="text-gray-400 italic">None</span>}</td>
                        <td className="px-3 py-3">
                          <div className="flex gap-2">
                            <button onClick={() => openSkaterEdit(s)} className="text-[#7B1113] hover:underline text-xs font-medium">Edit</button>
                            <button onClick={() => handleSkaterDelete(s.id)} className="text-gray-400 hover:text-red-600 text-xs font-medium">Delete</button>
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
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Enrollment</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Class</label>
              <select value={enrollClassId} onChange={e => { setEnrollClassId(e.target.value); if (e.target.value) loadEnrollments(e.target.value) }}
                className="w-full max-w-md border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1113]">
                <option value="">-- Choose a class --</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.levels.name} — {c.day_of_week} {c.time_slot} ({c.profiles?.full_name || 'Unassigned'})</option>
                ))}
              </select>
            </div>
            {enrollClassId && (
              <>
                {enrollLoading ? <p className="text-gray-400 text-sm">Loading...</p> : (
                  <>
                    <h4 className="font-semibold text-gray-700 text-sm mb-2">Enrolled ({enrollments.length})</h4>
                    {enrollments.length === 0 ? (
                      <p className="text-gray-400 text-sm mb-4">No skaters enrolled.</p>
                    ) : (
                      <div className="mb-4 space-y-1">
                        {enrollments.map(en => (
                          <div key={en.id} className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm">
                            <span className="text-gray-800">{en.skater.full_name} <span className="text-gray-400">({en.skater.level?.name})</span></span>
                            <button onClick={() => handleUnenroll(en.skater_id)} className="text-red-500 hover:text-red-700 text-xs font-medium">Remove</button>
                          </div>
                        ))}
                      </div>
                    )}
                    <h4 className="font-semibold text-gray-700 text-sm mb-2">Available Skaters</h4>
                    {unenrolledSkaters.length === 0 ? (
                      <p className="text-gray-400 text-sm">All skaters are enrolled in this class.</p>
                    ) : (
                      <div className="space-y-1">
                        {unenrolledSkaters.map(s => (
                          <div key={s.id} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm">
                            <span className="text-gray-800">{s.full_name} <span className="text-gray-400">({s.level?.name})</span></span>
                            <button onClick={() => handleEnroll(s.id)} className="text-[#7B1113] hover:underline text-xs font-medium">+ Enroll</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        )}

        {/* SKATING SHOW TAB */}
        {tab === 'Skating Show' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-lg font-bold text-gray-800">Skating Shows</h3>
                <button onClick={openShowCreate} className="bg-[#7B1113] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#5e0d0f] transition">+ Create Show</button>
              </div>
              {shows.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">No shows yet.</p>
              ) : shows.map(show => (
                <div key={show.id} className="border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-gray-800">{show.name}</h4>
                      <p className="text-sm text-gray-500">
                        {show.show_date}{show.show_time ? ` at ${show.show_time}` : ''}{show.location ? ` — ${show.location}` : ''}
                        {show.theme ? <span className="ml-2 text-purple-600">Theme: {show.theme}</span> : ''}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openShowEdit(show)} className="text-[#7B1113] hover:underline text-xs font-medium">Edit</button>
                      <button onClick={() => handleShowDelete(show.id)} className="text-gray-400 hover:text-red-600 text-xs font-medium">Delete</button>
                    </div>
                  </div>

                  {/* Groups */}
                  <div className="ml-4">
                    <div className="flex items-center gap-2 mb-2">
                      <h5 className="text-sm font-semibold text-gray-700">Groups</h5>
                      <button onClick={() => openGroupCreate(show.id)} className="text-[#7B1113] text-xs hover:underline">+ Add Group</button>
                    </div>
                    {(!show.groups || show.groups.length === 0) ? (
                      <p className="text-gray-400 text-xs mb-2">No groups defined.</p>
                    ) : show.groups.map(g => (
                      <div key={g.id} className="bg-gray-50 rounded-lg p-3 mb-2">
                        <div className="flex justify-between items-center mb-1">
                          <div>
                            <span className="font-medium text-gray-800 text-sm">{g.name}</span>
                            <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{g.show_half}</span>
                            <span className="ml-2 text-xs text-gray-500">
                              Levels: {g.levels?.map(gl => gl.level?.name).filter(Boolean).join(', ') || 'None'}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => openPracticeCreate(show.id, g.id)} className="text-[#7B1113] text-xs hover:underline">+ Practice</button>
                            <button onClick={() => handleGroupDelete(g.id)} className="text-gray-400 hover:text-red-600 text-xs">Delete</button>
                          </div>
                        </div>
                        {g.practices && g.practices.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {g.practices.map(p => (
                              <div key={p.id} className="flex items-center justify-between bg-white rounded px-2 py-1 text-xs">
                                <span className="text-gray-700">
                                  {p.practice_date} {p.start_time}–{p.end_time} {p.label && <span className="text-gray-400">({p.label})</span>}
                                </span>
                                <button onClick={() => handlePracticeDelete(p.id)} className="text-gray-400 hover:text-red-600">×</button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CLASS MODAL */}
      {showClassForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-800 mb-5">{editClassId ? 'Edit Class' : 'Create New Class'}</h3>
            {cfError && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">{cfError}</div>}
            <form onSubmit={handleClassSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                <select value={cfLevel} onChange={e => setCfLevel(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1113]">
                  {levels.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Instructor</label>
                <select value={cfInstructor} onChange={e => setCfInstructor(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1113]">
                  <option value="">-- Unassigned --</option>
                  {instructors.map(i => <option key={i.id} value={i.id}>{i.full_name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
                  <select value={cfDay} onChange={e => setCfDay(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1113]">
                    {DAYS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time Slot</label>
                  <input type="text" value={cfTime} onChange={e => setCfTime(e.target.value)} required placeholder="e.g. 9:00 AM"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1113]" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ice Location</label>
                <select value={cfLocation} onChange={e => setCfLocation(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1113]">
                  {['Zone A','Zone B','Zone C','Zone D','Center Ice'].map(z => <option key={z}>{z}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowClassForm(false)} className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition">Cancel</button>
                <button type="submit" disabled={cfLoading} className="flex-1 bg-[#7B1113] text-white py-2 rounded-lg text-sm font-medium hover:bg-[#5e0d0f] transition disabled:opacity-50">
                  {cfLoading ? 'Saving...' : editClassId ? 'Save Changes' : 'Create Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SKATER MODAL */}
      {showSkaterForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-800 mb-5">{editSkaterId ? 'Edit Skater' : 'Add Skater'}</h3>
            {sfError && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">{sfError}</div>}
            <form onSubmit={handleSkaterSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input type="text" value={sfName} onChange={e => setSfName(e.target.value)} required placeholder="Skater name"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1113]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                <select value={sfLevel} onChange={e => setSfLevel(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1113]">
                  {levels.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parent Account</label>
                <select value={sfParent} onChange={e => setSfParent(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1113]">
                  <option value="">-- No parent linked --</option>
                  {parents.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowSkaterForm(false)} className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition">Cancel</button>
                <button type="submit" disabled={sfLoading} className="flex-1 bg-[#7B1113] text-white py-2 rounded-lg text-sm font-medium hover:bg-[#5e0d0f] transition disabled:opacity-50">
                  {sfLoading ? 'Saving...' : editSkaterId ? 'Save Changes' : 'Add Skater'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SHOW MODAL */}
      {showShowForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-800 mb-5">{editShowId ? 'Edit Show' : 'Create Show'}</h3>
            {shError && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">{shError}</div>}
            <form onSubmit={handleShowSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Show Name</label>
                <input type="text" value={shName} onChange={e => setShName(e.target.value)} required placeholder="Spring Showcase 2026"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1113]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
                <input type="text" value={shTheme} onChange={e => setShTheme(e.target.value)} placeholder="e.g. Frozen Wonderland"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1113]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input type="date" value={shDate} onChange={e => setShDate(e.target.value)} required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1113]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input type="time" value={shTime} onChange={e => setShTime(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1113]" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input type="text" value={shLocation} onChange={e => setShLocation(e.target.value)} placeholder="Frank Southern Ice Arena"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1113]" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowShowForm(false)} className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition">Cancel</button>
                <button type="submit" disabled={shLoading} className="flex-1 bg-[#7B1113] text-white py-2 rounded-lg text-sm font-medium hover:bg-[#5e0d0f] transition disabled:opacity-50">
                  {shLoading ? 'Saving...' : editShowId ? 'Save Changes' : 'Create Show'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GROUP MODAL */}
      {showGroupForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-800 mb-5">Add Group</h3>
            {grError && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">{grError}</div>}
            <form onSubmit={handleGroupSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
                <input type="text" value={grName} onChange={e => setGrName(e.target.value)} required placeholder="e.g. Group 1 — Tots"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1113]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Show Half</label>
                <select value={grHalf} onChange={e => setGrHalf(e.target.value as 'First Half' | 'Second Half')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1113]">
                  <option>First Half</option><option>Second Half</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Levels in this Group</label>
                <div className="space-y-1 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2">
                  {levels.map(l => (
                    <label key={l.id} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={grLevels.includes(l.id)}
                        onChange={e => setGrLevels(e.target.checked ? [...grLevels, l.id] : grLevels.filter(x => x !== l.id))} />
                      {l.name}
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowGroupForm(false)} className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition">Cancel</button>
                <button type="submit" className="flex-1 bg-[#7B1113] text-white py-2 rounded-lg text-sm font-medium hover:bg-[#5e0d0f] transition">Add Group</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRACTICE MODAL */}
      {showPracticeForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-800 mb-5">Add Practice</h3>
            {prError && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">{prError}</div>}
            <form onSubmit={handlePracticeSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input type="date" value={prDate} onChange={e => setPrDate(e.target.value)} required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1113]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input type="time" value={prStart} onChange={e => setPrStart(e.target.value)} required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1113]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input type="time" value={prEnd} onChange={e => setPrEnd(e.target.value)} required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1113]" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Label (optional)</label>
                <input type="text" value={prLabel} onChange={e => setPrLabel(e.target.value)} placeholder="e.g. Full run-through"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1113]" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowPracticeForm(false)} className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition">Cancel</button>
                <button type="submit" className="flex-1 bg-[#7B1113] text-white py-2 rounded-lg text-sm font-medium hover:bg-[#5e0d0f] transition">Add Practice</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
