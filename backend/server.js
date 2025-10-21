import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import helmet from "helmet";
import mongoose from "mongoose";
import transcribeRouter from "./routes/transcribe.js";
import rateLimiter from "./middleware/rateLimiter.js"
import authRoutes from "./routes/auth.js";
import transcribeRoutes from "./routes/transcribe.js";
import deepgramRealtimeRoutes from "./routes/deepgramRealtime.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Basic security + logging
app.use(helmet());
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://speech-to-text-app-sigma.vercel.app/"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
}));
// configure origin in production
app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));
app.use(rateLimiter); // simple rate limiting middleware


// Routes
app.use("/api", transcribeRouter);
app.use("/api/auth", authRoutes);
app.use("/api", transcribeRoutes);
app.use("/api/deepgram", deepgramRealtimeRoutes);

// Root
app.get("/", (req, res) => res.json({ status: "ok", env: process.env.NODE_ENV || "dev" }));

// Connect to MongoDB then start server
const start = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is required in .env");
    }
    await mongoose.connect(process.env.MONGO_URI, {
      // options are fine with mongoose defaults
    });
    console.log("✅ Connected to MongoDB");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

start();
