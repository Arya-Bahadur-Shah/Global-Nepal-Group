/* -----------------------------------------------------------------------
   LEAD CAPTURE
   Every submission (plain contact form or "Request a Demo"/"Book Live
   Demo" — tagged via `type`) is saved to the leads table (see
   lib/admin-data.js) and visible in /admin/leads.

   EMAIL — set RESEND_API_KEY + LEADS_TO_EMAIL in .env.local and every
   lead (contact and demo alike) is also emailed to your inbox via
   resend.com. Without those env vars, leads are still saved — just no
   email is sent.
------------------------------------------------------------------------ */
import { createLead } from '@/lib/admin-data'

export async function POST(req) {
  let body
  try { body = await req.json() } catch { return Response.json({ ok: false }, { status: 400 }) }

  const { name = '', email = '', phone = '', msg = '', type = 'contact' } = body
  if (!name || !email || !msg) return Response.json({ ok: false, error: 'Missing fields' }, { status: 400 })

  const leadType = type === 'demo' ? 'demo' : 'contact'
  createLead({ name, email, phone, msg, type: leadType })

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

  return Response.json({ ok: true })
}
