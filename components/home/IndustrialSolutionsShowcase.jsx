'use client'
/* ============================================================
   HOME SCENE — INDUSTRIAL SOLUTIONS SHOWCASE
   High-impact visual section highlighting Global Nepal Group's
   Industrial Solutions (Factory Traceability, Vision Inspection,
   Machinery Telematics, Smart Warehouse Automation).
   ============================================================ */
import Link from 'next/link'
import Image from 'next/image'
import { Reveal, SectionKicker, ArrowIcon } from '@/components/ui'

export default function IndustrialSolutionsShowcase({ industrialSolutions = [] }) {
  if (!industrialSolutions || industrialSolutions.length === 0) return null

  return (
    <section id="industrial-solutions" className="bg-abyss text-white py-20 lg:py-28 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute inset-0 u-grid opacity-30 pointer-events-none" />
      <div className="absolute -top-32 left-1/3 h-96 w-96 rounded-full bg-gold/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-10 h-80 w-80 rounded-full bg-crimson/15 blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-content px-5 sm:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-white/10 pb-8">
          <Reveal className="max-w-2xl">
            <SectionKicker>Industrial Solutions</SectionKicker>
            <h2 className="mt-3 font-display font-extrabold text-white text-4xl sm:text-5xl tracking-tight leading-tight">
              Heavy Industry &amp; <span className="text-gold">Factory Systems</span>
            </h2>
            <p className="mt-4 text-white/70 text-base sm:text-lg">
              Engineered for manufacturing plants, heavy equipment fleets, and automated logistics hubs across Nepal.
            </p>
          </Reveal>

          <Reveal variant="right" className="shrink-0">
            <Link
              href="/industrial-solutions"
              className="inline-flex items-center gap-2 rounded-xl bg-gold px-6 py-3.5 text-sm font-bold text-ocean hover:bg-white transition-all shadow-lg shadow-gold/20 hover:scale-105"
            >
              <span>Explore All Industrial Solutions</span>
              <ArrowIcon />
            </Link>
          </Reveal>
        </div>

        {/* Industrial Cards Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {industrialSolutions.map((item, idx) => (
            <Reveal key={item.slug} delay={idx * 0.08}>
              <Link
                href={`/industrial-solutions/${item.slug}`}
                className="group relative flex flex-col justify-between h-full rounded-2xl bg-white/5 backdrop-blur border border-white/10 p-7 sm:p-8 hover:border-gold hover:bg-white/10 transition-all duration-300 hover:-translate-y-1.5 shadow-xl overflow-hidden"
              >
                {/* Visual / Image product preview */}
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-6 bg-white/10 border border-white/15">
                  {item.visual ? (
                    <Image
                      src={item.visual}
                      alt={item.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-contain p-6 group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center text-white/30">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                        <rect x="3" y="5" width="18" height="14" rx="2" />
                        <path d="M3 15l5-4 4 3 3-2 6 5" />
                        <circle cx="8.5" cy="9.5" r="1.5" />
                      </svg>
                    </div>
                  )}
                  {item.tag && (
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-gold bg-abyss/90 backdrop-blur px-2.5 py-1 rounded border border-gold/30">
                        {item.tag}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-mono text-xs font-bold text-gold">0{idx + 1}</span>
                    <div className="flex items-center gap-1.5">
                      {item.hardwareUsed?.map((hw) => (
                        <span key={hw} className="font-mono text-[9px] uppercase px-2 py-0.5 rounded bg-white/10 text-white/70">
                          {hw}
                        </span>
                      ))}
                    </div>
                  </div>

                  <h3 className="font-display font-extrabold text-white text-2xl group-hover:text-gold transition-colors">
                    {item.name}
                  </h3>

                  <p className="mt-3 text-white/70 text-sm leading-relaxed line-clamp-3">
                    {item.summary}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono font-bold text-gold">
                  <span>View System Details</span>
                  <span className="group-hover:translate-x-1 transition-transform text-white">→</span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
