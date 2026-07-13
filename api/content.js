// Content API
//   GET                       -> { content }            published content (public)
//   GET ?draft=1              -> { content }            current draft (admin)
//   GET ?history=1            -> { history:[{name,at}] } backup list (admin)
//   GET ?restore=backups/x    -> { content }            one backup (admin)
//   POST { content }          -> publish: snapshot -> live, clear draft, prune (admin)
//   POST ?draft=1 { content } -> save draft (admin)
import { readJSON, writeJSON, listPrefix, delKey, storageReady } from "./_store.js";
import { isAuthed, readBody } from "./_auth.js";

const LIVE = "content.json";
const DRAFT = "draft.json";
const BK = "backups/";
const MAX_BACKUPS = 20;

function query(req) {
  if (req.query) return req.query;
  try { return Object.fromEntries(new URL(req.url, "http://x").searchParams); } catch (e) { return {}; }
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  const q = query(req);

  if (req.method === "GET") {
    if (q.draft) {
      if (!isAuthed(req)) return res.status(401).json({ error: "unauthorized" });
      return res.status(200).json({ content: await readJSON(DRAFT) });
    }
    if (q.history) {
      if (!isAuthed(req)) return res.status(401).json({ error: "unauthorized" });
      const blobs = await listPrefix(BK);
      const history = blobs
        .map((b) => ({ name: b.pathname, at: b.uploadedAt || null }))
        .sort((a, c) => (a.name < c.name ? 1 : -1));
      return res.status(200).json({ history });
    }
    if (q.restore) {
      if (!isAuthed(req)) return res.status(401).json({ error: "unauthorized" });
      const name = String(q.restore);
      if (!name.startsWith(BK)) return res.status(400).json({ error: "bad restore key" });
      return res.status(200).json({ content: await readJSON(name) });
    }
    return res.status(200).json({ content: await readJSON(LIVE) });
  }

  if (req.method === "POST") {
    if (!isAuthed(req)) return res.status(401).json({ error: "Unauthorized. Please log in again." });
    if (!storageReady()) return res.status(500).json({ error: "Storage not configured. Connect a Blob store in Vercel." });

    let body;
    try { body = await readBody(req); } catch (e) { return res.status(400).json({ error: "Bad JSON" }); }
    const content = body && body.content ? body.content : body;
    if (!content || typeof content !== "object" || Array.isArray(content)) {
      return res.status(400).json({ error: "Missing or invalid content" });
    }

    try {
      if (q.draft) {
        await writeJSON(DRAFT, content);
        return res.status(200).json({ ok: true, draft: true });
      }
      // Publish: snapshot the current live copy into backups, write the new live copy,
      // clear the draft, and prune old backups.
      const prev = await readJSON(LIVE);
      if (prev) {
        const ts = new Date().toISOString().replace(/[:.]/g, "-");
        await writeJSON(BK + ts + ".json", prev);
      }
      await writeJSON(LIVE, content);
      for (const d of await listPrefix(DRAFT)) if (d.pathname === DRAFT) await delKey(d.url);
      const bks = await listPrefix(BK);
      if (bks.length > MAX_BACKUPS) {
        bks.sort((a, c) => (a.pathname < c.pathname ? -1 : 1));
        for (const x of bks.slice(0, bks.length - MAX_BACKUPS)) await delKey(x.url);
      }
      return res.status(200).json({ ok: true, savedAt: new Date().toISOString() });
    } catch (e) {
      return res.status(500).json({ error: "Save failed", detail: String((e && e.message) || e) });
    }
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "method not allowed" });
}
