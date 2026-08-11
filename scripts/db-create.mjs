/* ============================================================
   CREATE THE DATABASE named in DATABASE_URL, if it doesn't exist.
   Run:  node scripts/db-create.mjs

   Connects to the server's default `postgres` database using the same
   credentials, because you can't connect to a database in order to
   create it. Safe to re-run -- it checks first and does nothing if the
   database is already there.
   ============================================================ */
import nextEnv from '@next/env'
import pg from 'pg'

nextEnv.loadEnvConfig(process.cwd())

const url = process.env.DATABASE_URL
if (!url) {
  console.log('DATABASE_URL missing from .env.local')
  process.exit(1)
}

const target = new URL(url)
const dbName = target.pathname.slice(1)
if (!dbName) {
  console.log('DATABASE_URL has no database name in its path')
  process.exit(1)
}

// Same server and credentials, but pointed at the always-present
// `postgres` maintenance database.
const admin = new URL(url)
admin.pathname = '/postgres'

const client = new pg.Client({ connectionString: admin.toString(), connectionTimeoutMillis: 6000 })
try {
  await client.connect()
  const { rows } = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName])
  if (rows.length) {
    console.log(`Database "${dbName}" already exists — nothing to do.`)
  } else {
    // CREATE DATABASE can't take a bound parameter, so the identifier is
    // quoted instead. dbName comes from our own .env.local, not user input.
    await client.query(`CREATE DATABASE "${dbName.replace(/"/g, '""')}"`)
    console.log(`Created database "${dbName}".`)
  }
} catch (e) {
  console.log('FAILED:', e.message)
  process.exitCode = 1
} finally {
  await client.end().catch(() => {})
}
