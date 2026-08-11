/* ============================================================
   INDUSTRIES — DETAIL  (/industries/[slug])
   ============================================================ */
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getIndustries, getIndustry, getHardwareForSolution, getClientsForIndustry } from '@/lib/content'
import { Reveal, SectionKicker, ArrowIcon } from '@/components/ui'
import { FeatureIcon, AdvantageIcon } from '@/components/solutions/SolutionIcons'

export function generateStaticParams() {
  return getIndustries().map((ind) => ({ slug: ind.slug }))
}

export function generateMetadata({ params }) {
  const industry = getIndustry(params.slug)
  return { title: industry ? `${industry.name} — Industries — Global Nepal Group` : 'Industry' }
}

export default function IndustryDetailPage({ params }) {
  const industry = getIndustry(params.slug)
  if (!industry) notFound()
  const hardware = getHardwareForSolution(industry)
  const clients = getClientsForIndustry(industry)
  const others = getIndustries().filter((ind) => ind.slug !== industry.slug)

  return (
    <>
      {/* Header — static brand hero */}
      <section className="relative bg-abyss overflow-hidden" style={{ minHeight: '600px', height: '70vh', maxHeight: '800px' }}>
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-ocean via-[#181a20] to-abyss" />
          <div className="absolute inset-0 bg-gradient-to-t from-abyss/85 via-abyss/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-abyss/40 via-transparent to-transparent" />
        </div>

        <div className="absolute inset-0 u-grid opacity-25 pointer-events-none" />
        <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-crimson/20 blur-3xl anim-pulse pointer-events-none" />

        <div className="absolute bottom-0 left-0 right-0 pt-[80px]">
          <div className="relative mx-auto max-w-content px-5 sm:px-8 pb-12 w-full">
            <Reveal>
              <nav className="flex items-center gap-2 font-mono text-xs text-white/60">
                <Link href="/industries" className="hover:text-crimson transition-colors">Industries</Link>
                <span className="text-white/30">/</span>
                <span className="text-white/90">{industry.name}</span>
              </nav>
            </Reveal>
            <Reveal delay={0.06}>
              <div className="mt-5 inline-flex items-center gap-2 font-mono text-[11px] tracking-widest uppercase text-crimson bg-abyss/60 backdrop-blur px-3 py-1.5 rounded-full border border-crimson/30">
                <span className="h-1.5 w-1.5 rounded-full bg-crimson anim-pulse" />
                {industry.tag}
              </div>
              <h1 className="u-underline mt-3 font-display font-extrabold text-white text-5xl sm:text-6xl tracking-tight drop-shadow-md">{industry.name}</h1>
              <p className="mt-6 max-w-2xl text-lg text-white/85 leading-relaxed drop-shadow">{industry.description}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/contact?type=demo" className="inline-flex items-center gap-2 rounded-xl bg-crimson px-7 py-3.5 font-bold text-white hover:bg-white hover:text-crimson transition-all shadow-lg shadow-crimson/20">
                  Talk to Our Team <ArrowIcon />
                </Link>
                <Link href="/industries" className="inline-flex items-center gap-2 rounded-xl border-2 border-white/30 bg-white/10 backdrop-blur px-7 py-3.5 font-semibold text-white hover:border-crimson hover:text-crimson transition-all">
                  All Industries
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Applications / Features */}
      {industry.features?.length > 0 && (
        <section className="bg-paper py-20 relative overflow-hidden">
          <div className="mx-auto max-w-content px-5 sm:px-8">
            <Reveal className="max-w-xl mb-12">
              <SectionKicker>How It&rsquo;s Used</SectionKicker>
              <h2 className="mt-3 font-display font-extrabold text-ocean text-3xl sm:text-4xl">Applications in {industry.name}</h2>
            </Reveal>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {industry.features.map(([title, body], i) => (
                <Reveal key={title} variant="zoom" delay={(i % 3) * 0.08}>
                  <div className="group relative h-full rounded-2xl bg-white border border-cloud p-7 sm:p-8 transition-all duration-300 hover:-translate-y-2 hover:border-crimson hover:shadow-xl flex flex-col justify-between overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-crimson via-crimsonBright to-ocean opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div>
                      <div className="flex items-center justify-between gap-4 mb-6">
                        <div className="h-14 w-14 rounded-2xl bg-crimson/15 text-crimson group-hover:bg-crimson group-hover:text-white flex items-center justify-center transition-all duration-500 shadow-sm group-hover:scale-110">
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

      {/* Modules (optional) */}
      {industry.modules?.length > 0 && (
        <section className="bg-mist py-20">
          <div className="mx-auto max-w-content px-5 sm:px-8">
            <Reveal className="max-w-xl mb-10">
              <SectionKicker>System Architecture</SectionKicker>
              <h2 className="mt-3 font-display font-extrabold text-ocean text-3xl sm:text-4xl">Deployment Modules</h2>
            </Reveal>
            <div className="relative max-w-3xl">
              <div className="space-y-6">
                {industry.modules.map(([title, body], i) => (
                  <Reveal key={title} variant="left" delay={i * 0.06}>
                    <div className="rounded-xl bg-white border border-cloud p-6 shadow-xs">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-extrabold text-crimson bg-ocean px-2.5 py-1 rounded">Module 0{i + 1}</span>
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

      {/* Products & Solutions deployed */}
      {hardware.length > 0 && (
        <section className="bg-mist py-20">
          <div className="mx-auto max-w-content px-5 sm:px-8">
            <Reveal className="max-w-xl mb-10">
              <SectionKicker>Products Deployed</SectionKicker>
              <h2 className="mt-3 font-display font-extrabold text-ocean text-3xl sm:text-4xl">Hardware in the Field</h2>
            </Reveal>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {hardware.map((product, i) => (
                <Reveal key={product.slug} delay={(i % 4) * 0.06}>
                  <Link href={`/hardware/${product.brandSlug}/${product.slug}`} className="group block rounded-xl border border-cloud bg-white overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all">
                    <div className="relative aspect-[4/3] bg-mist">
                      {product.image && <Image src={product.image} alt={product.name} fill sizes="(max-width: 640px) 50vw, 240px" className="object-contain p-4 group-hover:scale-105 transition-transform" />}
                    </div>
                    <div className="p-4">
                      <div className="font-mono text-[10px] uppercase text-crimson">{product.brandSlug}</div>
                      <h3 className="mt-1 font-display font-semibold text-ocean text-sm group-hover:text-crimson transition-colors">{product.name}</h3>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Outcomes / Advantages */}
      {industry.advantages?.length > 0 && (
        <section className="bg-gradient-to-br from-ocean via-[#181a20] to-abyss py-20 text-white relative overflow-hidden">
          <div className="mx-auto max-w-content px-5 sm:px-8">
            <Reveal className="max-w-xl mb-12">
              <SectionKicker>Business Outcomes</SectionKicker>
              <h2 className="mt-3 font-display font-extrabold text-white text-3xl sm:text-4xl">Why It Matters</h2>
            </Reveal>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {industry.advantages.map((adv, i) => (
                <Reveal key={adv} variant="zoom" delay={(i % 4) * 0.06}>
                  <div className="rounded-2xl bg-white/10 border border-white/15 p-6 hover:border-crimson transition-all">
                    <div className="h-10 w-10 rounded-xl bg-crimson/20 text-crimson flex items-center justify-center mb-4">
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

      {/* Companies we work with — named clients with logos */}
      {clients.length > 0 && (
        <section className="bg-paper py-20 relative overflow-hidden">
          <div className="absolute inset-0 u-grid opacity-40 pointer-events-none" />
          <div className="relative mx-auto max-w-content px-5 sm:px-8">
            <Reveal className="max-w-xl mb-12">
              <SectionKicker>Companies We Work With</SectionKicker>
              <h2 className="mt-3 font-display font-extrabold text-ocean text-3xl sm:text-4xl">Trusted in {industry.name}</h2>
              <p className="mt-4 text-steel leading-relaxed">Organizations across this sector that rely on Global Nepal Group for their track, trace &amp; identity infrastructure.</p>
            </Reveal>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {clients.map((client, i) => (
                <Reveal key={client.name} variant="zoom" delay={(i % 4) * 0.06}>
                  <div className="group flex h-full flex-col items-center justify-center gap-4 rounded-2xl border border-cloud bg-white p-6 text-center transition-all duration-300 hover:-translate-y-1.5 hover:border-crimson hover:shadow-xl">
                    <div className="flex h-20 w-full items-center justify-center">
                      {client.logo ? (
                        <Image
                          src={client.logo}
                          alt={client.name}
                          width={160}
                          height={80}
                          className="max-h-20 w-auto object-contain grayscale opacity-80 transition-all duration-300 group-hover:grayscale-0 group-hover:opacity-100"
                        />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-crimson to-crimsonBright font-display text-2xl font-extrabold text-white shadow-sm">
                          {client.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <span className="font-display text-sm font-semibold leading-snug text-ocean">{client.name}</span>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Other industries */}
      <section className="bg-mist py-20">
        <div className="mx-auto max-w-content px-5 sm:px-8">
          <Reveal className="flex items-end justify-between mb-8">
            <h2 className="font-display font-bold text-ocean text-2xl">Other Industries</h2>
            <Link href="/industries" className="inline-flex items-center gap-1.5 text-sm font-semibold text-crimson hover:text-crimsonD">All industries <ArrowIcon /></Link>
          </Reveal>
          <div className="grid sm:grid-cols-3 gap-5">
            {others.map((ind) => (
              <Link key={ind.slug} href={`/industries/${ind.slug}`} className="group rounded-xl border border-cloud bg-white p-5 hover:-translate-y-1 hover:shadow-md transition-all">
                <div className="font-mono text-[10px] uppercase text-crimson">{ind.tag}</div>
                <h3 className="mt-1 font-display font-bold text-ocean group-hover:text-crimson transition-colors">{ind.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
