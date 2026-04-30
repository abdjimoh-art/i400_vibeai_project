import Groq from 'groq-sdk'
import { RAG_CHUNKS } from './corpus'
import { cosineSimilarity } from './similarity'

export const GROQ_EMBED_MODEL = 'nomic-embed-text-v1.5' as const

type CachedEmbeddings = { id: string; embedding: number[] }[]
type GroqClient = InstanceType<typeof Groq>

const globalKey = '__icetrackRagEmbeddingsCache__' as const

function getCache(): CachedEmbeddings | undefined {
  const g = globalThis as typeof globalThis & { [globalKey]?: CachedEmbeddings }
  return g[globalKey]
}

function setCache(rows: CachedEmbeddings) {
  const g = globalThis as typeof globalThis & { [globalKey]?: CachedEmbeddings }
  g[globalKey] = rows
}

/** Lazy-embed all corpus chunks once per server runtime (warm invocations reuse). */
export async function getCorpusEmbeddings(groq: GroqClient): Promise<CachedEmbeddings> {
  const existing = getCache()
  if (existing?.length === RAG_CHUNKS.length) return existing

  const inputs = RAG_CHUNKS.map((c) => `${c.title}\n\n${c.text}`)
  const res = await groq.embeddings.create({
    model: GROQ_EMBED_MODEL,
    input: inputs,
  })

  const ordered = [...res.data].sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
  const rows: CachedEmbeddings = RAG_CHUNKS.map((chunk, i) => {
    const row = ordered[i]
    const emb = row?.embedding
    if (!Array.isArray(emb)) throw new Error('Invalid embedding response from Groq')
    return { id: chunk.id, embedding: emb as number[] }
  })

  setCache(rows)
  return rows
}

export async function embedQuery(groq: GroqClient, text: string): Promise<number[]> {
  const res = await groq.embeddings.create({
    model: GROQ_EMBED_MODEL,
    input: text.trim().slice(0, 8000),
  })
  const emb = res.data[0]?.embedding
  if (!Array.isArray(emb)) throw new Error('Invalid query embedding from Groq')
  return emb as number[]
}

export function retrieveTopK(
  queryEmbedding: number[],
  corpusRows: CachedEmbeddings,
  k: number
): { id: string; score: number }[] {
  const scored = corpusRows.map((row) => ({
    id: row.id,
    score: cosineSimilarity(queryEmbedding, row.embedding),
  }))
  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, k)
}
