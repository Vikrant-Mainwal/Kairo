import { Loader2, Mic, SendHorizonal, Square } from "lucide-react";
import { useRef, type TextareaHTMLAttributes } from "react";

import type { UseAudioRecorderReturn } from "../../hooks/useAudioRecorder";

interface ChatInputProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string;
  streaming?: boolean;
  onSend?: () => void;
  recorder: UseAudioRecorderReturn;
}

export default function ChatInput({
  value,
  onChange,
  onKeyDown,
  placeholder = "Enter your message...",
  rows = 1,
  disabled,
  streaming,
  className,
  onSend,
  recorder,
  ...props
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { state, error, startRecording, stopRecording, reset } = recorder;

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(e);

    const textarea = textareaRef.current;

    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  const handleKeyDownInternal = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    onKeyDown?.(e);

    if (e.key === "Enter" && !e.shiftKey && state !== "recording") {
      e.preventDefault();
      onSend?.();
    }
  };

  return (
    <div className="w-full mx-auto m-1">
      <div
        className="
          relative flex items-end
          rounded-3xl border border-zinc-700
          bg-zinc-900 px-4 py-3 shadow-lg
        "
      >
        <textarea
          ref={textareaRef}
          rows={rows}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDownInternal}
          placeholder={placeholder}
          disabled={disabled || streaming || state === "recording"}
          className={[
            `
            w-full rounded-xl px-4 py-1 text-md
            text-neutral-200
            max-h-40 min-h-6
            resize-none overflow-y-auto
            bg-transparent pr-24
            placeholder:text-zinc-400
            focus:outline-none
            `,
            className,
          ].join(" ")}
          {...props}
        />

        {/* Right Actions */}
        <div className="absolute bottom-3 right-3">
          {state === "recording" ? (
            <div className="flex items-center gap-1">
              {/* Cancel */}
              <button
                onClick={reset}
                className="
          flex h-9 w-9 items-center
          justify-center rounded-full
          bg-zinc-800 text-red-400
          hover:bg-zinc-700
          transition
        "
              >
                ✕
              </button>

              {/* Stop */}
              <button
                onClick={stopRecording}
                className="
          flex h-9 w-9 items-center
          justify-center rounded-full
          bg-white text-black
          hover:scale-105
          transition
        "
              >
                <Square className="h-4 w-4 fill-black" />
              </button>
            </div>
          ) : state === "transcribing" ? (
            <div
              className="
        flex h-9 w-9 items-center
        justify-center rounded-full
        bg-zinc-800
      "
            >
              <Loader2 className="h-4 w-4 animate-spin text-white" />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {/* Mic */}
              <button
                onClick={startRecording}
                disabled={streaming}
                className="
          flex h-9 w-9 items-center
          justify-center rounded-full
          bg-zinc-800 text-white
          hover:bg-zinc-700
          transition
        "
              >
                <Mic className="h-4 w-4" />
              </button>

              {/* Send */}
              {value.trim() && (
                <button
                  onClick={onSend}
                  disabled={streaming}
                  className="
            flex h-9 w-9 items-center
            justify-center rounded-full
            bg-white text-black
            transition hover:scale-105
            disabled:opacity-40
          "
                >
                  <SendHorizonal className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="
            mt-2 text-sm text-red-400
            flex items-center gap-1.5
          "
        >
          <span aria-hidden="true">⚠</span>
          {error}
        </p>
      )}
    </div>
  );
}
