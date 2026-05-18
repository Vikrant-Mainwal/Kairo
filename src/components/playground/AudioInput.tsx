import { Loader2, Mic, MicOff, Square } from "lucide-react";
import { useAudioRecorder } from "../../hooks/useAudioRecorder";
import { Button } from "../ui/Button";

interface AudioInputProps {
  onTranscript: (text: string) => void;
}

export function AudioInput({ onTranscript }: AudioInputProps) {
  const { state, error, startRecording, stopRecording, reset } =
    useAudioRecorder(onTranscript);

  return (
    <div className="">
      <div className="flex items-center gap-3">

        <Button
          onClick={state === "recording" ? stopRecording : startRecording}
          disabled={state === "transcribing"}
          variant="ghost"
          size="sm"
        >
          {state === "recording" ? (
            <Square className="w-6 h-6 text-red-400" />
          ) : state === "transcribing" ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <Mic className="w-6 h-6" />
          )}
        </Button>

        {/* {state === "done" && (
          <Button onClick={reset} variant="ghost" size="sm">
            <MicOff className="w-3.5 h-3.5" aria-hidden="true" />
            Clear
          </Button>
        )} */}
      </div>

      {/* {audioUrl && (
        <audio
          controls
          src={audioUrl}
          aria-label="Recorded audio preview"
          className="w-full h-8"
        />
      )} */}

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
