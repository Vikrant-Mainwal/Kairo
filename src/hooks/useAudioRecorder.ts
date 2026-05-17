import { useState, useRef, useCallback } from 'react'

export type RecorderState = 'idle' | 'recording' | 'done' | 'error'

export interface UseAudioRecorderReturn {
  state: RecorderState
  audioUrl: string | null
  error: string | null
  startRecording: () => Promise<void>
  stopRecording: () => void
  reset: () => void
}

/**
 * useAudioRecorder — MediaRecorder API wrapper.
 * In production, the blob would be sent to a speech-to-text API.
 */
export function useAudioRecorder(onTranscript: (text: string) => void): UseAudioRecorderReturn {
  const [state, setState] = useState<RecorderState>('idle')
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const startRecording = useCallback(async () => {
    setError(null)
    setAudioUrl(null)
    chunksRef.current = []

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream)
      mediaRecorderRef.current = mr

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        setState('done')
        stream.getTracks().forEach(t => t.stop())

        // In production: POST blob to speech-to-text API (Whisper, etc.)
        // For demo: insert placeholder
        onTranscript('[Audio recorded — connect a transcription API to convert this to text]')
      }

      mr.start()
      setState('recording')
    } catch (err) {
      if (err instanceof Error && err.name === 'NotAllowedError') {
        setError('Microphone permission denied. Please allow access in your browser settings.')
      } else {
        setError('Could not access microphone. Please check your device.')
      }
      setState('error')
    }
  }, [onTranscript])

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop()
  }, [])

  const reset = useCallback(() => {
    mediaRecorderRef.current?.stop()
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    setAudioUrl(null)
    setError(null)
    setState('idle')
  }, [audioUrl])

  return { state, audioUrl, error, startRecording, stopRecording, reset }
}
