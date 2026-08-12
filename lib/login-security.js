/* ============================================================
   LOGIN SECURITY — rate limiting + emailed second-factor codes
   Node-only (bcrypt). Imported by the /admin/login server actions,
   never by middleware, which runs on the Edge runtime.
   ============================================================ */
import bcrypt from 'bcryptjs'
import crypto from 'node:crypto'
import { db } from '@/lib/db'
import { sendMail, mailConfigured } from '@/lib/mailer'

/* ---- Rate limiting -------------------------------------------------
   Five failures inside fifteen minutes locks that email out for
   fifteen. Counted per EMAIL rather than per IP: an attacker can
   rotate IPs trivially, but the account they want is fixed. IP is
   recorded too, for looking at after the fact. */
export const MAX_FAILURES = 5
export const WINDOW_MINUTES = 15

/**
 * How things stand for this email right now.
 * { locked, failures, retryAfterMinutes }
 */
export async function loginStatus(email) {
  const { rows } = await db.query(
    `SELECT COUNT(*)::int AS failures,
            MAX(at)      AS last_at
       FROM admin_login_attempts
      WHERE email = $1
        AND ok = false
        AND at > now() - ($2 || ' minutes')::interval`,
    [normalise(email), String(WINDOW_MINUTES)]
  )
  const failures = rows[0].failures
  const locked = failures >= MAX_FAILURES
  let retryAfterMinutes = 0
  if (locked && rows[0].last_at) {
    const unlockAt = new Date(rows[0].last_at).getTime() + WINDOW_MINUTES * 60_000
    retryAfterMinutes = Math.max(1, Math.ceil((unlockAt - Date.now()) / 60_000))
  }
  return { locked, failures, retryAfterMinutes }
}

export async function recordAttempt(email, ok, ip) {
  await db.query(
    `INSERT INTO admin_login_attempts (email, ip, ok) VALUES ($1, $2, $3)`,
    [normalise(email), ip || null, ok]
  )
  // Opportunistic tidy-up. No cron on this project, so old rows are
  // cleared here; anything past the window is useless for rate limiting
  // and only grows the table.
  if (Math.random() < 0.05) {
    await db
      .query(`DELETE FROM admin_login_attempts WHERE at < now() - interval '30 days'`)
      .catch(() => {})
  }
}

/** Clears the failure count. Called after a fully successful sign-in. */
export async function clearFailures(email) {
  await db.query(`DELETE FROM admin_login_attempts WHERE email = $1 AND ok = false`, [
    normalise(email),
  ])
}

/* ---- Second-factor codes ------------------------------------------- */
export const CODE_LENGTH = 6
export const CODE_TTL_MINUTES = 10
export const CODE_MAX_ATTEMPTS = 5

/**
 * Issues a fresh code and emails it. Any earlier unused code for this
 * address is retired first, so a second request immediately invalidates
 * the first — otherwise two valid codes would be in circulation and an
 * old email would keep working.
 */
export async function issueLoginCode(email) {
  const addr = normalise(email)

  await db.query(
    `UPDATE admin_login_codes SET used_at = now() WHERE email = $1 AND used_at IS NULL`,
    [addr]
  )

  // crypto.randomInt, not Math.random: this is a credential, and
  // Math.random is predictable enough to be guessed given a few samples.
  let code = ''
  for (let i = 0; i < CODE_LENGTH; i++) code += crypto.randomInt(0, 10)

  await db.query(
    `INSERT INTO admin_login_codes (email, code_hash, expires_at)
     VALUES ($1, $2, now() + ($3 || ' minutes')::interval)`,
    [addr, bcrypt.hashSync(code, 10), String(CODE_TTL_MINUTES)]
  )

  const sent = await sendMail({
    to: addr,
    subject: `${code} is your Global Nepal Group admin sign-in code`,
    text:
      `Your sign-in code is ${code}\n\n` +
      `It expires in ${CODE_TTL_MINUTES} minutes and can be used once.\n\n` +
      `If you didn't try to sign in, someone has your password — change it as soon as you can.`,
  })

  // Without a mail provider configured the code is printed to the server
  // console by the mailer, so local development still works.
  return { delivered: sent.ok, mailConfigured: mailConfigured() }
}

/**
 * Checks a submitted code. Returns { ok, error }.
 * Every wrong guess costs an attempt; past the cap the code is dead and
 * a new one must be requested. Without that, six digits is a million
 * guesses and a script would walk it.
 */
export async function verifyLoginCode(email, submitted) {
  const addr = normalise(email)
  const { rows } = await db.query(
    `SELECT id, code_hash, attempts, expires_at
       FROM admin_login_codes
      WHERE email = $1 AND used_at IS NULL
      ORDER BY created_at DESC
      LIMIT 1`,
    [addr]
  )
  const row = rows[0]
  if (!row) return { ok: false, error: 'That code has expired. Request a new one.' }
  if (new Date(row.expires_at).getTime() < Date.now()) {
    return { ok: false, error: 'That code has expired. Request a new one.' }
  }
  if (row.attempts >= CODE_MAX_ATTEMPTS) {
    return { ok: false, error: 'Too many incorrect attempts. Request a new code.' }
  }

  if (!bcrypt.compareSync(String(submitted || '').trim(), row.code_hash)) {
    await db.query(`UPDATE admin_login_codes SET attempts = attempts + 1 WHERE id = $1`, [row.id])
    const left = CODE_MAX_ATTEMPTS - (row.attempts + 1)
    return {
      ok: false,
      error: left > 0 ? `That code isn't right. ${left} attempt(s) left.` : 'Too many incorrect attempts. Request a new code.',
    }
  }

  await db.query(`UPDATE admin_login_codes SET used_at = now() WHERE id = $1`, [row.id])
  return { ok: true }
}

function normalise(email) {
  return String(email || '').trim().toLowerCase()
}
