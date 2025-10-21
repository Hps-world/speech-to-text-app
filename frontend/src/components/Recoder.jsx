import { useRef, useState } from "react";

/*
 🎙 Recorder Component
 Allows users to record voice using their microphone.
 After recording stops, it sends the audio blob to backend `/api/transcribe`.
*/

export default function Recorder({ onTranscription }) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);
        uploadAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      alert("🎙 Microphone access denied or not available.");
      console.error(err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const uploadAudio = async (audioBlob) => {
    setLoading(true);
    try {
      const formData = new FormData();
      const file = new File([audioBlob], "recording.webm", { type: "audio/webm" });
      formData.append("audio", file);

      const token = localStorage.getItem("token");

      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/transcribe`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Transcription failed");

      onTranscription(data.transcript);
    } catch (err) {
      console.error("❌ Error uploading recording:", err);
      alert("Transcription failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="p-6 rounded-2xl shadow-md flex flex-col items-center gap-4 transition"
      style={{ backgroundColor: "#DDDAD0", color: "#57564F", width: "100%" }}
    >
      <h2 className="text-xl font-semibold">🎙 Record Audio</h2>

      <button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={loading}
        className="px-6 py-3 rounded-full text-white font-semibold transition"
        style={{
          backgroundColor: isRecording ? "#7A7A73" : "#57564F",
          opacity: loading ? 0.6 : 1,
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button>

      {audioUrl && (
        <audio
          controls
          src={audioUrl}
          className="mt-4 w-full rounded-md"
          style={{ backgroundColor: "#F8F3CE" }}
        />
      )}

      {loading && <p className="text-sm text-gray-600">Transcribing...</p>}
    </div>
  );
}
