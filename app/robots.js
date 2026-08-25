/* ============================================================
   ROBOTS  (/robots.txt)

   Crawl everything except the two areas that would be noise or worse
   in an index, and point crawlers at the sitemap.
   ============================================================ */
import { siteUrl } from '@/lib/site-url'

export default function robots() {
  const base = siteUrl()

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          // The admin panel. app/admin/layout.jsx already sends a
          // noindex on these pages; this stops the crawl before the
          // request, which also keeps the login form out of the logs.
          '/admin',
          // The proxied ticketing portal — a separate application
          // behind a sign-in, not part of this site's content.
          '/support',
          // Nothing under /api renders a page.
          '/api',
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  }
}
