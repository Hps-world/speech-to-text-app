import express from "express";
import multer from "multer";
import fs from "fs";
import axios from "axios";
import Transcript from "../models/Transcript.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// 🎤 POST /api/transcribe → Upload + Transcribe
router.post("/transcribe", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file uploaded" });
    }

    const { path: filePath, mimetype, originalname } = req.file;
    console.log("📂 Received file:", originalname, mimetype);

    const response = await axios.post(
      "https://api.deepgram.com/v1/listen?model=general",
      fs.createReadStream(filePath),
      {
        headers: {
          Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
          "Content-Type": mimetype,
        },
      }
    );

    fs.unlinkSync(filePath);

    const transcript =
      response.data?.results?.channels?.[0]?.alternatives?.[0]?.transcript ||
      "(no speech detected)";

    const savedDoc = await Transcript.create({
      filename: originalname,
      mimetype,
      transcript,
    });

    console.log("✅ Transcription complete!");
    res.json({ success: true, transcript, id: savedDoc._id });
  } catch (error) {
    console.error("❌ Transcription Error:", error.message);
    if (error.response) console.error(error.response.data);
    res.status(500).json({ error: "Transcription failed" });
  }
});

// 📜 GET /api/transcripts → Fetch all transcripts
router.get("/transcripts", async (req, res) => {
  try {
    const docs = await Transcript.find().sort({ createdAt: -1 });
    res.json(docs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch transcripts" });
  }
});
// 📜 DELETE /api/transcripts/:id → Delete a transcript by ID
router.delete("/transcripts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Transcript.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: "Transcript not found" });
    }

    res.json({ success: true, message: "Transcript deleted successfully" });
  } catch (error) {
    console.error("❌ Failed to delete transcript:", error);
    res.status(500).json({ error: "Failed to delete transcript" });
  }
});
// 📜 POST /api/transcripts/save → Save live transcript from frontend
router.post("/transcripts/save", async (req, res) => {
  try {
    const { transcript } = req.body;
    if (!transcript || transcript.trim() === "") {
      return res.status(400).json({ error: "Transcript text is required" });
    }

    const doc = await Transcript.create({
      filename: "Live Recording",
      mimetype: "audio/webm",
      transcript,
    });

    console.log("✅ Live transcript saved:", doc._id);
    res.json({ success: true, id: doc._id, transcript: doc.transcript });
  } catch (error) {
    console.error("❌ Failed to save live transcript:", error);
    res.status(500).json({ error: "Failed to save live transcript" });
  }
});



export default router;
