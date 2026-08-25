/* ============================================================
   SITEMAP  (/sitemap.xml)

   Next generates the XML from what this returns. Every public route is
   listed: the eight fixed pages, plus one entry per brand, product,
   solution, industrial solution, industry and blog post — the same
   sets the generateStaticParams() in each route uses, read through the
   same content layer, so the sitemap cannot list a page that doesn't
   exist or miss one that does.

   /admin is absent on purpose (nothing there should be indexed — see
   app/robots.js and the noindex in app/admin/layout.jsx), and so is
   /support: that portal is a separate application behind a sign-in,
   proxied onto this domain, and it is not ours to describe.

   Regenerated whenever the cache is purged, which lib/revalidate.js
   already does on every content change.
   ============================================================ */
import {
  getBrands, getProducts, getSolutions, getIndustrialSolutions,
  getIndustries, getPosts,
} from '@/lib/content'
import { siteUrl } from '@/lib/site-url'

/* changeFrequency and priority are hints, and search engines have said
   for years that they largely ignore them. Included because they cost
   nothing and some smaller crawlers do still read them. */
const HOME = { changeFrequency: 'weekly', priority: 1 }
const SECTION = { changeFrequency: 'weekly', priority: 0.8 }
const DETAIL = { changeFrequency: 'monthly', priority: 0.6 }
const STATIC = { changeFrequency: 'monthly', priority: 0.5 }

export default async function sitemap() {
  const base = siteUrl()
  const now = new Date()

  const [brands, products, solutions, industrialSolutions, industries, posts] =
    await Promise.all([
      getBrands(), getProducts(), getSolutions(),
      getIndustrialSolutions(), getIndustries(), getPosts(),
    ])

  const entry = (path, opts, lastModified = now) => ({
    url: `${base}${path}`,
    lastModified,
    ...opts,
  })

  return [
    entry('/', HOME),
    entry('/about', STATIC),
    entry('/contact', STATIC),
    entry('/hardware', SECTION),
    entry('/software-solutions', SECTION),
    entry('/industrial-solutions', SECTION),
    entry('/industries', SECTION),
    entry('/blog', SECTION),

    ...brands.map((b) => entry(`/hardware/${b.slug}`, DETAIL)),
    ...products.map((p) => entry(`/hardware/${p.brandSlug}/${p.slug}`, DETAIL)),
    ...solutions.map((s) => entry(`/software-solutions/${s.slug}`, DETAIL)),
    ...industrialSolutions.map((s) => entry(`/industrial-solutions/${s.slug}`, DETAIL)),
    ...industries.map((i) => entry(`/industries/${i.slug}`, DETAIL)),

    // Posts carry an author-entered date, so they can report a real
    // lastModified instead of "now". The column is free text, so an
    // unparseable value falls back rather than emitting Invalid Date.
    ...posts.map((p) => entry(`/blog/${p.slug}`, DETAIL, parseDate(p.date) ?? now)),
  ]
}

function parseDate(value) {
  if (!value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}
