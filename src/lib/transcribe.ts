export async function transcribeAudio(audioBlob: Blob) {
  try {
    const formData = new FormData();

    formData.append(
      "file",
      new File([audioBlob], "recording.webm", {
        type: "audio/webm",
      }),
    );

    formData.append("model", "whisper-large-v3-turbo");

    const response = await fetch(`${import.meta.env.BASE_URL}/transcribe`, {
      method: "POST",
      body: formData,
      // DO NOT set Content-Type manually — browser sets it with boundary
    });

    if (!response.ok) {
      throw new Error("Failed to transcribe audio");
    }

    const data = await response.json();

    return data.text;
  } catch (error) {
    console.error(error);
    return "";
  }
}
// export async function transcribeAudio(audioBlob: Blob) {
//   console.log(audioBlob)

//   // fake delay
//   await new Promise((resolve) => setTimeout(resolve, 1500))

//   // dummy transcript
//   return 'Hello Vikrant, this is a dummy transcription response.'
// }
