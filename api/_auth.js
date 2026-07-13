// Shared auth helpers for the kül admin API.
import crypto from "node:crypto";
import { readJSON, writeJSON } from "./_store.js";

const AUTH_KEY = "_auth.json"; // stored password hash (store id is server-only, so not visitor-guessable)
const PBKDF2_ITERS = 120000;

// Session token is derived from the admin password, so it can't be forged
// without knowing the password. No separate secret needed.
export function sessionToken() {
  const pw = process.env.ADMIN_PASSWORD || "";
  return crypto.createHmac("sha256", pw).update("kul-admin-v1").digest("hex");
}

export function parseCookies(req) {
  const header = req.headers.cookie || "";
  const out = {};
  header.split(";").forEach((part) => {
    const idx = part.indexOf("=");
    if (idx === -1) return;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    if (k) out[k] = decodeURIComponent(v);
  });
  return out;
}

export function safeEqual(a, b) {
  const A = Buffer.from(String(a || ""));
  const B = Buffer.from(String(b || ""));
  if (A.length !== B.length) return false;
  return crypto.timingSafeEqual(A, B);
}

export function isAuthed(req) {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return false;
  const token = parseCookies(req).kul_session || "";
  return safeEqual(token, sessionToken());
}

export async function readBody(req) {
  if (req.body !== undefined && req.body !== null) {
    return typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body;
  }
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

/* ---------- password (changeable via studio; env ADMIN_PASSWORD is always a fallback) ---------- */
function pbkdf2(password, salt, iters) {
  return crypto.pbkdf2Sync(String(password), salt, iters, 32, "sha256").toString("hex");
}

// Verify a password against the stored hash (if any) OR the env ADMIN_PASSWORD (recovery).
export async function verifyPassword(password) {
  const env = process.env.ADMIN_PASSWORD;
  if (env && safeEqual(String(password || ""), env)) return true;
  const rec = await readJSON(AUTH_KEY);
  if (rec && rec.salt && rec.hash) {
    const calc = pbkdf2(password, rec.salt, rec.iters || PBKDF2_ITERS);
    return safeEqual(calc, rec.hash);
  }
  return false;
}

export async function setPassword(next) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = pbkdf2(next, salt, PBKDF2_ITERS);
  await writeJSON(AUTH_KEY, { v: 1, salt, hash, iters: PBKDF2_ITERS, updatedAt: new Date().toISOString() });
}
