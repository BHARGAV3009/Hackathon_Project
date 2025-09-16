import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();
const JWT_SECRET = process.env.AUTH_SECRET || "dev_secret_change_me";

// Helper to issue JWT
function issueToken(user) {
  return jwt.sign({ sub: user._id.toString(), email: user.email }, JWT_SECRET, { expiresIn: "7d" });
}

// POST /api/auth/signup
router.post("/signup", async (req, res) => {
  try {
    const { email, password, name } = req.body || {};
    if (!email || !password) return res.status(400).json({ ok: false, error: "Email and password are required" });

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ ok: false, error: "Email already registered" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, name: name || email.split("@")[0], passwordHash });

    const token = issueToken(user);
    return res.json({ ok: true, user: { _id: user._id, email: user.email, name: user.name }, token });
  } catch (err) {
    console.error("Signup error:", err?.message || err);
    return res.status(500).json({ ok: false, error: "Failed to signup" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ ok: false, error: "Email and password are required" });

    const user = await User.findOne({ email });
    if (!user || !user.passwordHash) return res.status(401).json({ ok: false, error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ ok: false, error: "Invalid credentials" });

    const token = issueToken(user);
    return res.json({ ok: true, user: { _id: user._id, email: user.email, name: user.name }, token });
  } catch (err) {
    console.error("Login error:", err?.message || err);
    return res.status(500).json({ ok: false, error: "Failed to login" });
  }
});

export default router;