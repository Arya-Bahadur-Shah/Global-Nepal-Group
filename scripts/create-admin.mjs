/* ============================================================
   CREATE OR RESET AN ADMIN ACCOUNT
   Usage: node scripts/create-admin.mjs <email> <password>
          node scripts/create-admin.mjs <email> <password> --target

   Default writes to DATABASE_URL (your local database).
   --target writes to TARGET_DATABASE_URL instead — use that for the
   hosted database, since local and production are separate copies and
   a password set in one does NOT appear in the other.

   Passwords are stored as bcrypt hashes, so an existing password can
   never be read back. Forgetting one means resetting it here.
   ============================================================ */
import nextEnv from '@next/env'
import pg from 'pg'
import bcrypt from 'bcryptjs'

nextEnv.loadEnvConfig(process.cwd())

const args = process.argv.slice(2).filter((a) => a !== '--target')
const USE_TARGET = process.argv.includes('--target')
const email = args[0]
const password = args[1]

if (!email || !password) {
  console.error('Usage: node scripts/create-admin.mjs <email> <password> [--target]')
  process.exit(1)
}
if (password.length < 8) {
  console.error('Choose a password of at least 8 characters.')
  process.exit(1)
}

const url = USE_TARGET ? process.env.TARGET_DATABASE_URL : process.env.DATABASE_URL
if (!url) {
  console.error(
    USE_TARGET
      ? 'TARGET_DATABASE_URL missing from .env.local (the hosted connection string).'
      : 'DATABASE_URL missing from .env.local'
  )
  process.exit(1)
}

const where = (() => { try { const u = new URL(url); return u.host + u.pathname } catch { return '(unparseable)' } })()
console.log(`database: ${where}${USE_TARGET ? '  [TARGET]' : '  [local]'}\n`)

const cleanEmail = email.trim().toLowerCase()
const hash = bcrypt.hashSync(password, 10)
// Hosted providers require TLS; the CA isn't worth pinning for an
// admin-management script.
const pool = new pg.Pool({
  connectionString: url,
  ...(USE_TARGET ? { ssl: { rejectUnauthorized: false } } : {}),
})

try {
  // One statement for both cases: insert, or overwrite the hash if that
  // email already has an account.
  const res = await pool.query(
    `INSERT INTO admins (email, password_hash, created_at)
     VALUES ($1, $2, $3)
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
     RETURNING id, (xmax = 0) AS inserted`,
    [cleanEmail, hash, new Date().toISOString()]
  )
  const { id, inserted } = res.rows[0]
  console.log(`${inserted ? 'Created' : 'Password reset for'} admin: ${cleanEmail} (id ${id})`)

  const all = await pool.query('SELECT email FROM admins ORDER BY id')
  console.log('\nAdmin accounts now:')
  all.rows.forEach((r) => console.log('  ' + r.email))

  console.log('\nSign in at /admin/login with that email and the password you just set.')
  console.log(
    'Note: ADMIN_EMAIL / ADMIN_PASSWORD_HASH in .env.local only seed a brand-new\n' +
      'database. They do not override an account that already exists, so there is\n' +
      'no need to change them here.'
  )
} catch (e) {
  console.error('FAILED:', e.message)
  process.exitCode = 1
} finally {
  await pool.end()
}
