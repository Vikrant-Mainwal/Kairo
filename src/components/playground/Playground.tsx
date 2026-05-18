import { useState, useCallback, useRef } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useStreaming } from "../../hooks/useStreaming";
import {
  MODELS,
  SAMPLE_PROMPTS,
  SAMPLE_SYSTEM_PROMPTS,
} from "../../services/models";
import { MetricsBar } from "../metrics/MetricsBar";
import { AudioInput } from "./AudioInput";
import { StreamOutput } from "./StreamOutput";
import { Select } from "../ui/Select";
import ChatInput from "../ui/ChatInput";
import { useAudioRecorder } from "../../hooks/useAudioRecorder";

export function Playground() {
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState(MODELS[0].id);
  const [systemPrompt, setSystemPrompt] = useState(SAMPLE_SYSTEM_PROMPTS[0]);
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

  const recorder = useAudioRecorder((text) => {
    setPrompt((prev) => {
      if (!prev.trim()) return text;

      return prev.endsWith(" ") ? prev + text : prev + " " + text;
    });
  });

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
          {/* <div
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
          </div> */}
        </div>
      </div>

      {/* System prompt collapsible */}
      <div className="rounded-xl border border-neutral-800 overflow-hidden bg-neutral-950">
        <button
          onClick={() => setShowSystem((s) => !s)}
          aria-expanded={showSystem}
          aria-controls="system-prompt-area"
          className="w-full flex items-center gap-2 px-4 py-3 text-sm text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900 transition-colors"
        >
          {showSystem ? (
            <ChevronDown className="w-4 h-4" aria-hidden="true" />
          ) : (
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          )}

          <span className="font-medium">System prompt</span>
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
              rows={3}
              placeholder="You are a helpful AI assistant..."
              className="
          w-full rounded-xl border border-neutral-700
          bg-neutral-900 px-4 py-3
          text-sm text-neutral-200 font-mono
          placeholder:text-neutral-500
          focus:outline-none
          focus:ring-2 focus:ring-kairo-500/40
          focus:border-kairo-500/40
          resize-none
        "
            />

            <div className="flex flex-wrap gap-2">
              {SAMPLE_SYSTEM_PROMPTS.map((sp) => (
                <button
                  key={sp}
                  onClick={() => setSystemPrompt(sp)}
                  className="
              px-3 py-1.5 rounded-full
              text-xs
              border border-neutral-700
              bg-neutral-900
              text-neutral-400
              hover:text-white
              hover:border-neutral-500
              hover:bg-neutral-800
              transition-colors
              max-w-full
              truncate
            "
                >
                  {sp.length > 40 ? sp.slice(0, 40) + "…" : sp}
                </button>
              ))}
            </div>
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
      <div className="">
        <ChatInput
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          onSend={handleRun}
          aria-label="Prompt input"
          placeholder="Message AI..."
          rows={1}
          streaming={streaming}
          recorder={recorder}
        />

        {/* <div className="absolute right-14 bottom-3">
          <AudioInput
            onRecordingChange={setIsRecording}
            onTranscript={(text) => {
              setPrompt((prev) => {
                if (!prev.trim()) return text;

                return prev.endsWith(" ") ? prev + text : prev + " " + text;
              });
            }}
          />
        </div> */}
      </div>

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
