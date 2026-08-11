/* ============================================================
   HOME SCENE 7 — GLOBAL BRANDS WE EXPORT
   Named tiles for the four authorized brands (Zebra, Rynan, HID,
   Yesmark) + an "expanding" tile. Reinforces the "world -> Nepal"
   half of the story. Logos (when present) come from content/brands.json.
   ============================================================ */
import Image from 'next/image'
import { Reveal, SectionKicker } from '@/components/ui'

export default function BrandsExport({ brands }) {
  return (
    <section id="brands" className="relative bg-ocean py-24 overflow-hidden">
      <div className="absolute inset-0 u-grid opacity-25" />
      <div className="relative mx-auto max-w-content px-5 sm:px-8">
        <Reveal className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-crimson text-white font-mono text-xs font-bold uppercase tracking-wider mb-2 shadow-md">
            Global Brands We Export
          </div>
          <h2 className="mt-2 font-display font-extrabold text-white text-4xl sm:text-5xl tracking-tight leading-[1.03]">
            The world&rsquo;s technology, delivered to Nepal
          </h2>
          <p className="mt-4 text-white/85 text-base font-normal">As the authorized bridge, we bring these brands to Nepali industry — with more partners on the way.</p>
        </Reveal>

        <div className="mt-12 grid grid-cols-2 lg:grid-cols-5 gap-5">
          {brands.map((brand, i) => (
            <Reveal key={brand.slug} delay={i * 0.05}>
              <div className="group h-48 rounded-2xl border-2 border-white/20 bg-white shadow-xl hover:border-crimsonBright hover:scale-105 transition-all duration-300 p-6 flex flex-col items-center justify-center text-center">
                {/* Logo image when we have one; otherwise a clean text lockup */}
                {brand.logo ? (
                  <div className="relative h-20 w-full px-2">
                    <Image src={brand.logo} alt={brand.name} fill sizes="200px" className="object-contain" />
                  </div>
                ) : (
                  <span className="font-display font-extrabold text-3xl text-ocean">{brand.name}</span>
                )}
                <span className="mt-3 text-xs font-semibold text-steel leading-tight">{brand.focus}</span>
              </div>
            </Reveal>
          ))}
          {/* "Expanding" tile — signals growth without naming brands not yet carried */}
          <Reveal delay={brands.length * 0.05}>
            <div className="h-48 rounded-2xl border-2 border-dashed border-white/40 bg-marine/60 backdrop-blur flex flex-col items-center justify-center text-center px-4">
              <span className="font-display font-bold text-white text-lg">+ More partners</span>
              <span className="mt-2 text-xs text-white/70">Our export portfolio keeps growing</span>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
