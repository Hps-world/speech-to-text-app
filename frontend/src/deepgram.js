import { Deepgram } from "@deepgram/sdk";

// ⚠️ Only for local testing!
// Replace with your Deepgram API key
const deepgram = new Deepgram("6b19d6533fd5b541b33f53ffb1fde8444a703ce6");

export async function transcribeAudio(file) {
  const arrayBuffer = await file.arrayBuffer();
  const response = await deepgram.transcription.preRecorded(
    { buffer: Buffer.from(arrayBuffer), mimetype: file.type },
    { model: "general", language: "en" }
  );

  const transcript = response.results.channels[0].alternatives[0].transcript;
  return transcript;
}
