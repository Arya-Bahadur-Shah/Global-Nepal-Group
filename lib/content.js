/* ============================================================
   CONTENT LAYER
   Single source of truth for all editable content, backed by the
   Postgres database in lib/db.js. Every exported function keeps its
   original name and return shape — only the calls became async when
   the database moved off SQLite.
   Admin create/update/delete lives in lib/admin-data.js.
   ============================================================ */
import { db } from '@/lib/db'

/* Accepts either a JSON string or an already-parsed value.
   Under SQLite these columns were TEXT and always arrived as strings.
   Postgres `json` columns come back already parsed, so without the
   object check every one of them would fall into JSON.parse(object),
   throw, and silently return the fallback — arrays would render empty
   with no error anywhere. */
const parseJson = (v, fallback) => {
  if (v == null) return fallback
  if (typeof v === 'object') return v
  try {
    return JSON.parse(v)
  } catch {
    return fallback
  }
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
/* Falls back to the file shipped in the repo, so the header and footer
   still render if no logo has been uploaded. */
export const DEFAULT_LOGO = '/assets/logo/gng.png'
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

export async function getSite() {
  const row = await db.prepare('SELECT * FROM site_settings WHERE id = 1').get()
  if (!row) return {}
  const heroVideos = parseJson(row.heroVideos, null)
  const aboutValues = parseJson(row.aboutValues, null)
  const aboutTimeline = parseJson(row.aboutTimeline, null)
  const logoUrl = row.logo || DEFAULT_LOGO
  return {
    ...row,
    stats: parseJson(row.stats, []),
    logo: logoUrl,
    favicon: row.favicon || logoUrl,
    copyright: row.copyright || `© 2026 ${row.company || 'Global Nepal Group'}. ${row.tagline || ''}.`,
    heroVideos: Array.isArray(heroVideos) && heroVideos.length ? heroVideos : DEFAULT_HERO_VIDEOS,
    aboutHeadline: row.aboutHeadline || DEFAULT_ABOUT_HEADLINE,
    aboutValues: Array.isArray(aboutValues) && aboutValues.length ? aboutValues : DEFAULT_ABOUT_VALUES,
    aboutTimeline: Array.isArray(aboutTimeline) && aboutTimeline.length ? aboutTimeline : DEFAULT_ABOUT_TIMELINE,
  }
}

export async function getBrands() {
  return db.prepare('SELECT * FROM brands ORDER BY id ASC').all()
}

export async function getSolutions() {
  return (await db.prepare('SELECT * FROM solutions ORDER BY id ASC').all()).map(mapSolution)
}

export async function getIndustrialSolutions() {
  return (await db.prepare('SELECT * FROM industrial_solutions ORDER BY id ASC').all()).map(mapSolution)
}

export async function getHardware() {
  return (await db.prepare('SELECT * FROM hardware_categories ORDER BY id ASC').all()).map(mapHardwareCategory)
}

export async function getIndustries() {
  return (await db.prepare('SELECT * FROM industries ORDER BY id ASC').all()).map(mapIndustry)
}

export async function getIndustry(slug) {
  return mapIndustry(await db.prepare('SELECT * FROM industries WHERE slug = ?').get(slug))
}

export async function getClients() {
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

export async function getClientsForIndustry(industry) {
  const names = industry?.clients || []
  const all = await getClients()
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

export async function getPosts() {
  return db.prepare('SELECT * FROM posts ORDER BY date DESC').all()
}

/* ---- Hardware catalog (Brand -> Products -> Product) ---- */
export async function getProducts() {
  return (await db.prepare('SELECT * FROM products ORDER BY id ASC').all()).map(mapProduct)
}

/* Products that have a tag set — used by the homepage PrinterShowcase.
   Joins in the brand logo so slides can show the brand badge. */
export async function getProductsForShowcase() {
  // Single quotes for the empty-string literal: Postgres reads "" as a
  // quoted IDENTIFIER, not a string, and errors on it. SQLite accepted both.
  const products = (
    await db.prepare("SELECT * FROM products WHERE tag IS NOT NULL AND tag != '' ORDER BY id ASC").all()
  ).map(mapProduct)
  const brands = await db.prepare('SELECT slug, name, logo FROM brands').all()
  const brandMap = Object.fromEntries(brands.map((b) => [b.slug, b]))
  return products.map((p) => ({
    ...p,
    brandName: brandMap[p.brandSlug]?.name ?? p.brandSlug,
    brandLogo: brandMap[p.brandSlug]?.logo ?? null,
  }))
}

export async function getBrand(brandSlug) {
  return (await db.prepare('SELECT * FROM brands WHERE slug = ?').get(brandSlug)) || null
}

export async function getProductsByBrand(brandSlug) {
  return (
    await db.prepare('SELECT * FROM products WHERE "brandSlug" = ? ORDER BY id ASC').all(brandSlug)
  ).map(mapProduct)
}

export async function getProduct(brandSlug, productSlug) {
  return mapProduct(
    await db.prepare('SELECT * FROM products WHERE "brandSlug" = ? AND slug = ?').get(brandSlug, productSlug)
  )
}

/* ---- Solutions <-> Hardware cross-linking ---- */
export async function getSolution(slug) {
  return mapSolution(await db.prepare('SELECT * FROM solutions WHERE slug = ?').get(slug))
}

export async function getIndustrialSolution(slug) {
  return mapSolution(await db.prepare('SELECT * FROM industrial_solutions WHERE slug = ?').get(slug))
}

export async function getHardwareForSolution(solution) {
  if (!solution?.hardwareUsed?.length) return []
  const products = await getProducts()
  return solution.hardwareUsed
    .map((name) => products.find((p) => p.name.toLowerCase().startsWith(name.toLowerCase())))
    .filter(Boolean)
}

/* ---- Blog post body (Markdown) ---- */
export async function getPost(slug) {
  return (await db.prepare('SELECT * FROM posts WHERE slug = ?').get(slug)) || null
}
