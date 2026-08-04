'use client'
/* ============================================================
   SHARED UI PRIMITIVES
   Small building blocks reused across every page. Import from
   '@/components/ui'. Each is intentionally tiny and documented.
   ============================================================ */
import { useEffect, useRef, useState } from 'react'

/* <Reveal> — animates its children in when scrolled into view.
   variant: 'up' (default) | 'left' | 'right' | 'zoom'
   Wrap any block: <Reveal variant="left" delay={0.1}>…</Reveal> */
export function Reveal({ children, className = '', delay = 0, variant = 'up' }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            el.classList.add('is-visible')
            observer.unobserve(el)
          }
        }),
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  // Map variant -> base class (keyframe-free, CSS handles the transition).
  const base = { up: 'reveal', left: 'reveal-left', right: 'reveal-right', zoom: 'reveal-zoom' }[variant] || 'reveal'
  return (
    <div ref={ref} className={`${base} ${className}`} style={{ transitionDelay: `${delay}s` }}>
      {children}
    </div>
  )
}

/* <CountUp> — animates a number from 0 to `end` once it scrolls into view.
   Used in the stats band. Supports a suffix like "+" or "%". */
export function CountUp({ end, suffix = '', duration = 1.6 }) {
  const ref = useRef(null)
  const [value, setValue] = useState(0)
  const hasRun = useRef(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting && !hasRun.current) {
            hasRun.current = true
            observer.unobserve(el)
            let raf, start
            const tick = (t) => {
              if (!start) start = t
              const progress = Math.min((t - start) / (duration * 1000), 1)
              setValue(end * (1 - Math.pow(1 - progress, 3))) // ease-out cubic
              if (progress < 1) raf = requestAnimationFrame(tick)
            }
            raf = requestAnimationFrame(tick)
          }
        }),
      { threshold: 0.4 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [end, duration])
  const display = end % 1 === 0 ? Math.round(value).toLocaleString() : value.toFixed(1)
  return <span ref={ref}>{display}{suffix}</span>
}

/* <SectionKicker> — the small uppercase label above a section heading. */
export function SectionKicker({ children }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-rose text-crimsonDeep border border-roseMid font-mono text-[11px] tracking-[0.2em] uppercase font-bold shadow-xs mb-1">
      <span className="h-2 w-2 rounded-full bg-crimson anim-pulse" />
      {children}
    </div>
  )
}

/* <ArrowIcon> — the recurring right-arrow used on links & buttons. */
export function ArrowIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}
