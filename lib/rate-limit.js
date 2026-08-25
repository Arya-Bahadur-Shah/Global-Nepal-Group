/* ============================================================
   RATE LIMITING FOR PUBLIC FORMS

   lib/login-security.js already limits admin sign-ins, but it counts
   per EMAIL — right for a login, useless for a public form where the
   attacker picks the email. This counts per IP instead.

   Backed by the database, not memory, for the reason spelled out in
   lib/pg-schema.mjs: on Vercel consecutive requests hit different
   serverless instances, so an in-process counter resets constantly and
   a flood never trips it.
   ============================================================ */
import { db } from '@/lib/db'

/**
 * The caller's IP address, or null behind a proxy that strips both
 * headers.
 *
 * Behind Vercel (or any reverse proxy) the socket address belongs to
 * the proxy, so a forwarded header is the only view of the real client.
 * x-forwarded-for is a comma-separated chain and the client is first.
 *
 * @param {Headers} headers  from `headers()` or `req.headers`
 */
export function clientIp(headers) {
  const forwarded = headers.get('x-forwarded-for') || ''
  return forwarded.split(',')[0].trim() || headers.get('x-real-ip') || null
}

/**
 * Records this request and reports whether the caller has gone over the
 * limit for `bucket` inside the window.
 *
 * The insert happens FIRST, so a request that is itself over the limit
 * still counts — otherwise a caller sitting exactly at the cap would be
 * refused without their attempts accumulating, and the window would
 * roll forward and let them straight back in.
 *
 * @param {string} bucket        what is being limited, e.g. 'contact'
 * @param {string|null} ip       from clientIp()
 * @param {object} [opts]
 * @param {number} [opts.max]            allowed requests per window
 * @param {number} [opts.windowMinutes]  length of the window
 * @returns {Promise<{ allowed: boolean, retryAfterSeconds: number }>}
 */
export async function checkRateLimit(bucket, ip, { max = 5, windowMinutes = 10 } = {}) {
  // No IP means no proxy header — every caller would share one bucket
  // and a single legitimate visitor would lock out the rest. Better to
  // allow than to break the form for everyone.
  if (!ip) return { allowed: true, retryAfterSeconds: 0 }

  await db.query(`INSERT INTO form_submissions (bucket, ip) VALUES ($1, $2)`, [bucket, ip])

  const { rows } = await db.query(
    `SELECT COUNT(*)::int AS hits, MIN(at) AS oldest
       FROM form_submissions
      WHERE bucket = $1
        AND ip = $2
        AND at > now() - ($3 || ' minutes')::interval`,
    [bucket, ip, String(windowMinutes)]
  )

  const { hits, oldest } = rows[0]
  if (hits <= max) return { allowed: true, retryAfterSeconds: 0 }

  // The window is a sliding one, so the caller is free again as soon as
  // the OLDEST hit in it ages out — not `windowMinutes` from now.
  const freeAt = new Date(oldest).getTime() + windowMinutes * 60_000
  return {
    allowed: false,
    retryAfterSeconds: Math.max(1, Math.ceil((freeAt - Date.now()) / 1000)),
  }
}

/**
 * Drops rows too old to affect any window. Called opportunistically —
 * the same approach lib/login-security.js takes, because there is no
 * cron on this project and the table would otherwise only grow.
 */
export async function pruneRateLimits(probability = 0.02) {
  if (Math.random() >= probability) return
  await db
    .query(`DELETE FROM form_submissions WHERE at < now() - interval '7 days'`)
    .catch(() => {})
}
