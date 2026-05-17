import { Mic, MicOff, Square } from 'lucide-react'
import { useAudioRecorder } from '../../hooks/useAudioRecorder'
import { Button } from '../ui/Button'

interface AudioInputProps {
  onTranscript: (text: string) => void
}

export function AudioInput({ onTranscript }: AudioInputProps) {
  const { state, audioUrl, error, startRecording, stopRecording, reset } = useAudioRecorder(onTranscript)

  return (
    <div className="space-y-3 p-4 rounded-xl border border-neutral-800 bg-neutral-900/50">
      <div className="flex items-center gap-3">
        {state === 'idle' || state === 'error' ? (
          <Button
            onClick={startRecording}
            variant="secondary"
            size="sm"
            aria-label="Start recording"
            className="gap-2"
          >
            <Mic className="w-3.5 h-3.5" aria-hidden="true" />
            Start recording
          </Button>
        ) : state === 'recording' ? (
          <Button
            onClick={stopRecording}
            variant="danger"
            size="sm"
            aria-label="Stop recording"
            className="gap-2 animate-pulse"
          >
            <Square className="w-3 h-3 fill-current" aria-hidden="true" />
            Stop
          </Button>
        ) : null}

        {state === 'recording' && (
          <span role="status" aria-live="assertive" className="flex items-center gap-2 text-xs text-red-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" aria-hidden="true" />
            Recording…
          </span>
        )}

        {state === 'done' && (
          <Button onClick={reset} variant="ghost" size="sm">
            <MicOff className="w-3.5 h-3.5" aria-hidden="true" />
            Clear
          </Button>
        )}
      </div>

      {audioUrl && (
        <audio
          controls
          src={audioUrl}
          aria-label="Recorded audio preview"
          className="w-full h-8"
        />
      )}

      {error && (
        <p role="alert" className="text-xs text-red-400 flex items-center gap-1.5">
          <span aria-hidden="true">⚠</span> {error}
        </p>
      )}

      <p className="text-xs text-neutral-600">
        In production, audio is sent to a speech-to-text API (e.g. Whisper) for transcription.
      </p>
    </div>
  )
}
