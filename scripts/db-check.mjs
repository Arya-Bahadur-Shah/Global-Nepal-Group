/* ============================================================
   POSTGRES CONNECTIVITY CHECK
   Run:  node scripts/db-check.mjs

   Reads DATABASE_URL from .env.local through Next's own env loader,
   so it resolves exactly the way the app will at runtime. Reports the
   connection's SHAPE (host, database, user) but never the password.
   ============================================================ */
// @next/env is CommonJS, so it has no named ESM exports — import the
// default and destructure.
import nextEnv from '@next/env'
import pg from 'pg'

nextEnv.loadEnvConfig(process.cwd())

const url = process.env.DATABASE_URL
if (!url) {
  console.log('DATABASE_URL: MISSING from .env.local')
  process.exit(1)
}

try {
  const u = new URL(url)
  console.log('DATABASE_URL parsed OK')
  console.log(`  host     : ${u.hostname}:${u.port || '(default)'}`)
  console.log(`  database : ${u.pathname.slice(1)}`)
  console.log(`  user     : ${u.username}`)
  console.log(`  password : ${u.password ? `(set, ${u.password.length} chars)` : '(EMPTY)'}`)
  // These characters terminate parts of a URL, so an unescaped one silently
  // truncates the credentials and produces a baffling auth error.
  const risky = [...decodeURIComponent(u.password || '')].filter((c) => '@:/#?'.includes(c))
  if (risky.length) console.log(`  WARNING  : password contains URL-special chars: ${risky.join(' ')}`)
} catch (e) {
  console.log('DATABASE_URL is not a valid URL:', e.message)
  process.exit(1)
}

const client = new pg.Client({ connectionString: url, connectionTimeoutMillis: 6000 })
try {
  await client.connect()
  const v = await client.query('SELECT version() AS v, current_database() AS db, current_user AS usr')
  console.log('\nCONNECTED')
  console.log('  server   :', v.rows[0].v.split(',')[0])
  console.log('  database :', v.rows[0].db)
  console.log('  user     :', v.rows[0].usr)
  const t = await client.query(
    "SELECT count(*)::int AS n FROM information_schema.tables WHERE table_schema = 'public'"
  )
  console.log('  existing public tables:', t.rows[0].n)
} catch (e) {
  console.log('\nCONNECTION FAILED:', e.message)
  if (/does not exist/i.test(e.message)) console.log('  -> that database has not been created yet')
  if (/password|authentication/i.test(e.message)) console.log('  -> the password in .env.local does not match')
  if (/ECONNREFUSED/i.test(e.message)) console.log('  -> nothing is listening; is the Postgres service running?')
  process.exitCode = 1
} finally {
  await client.end().catch(() => {})
}
