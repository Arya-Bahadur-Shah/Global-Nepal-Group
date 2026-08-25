/* -----------------------------------------------------------------------
   LEAD CAPTURE
   Every submission (plain contact form or "Request a Demo"/"Book Live
   Demo" — tagged via `type`) is saved to the leads table (see
   lib/admin-data.js) and visible in /admin/leads.

   EMAIL — set RESEND_API_KEY + LEADS_TO_EMAIL in .env.local and every
   lead (contact and demo alike) is also emailed to your inbox via
   resend.com. Without those env vars, leads are still saved — just no
   email is sent.

   ── Abuse controls ───────────────────────────────────────────
   This is the only unauthenticated write in the app, so it is the only
   thing standing between a three-line script and both a full leads
   table and a flooded inbox. Three cheap layers, in the order that
   costs least to evaluate:

     1. A honeypot field the real form leaves empty.
     2. Length caps, enforced before anything touches the database.
     3. A per-IP sliding-window limit (lib/rate-limit.js).

   None of them stop a determined attacker; together they stop the
   undetermined ones, which is what actually shows up.
------------------------------------------------------------------------ */
import { createLead } from '@/lib/admin-data'
import { checkRateLimit, clientIp, pruneRateLimits } from '@/lib/rate-limit'

/* Generous enough that no honest enquiry is ever truncated, small
   enough that the table cannot be inflated a megabyte at a time. */
const LIMITS = { name: 200, email: 320, phone: 60, msg: 5000 }

/* Five in ten minutes per IP. A person filling in the form once — or
   twice, after a typo — never notices; a script does immediately. */
const RATE_LIMIT = { max: 5, windowMinutes: 10 }

/* Deliberately plausible-looking: bots fill in anything that looks like
   a real field, and "company website" is irresistible. The real form
   renders it hidden and empty (see components/ContactForm.jsx), so any
   value at all means the sender is not using the form. */
const HONEYPOT_FIELD = 'website'

/** Trim, coerce to string, and cap. Returns '' for null/undefined. */
function clean(value, maxLength) {
  return String(value ?? '').trim().slice(0, maxLength)
}

/* Matches the check in components/ContactForm.jsx. Deliberately loose:
   the address is a way to reply to a human, not a credential, and a
   strict pattern rejects valid addresses far more often than it catches
   anything worth catching. */
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

export async function POST(req) {
  let body
  try { body = await req.json() } catch { return Response.json({ ok: false }, { status: 400 }) }

  // Silently accepted, never stored: telling a bot it was detected only
  // teaches whoever wrote it to leave the field alone next time.
  if (clean(body?.[HONEYPOT_FIELD], 100)) return Response.json({ ok: true })

  const name = clean(body?.name, LIMITS.name)
  const email = clean(body?.email, LIMITS.email)
  const phone = clean(body?.phone, LIMITS.phone)
  const msg = clean(body?.msg, LIMITS.msg)

  if (!name || !email || !msg) {
    return Response.json({ ok: false, error: 'Missing fields' }, { status: 400 })
  }
  if (!EMAIL_RE.test(email)) {
    return Response.json({ ok: false, error: 'Invalid email address' }, { status: 400 })
  }

  const ip = clientIp(req.headers)
  const { allowed, retryAfterSeconds } = await checkRateLimit('contact', ip, RATE_LIMIT)
  if (!allowed) {
    return Response.json(
      { ok: false, error: 'Too many messages from this connection. Please try again shortly.' },
      { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } }
    )
  }

  const leadType = body?.type === 'demo' ? 'demo' : 'contact'
  await createLead({ name, email, phone, msg, type: leadType })

  if (process.env.RESEND_API_KEY && process.env.LEADS_TO_EMAIL) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
        body: JSON.stringify({
          from: 'Website <onboarding@resend.dev>',
          to: process.env.LEADS_TO_EMAIL,
          subject: leadType === 'demo' ? `New demo request from ${name}` : `New website inquiry from ${name}`,
          text: `Type: ${leadType}\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\n\n${msg}`,
        }),
      })
    } catch (e) { console.error('Resend failed:', e) }
  }

  // After the response is decided, so a slow DELETE never delays a
  // visitor's submission.
  await pruneRateLimits()

  return Response.json({ ok: true })
}
