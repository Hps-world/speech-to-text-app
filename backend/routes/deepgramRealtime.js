// backend/routes/deepgramRealtime.js
import express from "express";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

/*
  ✅ /api/deepgram/token
  Generates a short-lived (ephemeral) Deepgram key using your main API key.
  Requires DEEPGRAM_PROJECT_ID and DEEPGRAM_API_KEY in .env.
*/

router.get("/token", async (req, res) => {
  try {
    const apiKey = process.env.DEEPGRAM_API_KEY;
    const projectId = process.env.DEEPGRAM_PROJECT_ID;

    if (!apiKey || !projectId) {
      console.error("❌ Missing DEEPGRAM_API_KEY or DEEPGRAM_PROJECT_ID in .env");
      return res.status(500).json({ error: "Server misconfiguration" });
    }

    const response = await fetch(`https://api.deepgram.com/v1/projects/${projectId}/keys`, {
      method: "POST",
      headers: {
        Authorization: `Token ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        comment: "Ephemeral key for live transcription",
        scopes: ["usage:write"],
        time_to_live_in_seconds: 60, // expires in 1 minute
      }),
    });

    const text = await response.text();
    if (!text) {
      console.error("❌ Empty response from Deepgram API");
      return res.status(500).json({ error: "Empty response from Deepgram API" });
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.error("❌ Could not parse Deepgram response:", text);
      return res.status(500).json({ error: "Failed to parse Deepgram response" });
    }

    if (!response.ok) {
      console.error("❌ Deepgram API error:", data);
      return res.status(response.status).json({ error: data.message || "Deepgram API error" });
    }

    // ✅ FIX HERE: Deepgram returns key, not api_key
    const ephemeralKey = data.api_key || data.key;

    if (!ephemeralKey) {
      console.error("❌ Deepgram response missing key:", data);
      return res.status(500).json({ error: "Deepgram response missing key" });
    }

    console.log("✅ Ephemeral key created successfully");
    res.json({ key: ephemeralKey });
  } catch (err) {
    console.error("❌ Failed to create Deepgram ephemeral key:", err);
    res.status(500).json({ error: "Failed to create ephemeral key" });
  }
});

export default router;
