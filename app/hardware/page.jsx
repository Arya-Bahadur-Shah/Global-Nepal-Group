/* ============================================================
   HARDWARE — LEVEL 1  (/hardware)
   The catalog entry point. Shows every BRAND we carry as a tile.
   Clicking a brand goes to /hardware/<brandSlug>, which lists that
   brand's products. Brand data comes from content/brands.json.
   ============================================================ */
import Link from 'next/link'
import Image from 'next/image'
import { getBrands, getProductsByBrand } from '@/lib/content'
import { Reveal, SectionKicker, ArrowIcon } from '@/components/ui'

export const metadata = { title: 'Hardware — Global Nepal Group' }

export default function HardwareLandingPage() {
  const brands = getBrands()

  return (
    <>
      {/* Page header */}
      <section className="relative bg-abyss pt-[72px] overflow-hidden border-b border-marine/50">
        <div className="absolute inset-0 u-grid opacity-60 pointer-events-none" />
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-crimson/40 blur-3xl pointer-events-none" />
        <div className="relative mx-auto max-w-content px-5 sm:px-8 py-20">
          <Reveal className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-rose text-crimsonDeep border border-roseMid font-mono text-xs font-bold uppercase tracking-wider mb-3">
              Hardware Catalog
            </div>
            <h1 className="mt-2 font-display font-extrabold text-white text-5xl sm:text-6xl tracking-tight">The brands we bring to Nepal</h1>
            <p className="mt-5 text-lg text-white/90 font-normal leading-relaxed">
              Global Nepal Group is the authorized bridge for the world&rsquo;s leading identification brands.
              Choose a brand to explore its products and download spec sheets.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Brand tiles */}
      <section className="bg-paper py-20">
        <div className="mx-auto max-w-content px-5 sm:px-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {brands.map((brand, i) => {
            const productCount = getProductsByBrand(brand.slug).length
            return (
              <Reveal key={brand.slug} delay={i * 0.06}>
                <Link
                  href={`/hardware/${brand.slug}`}
                  className="group flex flex-col h-full rounded-2xl border-2 border-cloud bg-white p-7 transition-all duration-300 hover:-translate-y-1.5 hover:border-crimson hover:shadow-xl shadow-sm"
                >
                  {/* Brand logo or text lockup */}
                  <div className="h-20 sm:h-24 flex items-center">
                    {brand.logo ? (
                      <div className="relative h-16 w-56 sm:h-20 sm:w-64"><Image src={brand.logo} alt={brand.name} fill className="object-contain object-left" /></div>
                    ) : (
                      <span className="font-display font-extrabold text-3xl text-ocean">{brand.name}</span>
                    )}
                  </div>
                  <p className="mt-4 text-steel leading-relaxed flex-1 font-medium">{brand.blurb}</p>
                  <div className="mt-6 flex items-center justify-between border-t border-cloud/60 pt-4">
                    <span className="font-mono text-xs font-bold tracking-wider uppercase text-steel bg-mist px-2.5 py-1 rounded-md">
                      {productCount} {productCount === 1 ? 'product' : 'products'}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-sm font-bold text-crimson group-hover:gap-2.5 transition-all">
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
