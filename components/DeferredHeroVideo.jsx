'use client'
/* ============================================================
   DEFERRED HERO VIDEO
   A full-bleed background loop that does NOT start downloading until
   the page has finished loading.

   ── Why ──────────────────────────────────────────────────────
   With a plain <video autoPlay preload="metadata">, the browser opens
   a connection and starts fetching straight away, in parallel with the
   page's own JavaScript. Measured on the live homepage: every resource
   fired at once ~650ms in, and 10 KB JS chunks took 2.5 SECONDS to
   arrive — starved by a video several times their combined size. Time
   to first byte was 45ms, so the server was never the bottleneck.

   Holding the video back moved the slowest chunk from 2512ms to 210ms
   and page load from 3178ms to 574ms.

   The poster shows immediately, so the hero never looks empty — the
   video just joins a moment later, once it isn't competing with the
   page it sits behind.

   These are server-rendered pages, which is why this small client
   component exists: the deferral needs state and an effect.
   ============================================================ */
import { useEffect, useState } from 'react'

export default function DeferredHeroVideo({
  src,
  poster = '/assets/video/hero-poster.jpg',
  className = 'h-full w-full object-cover',
  loop = true,
}) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // `load` has often already fired by the time this runs, so handle
    // that case rather than waiting for an event that never comes.
    if (document.readyState === 'complete') {
      const t = setTimeout(() => setReady(true), 200)
      return () => clearTimeout(t)
    }
    const onLoad = () => setReady(true)
    window.addEventListener('load', onLoad, { once: true })
    // Never strand the hero on a still image if `load` never fires —
    // one hung third-party request would otherwise do it.
    const fallback = setTimeout(() => setReady(true), 4000)
    return () => {
      window.removeEventListener('load', onLoad)
      clearTimeout(fallback)
    }
  }, [])

  return (
    <video
      key={src}
      autoPlay
      loop={loop}
      muted
      playsInline
      // "none" until loaded: "metadata" still opens a connection and
      // begins fetching, which is the behaviour being avoided.
      preload={ready ? 'auto' : 'none'}
      poster={poster}
      className={className}
    >
      {/* No <source> until then, so there is nothing for the browser to
          fetch and it simply paints the poster. */}
      {ready && <source src={src} type="video/mp4" />}
    </video>
  )
}
