/* Hosts next/image is allowed to fetch and optimise.
   ── Why this is a list and not '**' ──────────────────────────
   It used to be `hostname: '**'`, which made /_next/image an OPEN IMAGE
   PROXY: anyone could request
     https://this-site/_next/image?url=https://anywhere/huge.png&w=1920
   and have our deployment fetch, transform and cache it. Image
   optimisation is metered and billed per source image, so that is
   somebody else's bandwidth on our invoice — and our domain fronting
   their content.

   The entries below are Vercel Blob (every admin upload) plus the
   external hosts already referenced by the seed content. Pasting an
   image URL from a NEW host in the admin panel now needs that host
   added — either here, or without a deploy via EXTRA_IMAGE_HOSTS.
   next/image answers with a 400 for a host that isn't listed, so the
   symptom is a broken image, not a silent one. */
const IMAGE_HOSTS = [
  '*.public.blob.vercel-storage.com', // admin uploads (lib/upload.js)
  'www.globalnepalcorp.com',           // same-site /uploads/ paths still hit next/image
  'globalnepalcorp.com',
  'images.unsplash.com',
  'static1.squarespace.com',
  'www.hidglobal.com',
  'www.zebra.com',
  'www.zebrasupplies.nl',
  'barmax.com',
]

/* Escape hatch: a comma-separated list in the Vercel project settings
   adds hosts without a code change. Wildcards work here too
   ('cdn.example.com' or '*.example.com'). */
const extraImageHosts = (process.env.EXTRA_IMAGE_HOSTS || '')
  .split(',')
  .map((h) => h.trim())
  .filter(Boolean)

/* Headers that belong on every response.
   Kept out of the images/cache concerns below because they apply to the
   whole site, including the proxied /support portal. */
const SECURITY_HEADERS = [
  // Stop the browser second-guessing our Content-Type — the trick that
  // turns an uploaded "image" into an executed script.
  { key: 'X-Content-Type-Options', value: 'nosniff' },

  // Send the full URL to ourselves, origin-only cross-site. Keeps
  // /admin paths out of other people's referrer logs.
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },

  // Nothing on this site uses these, and declaring so stops any
  // embedded third party asking on our behalf.
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },

  /* Clickjacking. frame-ancestors is the modern form and the one
     browsers honour when both are present; X-Frame-Options stays for
     anything old enough to ignore CSP.

     'self' rather than 'none' ON PURPOSE: /support is proxied onto this
     origin (see rewrites below), so same-origin framing has to keep
     working. This site embeds a Google Maps iframe on /contact, which
     is unaffected — frame-ancestors governs who may frame US. */
  { key: 'Content-Security-Policy', value: "frame-ancestors 'self'" },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },

  /* HTTPS-only for two years.
     Deliberately WITHOUT includeSubDomains or preload: both are
     effectively irreversible for the length of the max-age, and would
     also bind every subdomain of globalnepalgroup.com — including any
     that isn't on HTTPS yet. Add them once you've confirmed every
     subdomain serves TLS. */
  { key: 'Strict-Transport-Security', value: 'max-age=63072000' },
]

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
    // The admin panel lets editors paste image URLs, and next/image only
    // fetches from allowlisted hosts. See IMAGE_HOSTS above for the list.
    // A wildcard HTTPS entry at the end catches any other host an editor
    // pastes without needing a redeploy — matches are evaluated in order
    // so the explicit entries above still get their cheaper cache keys.
    remotePatterns: [
      ...([...IMAGE_HOSTS, ...extraImageHosts].map((hostname) => ({
        protocol: 'https',
        hostname,
      }))),
      // Wildcard fallback — covers new blob stores, CDNs, or pasted URLs
      // that haven't been explicitly listed yet.
      { protocol: 'https', hostname: '**' },
      { protocol: 'http',  hostname: '**' },
    ],
  },
  reactStrictMode: true,
  poweredByHeader: false,
  swcMinify: true,

  /* ── Upload body-size limit ────────────────────────────────────
     Without this, Vercel's default 1 MB request body cap kicks in
     and the admin panel returns 413 Content Too Large when any file
     larger than ~1 MB is uploaded. Raise it here so video and
     high-res image uploads work. The actual per-file cap is still
     enforced in lib/upload.js. */
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
  },

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

  /* Everything under public/ is served with `cache-control: public,
     max-age=0` by default, so a returning visitor re-downloads it all —
     including the 7.5 MB hero video and every logo and poster.
     Measured: hero-poster.jpg fetched twice in one session, 63 KB each,
     with no cache hit.

     A day of freshness plus a week of stale-while-revalidate: repeat
     visits are instant, and a replaced file still reaches people within
     a day. Deliberately NOT `immutable` — these filenames are stable
     and we do overwrite them (the hero videos were re-encoded twice),
     so immutable would strand visitors on an old copy indefinitely.

     Next's own /_next/static/ output is content-hashed and already
     cached properly; this only covers public/. */
  async headers() {
    return [
      // Every route, including the proxied /support portal.
      { source: '/:path*', headers: SECURITY_HEADERS },
      {
        source: '/assets/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' },
        ],
      },
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
