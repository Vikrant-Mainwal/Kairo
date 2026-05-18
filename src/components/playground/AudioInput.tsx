import { Loader2, Mic, Square } from "lucide-react";
import { useAudioRecorder } from "../../hooks/useAudioRecorder";
import { Button } from "../ui/Button";

interface AudioInputProps {
  onTranscript: (text: string) => void;
  onRecordingChange?: (recording: boolean) => void;
}

export function AudioInput({
  onTranscript,
  onRecordingChange,
}: AudioInputProps) {
  const { state, error, startRecording, stopRecording, reset } =
    useAudioRecorder(onTranscript);

  return (
    <div className="">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {state === "recording" ? (
            <>
              {/* Cancel */}
              <Button
                onClick={() => {
                  reset();
                  onRecordingChange?.(false);
                }}
                variant="ghost"
                size="sm"
                className="
          w-10 h-10 rounded-full
          bg-neutral-800 hover:bg-neutral-700
        "
              >
                <p className="text-red-400 text-lg">✕</p>
              </Button>

              {/* Stop + Transcribe */}
              <Button
                onClick={() => {
                  onRecordingChange?.(false);
                  stopRecording();
                }}
                variant="ghost"
                size="sm"
                className="
          w-10 h-10 rounded-full
          bg-white hover:bg-neutral-200
        "
              >
                <Square className="w-5 h-5 text-black fill-black" />
              </Button>
            </>
          ) : state === "transcribing" ? (
            <Button disabled variant="ghost" size="sm">
              <Loader2 className="w-6 h-6 animate-spin" />
            </Button>
          ) : (
            <Button
              onClick={() => {
                onRecordingChange?.(true);
                startRecording();
              }}
              variant="ghost"
              size="sm"
              className="
        w-10 h-10 rounded-full
        bg-neutral-800 hover:bg-neutral-700
      "
            >
              <Mic className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="text-sm text-red-400 flex items-center gap-1.5"
        >
          <span aria-hidden="true">⚠</span> {error}
        </p>
      )}
    </div>
  );
}
