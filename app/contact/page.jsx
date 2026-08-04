import { Suspense } from 'react'
import { getSite } from '@/lib/content'
import { Reveal, SectionKicker } from '@/components/ui'
import ContactForm from '@/components/ContactForm'

export const metadata = { title: 'Contact Us — Global Nepal Group' }

export default function Contact() {
  const site = getSite()
  return (
    <section className="bg-white pt-[68px]">
      <div className="mx-auto max-w-content px-5 sm:px-8 py-20 grid lg:grid-cols-2 gap-12">
        <Reveal>
          <SectionKicker>Contact us</SectionKicker>
          <h1 className="mt-3 font-display font-extrabold text-ocean text-4xl sm:text-5xl tracking-tight">Let's talk traceability</h1>
          <p className="mt-4 text-steel max-w-md">Tell us about your operation and we'll recommend the right mix of hardware and software — or book a live demo.</p>
          <div className="mt-8 space-y-4 text-[15px]">
            {[['Address', site.address], ['Phone', site.phone], ['Email', site.email]].map(([k, v]) => (
              <div key={k} className="flex gap-4">
                <span className="font-mono text-[11px] tracking-widest uppercase text-steel w-16 pt-0.5">{k}</span>
                <span className="text-ocean font-medium">{v}</span>
              </div>
            ))}
          </div>
          {/* Interactive map — Google Maps embed of Dhumbarahi, Kathmandu-4.
             To fine-tune the pin: Google Maps -> your business -> Share -> Embed a map -> copy the src. */}
          <div className="mt-8 rounded-xl border border-cloud overflow-hidden h-64">
            <iframe
              title="Global Nepal Group — Dhumbarahi, Kathmandu"
              src="https://www.google.com/maps?q=Dhumbarahi,+Kathmandu+44600,+Nepal&output=embed"
              className="w-full h-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <div className="rounded-2xl border border-cloud bg-mist p-7 sm:p-9">
            <Suspense fallback={null}>
              <ContactForm />
            </Suspense>
            <p className="mt-4 text-center font-mono text-[11px] text-steel">Or call us directly: {site.phone}</p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
