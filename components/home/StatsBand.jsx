/* ============================================================
   HOME SCENE 3 — STATS BAND
   Four animated counters on the deep-navy band. Numbers count up
   when scrolled into view (see <CountUp/>).
   ============================================================ */
import Image from 'next/image'
import { Reveal, CountUp } from '@/components/ui'

export default function StatsBand({ stats }) {
  // Split "10+" / "99.9%" into number + suffix so CountUp can animate the digits.
  const parse = (value) => {
    const match = String(value).match(/^([\d.]+)(.*)$/)
    return match ? { end: parseFloat(match[1]), suffix: match[2] } : { end: 0, suffix: value }
  }
  return (
    <section className="bg-crimson text-white py-16 border-y border-crimsonD relative overflow-hidden shadow-xl">
      {/* Stock photo backdrop — clearly visible, with a semi-transparent crimson
          wash on top so it stays on-brand and the white counters remain legible */}
      {/* next/image rather than a bare <img>: this is full-bleed on the
          homepage, so served raw it ships the original JPEG at full size
          to every visitor. Through the optimizer it becomes AVIF/WebP at
          the width actually needed. */}
      <Image
        src="/assets/blogs/Stock.jpg"
        alt=""
        aria-hidden="true"
        fill
        sizes="100vw"
        className="object-cover pointer-events-none"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-crimson/85 via-crimson/70 to-crimsonD/85 pointer-events-none" />
      <div className="mx-auto max-w-content px-5 sm:px-8 grid grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-6 relative z-10">
        {stats.map((stat, i) => {
          const { end, suffix } = parse(stat.value)
          return (
            <Reveal key={stat.label} delay={i * 0.07}>
              <div className="font-display font-extrabold text-white text-4xl sm:text-5xl lg:text-6xl drop-shadow-md">
                <CountUp end={end} suffix={suffix} />
              </div>
              <p className="mt-2 text-sm sm:text-base font-semibold text-white/95 uppercase tracking-wider font-mono">{stat.label}</p>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}
