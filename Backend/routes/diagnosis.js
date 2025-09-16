import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { runDiagnosis } from "../ml/diagnosisModel.js";
import Diagnosis from "../models/Diagnosis.js";
import { requireAuthOptional, requireAuth } from "../middleware/auth.js";

const router = express.Router();

// Ensure temp uploads dir
const UPLOADS_DIR = path.resolve("./uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer config for optional image
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// POST /api/diagnosis
// Accepts: multipart/form-data with optional image file under field "image", and
// JSON fields via text fields: vitals (JSON string), text (string)
router.post("/", requireAuthOptional, upload.single("image"), async (req, res) => {
  try {
    // Parse vitals if sent as JSON string
    let vitals = undefined;
    if (req.body?.vitals) {
      try { vitals = JSON.parse(req.body.vitals); } catch {}
    }

    const text = req.body?.text || undefined;

    // Image context
    const imagePath = req.file ? req.file.path : undefined;
    const imageMimeType = req.file ? req.file.mimetype : undefined;
    const imageBuffer = req.file ? await fs.promises.readFile(req.file.path) : undefined;

    // Optional client-side user context (from frontend headers)
    const clientUserId = req.header("x-user-id") || undefined;
    const userEmail = req.header("x-user-email") || undefined;

    const result = await runDiagnosis({ vitals, imagePath, imageBuffer, imageMimeType, text });

    // Persist to MongoDB with authenticated userId if present
    const saved = await Diagnosis.create({
      userId: req.auth?.userId || undefined,
      clientUserId,
      userEmail,
      vitals,
      text,
      imagePath,
      imageMimeType,
      result,
    });

    return res.json({ ok: true, result, id: saved._id });
  } catch (err) {
    console.error("Diagnosis error:", err?.stack || err?.message || err);
    return res.status(500).json({ ok: false, error: "Diagnosis failed" });
  }
});

// GET /api/diagnosis (list history)
// Requires JWT; returns only records for the authenticated user
router.get("/", requireAuth, async (req, res) => {
  try {
    const items = await Diagnosis.find({ userId: req.auth.userId }).sort({ createdAt: -1 }).limit(100);
    return res.json({ ok: true, items });
  } catch (err) {
    console.error("Diagnosis list error:", err?.stack || err?.message || err);
    return res.status(500).json({ ok: false, error: "Failed to load diagnosis history" });
  }
});

export default router;