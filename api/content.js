// GET   -> { content }  (public; null until first publish -> site uses defaults)
// POST  { content }     -> saves content to Vercel Blob (requires admin cookie)
import { put, list } from "@vercel/blob";
import { isAuthed, readBody } from "./_auth.js";

const BLOB_KEY = "content.json";

async function readStored() {
  try {
    const { blobs } = await list({ prefix: BLOB_KEY });
    const b = blobs.find((x) => x.pathname === BLOB_KEY) || blobs[0];
    if (!b) return null;
    const r = await fetch(b.url, { cache: "no-store" });
    if (!r.ok) return null;
    return await r.json();
  } catch (e) {
    return null;
  }
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "GET") {
    const content = await readStored();
    return res.status(200).json({ content });
  }

  if (req.method === "POST") {
    if (!isAuthed(req)) return res.status(401).json({ error: "Unauthorized. Please log in again." });
    // @vercel/blob authenticates via either a static BLOB_READ_WRITE_TOKEN or, on Vercel,
    // OIDC (BLOB_STORE_ID + the auto-injected VERCEL_OIDC_TOKEN). Accept either.
    if (!process.env.BLOB_READ_WRITE_TOKEN && !process.env.BLOB_STORE_ID) {
      return res.status(500).json({ error: "Storage not configured. Connect a Blob store to this project in Vercel." });
    }
    let body;
    try { body = await readBody(req); } catch (e) { return res.status(400).json({ error: "Bad JSON" }); }
    const content = body && body.content ? body.content : body;
    if (!content || typeof content !== "object" || Array.isArray(content)) {
      return res.status(400).json({ error: "Missing or invalid content" });
    }
    try {
      await put(BLOB_KEY, JSON.stringify(content), {
        access: "public",
        contentType: "application/json",
        addRandomSuffix: false,
        allowOverwrite: true,
      });
      return res.status(200).json({ ok: true, savedAt: new Date().toISOString() });
    } catch (e) {
      return res.status(500).json({ error: "Save failed", detail: String((e && e.message) || e) });
    }
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "method not allowed" });
}
