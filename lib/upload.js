/* ============================================================
   UPLOAD HELPER
   Used by admin server actions to persist a File from a submitted
   FormData directly to /public/uploads — no separate API route or
   third-party storage needed. Returns the public path to store on
   the record, or null if no file was submitted (caller should then
   keep whatever value already exists).
   ============================================================ */
import { promises as fs } from 'fs'
import path from 'path'

const LIMITS = {
  image: { maxBytes: 8 * 1024 * 1024, mimePrefix: 'image/', label: 'Image' },
  video: { maxBytes: 200 * 1024 * 1024, mimePrefix: 'video/', label: 'Video' },
  doc: { maxBytes: 20 * 1024 * 1024, mimePrefixes: ['application/pdf', 'application/', 'image/'], label: 'Brochure/spec sheet' },
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

  const dir = path.join(process.cwd(), 'public', 'uploads', subdir)
  await fs.mkdir(dir, { recursive: true })

  const ext = extFromName(file.name) || (file.type?.split('/')[1] ? `.${file.type.split('/')[1]}` : '')
  const filename = `${crypto.randomUUID()}${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())
  await fs.writeFile(path.join(dir, filename), buffer)

  return { path: `/uploads/${subdir}/${filename}`, error: null }
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
