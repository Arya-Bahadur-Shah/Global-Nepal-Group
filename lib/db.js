/* ============================================================
   DATABASE LAYER — POSTGRES

   Replaces the previous node:sqlite implementation. SQLite could not
   survive deployment: Vercel's filesystem is read-only, so every admin
   edit and every contact-form lead silently failed to write.

   ── The shim, and why ────────────────────────────────────────
   node:sqlite is SYNCHRONOUS (`db.prepare(sql).get()` returns a row);
   every Postgres driver is asynchronous. Rather than rewrite ~40 SQL
   statements into a different shape, `prepare()` below keeps the exact
   same surface and returns promises instead. Call sites gain an
   `await` and nothing else.

   Two things it deliberately does NOT paper over:
   - `?` placeholders are rewritten to $1, $2… positionally, so a
     literal `?` inside a SQL string would be mangled. None of our
     statements contain one; don't add one.
   - Identifiers must still be quoted by hand. Postgres folds unquoted
     names to lower case, so "brandSlug" has to stay quoted in every
     statement or it returns as `brandslug` and reads as undefined —
     blank fields, no error. See lib/pg-schema.mjs.

   ── Seeding ──────────────────────────────────────────────────
   The old file seeded from content/*.json on first run. That is gone
   on purpose: the live data diverged from those seeds long ago, so
   seeding a fresh database from them would install stale defaults that
   look plausible and quietly aren't the real content. Data comes from
   scripts/db-migrate.mjs instead. The schema is still created here so
   a brand-new database is usable.
   ============================================================ */
import pg from 'pg'
import { SCHEMA_SQL, MIGRATIONS_SQL } from '@/lib/pg-schema.mjs'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error(
    'DATABASE_URL is not set. Add it to .env.local — see .env.local.example.\n' +
      'Locally: postgresql://postgres:PASSWORD@localhost:5432/gng_db'
  )
}

/* One pool per process, cached on globalThis: Next's dev server
   re-evaluates modules on every edit, and without this each reload
   would leak another pool until Postgres refused new connections. */
const g = globalThis
export const pool =
  g.__gngPool ||
  (g.__gngPool = new pg.Pool({
    connectionString,
    // Serverless platforms open a connection per invocation; a low cap
    // stops a traffic spike exhausting the server's connection slots.
    max: Number(process.env.PGPOOL_MAX || 10),
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  }))

/* Schema creation runs once per process and every query waits on it.
   Storing the PROMISE rather than a boolean means concurrent first
   requests all await the same initialisation instead of racing to
   create the same tables. */
function initialise() {
  return (async () => {
    await pool.query(SCHEMA_SQL)
    // Columns added to tables that already exist — CREATE TABLE IF NOT
    // EXISTS won't touch them. Idempotent, so this is a no-op after the
    // first run.
    await pool.query(MIGRATIONS_SQL)
    await seedAdminFromEnv()
  })()
}
const ready = g.__gngReady || (g.__gngReady = initialise())

/* The one piece of seeding worth keeping: without an admin row, a fresh
   deployment has no way to log in and create one. */
async function seedAdminFromEnv() {
  const email = process.env.ADMIN_EMAIL
  const hash = process.env.ADMIN_PASSWORD_HASH
  if (!email || !hash) return
  await pool.query(
    `INSERT INTO admins (email, password_hash, created_at)
     VALUES ($1, $2, $3)
     ON CONFLICT (email) DO NOTHING`,
    [email.trim().toLowerCase(), hash, new Date().toISOString()]
  )
}

/* `?` -> `$1, $2, …` so existing statements carry over unchanged. */
function toPositional(sql) {
  let n = 0
  return sql.replace(/\?/g, () => `$${++n}`)
}

export const db = {
  prepare(sql) {
    const text = toPositional(sql)
    return {
      async get(...params) {
        await ready
        const res = await pool.query(text, params)
        // node:sqlite returned undefined when nothing matched, and callers
        // rely on that being falsy — keep it rather than switching to null.
        return res.rows[0]
      },
      async all(...params) {
        await ready
        const res = await pool.query(text, params)
        return res.rows
      },
      async run(...params) {
        await ready
        const res = await pool.query(text, params)
        // Shaped like node:sqlite's result so callers reading `changes`
        // keep working. lastInsertRowid has no equivalent without a
        // RETURNING clause, and nothing reads it.
        return { changes: res.rowCount }
      },
    }
  },

  async exec(sql) {
    await ready
    await pool.query(sql)
  },

  /* Escape hatch for queries needing Postgres-native syntax. */
  async query(text, params) {
    await ready
    return pool.query(text, params)
  },
}
