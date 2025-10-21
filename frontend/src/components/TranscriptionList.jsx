import { useState } from "react";

/*
  🧠 TranscriptionList.jsx
  -------------------------
  - Displays all saved transcripts.
  - Includes 🗑️ delete button for each entry.
  - Calls backend DELETE /api/transcripts/:id.
  - Notifies parent (Dashboard) via onDelete callback.
*/

export default function TranscriptionList({ transcripts, onDelete }) {
  const [deletingId, setDeletingId] = useState(null);

  if (!transcripts || transcripts.length === 0)
    return (
      <p className="text-[#57564F] text-center mt-4">
        No transcripts found yet.
      </p>
    );

  // 🧩 Handle delete action
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this transcript?")) return;

    try {
      setDeletingId(id);
      const token = localStorage.getItem("token");

      const res = await fetch(`import.meta.env.VITE_BACKEND_URL/api/transcripts/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete transcript");

      // ✅ Update parent state
      onDelete?.(id);
    } catch (err) {
      console.error("❌ Delete failed:", err.message);
      alert("Failed to delete transcript. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {transcripts.map((t) => (
        <div
          key={t._id}
          className="bg-[#DDDAD0] p-4 rounded-xl shadow-sm border hover:shadow-lg transition relative"
          style={{
            borderColor: "#7A7A73",
            color: "#57564F",
          }}
        >
          {/* 🗑️ Delete Button */}
          <button
            onClick={() => handleDelete(t._id)}
            disabled={deletingId === t._id}
            className="absolute top-2 right-2 text-red-600 hover:text-red-800 transition"
            title="Delete Transcript"
          >
            {deletingId === t._id ? "..." : "🗑️"}
          </button>

          {/* Timestamp */}
          <p className="text-sm text-[#7A7A73] mb-1">
            {new Date(t.createdAt).toLocaleString()}
          </p>

          {/* Transcript text */}
          <h3 className="font-semibold text-[#57564F] mt-2 line-clamp-3">
            {t.transcript || "(empty transcript)"}
          </h3>

          {/* Filename */}
          <p className="text-xs text-[#7A7A73] mt-2 italic">
            {t.filename || "Unknown file"}
          </p>
        </div>
      ))}
    </div>
  );
}
