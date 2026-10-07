/* ============================================================
   HOME — TRUST & CAPABILITY BAND
   White/light background hardware-driven credibility bar:
   - "Trusted by Government & Industry" with capability chips
   - Scrolling marquee of real client logos
   ============================================================ */
import Image from 'next/image'

const CAPABILITIES = [
  { icon: '🖨', label: 'Industrial Coding & Marking' },
  { icon: '📟', label: 'Barcode & Label Printing' },
  { icon: '📡', label: 'RFID · UHF · NFC' },
  { icon: '🪪', label: 'Secure ID Card Printing' },
  { icon: '🔍', label: 'Barcode Scanning & GS1' },
  { icon: '🔗', label: 'One-Click Traceability' },
]

export default function TrustMarquee({ clients }) {
  return (
    <section className="bg-white text-ocean relative overflow-hidden border-b border-cloud">
      {/* Subtle blueprint grid */}
      <div className="absolute inset-0 u-grid opacity-10 pointer-events-none" />
      <div className="absolute top-0 right-0 h-80 w-80 rounded-full bg-crimson/8 blur-3xl pointer-events-none" />

      {/* ── Top capability row ── */}
      <div className="relative mx-auto max-w-content px-5 sm:px-8 pt-10 pb-8">
        <div className="flex flex-wrap items-center justify-between gap-6">
          {/* Left headline */}
          <div className="shrink-0">
            <p className="font-mono text-[11px] tracking-[0.25em] uppercase text-crimson font-bold mb-1">
              Trusted by Government &amp; Industry
            </p>
            <p className="font-display font-extrabold text-ocean text-xl sm:text-2xl leading-tight">
              Hardware &amp; Software powering Nepal
            </p>
          </div>

          {/* Capability chips — solid high contrast fills */}
          <div className="flex flex-wrap gap-2.5">
            {CAPABILITIES.map((cap) => (
              <span
                key={cap.label}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-mist border border-cloud text-ocean text-xs font-mono font-medium tracking-wide shadow-sm hover:bg-crimson hover:border-crimson hover:text-white transition-all cursor-default"
              >
                <span className="text-sm">{cap.icon}</span>
                {cap.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-cloud" />

      {/* ── Client logo marquee ── */}
      <div className="py-9 bg-paper relative">
        <p className="text-center font-mono text-[11px] tracking-[0.25em] uppercase text-steel font-semibold mb-6">
          Trusted by Govt of Nepal · Commercial Banks · Global Enterprises
        </p>
        <div className="marquee-track relative overflow-hidden flex select-none">
          {/* Primary Track */}
          <div 
            className="anim-marquee flex shrink-0 items-center gap-4 pr-4"
            style={{ willChange: 'transform', transform: 'translateZ(0)' }}
          >
            {clients.map((client, i) => (
              <div
                key={`${client.name}-${i}`}
                className="w-40 h-16 shrink-0 flex items-center justify-center p-2.5 rounded-xl bg-white border-2 border-white/20 shadow-lg hover:border-crimson hover:scale-105 transition-all duration-300"
              >
                <Image
                  src={client.logo}
                  alt={client.name}
                  width={150}
                  height={50}
                  className="max-h-10 w-auto max-w-[120px] object-contain transition-transform duration-300"
                />
              </div>
            ))}
          </div>

          {/* Duplicate Track (for 100% seamless GPU loop) */}
          <div 
            className="anim-marquee flex shrink-0 items-center gap-4 pr-4" 
            aria-hidden="true"
            style={{ willChange: 'transform', transform: 'translateZ(0)' }}
          >
            {clients.map((client, i) => (
              <div
                key={`${client.name}-dupe-${i}`}
                className="w-40 h-16 shrink-0 flex items-center justify-center p-2.5 rounded-xl bg-white border-2 border-white/20 shadow-lg hover:border-crimson hover:scale-105 transition-all duration-300"
              >
                <Image
                  src={client.logo}
                  alt={client.name}
                  width={150}
                  height={50}
                  className="max-h-10 w-auto max-w-[120px] object-contain transition-transform duration-300"
                />
              </div>
            ))}
          </div>

          {/* Edge fades matching light paper backdrop */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-24 sm:w-36 bg-gradient-to-r from-paper via-paper/80 to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 sm:w-36 bg-gradient-to-l from-paper via-paper/80 to-transparent z-10" />
        </div>
      </div>
    </section>
  )
}
