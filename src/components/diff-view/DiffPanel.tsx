import { cn } from '../../utils/cn'
import type { DiffToken } from '../../types'

interface DiffTokenProps {
  token: string
  type: DiffToken['type']
}

function DiffTokenSpan({ token, type }: DiffTokenProps) {
  // Preserve whitespace-only tokens without styling
  if (/^\s+$/.test(token)) return <span>{token}</span>

  return (
    <span
      className={cn(
        'rounded-sm px-px',
        type === 'added'   && 'bg-emerald-500/15 text-emerald-300',
        type === 'removed' && 'bg-red-500/12 text-red-300 line-through',
      )}
    >
      {token}
    </span>
  )
}

interface DiffPanelProps {
  label: string
  modelLabel: string
  tokens: DiffToken[]
  isEmpty: boolean
}

export function DiffPanel({ label, modelLabel, tokens, isEmpty }: DiffPanelProps) {
  return (
    <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
      {/* Sticky header */}
      <div className="flex items-center justify-between px-4 py-2 bg-neutral-900 border-b border-neutral-800 sticky top-0 z-10">
        <span className="text-xs font-medium text-neutral-300">{label}</span>
        <span className="text-xs text-neutral-500">{modelLabel}</span>
      </div>

      <div
        className="flex-1 p-4 font-mono text-[12.5px] leading-[1.85] whitespace-pre-wrap break-words overflow-y-auto max-h-[360px] text-neutral-300"
        aria-label={`${label} diff output`}
      >
        {isEmpty ? (
          <span className="text-neutral-600">No output yet.</span>
        ) : (
          tokens.map((t, i) => (
            <DiffTokenSpan key={i} token={t.token} type={t.type} />
          ))
        )}
      </div>
    </div>
  )
}
