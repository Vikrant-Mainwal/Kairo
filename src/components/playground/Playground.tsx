import { useState, useCallback, useRef } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

import { useStreaming } from "../../hooks/useStreaming";
import { useAudioRecorder } from "../../hooks/useAudioRecorder";

import {
  MODELS,
  SAMPLE_PROMPTS,
  SAMPLE_SYSTEM_PROMPTS,
} from "../../services/models";
import { StreamOutput } from "../shared/StreamOutput";
import { Select } from "../ui/Select";
import ChatInput from "../shared/ChatInput";

export function Playground() {
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState(MODELS[0].id);
  const [systemPrompt, setSystemPrompt] = useState(
    SAMPLE_SYSTEM_PROMPTS[0],
  );
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

    const req = {
      prompt: prompt.trim(),
      model,
      systemPrompt,
    };

    lastRequestRef.current = req;

    await stream(req.prompt, {
      model: req.model,
      systemPrompt: req.systemPrompt,
    });
  }, [prompt, model, systemPrompt, streaming, stream]);

  const handleRetry = useCallback(async () => {
    if (!lastRequestRef.current) return;

    const {
      prompt: previousPrompt,
      model: previousModel,
      systemPrompt: previousSystemPrompt,
    } = lastRequestRef.current;

    await stream(previousPrompt, {
      model: previousModel,
      systemPrompt: previousSystemPrompt,
    });
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

      return prev.endsWith(" ")
        ? prev + text
        : prev + " " + text;
    });
  });

  return (
    <section
      aria-labelledby="playground-heading"
      className="
        w-full
        max-w-7xl
        mx-auto
        px-3
        sm:px-4
        md:px-6
        lg:px-8
        py-4
        sm:py-6
        space-y-5
      "
    >
      {/* Header */}
      <div
        className="
          flex
          flex-col
          lg:flex-row
          lg:items-center
          lg:justify-between
          gap-4
        "
      >
        <div className="space-y-1">
          <h2
            id="playground-heading"
            className="
              text-lg
              sm:text-xl
              md:text-2xl
              font-semibold
              text-neutral-100
            "
          >
            Inference playground
          </h2>

          <p className="text-sm text-neutral-500">
            Test prompts, models, streaming, and audio input.
          </p>
        </div>

        <div
          className="
            flex
            flex-wrap
            items-center
            gap-2
            sm:gap-3
            w-full
            lg:w-auto
          "
        >
          <div className="min-w-45 flex-1 sm:flex-none">
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
          </div>
        </div>
      </div>

      {/* System Prompt */}
      <div
        className="
          rounded-2xl
          border
          border-neutral-800
          overflow-hidden
          bg-neutral-950
          w-full
        "
      >
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
            min-h-12
          "
        >
          {showSystem ? (
            <ChevronDown
              className="w-4 h-4 shrink-0"
              aria-hidden="true"
            />
          ) : (
            <ChevronRight
              className="w-4 h-4 shrink-0"
              aria-hidden="true"
            />
          )}

          <span className="font-medium">
            System prompt
          </span>
        </button>

        {showSystem && (
          <div
            id="system-prompt-area"
            className="
              border-t
              border-neutral-800
              px-3
              sm:px-4
              py-4
              space-y-4
            "
          >
            <textarea
              value={systemPrompt}
              onChange={(e) =>
                setSystemPrompt(e.target.value)
              }
              aria-label="System prompt"
              rows={4}
              placeholder="You are a helpful AI assistant..."
              className="
                w-full
                rounded-xl
                border
                border-neutral-700
                bg-neutral-900
                px-3
                sm:px-4
                py-3
                text-sm
                sm:text-base
                text-neutral-200
                font-mono
                placeholder:text-neutral-500
                focus:outline-none
                focus:ring-2
                focus:ring-kairo-500/40
                focus:border-kairo-500/40
                resize-none
              "
            />

            <div
              className="
                hidden md:flex
                flex-wrap
                gap-2
              "
            >
              {SAMPLE_SYSTEM_PROMPTS.map((sp) => (
                <button
                  key={sp}
                  onClick={() => setSystemPrompt(sp)}
                  className="
                    shrink-0
                    px-3
                    py-2
                    rounded-full
                    text-xs
                    sm:text-sm
                    border
                    border-neutral-700
                    bg-neutral-900
                    text-neutral-400
                    hover:text-white
                    hover:border-neutral-500
                    hover:bg-neutral-800
                    transition-colors
                    truncate
                    max-w-55
                    min-h-11
                  "
                >
                  {sp.length > 40
                    ? sp.slice(0, 40) + "…"
                    : sp}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sample Prompts */}
      <div
        className="
          hidden md:flex
          gap-2
          overflow-x-auto
          scrollbar-hide
          pb-1
        "
        role="group"
        aria-label="Sample prompts"
      >
        {SAMPLE_PROMPTS.slice(0, 3).map((sp) => (
          <button
            key={sp}
            onClick={() => setPrompt(sp)}
            className="
              shrink-0
              px-3
              py-2
              rounded-full
              text-xs
              sm:text-sm
              border
              border-neutral-800
              bg-neutral-900
              text-neutral-400
              hover:text-neutral-200
              hover:border-neutral-700
              hover:bg-neutral-800
              transition-colors
              truncate
              max-w-55
              min-h-11
            "
          >
            {sp.length > 36
              ? sp.slice(0, 36) + "…"
              : sp}
          </button>
        ))}
      </div>

      {/* Chat Input */}
      <div className="w-full">
        <div
          className="
            rounded-2xl
            border
            border-neutral-800
            bg-neutral-950
            p-2
            sm:p-3
          "
        >
          <ChatInput
            value={prompt}
            onChange={(e) =>
              setPrompt(e.target.value)
            }
            onKeyDown={handleKeyDown}
            onSend={handleRun}
            aria-label="Prompt input"
            placeholder="Message AI..."
            rows={1}
            streaming={streaming}
            recorder={recorder}
          />
        </div>
      </div>

      {/* Output */}
      <div
        className="
          w-full
          overflow-hidden
        "
      >
        <StreamOutput
          output={output}
          streaming={streaming}
          error={error}
          onRetry={handleRetry}
          onAbort={abort}
          onReset={reset}
          metrics={metrics}
        />
      </div>
    </section>
  );
}