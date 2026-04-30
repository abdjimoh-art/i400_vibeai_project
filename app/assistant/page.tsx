'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Role = 'admin' | 'instructor' | 'parent'

type ChatMessage = { role: 'user' | 'assistant'; content: string }

type SourceInfo = { id: string; score: number; title: string; source: string }

export default function AssistantPage() {
  const router = useRouter()
  const supabase = createClient()
  const [role, setRole] = useState<Role | null>(null)
  const [loadingAuth, setLoadingAuth] = useState(true)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastSources, setLastSources] = useState<SourceInfo[] | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/login')
        return
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      const r = profile?.role as Role | undefined
      if (!r || (r !== 'admin' && r !== 'instructor' && r !== 'parent')) {
        router.replace('/login')
        return
      }
      if (!cancelled) {
        setRole(r)
        setLoadingAuth(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [router, supabase])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, pending])

  const dashboardHref =
    role === 'admin' ? '/admin' : role === 'instructor' ? '/instructor' : '/parent'

  async function send() {
    const text = input.trim()
    if (!text || pending) return
    setInput('')
    setError(null)
    setLastSources(null)
    const next: ChatMessage[] = [...messages, { role: 'user', content: text }]
    setMessages(next)
    setPending(true)
    try {
      const res = await fetch('/api/rag/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(typeof data.error === 'string' ? data.error : 'Request failed')
      }
      const answer = typeof data.answer === 'string' ? data.answer : ''
      setMessages([...next, { role: 'assistant', content: answer || '(No response)' }])
      if (Array.isArray(data.sources)) setLastSources(data.sources)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
      setMessages(next)
    } finally {
      setPending(false)
    }
  }

  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--paper)' }}>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>Loading assistant…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--paper)' }}>
      <header
        className="flex flex-wrap items-center gap-3 px-5 py-3.5 border-b"
        style={{ borderColor: 'var(--hairline)', background: 'var(--surface)' }}
      >
        <Link
          href={dashboardHref}
          className="text-sm font-medium"
          style={{ color: 'var(--ice-deep)', textDecoration: 'none' }}
        >
          ← Back to dashboard
        </Link>
        <span className="text-xs font-mono uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
          IceTrack Assistant
        </span>
        <span className="pill pill-ice text-xs capitalize">{role}</span>
        <span className="ml-auto text-xs" style={{ color: 'var(--muted)' }}>
          RAG · Groq
        </span>
      </header>

      <main className="flex-1 flex flex-col max-w-3xl w-full mx-auto px-4 py-6">
        <div className="mb-4">
          <h1 className="font-display text-2xl font-medium" style={{ color: 'var(--ink)' }}>
            Ask about IceTrack
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
            Answers use your skating-school documentation (retrieval) and Groq for wording. Not for medical or legal
            advice.
          </p>
        </div>

        <div
          className="flex-1 rounded-xl border overflow-hidden flex flex-col min-h-[360px]"
          style={{ borderColor: 'var(--hairline)', background: 'var(--surface)' }}
        >
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                Try: “What can parents see on the dashboard?” or “How does instructor attendance work?”
              </p>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className="max-w-[90%] rounded-lg px-3.5 py-2.5 text-sm whitespace-pre-wrap"
                  style={{
                    background: m.role === 'user' ? 'var(--ice-soft)' : 'var(--surface2)',
                    color: 'var(--ink)',
                    border: m.role === 'user' ? '1px solid var(--ice)' : '1px solid var(--hairline)',
                  }}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {pending && (
              <div className="text-sm flex items-center gap-2" style={{ color: 'var(--muted)' }}>
                <span className="inline-block w-2 h-2 rounded-full animate-pulse bg-[var(--ice)]" />
                Thinking…
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {lastSources && lastSources.length > 0 && (
            <div
              className="border-t px-3 py-2 text-xs font-mono"
              style={{ borderColor: 'var(--hairline)', color: 'var(--muted)' }}
            >
              <span className="font-sans font-medium" style={{ color: 'var(--ink-soft)' }}>
                Retrieved:{' '}
              </span>
              {lastSources.map((s) => s.title).join(' · ')}
            </div>
          )}

          {error && (
            <div className="border-t px-3 py-2 text-sm text-red-700 bg-red-50">{error}</div>
          )}

          <div className="border-t p-3 flex gap-2" style={{ borderColor: 'var(--hairline)' }}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  void send()
                }
              }}
              rows={2}
              placeholder="Ask a question…"
              className="flex-1 resize-none rounded-md text-sm px-3 py-2 outline-none"
              style={{
                border: '1px solid var(--hairline)',
                background: 'var(--paper)',
                color: 'var(--ink)',
                fontFamily: 'inherit',
              }}
              disabled={pending}
            />
            <button
              type="button"
              onClick={() => void send()}
              disabled={pending || !input.trim()}
              className="it-btn-primary self-end px-4 py-2 rounded-md text-sm font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
