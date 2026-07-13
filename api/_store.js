// Shared Vercel Blob helpers. The store is public, but blob URLs (which embed the
// random store id) are only known server-side, so keys aren't guessable by visitors.
import { put, list, del } from "@vercel/blob";

export function storageReady() {
  return !!(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
}

export async function readJSON(key) {
  try {
    const { blobs } = await list({ prefix: key });
    const b = blobs.find((x) => x.pathname === key);
    if (!b) return null;
    const r = await fetch(b.url, { cache: "no-store" });
    return r.ok ? await r.json() : null;
  } catch (e) {
    return null;
  }
}

export async function writeJSON(key, obj) {
  return put(key, JSON.stringify(obj), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

export async function listPrefix(prefix) {
  try {
    const { blobs } = await list({ prefix });
    return blobs;
  } catch (e) {
    return [];
  }
}

export async function delKey(urlOrPath) {
  try { await del(urlOrPath); } catch (e) { /* ignore */ }
}
