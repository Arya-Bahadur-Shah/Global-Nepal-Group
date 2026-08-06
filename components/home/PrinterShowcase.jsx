'use client'
/* ============================================================
   HOME — PRINTER SHOWCASE  (hardware slideshow)
   Light/white background — Leibinger-style rotating showcase with:
   - Real product photos that POP on a clean white card
   - Category pill tabs (All / Coding & Marking / Barcode / RFID / ID Card)
   - Auto-advance every 5 s, pause on hover
   - Animated progress bar + dot + prev/next controls
   ============================================================ */
import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowIcon, Reveal, SectionKicker } from '@/components/ui'

const SLIDES = [
  {
    category: 'Coding & Marking',
    brand: 'Rynan',
    brandLogo: '/assets/brands/rynan.png',
    model: 'R20 TIJ Printer',
    tagline: 'High-Speed Industrial Coding',
    description:
      'Print sharp barcodes, text and graphics at 600 DPI on paper, plastic and metal — wireless, eco-friendly and production-line ready.',
    image: '/assets/products/rynan/r20.jpg',
    specs: ['600 DPI resolution', 'Wireless connectivity', 'MAX / PRO / REACH variants'],
    href: '/hardware/rynan/r20',
    accent: '#C99A3C',
    accentLight: '#FEF3C7',
  },
  {
    category: 'Coding & Marking',
    brand: 'Rynan',
    brandLogo: '/assets/brands/rynan.png',
    model: 'B1040 TIJ Printer',
    tagline: 'Compact Coding Powerhouse',
    description:
      'Compact thermal inkjet coder for high-speed production lines — easy install, zero solvents, minimal maintenance.',
    image: '/assets/products/rynan/b1040.jpg',
    specs: ['600 DPI', 'PRO & MAX models', 'Eco-friendly inks'],
    href: '/hardware/rynan/b1040',
    accent: '#C99A3C',
    accentLight: '#FEF3C7',
  },
  {
    category: 'Coding & Marking',
    brand: 'Rynan',
    brandLogo: '/assets/brands/rynan.png',
    model: 'B1040H Handheld Printer',
    tagline: 'Mark Anywhere, Instantly',
    description:
      'Take the print head to the product — not the other way around. 600 DPI handheld TIJ for flexible field coding.',
    image: '/assets/products/rynan/b1040h.jpg',
    specs: ['Handheld & portable', '600 DPI output', 'Paper, plastic, metal'],
    href: '/hardware/rynan/b1040h',
    accent: '#C99A3C',
    accentLight: '#FEF3C7',
  },
  {
    category: 'Barcode Printers',
    brand: 'Zebra',
    brandLogo: '/assets/brands/zebra.png',
    model: 'ZT411 Industrial Printer',
    tagline: 'Industrial Label Printing Redefined',
    description:
      'Built for demanding environments — 4.3″ colour touchscreen, 300 dpi, up to 14 ips. The benchmark for industrial label printing.',
    image: '/assets/products/zebra/zt411.jpg',
    specs: ['4.3" colour display', '300 dpi / 14 ips', 'USB · Ethernet · Bluetooth'],
    href: '/hardware/zebra/zt411',
    accent: '#0ea5e9',
    accentLight: '#E0F2FE',
  },
  {
    category: 'Barcode Printers',
    brand: 'Zebra',
    brandLogo: '/assets/brands/zebra.png',
    model: 'ZD230 Desktop Printer',
    tagline: 'Reliable Desktop Label Printing',
    description:
      'Cost-effective, compact and fast — 6 ips direct thermal/transfer label printer ideal for retail, healthcare and logistics dispatch.',
    image: '/assets/products/zebra/zd230.jpg',
    specs: ['Direct thermal / TT', 'Up to 6 in/s', 'USB connectivity'],
    href: '/hardware/zebra/zd230',
    accent: '#0ea5e9',
    accentLight: '#E0F2FE',
  },
  {
    category: 'RFID',
    brand: 'Zebra',
    brandLogo: '/assets/brands/zebra.png',
    model: 'FX9600 RFID Reader',
    tagline: 'Enterprise-Grade RFID Intelligence',
    description:
      'High-performance fixed UHF RFID reader with 8 RF ports and PoE — reads dense tag populations at high speed in warehouses and manufacturing.',
    image: '/assets/products/zebra/fx9600.jpg',
    specs: ['8 RF ports', 'PoE powered', 'Dense-tag environments'],
    href: '/hardware/zebra/fx9600',
    accent: '#10b981',
    accentLight: '#D1FAE5',
  },
  {
    category: 'ID Card',
    brand: 'HID',
    brandLogo: '/assets/brands/hid.png',
    model: 'HDP5000e Card Printer',
    tagline: 'Secure Government-Grade ID Printing',
    description:
      'Over-the-edge HD retransfer at 600 DPI — the trusted choice for government IDs, banking cards and secure access credentials.',
    image: '/assets/products/hid/hdp5000e.jpg',
    specs: ['600 DPI retransfer', 'Dual-sided printing', 'Smart-card encoding'],
    href: '/hardware/hid/hdp5000e',
    accent: '#8b5cf6',
    accentLight: '#EDE9FE',
  },
  {
    category: 'ID Card',
    brand: 'HID',
    brandLogo: '/assets/brands/hid.png',
    model: 'DTC1500 Card Printer',
    tagline: 'Dependable Direct-to-Card Printing',
    description:
      'Straightforward, reliable card issuance for corporate badges and access cards — compact design, professional output.',
    image: '/assets/products/hid/dtc1500.jpg',
    specs: ['Direct-to-card', 'Single & dual-sided', 'Corporate & access cards'],
    href: '/hardware/hid/dtc1500',
    accent: '#8b5cf6',
    accentLight: '#EDE9FE',
  },
]

