export async function transcribeAudio(audioBlob: Blob) {
  try {
    const formData = new FormData()

    formData.append(
      'file',
      new File([audioBlob], 'recording.webm', {
        type: 'audio/webm',
      })
    )

    formData.append('model', 'whisper-large-v3-turbo')

    const response = await fetch(
      'https://api.groq.com/openai/v1/audio/transcriptions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
        },
        body: formData,
      }
    )

    if (!response.ok) {
      throw new Error('Failed to transcribe audio')
    }

    const data = await response.json()

    return data.text
  } catch (error) {
    console.error(error)
    return ''
  }
}