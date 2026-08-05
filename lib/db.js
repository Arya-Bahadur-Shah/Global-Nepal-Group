/* ============================================================
   DATABASE LAYER
   SQLite via Node's built-in `node:sqlite` (no native build step —
   this avoids the node-gyp/Visual Studio toolchain that a package
   like better-sqlite3 would require on a machine without it).

   File lives at /data/gng.db (gitignored). On first run the schema
   is created and, if empty, seeded from the original /content/*.json
   files so nothing already on the site is lost. From then on this
   database — not the JSON files — is the source of truth; the admin
   panel (see lib/admin-data.js) reads and writes it directly.
   ============================================================ */
import { DatabaseSync } from 'node:sqlite'
import path from 'path'
import fs from 'fs'
import bcrypt from 'bcryptjs'

import siteSeed from '@/content/site.json'
import brandsSeed from '@/content/brands.json'
import productsSeed from '@/content/products.json'
import solutionsSeed from '@/content/solutions.json'
import industrialSolutionsSeed from '@/content/industrial-solutions.json'
import industriesSeed from '@/content/industries.json'
import hardwareSeed from '@/content/hardware.json'
import clientsSeed from '@/content/clients.json'
import postsSeed from '@/content/posts.json'
import { postContent } from '@/content/post-content.js'

const DB_PATH = path.join(process.cwd(), 'data', 'gng.db')

function openDb() {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true })
  const conn = new DatabaseSync(DB_PATH)
  conn.exec('PRAGMA journal_mode = WAL')
  conn.exec('PRAGMA foreign_keys = ON')
  return conn
}

// Survive Next.js dev-mode module reloads (one physical connection per process).
const g = globalThis
export const db = g.__gngDb || (g.__gngDb = openDb())

function migrate() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS site_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      company TEXT, tagline TEXT, heroKicker TEXT, heroHeadline TEXT, heroSub TEXT,
      ctaPrimary TEXT, ctaSecondary TEXT, mission TEXT, address TEXT, phone TEXT, email TEXT,
      stats TEXT
    );
    CREATE TABLE IF NOT EXISTS brands (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL, name TEXT, logo TEXT, focus TEXT, blurb TEXT,
      heroImage TEXT, heroVideo TEXT
    );
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      brandSlug TEXT NOT NULL, slug TEXT NOT NULL, name TEXT, model TEXT,
      shortDescription TEXT, description TEXT, image TEXT,
      gallery TEXT, specs TEXT, specSheet TEXT, specSheetVariants TEXT,
      tag TEXT,
      UNIQUE(brandSlug, slug)
    );
    CREATE TABLE IF NOT EXISTS solutions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL, name TEXT, logo TEXT, tag TEXT, summary TEXT, description TEXT,
      features TEXT, modules TEXT, advantages TEXT, hardwareUsed TEXT, visual TEXT
    );
    CREATE TABLE IF NOT EXISTS industrial_solutions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL, name TEXT, logo TEXT, tag TEXT, summary TEXT, description TEXT,
      features TEXT, modules TEXT, advantages TEXT, hardwareUsed TEXT, visual TEXT
    );
    CREATE TABLE IF NOT EXISTS industries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL, name TEXT, logo TEXT, tag TEXT, summary TEXT, description TEXT,
      features TEXT, modules TEXT, advantages TEXT, hardwareUsed TEXT, clients TEXT, visual TEXT, heroVideo TEXT
    );
    CREATE TABLE IF NOT EXISTS hardware_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL, category TEXT, name TEXT, description TEXT, image TEXT,
      chips TEXT, specs TEXT, specSheet TEXT
    );
    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT, logo TEXT
    );
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL, title TEXT, category TEXT, date TEXT, excerpt TEXT,
      image TEXT, body TEXT
    );
    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT, email TEXT, phone TEXT, msg TEXT, type TEXT DEFAULT 'contact', at TEXT
    );
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `)
}
migrate()
// Idempotent column additions for databases created before this migration
try { db.exec('ALTER TABLE products ADD COLUMN tag TEXT') } catch {}
try { db.exec('ALTER TABLE solutions ADD COLUMN heroVideo TEXT') } catch {}
try { db.exec('ALTER TABLE industrial_solutions ADD COLUMN heroVideo TEXT') } catch {}
// Home hero loop videos + editable About Us content (managed from /admin/home and /admin/about)
try { db.exec('ALTER TABLE site_settings ADD COLUMN heroVideos TEXT') } catch {}
try { db.exec('ALTER TABLE site_settings ADD COLUMN aboutHeadline TEXT') } catch {}
try { db.exec('ALTER TABLE site_settings ADD COLUMN aboutValues TEXT') } catch {}
try { db.exec('ALTER TABLE site_settings ADD COLUMN aboutTimeline TEXT') } catch {}


const count = (table) => db.prepare(`SELECT COUNT(*) AS c FROM ${table}`).get().c
const j = (v) => JSON.stringify(v ?? null)

/* Turn a legacy structured blog post (intro + sections[]/benefits[] + cta from
   content/post-content.js) into one Markdown document, so every post — old and
   new — is edited through the same single "body" field in the admin. */
function postToMarkdown(slug) {
  const full = postContent[slug]
  if (!full) return ''
  const parts = [full.intro?.trim()]
  for (const section of full.sections || []) {
    parts.push(`## ${section.heading}\n\n${section.body?.trim() ?? ''}`)
    if (section.benefits?.length) {
      parts.push(section.benefits.map((b) => `- **${b.title}** — ${b.desc}`).join('\n'))
    }
  }
  if (full.cta) parts.push(`## ${full.cta.heading}\n\n${full.cta.body?.trim() ?? ''}`)
  return parts.filter(Boolean).join('\n\n')
}

