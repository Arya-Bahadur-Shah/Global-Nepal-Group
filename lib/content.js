/* ============================================================
   CONTENT LAYER
   Single source of truth for all editable content — now backed by
   the SQLite database in lib/db.js (seeded once from the original
   /content/*.json). Every exported function keeps its original name
   and shape so existing pages don't need to change.
   Admin create/update/delete lives in lib/admin-data.js.
   ============================================================ */
import { db } from '@/lib/db'

const parseJson = (v, fallback) => {
  if (v == null) return fallback
  try { return JSON.parse(v) } catch { return fallback }
}

function mapProduct(row) {
  if (!row) return null
  return {
    ...row,
    gallery: parseJson(row.gallery, []),
    specs: parseJson(row.specs, {}),
    specSheetVariants: parseJson(row.specSheetVariants, null),
  }
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

function mapHardwareCategory(row) {
  if (!row) return null
  return { ...row, chips: parseJson(row.chips, []), specs: parseJson(row.specs, {}) }
}

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

/* Defaults used when the admin has not (yet) customised these fields, so the
   Home hero and About page render exactly as before until edited. */
export const DEFAULT_HERO_VIDEOS = [
  '/assets/video/hero-loop-primary.mp4',
  '/assets/video/hero-loop-alt.mp4',
]
export const DEFAULT_ABOUT_HEADLINE = 'The identity layer for Nepali industry'
export const DEFAULT_ABOUT_VALUES = [
  ['Digital transformation', 'We replace paper trails and guesswork with systems that show the truth of an operation in real time.'],
  ['Raising productivity', 'Identification done right removes recounts, recalls and rework — output rises without adding shifts.'],
  ['One-click traceability', 'Every unit, batch and pallet carries an identity. One click shows where it came from and where it went.'],
  ['Built & supported in Nepal', 'Our engineers install, train and maintain locally. When a line stops, we are hours away, not continents.'],
]
export const DEFAULT_ABOUT_TIMELINE = [
  ['Founded', 'Global Nepal Group begins bringing identification technology to Nepali industry.'],
  ['Partnerships', 'Authorized to distribute Zebra, Rynan, HID and Yesmark across Nepal.'],
  ['Software', 'Launches Cubix, Activ, Trackline and On Service — traceability built in-house.'],
  ['Today', 'Trusted by leading banks and government departments nationwide.'],
]

export function getSite() {
  const row = db.prepare('SELECT * FROM site_settings WHERE id = 1').get()
  if (!row) return {}
  const heroVideos = parseJson(row.heroVideos, null)
  const aboutValues = parseJson(row.aboutValues, null)
  const aboutTimeline = parseJson(row.aboutTimeline, null)
  return {
    ...row,
    stats: parseJson(row.stats, []),
    heroVideos: Array.isArray(heroVideos) && heroVideos.length ? heroVideos : DEFAULT_HERO_VIDEOS,
    aboutHeadline: row.aboutHeadline || DEFAULT_ABOUT_HEADLINE,
    aboutValues: Array.isArray(aboutValues) && aboutValues.length ? aboutValues : DEFAULT_ABOUT_VALUES,
    aboutTimeline: Array.isArray(aboutTimeline) && aboutTimeline.length ? aboutTimeline : DEFAULT_ABOUT_TIMELINE,
  }
}

export function getBrands() {
  return db.prepare('SELECT * FROM brands ORDER BY id ASC').all()
}

export function getSolutions() {
  return db.prepare('SELECT * FROM solutions ORDER BY id ASC').all().map(mapSolution)
}

export function getIndustrialSolutions() {
  return db.prepare('SELECT * FROM industrial_solutions ORDER BY id ASC').all().map(mapSolution)
}

export function getHardware() {
  return db.prepare('SELECT * FROM hardware_categories ORDER BY id ASC').all().map(mapHardwareCategory)
}

export function getIndustries() {
  return db.prepare('SELECT * FROM industries ORDER BY id ASC').all().map(mapIndustry)
}

export function getIndustry(slug) {
  return mapIndustry(db.prepare('SELECT * FROM industries WHERE slug = ?').get(slug))
}

export function getClients() {
  return db.prepare('SELECT * FROM clients ORDER BY id ASC').all()
}

/* ---- Industry <-> Client logo resolution ----
   Industry records store client company names as plain strings. This
   resolves each name to the matching client record (with its logo) from
   the clients table, tolerating small naming differences such as
   "Dept." vs "Department" or a trailing "(Govt. of Nepal)". Falls back
   to a null logo (the UI shows an initial badge) when no match is found. */
const CLIENT_TOKEN_SKIP = new Set(['of', 'the', 'and'])

function clientTokens(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/\bdept\b/g, 'department')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(' ')
    .filter((t) => t && !CLIENT_TOKEN_SKIP.has(t))
}

