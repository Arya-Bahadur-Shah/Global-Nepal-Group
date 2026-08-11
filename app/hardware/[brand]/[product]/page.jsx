/* ============================================================
   HARDWARE — LEVEL 3  (/hardware/[brand]/[product])
   Full product detail: image gallery, description, spec table, and
   the SPEC-SHEET PDF button (opens in a new tab / downloads).

   Dynamic route: [brand]/[product] = brand slug + product slug.
   generateStaticParams() pre-builds one page per product.
   ============================================================ */
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getProducts, getProduct, getBrand, getProductsByBrand } from '@/lib/content'
import { Reveal, ArrowIcon } from '@/components/ui'

/* Pre-generate a static page for every brand/product pair. */
export function generateStaticParams() {
  return getProducts().map((p) => ({ brand: p.brandSlug, product: p.slug }))
}

export function generateMetadata({ params }) {
  const product = getProduct(params.brand, params.product)
  return { title: product ? `${product.name} — Global Nepal Group` : 'Product' }
}

export default function ProductDetailPage({ params }) {
  const product = getProduct(params.brand, params.product)
  if (!product) notFound()
  const brand = getBrand(params.brand)
  const related = getProductsByBrand(params.brand).filter((p) => p.slug !== product.slug).slice(0, 3)
  const specEntries = product.specs ? Object.entries(product.specs) : []

  return (
    <>
      {/* Top: breadcrumb + two-column detail */}
      <section className="bg-paper pt-[72px]">
        <div className="mx-auto max-w-content px-5 sm:px-8 py-14">
          {/* Breadcrumb: Hardware / Brand / Product */}
          <nav className="flex items-center gap-2 font-mono text-xs text-steel">
            <Link href="/hardware" className="hover:text-gold">Hardware</Link><span>/</span>
            <Link href={`/hardware/${params.brand}`} className="hover:text-gold">{brand?.name || params.brand}</Link><span>/</span>
            <span className="text-ocean">{product.name}</span>
          </nav>

          <div className="mt-8 grid lg:grid-cols-2 gap-12 items-start">
            {/* LEFT — image / gallery */}
            <Reveal>
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-white border border-cloud">
                {product.image ? (
                  <Image src={product.image} alt={product.name} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-contain p-8" />
                ) : (
                  <div className="absolute inset-0 grid place-items-center text-steel/40">
                    <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.1">
                      <rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 15l5-4 4 3 3-2 6 5" /><circle cx="8.5" cy="9.5" r="1.5" />
                    </svg>
                  </div>
                )}
              </div>
              {/* Thumbnail strip (only if a gallery is provided) */}
              {product.gallery?.length > 0 && (
                <div className="mt-4 grid grid-cols-4 gap-3">
                  {product.gallery.map((src, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-white border border-cloud">
                      <Image src={src} alt={`${product.name} ${i + 1}`} fill sizes="120px" className="object-contain p-2" />
                    </div>
                  ))}
                </div>
              )}
            </Reveal>

            {/* RIGHT — name, description, spec sheet, CTAs */}
            <Reveal delay={0.06}>
              <div className="font-mono text-[11px] tracking-widest uppercase text-gold">{brand?.name}</div>
              <h1 className="mt-2 font-display font-extrabold text-ocean text-4xl tracking-tight">{product.name}</h1>
              {product.model && <p className="mt-1 text-steel font-medium">{product.model}</p>}
              <p className="mt-5 text-ink leading-relaxed">{product.description}</p>

              {/* Spec-sheet PDF button(s) — open in a new tab (target=_blank).
                 Set product.specSheet to a /public path or an external URL.
                 If a product has multiple variants (e.g. R20 MAX/PRO/REACH),
                 list them in product.specSheetVariants and each gets its own button.
                 Hidden automatically when no spec sheet exists yet. */}
              <div className="mt-8 flex flex-wrap gap-3">
                {product.specSheetVariants?.length > 0 ? (
                  product.specSheetVariants.map((variant) => (
                    <a
                      key={variant.label}
                      href={variant.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg bg-ocean px-5 py-3 text-sm font-semibold text-white hover:bg-crimson transition-colors"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z" /><path d="M9 13h6M9 17h4" />
                      </svg>
                      {variant.label} brochure
                    </a>
                  ))
                ) : product.specSheet ? (
                  <a
                    href={product.specSheet}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-ocean px-6 py-3.5 font-semibold text-white hover:bg-crimson transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z" /><path d="M9 13h6M9 17h4" />
                    </svg>
                    Download spec sheet (PDF)
                  </a>
                ) : (
                  <span className="inline-flex items-center gap-2 rounded-lg border border-cloud px-6 py-3.5 font-semibold text-steel">
                    Spec sheet coming soon
                  </span>
                )}
                <Link href="/contact" className="inline-flex items-center gap-2 rounded-lg border-2 border-cloud px-6 py-3.5 font-semibold text-ocean hover:border-gold hover:text-gold transition-colors">
                  Request a quote <ArrowIcon />
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Specifications table */}
      {specEntries.length > 0 && (
        <section className="bg-mist py-16">
          <div className="mx-auto max-w-content px-5 sm:px-8">
            <Reveal>
              <h2 className="font-display font-bold text-ocean text-2xl">Specifications</h2>
              <dl className="mt-6 max-w-2xl divide-y divide-cloud border-y border-cloud">
                {specEntries.map(([key, value]) => (
                  <div key={key} className="flex justify-between gap-6 py-3.5">
                    <dt className="text-steel">{key}</dt>
                    <dd className="text-ink font-medium text-right">{value}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </section>
      )}

      {/* Related products from the same brand */}
      {related.length > 0 && (
        <section className="bg-paper py-16">
          <div className="mx-auto max-w-content px-5 sm:px-8">
            <Reveal className="flex items-end justify-between">
              <h2 className="font-display font-bold text-ocean text-2xl">More from {brand?.name}</h2>
              <Link href={`/hardware/${params.brand}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold hover:text-crimson">All {brand?.name} products <ArrowIcon /></Link>
            </Reveal>
            <div className="mt-8 grid sm:grid-cols-3 gap-x-8 gap-y-10">
              {related.map((p) => (
                <Link key={p.slug} href={`/hardware/${p.brandSlug}/${p.slug}`} className="group">
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-mist border border-cloud grid place-items-center">
                    {p.image
                      ? <Image src={p.image} alt={p.name} fill sizes="(max-width: 640px) 50vw, 240px" className="object-contain p-5 group-hover:scale-105 transition-transform" />
                      : <span className="text-steel/40 text-sm">No image</span>}
                  </div>
                  <h3 className="mt-3 font-display font-semibold text-ocean group-hover:text-crimson transition-colors">{p.name}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
