'use client'
/* ============================================================
   HOME SCENE 1 — HERO  ("Connecting Nepal to the World")
   Full-bleed looping background video visible clearly behind a
   light gradient wash, featuring the main tagline badge and CTAs.
   ============================================================ */
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowIcon } from '@/components/ui'

/* Fallback clips if the admin hasn't set any in /admin/home. */
const DEFAULT_CLIPS = [
  '/assets/video/hero-loop-primary.mp4',
  '/assets/video/hero-loop-alt.mp4',
]

export default function HeroConnect({ site }) {
  const stageRef = useRef(null)
  const videoRef = useRef(null)
  const [clip, setClip] = useState(0)
  /* The video is held back until the page has finished loading.

     Measured on the live site: every resource fired at once ~650ms in,
     and 10 KB JavaScript chunks took 2.5 SECONDS to arrive — not
     because they're slow, but because a 2 MB video was downloading
     alongside 115 KB of JS and taking the bandwidth. Time to first
     byte was 45ms, so the server was never the problem.

     The poster image shows immediately either way, so nothing looks
     empty; the video simply starts a moment later, once it isn't
     competing with the page it sits behind. */
  const [videoReady, setVideoReady] = useState(false)

  /* Hero loop clips come from the admin panel (site.heroVideos); they play
     back-to-back on an endless loop. A single clip just loops on itself. */
  const HERO_CLIPS = Array.isArray(site?.heroVideos) && site.heroVideos.length ? site.heroVideos : DEFAULT_CLIPS

  useEffect(() => {
    const items = stageRef.current?.querySelectorAll('.reveal') || []
    const timers = []
    items.forEach((el, i) => {
      const t = setTimeout(() => el.classList.add('is-visible'), 140 + i * 90)
      timers.push(t)
    })
    return () => timers.forEach((t) => clearTimeout(t))
  }, [])

  /* Start fetching the video only once the page has settled. `load`
     has usually already fired by the time this runs, so the timeout
     covers that case too. */
  useEffect(() => {
    if (document.readyState === 'complete') {
      const t = setTimeout(() => setVideoReady(true), 200)
      return () => clearTimeout(t)
    }
    const onLoad = () => setVideoReady(true)
    window.addEventListener('load', onLoad, { once: true })
    // Never leave the hero on a still image if `load` never fires
    // (a hung third-party request, say).
    const fallback = setTimeout(() => setVideoReady(true), 4000)
    return () => {
      window.removeEventListener('load', onLoad)
      clearTimeout(fallback)
    }
  }, [])

  // When the source swaps, load and play the newly-selected clip.
  useEffect(() => {
    const v = videoRef.current
    if (!v || !videoReady) return
    v.load()
    v.play().catch(() => {})
  }, [clip, videoReady])

  const handleEnded = () => setClip((c) => (c + 1) % HERO_CLIPS.length)

  return (
    <section className="relative min-h-[85svh] sm:min-h-[92svh] flex items-center overflow-hidden bg-abyss pt-16 sm:pt-[72px]">
      {/* ===== HERO VIDEO — MAXIMUM VISIBILITY ===== */}
      <div className="absolute inset-0">
        <video
          ref={videoRef}
          key={clip}
          autoPlay muted playsInline
          loop={HERO_CLIPS.length === 1}
          onEnded={handleEnded}
          preload="none"
          poster="/assets/video/hero-poster.jpg"
          className="h-full w-full object-cover"
        >
          {videoReady && (
            <source src={HERO_CLIPS[(clip % HERO_CLIPS.length + HERO_CLIPS.length) % HERO_CLIPS.length]} type="video/mp4" />
          )}
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-abyss/65 via-abyss/25 to-transparent" />
        <div className="absolute inset-0 bg-crimson/5 mix-blend-overlay pointer-events-none" />
      </div>

      {/* Blueprint grid */}
      <div className="absolute inset-0 u-grid opacity-30 pointer-events-none" />
      <div className="hidden sm:block absolute -top-32 -right-24 h-[520px] w-[520px] rounded-full bg-crimson/40 blur-3xl pointer-events-none" />
      <div className="hidden sm:block absolute -bottom-40 -left-24 h-[420px] w-[420px] rounded-full bg-marine/60 blur-3xl pointer-events-none" />

      <div ref={stageRef} className="relative mx-auto max-w-content px-4 sm:px-8 w-full py-12 sm:py-16 lg:py-24">
        <div className="max-w-3xl">
          {/* TAGLINE BADGE — solid high-contrast rose/crimson pill */}
          <div className="reveal inline-flex items-center gap-2 font-mono text-[11px] sm:text-sm tracking-wider uppercase text-crimsonDeep bg-rose border-2 border-roseMid px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full mb-4 sm:mb-6 shadow-xl font-bold leading-tight">
            <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-crimson anim-pulse shrink-0" />
            Empowering Businesses with Intelligent Track, Trace &amp; Identity Solutions
          </div>

          {/* MAIN HEADLINE */}
          <h1 className="reveal font-display font-extrabold text-white tracking-tight leading-[1.08] text-3xl xs:text-4xl sm:text-6xl lg:text-7xl drop-shadow-lg">
            Connecting Nepal<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-crimson via-crimsonBright to-roseMid">
              to the World
            </span>
          </h1>

          {/* SUBTITLE */}
          <p className="reveal mt-4 sm:mt-5 text-base sm:text-xl text-white/95 leading-relaxed max-w-2xl font-normal drop-shadow">
            {site.heroSub}
          </p>

          {/* CTAs */}
          <div className="reveal mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
            <Link 
              href="/solutions" 
              className="group inline-flex items-center justify-center gap-2.5 rounded-xl bg-crimson px-7 py-3.5 sm:px-8 sm:py-4 font-bold text-white hover:bg-crimsonD shadow-xl shadow-crimson/40 hover:scale-[1.02] transition-all text-center"
            >
              {site.ctaPrimary}
              <span className="group-hover:translate-x-1 transition-transform">
                <ArrowIcon />
              </span>
            </Link>

            <Link 
              href="/contact" 
              className="inline-flex items-center justify-center gap-2.5 rounded-xl border-2 border-white/50 bg-marine/70 backdrop-blur px-6 py-3.5 sm:px-7 sm:py-4 font-bold text-white hover:border-crimsonBright hover:bg-crimson/30 transition-all shadow-lg text-center"
            >
              {site.ctaSecondary}
            </Link>
          </div>

          {/* CAPABILITIES STRIP */}
          <div className="reveal mt-8 sm:mt-10 flex flex-wrap gap-x-6 gap-y-2.5 font-mono text-xs sm:text-sm text-white bg-marine/90 backdrop-blur-md p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border-2 border-white/20 inline-flex shadow-xl">
            <span className="flex items-center gap-1.5"><span className="text-crimsonBright font-bold">✓</span> RFID · UHF / NFC</span>
            <span className="flex items-center gap-1.5"><span className="text-crimsonBright font-bold">✓</span> Barcode · GS1</span>
            <span className="flex items-center gap-1.5"><span className="text-crimsonBright font-bold">✓</span> Coding &amp; Marking</span>
          </div>
        </div>
      </div>
    </section>
  )
}
