/* ============================================================
   HARDWARE — LEVEL 2  (/hardware/[brand])
   A single brand's page: header + a grid of that brand's product
   cards (the layout from the reference screenshot). Clicking a card
   opens the product detail page (Level 3).

   Dynamic route: [brand] = the brand slug (zebra, rynan, hid, ...).
   generateStaticParams() pre-builds one page per brand.
   ============================================================ */
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getBrands, getBrand, getProductsByBrand } from '@/lib/content'
import { Reveal, SectionKicker } from '@/components/ui'
import ProductCard from '@/components/hardware/ProductCard'

/* Pre-generate a static page for every brand slug. */
export function generateStaticParams() {
  return getBrands().map((brand) => ({ brand: brand.slug }))
}

/* Per-brand <title>. */
export function generateMetadata({ params }) {
  const brand = getBrand(params.brand)
  return { title: brand ? `${brand.name} — Hardware — Global Nepal Group` : 'Hardware' }
}

export default function BrandPage({ params }) {
  const brand = getBrand(params.brand)
  if (!brand) notFound()                       // unknown brand slug -> 404
  const products = getProductsByBrand(brand.slug)

  return (
    <>
      {/* ── Brand header with full-bleed stock video ── */}
      <section className="relative bg-abyss overflow-hidden" style={{ minHeight: '600px', height: '70vh', maxHeight: '800px' }}>

        {/* === BACKGROUND VIDEO — fills the entire hero, plays on loop === */}
        {brand.heroVideo ? (
          <div className="absolute inset-0">
            <video
              key={brand.heroVideo}
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              poster="/assets/video/hero-poster.jpg"
              className="h-full w-full object-cover"
            >
              <source src={brand.heroVideo} type="video/mp4" />
            </video>
            {/* Bottom-heavy gradient so text at bottom is readable without blocking the video */}
            <div className="absolute inset-0 bg-gradient-to-t from-abyss/85 via-abyss/20 to-transparent" />
            {/* Subtle left-side shade for text legibility */}
            <div className="absolute inset-0 bg-gradient-to-r from-abyss/40 via-transparent to-transparent" />
          </div>
        ) : (
          /* Fallback: plain grid background for OEM */
          <div className="absolute inset-0 u-grid opacity-60" />
        )}

        {/* Content pinned to the bottom-left so the video centre is fully visible */}
        <div className="absolute bottom-0 left-0 right-0 pt-[80px]">
          <div className="mx-auto max-w-content px-5 sm:px-8 pb-10 w-full">
            <div className="max-w-xl">
              {/* Breadcrumb */}
              <Reveal>
                <nav className="flex items-center gap-2 font-mono text-xs text-white/50 mb-4">
                  <Link href="/hardware" className="hover:text-gold transition-colors">Hardware</Link>
                  <span>/</span>
                  <span className="text-white/80">{brand.name}</span>
                </nav>
              </Reveal>
              <Reveal delay={0.05}>
                {brand.logo ? (
                  <div className="relative h-16 w-52 sm:h-20 sm:w-64 mb-4 drop-shadow-2xl">
                    <Image
                      src={brand.logo}
                      alt={brand.name}
                      fill
                      className="object-contain object-left filter brightness-[1.4] drop-shadow-xl"
                    />
                  </div>
                ) : (
                  <h1 className="font-display font-extrabold text-white text-5xl sm:text-6xl tracking-tight drop-shadow-md mb-4">{brand.name}</h1>
                )}
              </Reveal>
              <Reveal delay={0.1}>
                <p className="text-sm sm:text-base text-white/85 leading-relaxed font-normal drop-shadow-md max-w-lg">
                  {brand.blurb}
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>


      {/* Product grid (matches the reference screenshot) */}
      <section className="bg-paper py-20">
        <div className="mx-auto max-w-content px-5 sm:px-8">
          <Reveal><SectionKicker>{brand.name} products</SectionKicker></Reveal>

          {products.length > 0 ? (
            <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {products.map((product, i) => (
                <Reveal key={product.slug} delay={(i % 3) * 0.06}>
                  <ProductCard product={product} />
                </Reveal>
              ))}
            </div>
          ) : (
            /* Empty state — shown until products are added in the CMS/JSON */
            <Reveal>
              <div className="mt-10 rounded-2xl border border-dashed border-cloud bg-white p-12 text-center">
                <p className="text-steel">Products for {brand.name} are coming soon.</p>
                <Link href="/contact" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-ocean px-5 py-3 text-sm font-semibold text-white hover:bg-crimson transition-colors">
                  Ask us what&rsquo;s available
                </Link>
              </div>
            </Reveal>
          )}
        </div>
      </section>
    </>
  )
}
