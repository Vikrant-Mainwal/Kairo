import { useState, useCallback } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import {
  MODELS,
  SAMPLE_SYSTEM_PROMPTS,
  SAMPLE_PROMPTS,
} from "../../services/models";
import { computeDiff } from "../../utils/diff";
import { useStreaming } from "../../hooks/useStreaming";
import { DiffPanel } from "./DiffPanel";
import { Select } from "../ui/Select";
import { Badge } from "../ui/Badge";
import type { DiffResult } from "../../types";
import ChatInput from "../shared/ChatInput";
import { StreamOutput } from "../shared/StreamOutput";
import { useAudioRecorder } from "../../hooks/useAudioRecorder";

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
    <div
      className="
        px-3 sm:px-4
        py-2.5
        bg-neutral-900
        rounded-lg
        border border-neutral-800
        text-center
        min-w-23
        flex-1 sm:flex-none
      "
    >
      <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-0.5">
        {label}
      </div>

      <div
        className={`font-mono text-sm sm:text-base font-medium ${
          colors[variant ?? "default"]
        }`}
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
  const [systemPrompt, setSystemPrompt] = useState(SAMPLE_SYSTEM_PROMPTS[0]);
  const [showSystem, setShowSystem] = useState(false);
  const [result, setResult] = useState<DiffResult | null>(null);
  const [comparing, setComparing] = useState(false);

  const {
    streaming: streamingA,
    output: outputA,
    stream: streamA,
    metrics: metricsA,
  } = useStreaming();

  const {
    streaming: streamingB,
    output: outputB,
    stream: streamB,
    metrics: metricsB,
  } = useStreaming();

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
  }, [prompt, modelA, modelB, systemPrompt, comparing, streamA, streamB]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        handleCompare();
      }
    },
    [handleCompare],
  );

  const recorder = useAudioRecorder((text) => {
    setPrompt((prev) => {
      if (!prev.trim()) return text;

      return prev.endsWith(" ") ? prev + text : prev + " " + text;
    });
  });

  const labelA = MODELS.find((m) => m.id === modelA)?.label ?? "Model A";

  const labelB = MODELS.find((m) => m.id === modelB)?.label ?? "Model B";

  return (
    <section
      aria-labelledby="diff-heading"
      className="
        space-y-5
        px-3
        sm:px-4
        md:px-6
        lg:px-10
        py-4
        w-full
      "
    >
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div>
          <h2
            id="diff-heading"
            className="
              text-lg
              sm:text-xl
              md:text-2xl
              font-semibold
              text-neutral-100
            "
          >
            Compare same prompt with different models
          </h2>

          <p className="text-sm text-neutral-500 mt-1">
            Compare outputs side-by-side in real time
          </p>
        </div>

        {/* Model Selectors */}
        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
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

          <div className="hidden sm:flex items-center justify-center text-neutral-600 px-1">
            ↔
          </div>

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

      {/* System Prompt */}
      <div className="rounded-2xl border border-neutral-800 overflow-hidden bg-neutral-950">
        <button
          onClick={() => setShowSystem((s) => !s)}
          aria-expanded={showSystem}
          aria-controls="system-prompt-area"
          className="
            w-full
            flex
            items-center
            gap-2
            px-4
            py-3
            text-sm
            text-neutral-400
            hover:text-neutral-200
            hover:bg-neutral-900
            transition-colors
          "
        >
          {showSystem ? (
            <ChevronDown className="w-4 h-4 shrink-0" aria-hidden="true" />
          ) : (
            <ChevronRight className="w-4 h-4 shrink-0" aria-hidden="true" />
          )}

          <span className="font-medium">System Prompt</span>
        </button>

        {showSystem && (
          <div
            id="system-prompt-area"
            className="border-t border-neutral-800 px-4 py-4 space-y-4"
          >
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              aria-label="System prompt"
              rows={4}
              placeholder="You are a helpful AI assistant..."
              className="
                w-full
                rounded-xl
                border border-neutral-700
                bg-neutral-900
                px-4 py-3
                text-sm text-neutral-200
                font-mono
                placeholder:text-neutral-500
                focus:outline-none
                focus:ring-2
                focus:ring-kairo-500/40
                focus:border-kairo-500/40
                resize-none
              "
            />

            <div className="hidden md:flex flex-wrap gap-2 ">
              {SAMPLE_SYSTEM_PROMPTS.map((sp) => (
                <button
                  key={sp}
                  onClick={() => setSystemPrompt(sp)}
                  className="
                    px-3 py-2
                    rounded-full
                    text-xs
                    border border-neutral-700
                    bg-neutral-900
                    text-neutral-400
                    hover:text-white
                    hover:border-neutral-500
                    hover:bg-neutral-800
                    transition-colors
                    max-w-full
                    wrap-break-word
                    text-left
                  "
                >
                  {sp.length > 50 ? sp.slice(0, 50) + "…" : sp}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sample Prompts */}
      <div
        className="hidden md:flex flex-wrap gap-2"
        role="group"
        aria-label="Sample prompts"
      >
        {SAMPLE_PROMPTS.slice(0, 4).map((sp) => (
          <button
            key={sp}
            onClick={() => setPrompt(sp)}
            className="
              px-3 py-2
              rounded-full
              text-sm
              border border-neutral-800
              bg-neutral-900
              text-neutral-400
              hover:text-neutral-200
              hover:border-neutral-700
              transition-colors
              max-w-full
              wrap-break-word
              text-left
            "
          >
            {sp.length > 40 ? sp.slice(0, 40) + "…" : sp}
          </button>
        ))}
      </div>

      {/* Chat Input */}
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
          recorder={recorder}
        />
      </div>

      {/* Output Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2 min-w-0">
          {/* <div
            className="
                    flex
                    flex-wrap
                    items-center
                    justify-center
                    sm:justify-end
                    gap-3
                  "
          >
            <MetricsBar metrics={metricsA} streaming={streamingA} />
          </div> */}

          <label htmlFor="output-a" className="text-sm text-neutral-500">
            Model A: {labelA}
          </label>

          <StreamOutput
            output={outputA}
            streaming={streamingA}
            error={null}
            onRetry={handleCompare}
            onAbort={() => {}}
            onReset={() => {}}
            metrics={metricsA}
          />
        </div>

        <div className="space-y-2 min-w-0">
          {/* <div
            className="
          flex
          flex-wrap
          items-center
          justify-center
          sm:justify-end
          gap-3
        "
          >
            <MetricsBar metrics={metricsB} streaming={streamingB} />
          </div> */}
          <label htmlFor="output-b" className="text-sm text-neutral-500">
            Model B: {labelB}
          </label>

          <StreamOutput
            output={outputB}
            streaming={streamingB}
            error={null}
            onRetry={handleCompare}
            onAbort={() => {}}
            onReset={() => {}}
            metrics={metricsB}
          />
        </div>
      </div>

      {/* Stats */}
      {result && (
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 animate-fade-in">
          <div className="flex flex-wrap gap-2">
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

          <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-500">
            <span className="flex items-center gap-1.5">
              <Badge variant="success">added</Badge>
              in B
            </span>

            <span className="flex items-center gap-1.5">
              <Badge variant="danger">removed</Badge>
              from A
            </span>
          </div>
        </div>
      )}

      {/* Diff Panels */}
      {result && (
        <div
          className="
            grid
            grid-cols-1
            2xl:grid-cols-2
            border border-neutral-800
            rounded-2xl
            overflow-hidden
            2xl:divide-x
            divide-neutral-800
          "
        >
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
