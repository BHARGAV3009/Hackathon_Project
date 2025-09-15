import express from "express";
import axios from "axios";

const router = express.Router();

router.post("/", async (req, res) => {
  const { vitals } = req.body || {};
  if (!vitals) return res.status(400).json({ error: "Missing vitals" });

  const promptText = `User vitals: BP=${vitals.bp}, Sugar=${vitals.sugar}, Age=${vitals.age}, Weight=${vitals.weight}. Predict possible diseases and health risks.`;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:generateText?key=${process.env.GEMINI_API_KEY}`,
      {
        prompt: { text: promptText },
        temperature: 0.7,
        maxOutputTokens: 300,
      }
    );

    const prediction = response.data?.candidates?.[0]?.output || "No prediction generated.";
    res.json({ prediction });
  } catch (err) {
    console.error("Prediction error:", err.response?.data || err.message);
    res.status(500).json({ error: "Prediction failed" });
  }
});

export default router;
