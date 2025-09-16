import express from "express";
import mongoose from "mongoose";
import axios from "axios";
import Chat from "../models/Chat.js";
import User from "../models/User.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    let { text, userId } = req.body || {};
    if (!text) return res.status(400).json({ error: "Missing text" });

    // Resolve a valid ObjectId for the user
    let effectiveUserId = null;
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      effectiveUserId = new mongoose.Types.ObjectId(userId);
    } else {
      // Fallback to test user created on server start
      const testUser = await User.findOne({ email: "bhargav@example.com" });
      if (!testUser) return res.status(500).json({ error: "Server user not initialized" });
      effectiveUserId = testUser._id;
    }

    // Find or create chat document keyed by userId (matches schema)
    let chat = await Chat.findOne({ userId: effectiveUserId });
    if (!chat) chat = new Chat({ userId: effectiveUserId, messages: [] });

    // Push user message
    chat.messages.push({ sender: "user", text });
    await chat.save();

    // Call Gemini API with retry and fallback model
    let botMessage = "";
    const modelPrimary = process.env.GEMINI_MODEL || "gemini-1.5-flash";
    const endpoints = [
      `https://generativelanguage.googleapis.com/v1beta/models/${modelPrimary}:generateContent`,
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
    ];

    const maxAttempts = 4; // total attempts across endpoints
    let attempt = 0;
    let lastError = null;

    while (attempt < maxAttempts) {
      const endpoint = endpoints[Math.min(attempt, endpoints.length - 1)];
      try {
        const geminiRes = await axios.post(
          `${endpoint}?key=${process.env.GEMINI_API_KEY}`,
          { contents: [{ role: "user", parts: [{ text }] }] },
          { headers: { "Content-Type": "application/json" }, timeout: 20000 }
        );
        botMessage =
          geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
          "⚠️ No response from Gemini";
        lastError = null;
        break;
      } catch (apiErr) {
        lastError = apiErr;
        const status = apiErr?.response?.status;
        const retriable = status === 429 || status === 500 || status === 503 || !status;
        if (!retriable) break;
        // backoff: 250ms, 500ms, 1000ms
        const delay = 250 * Math.pow(2, attempt);
        await new Promise((r) => setTimeout(r, Math.min(delay, 1500)));
        attempt++;
      }
    }

    if (!botMessage) {
      // Provide clearer reason for common failures
      const status = lastError?.response?.status;
      if (status === 401 || status === 403) {
        botMessage = "⚠️ AI API auth failed. Check server API key.";
      } else {
        console.error("⚠️ Gemini API error (after retries):", lastError?.response?.data || lastError?.message);
        botMessage = "⚠️ AI API failed, please try again later.";
      }
    }

    // Save bot reply
    chat.messages.push({ sender: "bot", text: botMessage });
    await chat.save();

    return res.json({ reply: botMessage });
  } catch (err) {
    console.error("Chat route error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
