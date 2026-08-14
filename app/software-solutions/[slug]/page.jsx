/* ============================================================
   SOFTWARE SOLUTIONS — DETAIL  (/software-solutions/[slug])
   Full page per platform: description, feature cards with SVG icons,
   modules, advantages cards, and cross-linked hardware.
   ============================================================ */
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getSolutions, getSolution, getHardwareForSolution } from '@/lib/content'
import { Reveal, SectionKicker, ArrowIcon } from '@/components/ui'
import { FeatureIcon, AdvantageIcon } from '@/components/solutions/SolutionIcons'
import DeferredHeroVideo from '@/components/DeferredHeroVideo'

export async function generateStaticParams() {
  return (await getSolutions()).map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({ params }) {
  const solution = await getSolution(params.slug)
  return { title: solution ? `${solution.name} — Software Solutions — Global Nepal Group` : 'Software Solution' }
}

export default async function SoftwareSolutionDetailPage({ params }) {
  const solution = await getSolution(params.slug)
  if (!solution) notFound()
  const hardware = await getHardwareForSolution(solution)
  const others = (await getSolutions()).filter((s) => s.slug !== solution.slug)

  return (
    <>
      {/* Header — full-bleed brand-style hero video (matches Hardware brand hero: ratio + brightness) */}
      <section className="relative bg-abyss overflow-hidden" style={{ minHeight: '600px', height: '70vh', maxHeight: '800px' }}>
        <div className="absolute inset-0">
          <DeferredHeroVideo src={solution.heroVideo || '/assets/video/hero-loop-primary.mp4'} />
          <div className="absolute inset-0 bg-gradient-to-t from-abyss/85 via-abyss/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-abyss/40 via-transparent to-transparent" />
        </div>

        <div className="absolute inset-0 u-grid opacity-25 pointer-events-none" />
        <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-crimson/15 blur-3xl anim-pulse pointer-events-none" />

        <div className="absolute bottom-0 left-0 right-0 pt-[80px]">
          <div className="relative mx-auto max-w-content px-5 sm:px-8 pb-12 w-full">
            <Reveal>
              <nav className="flex items-center gap-2 font-mono text-xs text-white/60">
                <Link href="/software-solutions" className="hover:text-gold transition-colors">Software Solutions</Link>
                <span className="text-white/30">/</span>
                <span className="text-white/90">{solution.name}</span>
              </nav>
            </Reveal>
            <Reveal delay={0.06}>
              <div className="mt-5 inline-flex items-center gap-2 font-mono text-[11px] tracking-widest uppercase text-gold bg-abyss/60 backdrop-blur px-3 py-1.5 rounded-full border border-gold/30">
                <span className="h-1.5 w-1.5 rounded-full bg-crimson anim-pulse" />
                {solution.tag}
              </div>
              {solution.logo ? (
                <div className="relative h-16 w-56 sm:h-20 sm:w-72 mt-4 drop-shadow-xl">
                  <Image src={solution.logo} alt={solution.name} fill sizes="220px" className="object-contain object-left filter brightness-110" priority />
                </div>
              ) : (
                <h1 className="u-underline mt-3 font-display font-extrabold text-white text-5xl sm:text-6xl tracking-tight drop-shadow-md">{solution.name}</h1>
              )}
              <p className="mt-6 max-w-2xl text-lg text-white/85 leading-relaxed drop-shadow">{solution.description}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/contact?type=demo" className="inline-flex items-center gap-2 rounded-xl bg-ocean px-7 py-3.5 font-semibold text-white hover:bg-crimson transition-all shadow-lg shadow-ocean/30 hover:shadow-crimson/30">
                  Request a Demo <ArrowIcon />
                </Link>
                <Link href="/software-solutions" className="inline-flex items-center gap-2 rounded-xl border-2 border-white/30 bg-white/10 backdrop-blur px-7 py-3.5 font-semibold text-white hover:border-gold hover:text-gold transition-all">
                  All Software Solutions
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Features */}
      {solution.features?.length > 0 && (
        <section className="bg-paper py-20 relative overflow-hidden">
          <div className="mx-auto max-w-content px-5 sm:px-8">
            <Reveal className="max-w-xl mb-12">
              <SectionKicker>Capabilities &amp; Features</SectionKicker>
              <h2 className="mt-3 font-display font-extrabold text-ocean text-3xl sm:text-4xl">What {solution.name} does</h2>
              <p className="mt-2 text-steel text-base">Key operational features engineered for seamless tracking and visibility.</p>
            </Reveal>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {solution.features.map(([title, body], i) => (
                <Reveal key={title} variant="zoom" delay={(i % 3) * 0.08}>
                  <div className="group relative h-full rounded-2xl bg-white border border-cloud p-7 sm:p-8 transition-all duration-300 hover:-translate-y-2 hover:border-gold/50 hover:shadow-[0_30px_60px_-25px_rgba(14,44,68,.18)] flex flex-col justify-between overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-ocean via-gold to-crimson opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div>
                      <div className="flex items-center justify-between gap-4 mb-6">
                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-ocean/10 to-gold/10 text-ocean group-hover:from-ocean group-hover:to-crimson group-hover:text-white flex items-center justify-center transition-all duration-500 shadow-sm group-hover:shadow-md group-hover:scale-110">
                          <FeatureIcon title={title} className="w-7 h-7" />
                        </div>
                        <span className="font-mono text-xs font-bold text-steel/60 bg-mist px-3 py-1 rounded-full group-hover:bg-crimson/10 group-hover:text-crimson transition-colors">
                          0{i + 1}
                        </span>
                      </div>
                      <h3 className="font-display font-extrabold text-ocean text-xl group-hover:text-ocean transition-colors">
                        {title}
                      </h3>
                      <p className="mt-3 text-steel leading-relaxed text-sm">
                        {body}
                      </p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-cloud/60 flex items-center justify-between text-xs font-mono text-gold font-bold">
                      <span>Feature Highlight</span>
                      <span className="group-hover:translate-x-1 transition-transform text-ocean">→</span>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Modules */}
      {solution.modules?.length > 0 && (
        <section className="bg-mist py-20">
          <div className="mx-auto max-w-content px-5 sm:px-8">
            <Reveal className="max-w-xl mb-10">
              <SectionKicker>Modules</SectionKicker>
              <h2 className="mt-3 font-display font-extrabold text-ocean text-3xl sm:text-4xl">Inside {solution.name}</h2>
            </Reveal>
            <div className="relative max-w-3xl">
              <div className="absolute left-[23px] top-2 bottom-2 w-px bg-gradient-to-b from-crimson via-gold to-cloud" aria-hidden="true" />
              <div className="space-y-6">
                {solution.modules.map(([title, body], i) => (
                  <Reveal key={title} variant="left" delay={i * 0.06}>
                    <div className="relative flex items-start gap-6">
                      <span className="relative z-10 mt-1 grid place-items-center h-12 w-12 rounded-full bg-white border-2 border-ocean text-ocean font-mono text-sm font-bold shrink-0 shadow-sm">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div className="rounded-xl bg-white border border-cloud p-5 flex-1 shadow-xs hover:shadow-md transition-all">
                        <h3 className="font-display font-bold text-ocean">{title}</h3>
                        <p className="mt-1.5 text-steel leading-relaxed text-sm">{body}</p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Advantages */}
      {solution.advantages?.length > 0 && (
        <section className="bg-gradient-to-br from-ocean via-[#181a20] to-abyss py-20 text-white relative overflow-hidden">
          <div className="absolute inset-0 u-grid opacity-25 pointer-events-none" />
          <div className="absolute top-0 right-1/4 h-96 w-96 rounded-full bg-gold/10 blur-3xl pointer-events-none" />
          <div className="relative mx-auto max-w-content px-5 sm:px-8">
            <Reveal className="max-w-xl mb-12">
              <SectionKicker>Key Advantages</SectionKicker>
              <h2 className="mt-3 font-display font-extrabold text-white text-3xl sm:text-4xl">Why choose {solution.name}</h2>
              <p className="mt-2 text-white/70 text-base">Proven benefits designed to elevate operational efficiency and eliminate errors.</p>
            </Reveal>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {solution.advantages.map((adv, i) => (
                <Reveal key={adv} variant="zoom" delay={(i % 5) * 0.06}>
                  <div className="group relative h-full rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-6 hover:border-gold hover:bg-white/15 transition-all duration-300 hover:-translate-y-1 shadow-lg flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-gold/20 text-gold group-hover:bg-gold group-hover:text-ocean flex items-center justify-center shrink-0 transition-all duration-300 shadow-sm">
                      <AdvantageIcon title={adv} className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-display font-bold text-white text-base sm:text-lg group-hover:text-gold transition-colors leading-snug">
                        {adv}
                      </div>
                      <div className="mt-1 flex items-center gap-1.5 font-mono text-[11px] text-white/60">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 anim-blink" />
                        Verified Advantage
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Hardware used */}
      {hardware.length > 0 && (
        <section className="bg-paper py-20">
          <div className="mx-auto max-w-content px-5 sm:px-8">
            <Reveal className="max-w-xl mb-10">
              <SectionKicker>Hardware used</SectionKicker>
              <h2 className="mt-3 font-display font-extrabold text-ocean text-3xl sm:text-4xl">Runs on hardware we supply</h2>
              <p className="mt-3 text-steel">{solution.name} pairs with this equipment — supplied, installed and supported by Global Nepal Group.</p>
            </Reveal>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {hardware.map((product, i) => (
                <Reveal key={product.slug} delay={(i % 4) * 0.06}>
                  <Link href={`/hardware/${product.brandSlug}/${product.slug}`} className="group block rounded-xl border border-cloud bg-white overflow-hidden hover:-translate-y-1 hover:shadow-[0_24px_50px_-28px_rgba(14,44,68,.4)] transition-all duration-300">
                    <div className="relative aspect-[4/3] bg-mist">
                      {product.image && <Image src={product.image} alt={product.name} fill sizes="(max-width: 640px) 50vw, 240px" className="object-contain p-4 group-hover:scale-105 transition-transform duration-500" />}
                    </div>
                    <div className="p-4">
                      <div className="font-mono text-[10px] tracking-widest uppercase text-gold">{product.brandSlug}</div>
                      <h3 className="mt-1 font-display font-semibold text-ocean text-sm group-hover:text-crimson transition-colors">{product.name}</h3>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Other solutions + CTA */}
      <section className="bg-mist py-20">
        <div className="mx-auto max-w-content px-5 sm:px-8">
          <Reveal className="flex items-end justify-between mb-8">
            <h2 className="font-display font-bold text-ocean text-2xl">Other Software Solutions</h2>
            <Link href="/software-solutions" className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold hover:text-crimson">All software solutions <ArrowIcon /></Link>
          </Reveal>
          <div className="grid sm:grid-cols-3 gap-5">
            {others.map((s) => (
              <Link key={s.slug} href={`/software-solutions/${s.slug}`} className="group rounded-xl border border-cloud bg-white p-5 hover:-translate-y-1 hover:shadow-[0_20px_45px_-25px_rgba(14,44,68,.4)] transition-all duration-300">
                <div className="font-mono text-[10px] tracking-widest uppercase text-gold">{s.tag}</div>
                <h3 className="mt-1 font-display font-bold text-ocean group-hover:text-crimson transition-colors">{s.name}</h3>
              </Link>
            ))}
          </div>
          <Reveal className="mt-14 text-center">
            <h2 className="font-display font-extrabold text-ocean text-2xl sm:text-3xl">See {solution.name} on your operation</h2>
            <Link href="/contact?type=demo" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-ocean px-6 py-3.5 font-semibold text-white hover:bg-crimson transition-colors">Request a Demo <ArrowIcon /></Link>
          </Reveal>
        </div>
      </section>
    </>
  )
}
