// ─── Core Types ───────────────────────────────────────────────

export type InputMode = 'text' | 'audio'

export type TabId = 'chats' | 'playground' | 'diff' | 'docs'

export interface Model {
  id: string
  label: string
  description: string
  badge?: string
}

export interface StreamMetrics {
  tokens: number
  tps: number
  elapsed: number
}

export interface StreamState {
  streaming: boolean
  output: string
  error: string | null
}

export interface RunHistoryEntry {
  id: string
  prompt: string
  model: string
  output: string
  tokens: number
  elapsed: number
  timestamp: Date
}

// ─── Diff Types ───────────────────────────────────────────────

export type DiffTokenType = 'common' | 'added' | 'removed'

export interface DiffToken {
  token: string
  type: DiffTokenType
}

export interface DiffResult {
  diffA: DiffToken[]
  diffB: DiffToken[]
  stats: DiffStats
}

export interface DiffStats {
  common: number
  added: number
  removed: number
  similarity: number
}
