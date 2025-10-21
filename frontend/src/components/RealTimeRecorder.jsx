import { useRef, useState } from "react";

/*
  🎙️ RealTimeRecorder
  ---------------------
  - Gets a short-lived ephemeral token from your backend (/api/deepgram/token)
  - Opens a secure WebSocket to Deepgram's real-time transcription API
  - Streams mic audio as you speak
  - Displays partial + final text results live
*/

export default function RealTimeRecorder({ onFinalTranscript }) {
  const [isRecording, setIsRecording] = useState(false);
  const [partial, setPartial] = useState("");
  const [finalText, setFinalText] = useState("");
  const [statusMsg, setStatusMsg] = useState("Idle");
  const wsRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);

  // 🧩 Get ephemeral token from backend
  const getEphemeralToken = async () => {
    try {
      const res = await fetch("import.meta.env.VITE_BACKEND_URL/api/deepgram/token");
      const data = await res.json();
      if (!data.key) throw new Error("Invalid token response");
      return data.key;
    } catch (err) {
      console.error("Failed to get Deepgram token:", err);
      alert("Backend Deepgram token route failed. Check your backend logs.");
    }
  };

  // 🎙 Start recording and connect to Deepgram WebSocket
  const startRecording = async () => {
    try {
      const token = await getEphemeralToken();
      if (!token) return;

      setStatusMsg("Connecting to Deepgram...");

      const params = new URLSearchParams({
        model: "general",
        punctuate: "true",
        language: "en", // change to "hi" for Hindi etc.
      }).toString();

      const ws = new WebSocket(`wss://api.deepgram.com/v1/listen?${params}`, [
        "token",
        token,
      ]);
      ws.binaryType = "arraybuffer";
      wsRef.current = ws;

      ws.onopen = async () => {
        setStatusMsg("Connected ✅");
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        const mimeType = getSupportedMimeType();
        const mediaRecorder = new MediaRecorder(stream, { mimeType });
        mediaRecorderRef.current = mediaRecorder;

        setIsRecording(true);
        setFinalText("");
        setPartial("");

        mediaRecorder.ondataavailable = async (event) => {
          if (event.data.size > 0 && ws.readyState === WebSocket.OPEN) {
            const buffer = await event.data.arrayBuffer();
            ws.send(buffer);
          }
        };

        mediaRecorder.start(250);
        setStatusMsg("Recording and transcribing...");
      };

      ws.onmessage = (msgEvent) => {
        let data;
        try {
          data = JSON.parse(msgEvent.data);
        } catch {
          return;
        }

        const channel = data.channel || data.body?.channel;
        const altTranscript = channel?.alternatives?.[0]?.transcript;
        const isFinal = data.is_final || data.type === "transcript" && data.is_final;

        if (altTranscript) {
          if (isFinal) {
            setFinalText((prev) => {
              const updated = (prev + " " + altTranscript).trim();
              if (typeof onFinalTranscript === "function") onFinalTranscript(updated);
              return updated;
            });
            setPartial("");
          } else {
            setPartial(altTranscript);
          }
        }
      };

      ws.onerror = (err) => {
        console.error("WebSocket error:", err);
        setStatusMsg("WebSocket error — see console");
      };

      ws.onclose = () => {
        stopRecording();
        setStatusMsg("Connection closed.");
      };
    } catch (err) {
      console.error("Failed to start recording:", err);
      alert("Microphone or connection error. Check console.");
    }
  };

  // 🛑 Stop recording
  const stopRecording = async () => {
  setStatusMsg("Stopping...");
  setIsRecording(false);

  try {
    // stop mic
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }

    // close WebSocket
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.close();
    }

    // ✅ Send final transcript to backend to save
    if (finalText.trim()) {
      const token = localStorage.getItem("token");
      const res = await fetch("import.meta.env.VITE_BACKEND_URL/api/transcripts/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ transcript: finalText }),
      });

      const data = await res.json();
      if (res.ok) {
        console.log("✅ Live transcript saved to DB:", data);
        if (typeof onFinalTranscript === "function") {
          onFinalTranscript(finalText);
        }
      } else {
        console.error("❌ Failed to save live transcript:", data);
      }
    }
  } catch (err) {
    console.error("Error stopping recording:", err);
  } finally {
    setStatusMsg("Stopped.");
  }
};


  // Helper: find a supported audio MIME type
  const getSupportedMimeType = () => {
    const candidates = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/ogg;codecs=opus",
      "audio/ogg",
      "audio/wav",
    ];
    for (const type of candidates) {
      if (MediaRecorder.isTypeSupported(type)) return type;
    }
    return "";
  };

  return (
    <div
      className="p-6 rounded-2xl shadow-md flex flex-col gap-4 transition"
      style={{ backgroundColor: "#DDDAD0", color: "#57564F" }}
    >
      <h2 className="text-xl font-semibold">🌐 Live Transcription (Deepgram)</h2>

      <button
        onClick={isRecording ? stopRecording : startRecording}
        className="px-6 py-2 rounded-lg text-white font-medium transition"
        style={{
          backgroundColor: isRecording ? "#7A7A73" : "#57564F",
          cursor: "pointer",
        }}
      >
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button>

      <p className="text-sm text-[#7A7A73]">{statusMsg}</p>

      <div className="border rounded-lg p-3 bg-[#F8F3CE] text-[#57564F]">
        <p className="text-sm text-[#7A7A73] mb-1">🎧 Partial (live):</p>
        <p>{partial || "— Speak to see real-time text —"}</p>

        <hr className="my-2" />

        <p className="text-sm text-[#7A7A73] mb-1">📝 Final Transcript:</p>
        <p className="whitespace-pre-wrap">{finalText || "No text yet"}</p>
      </div>
    </div>
  );
}
