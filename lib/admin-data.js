/* ============================================================
   ADMIN DATA LAYER
   CRUD helpers used by the /admin server actions. lib/content.js
   (read-only, used by the public site) stays separate from this
   file (read/write, used only by the admin panel).

   Every database call is async since the move to Postgres. The SQL is
   otherwise unchanged, except that camelCase identifiers are now
   QUOTED — Postgres folds unquoted names to lower case, so an
   unquoted "brandSlug" would silently target a column that isn't
   there. See lib/pg-schema.mjs.
   ============================================================ */
import { db } from '@/lib/db'

/* Accepts a JSON string or an already-parsed value: Postgres `json`
   columns come back parsed, SQLite handed back strings. Without the
   object check every JSON field would fall through to the fallback. */
const parseJson = (v, fallback) => {
  if (v == null) return fallback
  if (typeof v === 'object') return v
  try {
    return JSON.parse(v)
  } catch {
    return fallback
  }
}
const j = (v) => JSON.stringify(v ?? null)

export function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/* ---- Plain-text <-> structured-field helpers, used by admin forms so
   specs/features/advantages can be edited as simple textareas instead of
   repeating-group widgets. ---- */

/* "Key: Value" per line -> { Key: "Value" } */
export function parseKeyValueLines(text) {
  const out = {}
  for (const line of String(text || '').split('\n')) {
    const idx = line.indexOf(':')
    if (idx < 0) continue
    const key = line.slice(0, idx).trim()
    const value = line.slice(idx + 1).trim()
    if (key) out[key] = value
  }
  return out
}
export function keyValueToLines(obj) {
  return Object.entries(obj || {}).map(([k, v]) => `${k}: ${v}`).join('\n')
}

/* Paired inputs from the SpecsEditor client component (repeated `specKey` +
   `specValue` fields, read with formData.getAll) -> { Key: "Value" }.
   Rows with a blank property name are dropped. Order is preserved because
   FormData.getAll returns values in document (row) order. */
export function parseSpecPairs(keys, values) {
  const ks = Array.isArray(keys) ? keys : keys != null ? [keys] : []
  const vs = Array.isArray(values) ? values : values != null ? [values] : []
  const out = {}
  for (let i = 0; i < ks.length; i++) {
    const key = String(ks[i] ?? '').trim()
    if (key) out[key] = String(vs[i] ?? '').trim()
  }
  return out
}

/* One value per non-empty line -> array of strings */
export function parseLines(text) {
  return String(text || '').split('\n').map((l) => l.trim()).filter(Boolean)
}
export const linesToText = (arr) => (arr || []).join('\n')

/* Repeated form values (from a multi-select picker read with formData.getAll)
   -> trimmed, de-duplicated array of strings, order preserved. */
export function cleanList(values) {
  const arr = Array.isArray(values) ? values : values != null ? [values] : []
  const seen = new Set()
  const out = []
  for (const v of arr) {
    const s = String(v ?? '').trim()
    if (s && !seen.has(s)) { seen.add(s); out.push(s) }
  }
  return out
}

/* Blank-line-separated blocks, first line = title, rest = body -> [[title, body], ...] */
export function parseBlockPairs(text) {
  return String(text || '')
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const [first, ...rest] = block.split('\n')
      return [first.trim(), rest.join(' ').trim()]
    })
}
export function blockPairsToText(pairs) {
  return (pairs || []).map(([title, body]) => `${title}\n${body}`).join('\n\n')
}

/* Wraps a write so a constraint violation becomes a message the form can
   show, rather than an unhandled error. Postgres words its unique-violation
   differently from SQLite ("duplicate key value violates unique constraint"
   vs "UNIQUE constraint failed"), so both are matched — the SQLite phrasing
   is kept in case anything still runs against the old database. */
async function runSafe(fn) {
  try {
    return { ok: true, result: await fn() }
  } catch (err) {
    const msg = String(err?.message || '')
    if (/duplicate key value|UNIQUE constraint failed/i.test(msg)) {
      return { ok: false, error: 'That slug is already in use — choose a different one.' }
    }
    return { ok: false, error: msg }
  }
}

