/* ============================================================
   HOME SCENE 9 — CLOSING CTA
   The story's resolution: a strong call to action on the deep-navy
   card. Phone number pulled from the content layer.
   ============================================================ */
import Link from 'next/link'
import { Reveal, ArrowIcon } from '@/components/ui'

export default function ContactCallout({ site }) {
  const telHref = `tel:${site.phone.replace(/[^+\d]/g, '')}`
  return (
    <section className="bg-paper py-24">
      <div className="mx-auto max-w-content px-5 sm:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-abyss p-8 sm:p-16 text-center border-2 border-marine/60 shadow-2xl">
            <div className="absolute inset-0 u-grid opacity-30 pointer-events-none" />
            <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-crimson/50 blur-3xl pointer-events-none" />
            <div className="absolute -left-16 -bottom-16 h-72 w-72 rounded-full bg-marine/60 blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <h2 className="font-display font-extrabold text-white text-4xl sm:text-5xl lg:text-6xl tracking-tight">Ready to trace every unit?</h2>
              <p className="mt-4 text-white/85 text-base sm:text-lg max-w-xl mx-auto font-normal">
                Tell us about your operation and we&rsquo;ll recommend the right mix of hardware and software — then prove it on your samples.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Link href="/contact?type=demo" className="inline-flex items-center gap-2.5 rounded-xl bg-crimson px-8 py-4 font-bold text-white hover:bg-crimsonD shadow-xl shadow-crimson/40 hover:scale-105 transition-all text-base">Request a Demo <ArrowIcon /></Link>
                <a href={telHref} className="inline-flex items-center gap-2 rounded-xl border-2 border-white/40 bg-marine/80 px-7 py-4 font-bold text-white hover:border-crimsonBright hover:bg-crimson/30 transition-all text-base">{site.phone}</a>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
