/* ============================================================
   ADMIN DATA LAYER
   CRUD helpers used by the /admin server actions. lib/content.js
   (read-only, used by the public site) stays separate from this
   file (read/write, used only by the admin panel).
   ============================================================ */
import { db } from '@/lib/db'

const parseJson = (v, fallback) => {
  if (v == null) return fallback
  try { return JSON.parse(v) } catch { return fallback }
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

function runSafe(fn) {
  try {
    return { ok: true, result: fn() }
  } catch (err) {
    if (String(err.message).includes('UNIQUE constraint failed')) {
      return { ok: false, error: 'That slug is already in use — choose a different one.' }
    }
    return { ok: false, error: err.message }
  }
}

/* ---------------------------------------------------------------- Brands */
export function listBrands() {
  return db.prepare('SELECT * FROM brands ORDER BY id DESC').all()
}
export function getBrandById(id) {
  return db.prepare('SELECT * FROM brands WHERE id = ?').get(id) || null
}
export function createBrand(data) {
  return runSafe(() =>
    db.prepare(`INSERT INTO brands (slug, name, logo, focus, blurb, heroImage, heroVideo) VALUES (?, ?, ?, ?, ?, ?, ?)`)
      .run(data.slug, data.name, data.logo, data.focus, data.blurb, data.heroImage, data.heroVideo)
  )
}
export function updateBrand(id, data) {
  return runSafe(() =>
    db.prepare(`UPDATE brands SET slug=?, name=?, logo=?, focus=?, blurb=?, heroImage=?, heroVideo=? WHERE id=?`)
      .run(data.slug, data.name, data.logo, data.focus, data.blurb, data.heroImage, data.heroVideo, id)
  )
}
export function deleteBrand(id) {
  return runSafe(() => db.prepare('DELETE FROM brands WHERE id = ?').run(id))
}

/* -------------------------------------------------------------- Products */
export function listProducts() {
  return db.prepare('SELECT * FROM products ORDER BY id DESC').all().map(mapProduct)
}
export function getProductById(id) {
  return mapProduct(db.prepare('SELECT * FROM products WHERE id = ?').get(id))
}
function mapProduct(row) {
  if (!row) return null
  return { ...row, gallery: parseJson(row.gallery, []), specs: parseJson(row.specs, {}), specSheetVariants: parseJson(row.specSheetVariants, null) }
}
export function createProduct(data) {
  return runSafe(() =>
    db.prepare(`
      INSERT INTO products (brandSlug, slug, name, model, shortDescription, description, image, gallery, specs, specSheet, specSheetVariants, tag)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(data.brandSlug, data.slug, data.name, data.model, data.shortDescription, data.description, data.image,
      j(data.gallery ?? []), j(data.specs ?? {}), data.specSheet, j(data.specSheetVariants ?? null), data.tag ?? null)
  )
}
export function updateProduct(id, data) {
  return runSafe(() =>
    db.prepare(`
      UPDATE products SET brandSlug=?, slug=?, name=?, model=?, shortDescription=?, description=?, image=?, gallery=?, specs=?, specSheet=?, specSheetVariants=?, tag=?
      WHERE id=?
    `).run(data.brandSlug, data.slug, data.name, data.model, data.shortDescription, data.description, data.image,
      j(data.gallery ?? []), j(data.specs ?? {}), data.specSheet, j(data.specSheetVariants ?? null), data.tag ?? null, id)
  )
}
export function deleteProduct(id) {
  return runSafe(() => db.prepare('DELETE FROM products WHERE id = ?').run(id))
}

/* ------------------------------------------------------------- Solutions */
export function listSolutions() {
  return db.prepare('SELECT * FROM solutions ORDER BY id DESC').all().map(mapSolution)
}
export function getSolutionById(id) {
  return mapSolution(db.prepare('SELECT * FROM solutions WHERE id = ?').get(id))
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
export function createSolution(data) {
  return runSafe(() =>
    db.prepare(`
      INSERT INTO solutions (slug, name, logo, tag, summary, description, features, modules, advantages, hardwareUsed, visual, heroVideo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(data.slug, data.name, data.logo, data.tag, data.summary, data.description,
      j(data.features ?? []), j(data.modules ?? null), j(data.advantages ?? []), j(data.hardwareUsed ?? []), data.visual, data.heroVideo ?? null)
  )
}
export function updateSolution(id, data) {
  return runSafe(() =>
    db.prepare(`
      UPDATE solutions SET slug=?, name=?, logo=?, tag=?, summary=?, description=?, features=?, modules=?, advantages=?, hardwareUsed=?, visual=?, heroVideo=?
      WHERE id=?
    `).run(data.slug, data.name, data.logo, data.tag, data.summary, data.description,
      j(data.features ?? []), j(data.modules ?? null), j(data.advantages ?? []), j(data.hardwareUsed ?? []), data.visual, data.heroVideo ?? null, id)
  )
}
export function deleteSolution(id) {
  return runSafe(() => db.prepare('DELETE FROM solutions WHERE id = ?').run(id))
}

/* -------------------------------------------------- Industrial Solutions */
export function listIndustrialSolutions() {
  return db.prepare('SELECT * FROM industrial_solutions ORDER BY id DESC').all().map(mapSolution)
}
export function getIndustrialSolutionById(id) {
  return mapSolution(db.prepare('SELECT * FROM industrial_solutions WHERE id = ?').get(id))
}
export function createIndustrialSolution(data) {
  return runSafe(() =>
    db.prepare(`
      INSERT INTO industrial_solutions (slug, name, logo, tag, summary, description, features, modules, advantages, hardwareUsed, visual, heroVideo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(data.slug, data.name, data.logo, data.tag, data.summary, data.description,
      j(data.features ?? []), j(data.modules ?? null), j(data.advantages ?? []), j(data.hardwareUsed ?? []), data.visual, data.heroVideo ?? null)
  )
}
export function updateIndustrialSolution(id, data) {
  return runSafe(() =>
    db.prepare(`
      UPDATE industrial_solutions SET slug=?, name=?, logo=?, tag=?, summary=?, description=?, features=?, modules=?, advantages=?, hardwareUsed=?, visual=?, heroVideo=?
      WHERE id=?
    `).run(data.slug, data.name, data.logo, data.tag, data.summary, data.description,
      j(data.features ?? []), j(data.modules ?? null), j(data.advantages ?? []), j(data.hardwareUsed ?? []), data.visual, data.heroVideo ?? null, id)
  )
}
export function deleteIndustrialSolution(id) {
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
export function listIndustries() {
  return db.prepare('SELECT * FROM industries ORDER BY id DESC').all().map(mapIndustry)
}
export function getIndustryById(id) {
  return mapIndustry(db.prepare('SELECT * FROM industries WHERE id = ?').get(id))
}
export function createIndustry(data) {
  return runSafe(() =>
    db.prepare(`
      INSERT INTO industries (slug, name, logo, tag, summary, description, features, modules, advantages, hardwareUsed, clients, visual, heroVideo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(data.slug, data.name, data.logo, data.tag, data.summary, data.description,
      j(data.features ?? []), j(data.modules ?? null), j(data.advantages ?? []), j(data.hardwareUsed ?? []),
      j(data.clients ?? []), data.visual, data.heroVideo ?? null)
  )
}
export function updateIndustry(id, data) {
  return runSafe(() =>
    db.prepare(`
      UPDATE industries SET slug=?, name=?, logo=?, tag=?, summary=?, description=?, features=?, modules=?, advantages=?, hardwareUsed=?, clients=?, visual=?, heroVideo=?
      WHERE id=?
    `).run(data.slug, data.name, data.logo, data.tag, data.summary, data.description,
      j(data.features ?? []), j(data.modules ?? null), j(data.advantages ?? []), j(data.hardwareUsed ?? []),
      j(data.clients ?? []), data.visual, data.heroVideo ?? null, id)
  )
}
export function deleteIndustry(id) {
  return runSafe(() => db.prepare('DELETE FROM industries WHERE id = ?').run(id))
}

/* ------------------------------------------------------------------ Posts */
export function listPosts() {
  return db.prepare('SELECT * FROM posts ORDER BY date DESC').all()
}
export function getPostById(id) {
  return db.prepare('SELECT * FROM posts WHERE id = ?').get(id) || null
}
export function createPost(data) {
  return runSafe(() =>
    db.prepare(`INSERT INTO posts (slug, title, category, date, excerpt, image, body) VALUES (?, ?, ?, ?, ?, ?, ?)`)
      .run(data.slug, data.title, data.category, data.date, data.excerpt, data.image, data.body)
  )
}
export function updatePost(id, data) {
  return runSafe(() =>
    db.prepare(`UPDATE posts SET slug=?, title=?, category=?, date=?, excerpt=?, image=?, body=? WHERE id=?`)
      .run(data.slug, data.title, data.category, data.date, data.excerpt, data.image, data.body, id)
  )
}
export function deletePost(id) {
  return runSafe(() => db.prepare('DELETE FROM posts WHERE id = ?').run(id))
}

/* ------------------------------------------------------------------ Leads */
export function listLeads() {
  return db.prepare('SELECT * FROM leads ORDER BY id DESC').all()
}
export function createLead({ name, email, phone, msg, type }) {
  const at = new Date().toISOString()
  db.prepare(`INSERT INTO leads (name, email, phone, msg, type, at) VALUES (?, ?, ?, ?, ?, ?)`)
    .run(name, email, phone ?? '', msg, type === 'demo' ? 'demo' : 'contact', at)
  return at
}
export function deleteLead(id) {
  return runSafe(() => db.prepare('DELETE FROM leads WHERE id = ?').run(id))
}

/* ------------------------------------------------------------- Dashboard */
export function getCounts() {
  const c = (t) => db.prepare(`SELECT COUNT(*) AS c FROM ${t}`).get().c
  return {
    brands: c('brands'),
    products: c('products'),
    solutions: c('solutions'),
    industrialSolutions: c('industrial_solutions'),
    industries: c('industries'),
    posts: c('posts'),
    leads: c('leads')
  }
}

/* --------------------------------------------------------------- Admins */
export function listAdmins() {
  return db.prepare('SELECT id, email, created_at FROM admins ORDER BY id ASC').all()
}
export function getAdminByEmail(email) {
  return db.prepare('SELECT * FROM admins WHERE email = ?').get(String(email).trim().toLowerCase()) || null
}
export function createAdmin(email, passwordHash) {
  return runSafe(() =>
    db.prepare(`INSERT INTO admins (email, password_hash, created_at) VALUES (?, ?, ?)`)
      .run(String(email).trim().toLowerCase(), passwordHash, new Date().toISOString())
  )
}
export function updateAdminPassword(email, newHash) {
  return runSafe(() =>
    db.prepare(`UPDATE admins SET password_hash = ? WHERE email = ?`)
      .run(newHash, String(email).trim().toLowerCase())
  )
}
export function deleteAdmin(id) {
  return runSafe(() => db.prepare('DELETE FROM admins WHERE id = ?').run(id))
}
