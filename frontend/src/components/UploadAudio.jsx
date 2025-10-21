import { useState } from "react";

/*
  📤 UploadAudio.jsx
  ------------------
  - Lets users upload .mp3/.wav audio
  - Sends it to backend /api/transcribe
  - Displays transcript + notifies parent Dashboard
*/

export default function UploadAudio({ onTranscription }) {
  const [file, setFile] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setTranscript("");
    setError("");
  };

  const handleTranscribe = async () => {
    if (!file) return alert("Please select an audio file first!");
    setLoading(true);
    setError("");
    setTranscript("");

    try {
      const formData = new FormData();
      formData.append("audio", file);

      const token = localStorage.getItem("token");

      const res = await fetch("import.meta.env.VITE_BACKEND_URL/api/transcribe", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to transcribe audio");

      const data = await res.json();

      const result = data.transcript || "No speech detected.";
      setTranscript(result);

      // ✅ notify parent (Dashboard)
      if (typeof onTranscription === "function") {
        onTranscription(result);
      }
    } catch (err) {
      console.error("❌ Transcription Error:", err);
      setError("Transcription failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="p-6 rounded-2xl shadow-md flex flex-col items-center gap-4 transition"
      style={{
        backgroundColor: "#DDDAD0",
        color: "#57564F",
        width: "100%",
        maxWidth: "600px",
        margin: "0 auto",
      }}
    >
      <h2 className="text-xl font-semibold">📤 Upload Audio File</h2>

      {/* File Input */}
      <input
        type="file"
        accept="audio/*"
        onChange={handleFileChange}
        className="border rounded-lg p-2 w-full text-sm cursor-pointer"
        style={{
          borderColor: "#7A7A73",
          backgroundColor: "#F8F3CE",
          color: "#57564F",
        }}
      />

      {/* Upload Button */}
      <button
        onClick={handleTranscribe}
        disabled={!file || loading}
        className="px-6 py-2 rounded-lg text-white font-medium transition disabled:opacity-50"
        style={{
          backgroundColor: "#57564F",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Transcribing..." : "Upload & Transcribe"}
      </button>

      {/* Error */}
      {error && <p className="text-red-600 text-sm font-medium">{error}</p>}

      {/* Result */}
      {transcript && (
        <div className="w-full flex flex-col gap-2 mt-4">
          <label className="text-sm font-semibold">
            Transcription Result:
          </label>
          <textarea
            value={transcript}
            readOnly
            className="w-full border rounded-lg p-3 h-48 text-sm resize-none"
            style={{
              borderColor: "#7A7A73",
              backgroundColor: "#F8F3CE",
              color: "#57564F",
            }}
          />
        </div>
      )}
    </div>
  );
}
