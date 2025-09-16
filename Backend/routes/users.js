import express from "express";
import User from "../models/User.js";

const router = express.Router();

// POST /api/users/login - upsert user by email and return user doc
router.post("/login", async (req, res) => {
  try {
    const { email, name } = req.body || {};
    if (!email) return res.status(400).json({ ok: false, error: "Email is required" });

    const update = {};
    if (name) update.name = name;

    const user = await User.findOneAndUpdate(
      { email },
      { $setOnInsert: { email, name: name || email.split("@")[0] } , $set: update },
      { new: true, upsert: true }
    );

    return res.json({ ok: true, user });
  } catch (err) {
    console.error("User login/upsert error:", err?.message || err);
    return res.status(500).json({ ok: false, error: "Failed to login/upsert user" });
  }
});

export default router;