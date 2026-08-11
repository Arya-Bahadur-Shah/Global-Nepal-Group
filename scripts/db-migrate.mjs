/* ============================================================
   ONE-OFF: COPY THE SQLITE CMS DATABASE INTO POSTGRES
   Run:  node scripts/db-migrate.mjs
         node scripts/db-migrate.mjs --fresh     (drop and rebuild)

   Copies the LIVE data out of data/gng.db -- not the seed files in
   content/*.json. Those seeds are the original shipped defaults; the
   database has since been edited through /admin, and 17 rows point at
   uploaded files that only exist because of those edits. Re-seeding
   would quietly undo all of it.

   Safe to run while the site is still on SQLite: this only reads from
   SQLite and writes to Postgres. Nothing about the running app changes
   until lib/db.js is switched over.
   ============================================================ */
import nextEnv from '@next/env'
import pg from 'pg'
import { DatabaseSync } from 'node:sqlite'
import path from 'node:path'
import { SCHEMA_SQL, JSON_COLUMNS, TABLES } from '../lib/pg-schema.mjs'

nextEnv.loadEnvConfig(process.cwd())

const FRESH = process.argv.includes('--fresh')
const SQLITE_PATH = path.join(process.cwd(), 'data', 'gng.db')

const url = process.env.DATABASE_URL
if (!url) {
  console.error('DATABASE_URL missing from .env.local')
  process.exit(1)
}

const pool = new pg.Pool({ connectionString: url })
// Read-only: this script must never be able to damage the source of truth.
const sqlite = new DatabaseSync(`file:${SQLITE_PATH.replace(/\\/g, '/')}?mode=ro`, { readOnly: true })

const q = (id) => `"${id.replace(/"/g, '""')}"`

async function main() {
  const client = await pool.connect()
  try {
    if (FRESH) {
      console.log('--fresh: dropping existing tables')
      for (const t of [...TABLES].reverse()) {
        await client.query(`DROP TABLE IF EXISTS ${q(t)} CASCADE`)
      }
    }

    console.log('applying schema...')
    await client.query(SCHEMA_SQL)

    /* PREFLIGHT: compare column sets before inserting anything.
       The live SQLite database has drifted from the CREATE statements in
       db.js -- three columns were added by later ALTER TABLEs that were
       never folded back in. Discovering that mid-insert gives you a
       cryptic "column does not exist" halfway through a table; this
       reports every mismatch at once, before touching any data. */
    const drift = []
    for (const table of TABLES) {
      let sqliteCols
      try {
        sqliteCols = sqlite.prepare(`PRAGMA table_info(${q(table)})`).all().map((r) => r.name)
      } catch {
        continue
      }
      const pgRes = await client.query(
        `SELECT column_name FROM information_schema.columns
         WHERE table_schema = 'public' AND table_name = $1`,
        [table]
      )
      const pgCols = new Set(pgRes.rows.map((r) => r.column_name))
      const missing = sqliteCols.filter((c) => !pgCols.has(c))
      if (missing.length) drift.push(`  ${table}: Postgres is missing ${missing.join(', ')}`)
    }
    if (drift.length) {
      console.error('\nSCHEMA MISMATCH — nothing was copied:\n' + drift.join('\n'))
      console.error('\nAdd these columns to lib/pg-schema.mjs and re-run with --fresh.')
      process.exit(1)
    }
    console.log('preflight: every SQLite column has a Postgres home')

    let grandTotal = 0
    const report = []

    for (const table of TABLES) {
      // Read every row from SQLite.
      let rows
      try {
        rows = sqlite.prepare(`SELECT * FROM ${q(table)}`).all()
      } catch {
        report.push([table, 0, 0, 'not present in SQLite'])
        continue
      }

      const existing = await client.query(`SELECT count(*)::int AS n FROM ${q(table)}`)
      if (existing.rows[0].n > 0) {
        report.push([table, rows.length, existing.rows[0].n, 'SKIPPED - already has rows'])
        continue
      }

      if (rows.length === 0) {
        report.push([table, 0, 0, 'empty'])
        continue
      }

      const cols = Object.keys(rows[0])
      const jsonCols = new Set(JSON_COLUMNS[table] || [])
      const colSql = cols.map(q).join(', ')
      const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ')
      const insert = `INSERT INTO ${q(table)} (${colSql}) VALUES (${placeholders})`

      await client.query('BEGIN')
      try {
        for (const row of rows) {
          const values = cols.map((c) => {
            const v = row[c]
            if (v === undefined) return null
            if (jsonCols.has(c)) {
              // SQLite stored these as TEXT containing JSON. Postgres wants
              // valid JSON for a jsonb column; pass NULL rather than letting
              // an empty string or malformed value abort the whole table.
              if (v === null || v === '') return null
              if (typeof v === 'object') return JSON.stringify(v)
              try {
                JSON.parse(v)
                return v
              } catch {
                console.warn(`  ! ${table}.${c}: unparseable JSON, storing NULL`)
                return null
              }
            }
            // node:sqlite returns INTEGER columns as BigInt, which pg cannot bind.
            if (typeof v === 'bigint') return Number(v)
            return v
          })
          await client.query(insert, values)
        }
        await client.query('COMMIT')
      } catch (e) {
        await client.query('ROLLBACK')
        throw new Error(`${table}: ${e.message}`)
      }

      // THE SEQUENCE TRAP: rows were inserted with their original ids, so the
      // identity counter is still at 1. Without this, the next row added
      // through /admin collides with an existing id and fails -- and it would
      // only surface the first time someone adds content, long after the
      // migration "succeeded".
      if (cols.includes('id') && table !== 'site_settings') {
        await client.query(
          `SELECT setval(
             pg_get_serial_sequence($1, 'id'),
             GREATEST((SELECT COALESCE(MAX(id), 0) FROM ${q(table)}), 1)
           )`,
          [table]
        )
      }

      const after = await client.query(`SELECT count(*)::int AS n FROM ${q(table)}`)
      grandTotal += after.rows[0].n
      report.push([table, rows.length, after.rows[0].n, after.rows[0].n === rows.length ? 'OK' : 'MISMATCH'])
    }

    console.log('\n  table                    sqlite  postgres  status')
    console.log('  ' + '-'.repeat(58))
    for (const [t, s, p, status] of report) {
      console.log(`  ${t.padEnd(24)} ${String(s).padStart(6)}  ${String(p).padStart(8)}  ${status}`)
    }
    console.log(`\n  ${grandTotal} rows now in Postgres`)

    // Prove the sequences are usable: the next id must be past every row.
    console.log('\n  sequence check (next id vs current max):')
    for (const t of TABLES) {
      if (t === 'site_settings') continue
      const r = await client.query(
        `SELECT COALESCE(MAX(id), 0)::int AS maxid,
                (SELECT last_value FROM ${q(t + '_id_seq')})::int AS seq
         FROM ${q(t)}`
      ).catch(() => null)
      if (r) {
        const ok = r.rows[0].seq >= r.rows[0].maxid
        console.log(`    ${t.padEnd(24)} max=${String(r.rows[0].maxid).padStart(4)}  seq=${String(r.rows[0].seq).padStart(4)}  ${ok ? 'ok' : 'WILL COLLIDE'}`)
      }
    }
  } finally {
    client.release()
    await pool.end()
    sqlite.close()
  }
}

main().catch((e) => {
  console.error('\nMIGRATION FAILED:', e.message)
  process.exit(1)
})
