import { useState, useCallback, useRef } from "react";
import { GitCompare, ChevronDown, ChevronRight } from "lucide-react";
import {
  MODELS,
  DEFAULT_SYSTEM_PROMPT,
  SAMPLE_PROMPTS,
} from "../../services/models";
import { computeDiff } from "../../utils/diff";
import { useStreaming } from "../../hooks/useStreaming";
import { DiffPanel } from "./DiffPanel";
import { Button } from "../ui/Button";
import { Select } from "../ui/Select";
import { Badge } from "../ui/Badge";
import type { DiffResult } from "../../types";
import ChatInput from "../ui/ChatInput";

function StatCard({
  label,
  value,
  variant,
}: {
  label: string;
  value: string | number;
  variant?: "success" | "danger" | "default";
}) {
  const colors = {
    success: "text-emerald-400",
    danger: "text-red-400",
    default: "text-neutral-100",
  };
  return (
    <div className="px-4 py-2.5 bg-neutral-900 rounded-lg border border-neutral-800 text-center min-w-[72px]">
      <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-0.5">
        {label}
      </div>
      <div
        className={`font-mono text-base font-medium ${colors[variant ?? "default"]}`}
      >
        {value}
      </div>
    </div>
  );
}

export function DiffView() {
  const [prompt, setPrompt] = useState("");
  const [modelA, setModelA] = useState(MODELS[0].id);
  const [modelB, setModelB] = useState(MODELS[1]?.id ?? MODELS[0].id);
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT);
  const [showSystem, setShowSystem] = useState(false);
  const [result, setResult] = useState<DiffResult | null>(null);
  const [comparing, setComparing] = useState(false);

  const {
    streaming: streamingA,
    output: outputA,
    stream: streamA,
  } = useStreaming();
  const {
    streaming: streamingB,
    output: outputB,
    stream: streamB,
  } = useStreaming();
  const comparisonRequestRef = useRef<{
    prompt: string;
    modelA: string;
    modelB: string;
    systemPrompt: string;
  } | null>(null);

  const handleCompare = useCallback(async () => {
  if (!prompt.trim() || comparing) return;

  const req = {
    prompt: prompt.trim(),
    modelA,
    modelB,
    systemPrompt,
  };

  setComparing(true);
  setResult(null);

  try {
    const [responseA, responseB] = await Promise.all([
      streamA(req.prompt, {
        model: req.modelA,
        systemPrompt: req.systemPrompt,
      }),

      streamB(req.prompt, {
        model: req.modelB,
        systemPrompt: req.systemPrompt,
      }),
    ]);

    const diff = computeDiff(responseA, responseB);

    setResult(diff);
  } catch (err) {
    console.error(err);
  } finally {
    setComparing(false);
  }
}, [
  prompt,
  modelA,
  modelB,
  systemPrompt,
  comparing,
  streamA,
  streamB,
]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        handleCompare();
      }
    },
    [handleCompare],
  );

  const labelA = MODELS.find((m) => m.id === modelA)?.label ?? "Model A";
  const labelB = MODELS.find((m) => m.id === modelB)?.label ?? "Model B";

  return (
    <section aria-labelledby="diff-heading" className="space-y-4 m-10">
      {/* Header row */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 id="diff-heading" className="text-xl font-medium text-neutral-200">
          Compare same prompt with different models
        </h2>
        <div className="flex items-center gap-3 flex-wrap">
          <Select
            id="model-a"
            label="A:"
            value={modelA}
            onChange={(e) => setModelA(e.target.value)}
          >
            {MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </Select>
          <span className="text-neutral-600 text-md">↔</span>
          <Select
            id="model-b"
            label="B:"
            value={modelB}
            onChange={(e) => setModelB(e.target.value)}
          >
            {MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* System prompt collapsible */}
      <div className="rounded-xl border border-neutral-800 overflow-hidden">
        <button
          onClick={() => setShowSystem((s) => !s)}
          aria-expanded={showSystem}
          aria-controls="system-prompt-area"
          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/50 transition-colors"
        >
          {showSystem ? (
            <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
          )}
          System prompt
        </button>
        {showSystem && (
          <div
            id="system-prompt-area"
            className="px-4 pb-3 border-t border-neutral-800"
          >
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              aria-label="System prompt"
              rows={2}
              className="mt-3 w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm font-mono text-neutral-300 placeholder-neutral-600 resize-y focus:outline-none focus:ring-2 focus:ring-kairo-500/40 focus:border-kairo-500/40"
            />
          </div>
        )}
      </div>

      {/* Sample prompts */}
      <div
        className="flex gap-2 flex-wrap"
        role="group"
        aria-label="Sample prompts"
      >
        {SAMPLE_PROMPTS.slice(0, 4).map((sp) => (
          <button
            key={sp}
            onClick={() => setPrompt(sp)}
            className="px-3 py-1.5 rounded-full text-sm border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700 transition-colors truncate max-w-50"
          >
            {sp.length > 36 ? sp.slice(0, 36) + "…" : sp}
          </button>
        ))}
      </div>

      {/* Prompt input */}
      <div className="relative">
        <ChatInput
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="Prompt Input"
          placeholder="Compare model responses..."
          rows={1}
          disabled={comparing}
          streaming={comparing}
          onSend={handleCompare}
        />
      </div>

      {/* Compare button */}

      {/* Output panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label htmlFor="output-a" className="text-sm text-neutral-500">
            Model A: {labelA}
          </label>
          <div
            id="output-a"
            className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2.5 text-sm font-mono text-neutral-300 resize-y min-h-38 overflow-y-auto"
          >
            {streamingA ? (
              <div className="text-neutral-500 animate-pulse">
                Streaming response…
              </div>
            ) : (
              outputA || <div className="text-neutral-600">No output yet</div>
            )}
          </div>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="output-b" className="text-sm text-neutral-500">
            Model B: {labelB}
          </label>
          <div
            id="output-b"
            className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2.5 text-sm font-mono text-neutral-300 resize-y min-h-38 overflow-y-auto"
          >
            {streamingB ? (
              <div className="text-neutral-500 animate-pulse">
                Streaming response…
              </div>
            ) : (
              outputB || <div className="text-neutral-600">No output yet</div>
            )}
          </div>
        </div>
      </div>

      {/* Stats + legend */}
      {result && (
        <div className="flex items-center justify-between gap-4 flex-wrap animate-fade-in">
          <div className="flex items-center gap-2 flex-wrap">
            <StatCard label="Common" value={result.stats.common} />
            <StatCard
              label="Added"
              value={result.stats.added}
              variant="success"
            />
            <StatCard
              label="Removed"
              value={result.stats.removed}
              variant="danger"
            />
            <StatCard
              label="Similarity"
              value={`${result.stats.similarity}%`}
            />
          </div>
          <div className="flex items-center gap-3 text-sm text-neutral-500">
            <span className="flex items-center gap-1.5">
              <Badge variant="success">added</Badge> in B
            </span>
            <span className="flex items-center gap-1.5">
              <Badge variant="danger">removed</Badge> from A
            </span>
          </div>
        </div>
      )}

      {/* Side-by-side diff panels */}
      {result && (
        <div className="flex border border-neutral-800 rounded-xl overflow-hidden divide-x divide-neutral-800">
          <DiffPanel
            label="Model A"
            modelLabel={labelA}
            tokens={result?.diffA ?? []}
            isEmpty={!result}
          />
          <DiffPanel
            label="Model B"
            modelLabel={labelB}
            tokens={result?.diffB ?? []}
            isEmpty={!result}
          />
        </div>
      )}
    </section>
  );
}