function seed() {
  if (count('site_settings') === 0) {
    db.prepare(`
      INSERT INTO site_settings (id, company, tagline, heroKicker, heroHeadline, heroSub, ctaPrimary, ctaSecondary, mission, address, phone, email, stats)
      VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      siteSeed.company, siteSeed.tagline, siteSeed.heroKicker, siteSeed.heroHeadline, siteSeed.heroSub,
      siteSeed.ctaPrimary, siteSeed.ctaSecondary, siteSeed.mission, siteSeed.address, siteSeed.phone, siteSeed.email,
      j(siteSeed.stats)
    )
  }

  if (count('brands') === 0) {
    const stmt = db.prepare(`INSERT INTO brands (slug, name, logo, focus, blurb, heroImage, heroVideo) VALUES (?, ?, ?, ?, ?, ?, ?)`)
    for (const b of brandsSeed) {
      if (!b.slug) continue
      stmt.run(b.slug, b.name ?? null, b.logo ?? null, b.focus ?? null, b.blurb ?? null, b.heroImage ?? null, b.heroVideo ?? null)
    }
  }

  if (count('products') === 0) {
    const stmt = db.prepare(`
      INSERT INTO products (brandSlug, slug, name, model, shortDescription, description, image, gallery, specs, specSheet, specSheetVariants)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    for (const p of productsSeed) {
      if (!p.slug || !p.brandSlug) continue
      stmt.run(
        p.brandSlug, p.slug, p.name ?? null, p.model ?? null, p.shortDescription ?? null, p.description ?? null,
        p.image ?? null, j(p.gallery ?? []), j(p.specs ?? {}), p.specSheet ?? null, j(p.specSheetVariants ?? null)
      )
    }
  }

  if (count('solutions') === 0) {
    const stmt = db.prepare(`
      INSERT INTO solutions (slug, name, logo, tag, summary, description, features, modules, advantages, hardwareUsed, visual)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    for (const s of solutionsSeed) {
      if (!s.slug) continue
      stmt.run(
        s.slug, s.name ?? null, s.logo ?? null, s.tag ?? null, s.summary ?? null, s.description ?? null,
        j(s.features ?? []), j(s.modules ?? null), j(s.advantages ?? []), j(s.hardwareUsed ?? []), s.visual ?? null
      )
    }
  }

  if (count('industrial_solutions') === 0) {
    const stmt = db.prepare(`
      INSERT INTO industrial_solutions (slug, name, logo, tag, summary, description, features, modules, advantages, hardwareUsed, visual)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    for (const s of industrialSolutionsSeed) {
      if (!s.slug) continue
      stmt.run(
        s.slug, s.name ?? null, s.logo ?? null, s.tag ?? null, s.summary ?? null, s.description ?? null,
        j(s.features ?? []), j(s.modules ?? null), j(s.advantages ?? []), j(s.hardwareUsed ?? []), s.visual ?? null
      )
    }
  }

  if (count('industries') === 0) {
    const stmt = db.prepare(`
      INSERT INTO industries (slug, name, logo, tag, summary, description, features, modules, advantages, hardwareUsed, clients, visual, heroVideo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    for (const ind of industriesSeed) {
      if (!ind.slug) continue
      stmt.run(
        ind.slug, ind.name ?? null, ind.logo ?? null, ind.tag ?? null, ind.summary ?? null, ind.description ?? null,
        j(ind.features ?? []), j(ind.modules ?? null), j(ind.advantages ?? []), j(ind.hardwareUsed ?? []),
        j(ind.clients ?? []), ind.visual ?? null, ind.heroVideo ?? null
      )
    }
  }

  if (count('hardware_categories') === 0) {
    const stmt = db.prepare(`
      INSERT INTO hardware_categories (slug, category, name, description, image, chips, specs, specSheet)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)
    for (const h of hardwareSeed) {
      if (!h.slug) continue
      stmt.run(h.slug, h.category ?? null, h.name ?? null, h.description ?? null, h.image ?? null, j(h.chips ?? []), j(h.specs ?? {}), h.specSheet ?? null)
    }
  }

  if (count('clients') === 0) {
    const stmt = db.prepare(`INSERT INTO clients (name, logo) VALUES (?, ?)`)
    for (const c of clientsSeed) stmt.run(c.name ?? null, c.logo ?? null)
  }

  if (count('admins') === 0) {
    const email = process.env.ADMIN_EMAIL
    const hash  = process.env.ADMIN_PASSWORD_HASH
    if (email && hash) {
      db.prepare(`INSERT OR IGNORE INTO admins (email, password_hash, created_at) VALUES (?, ?, ?)`)
        .run(email.trim().toLowerCase(), hash, new Date().toISOString())
    }
  }

  if (count('posts') === 0) {
    const stmt = db.prepare(`INSERT INTO posts (slug, title, category, date, excerpt, image, body) VALUES (?, ?, ?, ?, ?, ?, ?)`)
    for (const p of postsSeed) {
      if (!p.slug) continue
      stmt.run(p.slug, p.title ?? null, p.category ?? null, p.date ?? null, p.excerpt ?? null, p.image ?? null, postToMarkdown(p.slug))
    }
  }
}
seed()
