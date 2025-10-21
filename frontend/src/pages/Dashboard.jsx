import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header.jsx";
import UploadAudio from "../components/UploadAudio.jsx";
import RealTimeRecorder from "../components/RealTimeRecorder.jsx";
import TranscriptionList from "../components/TranscriptionList.jsx";

/*
  🎙 Dashboard.jsx
  -----------------
  - Displays Upload + Real-time Recorder
  - Shows live and saved transcripts
  - Updates instantly (no refresh required)
*/

export default function Dashboard() {
  const navigate = useNavigate();
  const [transcripts, setTranscripts] = useState([]);
  const [latestTranscript, setLatestTranscript] = useState("");
  const token = localStorage.getItem("token");

  // 🧠 Fetch all transcripts
  const fetchTranscripts = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/transcripts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch transcripts");
      const data = await res.json();
      setTranscripts(data);
    } catch (err) {
      console.error("❌ Error fetching transcripts:", err);
    }
  };

  useEffect(() => {
    fetchTranscripts();
  }, []);

  // 🧩 Logout handler
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // 📜 When a new transcript is created (upload or realtime)
  const handleNewTranscript = (text) => {
    if (!text) return;
    // 1️⃣ Add new transcript instantly (optimistic)
    const tempTranscript = {
      _id: Date.now().toString(),
      transcript: text,
      filename: "New Transcript",
      createdAt: new Date().toISOString(),
    };
    setTranscripts((prev) => [tempTranscript, ...prev]);

    // 2️⃣ Update latest transcript
    setLatestTranscript(text);

    // 3️⃣ Re-fetch from backend to sync
    fetchTranscripts();
  };

  return (
    <div className="min-h-screen bg-[#F8F3CE] flex flex-col">
      {/* Header */}
      <Header onLogout={handleLogout} />

      {/* Main Section */}
      <main className="flex-1 p-6 space-y-8">
        {/* Record + Upload */}
        <div className="grid md:grid-cols-2 gap-6">
          <RealTimeRecorder onFinalTranscript={handleNewTranscript} />
          <UploadAudio onTranscription={handleNewTranscript} />
        </div>

        {/* Latest Transcript */}
        {latestTranscript && (
          <div className="bg-[#DDDAD0] p-4 rounded-lg shadow-md mt-4">
            <h2 className="text-lg font-semibold text-[#57564F] mb-2">
              🆕 Latest Transcript:
            </h2>
            <p className="text-[#57564F] whitespace-pre-wrap">
              {latestTranscript}
            </p>
          </div>
        )}

        {/* Transcription History */}
        <section>
          <h2 className="text-xl font-semibold text-[#57564F] mb-4">
            🧾 Transcription History
          </h2>
          <TranscriptionList
            transcripts={transcripts}
            onDelete={(id) =>
              setTranscripts((prev) => prev.filter((t) => t._id !== id))
            }
          />
        </section>
      </main>

      {/* Footer */}
      <footer
        className="text-center py-4 text-sm"
        style={{ backgroundColor: "#57564F", color: "#DDDAD0" }}
      >
        © {new Date().getFullYear()} Speech-to-Text | Powered by Deepgram
      </footer>
    </div>
  );
}
