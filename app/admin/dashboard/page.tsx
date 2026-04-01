'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Profile = { id: string; full_name: string; role: string }
type Level = { id: string; name: string; order_index: number }
type ClassRow = {
  id: string
  day_of_week: string
  time_slot: string
  ice_location: string
  season: string
  levels: { name: string }
  profiles: { full_name: string } | null
}

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']

export default function AdminDashboard() {
  const router = useRouter()
  const supabase = createClient()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [classes, setClasses] = useState<ClassRow[]>([])
  const [levels, setLevels] = useState<Level[]>([])
  const [instructors, setInstructors] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  // Form state
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [formLevelId, setFormLevelId] = useState('')
  const [formInstructorId, setFormInstructorId] = useState('')
  const [formDay, setFormDay] = useState('Monday')
  const [formTime, setFormTime] = useState('')
  const [formLocation, setFormLocation] = useState('Zone A')
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const [{ data: prof }, { data: cls }, { data: lvl }, { data: inst }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('classes').select('*, levels(name), profiles(full_name)').order('day_of_week'),
      supabase.from('levels').select('*').order('order_index'),
      supabase.from('profiles').select('*').eq('role', 'instructor'),
    ])

    if (prof?.role !== 'admin') { router.push('/login'); return }

    setProfile(prof)
    setClasses((cls as ClassRow[]) || [])
    setLevels(lvl || [])
    setInstructors(inst || [])
    setLoading(false)
  }

  function openCreate() {
    setEditId(null)
    setFormLevelId(levels[0]?.id || '')
    setFormInstructorId(instructors[0]?.id || '')
    setFormDay('Monday')
    setFormTime('9:00 AM')
    setFormLocation('Zone A')
    setFormError('')
    setShowForm(true)
  }

  function openEdit(cls: ClassRow) {
    const level = levels.find(l => l.name === cls.levels.name)
    const instructor = instructors.find(i => i.full_name === cls.profiles?.full_name)
    setEditId(cls.id)
    setFormLevelId(level?.id || '')
    setFormInstructorId(instructor?.id || '')
    setFormDay(cls.day_of_week)
    setFormTime(cls.time_slot)
    setFormLocation(cls.ice_location)
    setFormError('')
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')
    setFormLoading(true)

    const payload = {
      level_id: formLevelId,
      instructor_id: formInstructorId || null,
      day_of_week: formDay,
      time_slot: formTime,
      ice_location: formLocation,
    }

    const { error } = editId
      ? await supabase.from('classes').update(payload).eq('id', editId)
      : await supabase.from('classes').insert(payload)

    if (error) { setFormError(error.message); setFormLoading(false); return }

    setShowForm(false)
    setFormLoading(false)
    loadAll()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this class? This will also remove all enrollments.')) return
    await supabase.from('classes').delete().eq('id', id)
    loadAll()
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-500">Loading...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Nav */}
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
          <button onClick={handleLogout} className="text-sm bg-white text-[#7B1113] px-3 py-1 rounded-lg font-medium hover:bg-red-50 transition">
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            Hello, {profile?.full_name} 👋
          </h2>
          <p className="text-gray-500 text-sm mt-1">You are logged in as <span className="font-semibold text-[#7B1113]">Admin</span> — Frank Southern Ice Arena · Spring 2026</p>
        </div>

        {/* Classes Section */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-lg font-bold text-gray-800">Classes</h3>
            <button
              onClick={openCreate}
              className="bg-[#7B1113] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#5e0d0f] transition"
            >
              + Create Class
            </button>
          </div>

          {classes.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No classes yet. Create your first class above.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wide">
                    <th className="text-left px-3 py-2 rounded-l">Level</th>
                    <th className="text-left px-3 py-2">Instructor</th>
                    <th className="text-left px-3 py-2">Day</th>
                    <th className="text-left px-3 py-2">Time</th>
                    <th className="text-left px-3 py-2">Location</th>
                    <th className="text-left px-3 py-2 rounded-r">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {classes.map((cls, i) => (
                    <tr key={cls.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-3 py-3 font-medium text-gray-800">{cls.levels.name}</td>
                      <td className="px-3 py-3 text-gray-600">{cls.profiles?.full_name || <span className="text-gray-400 italic">Unassigned</span>}</td>
                      <td className="px-3 py-3 text-gray-600">{cls.day_of_week}</td>
                      <td className="px-3 py-3 text-gray-600">{cls.time_slot}</td>
                      <td className="px-3 py-3">
                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">{cls.ice_location}</span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(cls)} className="text-[#7B1113] hover:underline text-xs font-medium">Edit</button>
                          <button onClick={() => handleDelete(cls.id)} className="text-gray-400 hover:text-red-600 text-xs font-medium">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-800 mb-5">
              {editId ? 'Edit Class' : 'Create New Class'}
            </h3>

            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">{formError}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                <select value={formLevelId} onChange={e => setFormLevelId(e.target.value)} required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1113]">
                  {levels.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Instructor</label>
                <select value={formInstructorId} onChange={e => setFormInstructorId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1113]">
                  <option value="">-- Unassigned --</option>
                  {instructors.map(i => <option key={i.id} value={i.id}>{i.full_name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
                  <select value={formDay} onChange={e => setFormDay(e.target.value)} required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1113]">
                    {DAYS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time Slot</label>
                  <input type="text" value={formTime} onChange={e => setFormTime(e.target.value)} required
                    placeholder="e.g. 9:00 AM"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1113]" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ice Location</label>
                <select value={formLocation} onChange={e => setFormLocation(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1113]">
                  {['Zone A','Zone B','Zone C','Zone D','Center Ice'].map(z => <option key={z}>{z}</option>)}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button type="submit" disabled={formLoading}
                  className="flex-1 bg-[#7B1113] text-white py-2 rounded-lg text-sm font-medium hover:bg-[#5e0d0f] transition disabled:opacity-50">
                  {formLoading ? 'Saving...' : editId ? 'Save Changes' : 'Create Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
