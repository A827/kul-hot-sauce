// POST   { password }  -> sets session cookie on success
// GET                  -> { authed: boolean }
// DELETE               -> clears the session cookie (logout)
import { sessionToken, safeEqual, readBody, isAuthed } from "./_auth.js";

const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "GET") {
    return res.status(200).json({ authed: isAuthed(req) });
  }

  if (req.method === "DELETE") {
    res.setHeader("Set-Cookie", "kul_session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0");
    return res.status(200).json({ ok: true });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST, DELETE");
    return res.status(405).json({ error: "method not allowed" });
  }

  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) {
    return res.status(500).json({ error: "Admin password is not configured. Add an ADMIN_PASSWORD environment variable in Vercel." });
  }

  let body;
  try { body = await readBody(req); } catch (e) { return res.status(400).json({ error: "Bad request body" }); }

  if (!safeEqual(String(body.password || ""), pw)) {
    return res.status(401).json({ error: "Incorrect password" });
  }

  const cookie = `kul_session=${sessionToken()}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${MAX_AGE}`;
  res.setHeader("Set-Cookie", cookie);
  return res.status(200).json({ ok: true });
}
