/* -----------------------------------------------------------------------
   LEAD CAPTURE
   Every submission (plain contact form or "Request a Demo"/"Book Live
   Demo" — tagged via `type`) is saved to the leads table (see
   lib/admin-data.js) and visible in /admin/leads.

   EMAIL — set GMAIL_USER + GMAIL_APP_PASSWORD in .env.local and every
   lead (contact and demo alike) is also emailed to all admin accounts
   stored in the admins table via Gmail SMTP (nodemailer). Without those
   env vars, leads are still saved — just no email is sent.

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
import { createLead, listAdmins } from '@/lib/admin-data'
import { checkRateLimit, clientIp, pruneRateLimits } from '@/lib/rate-limit'
import nodemailer from 'nodemailer'

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
  const product = clean(body?.product, 300) || null

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
  await createLead({ name, email, phone, msg, type: leadType, product })

  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    try {
      const admins = await listAdmins()
      const adminEmails = admins.map((a) => a.email).filter(Boolean)

      if (adminEmails.length > 0) {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD,
          },
        })

        const subject = leadType === 'demo'
          ? `🔔 New Demo Request from ${name}${product ? ` — ${product}` : ''}`
          : `🔔 New Website Inquiry from ${name}`

        const html = `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
            <div style="background:#1d4ed8;padding:20px 24px;">
              <h2 style="color:#fff;margin:0;font-size:18px;">
                ${leadType === 'demo' ? '📋 New Demo Request' : '✉️ New Contact Inquiry'}
              </h2>
            </div>
            <div style="padding:24px;background:#fff;">
              <table style="width:100%;border-collapse:collapse;font-size:14px;color:#374151;">
                <tr><td style="padding:8px 0;font-weight:600;width:100px;color:#6b7280;">Type</td><td style="padding:8px 0;">${leadType === 'demo' ? 'Demo Request' : 'Contact'}</td></tr>
                ${product ? `<tr><td style="padding:8px 0;font-weight:600;color:#6b7280;">Product</td><td style="padding:8px 0;"><strong style="color:#1d4ed8;">${product}</strong></td></tr>` : ''}
                <tr><td style="padding:8px 0;font-weight:600;color:#6b7280;">Name</td><td style="padding:8px 0;">${name}</td></tr>
                <tr><td style="padding:8px 0;font-weight:600;color:#6b7280;">Email</td><td style="padding:8px 0;"><a href="mailto:${email}" style="color:#1d4ed8;">${email}</a></td></tr>
                ${phone ? `<tr><td style="padding:8px 0;font-weight:600;color:#6b7280;">Phone</td><td style="padding:8px 0;">${phone}</td></tr>` : ''}
                <tr><td style="padding:8px 0;font-weight:600;color:#6b7280;vertical-align:top;">Message</td><td style="padding:8px 0;white-space:pre-wrap;">${msg}</td></tr>
              </table>
            </div>
            <div style="background:#f9fafb;padding:16px 24px;font-size:12px;color:#9ca3af;border-top:1px solid #e5e7eb;">
              Received via Global Nepal Group website &mdash; reply directly to <a href="mailto:${email}" style="color:#1d4ed8;">${email}</a>
            </div>
          </div>`

        await transporter.sendMail({
          from: process.env.MAIL_FROM || process.env.GMAIL_USER,
          to: adminEmails,
          replyTo: email,
          subject,
          html,
          text: `Type: ${leadType}\nProduct: ${product || 'N/A'}\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\n\n${msg}`,
        })
      }
    } catch (e) { console.error('Lead email notification failed:', e) }
  }

  // After the response is decided, so a slow DELETE never delays a
  // visitor's submission.
  await pruneRateLimits()

  return Response.json({ ok: true })
}
