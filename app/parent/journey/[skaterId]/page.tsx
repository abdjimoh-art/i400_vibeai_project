'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Skater = {
  id: string
  full_name: string
  level: { id: string; name: string } | null
}

type Skill = {
  id: string
  name: string
  passing_standard: string | null
  order_index: number
}

type SkillCompletion = {
  id: string
  skill_id: string
  completed_date: string
}

type Profile = { id: string; role: string }

const I = {
  check: () => (
    <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  star: () => (
    <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  medal: () => (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="14" r="6" />
      <path d="M9 8 L 6 2 H 10 L 12 6" /><path d="M15 8 L 18 2 H 14 L 12 6" />
    </svg>
  ),
  chevron: () => (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="9 6 15 12 9 18" />
    </svg>
  ),
  arrowLeft: () => (
    <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M19 12 H 5 M 11 6 L 5 12 L 11 18" />
    </svg>
  ),
}

type Status = 'passed' | 'working' | 'next' | 'locked'

export default function SkillJourneyPage() {
  const { skaterId } = useParams<{ skaterId: string }>()
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [skater, setSkater] = useState<Skater | null>(null)
  const [skills, setSkills] = useState<Skill[]>([])
  const [completions, setCompletions] = useState<SkillCompletion[]>([])

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) { router.push('/login'); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', session.user.id)
        .single<Profile>()

      if (!profile || profile.role !== 'parent') { router.push('/login'); return }

      const skatersRes = await fetch('/api/skaters')
      if (!skatersRes.ok) { setLoading(false); return }
      const allSkaters = await skatersRes.json()
      const mine = allSkaters.find((s: { id: string; parent: { id: string } | null }) => s.id === skaterId && s.parent?.id === profile.id)
      if (!mine) { router.push('/parent/dashboard'); return }
      setSkater(mine)

      const [skillsRes, compRes] = await Promise.all([
        fetch(`/api/skills?level_id=${mine.level?.id || ''}`),
        fetch(`/api/skill-completions?skater_id=${skaterId}`),
      ])

      if (skillsRes.ok) {
        const skillRows = await skillsRes.json()
        setSkills(skillRows.sort((a: Skill, b: Skill) => a.order_index - b.order_index))
      }
      if (compRes.ok) setCompletions(await compRes.json())

      setLoading(false)
    }

    load()
  }, [router, skaterId, supabase])

  const completionBySkill = useMemo(
    () => new Map(completions.map(c => [c.skill_id, c])),
    [completions]
  )
  const passedCount = completions.length
  const totalCount = skills.length
  const pct = totalCount ? Math.round((passedCount / totalCount) * 100) : 0
  const dashLength = 276
  const ringDash = `${(pct / 100) * dashLength} ${dashLength}`

  const lastPassed = useMemo(() => {
    if (completions.length === 0) return null
    const sorted = [...completions].sort((a, b) => b.completed_date.localeCompare(a.completed_date))
    const c = sorted[0]
    const sk = skills.find(s => s.id === c.skill_id)
    return sk ? { skill: sk, completedDate: c.completed_date } : null
  }, [completions, skills])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--paper)' }}>
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin w-8 h-8" style={{ color: 'var(--ice)' }} fill="none" viewBox="0 0 24 24" aria-hidden>
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p style={{ color: 'var(--muted)', fontSize: 13 }}>Loading skill journey…</p>
        </div>
      </div>
    )
  }

  if (!skater) return null

  const firstPassedIdx = skills.findIndex(s => !completionBySkill.has(s.id))
  function statusFor(skill: Skill, idx: number): Status {
    if (completionBySkill.has(skill.id)) return 'passed'
    if (idx === firstPassedIdx) return 'working'
    if (idx === firstPassedIdx + 1) return 'next'
    return 'locked'
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--paper)' }}>
      {/* — Gradient header band — */}
      <div style={{ background: 'linear-gradient(160deg, var(--ice-deep), var(--ice) 70%, #5fa3d9)', color: '#fff', padding: '28px 32px 36px', position: 'relative', overflow: 'hidden' }}>
        <svg style={{ position: 'absolute', inset: 0, opacity: 0.18 }} viewBox="0 0 1200 320" preserveAspectRatio="none" aria-hidden>
          <path d="M0 220 Q 250 100, 600 180 T 1200 150" stroke="#fff" strokeWidth="1.5" fill="none" />
          <path d="M0 270 Q 250 150, 600 230 T 1200 200" stroke="#fff" strokeWidth="1.2" fill="none" />
          <circle cx="1080" cy="60" r="40" stroke="#fff" fill="none" />
          <circle cx="1080" cy="60" r="60" stroke="#fff" fill="none" opacity="0.5" />
        </svg>

        <div className="max-w-5xl mx-auto" style={{ position: 'relative' }}>
          <Link
            href="/parent/dashboard"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.8)',
              fontSize: 12, textDecoration: 'none', marginBottom: 16,
            }}
            className="font-mono"
          >
            <I.arrowLeft /> <span style={{ textTransform: 'uppercase', letterSpacing: '0.12em' }}>{skater.full_name.split(' ')[0]}&apos;s profile · Skill journey</span>
          </Link>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'center' }}>
            <div>
              <div className="eyebrow" style={{ color: 'rgba(255,255,255,0.7)' }}>{skater.full_name}</div>
              <h1 className="font-display" style={{ fontSize: 48, color: '#fff', fontWeight: 300, marginTop: 4, letterSpacing: '-0.02em' }}>
                {skater.level?.name || 'No level'} <span style={{ fontStyle: 'italic', fontWeight: 400 }}>journey</span>
              </h1>
              <div style={{ marginTop: 10, display: 'flex', gap: 14, alignItems: 'center', fontSize: 13, color: 'rgba(255,255,255,0.85)', flexWrap: 'wrap' }}>
                <span><strong style={{ color: '#fff' }}>{passedCount} of {totalCount}</strong> skills passed</span>
                <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,0.5)' }} />
                <span>Frank Southern Ice Arena</span>
                <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,0.5)' }} />
                <span>Coach notes enabled</span>
              </div>
            </div>
            <div style={{ position: 'relative', width: 130, height: 130 }}>
              <svg viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }} aria-hidden>
                <circle cx="50" cy="50" r="44" stroke="rgba(255,255,255,0.2)" strokeWidth="6" fill="none" />
                <circle
                  cx="50" cy="50" r="44" stroke="#fff" strokeWidth="6" fill="none"
                  strokeLinecap="round" strokeDasharray={ringDash}
                  style={{ transition: 'stroke-dasharray 0.7s ease-out' }}
                />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <div className="font-display" style={{ fontSize: 36, fontWeight: 400, lineHeight: 1 }}>
                  {pct}<span style={{ fontSize: 18 }}>%</span>
                </div>
                <div className="eyebrow" style={{ color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>Complete</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* — Body — */}
      <div className="max-w-5xl mx-auto" style={{ padding: 28, display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
        {/* Skill timeline */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18, flexWrap: 'wrap', gap: 8 }}>
            <h3 className="font-display" style={{ fontSize: 18, fontWeight: 500 }}>The path so far</h3>
            <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--muted)', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--crimson)' }} /> Passed</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--honey)' }} /> Working on</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--ice)' }} /> Up next</span>
            </div>
          </div>

          {skills.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--muted)', padding: '24px 0', textAlign: 'center' }}>
              No skills defined for this level yet.
            </p>
          ) : (
            <div style={{ position: 'relative', paddingLeft: 30 }}>
              <div style={{ position: 'absolute', left: 11, top: 8, bottom: 8, width: 2, background: 'repeating-linear-gradient(to bottom, var(--hairline) 0 4px, transparent 4px 8px)' }} aria-hidden />
              {skills.map((skill, idx) => {
                const status = statusFor(skill, idx)
                const completion = completionBySkill.get(skill.id)
                const dotBg =
                  status === 'passed' ? 'var(--crimson)' :
                  status === 'working' ? 'var(--honey)' :
                  status === 'next' ? 'var(--ice)' : 'var(--surface)'
                const dotBorder =
                  status === 'passed' ? 'var(--crimson)' :
                  status === 'working' ? 'var(--honey)' :
                  status === 'next' ? 'var(--ice)' : 'var(--hairline)'
                const cardBg =
                  status === 'passed' ? 'var(--crimson-soft)' :
                  status === 'working' ? 'var(--honey-soft)' :
                  status === 'next' ? 'var(--ice-soft)' : 'var(--surface2)'
                const cardBorder =
                  status === 'passed' ? 'rgba(123,17,19,0.13)' :
                  status === 'working' ? 'rgba(212,166,81,0.33)' :
                  status === 'next' ? 'rgba(30,90,145,0.13)' : 'var(--hairline-soft)'
                const titleColor =
                  status === 'passed' ? 'var(--crimson)' : 'var(--ink)'

                return (
                  <div key={skill.id} style={{ position: 'relative', padding: '8px 0 14px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <div
                      aria-hidden
                      style={{
                        position: 'absolute', left: -30, top: 10, width: 24, height: 24, borderRadius: '50%',
                        background: dotBg, border: `2px solid ${dotBorder}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                        boxShadow: status !== 'locked' ? '0 0 0 4px var(--surface)' : 'none',
                      }}
                    >
                      {status === 'passed' && <I.check />}
                      {status === 'working' && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
                      {status === 'next' && <I.star />}
                    </div>
                    <div
                      style={{
                        flex: 1, minWidth: 0, padding: '10px 14px', borderRadius: 'var(--r-md)',
                        background: cardBg, border: `1px solid ${cardBorder}`,
                        opacity: status === 'locked' ? 0.55 : 1,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                        <div style={{ fontSize: 14, fontWeight: 500, color: titleColor }}>{skill.name}</div>
                        {completion && (
                          <span className="font-mono" style={{ fontSize: 11, color: 'var(--muted)' }}>
                            {new Date(completion.completed_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                      {skill.passing_standard && (
                        <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 4, lineHeight: 1.5 }}>
                          {skill.passing_standard}
                        </div>
                      )}
                      {status === 'working' && (
                        <div style={{ fontSize: 12, color: '#8b6a25', marginTop: 6, fontStyle: 'italic' }}>Almost! One more clean attempt to pass.</div>
                      )}
                      {status === 'next' && (
                        <div style={{ fontSize: 12, color: 'var(--ice-deep)', marginTop: 6, fontStyle: 'italic' }}>Coming up after the current skill.</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right rail */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Latest celebration */}
          {lastPassed && (
            <div className="card" style={{ padding: 22, background: 'linear-gradient(180deg, var(--crimson-soft), var(--surface))', borderColor: 'rgba(123,17,19,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: 'var(--crimson)' }}>
                <I.medal />
                <span className="eyebrow" style={{ color: 'var(--crimson)' }}>Just passed</span>
              </div>
              <div className="font-display" style={{ fontSize: 18, fontWeight: 500, color: 'var(--crimson)', lineHeight: 1.25 }}>
                {lastPassed.skill.name}.
              </div>
              {lastPassed.skill.passing_standard && (
                <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 10, lineHeight: 1.5 }}>
                  &ldquo;{lastPassed.skill.passing_standard}&rdquo;
                </p>
              )}
              <p style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 8, lineHeight: 1.45 }}>
                &ldquo;Great edge control today. Keep that same knee bend next class and this will stay consistent.&rdquo;
              </p>
              <div style={{ marginTop: 12, fontSize: 11, color: 'var(--muted)' }} className="font-mono">
                Coach Maya · {new Date(lastPassed.completedDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
          )}

          {/* What's next */}
          {pct === 100 ? (
            <div className="card" style={{ padding: 18 }}>
              <h4 className="font-display" style={{ fontSize: 14, fontWeight: 500, marginBottom: 10 }}>Level complete!</h4>
              <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
                {skater.full_name.split(' ')[0]} has finished every skill in {skater.level?.name}. Ask the coach about advancing to the next level.
              </p>
            </div>
          ) : (
            <div className="card" style={{ padding: 18 }}>
              <h4 className="font-display" style={{ fontSize: 14, fontWeight: 500, marginBottom: 10 }}>What&apos;s next</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 'var(--r-md)', background: 'var(--ice-tint)' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--ice)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  <span className="font-display" style={{ fontWeight: 500 }}>L3</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>Level 3 · Crossovers</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>9 skills · est. 8–12 weeks</div>
                </div>
                <span style={{ color: 'var(--muted)' }}><I.chevron /></span>
              </div>
            </div>
          )}

          {/* Practice video placeholder */}
          <div className="card" style={{ padding: 18 }}>
            <h4 className="font-display" style={{ fontSize: 14, fontWeight: 500, marginBottom: 10 }}>Practice between classes</h4>
            <div
              style={{
                aspectRatio: '16 / 9', borderRadius: 'var(--r-sm)', position: 'relative',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundImage: 'repeating-linear-gradient(115deg, var(--ice-tint) 0 18px, var(--ice-soft) 18px 19px)',
              }}
              aria-hidden
            >
              <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#fff', boxShadow: 'var(--shadow-lift)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 0, height: 0, borderLeft: '10px solid var(--ice-deep)', borderTop: '7px solid transparent', borderBottom: '7px solid transparent', marginLeft: 3 }} />
              </div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 10 }}>Drill videos coming soon.</div>
          </div>
        </div>
      </div>
    </div>
  )
}
