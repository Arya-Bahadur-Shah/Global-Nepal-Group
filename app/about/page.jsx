/* ============================================================
   ABOUT US  (/about)
   Story of the company + values. Animated: page-hero with a gold
   shimmer bar and animated underline, values that alternate slide
   direction, an animated stat strip, and a timeline that reveals.
   ============================================================ */
import Link from 'next/link'
import { getSite } from '@/lib/content'
import { Reveal, SectionKicker, ArrowIcon, CountUp } from '@/components/ui'

export const metadata = { title: 'About Us — Global Nepal Group' }

export default async function AboutPage() {
  const site = await getSite()
  /* Editable from /admin/about (getSite falls back to sensible defaults). */
  const VALUES = site.aboutValues || []
  const TIMELINE = site.aboutTimeline || []
  return (
    <>
      {/* Page hero — dark band, animated underline + shimmer accent */}
      <section className="relative bg-abyss pt-[72px] overflow-hidden">
        <div className="absolute inset-0 u-grid opacity-60" />
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-crimson/15 blur-3xl anim-pulse" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-gold/15 blur-3xl anim-pulse" style={{ animationDelay: '1s' }} />
        <div className="relative mx-auto max-w-content px-5 sm:px-8 py-24">
          <Reveal>
            <SectionKicker>About Us</SectionKicker>
            <h1 className="u-underline mt-4 font-display font-extrabold text-white text-5xl sm:text-6xl tracking-tight leading-[1.03]">
              {site.aboutHeadline}
            </h1>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-8 text-lg text-white/70 leading-relaxed max-w-2xl">{site.mission}</p>
          </Reveal>
          {/* thin animated gold shimmer rule */}
          <div className="mt-10 h-px w-full max-w-2xl u-shimmer" />
        </div>
      </section>

      {/* Animated stat strip — solid 100%-opacity brand red band */}
      <section className="bg-crimson text-white py-16 border-y border-crimsonD shadow-xl relative z-10">
        <div className="mx-auto max-w-content px-5 sm:px-8 grid grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-6">
          {site.stats.map((stat, i) => {
            const m = String(stat.value).match(/^([\d.]+)(.*)$/)
            const end = m ? parseFloat(m[1]) : 0
            const suffix = m ? m[2] : stat.value
            return (
              <Reveal key={stat.label} variant="zoom" delay={i * 0.08}>
                <div className="font-display font-extrabold text-white text-4xl sm:text-5xl lg:text-6xl drop-shadow-md">
                  <CountUp end={end} suffix={suffix} />
                </div>
                <p className="mt-2 text-sm sm:text-base font-bold text-white/95 uppercase tracking-wider font-mono">{stat.label}</p>
              </Reveal>
            )
          })}
        </div>
      </section>

      {/* Values — alternating slide-in direction */}
      <section className="bg-paper py-20">
        <div className="mx-auto max-w-content px-5 sm:px-8">
          <Reveal className="max-w-xl mb-12">
            <SectionKicker>What drives us</SectionKicker>
            <h2 className="u-underline mt-3 font-display font-extrabold text-ocean text-4xl tracking-tight">Our values</h2>
          </Reveal>
          <div className="grid sm:grid-cols-2 gap-6">
            {VALUES.map(([title, body], i) => (
              <Reveal key={title} variant={i % 2 ? 'right' : 'left'} delay={(i % 2) * 0.05}>
                <div className="group h-full rounded-2xl bg-white border border-cloud p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-28px_rgba(14,44,68,.4)]">
                  <div className="h-1.5 w-10 rounded-full bg-gradient-to-r from-crimson to-gold group-hover:w-16 transition-all duration-500" />
                  <h3 className="mt-4 font-display font-bold text-ocean text-xl">{title}</h3>
                  <p className="mt-3 text-steel leading-relaxed">{body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline — reveals down the line */}
      <section className="bg-mist py-20">
        <div className="mx-auto max-w-content px-5 sm:px-8">
          <Reveal className="max-w-xl mb-12">
            <SectionKicker>Our journey</SectionKicker>
            <h2 className="u-underline mt-3 font-display font-extrabold text-ocean text-4xl tracking-tight">How we got here</h2>
          </Reveal>
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute left-[19px] top-2 bottom-2 w-px bg-gradient-to-b from-crimson via-gold to-cloud" aria-hidden="true" />
            <div className="space-y-8">
              {TIMELINE.map(([label, body], i) => (
                <Reveal key={label} variant="left" delay={i * 0.08}>
                  <div className="relative flex items-start gap-6">
                    <span className="relative z-10 mt-1 grid place-items-center h-10 w-10 rounded-full bg-white border-2 border-crimson text-crimson font-mono text-xs font-bold shrink-0">{i + 1}</span>
                    <div className="rounded-xl bg-white border border-cloud p-5 flex-1">
                      <h3 className="font-display font-bold text-ocean">{label}</h3>
                      <p className="mt-1.5 text-steel leading-relaxed">{body}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-paper py-20">
        <div className="mx-auto max-w-content px-5 sm:px-8 text-center">
          <Reveal variant="zoom">
            <h2 className="font-display font-extrabold text-ocean text-3xl sm:text-4xl">See what that means for your line</h2>
            <Link href="/contact?type=demo" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-ocean px-6 py-3.5 font-semibold text-white hover:bg-crimson transition-colors">Request a Demo <ArrowIcon /></Link>
          </Reveal>
        </div>
      </section>
    </>
  )
}
