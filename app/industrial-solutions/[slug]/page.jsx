/* ============================================================
   INDUSTRIAL SOLUTIONS — DETAIL  (/industrial-solutions/[slug])
   ============================================================ */
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getIndustrialSolutions, getIndustrialSolution, getHardwareForSolution } from '@/lib/content'
import { Reveal, SectionKicker, ArrowIcon } from '@/components/ui'
import { FeatureIcon, AdvantageIcon } from '@/components/solutions/SolutionIcons'
import DeferredHeroVideo from '@/components/DeferredHeroVideo'

export async function generateStaticParams() {
  return (await getIndustrialSolutions()).map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({ params }) {
  const solution = await getIndustrialSolution(params.slug)
  return { title: solution ? `${solution.name} — Industrial Solutions — Global Nepal Group` : 'Industrial Solution' }
}

export default async function IndustrialSolutionDetailPage({ params }) {
  const solution = await getIndustrialSolution(params.slug)
  if (!solution) notFound()
  const hardware = await getHardwareForSolution(solution)
  const others = (await getIndustrialSolutions()).filter((s) => s.slug !== solution.slug)

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
        <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-gold/20 blur-3xl anim-pulse pointer-events-none" />

        <div className="absolute bottom-0 left-0 right-0 pt-[80px]">
          <div className="relative mx-auto max-w-content px-5 sm:px-8 pb-12 w-full">
            <Reveal>
              <nav className="flex items-center gap-2 font-mono text-xs text-white/60">
                <Link href="/industrial-solutions" className="hover:text-gold transition-colors">Industrial Solutions</Link>
                <span className="text-white/30">/</span>
                <span className="text-white/90">{solution.name}</span>
              </nav>
            </Reveal>
            <Reveal delay={0.06}>
              <div className="mt-5 inline-flex items-center gap-2 font-mono text-[11px] tracking-widest uppercase text-gold bg-abyss/60 backdrop-blur px-3 py-1.5 rounded-full border border-gold/30">
                <span className="h-1.5 w-1.5 rounded-full bg-gold anim-pulse" />
                {solution.tag}
              </div>
              <h1 className="u-underline mt-3 font-display font-extrabold text-white text-5xl sm:text-6xl tracking-tight drop-shadow-md">{solution.name}</h1>
              <p className="mt-6 max-w-2xl text-lg text-white/85 leading-relaxed drop-shadow">{solution.description}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/contact?type=demo" className="inline-flex items-center gap-2 rounded-xl bg-gold px-7 py-3.5 font-bold text-ocean hover:bg-white transition-all shadow-lg shadow-gold/20">
                  Consult Industrial Team <ArrowIcon />
                </Link>
                <Link href="/industrial-solutions" className="inline-flex items-center gap-2 rounded-xl border-2 border-white/30 bg-white/10 backdrop-blur px-7 py-3.5 font-semibold text-white hover:border-gold hover:text-gold transition-all">
                  All Industrial Solutions
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
              <SectionKicker>Industrial Capabilities</SectionKicker>
              <h2 className="mt-3 font-display font-extrabold text-ocean text-3xl sm:text-4xl">System Capabilities</h2>
            </Reveal>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {solution.features.map(([title, body], i) => (
                <Reveal key={title} variant="zoom" delay={(i % 3) * 0.08}>
                  <div className="group relative h-full rounded-2xl bg-white border border-cloud p-7 sm:p-8 transition-all duration-300 hover:-translate-y-2 hover:border-gold hover:shadow-xl flex flex-col justify-between overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold via-crimson to-ocean opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div>
                      <div className="flex items-center justify-between gap-4 mb-6">
                        <div className="h-14 w-14 rounded-2xl bg-gold/15 text-gold group-hover:bg-gold group-hover:text-ocean flex items-center justify-center transition-all duration-500 shadow-sm group-hover:scale-110">
                          <FeatureIcon title={title} className="w-7 h-7" />
                        </div>
                        <span className="font-mono text-xs font-bold text-steel/60 bg-mist px-3 py-1 rounded-full">
                          0{i + 1}
                        </span>
                      </div>
                      <h3 className="font-display font-extrabold text-ocean text-xl">{title}</h3>
                      <p className="mt-3 text-steel leading-relaxed text-sm">{body}</p>
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
              <SectionKicker>System Architecture</SectionKicker>
              <h2 className="mt-3 font-display font-extrabold text-ocean text-3xl sm:text-4xl">System Modules</h2>
            </Reveal>
            <div className="relative max-w-3xl">
              <div className="space-y-6">
                {solution.modules.map(([title, body], i) => (
                  <Reveal key={title} variant="left" delay={i * 0.06}>
                    <div className="rounded-xl bg-white border border-cloud p-6 shadow-xs">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-extrabold text-gold bg-ocean px-2.5 py-1 rounded">Module 0{i + 1}</span>
                        <h3 className="font-display font-bold text-ocean text-lg">{title}</h3>
                      </div>
                      <p className="mt-2 text-steel leading-relaxed text-sm">{body}</p>
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
          <div className="mx-auto max-w-content px-5 sm:px-8">
            <Reveal className="max-w-xl mb-12">
              <SectionKicker>Proven Impact</SectionKicker>
              <h2 className="mt-3 font-display font-extrabold text-white text-3xl sm:text-4xl">Industrial Advantages</h2>
            </Reveal>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {solution.advantages.map((adv, i) => (
                <Reveal key={adv} variant="zoom" delay={(i % 4) * 0.06}>
                  <div className="rounded-2xl bg-white/10 border border-white/15 p-6 hover:border-gold transition-all">
                    <div className="h-10 w-10 rounded-xl bg-gold/20 text-gold flex items-center justify-center mb-4">
                      <AdvantageIcon title={adv} className="w-5 h-5" />
                    </div>
                    <div className="font-display font-bold text-white text-base leading-snug">{adv}</div>
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
              <SectionKicker>Compatible Industrial Hardware</SectionKicker>
              <h2 className="mt-3 font-display font-extrabold text-ocean text-3xl sm:text-4xl">Deployed Equipment</h2>
            </Reveal>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {hardware.map((product, i) => (
                <Reveal key={product.slug} delay={(i % 4) * 0.06}>
                  <Link href={`/hardware/${product.brandSlug}/${product.slug}`} className="group block rounded-xl border border-cloud bg-white overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all">
                    <div className="relative aspect-[4/3] bg-mist">
                      {product.image && <Image src={product.image} alt={product.name} fill sizes="(max-width: 640px) 50vw, 240px" className="object-contain p-4 group-hover:scale-105 transition-transform" />}
                    </div>
                    <div className="p-4">
                      <div className="font-mono text-[10px] uppercase text-gold">{product.brandSlug}</div>
                      <h3 className="mt-1 font-display font-semibold text-ocean text-sm group-hover:text-gold transition-colors">{product.name}</h3>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Other industrial solutions */}
      <section className="bg-mist py-20">
        <div className="mx-auto max-w-content px-5 sm:px-8">
          <Reveal className="flex items-end justify-between mb-8">
            <h2 className="font-display font-bold text-ocean text-2xl">Other Industrial Solutions</h2>
            <Link href="/industrial-solutions" className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold hover:text-crimson">All industrial solutions <ArrowIcon /></Link>
          </Reveal>
          <div className="grid sm:grid-cols-3 gap-5">
            {others.map((s) => (
              <Link key={s.slug} href={`/industrial-solutions/${s.slug}`} className="group rounded-xl border border-cloud bg-white p-5 hover:-translate-y-1 hover:shadow-md transition-all">
                <div className="font-mono text-[10px] uppercase text-gold">{s.tag}</div>
                <h3 className="mt-1 font-display font-bold text-ocean group-hover:text-gold transition-colors">{s.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
