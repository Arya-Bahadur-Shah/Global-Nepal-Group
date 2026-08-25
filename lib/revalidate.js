/* ============================================================
   CACHE INVALIDATION — one map, every admin action

   Every public page is statically generated (each dynamic route has a
   generateStaticParams(), and none of them opt into dynamic rendering),
   so a page keeps serving its build-time HTML until something purges
   it. That "something" is the admin action that just changed the data.

   ── Why this is centralised ──────────────────────────────────
   It used to be a hand-written revalidatePath() list at each of the 26
   call sites, and the lists drifted from reality:

   - Editing a product purged /hardware but never
     /hardware/[brand]/[product], so the card in the grid updated and
     the detail page behind it kept the old specs indefinitely. Same
     for every blog post, solution, industry and brand detail page.
   - The solutions actions purged '/solutions', a route that no longer
     exists (it moved to /software-solutions and middleware.js now
     301s the old path), so solution edits purged nothing at all.
   - Uploading a new logo purged '/', but the logo lives in SiteHeader
     inside the ROOT LAYOUT, so every other page kept the old one.

   Naming the affected routes once per content type, next to the reason
   they're affected, is what stops that happening again.

   ── Sitewide vs scoped ───────────────────────────────────────
   components/SiteHeader.jsx builds its nav from solutions, industrial
   solutions, brands and industries, and SiteFooter renders the site
   settings. Both live in the root layout, so those five content types
   change the chrome of EVERY page — for them the only correct purge is
   the whole tree, which is what revalidatePath('/', 'layout') does.

   Products, posts and clients appear only inside their own sections,
   so those get a precise list instead of the sledgehammer.

   ── The '[brand]' literals are not a mistake ─────────────────
   revalidatePath() takes the ROUTE, not a resolved URL, when you pass
   the 'page' type — '/hardware/[brand]/[product]' purges every product
   page in one call. Passing a concrete '/hardware/zebra/zt411' would
   purge that one URL only, which is wrong here: renaming a brand
   changes the breadcrumb on all of its products, and a delete has to
   clear a page whose params we no longer have.
   ============================================================ */
import { revalidatePath } from 'next/cache'

/* Routes to purge per content type.

   `layout: true` means "this data is rendered by the root layout, so
   every page is affected". Anything else lists its own routes, each
   tagged 'page' (a single route, all params) or 'layout' (a subtree).

   Admin routes are handled separately by revalidateContent()'s caller
   argument — see below — so this map stays purely about the public
   site. */
const AFFECTED_ROUTES = {
  /* Nav-bearing types: SiteHeader lists every brand, solution,
     industrial solution and industry, so a rename or a delete changes
     the header on every page of the site. */
  brands: { layout: true },
  solutions: { layout: true },
  'industrial-solutions': { layout: true },
  industries: { layout: true },
  /* Site settings carry the logo (SiteHeader) and the address, phone
     and email (SiteFooter) — both in the root layout. */
  site: { layout: true },

  /* Section-local types. */
  products: {
    paths: [
      ['/', 'page'], // PrinterShowcase + HardwareGrid on the homepage
      ['/hardware', 'page'],
      ['/hardware/[brand]', 'page'], // the brand's product list
      ['/hardware/[brand]/[product]', 'page'], // the detail pages themselves
    ],
  },
  posts: {
    paths: [
      ['/', 'page'], // InsightsPreview shows the latest three
      ['/blog', 'page'],
      ['/blog/[slug]', 'page'],
    ],
  },
  clients: {
    paths: [
      ['/', 'page'], // TrustMarquee logo strip
      ['/industries', 'page'],
      ['/industries/[slug]', 'page'], // getClientsForIndustry() per industry
    ],
  },
}

/**
 * Purge every cached page affected by a change to `type`, plus the
 * admin screens that list it.
 *
 * @param {keyof typeof AFFECTED_ROUTES} type  content type just changed
 * @param {string} [adminPath]  admin route to refresh too, e.g.
 *        '/admin/products'. Optional: some callers (the settings pages)
 *        change nothing public at all.
 */
export function revalidateContent(type, adminPath) {
  if (adminPath) revalidatePath(adminPath)

  const affected = AFFECTED_ROUTES[type]
  if (!affected) {
    // A typo here would silently stop purging anything, which is the
    // exact failure this module exists to prevent — so say so loudly
    // rather than returning quietly.
    throw new Error(
      `revalidateContent: unknown content type "${type}". ` +
        `Expected one of: ${Object.keys(AFFECTED_ROUTES).join(', ')}`
    )
  }

  if (affected.layout) {
    // The whole tree: every route that renders under the root layout.
    revalidatePath('/', 'layout')
    return
  }

  for (const [path, kind] of affected.paths) revalidatePath(path, kind)
}

/**
 * Refresh an admin screen only — for changes with no public effect
 * (admin user list, lead inbox). Kept here so admin actions have one
 * import for cache work rather than two.
 */
export function revalidateAdmin(adminPath) {
  revalidatePath(adminPath)
}
