/* ============================================================
   INDUSTRIAL SOLUTIONS — LEVEL 1 LISTING  (/industrial-solutions)
   Lists each Industrial Solution as a tile (like Hardware brands).
   Clicking a solution tile goes to /industrial-solutions/[slug],
   which displays that solution's product cards grid (Level 2).
   ============================================================ */
import Link from 'next/link'
import Image from 'next/image'
import { getIndustrialSolutions, getProductsByIndustrialSolution } from '@/lib/content'
import { Reveal, ArrowIcon } from '@/components/ui'

export const metadata = { title: 'Industrial Solutions — Global Nepal Group' }

export default async function IndustrialSolutionsListingPage() {
  const industrialSolutions = await getIndustrialSolutions()

  const productCounts = Object.fromEntries(
    await Promise.all(
      industrialSolutions.map(async (sol) => [sol.slug, (await getProductsByIndustrialSolution(sol.slug)).length])
    )
  )

  return (
    <>
      {/* Page hero */}
      <section className="relative bg-abyss pt-[72px] overflow-hidden border-b border-marine/50">
        <div className="absolute inset-0 u-grid opacity-60 pointer-events-none" />
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-gold/30 blur-3xl anim-pulse pointer-events-none" />
        <div className="relative mx-auto max-w-content px-5 sm:px-8 py-20">
          <Reveal className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-gold/15 text-gold border border-gold/30 font-mono text-xs font-bold uppercase tracking-wider mb-3">
              Heavy Industry &amp; Plant Systems
            </div>
            <h1 className="u-underline mt-2 font-display font-extrabold text-white text-5xl sm:text-6xl tracking-tight">
              Industrial Solutions
            </h1>
            <p className="mt-5 text-lg text-white/90 font-normal leading-relaxed">
              Industrial solution frameworks engineered for manufacturing plants, heavy equipment fleets, and automated logistics hubs across Nepal. Select a solution to explore its dedicated equipment products.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Industrial Solution tiles (Level 1 — solutions catalog) */}
      <section className="bg-paper py-20">
        <div className="mx-auto max-w-content px-5 sm:px-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {industrialSolutions.map((solution, i) => {
            const productCount = productCounts[solution.slug] || 0
            return (
              <Reveal key={solution.slug} delay={i * 0.06}>
                <Link
                  href={`/industrial-solutions/${solution.slug}`}
                  className="group flex flex-col h-full rounded-2xl border-2 border-cloud bg-white p-7 transition-all duration-300 hover:-translate-y-1.5 hover:border-gold hover:shadow-xl shadow-sm overflow-hidden"
                >
                  {/* Solution visual / image preview */}
                  <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-mist border border-cloud mb-5">
                    {solution.visual ? (
                      <Image
                        src={solution.visual}
                        alt={solution.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
                        className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 grid place-items-center bg-ocean text-white/40">
                        <span className="font-display font-extrabold text-2xl">{solution.name}</span>
                      </div>
                    )}
                    {solution.tag && (
                      <div className="absolute top-2.5 left-2.5">
                        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-ocean bg-white/90 backdrop-blur px-2.5 py-1 rounded border border-cloud">
                          {solution.tag}
                        </span>
                      </div>
                    )}
                  </div>

                  <h2 className="font-display font-extrabold text-2xl text-ocean group-hover:text-gold transition-colors">
                    {solution.name}
                  </h2>
                  <p className="mt-3 text-steel leading-relaxed flex-1 font-medium text-sm">
                    {solution.summary || solution.description}
                  </p>

                  <div className="mt-6 flex items-center justify-between border-t border-cloud/60 pt-4">
                    <span className="font-mono text-xs font-bold tracking-wider uppercase text-steel bg-mist px-2.5 py-1 rounded-md">
                      {productCount} {productCount === 1 ? 'product' : 'products'}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-sm font-bold text-gold group-hover:gap-2.5 transition-all">
                      View products <ArrowIcon />
                    </span>
                  </div>
                </Link>
              </Reveal>
            )
          })}
        </div>
      </section>
    </>
  )
}
