import express from "express";
import axios from "axios";

const router = express.Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

router.post("/", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const response = await axios.post(
      `${GEMINI_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      },
      { headers: { "Content-Type": "application/json" } }
    );

    res.json({ response: response.data.candidates[0].content.parts[0].text });
  } catch (err) {
    console.error("❌ Gemini API request failed:", err.message);
    res.status(500).json({ error: "Failed to fetch from Gemini API" });
  }
});

export default router;
