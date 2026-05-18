import { useState, useCallback, useRef } from "react";
import {  ChevronDown, ChevronRight } from "lucide-react";
import { useStreaming } from "../../hooks/useStreaming";
import {
  MODELS,
  SAMPLE_PROMPTS,
  DEFAULT_SYSTEM_PROMPT,
} from "../../services/models";
import { MetricsBar } from "../metrics/MetricsBar";
import { AudioInput } from "./AudioInput";
import { StreamOutput } from "./StreamOutput";
// import { Button } from "../ui/Button";
import { Select } from "../ui/Select";
import type { InputMode } from "../../types";
import ChatInput from "../ui/ChatInput";

export function Playground() {
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState(MODELS[0].id);
  const [inputMode, setInputMode] = useState<InputMode>("text");
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT);
  const [showSystem, setShowSystem] = useState(false);
  const lastRequestRef = useRef<{
    prompt: string;
    model: string;
    systemPrompt: string;
  } | null>(null);

  const { streaming, output, error, metrics, stream, abort, reset } =
    useStreaming();

  const handleRun = useCallback(async () => {
    if (!prompt.trim() || streaming) return;
    const req = { prompt: prompt.trim(), model, systemPrompt };
    lastRequestRef.current = req;

    await stream(req.prompt, {
      model: req.model,
      systemPrompt: req.systemPrompt,
    });
  }, [prompt, model, systemPrompt, streaming, stream]);

  const handleRetry = useCallback(async () => {
    if (!lastRequestRef.current) return;
    const { prompt: p, model: m, systemPrompt: s } = lastRequestRef.current;
    await stream(p, { model: m, systemPrompt: s });
  }, [stream]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        handleRun();
      }
    },
    [handleRun],
  );

  return (
    <section aria-labelledby="playground-heading" className="space-y-4 m-10">
      {/* Header row */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2
          id="playground-heading"
          className="text-xl font-medium text-neutral-200"
        >
          Inference playground
        </h2>
        <div className="flex items-center gap-3 flex-wrap">
          <Select
            id="model-select"
            label="Model"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          >
            {MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </Select>

          {/* Mode toggle */}
          <div
            role="group"
            aria-label="Input mode"
            className="flex border border-neutral-700 rounded-lg overflow-hidden"
          >
            {(["text", "audio"] as InputMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setInputMode(mode)}
                aria-pressed={inputMode === mode}
                className={[
                  "px-3 py-1.5 text-sm font-medium capitalize transition-colors",
                  inputMode === mode
                    ? "bg-neutral-700 text-neutral-100"
                    : "bg-transparent text-neutral-500 hover:text-neutral-300",
                ].join(" ")}
              >
                {mode}
              </button>
            ))}
          </div>
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

      {/* Input area */}
      {inputMode === "text" ? (
        <div className="relative">
          <ChatInput
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            onSend={handleRun}
            aria-label="Prompt input"
            placeholder="Message AI..."
            rows={1}
            streaming={streaming}
          />
          
        </div>
      ) : (
        <AudioInput
          onTranscript={(t) => setPrompt((p) => (p ? `${p}\n${t}` : t))}
        />
      )}

      {/* Metrics bar */}
       <div className="flex items-center justify-end gap-3 flex-wrap"> 
        <MetricsBar metrics={metrics} streaming={streaming} />
      </div>

      {/* Output */}
      <StreamOutput
        output={output}
        streaming={streaming}
        error={error}
        onRetry={handleRetry}
        onAbort={abort}
        onReset={reset}
      />
    </section>
  );
}