/* ------------------------------------------------- Site (Home / About) */
/* Raw row (unmapped) — admin editors add their own fallbacks for prefill. */
export async function getSiteRaw() {
  return (await db.prepare('SELECT * FROM site_settings WHERE id = 1').get()) || null
}
/* Home hero: loop video list + hero copy. */
export async function updateHomeSettings(data) {
  return runSafe(() =>
    db.prepare(`UPDATE site_settings SET "heroSub"=?, "ctaPrimary"=?, "ctaSecondary"=?, "heroVideos"=? WHERE id=1`)
      .run(data.heroSub, data.ctaPrimary, data.ctaSecondary, j(data.heroVideos ?? []))
  )
}
/* About Us page content. */
export async function updateAboutSettings(data) {
  return runSafe(() =>
    db.prepare(`UPDATE site_settings SET "aboutHeadline"=?, mission=?, "aboutValues"=?, "aboutTimeline"=?, stats=? WHERE id=1`)
      .run(data.aboutHeadline, data.mission, j(data.aboutValues ?? []), j(data.aboutTimeline ?? []), j(data.stats ?? []))
  )
}

/* ---------------------------------------------------------------- Brands */
export async function listBrands() {
  return db.prepare('SELECT * FROM brands ORDER BY id DESC').all()
}
export async function getBrandById(id) {
  return (await db.prepare('SELECT * FROM brands WHERE id = ?').get(id)) || null
}
export async function createBrand(data) {
  return runSafe(() =>
    db.prepare(`INSERT INTO brands (slug, name, logo, focus, blurb, "heroImage", "heroVideo") VALUES (?, ?, ?, ?, ?, ?, ?)`)
      .run(data.slug, data.name, data.logo, data.focus, data.blurb, data.heroImage, data.heroVideo)
  )
}
export async function updateBrand(id, data) {
  return runSafe(() =>
    db.prepare(`UPDATE brands SET slug=?, name=?, logo=?, focus=?, blurb=?, "heroImage"=?, "heroVideo"=? WHERE id=?`)
      .run(data.slug, data.name, data.logo, data.focus, data.blurb, data.heroImage, data.heroVideo, id)
  )
}
export async function deleteBrand(id) {
  return runSafe(() => db.prepare('DELETE FROM brands WHERE id = ?').run(id))
}

