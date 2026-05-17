import type { StreamMetrics } from '../../types'

interface MetricCardProps {
  label: string
  value: string | number
  unit?: string
}

function MetricCard({ label, value, unit }: MetricCardProps) {
  return (
    <div className="flex flex-col items-center px-4 py-2 bg-neutral-900 rounded-lg border border-neutral-800 min-w-[72px]">
      <span className="text-[10px] uppercase tracking-widest text-neutral-500 mb-0.5">{label}</span>
      <span className="font-mono text-base font-medium text-neutral-100 leading-none">
        {value}
        {unit && <span className="text-xs text-neutral-500 ml-0.5 font-normal">{unit}</span>}
      </span>
    </div>
  )
}

interface MetricsBarProps {
  metrics: StreamMetrics
  streaming: boolean
}

export function MetricsBar({ metrics, streaming }: MetricsBarProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Streaming metrics"
      className="flex items-center gap-2 flex-wrap"
    >
      <MetricCard label="Tokens" value={metrics.tokens} />
      <MetricCard label="TPS" value={metrics.tps} unit="/s" />
      <MetricCard label="Time" value={metrics.elapsed} unit="s" />
      {streaming && (
        <span
          aria-hidden="true"
          className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-dot ml-1"
        />
      )}
    </div>
  )
}