const CATEGORIES = ['All', 'Coding & Marking', 'Barcode Printers', 'RFID', 'ID Card']

export default function PrinterShowcase() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const [progress, setProgress] = useState(0)
  const progressRef = useRef(null)
  const INTERVAL = 5000

  const filtered = activeCategory === 'All'
    ? SLIDES
    : SLIDES.filter((s) => s.category === activeCategory)

  const safeCurrent = Math.min(current, filtered.length - 1)

  const goTo = useCallback(
    (idx) => {
      setCurrent((idx + filtered.length) % filtered.length)
      setProgress(0)
    },
    [filtered.length]
  )

  useEffect(() => {
    if (paused) return
    const tick = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          setCurrent((c) => (c + 1) % filtered.length)
          return 0
        }
        return p + 100 / (INTERVAL / 100)
      })
    }, 100)
    return () => clearInterval(tick)
  }, [paused, filtered.length])

  useEffect(() => {
    setCurrent(0)
    setProgress(0)
  }, [activeCategory])

  const slide = filtered[safeCurrent] ?? filtered[0]
  if (!slide) return null

  return (
    <section
      id="hardware-showcase"
      className="relative bg-abyss text-white overflow-hidden border-b border-marine/50"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Blueprint grid background */}
      <div className="absolute inset-0 u-grid opacity-25 pointer-events-none" />

      {/* Saturated accent glow on dark background */}
      <div
        className="hidden sm:block absolute right-0 top-1/4 h-[500px] w-[500px] rounded-full blur-[100px] pointer-events-none transition-all duration-700 opacity-30"
        style={{ background: slide.accent }}
      />

      <div className="relative mx-auto max-w-content px-5 sm:px-8 py-16 lg:py-24">
        {/* ── Header ── */}
        <Reveal className="mb-12">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-crimson/20 border border-crimsonBright/40 font-mono text-xs font-bold text-crimsonBright uppercase tracking-widest mb-3">
                Hardware Showcase
              </div>
              <h2 className="mt-1 font-display font-extrabold text-white text-4xl sm:text-5xl tracking-tight leading-[1.05]">
                World-Class Hardware,<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-crimson to-crimsonBright">
                  Delivered to Nepal
                </span>
              </h2>
            </div>
            {/* Category pills with real unselected/selected contrast */}
            <div className="flex flex-wrap gap-2.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold font-mono tracking-wider transition-all duration-300 ${
                    activeCategory === cat
                      ? 'bg-crimson text-white border-2 border-crimsonBright shadow-lg shadow-crimson/40 scale-105'
                      : 'bg-marine/90 text-white/90 border border-cloud/20 hover:bg-crimson/80 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </Reveal>

        {/* ── Main slide layout ── */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left: text */}
          <div key={`text-${safeCurrent}-${activeCategory}`} className="animate-slideIn">
            {/* brand badge */}
            <div
              className="inline-flex items-center gap-3 px-4 py-2 rounded-full border-2 text-xs font-bold font-mono tracking-wider mb-6 bg-white/10 backdrop-blur shadow-md"
              style={{ borderColor: `${slide.accent}90`, color: '#FFFFFF' }}
            >
              {slide.brandLogo ? (
                <div className="relative h-5 w-16 bg-white px-2 py-0.5 rounded">
                  <Image src={slide.brandLogo} alt={slide.brand} fill className="object-contain p-0.5" />
                </div>
              ) : (
                <span className="font-bold text-white">{slide.brand}</span>
              )}
              <span className="text-white/40">•</span>
              <span className="text-white/90">{slide.category}</span>
            </div>

            <h3 className="font-display font-extrabold text-white text-3xl sm:text-4xl leading-tight mb-2">
              {slide.model}
            </h3>
            <p className="font-semibold text-lg mb-4 text-crimsonBright">
              {slide.tagline}
            </p>
            <p className="text-white/80 leading-relaxed text-base mb-8">
              {slide.description}
            </p>

            {/* Spec chips — solid fills */}
            <div className="flex flex-wrap gap-3 mb-10">
              {slide.specs.map((s) => (
                <span
                  key={s}
                  className="flex items-center gap-2 text-sm font-mono text-white bg-marine/90 border border-white/15 px-4 py-2 rounded-xl shadow-sm"
                >
                  <span className="text-crimsonBright font-bold">✓</span> {s}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <Link
                href={slide.href}
                className="group inline-flex items-center gap-2.5 rounded-xl bg-crimson px-7 py-4 font-semibold text-white hover:bg-crimsonD shadow-xl shadow-crimson/30 transition-all text-sm"
              >
                View Product
                <span className="group-hover:translate-x-1 transition-transform"><ArrowIcon /></span>
              </Link>
              <Link
                href="/hardware"
                className="inline-flex items-center gap-2 text-sm font-semibold text-white/70 hover:text-white transition-colors"
              >
                All hardware <ArrowIcon />
              </Link>
            </div>
          </div>

          {/* Right: product image — FLOATING WHITE CARD ON DARK SURROUND */}
          <div key={`img-${safeCurrent}-${activeCategory}`} className="animate-slideIn">
            <div className="relative">
              {/* Glow behind the card */}
              <div
                className="absolute -inset-4 rounded-[2.5rem] opacity-60 blur-2xl transition-all duration-700"
                style={{ background: slide.accent }}
              />
              {/* Floating White Image card for max product POP */}
              <div
                className="relative rounded-3xl bg-white shadow-[0_32px_90px_-15px_rgba(0,0,0,0.6)] border-2 border-white/40 overflow-hidden aspect-[4/3] flex items-center justify-center"
              >
                <Image
                  src={slide.image}
                  alt={slide.model}
                  fill
                  className="object-contain p-8 drop-shadow-2xl transition-transform duration-700 hover:scale-105 relative z-10"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority={safeCurrent === 0}
                />
                {/* Brand label bottom-left */}
                <div
                  className="absolute bottom-4 left-4 z-20 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold border-2 bg-ocean text-white border-marine"
                >
                  {slide.brand}
                </div>
                {/* Slide number top-right */}
                <div className="absolute top-4 right-4 z-20 font-mono text-xs font-bold text-steel bg-mist/80 px-2.5 py-1 rounded-md">
                  {String(safeCurrent + 1).padStart(2, '0')} / {String(filtered.length).padStart(2, '0')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Slide controls ── */}
        <div className="mt-12 flex items-center gap-6">
          {/* Dot nav */}
          <div className="flex gap-2">
            {filtered.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === safeCurrent ? 28 : 8,
                  height: 8,
                  background: i === safeCurrent ? '#C8102E' : '#2E3540',
                }}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          {/* Progress bar */}
          <div className="flex-1 h-1 bg-marine rounded-full overflow-hidden">
            <div
              ref={progressRef}
              className="h-full rounded-full transition-none bg-crimson"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Prev / Next */}
          <div className="flex gap-2">
            <button
              onClick={() => goTo(safeCurrent - 1)}
              className="h-10 w-10 rounded-full border border-white/20 bg-marine flex items-center justify-center text-white hover:bg-crimson transition-all shadow-md"
              aria-label="Previous"
            >
              <svg className="h-4 w-4 rotate-180" viewBox="0 0 16 16"><path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button
              onClick={() => goTo(safeCurrent + 1)}
              className="h-10 w-10 rounded-full border border-white/20 bg-marine flex items-center justify-center text-white hover:bg-crimson transition-all shadow-md"
              aria-label="Next"
            >
              <svg className="h-4 w-4" viewBox="0 0 16 16"><path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
