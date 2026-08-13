/* ============================================================
   UPLOAD HELPER
   Used by admin server actions to persist a File from submitted
   FormData. Returns the URL (or path) to store on the record, or null
   if no file was submitted — the caller then keeps whatever value
   already exists.

   ── Why blob storage, not the local disk ─────────────────────
   Writing into public/uploads/ worked locally and could never work in
   production, for two separate reasons:

   1. Vercel's filesystem is read-only, so fs.writeFile throws and the
      admin panel simply cannot accept a file.
   2. public/uploads/ is gitignored, so anything written there never
      reaches a deployment anyway. That's why database rows pointing at
      /uploads/... render as broken images on the live site.

   Blob storage sidesteps both: the file lives outside the server and
   outside the repo, and the URL works from anywhere.

   ── The local fallback ───────────────────────────────────────
   With no BLOB_READ_WRITE_TOKEN this still writes to disk, so `npm run
   dev` works without any cloud setup. But a file saved that way is
   LOCAL ONLY -- it won't exist in production, which is the exact
   problem above. Set the token (the same one as production is fine)
   whenever you're adding content that needs to ship.
   ============================================================ */
import { promises as fs } from 'fs'
import path from 'path'
import { put } from '@vercel/blob'

const LIMITS = {
  image: { maxBytes: 8 * 1024 * 1024, mimePrefix: 'image/', label: 'Image' },
  video: { maxBytes: 200 * 1024 * 1024, mimePrefix: 'video/', label: 'Video' },
  doc: { maxBytes: 20 * 1024 * 1024, mimePrefixes: ['application/pdf', 'application/', 'image/'], label: 'Brochure/spec sheet' },
}

export function blobConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN)
}

function extFromName(name) {
  const ext = path.extname(name || '').toLowerCase()
  return /^\.[a-z0-9]{1,6}$/.test(ext) ? ext : ''
}

/* @param {File} file - from formData.get('field')
   @param {string} subdir - e.g. 'brands', 'products', 'solutions', 'posts'
   @param {'image'|'video'|'doc'} kind
   @returns {Promise<{path:string|null, error:string|null}>} */
export async function saveUpload(file, subdir, kind = 'image') {
  if (!file || typeof file === 'string' || !file.size) return { path: null, error: null }

  const limit = LIMITS[kind]
  const okMime = limit.mimePrefix
    ? file.type?.startsWith(limit.mimePrefix)
    : limit.mimePrefixes.some((p) => file.type?.startsWith(p))
  if (!okMime) return { path: null, error: `${limit.label}: unsupported file type (${file.type || 'unknown'}).` }
  if (file.size > limit.maxBytes) {
    return { path: null, error: `${limit.label}: file too large (max ${Math.round(limit.maxBytes / (1024 * 1024))}MB).` }
  }

  const ext = extFromName(file.name) || (file.type?.split('/')[1] ? `.${file.type.split('/')[1]}` : '')
  const key = `${subdir}/${crypto.randomUUID()}${ext}`

  if (blobConfigured()) {
    try {
      const { url } = await put(key, file, {
        access: 'public',
        // Our own UUID already guarantees uniqueness; the default random
        // suffix would only make the stored name differ from `key`, which
        // makes the migration map and any manual lookup harder to follow.
        addRandomSuffix: false,
        contentType: file.type || undefined,
        // Explicit, because `vercel env pull` leaves a VERCEL_OIDC_TOKEN
        // in .env.local and the SDK then tries OIDC auth, which isn't
        // enabled for the development environment and fails. Naming the
        // token keeps local uploads working. On Vercel this variable is
        // present too, so nothing changes there.
        token: process.env.BLOB_READ_WRITE_TOKEN,
      })
      return { path: url, error: null }
    } catch (e) {
      return { path: null, error: `${limit.label}: upload failed (${e.message}).` }
    }
  }

  // Local development fallback — see the note at the top of this file.
  const dir = path.join(process.cwd(), 'public', 'uploads', subdir)
  await fs.mkdir(dir, { recursive: true })
  const buffer = Buffer.from(await file.arrayBuffer())
  await fs.writeFile(path.join(dir, path.basename(key)), buffer)
  return { path: `/uploads/${key}`, error: null }
}

/* Multiple files (e.g. a product gallery <input multiple>). Skips empty
   slots (formData.getAll includes a phantom empty File when no file is
   chosen in some browsers). */
export async function saveUploads(files, subdir, kind = 'image') {
  const paths = []
  const errors = []
  for (const file of files || []) {
    if (!file || !file.size) continue
    const { path, error } = await saveUpload(file, subdir, kind)
    if (error) errors.push(error)
    else if (path) paths.push(path)
  }
  return { paths, errors }
}
