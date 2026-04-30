import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Groq from 'groq-sdk'
import { NextResponse } from 'next/server'
import { RAG_CHUNKS } from '@/lib/rag/corpus'
import {
  embedQuery,
  getCorpusEmbeddings,
  retrieveTopK,
} from '@/lib/rag/corpus-embeddings'

const ROLES = ['admin', 'instructor', 'parent'] as const
type AppRole = (typeof ROLES)[number]

const CHAT_MODEL = process.env.GROQ_CHAT_MODEL ?? 'llama-3.1-8b-instant'
const TOP_K = 5

type ChatMessage = { role: 'user' | 'assistant'; content: string }

async function requireAnyRole(): Promise<{ userId: string; role: AppRole } | null> {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = profile?.role as AppRole | undefined
  if (!role || !ROLES.includes(role)) return null
  return { userId: user.id, role }
}

function chunkById(id: string) {
  return RAG_CHUNKS.find((c) => c.id === id)
}

function lexicalRetrieveTopK(query: string, k: number): { id: string; score: number }[] {
  const tokens = query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2)
  const unique = new Set(tokens)
  if (unique.size === 0) return RAG_CHUNKS.slice(0, k).map((c) => ({ id: c.id, score: 0 }))

  const scored = RAG_CHUNKS.map((chunk) => {
    const hay = `${chunk.title} ${chunk.text}`.toLowerCase()
    let hits = 0
    for (const t of unique) if (hay.includes(t)) hits++
    return { id: chunk.id, score: hits / unique.size }
  })
  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, k)
}

export async function POST(request: Request) {
  const session = await requireAnyRole()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey?.trim()) {
    return NextResponse.json(
      { error: 'Server is missing GROQ_API_KEY. Add it to .env.local (local) or GitHub / deployment secrets.' },
      { status: 503 }
    )
  }

  let body: { messages?: ChatMessage[] }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const messages = Array.isArray(body.messages) ? body.messages : []
  const cleaned: ChatMessage[] = messages
    .filter(
      (m): m is ChatMessage =>
        m &&
        (m.role === 'user' || m.role === 'assistant') &&
        typeof m.content === 'string'
    )
    .map((m) => ({
      role: m.role,
      content: m.content.trim().slice(0, 12000),
    }))
    .slice(-16)

  if (cleaned.length === 0) {
    return NextResponse.json({ error: 'messages must include at least one user or assistant turn' }, { status: 400 })
  }

  const lastUser = [...cleaned].reverse().find((m) => m.role === 'user')
  if (!lastUser?.content) {
    return NextResponse.json({ error: 'No user message to answer' }, { status: 400 })
  }

  const groq = new Groq({ apiKey })

  try {
    let top: { id: string; score: number }[] = []
    try {
      const corpusEmbeddings = await getCorpusEmbeddings(groq)
      const queryEmbedding = await embedQuery(groq, lastUser.content)
      top = retrieveTopK(queryEmbedding, corpusEmbeddings, TOP_K)
    } catch (retrievalErr) {
      const reason = retrievalErr instanceof Error ? retrievalErr.message : 'embedding retrieval failed'
      console.warn('[rag/chat] Embedding retrieval unavailable, using lexical fallback:', reason)
      top = lexicalRetrieveTopK(lastUser.content, TOP_K)
    }

    const contextBlocks = top
      .map((t) => {
        const ch = chunkById(t.id)
        if (!ch) return null
        return `[#${ch.id} · ${ch.title} · ${ch.source}]\n${ch.text}`
      })
      .filter(Boolean)
      .join('\n\n---\n\n')

    const systemContent = `You are IceTrack Assistant, a helpful guide for the IceTrack skating school web app (Frank Southern Ice Arena, IU I400 course project).

Rules:
- Answer ONLY using the CONTEXT excerpts below plus obvious clarifications (e.g. defining UI terms that appear in context).
- If the CONTEXT does not contain enough information, say you do not find that in the program documentation and suggest contacting an admin or instructor for account-specific or schedule-specific questions.
- Be concise. Use short paragraphs or bullet lists when appropriate.
- Do not invent passwords, URLs, or policies not stated in CONTEXT.

CONTEXT:
${contextBlocks}`

    const completion = await groq.chat.completions.create({
      model: CHAT_MODEL,
      temperature: 0.35,
      max_tokens: 1024,
      messages: [
        { role: 'system', content: systemContent },
        ...cleaned.map((m) => ({ role: m.role, content: m.content })),
      ],
    })

    const answer = completion.choices?.[0]?.message?.content?.trim() ?? ''

    return NextResponse.json({
      answer,
      sources: top.map((t) => {
        const ch = chunkById(t.id)
        return {
          id: t.id,
          score: Math.round(t.score * 1000) / 1000,
          title: ch?.title ?? t.id,
          source: ch?.source ?? '',
        }
      }),
      model: CHAT_MODEL,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Groq request failed'
    console.error('[rag/chat]', msg)
    return NextResponse.json({ error: 'Assistant temporarily unavailable', detail: msg }, { status: 502 })
  }
}
