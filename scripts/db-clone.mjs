/* ============================================================
   COPY ONE POSTGRES DATABASE INTO ANOTHER
   Run:  node scripts/db-clone.mjs           (copy)
         node scripts/db-clone.mjs --fresh   (drop target tables first)

   Source : DATABASE_URL         (your local database)
   Target : TARGET_DATABASE_URL  (the hosted one — add it to .env.local)

   ── Why not scripts/db-migrate.mjs ───────────────────────────
   That one reads data/gng.db, which still holds the pre-blob
   /uploads/... paths. Running it against the hosted database would
   reinstate every one of those and undo the blob migration — the site
   would come up with broken images and nothing would look obviously
   wrong in the logs.

   Local Postgres is the source of truth now, so this copies from
   there. It refuses to run if the two URLs are the same.

   Reads nothing but the source; the target is only written. Safe to
   re-run: tables that already contain rows are skipped unless --fresh.
   ============================================================ */
import nextEnv from '@next/env'
import pg from 'pg'
import { SCHEMA_SQL, TABLES } from '../lib/pg-schema.mjs'

nextEnv.loadEnvConfig(process.cwd())

const FRESH = process.argv.includes('--fresh')
const SRC = process.env.DATABASE_URL
const DST = process.env.TARGET_DATABASE_URL

if (!SRC) {
  console.error('DATABASE_URL missing (the SOURCE — your local database).')
  process.exit(1)
}
if (!DST) {
  console.error(
    'TARGET_DATABASE_URL missing.\n' +
      'Add the hosted connection string to .env.local as:\n' +
      '  TARGET_DATABASE_URL="postgresql://..."\n' +
      'Use the POOLED string if the provider offers one.'
  )
  process.exit(1)
}

const hostOf = (u) => { try { return new URL(u).host + new URL(u).pathname } catch { return '(unparseable)' } }
if (hostOf(SRC) === hostOf(DST)) {
  console.error('Source and target are the same database. Refusing to run.')
  process.exit(1)
}

console.log(`source : ${hostOf(SRC)}`)
console.log(`target : ${hostOf(DST)}\n`)

const src = new pg.Pool({ connectionString: SRC })
// Hosted providers terminate non-TLS connections; the CA isn't worth
// pinning for a one-off copy, so accept the provider's certificate.
const dst = new pg.Pool({ connectionString: DST, ssl: { rejectUnauthorized: false } })
const q = (id) => `"${id.replace(/"/g, '""')}"`

try {
  if (FRESH) {
    console.log('--fresh: dropping target tables')
    for (const t of [...TABLES].reverse()) await dst.query(`DROP TABLE IF EXISTS ${q(t)} CASCADE`)
  }

  console.log('applying schema to target...')
  await dst.query(SCHEMA_SQL)

  const report = []
  for (const table of TABLES) {
    const { rows } = await src.query(`SELECT * FROM ${q(table)} ORDER BY id`)
    const existing = await dst.query(`SELECT count(*)::int AS n FROM ${q(table)}`)

    if (existing.rows[0].n > 0) {
      report.push([table, rows.length, existing.rows[0].n, 'SKIPPED — target not empty'])
      continue
    }
    if (rows.length === 0) {
      report.push([table, 0, 0, 'empty'])
      continue
    }

    const cols = Object.keys(rows[0])
    const insert = `INSERT INTO ${q(table)} (${cols.map(q).join(', ')})
                    VALUES (${cols.map((_, i) => `$${i + 1}`).join(', ')})`

    const client = await dst.connect()
    try {
      await client.query('BEGIN')
      for (const row of rows) {
        await client.query(
          insert,
          cols.map((c) => {
            const v = row[c]
            // json/jsonb columns come back as objects; pg needs them
            // re-serialised or it binds them as "[object Object]".
            if (v !== null && typeof v === 'object' && !(v instanceof Date) && !Buffer.isBuffer(v)) {
              return JSON.stringify(v)
            }
            return v
          })
        )
      }
      await client.query('COMMIT')
    } catch (e) {
      await client.query('ROLLBACK')
      throw new Error(`${table}: ${e.message}`)
    } finally {
      client.release()
    }

    // Identity counters still sit at 1 after inserting explicit ids, so
    // the first row added through /admin would collide. Same trap as the
    // original SQLite migration.
    if (cols.includes('id') && table !== 'site_settings') {
      await dst.query(
        `SELECT setval(pg_get_serial_sequence($1, 'id'),
                       GREATEST((SELECT COALESCE(MAX(id), 0) FROM ${q(table)}), 1))`,
        [table]
      )
    }

    const after = await dst.query(`SELECT count(*)::int AS n FROM ${q(table)}`)
    report.push([table, rows.length, after.rows[0].n, after.rows[0].n === rows.length ? 'OK' : 'MISMATCH'])
  }

  console.log('\n  table                    source  target  status')
  console.log('  ' + '-'.repeat(58))
  for (const [t, s, d, status] of report) {
    console.log(`  ${t.padEnd(24)} ${String(s).padStart(6)}  ${String(d).padStart(6)}  ${status}`)
  }

  // The whole point of using Postgres as the source: these must be blob
  // URLs, not /uploads/ paths.
  const leftovers = await dst.query(`
    SELECT count(*)::int AS n FROM (
      SELECT image AS v FROM products
      UNION ALL SELECT gallery::text FROM products
      UNION ALL SELECT visual FROM solutions
      UNION ALL SELECT "heroVideo" FROM solutions
      UNION ALL SELECT visual FROM industrial_solutions
      UNION ALL SELECT "heroVideo" FROM industrial_solutions
      UNION ALL SELECT visual FROM industries
      UNION ALL SELECT "heroVideo" FROM industries
      UNION ALL SELECT "heroVideos"::text FROM site_settings
    ) t WHERE v LIKE '%/uploads/%'
  `)
  const blobs = await dst.query(`
    SELECT count(*)::int AS n FROM products WHERE image LIKE '%blob.vercel-storage.com%'
  `)
  console.log(`\n  /uploads/ paths in target : ${leftovers.rows[0].n}  ${leftovers.rows[0].n === 0 ? '(good)' : '(BAD — blob migration was undone)'}`)
  console.log(`  product images on blob    : ${blobs.rows[0].n}`)
  console.log('\nDone. Point Vercel\'s DATABASE_URL at the target and deploy.')
} catch (e) {
  console.error('\nFAILED:', e.message)
  process.exitCode = 1
} finally {
  await src.end()
  await dst.end()
}
