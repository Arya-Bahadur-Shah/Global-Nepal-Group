/* ============================================================
   SOFTWARE SOLUTIONS — LISTING  (/software-solutions)
   Every software platform as a card — image, name, summary, link —
   linking to its own full detail page at /software-solutions/[slug].
   ============================================================ */
import Link from 'next/link'
import Image from 'next/image'
import { getSolutions } from '@/lib/content'
import { Reveal, ArrowIcon } from '@/components/ui'

export const metadata = { title: 'Software Solutions — Global Nepal Group' }

export default function SoftwareSolutionsListingPage() {
  const solutions = getSolutions()

  return (
    <>
      {/* Page hero */}
      <section className="relative bg-abyss pt-[72px] overflow-hidden border-b border-marine/50">
        <div className="absolute inset-0 u-grid opacity-60 pointer-events-none" />
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-crimson/40 blur-3xl anim-pulse pointer-events-none" />
        <div className="relative mx-auto max-w-content px-5 sm:px-8 py-20">
          <Reveal>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-rose text-crimsonDeep border border-roseMid font-mono text-xs font-bold uppercase tracking-wider mb-3">
              Our Software Ecosystem
            </div>
            <h1 className="u-underline mt-2 font-display font-extrabold text-white text-5xl sm:text-6xl tracking-tight">Software Solutions</h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-8 text-lg text-white/90 max-w-2xl font-normal leading-relaxed">
              The software platforms we build to identify, track, and account for assets across your entire supply chain.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Solution cards — image + name + summary */}
      <section className="bg-paper py-20">
        <div className="mx-auto max-w-content px-5 sm:px-8 grid sm:grid-cols-2 gap-8">
          {solutions.map((solution, i) => (
            <Reveal key={solution.slug} variant={i % 2 ? 'right' : 'left'} delay={(i % 2) * 0.06}>
              <Link
                href={`/software-solutions/${solution.slug}`}
                className="group flex flex-col h-full rounded-2xl border-2 border-cloud bg-white overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:border-crimson hover:shadow-xl shadow-sm"
              >
                {/* Solution image */}
                <div className="relative aspect-[16/9] bg-mist overflow-hidden">
                  {solution.visual ? (
                    <Image src={solution.visual} alt={solution.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center bg-ocean">
                      <span className="font-display font-extrabold text-white/30 text-4xl">{solution.name}</span>
                    </div>
                  )}
                </div>
                <div className="p-8 flex flex-col flex-1">
                  <div className="h-1.5 w-12 rounded-full bg-gradient-to-r from-crimson to-crimsonBright group-hover:w-20 transition-all duration-500" />
                  <div className="mt-5">
                    <span className="font-mono text-xs font-bold tracking-widest uppercase text-crimsonDeep bg-rose px-2.5 py-1 rounded-md border border-roseMid inline-block">
                      {solution.tag}
                    </span>
                  </div>
                  {solution.logo ? (
                    <div className="relative h-10 w-36 sm:h-12 sm:w-44 mt-3">
                      <Image src={solution.logo} alt={solution.name} fill sizes="180px" className="object-contain object-left" />
                    </div>
                  ) : (
                    <h2 className="mt-3 font-display font-extrabold text-ocean text-3xl group-hover:text-crimson transition-colors">{solution.name}</h2>
                  )}
                  <p className="mt-4 text-steel leading-relaxed flex-1 font-medium">{solution.summary}</p>
                  <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-crimson group-hover:gap-2.5 transition-all">
                    View {solution.name} <ArrowIcon />
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
