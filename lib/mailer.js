/* ============================================================
   OUTBOUND EMAIL
   One place for sending mail. Previously this lived inline in the
   contact route; login codes need it too, and a second copy would
   drift.

   ── Three providers, picked automatically ────────────────────
   1. Gmail SMTP   when GMAIL_USER + GMAIL_APP_PASSWORD are set
   2. Resend       when RESEND_API_KEY is set
   3. Console      when neither is

   Gmail is checked first because it's the deliberate choice here:
   Resend's shared sender can only deliver to the address that owns the
   Resend account, so it cannot email arbitrary recipients until a
   domain is verified. Gmail SMTP has no such limit.

   Resend is kept rather than deleted so moving to it later — once
   globalnepalgroup.com is verified — is an env change, not a rewrite.

   Console output is what makes local development work with no mail
   account at all: the login code is printed to the terminal.
   ============================================================ */
import nodemailer from 'nodemailer'

const GMAIL_USER = () => process.env.GMAIL_USER
const GMAIL_PASS = () => process.env.GMAIL_APP_PASSWORD

/* Copying .env.local.example over a working .env.local used to leave
   these literal placeholders in place. They're non-empty, so the app
   thought it was configured, switched off console logging, and then
   failed against Gmail — no terminal output AND no delivered mail.
   Treating them as unset makes that mistake harmless instead. */
const PLACEHOLDERS = new Set(['youraddress@gmail.com', 'your16digitapppassword', ''])

function gmailConfigured() {
  const u = GMAIL_USER()
  const p = GMAIL_PASS()
  return Boolean(u && p && !PLACEHOLDERS.has(u) && !PLACEHOLDERS.has(p))
}

/** Which provider a send would use right now. */
export function mailProvider() {
  if (gmailConfigured()) return 'gmail'
  if (process.env.RESEND_API_KEY) return 'resend'
  return 'console'
}

export function mailConfigured() {
  return mailProvider() !== 'console'
}

/* One transporter per process. Creating it per send would open a fresh
   TCP + TLS + auth handshake to Gmail every time; cached on globalThis
   because Next's dev server re-evaluates modules on each edit. */
const g = globalThis
function transporter() {
  if (!g.__gngSmtp) {
    g.__gngSmtp = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // STARTTLS upgrades the connection on 587
      auth: { user: GMAIL_USER(), pass: GMAIL_PASS() },
    })
  }
  return g.__gngSmtp
}

/**
 * Sends an email. Returns { ok, provider } and never throws — a mail
 * failure must not take down the request that triggered it.
 */
export async function sendMail({ to, subject, text }) {
  const provider = mailProvider()

  if (provider === 'console') {
    console.log(
      `\n[mailer] No mail provider configured — nothing sent.\n` +
        `  to     : ${to}\n  subject: ${subject}\n  ${text.replace(/\n/g, '\n  ')}\n`
    )
    return { ok: false, provider, reason: 'not-configured' }
  }

  if (provider === 'gmail') {
    try {
      await transporter().sendMail({
        from: process.env.MAIL_FROM || `Global Nepal Group <${GMAIL_USER()}>`,
        to,
        subject,
        text,
      })
      return { ok: true, provider }
    } catch (e) {
      // Print the body so a delivery failure never means a locked-out
      // admin: the code is still recoverable from the server log.
      console.error(`[mailer] Gmail SMTP failed: ${e.message}`)
      console.error(`  intended for ${to} — ${subject}`)
      return { ok: false, provider, reason: e.message }
    }
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: process.env.MAIL_FROM || 'Global Nepal Group <onboarding@resend.dev>',
        to,
        subject,
        text,
      }),
    })
    if (!res.ok) {
      const detail = await res.text()
      console.error('[mailer] Resend rejected the send:', res.status, detail)
      console.error(`  intended for ${to} — ${subject}`)
      return { ok: false, provider, reason: detail }
    }
    return { ok: true, provider }
  } catch (e) {
    console.error('[mailer] Resend send failed:', e.message)
    console.error(`  intended for ${to} — ${subject}`)
    return { ok: false, provider, reason: e.message }
  }
}
