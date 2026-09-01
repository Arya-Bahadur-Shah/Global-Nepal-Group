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

const INDUSTRIAL_SOLUTION_DEFAULT_PRODUCTS = {
  'labeling-solutions': [
    {
      slug: 'label-printer',
      name: 'Label Printer',
      model: 'Zebra ZD230 / Direct Thermal',
      brandSlug: 'zebra',
      industrialSolutionSlug: 'labeling-solutions',
      shortDescription: 'A compact, reliable, and cost-effective direct thermal/thermal transfer label printer for low- to mid-volume barcode printing.',
      description: 'The Zebra ZD230 thermal transfer printer gives you reliable operation and basic features at an affordable price.',
      image: '/assets/hardware/zebra-zd230.jpg',
      specs: { 'Print Speed': 'Up to 6 in./152 mm per sec', 'Resolution': '203 dpi' },
    },
    {
      slug: 'industrial-printer',
      name: 'Industrial Printer',
      model: 'Zebra ZT411 / Heavy Industrial',
      brandSlug: 'zebra',
      industrialSolutionSlug: 'labeling-solutions',
      shortDescription: 'An industrial label printer designed for high-performance printing in demanding environments.',
      description: 'Keep your critical manufacturing operations running efficiently with Zebra ZT411 Series industrial printers.',
      image: '/assets/hardware/zebra-zt411.jpg',
      specs: { 'Print Speed': 'Up to 14 in./356 mm per sec', 'Resolution': '203, 300, or 600 dpi' },
    },
    {
      slug: 'hid-rfid-encoder',
      name: 'HID RFID Tag Encoder & Printer',
      model: 'HID LinQR Enterprise',
      brandSlug: 'hid',
      industrialSolutionSlug: 'labeling-solutions',
      shortDescription: 'High-durability RFID tag encoding and barcode labeling station for asset compliance.',
      description: 'Industrial UHF RFID tag encoding and barcode label printer designed for heavy manufacturing tracking.',
      image: '/assets/hardware/hid-linqtrack.jpg',
      specs: { 'Frequency': 'UHF 860-960 MHz', 'Protocol': 'EPC Class 1 Gen 2' },
    },
    {
      slug: 'rynan-inline-labeler',
      name: 'Rynan B1040 Inline Applicator',
      model: 'Rynan B1040 Touch',
      brandSlug: 'rynan',
      industrialSolutionSlug: 'labeling-solutions',
      shortDescription: 'High-speed inkjet label coding and package applicator integrated onto packaging lines.',
      description: 'Compact high-resolution thermal inkjet coder designed for high-speed carton and product labeling.',
      image: '/assets/hardware/rynan-b1040.jpg',
      specs: { 'Throw Distance': 'Up to 5 mm', 'Print Height': '12.7 mm / 0.5 inch' },
    },
  ],
  'secondary-labeling-solutions': [
    {
      slug: 'outer-carton-labeler',
      name: 'Rynan Carton Printing System',
      model: 'Rynan P54 Piezo Inkjet',
      brandSlug: 'rynan',
      industrialSolutionSlug: 'secondary-labeling-solutions',
      shortDescription: 'High-resolution piezo inkjet system for outer carton printing and barcode barcode coding.',
      description: 'Designed for secondary packaging lines needing large character barcodes and graphics directly on outer corrugated boxes.',
      image: '/assets/hardware/rynan-b1040.jpg',
      specs: { 'Print Height': '54 mm', 'Max Speed': '60 m/min' },
    },
    {
      slug: 'pallet-labeling-station',
      name: 'Zebra Pallet Print & Apply',
      model: 'Zebra ZT411 Pallet Station',
      brandSlug: 'zebra',
      industrialSolutionSlug: 'secondary-labeling-solutions',
      shortDescription: 'Automated dual-side shipping pallet barcode printer and applicator.',
      description: 'Heavy duty industrial pallet labeling system ensuring GS1-128 shipping compliance.',
      image: '/assets/hardware/zebra-zt411.jpg',
      specs: { 'Resolution': '300 dpi', 'Media Width': '4 in' },
    },
  ],
  'packaging-machine-solutions': [
    {
      slug: 'thermal-inkjet-coder',
      name: 'Rynan R10H Batch Coder',
      model: 'Rynan R10H Handheld/Inline',
      brandSlug: 'rynan',
      industrialSolutionSlug: 'packaging-machine-solutions',
      shortDescription: 'Compact TIJ batch coder printing dates, lot numbers, and QR codes on flexible packaging.',
      description: 'Ultra-portable thermal inkjet printer easily mounted on vertical form-fill-seal packaging machines.',
      image: '/assets/hardware/rynan-b1040.jpg',
      specs: { 'Print Speed': '76 m/min at 300 dpi', 'Inks': 'Solvent & Water-Based' },
    },
    {
      slug: 'laser-marking-system',
      name: 'Yesmark Fiber Laser System',
      model: 'Yesmark KF200 Laser Coder',
      brandSlug: 'yesmark',
      industrialSolutionSlug: 'packaging-machine-solutions',
      shortDescription: 'Permanent high-speed fiber laser marking system for PET, glass, and foil packaging.',
      description: 'Zero-consumable laser date & serial coder for high-speed filling lines.',
      image: '/assets/hardware/yesmark-y100.jpg',
      specs: { 'Laser Power': '20W / 30W Fiber', 'Cooling': 'Air Cooled' },
    },
  ],
  'factory-traceability': [
    {
      slug: 'label-printer',
      name: 'Label Printer',
      model: 'Zebra ZD230 / Direct Thermal',
      brandSlug: 'zebra',
      industrialSolutionSlug: 'factory-traceability',
      shortDescription: 'A compact, reliable, and cost-effective direct thermal/thermal transfer label printer for low- to mid-volume barcode printing.',
      description: 'The Zebra ZD230 thermal transfer printer gives you reliable operation and basic features at an affordable price.',
      image: '/assets/hardware/zebra-zd230.jpg',
      specs: { 'Print Speed': 'Up to 6 in./152 mm per sec', 'Resolution': '203 dpi' },
    },
    {
      slug: 'ai-vision-inspection-camera',
      name: 'Yesmark AI Vision Verifier',
      model: 'Yesmark Y100 Industrial Vision',
      brandSlug: 'yesmark',
      industrialSolutionSlug: 'factory-traceability',
      shortDescription: 'Optical character verification camera verifying printed barcodes and ejecting defect packages.',
      description: 'Automated 100% inline quality audit system flagging misprinted serials.',
      image: '/assets/hardware/yesmark-y100.jpg',
      specs: { 'Line Speed': 'Up to 1,000 items/min', 'Resolution': '5 MP' },
    },
    {
      slug: 'rugged-rfid-asset-tag',
      name: 'HID Heavy Duty Asset Tag',
      model: 'HID LinQR UHF',
      brandSlug: 'hid',
      industrialSolutionSlug: 'factory-traceability',
      shortDescription: 'Industrial RFID tracking tag for factory equipment and pallet containers.',
      description: 'Rugged UHF transponder built for extreme factory conditions.',
      image: '/assets/hardware/hid-linqtrack.jpg',
      specs: { 'Read Range': '15m', 'Enclosure': 'IP69K' },
    },
  ],
  'industrial-vision-systems': [
    {
      slug: 'ai-vision-inspection-camera',
      name: 'Yesmark AI Vision System',
      model: 'Yesmark Y100 Industrial Vision',
      brandSlug: 'yesmark',
      industrialSolutionSlug: 'industrial-vision-systems',
      shortDescription: 'AI-powered optical character verification camera for automated defect ejection and inline label validation.',
      description: 'Eliminate print errors and defective packaging with the Yesmark Y100 high-speed camera.',
      image: '/assets/hardware/yesmark-y100.jpg',
      specs: { 'Line Speed': '1,000 items/min', 'Resolution': '5 MP' },
    },
    {
      slug: 'zebra-vision-smart-camera',
      name: 'Zebra VS20 Smart Camera',
      model: 'Zebra VS20 Machine Vision',
      brandSlug: 'zebra',
      industrialSolutionSlug: 'industrial-vision-systems',
      shortDescription: 'Compact industrial smart camera for barcode verification and part inspection.',
      description: 'High performance fixed industrial scanner and machine vision sensor.',
      image: '/assets/hardware/zebra-l10.jpg',
      specs: { 'Sensor': '1.2 MP Mono/Color', 'Illumination': 'Red/White LED' },
    },
  ],
  'machinery-fleet-iot': [
    {
      slug: 'rugged-rfid-asset-tag',
      name: 'HID Machinery RFID Transponder',
      model: 'HID LinQR Heavy Duty',
      brandSlug: 'hid',
      industrialSolutionSlug: 'machinery-fleet-iot',
      shortDescription: 'Industrial RFID and telemetry transponder built for heavy equipment and site tracking.',
      description: 'Extremely durable UHF RFID tags designed for harsh outdoor machinery environments.',
      image: '/assets/hardware/hid-linqtrack.jpg',
      specs: { 'Read Distance': '15 meters', 'Enclosure': 'IP69K' },
    },
    {
      slug: 'zebra-rugged-tablet-terminal',
      name: 'Zebra ET40 Fleet Tablet',
      model: 'Zebra ET40 Enterprise',
      brandSlug: 'zebra',
      industrialSolutionSlug: 'machinery-fleet-iot',
      shortDescription: 'Heavy equipment telematics & operator login rugged tablet terminal.',
      description: 'Dust and water-resistant Android tablet for heavy machinery telematics.',
      image: '/assets/hardware/zebra-l10.jpg',
      specs: { 'Display': '10 inch', 'Protection': 'IP65' },
    },
  ],
  'smart-warehouse-automation': [
    {
      slug: 'rfid-dock-door-portal',
      name: 'Zebra FX9600 RFID Portal',
      model: 'Zebra FX9600 Portal',
      brandSlug: 'zebra',
      industrialSolutionSlug: 'smart-warehouse-automation',
      shortDescription: 'Multi-antenna RFID portal reader for instant pallet load scanning at warehouse doors.',
      description: 'Scans hundreds of RFID tags simultaneously without line of sight.',
      image: '/assets/hardware/hid-linqtrack.jpg',
      specs: { 'Antenna Ports': '8-Port', 'Protocol': 'EPC Gen 2' },
    },
    {
      slug: 'hid-warehouse-tag',
      name: 'HID Pallet Tag Transponder',
      model: 'HID SlimTag UHF',
      brandSlug: 'hid',
      industrialSolutionSlug: 'smart-warehouse-automation',
      shortDescription: 'Low profile UHF RFID tag for reusable plastic crates and wood pallets.',
      description: 'Durable barcode & RFID tag for automated warehouse yard putaway.',
      image: '/assets/hardware/hid-linqtrack.jpg',
      specs: { 'Frequency': '860-960 MHz', 'Mounting': 'Rivets/Adhesive' },
    },
  ],
}

