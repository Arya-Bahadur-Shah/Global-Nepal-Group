/* ============================================================
   INDUSTRIES — LISTING  (/industries)
   ============================================================ */
import Link from 'next/link'
import Image from 'next/image'
import { getIndustries } from '@/lib/content'
import { Reveal, ArrowIcon } from '@/components/ui'

export const metadata = { title: 'Industries — Global Nepal Group' }

export default function IndustriesListingPage() {
  const industries = getIndustries()

  return (
    <>
      {/* Page hero */}
      <section className="relative bg-abyss pt-[72px] overflow-hidden border-b border-marine/50">
        <div className="absolute inset-0 u-grid opacity-60 pointer-events-none" />
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-crimson/30 blur-3xl anim-pulse pointer-events-none" />
        <div className="relative mx-auto max-w-content px-5 sm:px-8 py-20">
          <Reveal>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-crimson/15 text-crimson border border-crimson/30 font-mono text-xs font-bold uppercase tracking-wider mb-3">
              Where Our Products Work
            </div>
            <h1 className="u-underline mt-2 font-display font-extrabold text-white text-5xl sm:text-6xl tracking-tight">Industries We Serve</h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-8 text-lg text-white/90 max-w-2xl font-normal leading-relaxed">
              From commercial banks and government agencies to FMCG plants, pharmaceutical lines, and heavy manufacturing — see how Global Nepal Group&rsquo;s track, trace &amp; identity technology is deployed across Nepal.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Industry cards */}
      <section className="bg-paper py-20">
        <div className="mx-auto max-w-content px-5 sm:px-8 grid sm:grid-cols-2 gap-8">
          {industries.map((industry, i) => (
            <Reveal key={industry.slug} variant={i % 2 ? 'right' : 'left'} delay={(i % 2) * 0.06}>
              <Link
                href={`/industries/${industry.slug}`}
                className="group flex flex-col h-full rounded-2xl border-2 border-cloud bg-white overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:border-crimson hover:shadow-xl shadow-sm"
              >
                {/* Visual */}
                <div className="relative aspect-[16/9] bg-ocean overflow-hidden">
                  {industry.visual ? (
                    <Image src={industry.visual} alt={industry.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center bg-ocean">
                      <span className="font-display font-extrabold text-white/30 text-4xl">{industry.name}</span>
                    </div>
                  )}
                </div>
                <div className="p-8 flex flex-col flex-1">
                  <div className="h-1.5 w-12 rounded-full bg-gradient-to-r from-crimson to-crimsonBright group-hover:w-20 transition-all duration-500" />
                  <div className="mt-5">
                    <span className="font-mono text-xs font-bold tracking-widest uppercase text-ocean bg-mist px-2.5 py-1 rounded-md border border-cloud inline-block">
                      {industry.tag}
                    </span>
                  </div>
                  <h2 className="mt-3 font-display font-extrabold text-ocean text-2xl sm:text-3xl group-hover:text-crimson transition-colors">{industry.name}</h2>
                  <p className="mt-4 text-steel leading-relaxed flex-1 font-medium">{industry.summary}</p>
                  {industry.clients?.length > 0 && (
                    <p className="mt-4 font-mono text-[11px] uppercase tracking-wider text-steel/70">
                      Trusted by {industry.clients.slice(0, 3).join(', ')}{industry.clients.length > 3 ? ' & more' : ''}
                    </p>
                  )}
                  <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-crimson group-hover:gap-2.5 transition-all">
                    Explore Industry <ArrowIcon />
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
