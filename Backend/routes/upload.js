import express from "express";
import multer from "multer";
import Upload from "../models/Upload.js";
import fs from "fs";
import path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = express.Router();

// Ensure uploads directory exists and use absolute path
const UPLOADS_DIR = path.resolve("./uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer storage config (save in /uploads folder)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
});

// Gemini setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/", upload.single("file"), async (req, res) => {
  let { userId } = req.body || {};
  if (!req.file) return res.status(400).json({ error: "Missing file" });

  // Fallback: assign test user if none provided
  try {
    if (!userId) {
      const { default: User } = await import("../models/User.js");
      const testUser = await User.findOne({ email: "bhargav@example.com" });
      if (testUser) userId = testUser._id;
    }
  } catch {}

  const fileUrl = `/uploads/${req.file.filename}`;

  try {
    // Read and convert file to base64
    const buffer = await fs.promises.readFile(req.file.path);
    const base64Data = buffer.toString("base64");

    // Custom prompt
    const promptText =
      "Analyze the uploaded prescription or tablet image. Provide: 1) what it is, 2) key text (medicine names, dosage, warnings, expiry), 3) any patient info if visible. If unreadable, say so.";

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent([
      { text: promptText },
      {
        inlineData: {
          mimeType: req.file.mimetype || "image/png",
          data: base64Data,
        },
      },
    ]);

    const description = result.response.text().trim() || "No description generated.";

    // Save in MongoDB
    const newUpload = new Upload({ userId, fileUrl, description });
    await newUpload.save();

    res.json({ fileUrl, description });
  } catch (err) {
    console.error("❌ Image analysis error:", err.response?.data || err.stack || err.message);
    res.status(500).json({ error: "Image analysis failed" });
  }
});

export default router;
