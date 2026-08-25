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

/* Arbitrary constant identifying the schema-setup lock below. Any two
   processes that agree on the number exclude each other; the value
   itself means nothing. */
const SCHEMA_LOCK_KEY = 4207180915

/* Schema creation runs once per process and every query waits on it.
   Storing the PROMISE rather than a boolean means concurrent first
   requests all await the same initialisation instead of racing to
   create the same tables.

   ── Why the advisory lock ────────────────────────────────────
   That promise only serialises ONE process. CREATE TABLE IF NOT EXISTS
   is not atomic in Postgres: two connections can both find the table
   missing, both try to create it, and the loser fails with

     duplicate key value violates unique constraint
     "pg_class_relname_nsp_index"

   which is a 500, not a warning. It stays invisible for as long as the
   schema is unchanged — every statement short-circuits on a table that
   already exists — and then bites the moment a new table is ADDED,
   because that is the only time two processes ever create concurrently.
   Adding form_submissions surfaced exactly this: `next build` fans out
   across worker processes and they collided on the first run.

   Production is the same shape, and worse — several serverless
   instances cold-start together on the first request after a deploy.

   An advisory lock makes the whole setup one-at-a-time across every
   process sharing the database. Whoever gets there first creates
   everything; the rest wait, then run the same statements as no-ops.

   ── It must be the TRANSACTION-scoped lock ───────────────────
   pg_advisory_xact_lock, not pg_advisory_lock. The session-scoped one
   took production down: hosted Postgres (Vercel Postgres, Neon,
   Supabase) is normally reached through a transaction-mode pooler,
   which hands a different backend to each statement. A session lock
   taken on one backend is therefore released on a backend that never
   held it — so the lock leaks and every later cold start blocks on it
   until the function times out. Public pages survived because they are
   prebuilt static HTML; every /admin page, which queries per request,
   returned 500.

   A transaction-scoped lock is held for the life of the transaction
   and released by COMMIT or ROLLBACK, which is exactly the unit a
   transaction pooler keeps on one backend. lock_timeout caps the wait
   so this can never hang a request again.

   ── And it degrades instead of failing ───────────────────────
   The lock is an optimisation — it prevents a rare collision while a
   NEW table is being created. It is not worth an outage, so if it
   cannot be taken at all the schema is applied anyway, exactly as it
   was before the lock existed. */
function initialise() {
  return (async () => {
    const client = await pool.connect()
    let locked = false
    try {
      await client.query('BEGIN')
      await client.query("SET LOCAL lock_timeout = '5s'")
      await client.query('SELECT pg_advisory_xact_lock($1)', [SCHEMA_LOCK_KEY])
      locked = true
      await applySchema(client)
      await client.query('COMMIT')
    } catch (err) {
      await client.query('ROLLBACK').catch(() => {})
      // Past the lock, so the schema statements themselves are what
      // failed — a real problem, and not something a retry would fix.
      if (locked) throw err
      console.warn('[db] advisory lock unavailable, applying schema unsynchronised:', err.message)
      await applySchema(client)
    } finally {
      client.release()
    }
  })()
}

async function applySchema(client) {
  await client.query(SCHEMA_SQL)
  // Columns added to tables that already exist — CREATE TABLE IF NOT
  // EXISTS won't touch them. Idempotent, so this is a no-op after the
  // first run.
  await client.query(MIGRATIONS_SQL)
  await seedAdminFromEnv(client)
}
/* Every query awaits this before running.

   A REJECTION IS NOT CACHED. Holding the promise is what makes
   concurrent first requests share one initialisation instead of racing
   — but if that promise ever settles rejected, a cached copy would
   re-throw for every query for the whole life of the process, turning
   one transient hiccup during a cold start into an instance that can
   never serve a page again. Clearing it lets the next request retry. */
function ready() {
  if (!g.__gngReady) {
    g.__gngReady = initialise().catch((err) => {
      g.__gngReady = null
      throw err
    })
  }
  return g.__gngReady
}

/* The one piece of seeding worth keeping: without an admin row, a fresh
   deployment has no way to log in and create one.

   ── Only when there are NO admins at all ─────────────────────
   This used to run on every process start, inserting ADMIN_EMAIL with
   ON CONFLICT DO NOTHING. That made the env-var account impossible to
   delete: removing it in /admin/settings worked, then the next cold
   start silently re-created it, and it was back on the next refresh
   with no error to explain why.

   Bootstrapping only matters when nobody can sign in. Once any admin
   exists, the table is the source of truth and this must not touch it
   — including when the account it would create is the one that was
   just deliberately removed.

   Counting and inserting share the caller's transaction, so two
   instances cold-starting together cannot both see an empty table and
   both insert. */
async function seedAdminFromEnv(client) {
  const email = process.env.ADMIN_EMAIL
  const hash = process.env.ADMIN_PASSWORD_HASH
  if (!email || !hash) return

  const { rows } = await client.query('SELECT COUNT(*)::int AS n FROM admins')
  if (rows[0].n > 0) return

  await client.query(
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
        await ready()
        const res = await pool.query(text, params)
        // node:sqlite returned undefined when nothing matched, and callers
        // rely on that being falsy — keep it rather than switching to null.
        return res.rows[0]
      },
      async all(...params) {
        await ready()
        const res = await pool.query(text, params)
        return res.rows
      },
      async run(...params) {
        await ready()
        const res = await pool.query(text, params)
        // Shaped like node:sqlite's result so callers reading `changes`
        // keep working. lastInsertRowid has no equivalent without a
        // RETURNING clause, and nothing reads it.
        return { changes: res.rowCount }
      },
    }
  },

  async exec(sql) {
    await ready()
    await pool.query(sql)
  },

  /* Escape hatch for queries needing Postgres-native syntax. */
  async query(text, params) {
    await ready()
    return pool.query(text, params)
  },
}
