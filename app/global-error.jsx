'use client'
/* ============================================================
   ROOT ERROR BOUNDARY — the layout itself failed

   app/error.jsx renders inside the root layout, so it cannot help when
   the root layout is what threw. That is a real case here rather than a
   theoretical one: app/layout.jsx calls getSite(), and SiteHeader reads
   four more tables, so an unreachable database takes the layout down
   before any page renders. Without this file the visitor gets Next's
   built-in white screen.

   It REPLACES the root layout, which is why it has to render its own
   <html> and <body> — and why the styling is inline rather than
   Tailwind: globals.css is imported by the layout that just failed, so
   no class name here is guaranteed to mean anything.
   ============================================================ */
import { useEffect } from 'react'

/* Hex values rather than palette names, for the reason above. Taken
   from tailwind.config.js: paper, ocean, steel, crimson, cloud. */
const COLORS = {
  paper: '#F8F9FA',
  ocean: '#1C2026',
  steel: '#5C6470',
  crimson: '#C8102E',
  cloud: '#D5DAE2',
}

const FONT_STACK =
  'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif'

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error('Root layout render failed:', error)
  }, [error])

  return (
    <html lang="en">
      <body style={{ margin: 0, background: COLORS.paper, fontFamily: FONT_STACK }}>
        <main
          style={{
            minHeight: '100vh',
            display: 'grid',
            placeContent: 'center',
            textAlign: 'center',
            padding: '2rem 1.25rem',
          }}
        >
          <p
            style={{
              margin: 0,
              color: COLORS.crimson,
              fontSize: '0.75rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
            }}
          >
            Service unavailable
          </p>
          <h1
            style={{
              margin: '0.75rem 0 0',
              color: COLORS.ocean,
              fontSize: 'clamp(1.75rem, 5vw, 3rem)',
              fontWeight: 700,
              lineHeight: 1.1,
            }}
          >
            The site is temporarily down.
          </h1>
          <p style={{ margin: '1rem auto 0', color: COLORS.steel, maxWidth: '32rem', lineHeight: 1.6 }}>
            We&rsquo;re working on it. Please try again shortly — or reach Global Nepal
            Group directly and we&rsquo;ll help straight away.
          </p>

          <div style={{ marginTop: '2rem', display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={reset}
              style={{
                background: COLORS.ocean,
                color: '#fff',
                border: 0,
                borderRadius: '0.5rem',
                padding: '0.8rem 1.25rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Try again
            </button>
            {/* A plain <a>, not next/link: the router lives in the tree
                that just failed. A full page load is the reliable move. */}
            <a
              href="/"
              style={{
                background: '#fff',
                color: COLORS.ocean,
                border: `1px solid ${COLORS.cloud}`,
                borderRadius: '0.5rem',
                padding: '0.8rem 1.25rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Reload the site
            </a>
          </div>

          {error?.digest && (
            <p style={{ marginTop: '2.5rem', color: COLORS.steel, fontSize: '0.75rem', fontFamily: 'ui-monospace, monospace' }}>
              Reference: {error.digest}
            </p>
          )}
        </main>
      </body>
    </html>
  )
}
