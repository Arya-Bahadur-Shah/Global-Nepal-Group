/* ============================================================
   OUTBOUND EMAIL (Resend)
   Central place for sending mail. Previously this lived inline in the
   contact route; login codes need it too, and a second copy would
   drift.
   ============================================================ */

/** True when real sending is configured. */
export function mailConfigured() {
  return Boolean(process.env.RESEND_API_KEY)
}

/**
 * Sends an email. Returns { ok } rather than throwing: a failure to
 * send should never take down the request that triggered it.
 *
 * With no API key it logs to the server console instead. That's what
 * makes local development possible without a Resend account — the
 * login code is printed to the terminal, so you can still sign in.
 */
export async function sendMail({ to, subject, text }) {
  if (!mailConfigured()) {
    console.log(
      `\n[mailer] RESEND_API_KEY not set — email not sent.\n` +
        `  to     : ${to}\n  subject: ${subject}\n  ${text.replace(/\n/g, '\n  ')}\n`
    )
    return { ok: false, reason: 'not-configured' }
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
      console.error('[mailer] Resend rejected the send:', res.status, await res.text())
      return { ok: false, reason: 'rejected' }
    }
    return { ok: true }
  } catch (e) {
    console.error('[mailer] send failed:', e.message)
    return { ok: false, reason: 'error' }
  }
}
