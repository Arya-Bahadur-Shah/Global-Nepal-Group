/* ============================================================
   CANONICAL SITE URL

   Needed anywhere a link has to be absolute rather than relative:
   app/sitemap.js, app/robots.js, and the metadataBase in
   app/layout.jsx that turns relative Open Graph image paths into the
   absolute URLs Facebook, LinkedIn and WhatsApp require.

   Resolution order, most explicit first:

   1. NEXT_PUBLIC_SITE_URL — set this in the Vercel project once the
      custom domain is live. Nothing else knows the difference between
      a domain we own and one Vercel generated.
   2. VERCEL_PROJECT_PRODUCTION_URL — Vercel's own production hostname,
      correct on every deployment INCLUDING previews. Deliberately not
      VERCEL_URL, which is the per-deployment URL: on a preview build
      that would put throwaway hostnames into the sitemap and into the
      canonical tags of shared links.
   3. localhost, for `npm run dev`.
   ============================================================ */

const FALLBACK = 'http://localhost:3000'

/** @returns {string} origin with no trailing slash, e.g. https://example.com */
export function siteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (explicit) return stripTrailingSlash(withProtocol(explicit))

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim()
  if (vercel) return stripTrailingSlash(withProtocol(vercel))

  return FALLBACK
}

/** Absolute URL for a site-relative path. `absoluteUrl('/blog')`. */
export function absoluteUrl(path = '/') {
  return `${siteUrl()}${path.startsWith('/') ? path : `/${path}`}`
}

/* Vercel supplies bare hostnames ("example.com"); an env var filled in
   by hand usually includes the scheme. Accept both. */
function withProtocol(value) {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`
}

function stripTrailingSlash(value) {
  return value.replace(/\/+$/, '')
}
