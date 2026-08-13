/* ============================================================
   MOVE public/uploads/ INTO BLOB STORAGE
   Run:  node scripts/blob-migrate.mjs --dry     (report only)
         node scripts/blob-migrate.mjs           (upload + rewrite)

   Needs BLOB_READ_WRITE_TOKEN in .env.local (create a Blob store in
   the Vercel dashboard; it hands you the token).

   Two halves, in this order:
     1. Upload every file under public/uploads/ and build a map of
        local path -> blob URL.
     2. Rewrite every database column that stores one of those paths.

   Order matters: nothing is rewritten until its file is safely
   uploaded, so an interrupted run leaves the site working on local
   paths rather than pointing at URLs that don't exist yet.

   Safe to re-run. Files already uploaded are overwritten with the same
   key, and rows already rewritten no longer match a /uploads/ path.
   The local files are never deleted -- keep them until you've
   confirmed the live site renders.
   ============================================================ */
import nextEnv from '@next/env'
import pg from 'pg'
import { put } from '@vercel/blob'
import fs from 'node:fs'
import path from 'node:path'

nextEnv.loadEnvConfig(process.cwd())

const DRY = process.argv.includes('--dry')
const UPLOADS = path.join(process.cwd(), 'public', 'uploads')

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL missing from .env.local')
  process.exit(1)
}
if (!DRY && !process.env.BLOB_READ_WRITE_TOKEN) {
  console.error(
    'BLOB_READ_WRITE_TOKEN missing from .env.local.\n' +
      'Create a Blob store at vercel.com -> your project -> Storage, then copy the token.\n' +
      'Run with --dry to see what would happen without it.'
  )
  process.exit(1)
}

/* Every column that can hold an uploaded file's path. Kept explicit
   rather than discovered, so a new column is a deliberate addition
   here instead of silently missing its files. */
const COLUMNS = [
  ['products', 'image'],
  ['products', 'gallery'],          // JSON array of paths
  ['brands', 'logo'],
  ['brands', 'heroImage'],
  ['brands', 'heroVideo'],
  ['solutions', 'logo'],
  ['solutions', 'visual'],
  ['solutions', 'heroVideo'],
  ['industrial_solutions', 'logo'],
  ['industrial_solutions', 'visual'],
  ['industrial_solutions', 'video'],
  ['industrial_solutions', 'heroVideo'],
  ['industries', 'logo'],
  ['industries', 'visual'],
  ['industries', 'heroVideo'],
  ['hardware_categories', 'image'],
  ['clients', 'logo'],
  ['posts', 'image'],
  ['site_settings', 'heroVideo'],
  ['site_settings', 'heroVideos'],  // JSON array of paths
]
const JSON_COLUMNS = new Set(['products.gallery', 'site_settings.heroVideos'])

const MIME = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.pdf': 'application/pdf',
}

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walk(p, out)
    else out.push(p)
  }
  return out
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const q = (id) => `"${id.replace(/"/g, '""')}"`

try {
  /* ---- 1. Upload ---- */
  const files = walk(UPLOADS)
  console.log(`${files.length} file(s) under public/uploads/\n`)

  const map = new Map() // "/uploads/sub/name.ext" -> blob URL
  let uploadedBytes = 0

  for (const abs of files) {
    const rel = '/uploads/' + path.relative(UPLOADS, abs).replace(/\\/g, '/')
    const size = fs.statSync(abs).size
    if (DRY) {
      console.log(`  would upload  ${(size / 1024 / 1024).toFixed(2).padStart(7)} MB  ${rel}`)
      map.set(rel, '(dry-run)')
      continue
    }
    const key = rel.replace(/^\/uploads\//, '')
    const { url } = await put(key, fs.readFileSync(abs), {
      access: 'public',
      addRandomSuffix: false,
      contentType: MIME[path.extname(abs).toLowerCase()] || undefined,
      // Passed explicitly. `vercel env pull` leaves a VERCEL_OIDC_TOKEN
      // behind, which makes the SDK attempt OIDC auth — and OIDC isn't
      // enabled for the development environment, so it fails outright.
      // Naming the token takes that path out of the picture.
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })
    map.set(rel, url)
    uploadedBytes += size
    console.log(`  uploaded  ${(size / 1024 / 1024).toFixed(2).padStart(7)} MB  ${rel}`)
  }

  if (!DRY) console.log(`\n${(uploadedBytes / 1024 / 1024).toFixed(1)} MB uploaded\n`)

  /* ---- 2. Rewrite the database ---- */
  let rewritten = 0
  const unmatched = []

  for (const [table, column] of COLUMNS) {
    const isJson = JSON_COLUMNS.has(`${table}.${column}`)
    let rows
    try {
      rows = (await pool.query(`SELECT id, ${q(column)} AS v FROM ${q(table)}`)).rows
    } catch {
      continue // column not present in this schema
    }

    for (const row of rows) {
      if (row.v == null) continue

      if (isJson) {
        const list = typeof row.v === 'string' ? JSON.parse(row.v) : row.v
        if (!Array.isArray(list) || !list.some((v) => String(v).startsWith('/uploads/'))) continue
        const next = list.map((v) => {
          const s = String(v)
          if (!s.startsWith('/uploads/')) return v
          const url = map.get(s)
          if (!url) { unmatched.push(`${table}.${column}[${row.id}] ${s}`); return v }
          return url
        })
        if (!DRY) {
          await pool.query(`UPDATE ${q(table)} SET ${q(column)} = $1 WHERE id = $2`, [JSON.stringify(next), row.id])
        }
        rewritten++
        console.log(`  ${DRY ? 'would rewrite' : 'rewrote'}  ${table}.${column}[${row.id}]  (${next.length} entries)`)
      } else {
        const s = String(row.v)
        if (!s.startsWith('/uploads/')) continue
        const url = map.get(s)
        if (!url) { unmatched.push(`${table}.${column}[${row.id}] ${s}`); continue }
        if (!DRY) {
          await pool.query(`UPDATE ${q(table)} SET ${q(column)} = $1 WHERE id = $2`, [url, row.id])
        }
        rewritten++
        console.log(`  ${DRY ? 'would rewrite' : 'rewrote'}  ${table}.${column}[${row.id}]  ${s}`)
      }
    }
  }

  console.log(`\n${rewritten} row(s) ${DRY ? 'would be' : ''} updated`)

  if (unmatched.length) {
    console.log(`\nWARNING — ${unmatched.length} reference(s) point at a file that isn't on disk:`)
    unmatched.forEach((u) => console.log('  ' + u))
    console.log('These were left untouched. They were already broken links.')
  }

  if (DRY) console.log('\nDry run — nothing was uploaded or changed.')
  else console.log('\nDone. Verify the site renders, then public/uploads/ can be deleted.')
} catch (e) {
  console.error('\nFAILED:', e.message)
  process.exitCode = 1
} finally {
  await pool.end()
}