export function getClientsForIndustry(industry) {
  const names = industry?.clients || []
  const all = getClients()
  const indexed = all.map((c) => ({ client: c, tokens: clientTokens(c.name) }))
  return names.map((name) => {
    const target = clientTokens(name)
    let best = null
    let bestScore = 0
    for (const { client, tokens } of indexed) {
      if (!tokens.length || !target.length) continue
      const overlap = target.filter((t) => tokens.includes(t)).length
      const score = overlap / Math.max(target.length, tokens.length)
      if (score > bestScore) {
        bestScore = score
        best = client
      }
    }
    return { name, logo: bestScore >= 0.5 && best ? best.logo : null }
  })
}

export function getPosts() {
  return db.prepare('SELECT * FROM posts ORDER BY date DESC').all()
}

/* ---- Hardware catalog (Brand -> Products -> Product) ---- */
export function getProducts() {
  return db.prepare('SELECT * FROM products ORDER BY id ASC').all().map(mapProduct)
}

/* Products that have a tag set — used by the homepage PrinterShowcase.
   Joins in the brand logo so slides can show the brand badge. */
export function getProductsForShowcase() {
  const products = db.prepare('SELECT * FROM products WHERE tag IS NOT NULL AND tag != "" ORDER BY id ASC').all().map(mapProduct)
  const brands = db.prepare('SELECT slug, name, logo FROM brands').all()
  const brandMap = Object.fromEntries(brands.map((b) => [b.slug, b]))
  return products.map((p) => ({
    ...p,
    brandName: brandMap[p.brandSlug]?.name ?? p.brandSlug,
    brandLogo: brandMap[p.brandSlug]?.logo ?? null,
  }))
}

export function getBrand(brandSlug) {
  return db.prepare('SELECT * FROM brands WHERE slug = ?').get(brandSlug) || null
}

export function getProductsByBrand(brandSlug) {
  return db.prepare('SELECT * FROM products WHERE brandSlug = ? ORDER BY id ASC').all(brandSlug).map(mapProduct)
}

export function getProduct(brandSlug, productSlug) {
  return mapProduct(db.prepare('SELECT * FROM products WHERE brandSlug = ? AND slug = ?').get(brandSlug, productSlug))
}

/* ---- Solutions <-> Hardware cross-linking ---- */
export function getSolution(slug) {
  return mapSolution(db.prepare('SELECT * FROM solutions WHERE slug = ?').get(slug))
}

export function getIndustrialSolution(slug) {
  return mapSolution(db.prepare('SELECT * FROM industrial_solutions WHERE slug = ?').get(slug))
}

export function getHardwareForSolution(solution) {
  if (!solution?.hardwareUsed?.length) return []
  const products = getProducts()
  return solution.hardwareUsed
    .map((name) => products.find((p) => p.name.toLowerCase().startsWith(name.toLowerCase())))
    .filter(Boolean)
}

/* ---- Blog post body (Markdown) ---- */
export function getPost(slug) {
  return db.prepare('SELECT * FROM posts WHERE slug = ?').get(slug) || null
}
