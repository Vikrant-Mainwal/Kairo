import { useEffect, useRef } from "react";
import { AlertTriangle, RefreshCw, Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/Button";
import type { StreamMetrics } from "../../types";
import { renderLLMOutput } from "../../utils/renderLLMOutput";

interface StreamOutputProps {
  output: string;
  streaming: boolean;
  error: string | null;
  onRetry: () => void;
  onAbort: () => void;
  onReset: () => void;
  metrics?: StreamMetrics;
}

export function StreamOutput({
  output,
  streaming,
  error,
  onRetry,
  onAbort,
  metrics,
}: StreamOutputProps) {
  const endRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  // Auto-scroll to bottom while streaming
  useEffect(() => {
    if (streaming) {
      endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [output, streaming]);

  const copyOutput = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const isEmpty = !output && !streaming && !error;

  return (
    <div className="rounded-xl border border-neutral-800 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-neutral-900 border-b border-neutral-800 gap-4">
        {/* Left */}
        <span className="text-sm uppercase tracking-widest text-neutral-500 shrink-0">
          Output
        </span>

        {/* Right */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {metrics && (
            <div className="flex items-center gap-2 flex-wrap">
              {/* Tokens */}
              <div className="flex items-center gap-2 px-3 py-1 rounded-lg border border-neutral-800 bg-neutral-950">
                <span className="text-[10px] uppercase tracking-wider text-neutral-400">
                  Tokens
                </span>
                <span className="text-sm font-medium text-neutral-200">
                  {metrics.tokens ?? 0}
                </span>
              </div>

              {/* TPS */}
              <div className="flex items-center gap-2 px-3 py-1 rounded-lg border border-neutral-800 bg-neutral-950">
                <span className="text-[10px] uppercase tracking-wider text-neutral-400">
                  TPS
                </span>
                <span className="text-sm font-medium text-neutral-200">
                  {metrics.tps?.toFixed(1) ?? 0}
                </span>
              </div>

              {/* Time */}
              <div className="flex items-center gap-2 px-3 py-1 rounded-lg border border-neutral-800 bg-neutral-950">
                <span className="text-[10px] uppercase tracking-wider text-neutral-400">
                  Time
                </span>
                <span className="text-sm font-medium text-neutral-200">
                  {metrics.elapsed ? `${metrics.elapsed.toFixed(1)}ms` : "0ms"}
                </span>
              </div>
            </div>
          )}

          {streaming && (
            <Button
              onClick={onAbort}
              variant="ghost"
              size="sm"
              aria-label="Abort stream"
            >
              Abort
            </Button>
          )}

          {!streaming && output && (
            <Button
              onClick={copyOutput}
              variant="ghost"
              size="sm"
              aria-label="Copy output"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  Copy
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div
        role="region"
        aria-live="polite"
        aria-label="Model response"
        aria-atomic="false"
        className="flex-1 p-4 min-h-45 max-h-105 overflow-y-auto font-mono text-[13px] leading-relaxed text-neutral-300 whitespace-pre-wrap wrap-break-word"
      >
        {isEmpty ? (
          <span className="text-neutral-600">Response will appear here…</span>
        ) : (
          <>
            {renderLLMOutput(output)}
            {streaming && (
              <span
                aria-hidden="true"
                className="inline-block w-0.5 h-4 bg-kairo-400 ml-0.5 align-text-bottom animate-blink"
              />
            )}
          </>
        )}
        <div ref={endRef} />
      </div>

      {/* Error bar */}
      {error && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 px-4 py-3 bg-red-500/5 border-t border-red-500/20"
        >
          <div className="flex items-center gap-2 text-sm text-red-400">
            <AlertTriangle
              className="w-3.5 h-3.5 shrink-0"
              aria-hidden="true"
            />
            <span>{error}</span>
          </div>
          <Button
            onClick={onRetry}
            variant="danger"
            size="sm"
            aria-label="Retry request"
          >
            <RefreshCw className="w-3 h-3" aria-hidden="true" />
            Retry
          </Button>
        </div>
      )}
    </div>
  );
}
