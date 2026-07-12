# kül — hot sauce site + content studio

A small-batch hot sauce brand site with a built-in, password-protected **content studio** at `/admin`. Everything on the public page — text, colours, sauces, prices, heat levels, footer links — is editable from the studio, and changes go **live instantly** for all visitors.

## How it works

- **`index.html`** — the public site. A thin loader that fetches live content from `/api/content` and renders it with `site.js`. If the API is unreachable (e.g. opened as a local file) it falls back to built-in defaults, so it always looks right.
- **`site.js`** — the single rendering engine. Powers both the public site *and* the studio's live preview, so they can never drift apart.
- **`admin.html`** — the studio. Log in with your password, edit any section with a live preview, and hit **Publish**.
- **`api/login.js`** — checks your password and sets a signed, HTTP-only session cookie.
- **`api/content.js`** — serves content publicly (GET) and saves it (POST, admin-only) to Vercel Blob storage.
- **`content.json`** — the default/seed content (used as a fallback and a reference).

## Deploy (GitHub + Vercel)

1. Push this folder to a **GitHub** repository.
2. In **Vercel** → *Add New… → Project* → import the repo. Framework preset: **Other** (no build step needed).
3. Add **Blob storage**: Project → *Storage* → *Create* → **Blob** → connect it to the project. This automatically adds the `BLOB_READ_WRITE_TOKEN` environment variable.
4. Add an environment variable **`ADMIN_PASSWORD`** = a password of your choice (Project → *Settings → Environment Variables*).
5. **Redeploy** so the new variables take effect.

That's it. Your site is at `https://<project>.vercel.app` and the studio at `https://<project>.vercel.app/admin`.

## Editing content

Go to `/admin`, enter your `ADMIN_PASSWORD`, edit anything, and click **Publish** (or press ⌘/Ctrl-S). Changes are saved to Blob storage and served to every visitor immediately — no redeploy required.

- **Export / Import** — download the current content as `content.json`, or load one back in (handy for backups).
- **Reset** — restore the original default content in the editor (nothing changes live until you Publish).

## Environment variables

| Variable | Required | Set by | Purpose |
|---|---|---|---|
| `ADMIN_PASSWORD` | Yes | You | The studio login password. |
| `BLOB_READ_WRITE_TOKEN` | Yes | Vercel (auto) | Added automatically when you connect a Blob store. |

## Local preview

Opening `index.html` directly in a browser shows the site with default content (the API isn't running locally). To test the studio and API locally, run `npx vercel dev` with the Vercel CLI and a linked project.

## Security notes

- The session cookie is an HMAC derived from your password — it can't be forged without knowing the password.
- The cookie is `HttpOnly`, `Secure`, `SameSite=Strict`.
- Choose a strong `ADMIN_PASSWORD`. To rotate it, change the env var in Vercel and redeploy; existing sessions are invalidated automatically.
