import { useState, useRef, useCallback } from "react";
import { transcribeAudio } from "../lib/transcribe";

export type RecorderState =
  | "idle"
  | "recording"
  | "transcribing"
  | "done"
  | "error";

export interface UseAudioRecorderReturn {
  state: RecorderState;
  audioUrl: string | null;
  error: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  reset: () => void;
}

export function useAudioRecorder(
  onTranscript: (text: string) => void,
): UseAudioRecorderReturn {
  const [state, setState] = useState<RecorderState>("idle");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // NEW
  const cancelledRef = useRef(false);

  const startRecording = useCallback(async () => {
    setError(null);
    setAudioUrl(null);

    chunksRef.current = [];

    // reset cancel state
    cancelledRef.current = false;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      const mr = new MediaRecorder(stream);

      mediaRecorderRef.current = mr;

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mr.onstop = async () => {
        // stop all tracks
        stream.getTracks().forEach((t) => t.stop());

        // if cancelled -> skip API
        if (cancelledRef.current) {
          chunksRef.current = [];
          setState("idle");
          return;
        }

        try {
          setState("transcribing");

          const blob = new Blob(chunksRef.current, {
            type: "audio/webm",
          });

          const url = URL.createObjectURL(blob);

          setAudioUrl(url);

          const text = await transcribeAudio(blob);

          if (text.trim()) {
            onTranscript(text);
          }

          setState("done");
        } catch (err) {
          console.error(err);

          setError("Failed to transcribe audio");

          setState("error");
        }
      };

      mr.start();

      setState("recording");
    } catch (err) {
      if (err instanceof Error && err.name === "NotAllowedError") {
        setError(
          "Microphone permission denied. Please allow access in your browser settings.",
        );
      } else {
        setError("Could not access microphone. Please check your device.");
      }

      setState("error");
    }
  }, [onTranscript]);

  const stopRecording = useCallback(() => {
    // normal transcription
    cancelledRef.current = false;

    mediaRecorderRef.current?.stop();
  }, []);

  const reset = useCallback(() => {
    // cancel transcription
    cancelledRef.current = true;

    mediaRecorderRef.current?.stop();

    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    setAudioUrl(null);
    setError(null);
    setState("idle");
  }, [audioUrl]);

  return {
    state,
    audioUrl,
    error,
    startRecording,
    stopRecording,
    reset,
  };
}