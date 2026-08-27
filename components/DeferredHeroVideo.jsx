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

   These are server-rendered pages, which is why this small client
   component exists: the deferral needs state and an effect.

   ── `poster` is opt-in, and has no default ───────────────────
   It used to default to '/assets/video/hero-poster.jpg'. None of the
   callers passed one, so EVERY hero — each brand, each software and
   industrial solution — painted the homepage's generic printer still
   for the first second and then cut to its own, unrelated video. It
   read as the video starting on the wrong clip.

   A still frame that belongs to a different page is worse than no
   still frame at all, so the default is gone. With no poster the
   <video> paints nothing and the section's own dark background shows
   through until playback starts, which is the intended look.

   Pass `poster` explicitly where a matching frame genuinely exists —
   it is still the better experience when the image is the right one.
   ============================================================ */
import { useEffect, useRef, useState } from 'react'

export default function DeferredHeroVideo({
  src,
  poster,
  className = 'h-full w-full object-cover',
  loop = true,
}) {
  const ref = useRef(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // `load` has often already fired by the time this runs, so handle
    // that case rather than waiting for an event that never comes.
    if (document.readyState === 'complete') {
      const t = setTimeout(() => setReady(true), 100)
      return () => clearTimeout(t)
    }
    const onLoad = () => setReady(true)
    window.addEventListener('load', onLoad, { once: true })
    // Never strand the hero on a still image if `load` never fires —
    // failed network requests (e.g. 400 images) can block the load
    // event indefinitely. 1.5 s is long enough to avoid competing with
    // page JS, but short enough that users don't notice a blank hero.
    const fallback = setTimeout(() => setReady(true), 1500)
    return () => {
      window.removeEventListener('load', onLoad)
      clearTimeout(fallback)
    }
  }, [])

  /* Once the source appears, tell the element to load and play.
     Needed because `preload` stays "none" — see below. */
  useEffect(() => {
    if (!ready) return
    const v = ref.current
    if (!v) return
    v.load()
    v.play().catch(() => {})
  }, [ready])

  return (
    <video
      ref={ref}
      key={src}
      autoPlay
      loop={loop}
      muted
      playsInline
      /* Fixed at "none", never toggled.

         Changing this attribute after mount makes the browser reload
         the whole media element — including re-fetching the poster.
         Measured on the live site: hero-poster.jpg was downloaded
         TWICE, 63 KB each, for one visible image. Holding it constant
         and driving playback from the effect above avoids that, and
         "none" is what stops the video competing with page load in the
         first place. */
      preload="none"
      poster={poster}
      className={className}
    >
      {/* No <source> until the page has loaded, so there is nothing for
          the browser to fetch and it simply paints the poster. */}
      {ready && <source src={src} type="video/mp4" />}
    </video>
  )
}
