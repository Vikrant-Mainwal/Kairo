import { useRef, type TextareaHTMLAttributes } from "react";
import { SendHorizonal } from "lucide-react";

interface ChatInputProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string;
  streaming?: boolean;
  onSend?: () => void;
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
  ...props
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(e);

    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  const handleKeyDownInternal = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    onKeyDown?.(e);

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend?.();
    }
  };

  return (
    <div className="w-full mx-auto m-1">
      <div className="relative flex items-end rounded-3xl border border-zinc-700 bg-zinc-900 px-4 py-3 shadow-lg">
        <textarea
          ref={textareaRef}
          rows={rows}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDownInternal}
          placeholder={placeholder}
          disabled={disabled || streaming}
          className={[
            `
            w-full rounded-xl px-4 py-1 text-md text-neutral-200
            max-h-40 min-h-6
            resize-none overflow-y-auto
            bg-transparent pr-12
            placeholder:text-zinc-400
            focus:outline-none
            `,
            className,
          ].join(" ")}
          {...props}
        />

        <button
          onClick={onSend}
          disabled={!value.trim() || streaming}
          className="
            absolute bottom-3 right-3
            flex h-9 w-9 items-center justify-center
            rounded-full bg-white text-black
            transition hover:scale-105
            disabled:opacity-40
          "
        >
          <SendHorizonal className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}