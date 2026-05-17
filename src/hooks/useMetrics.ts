import { useState, useRef, useCallback, useEffect } from 'react'
import type { StreamMetrics } from '../types'

const INITIAL_METRICS: StreamMetrics = { tokens: 0, tps: 0, elapsed: 0 }

/**
 * useMetrics — live streaming metrics hook.
 * Runs a 120ms interval during streaming to compute tokens/sec and elapsed time.
 */
export function useMetrics() {
  const [metrics, setMetrics] = useState<StreamMetrics>(INITIAL_METRICS)
  const startRef = useRef<number | null>(null)
  const tokenCountRef = useRef(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const tick = useCallback(() => {
    if (!startRef.current) return
    const elapsed = (Date.now() - startRef.current) / 1000
    const tps = elapsed > 0 ? tokenCountRef.current / elapsed : 0
    setMetrics({
      tokens: tokenCountRef.current,
      tps: Math.round(tps * 10) / 10,
      elapsed: Math.round(elapsed * 10) / 10,
    })
  }, [])

  const start = useCallback(() => {
    startRef.current = Date.now()
    tokenCountRef.current = 0
    intervalRef.current = setInterval(tick, 120)
  }, [tick])

  const addTokens = useCallback((count: number) => {
    tokenCountRef.current += count
  }, [])

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    tick() // Final snapshot
  }, [tick])

  const reset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    startRef.current = null
    tokenCountRef.current = 0
    setMetrics(INITIAL_METRICS)
  }, [])

  // Cleanup on unmount
  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current) }, [])

  return { metrics, start, addTokens, stop, reset }
}
