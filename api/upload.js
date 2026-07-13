// POST { name, dataUrl }  -> uploads an image to Blob, returns { url }  (admin only)
import { put } from "@vercel/blob";
import { isAuthed, readBody } from "./_auth.js";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "method not allowed" });
  }
  if (!isAuthed(req)) return res.status(401).json({ error: "Unauthorized. Please log in again." });
  if (!process.env.BLOB_READ_WRITE_TOKEN && !process.env.BLOB_STORE_ID) {
    return res.status(500).json({ error: "Storage not configured. Connect a Blob store in Vercel." });
  }

  let body;
  try { body = await readBody(req); } catch (e) { return res.status(400).json({ error: "Bad JSON" }); }

  const dataUrl = body && body.dataUrl;
  if (!dataUrl || typeof dataUrl !== "string" || !dataUrl.startsWith("data:")) {
    return res.status(400).json({ error: "No image provided" });
  }
  const m = dataUrl.match(/^data:([^;]+);base64,(.+)$/s);
  if (!m) return res.status(400).json({ error: "Invalid image data" });

  const contentType = m[1];
  const buf = Buffer.from(m[2], "base64");
  if (buf.length > 6 * 1024 * 1024) return res.status(413).json({ error: "Image too large (max ~6MB after processing)" });

  const ext = (contentType.split("/")[1] || "jpg").replace("jpeg", "jpg").replace("+xml", "");
  const safe = String((body && body.name) || "image").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "image";
  const key = `uploads/${Date.now()}-${safe}.${ext}`;

  try {
    const { url } = await put(key, buf, { access: "public", contentType, addRandomSuffix: false });
    return res.status(200).json({ url });
  } catch (e) {
    return res.status(500).json({ error: "Upload failed", detail: String((e && e.message) || e) });
  }
}
