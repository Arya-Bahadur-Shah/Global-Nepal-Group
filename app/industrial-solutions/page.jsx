/* ============================================================
   INDUSTRIAL SOLUTIONS — LISTING  (/industrial-solutions)
   ============================================================ */
import Link from 'next/link'
import Image from 'next/image'
import { getIndustrialSolutions } from '@/lib/content'
import { Reveal, ArrowIcon } from '@/components/ui'

export const metadata = { title: 'Industrial Solutions — Global Nepal Group' }

export default function IndustrialSolutionsListingPage() {
  const industrialSolutions = getIndustrialSolutions()

  return (
    <>
      {/* Page hero */}
      <section className="relative bg-abyss pt-[72px] overflow-hidden border-b border-marine/50">
        <div className="absolute inset-0 u-grid opacity-60 pointer-events-none" />
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-gold/30 blur-3xl anim-pulse pointer-events-none" />
        <div className="relative mx-auto max-w-content px-5 sm:px-8 py-20">
          <Reveal>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-gold/15 text-gold border border-gold/30 font-mono text-xs font-bold uppercase tracking-wider mb-3">
              Heavy Industry &amp; Plant Systems
            </div>
            <h1 className="u-underline mt-2 font-display font-extrabold text-white text-5xl sm:text-6xl tracking-tight">Industrial Solutions</h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-8 text-lg text-white/90 max-w-2xl font-normal leading-relaxed">
              Heavy equipment telematics, factory batch serialization, high-speed vision systems, and automated warehouse logistics built for Nepal&rsquo;s industrial infrastructure.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Industrial Solution cards */}
      <section className="bg-paper py-20">
        <div className="mx-auto max-w-content px-5 sm:px-8 grid sm:grid-cols-2 gap-8">
          {industrialSolutions.map((solution, i) => (
            <Reveal key={solution.slug} variant={i % 2 ? 'right' : 'left'} delay={(i % 2) * 0.06}>
              <Link
                href={`/industrial-solutions/${solution.slug}`}
                className="group flex flex-col h-full rounded-2xl border-2 border-cloud bg-white overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:border-gold hover:shadow-xl shadow-sm"
              >
                {/* Visual */}
                <div className="relative aspect-[16/9] bg-ocean overflow-hidden">
                  {solution.visual ? (
                    <Image src={solution.visual} alt={solution.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center bg-ocean">
                      <span className="font-display font-extrabold text-white/30 text-4xl">{solution.name}</span>
                    </div>
                  )}
                </div>
                <div className="p-8 flex flex-col flex-1">
                  <div className="h-1.5 w-12 rounded-full bg-gradient-to-r from-gold to-crimson group-hover:w-20 transition-all duration-500" />
                  <div className="mt-5">
                    <span className="font-mono text-xs font-bold tracking-widest uppercase text-ocean bg-mist px-2.5 py-1 rounded-md border border-cloud inline-block">
                      {solution.tag}
                    </span>
                  </div>
                  <h2 className="mt-3 font-display font-extrabold text-ocean text-2xl sm:text-3xl group-hover:text-gold transition-colors">{solution.name}</h2>
                  <p className="mt-4 text-steel leading-relaxed flex-1 font-medium">{solution.summary}</p>
                  <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-gold group-hover:gap-2.5 transition-all">
                    Explore Industrial Solution <ArrowIcon />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  )
}