/* -------------------------------------------------------------- Products */
export async function listProducts() {
  return (await db.prepare('SELECT * FROM products ORDER BY id DESC').all()).map(mapProduct)
}
export async function getProductById(id) {
  return mapProduct(await db.prepare('SELECT * FROM products WHERE id = ?').get(id))
}
function mapProduct(row) {
  if (!row) return null
  return { ...row, gallery: parseJson(row.gallery, []), specs: parseJson(row.specs, {}), specSheetVariants: parseJson(row.specSheetVariants, null) }
}
export async function createProduct(data) {
  return runSafe(() =>
    db.prepare(`
      INSERT INTO products ("brandSlug", slug, name, model, "shortDescription", description, image, gallery, specs, "specSheet", "specSheetVariants", tag)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(data.brandSlug, data.slug, data.name, data.model, data.shortDescription, data.description, data.image,
      j(data.gallery ?? []), j(data.specs ?? {}), data.specSheet, j(data.specSheetVariants ?? null), data.tag ?? null)
  )
}
export async function updateProduct(id, data) {
  return runSafe(() =>
    db.prepare(`
      UPDATE products SET "brandSlug"=?, slug=?, name=?, model=?, "shortDescription"=?, description=?, image=?, gallery=?, specs=?, "specSheet"=?, "specSheetVariants"=?, tag=?
      WHERE id=?
    `).run(data.brandSlug, data.slug, data.name, data.model, data.shortDescription, data.description, data.image,
      j(data.gallery ?? []), j(data.specs ?? {}), data.specSheet, j(data.specSheetVariants ?? null), data.tag ?? null, id)
  )
}
export async function deleteProduct(id) {
  return runSafe(() => db.prepare('DELETE FROM products WHERE id = ?').run(id))
}

/* ------------------------------------------------------------- Solutions */
export async function listSolutions() {
  return (await db.prepare('SELECT * FROM solutions ORDER BY id DESC').all()).map(mapSolution)
}
export async function getSolutionById(id) {
  return mapSolution(await db.prepare('SELECT * FROM solutions WHERE id = ?').get(id))
}
function mapSolution(row) {
  if (!row) return null
  return {
    ...row,
    features: parseJson(row.features, []),
    modules: parseJson(row.modules, null),
    advantages: parseJson(row.advantages, []),
    hardwareUsed: parseJson(row.hardwareUsed, []),
  }
}
export async function createSolution(data) {
  return runSafe(() =>
    db.prepare(`
      INSERT INTO solutions (slug, name, logo, tag, summary, description, features, modules, advantages, "hardwareUsed", visual, "heroVideo")
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(data.slug, data.name, data.logo, data.tag, data.summary, data.description,
      j(data.features ?? []), j(data.modules ?? null), j(data.advantages ?? []), j(data.hardwareUsed ?? []), data.visual, data.heroVideo ?? null)
  )
}
export async function updateSolution(id, data) {
  return runSafe(() =>
    db.prepare(`
      UPDATE solutions SET slug=?, name=?, logo=?, tag=?, summary=?, description=?, features=?, modules=?, advantages=?, "hardwareUsed"=?, visual=?, "heroVideo"=?
      WHERE id=?
    `).run(data.slug, data.name, data.logo, data.tag, data.summary, data.description,
      j(data.features ?? []), j(data.modules ?? null), j(data.advantages ?? []), j(data.hardwareUsed ?? []), data.visual, data.heroVideo ?? null, id)
  )
}
export async function deleteSolution(id) {
  return runSafe(() => db.prepare('DELETE FROM solutions WHERE id = ?').run(id))
}

/* -------------------------------------------------- Industrial Solutions */
export async function listIndustrialSolutions() {
  return (await db.prepare('SELECT * FROM industrial_solutions ORDER BY id DESC').all()).map(mapSolution)
}
export async function getIndustrialSolutionById(id) {
  return mapSolution(await db.prepare('SELECT * FROM industrial_solutions WHERE id = ?').get(id))
}
export async function createIndustrialSolution(data) {
  return runSafe(() =>
    db.prepare(`
      INSERT INTO industrial_solutions (slug, name, logo, tag, summary, description, features, modules, advantages, "hardwareUsed", visual, "heroVideo")
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(data.slug, data.name, data.logo, data.tag, data.summary, data.description,
      j(data.features ?? []), j(data.modules ?? null), j(data.advantages ?? []), j(data.hardwareUsed ?? []), data.visual, data.heroVideo ?? null)
  )
}
export async function updateIndustrialSolution(id, data) {
  return runSafe(() =>
    db.prepare(`
      UPDATE industrial_solutions SET slug=?, name=?, logo=?, tag=?, summary=?, description=?, features=?, modules=?, advantages=?, "hardwareUsed"=?, visual=?, "heroVideo"=?
      WHERE id=?
    `).run(data.slug, data.name, data.logo, data.tag, data.summary, data.description,
      j(data.features ?? []), j(data.modules ?? null), j(data.advantages ?? []), j(data.hardwareUsed ?? []), data.visual, data.heroVideo ?? null, id)
  )
}
export async function deleteIndustrialSolution(id) {
  return runSafe(() => db.prepare('DELETE FROM industrial_solutions WHERE id = ?').run(id))
}

/* ------------------------------------------------------------- Industries */
function mapIndustry(row) {
  if (!row) return null
  return {
    ...row,
    features: parseJson(row.features, []),
    modules: parseJson(row.modules, null),
    advantages: parseJson(row.advantages, []),
    hardwareUsed: parseJson(row.hardwareUsed, []),
    clients: parseJson(row.clients, []),
  }
}
export async function listIndustries() {
  return (await db.prepare('SELECT * FROM industries ORDER BY id DESC').all()).map(mapIndustry)
}
export async function getIndustryById(id) {
  return mapIndustry(await db.prepare('SELECT * FROM industries WHERE id = ?').get(id))
}
export async function createIndustry(data) {
  return runSafe(() =>
    db.prepare(`
      INSERT INTO industries (slug, name, logo, tag, summary, description, features, modules, advantages, "hardwareUsed", clients, visual, "heroVideo")
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(data.slug, data.name, data.logo, data.tag, data.summary, data.description,
      j(data.features ?? []), j(data.modules ?? null), j(data.advantages ?? []), j(data.hardwareUsed ?? []),
      j(data.clients ?? []), data.visual, data.heroVideo ?? null)
  )
}
export async function updateIndustry(id, data) {
  return runSafe(() =>
    db.prepare(`
      UPDATE industries SET slug=?, name=?, logo=?, tag=?, summary=?, description=?, features=?, modules=?, advantages=?, "hardwareUsed"=?, clients=?, visual=?, "heroVideo"=?
      WHERE id=?
    `).run(data.slug, data.name, data.logo, data.tag, data.summary, data.description,
      j(data.features ?? []), j(data.modules ?? null), j(data.advantages ?? []), j(data.hardwareUsed ?? []),
      j(data.clients ?? []), data.visual, data.heroVideo ?? null, id)
  )
}
export async function deleteIndustry(id) {
  return runSafe(() => db.prepare('DELETE FROM industries WHERE id = ?').run(id))
}

/* -------------------------------------------------------------- Clients
   Shared client/logo catalog. Industries reference clients by name; the
   public site resolves each name to the matching record's logo. Editing a
   logo here updates it everywhere that client appears. */
export async function listClients() {
  // SQLite's COLLATE NOCASE has no Postgres equivalent; LOWER() gives the
  // same case-insensitive ordering.
  return db.prepare('SELECT * FROM clients ORDER BY LOWER(name) ASC').all()
}
export async function getClientById(id) {
  return (await db.prepare('SELECT * FROM clients WHERE id = ?').get(id)) || null
}
export async function createClient(data) {
  return runSafe(() =>
    db.prepare(`INSERT INTO clients (name, logo) VALUES (?, ?)`).run(data.name, data.logo ?? null)
  )
}
export async function updateClient(id, data) {
  return runSafe(() =>
    db.prepare(`UPDATE clients SET name=?, logo=? WHERE id=?`).run(data.name, data.logo ?? null, id)
  )
}
export async function deleteClient(id) {
  return runSafe(() => db.prepare('DELETE FROM clients WHERE id = ?').run(id))
}

/* ------------------------------------------------------------------ Posts */
export async function listPosts() {
  return db.prepare('SELECT * FROM posts ORDER BY date DESC').all()
}
export async function getPostById(id) {
  return (await db.prepare('SELECT * FROM posts WHERE id = ?').get(id)) || null
}
export async function createPost(data) {
  return runSafe(() =>
    db.prepare(`INSERT INTO posts (slug, title, category, date, excerpt, image, body) VALUES (?, ?, ?, ?, ?, ?, ?)`)
      .run(data.slug, data.title, data.category, data.date, data.excerpt, data.image, data.body)
  )
}
export async function updatePost(id, data) {
  return runSafe(() =>
    db.prepare(`UPDATE posts SET slug=?, title=?, category=?, date=?, excerpt=?, image=?, body=? WHERE id=?`)
      .run(data.slug, data.title, data.category, data.date, data.excerpt, data.image, data.body, id)
  )
}
export async function deletePost(id) {
  return runSafe(() => db.prepare('DELETE FROM posts WHERE id = ?').run(id))
}

/* ------------------------------------------------------------------ Leads */
export async function listLeads() {
  return db.prepare('SELECT * FROM leads ORDER BY id DESC').all()
}
export async function createLead({ name, email, phone, msg, type }) {
  const at = new Date().toISOString()
  await db.prepare(`INSERT INTO leads (name, email, phone, msg, type, at) VALUES (?, ?, ?, ?, ?, ?)`)
    .run(name, email, phone ?? '', msg, type === 'demo' ? 'demo' : 'contact', at)
  return at
}
export async function deleteLead(id) {
  return runSafe(() => db.prepare('DELETE FROM leads WHERE id = ?').run(id))
}

/* ------------------------------------------------------------- Dashboard */
export async function getCounts() {
  /* ::int matters. COUNT(*) is a bigint, and node-postgres returns bigints
     as STRINGS to avoid precision loss — so without the cast every count
     arrives as "4" rather than 4, and arithmetic or comparisons on the
     dashboard misbehave in ways that look like data problems. */
  const { rows } = await db.query(`
    SELECT
      (SELECT COUNT(*)::int FROM brands)               AS brands,
      (SELECT COUNT(*)::int FROM products)             AS products,
      (SELECT COUNT(*)::int FROM solutions)            AS solutions,
      (SELECT COUNT(*)::int FROM industrial_solutions) AS "industrialSolutions",
      (SELECT COUNT(*)::int FROM industries)           AS industries,
      (SELECT COUNT(*)::int FROM posts)                AS posts,
      (SELECT COUNT(*)::int FROM leads)                AS leads
  `)
  return rows[0]
}

/* --------------------------------------------------------------- Admins */
export async function listAdmins() {
  return db.prepare('SELECT id, email, created_at FROM admins ORDER BY id ASC').all()
}
export async function getAdminByEmail(email) {
  return (await db.prepare('SELECT * FROM admins WHERE email = ?').get(String(email).trim().toLowerCase())) || null
}
export async function createAdmin(email, passwordHash) {
  return runSafe(() =>
    db.prepare(`INSERT INTO admins (email, password_hash, created_at) VALUES (?, ?, ?)`)
      .run(String(email).trim().toLowerCase(), passwordHash, new Date().toISOString())
  )
}
export async function updateAdminPassword(email, newHash) {
  return runSafe(() =>
    db.prepare(`UPDATE admins SET password_hash = ? WHERE email = ?`)
      .run(newHash, String(email).trim().toLowerCase())
  )
}
export async function deleteAdmin(id) {
  return runSafe(() => db.prepare('DELETE FROM admins WHERE id = ?').run(id))
}
