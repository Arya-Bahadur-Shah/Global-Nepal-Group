/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image Optimization is ON (this app runs on Vercel, not a static export),
  // so Next/Vercel serve resized, modern-format (AVIF/WebP) images instead of
  // the multi-MB originals — the biggest mobile load-time win.
  images: {
    formats: ['image/avif', 'image/webp'],
    // Trimmed device widths so phones don't fetch desktop-sized images.
    deviceSizes: [360, 420, 640, 768, 1024, 1280, 1600, 1920],
    imageSizes: [64, 96, 128, 200, 300, 420],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    // The admin panel lets editors paste image URLs from any host (Unsplash,
    // manufacturer CDNs, etc.). With optimization on, next/image requires
    // remote hosts to be allowlisted, so we permit any https image source.
    // (Tighten to specific hostnames here if you ever want to lock this down.)
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
  reactStrictMode: true,
  poweredByHeader: false,
  swcMinify: true,

  /* Next normalises "/foo/" to "/foo" by default. Harmless for this
     site's own pages, but fatal for the proxied Django API below:
     every DRF endpoint ends in a slash, and Django cannot redirect a
     POST to add one back (that would drop the request body), so it
     raises instead. Confirmed — POST /support/api/token/ arrived at
     Django as /api/token and came back 500.

     Turning the normalisation off keeps the slash intact all the way
     through. This site's own URLs are unaffected: none of them are
     written with a trailing slash. */
  skipTrailingSlashRedirect: true,

  /* ============================================================
     TICKETING PORTAL — served at /support on this domain.

     The portal is a separate app (Django REST + a Vite/React SPA) on
     its own host. These rewrites proxy it so it appears as part of
     this site instead of being embedded in an iframe. Everything under
     /support — HTML, JS, CSS, API calls — is forwarded to it.

     Being same-origin is the whole point: the browser sees one site,
     so there's no CORS on API calls, no iframe to size, and cookies
     set here are visible to the portal (which is what makes a shared
     login possible later).

     The portal must be built with base '/support/' so its own asset
     URLs already carry the prefix — that's why the app rule forwards
     the path UNCHANGED rather than stripping it. The API rule does
     strip it, because Django serves its endpoints at /api, not
     /support/api. Order matters: the API rule has to be first or the
     broader app rule would swallow it.
     ============================================================ */
  async rewrites() {
    const app = process.env.NEXT_PUBLIC_TICKETING_APP_URL
    const api = process.env.NEXT_PUBLIC_TICKETING_API_URL
    // Without the env vars there's nothing to point at. Returning no
    // rules leaves /support a normal 404 rather than proxying to
    // "undefined", which fails in a far more confusing way.
    if (!app || !api) return []

    const trim = (u) => u.replace(/\/+$/, '')
    // `:path(.*)` rather than `:path*`. The segment form splits the URL
    // on slashes and rebuilds it, which silently DROPS a trailing one —
    // and every DRF endpoint ends in a slash. Django then refuses the
    // request outright: it can't redirect a POST to add the slash back
    // without losing the body, so it raises RuntimeError and returns
    // 500. Confirmed against a live server before switching to this.
    // The greedy regex captures the remainder verbatim, slash included.
    return [
      { source: '/support/api/:path(.*)', destination: `${trim(api)}/:path` },
      { source: '/support/:path(.*)', destination: `${trim(app)}/support/:path` },
    ]
  },

  async redirects() {
    // /support on its own would land on the portal's root, which is
    // that product's own marketing page — not something to show on
    // this domain. Send people straight to the sign-in screen.
    return [{ source: '/support', destination: '/support/login', permanent: false }]
  },
}
export default nextConfig
