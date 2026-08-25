'use client'
/* ============================================================
   ERROR BOUNDARY — one route segment failed

   Catches anything thrown while rendering a page: most realistically
   the database being unreachable, since every public page reads from
   it through lib/content.js.

   Must be a Client Component — Next needs `reset` to be callable from
   the browser. It renders INSIDE the root layout, so the header and
   footer survive and the visitor still has somewhere to go. When the
   root layout itself is what failed, app/global-error.jsx takes over
   instead.
   ============================================================ */
import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({ error, reset }) {
  useEffect(() => {
    // The rendered page deliberately shows nothing about the cause: on
    // a database failure the message can carry the connection string.
    // This is the only place the detail is kept, and on Vercel it lands
    // in the function logs where it belongs.
    console.error('Page render failed:', error)
  }, [error])

  return (
    <section className="bg-paper pt-[72px]">
      <div className="mx-auto max-w-content px-5 sm:px-8 py-24 sm:py-32">
        <p className="font-mono text-xs tracking-widest uppercase text-crimson">Something went wrong</p>
        <h1 className="mt-3 font-display font-bold text-ocean text-3xl sm:text-5xl max-w-2xl">
          This page didn&rsquo;t load.
        </h1>
        <p className="mt-4 text-steel text-base max-w-lg">
          It&rsquo;s our end, not yours. Try again in a moment — and if it keeps happening,
          call us and we&rsquo;ll help directly.
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <button
            onClick={reset}
            className="rounded-lg bg-ocean px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-crimson"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-lg border border-cloud bg-white px-5 py-3 text-sm font-semibold text-ocean transition-colors hover:bg-mist"
          >
            Back to home
          </Link>
          <Link
            href="/contact"
            className="rounded-lg border border-cloud bg-white px-5 py-3 text-sm font-semibold text-ocean transition-colors hover:bg-mist"
          >
            Contact us
          </Link>
        </div>

        {/* Next attaches a digest to server-side errors; quoting it back
            is what lets a report be matched to a line in the logs. */}
        {error?.digest && (
          <p className="mt-10 font-mono text-xs text-steel">Reference: {error.digest}</p>
        )}
      </div>
    </section>
  )
}
