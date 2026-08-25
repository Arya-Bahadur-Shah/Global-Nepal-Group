'use client'
/* ============================================================
   CONTACT FORM  (used on /contact)
   Posts to /app/api/contact/route.js which stores the lead and can
   email it. See that route file + README for wiring options.

   ── Why this is a real <form> ────────────────────────────────
   It used to be a <div> with an onClick button. That worked with a
   mouse and quietly failed everything else: Enter didn't submit,
   browser autofill had no form to recognise, screen readers announced
   a group of loose inputs rather than a form, and there was no native
   validation to fall back on. Submitting through onSubmit fixes all
   four at once and changes nothing visually.
   ============================================================ */
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'

/* Must match HONEYPOT_FIELD in app/api/contact/route.js. Bots fill in
   every field they can see; this one is invisible to people, so a value
   here means the submission didn't come from this form. */
const HONEYPOT_FIELD = 'website'

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

export default function ContactForm() {
  const searchParams = useSearchParams()
  const isDemo = searchParams.get('type') === 'demo'

  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [status, setStatus] = useState('idle') // idle | sending | sent | error | throttled

  const isValid = form.name && EMAIL_RE.test(form.email) && form.message
  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    if (!isValid || status === 'sending') return

    /* Read the honeypot off the DOM rather than from React state. It is
       deliberately uncontrolled: a bot fills fields by setting the input's
       value directly, which never reaches a controlled component's state,
       so a state-built payload would always report the trap as empty and
       the check could never fire. */
    const trap = new FormData(e.currentTarget).get(HONEYPOT_FIELD) || ''

    setStatus('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // API expects { name, email, phone, msg, type }
        body: JSON.stringify({
          ...form,
          msg: form.message,
          type: isDemo ? 'demo' : 'contact',
          [HONEYPOT_FIELD]: trap,
        }),
      })
      // 429 gets its own message — "try again shortly" is actionable,
      // "couldn't send" would send them to the phone unnecessarily.
      if (res.status === 429) setStatus('throttled')
      else setStatus(res.ok ? 'sent' : 'error')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div className="grid place-items-center text-center py-16">
        <span className="grid place-items-center h-14 w-14 rounded-full bg-azure/15 text-azure">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
        </span>
        <h3 className="mt-4 font-display font-bold text-ocean text-2xl">{isDemo ? 'Demo request sent' : 'Inquiry sent'}</h3>
        <p className="mt-2 text-steel text-sm max-w-xs">Thanks — we&rsquo;ll get back to you within one working day.</p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="font-mono text-[11px] tracking-widest uppercase text-steel">Name *</span>
          <input value={form.name} onChange={update('name')} name="name" required autoComplete="name" className="mt-1.5 w-full rounded-lg border border-cloud bg-white px-4 py-3 text-[15px]" placeholder="Your name" />
        </label>
        <label className="block">
          <span className="font-mono text-[11px] tracking-widest uppercase text-steel">Phone</span>
          <input value={form.phone} onChange={update('phone')} name="phone" type="tel" autoComplete="tel" className="mt-1.5 w-full rounded-lg border border-cloud bg-white px-4 py-3 text-[15px]" placeholder="+977 …" />
        </label>
      </div>
      <label className="block">
        <span className="font-mono text-[11px] tracking-widest uppercase text-steel">Email *</span>
        <input value={form.email} onChange={update('email')} name="email" type="email" required autoComplete="email" className="mt-1.5 w-full rounded-lg border border-cloud bg-white px-4 py-3 text-[15px]" placeholder="you@company.com" />
      </label>
      <label className="block">
        <span className="font-mono text-[11px] tracking-widest uppercase text-steel">How can we help? *</span>
        <textarea value={form.message} onChange={update('message')} name="message" rows="4" required maxLength={5000} className="mt-1.5 w-full rounded-lg border border-cloud bg-white px-4 py-3 text-[15px] resize-none" placeholder="Tell us about your products, volumes and what you want to track…" />
      </label>

      {/* Honeypot. Positioned off-screen rather than display:none —
          the cruder bots skip hidden fields but happily fill this one.
          aria-hidden + tabIndex=-1 keep it away from real people. */}
      <div aria-hidden="true" className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
        <label>
          Company website
          <input type="text" name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <button
        type="submit"
        disabled={!isValid || status === 'sending'}
        className={`w-full rounded-lg py-3.5 font-semibold text-white transition-colors ${isValid ? 'bg-ocean hover:bg-crimson' : 'bg-cloud !text-steel cursor-not-allowed'}`}
      >
        {status === 'sending' ? 'Sending…' : isDemo ? 'Request demo' : 'Send inquiry'}
      </button>

      <p role="status" aria-live="polite" className="text-center text-sm text-red-500 empty:hidden">
        {status === 'error' && 'Couldn’t send just now — please call us instead.'}
        {status === 'throttled' && 'That’s a few messages in quick succession — please try again in a few minutes.'}
      </p>
    </form>
  )
}
