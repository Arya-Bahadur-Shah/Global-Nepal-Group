#!/usr/bin/env node
/**
 * Reset an admin password directly in the database.
 * Usage:
 *   node scripts/reset-password.mjs admin@example.com newpassword123
 *
 * Reads DATABASE_URL from .env.local automatically.
 */
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import bcrypt from 'bcryptjs'
import pg from 'pg'

// ── Load .env.local ──────────────────────────────────────────────────────────
try {
  const env = readFileSync('.env.local', 'utf8')
  for (const line of env.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq < 0) continue
    const key = trimmed.slice(0, eq).trim()
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
    if (!process.env[key]) process.env[key] = value
  }
} catch {
  // .env.local not found — rely on environment variables already set
}

const [, , email, newPassword] = process.argv

if (!email || !newPassword) {
  console.error('Usage: node scripts/reset-password.mjs <email> <new-password>')
  process.exit(1)
}

if (newPassword.length < 8) {
  console.error('Error: password must be at least 8 characters.')
  process.exit(1)
}

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  console.error('Error: DATABASE_URL is not set.')
  process.exit(1)
}

const client = new pg.Client({ connectionString: DATABASE_URL })
await client.connect()

const { rows } = await client.query(
  'SELECT id, email FROM admins WHERE email = $1',
  [email.trim().toLowerCase()]
)

if (rows.length === 0) {
  console.error(`Error: no admin found with email "${email}".`)
  console.log('\nExisting admins:')
  const all = await client.query('SELECT email FROM admins ORDER BY id')
  all.rows.forEach((r) => console.log(' •', r.email))
  await client.end()
  process.exit(1)
}

const hash = await bcrypt.hash(newPassword, 10)
await client.query(
  'UPDATE admins SET password_hash = $1 WHERE email = $2',
  [hash, email.trim().toLowerCase()]
)

await client.end()
console.log(`\n✅ Password updated for ${email}`)
console.log('   You can now sign in at /admin/login\n')
