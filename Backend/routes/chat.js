import express from "express";
import axios from "axios";
import Chat from "../models/Chat.js";
import User from "../models/User.js";

const router = express.Router();

async function getTestUserId() {
  const testUser = await User.findOne({ email: "bhargav@example.com" });
  if (!testUser) throw new Error("Test user not found!");
  return testUser._id;
}

router.post("/", async (req, res) => {
  const { text } = req.body || {};
  if (!text) return res.status(400).json({ error: "Missing text" });
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: "Server misconfigured: GEMINI_API_KEY is missing" });
  }

  try {
    const userId = await getTestUserId();
    let chat = await Chat.findOne({ userId });
    if (!chat) chat = new Chat({ userId, messages: [] });

    chat.messages.push({ sender: "user", text });

    // Gemini AI call (Gemini v1beta generateContent)
    let botMessage = "";
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [
            {
              role: "user",
              parts: [{ text }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 300,
          },
        }
      );
      const candidates = response.data?.candidates || [];
      const parts = candidates[0]?.content?.parts || [];
      botMessage = parts.map((p) => p.text).filter(Boolean).join(" ").trim() || "⚠️ No response from AI";
    } catch (apiErr) {
      console.error("⚠️ Gemini API error:", apiErr.response?.data || apiErr.message);
      botMessage = "⚠️ AI API failed, using fallback response.";
    }

    chat.messages.push({ sender: "bot", text: botMessage });
    await chat.save();

    res.json({ sender: "bot", text: botMessage });
  } catch (err) {
    console.error("Chat route error:", err);
    res.status(500).json({ text: "⚠️ Failed to send message" });
  }
});

export default router;
