/* ============================================================
   HOME SCENE 6 — HARDWARE / BRANDS PREVIEW  (Videojet-style grid)
   Clean, structured cards for each brand we carry, with a Rynan-style
   hover lift. Links into the full catalog at /hardware/<brandSlug>.
   Data from the content layer (content/brands.json).
   ============================================================ */
import Image from 'next/image'
import Link from 'next/link'
import { Reveal, SectionKicker, ArrowIcon } from '@/components/ui'

export default function HardwareGrid({ brands }) {
  return (
    <section id="hardware" className="bg-paper py-24">
      <div className="mx-auto max-w-content px-5 sm:px-8">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-rose text-crimsonDeep border border-roseMid font-mono text-xs font-bold uppercase tracking-wider mb-2">
              Hardware Catalog
            </div>
            <h2 className="mt-2 font-display font-extrabold text-ocean text-4xl sm:text-5xl tracking-tight">Proven identification hardware</h2>
          </div>
          <Link href="/hardware" className="inline-flex items-center gap-2 text-sm font-bold text-crimson hover:text-crimsonD transition-colors">
            Browse all brands <ArrowIcon />
          </Link>
        </Reveal>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {brands.map((brand, i) => (
            <Reveal key={brand.slug} delay={i * 0.06}>
              <Link
                href={`/hardware/${brand.slug}`}
                className="group flex flex-col h-full rounded-2xl border-2 border-cloud bg-white p-7 transition-all duration-300 hover:-translate-y-1.5 hover:border-crimson hover:shadow-xl shadow-sm"
              >
                <div className="h-20 sm:h-24 flex items-center">
                  {brand.logo ? (
                    <div className="relative h-16 w-56 sm:h-20 sm:w-64"><Image src={brand.logo} alt={brand.name} fill className="object-contain object-left" /></div>
                  ) : (
                    <span className="font-display font-extrabold text-3xl text-ocean">{brand.name}</span>
                  )}
                </div>
                <p className="mt-3 text-sm text-steel leading-relaxed flex-1 font-medium">{brand.focus}</p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-crimson group-hover:gap-2.5 transition-all">
                  View products <ArrowIcon />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
