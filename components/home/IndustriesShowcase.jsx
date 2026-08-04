/* ============================================================
   HOME SCENE — INDUSTRIES SHOWCASE
   "Industries We Serve" — where Global Nepal Group's track,
   trace & identity technology is deployed across Nepal.
   ============================================================ */
import Link from 'next/link'
import Image from 'next/image'
import { Reveal, SectionKicker, ArrowIcon } from '@/components/ui'

export default function IndustriesShowcase({ industries = [] }) {
  if (!industries || industries.length === 0) return null

  return (
    <section id="industries" className="bg-paper py-20 lg:py-28 relative overflow-hidden">
      <div className="absolute -top-24 right-1/4 h-80 w-80 rounded-full bg-crimson/5 blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-content px-5 sm:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-cloud pb-8">
          <Reveal className="max-w-2xl">
            <SectionKicker>Industries We Serve</SectionKicker>
            <h2 className="mt-3 font-display font-extrabold text-ocean text-4xl sm:text-5xl tracking-tight leading-tight">
              Trusted Across <span className="text-crimson">Nepal&rsquo;s Industry</span>
            </h2>
            <p className="mt-4 text-steel text-base sm:text-lg">
              From commercial banks and government agencies to FMCG plants, pharmaceutical lines, and heavy manufacturing.
            </p>
          </Reveal>

          <Reveal variant="right" className="shrink-0">
            <Link
              href="/industries"
              className="inline-flex items-center gap-2 rounded-xl bg-crimson px-6 py-3.5 text-sm font-bold text-white hover:bg-crimsonD transition-all shadow-lg shadow-crimson/20 hover:scale-105"
            >
              <span>Explore All Industries</span>
              <ArrowIcon />
            </Link>
          </Reveal>
        </div>

        {/* Industry cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {industries.map((item, idx) => (
            <Reveal key={item.slug} delay={(idx % 3) * 0.08}>
              <Link
                href={`/industries/${item.slug}`}
                className="group relative flex flex-col h-full rounded-2xl bg-white border border-cloud overflow-hidden hover:border-crimson hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 shadow-sm"
              >
                <div className="relative aspect-[16/9] bg-ocean overflow-hidden">
                  {item.visual ? (
                    <Image src={item.visual} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center bg-ocean">
                      <span className="font-display font-extrabold text-white/25 text-3xl">{item.name}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-abyss/70 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-3 font-mono text-[10px] font-bold uppercase tracking-wider text-white bg-crimson/90 backdrop-blur px-2.5 py-1 rounded">
                    {item.tag}
                  </span>
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <h3 className="font-display font-extrabold text-ocean text-xl group-hover:text-crimson transition-colors">
                    {item.name}
                  </h3>
                  <p className="mt-2 text-steel text-sm leading-relaxed line-clamp-3 flex-1">
                    {item.summary}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-crimson group-hover:gap-2.5 transition-all">
                    Explore Industry <ArrowIcon />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
