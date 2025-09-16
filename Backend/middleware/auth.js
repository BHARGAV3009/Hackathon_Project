import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.AUTH_SECRET || "dev_secret_change_me";

// Parses Authorization: Bearer <token> if present.
// If valid, sets req.auth = { userId, email }.
export function requireAuthOptional(req, _res, next) {
  try {
    const auth = req.headers?.authorization || "";
    const m = auth.match(/^Bearer\s+(.+)$/i);
    if (m) {
      const payload = jwt.verify(m[1], JWT_SECRET);
      if (payload?.sub) req.auth = { userId: payload.sub, email: payload.email };
    }
  } catch (_) {}
  next();
}

// Requires a valid JWT. 401 if missing/invalid.
export function requireAuth(req, res, next) {
  try {
    const auth = req.headers?.authorization || "";
    const m = auth.match(/^Bearer\s+(.+)$/i);
    if (!m) return res.status(401).json({ ok: false, error: "Unauthorized" });
    const payload = jwt.verify(m[1], JWT_SECRET);
    if (!payload?.sub) return res.status(401).json({ ok: false, error: "Unauthorized" });
    req.auth = { userId: payload.sub, email: payload.email };
    next();
  } catch (err) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }
}