export async function getProductsByIndustrialSolution(solutionSlug) {
  const rows = await db.prepare('SELECT * FROM products WHERE "industrialSolutionSlug" = ? ORDER BY id ASC').all(solutionSlug)
  if (rows.length > 0) return rows.map(mapProduct)
  
  const defaults = INDUSTRIAL_SOLUTION_DEFAULT_PRODUCTS[solutionSlug]
  if (defaults && defaults.length > 0) return defaults

  const allProducts = await getProducts()
  if (allProducts.length > 0) {
    return allProducts.map((p) => ({
      ...p,
      industrialSolutionSlug: solutionSlug,
    }))
  }

  return INDUSTRIAL_SOLUTION_DEFAULT_PRODUCTS['factory-traceability'].map((p) => ({
    ...p,
    industrialSolutionSlug: solutionSlug,
  }))
}

export async function getIndustrialSolutionProduct(solutionSlug, productSlug) {
  const row = await db.prepare('SELECT * FROM products WHERE ("industrialSolutionSlug" = ? OR "brandSlug" = ?) AND slug = ?').get(solutionSlug, solutionSlug, productSlug)
  if (row) return mapProduct(row)
  const prods = await getProductsByIndustrialSolution(solutionSlug)
  return prods.find((p) => p.slug === productSlug) || null
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
