/* ============================================================
   404 — page not found

   Reached by any unmatched URL, and by the explicit notFound() calls in
   every detail route (a product, post, brand, solution or industry
   whose slug no longer exists). Without this file all of those landed
   on Next's unstyled default: black Helvetica on white, no header, no
   footer, no way back into the site.

   A Server Component, so it renders inside the root layout and keeps
   the site chrome — which is most of the point.
   ============================================================ */
import Link from 'next/link'

export const metadata = {
  title: 'Page not found — Global Nepal Group',
  // A 404 has nothing worth indexing, and letting one in dilutes the
  // rest of the site in search results.
  robots: { index: false, follow: true },
}

/* The places someone who mistyped a URL most plausibly wanted. */
const DESTINATIONS = [
  { href: '/hardware', label: 'Hardware', desc: 'Printers, scanners, RFID readers and tags' },
  { href: '/software-solutions', label: 'Software Solutions', desc: 'Traceability, service and stock platforms' },
  { href: '/industries', label: 'Industries', desc: 'What we build for each sector' },
  { href: '/blog', label: 'Insights', desc: 'Notes on tracking, marking and identity' },
]

export default function NotFound() {
  return (
    <section className="bg-paper pt-[72px]">
      <div className="mx-auto max-w-content px-5 sm:px-8 py-24 sm:py-32">
        <p className="font-mono text-xs tracking-widest uppercase text-crimson">Error 404</p>
        <h1 className="mt-3 font-display font-bold text-ocean text-3xl sm:text-5xl max-w-2xl">
          That page isn&rsquo;t here.
        </h1>
        <p className="mt-4 text-steel text-base max-w-lg">
          The link may be out of date, or the page may have moved. Everything below is
          one click away.
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/"
            className="rounded-lg bg-ocean px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-crimson"
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

        <ul className="mt-14 grid gap-3 sm:grid-cols-2 max-w-3xl">
          {DESTINATIONS.map((d) => (
            <li key={d.href}>
              <Link
                href={d.href}
                className="group block rounded-xl border border-cloud bg-white p-5 transition-colors hover:border-crimson"
              >
                <span className="font-display font-semibold text-ocean transition-colors group-hover:text-crimson">
                  {d.label}
                </span>
                <span className="mt-1 block text-sm text-steel">{d.desc}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
