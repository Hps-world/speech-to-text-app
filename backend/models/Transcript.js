import mongoose from "mongoose";

const transcriptSchema = new mongoose.Schema(
  {
    filename: String,
    transcript: { type: String, required: true },
    mimetype: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // 🔑 link to user
  },
  { timestamps: true }
);
const Transcript = mongoose.model("Transcript", transcriptSchema);

export default Transcript;