'use client'
/* ============================================================
   CONTACT FORM  (used on /contact)
   Posts to /app/api/contact/route.js which stores the lead and can
   email it. See that route file + README for wiring options.
   ============================================================ */
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'

export default function ContactForm() {
  const searchParams = useSearchParams()
  const isDemo = searchParams.get('type') === 'demo'

  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [status, setStatus] = useState('idle') // idle | sending | sent | error

  const isValid =
    form.name && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email) && form.message
  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const submit = async () => {
    if (!isValid || status === 'sending') return
    setStatus('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // API expects { name, email, phone, msg, type }
        body: JSON.stringify({ ...form, msg: form.message, type: isDemo ? 'demo' : 'contact' }),
      })
      setStatus(res.ok ? 'sent' : 'error')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div className="grid place-items-center text-center py-16">
        <span className="grid place-items-center h-14 w-14 rounded-full bg-azure/15 text-azure">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M20 6 9 17l-5-5" /></svg>
        </span>
        <h3 className="mt-4 font-display font-bold text-ocean text-2xl">{isDemo ? 'Demo request sent' : 'Inquiry sent'}</h3>
        <p className="mt-2 text-steel text-sm max-w-xs">Thanks — we&rsquo;ll get back to you within one working day.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="font-mono text-[11px] tracking-widest uppercase text-steel">Name *</span>
          <input value={form.name} onChange={update('name')} className="mt-1.5 w-full rounded-lg border border-cloud bg-white px-4 py-3 text-[15px]" placeholder="Your name" />
        </label>
        <label className="block">
          <span className="font-mono text-[11px] tracking-widest uppercase text-steel">Phone</span>
          <input value={form.phone} onChange={update('phone')} className="mt-1.5 w-full rounded-lg border border-cloud bg-white px-4 py-3 text-[15px]" placeholder="+977 …" />
        </label>
      </div>
      <label className="block">
        <span className="font-mono text-[11px] tracking-widest uppercase text-steel">Email *</span>
        <input value={form.email} onChange={update('email')} type="email" className="mt-1.5 w-full rounded-lg border border-cloud bg-white px-4 py-3 text-[15px]" placeholder="you@company.com" />
      </label>
      <label className="block">
        <span className="font-mono text-[11px] tracking-widest uppercase text-steel">How can we help? *</span>
        <textarea value={form.message} onChange={update('message')} rows="4" className="mt-1.5 w-full rounded-lg border border-cloud bg-white px-4 py-3 text-[15px] resize-none" placeholder="Tell us about your products, volumes and what you want to track…" />
      </label>
      <button
        disabled={!isValid || status === 'sending'}
        onClick={submit}
        className={`w-full rounded-lg py-3.5 font-semibold text-white transition-colors ${isValid ? 'bg-ocean hover:bg-crimson' : 'bg-cloud !text-steel cursor-not-allowed'}`}
      >
        {status === 'sending' ? 'Sending…' : isDemo ? 'Request demo' : 'Send inquiry'}
      </button>
      {status === 'error' && <p className="text-center text-sm text-red-500">Couldn&rsquo;t send just now — please call us instead.</p>}
    </div>
  )
}
