// POST   { password }                                  -> log in (sets session cookie)
// POST   { action:"change-password", current, next }    -> change password (must be logged in)
// GET                                                   -> { authed: boolean }
// DELETE                                                -> log out (clears cookie)
import { sessionToken, readBody, isAuthed, verifyPassword, setPassword } from "./_auth.js";

const MAX_AGE = 60 * 60 * 24 * 30; // 30 days
const COOKIE = (val, age) => `kul_session=${val}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${age}`;

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "GET") return res.status(200).json({ authed: isAuthed(req) });

  if (req.method === "DELETE") {
    res.setHeader("Set-Cookie", COOKIE("", 0));
    return res.status(200).json({ ok: true });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST, DELETE");
    return res.status(405).json({ error: "method not allowed" });
  }

  let body;
  try { body = await readBody(req); } catch (e) { return res.status(400).json({ error: "Bad request body" }); }

  // --- change password ---
  if (body && body.action === "change-password") {
    if (!isAuthed(req)) return res.status(401).json({ error: "Please log in first." });
    if (!(await verifyPassword(body.current))) return res.status(401).json({ error: "Current password is incorrect." });
    const next = String(body.next || "");
    if (next.length < 6) return res.status(400).json({ error: "New password must be at least 6 characters." });
    try {
      await setPassword(next);
      return res.status(200).json({ ok: true });
    } catch (e) {
      return res.status(500).json({ error: "Could not save new password. Is Blob storage connected?", detail: String((e && e.message) || e) });
    }
  }

  // --- login ---
  if (!(await verifyPassword(body && body.password))) {
    return res.status(401).json({ error: "Incorrect password" });
  }
  res.setHeader("Set-Cookie", COOKIE(sessionToken(), MAX_AGE));
  return res.status(200).json({ ok: true });
}
