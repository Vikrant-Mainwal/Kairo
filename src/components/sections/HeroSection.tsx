import { ArrowRight, Zap, GitCompare, Activity } from 'lucide-react'

const features = [
  { icon: Zap,        label: 'Token streaming',    desc: 'Real-time SSE streaming with live TPS metrics' },
  { icon: GitCompare, label: 'Token-level diff',   desc: 'LCS algorithm. No external libraries.' },
  { icon: Activity,   label: 'Live metrics',        desc: 'Tokens, TPS, and elapsed time as you stream' },
]

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-kairo-600/10 rounded-full blur-3xl" />
      </div>

      <div className="text-center py-16 px-4 space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-kairo-500/10 border border-kairo-500/20 text-kairo-400 text-sm font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-kairo-400 animate-pulse" />
          Now with Claude Sonnet 4
          <ArrowRight className="w-3 h-3" aria-hidden="true" />
        </div>

        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white max-w-2xl mx-auto leading-[1.15]">
          The AI inference{' '}
          <span className="text-gradient">playground</span>{' '}
          for developers
        </h1>

        <p className="text-neutral-400 text-base max-w-lg mx-auto leading-relaxed">
          Stream model responses, compare outputs token-by-token, and measure performance — all in one minimal developer tool.
        </p>

        {/* Feature pills */}
        <div className="flex items-center justify-center gap-3 flex-wrap pt-2">
          {features.map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-sm"
              title={desc}
            >
              <Icon className="w-3.5 h-3.5 text-kairo-400" aria-hidden="true" />
              <span className="text-neutral-300 font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
