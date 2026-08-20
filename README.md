# Global Nepal Group — Website

Storytelling corporate site for **Global Nepal Group PVT. LTD.** (Track, Trace &
Identity — coding, marking, RFID and traceability software; Kathmandu, Nepal).
Tagline: *Connecting Nepal to the World.*

**Stack:** Next.js 14 (App Router) + Tailwind CSS, backed by **Postgres** with a
built-in admin panel (see below). File uploads go to Vercel Blob storage.
Feature inspiration: Clearpack (solutions tabs), Videojet (hardware grid & trust),
Rynan (hover motion), Domino (confident hero & icon language).

---

## Run it

Requires **Node.js 18.17+** and a **Postgres** server you can reach. (A couple of
the one-off migration scripts also read the retired SQLite file via Node's
built-in `node:sqlite`; those specifically need Node 22.5+. The app itself does
not.)

```bash
npm install                      # first time only
cp .env.local.example .env.local # then fill in DATABASE_URL — see the file's comments
node scripts/db-create.mjs       # creates the database named in DATABASE_URL
node scripts/db-check.mjs        # confirms the connection works
npm run dev                      # dev server -> http://localhost:3000
```

`npm run build` produces the production build and `npm run start` serves it.

Two helpers worth knowing about when something isn't working:

- `node scripts/db-check.mjs` — reports the connection's shape (host, database,
  user, never the password), resolved exactly the way the app resolves it.
- `node scripts/mail-test.mjs you@example.com` — sends one test email and prints
  the real error if it fails. The app deliberately swallows send failures so a
  mail outage can't break a login, which makes them invisible otherwise.

## Deploy

Runs on **Vercel** — the project is already linked (`global-nepal-group`). Push
to the connected branch and it builds.

Three things must be configured in the Vercel project or the deployment comes up
broken in ways that aren't obvious from the logs:

- **`DATABASE_URL`** — a hosted Postgres instance. Local and production are
  separate copies; `node scripts/db-clone.mjs` copies one into the other
  (`TARGET_DATABASE_URL` is the destination).
- **`BLOB_READ_WRITE_TOKEN`** — from Vercel → project → Storage. Required, not
  optional: Vercel's filesystem is read-only, so without it the admin panel
  cannot accept an uploaded file at all.
- **Email** (`GMAIL_USER` + `GMAIL_APP_PASSWORD`, or `RESEND_API_KEY`) — admin
  sign-in needs a second factor emailed as a code. With neither configured the
  code is printed to the server log instead, which in production means it lands
  in Vercel's logs and effectively locks you out.

Every variable is documented with its gotchas in `.env.local.example`.

### The `/support` ticketing portal

`/support` is not part of this app. It's a separate product (Django REST + a
Vite/React SPA) on its own host, proxied in by the `rewrites()` block in
`next.config.mjs` so the browser sees one origin — no CORS, no iframe, and
cookies set here are visible to the portal.

Point `NEXT_PUBLIC_TICKETING_APP_URL` and `NEXT_PUBLIC_TICKETING_API_URL` at that
host per environment (production → live instance, preview → staging, so PR
previews never touch real customer tickets). With the variables unset the
rewrites are skipped entirely and `/support` is a normal 404 — deliberately, so
a missing config fails visibly instead of proxying to `undefined`.

---

## Folder map (where everything lives)

```
app/
  layout.jsx            Root layout: fonts + <SiteHeader/> + <SiteFooter/>
  page.jsx              HOMEPAGE — assembles the 9 story "scenes" (documented in-file)
  about/  hardware/  solutions/  blog/  contact/   Inner pages
  admin/                Admin panel (see below)
  api/contact/route.js  Lead capture endpoint
  globals.css           Base styles, brand utilities & animation keyframes (commented)

components/
  SiteHeader.jsx        Sticky nav + dropdowns (edit NAV_ITEMS to change the menu)
  SiteFooter.jsx        Footer (edit FOOTER_COLUMNS)
  ui.jsx                Shared primitives: <Reveal> <CountUp> <SectionKicker> <ArrowIcon>
  ContactForm.jsx       Lead form (posts to /api/contact)
  home/                 The homepage scenes, in scroll order:
    HeroConnect.jsx       1. Hero — globe arc + live scan card
    TrustMarquee.jsx      2. Client logo marquee (real banks & govt)
    StatsBand.jsx         3. Animated stat counters
    JourneySteps.jsx      4. The story spine (world -> Nepal -> traceable)
    SolutionsTabs.jsx     5. Interactive solution tabs (Clearpack-style)
    HardwareGrid.jsx      6. Hardware category grid (Videojet-style)
    BrandsExport.jsx      7. Global brands we export (Zebra/Rynan/HID/Yesmark)
    InsightsPreview.jsx   8. Latest blog posts
    ContactCallout.jsx    9. Closing call-to-action

lib/
  db.js                 Postgres connection + the sync-shaped query shim
  pg-schema.mjs         Table definitions and migrations
  content.js            Reads content out of the database
  admin-data.js         Admin CRUD queries
  auth.js  session.js  login-security.js   Admin sign-in, sessions, rate limiting
  upload.js             File uploads -> Vercel Blob (local disk fallback in dev)
  mailer.js             Outbound email (Gmail -> Resend -> console)
middleware.js           Guards /admin routes at the edge
scripts/                Setup and one-off migration scripts (see "Run it")

content/                LEGACY reference JSON — not read at runtime (see below)
sanity/                 Ready-made CMS schemas + connection guide (optional path)
public/assets/          Real logos & images (see below)
```

## Naming conventions (so it stays easy to navigate)

- **Components** are PascalCase and named for what they are (`SiteHeader`, `SolutionsTabs`).
- **Homepage sections** live in `components/home/` and are named `Scene`-style by role
  (`HeroConnect`, `TrustMarquee`) — the homepage lists them in scroll order.
- **CSS utilities** are prefixed: `u-` = layout utility (`u-grid`, `u-barcode`),
  `anim-` = animation (`anim-scan`, `anim-float`), `.reveal` = scroll-in.
- **Animation keyframes** are prefixed `gng-` and named by what they do (`gng-scan`, `gng-dash`).
- **Brand colors** are named, not hex, everywhere: `abyss ocean marine azure steel mist cloud paper ink`
  (defined once in `tailwind.config.js`).


## Hero background video

The homepage hero has a full-bleed looping video (muted, autoplay, no controls).
Three stock clips are included in `/public/assets/video`:

- `hero-loop-primary.mp4` — **currently used** (cool/blue tone, matches the palette)
- `hero-loop-alt.mp4` — alternative landscape clip (neutral/dark tone)
- `hero-loop-vertical.mp4` — portrait 1080×1920; not used yet, reserved for a future
  mobile-specific treatment (a landscape video looks best in a wide hero)

To swap the hero video, open `components/home/HeroConnect.jsx` and change the
`<source src="...">` under the `===== HERO VIDEO =====` comment.

The bundled clips have already been compressed (originals are kept in
`video-originals-backup/`, and `scripts/compress-videos.sh` is the pass that was
used). Compress any replacement before committing it — stock footage runs 15–20MB
per clip, which is a punishing download on a Nepali mobile connection.

## Solutions (Brand -> Solutions -> Solution detail)

Two levels, driven by the `solutions` table (originally seeded from
`content/solutions.json`):

1. **/solutions** — every platform (Cubix, Activ, Trackline, On Service) as a card.
2. **/solutions/[slug]** — full page: description, feature cards, modules (Cubix has
   5; others can add their own), advantages, and a **"Hardware used" section that
   cross-links to the real product pages** in `/hardware` (matched automatically
   by product name via `hardwareUsed` — no manual linking needed).

The homepage keeps an interactive tab preview (Clearpack-style) that links out to
each solution's full page via "View full page".

### Add / edit a solution
Use `/admin/solutions`. Fields: `slug`, `name`, `tag`, `summary` (short, used on
cards + homepage tabs), `description` (full, used on the detail page), `features`
([title, body] pairs), `modules` (optional, same shape), `advantages` (short tag
strings), `hardwareUsed` (product **names** to cross-link), `visual` (optional
screenshot/mockup image).

## Real product catalog (current data)

- **Zebra** — 10 real products (label/industrial printers, rugged tablet, RFID
  sled/reader/tag/antenna, mobile computer, handheld & tabletop scanners), each
  with a real spec-sheet PDF link from zebra.com.
- **Rynan** — 3 real products (B1040, R20, B1040H). R20 has three spec variants
  (MAX/PRO/REACH) via `specSheetVariants` — the product page renders one
  download button per variant instead of a single PDF link.
- **HID** — 4 real products (FARGO HDP5000e, FARGO DTC1500, Eikon Touch TC510,
  Lumidigm V-Series), each with a real datasheet link from hidglobal.com.
- **Yesmark** and **OEM** — brand pages exist and show a clean "products coming
  soon" state; add products under those brands in `/admin` once that content is
  finalized — no code changes needed.

## Hardware catalog (Brand -> Products -> Product)

Three levels, all driven by the database:

1. **/hardware** — lists every brand as a tile.
2. **/hardware/[brand]** — a brand's product grid (the card layout from the
   reference). One page auto-generated per brand.
3. **/hardware/[brand]/[product]** — full product detail with specs and a
   **spec-sheet PDF button that opens in a new tab**. One page per product.

### Add a product
Use `/admin/products` → "+ New" and set:
- `brandSlug` — which brand it belongs to (must match an existing brand slug)
- `slug`, `name`, `model`, `shortDescription`, `description`, `specs`
- `image` — upload a photo, or paste an external URL; empty = placeholder
- `specSheet` — upload the PDF, or paste the brand's official PDF URL.
  Empty = "coming soon".

That's it — the brand page and a product detail page appear automatically.

### Add a brand
Add one at `/admin/brands` (slug, name, logo, focus, blurb, heroImage). A new
brand page appears at `/hardware/<slug>`.

## Admin panel (`/admin`)

The site is not static: brands, products, solutions and blog posts live in
Postgres and can be added/edited/deleted from a built-in admin panel — including
uploading images, videos and brochure/spec-sheet PDFs.

**Set up admin access** (one-time):
```bash
node scripts/hash-password.js "your-chosen-password"   # prints a bcrypt hash
```
Copy `.env.local.example` to `.env.local` and fill in:
- `ADMIN_EMAIL` — the email you'll log in with
- `ADMIN_PASSWORD_HASH` — the hash printed above
- `ADMIN_SESSION_SECRET` — any long random string (e.g. `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)

Those two credential variables only **seed** the `admins` table when it's empty.
Once a row exists they're ignored, so changing a password later means running:

```bash
node scripts/create-admin.mjs <email> <password>            # local database
node scripts/create-admin.mjs <email> <password> --target   # hosted database
```

Local and production are separate databases, so a password set in one does not
appear in the other. Passwords are stored as bcrypt hashes and can never be read
back — forgetting one means resetting it here.

Signing in takes two steps: the password, then a 6-digit code sent to
`ADMIN_EMAIL`. That's why email has to be configured before deploying (see
"Deploy" above).

There's one admin account (no self-serve signup). Each collection — brands,
products, solutions, industries, industrial solutions, clients, posts — has a
list, a "+ New" form, and an edit form with delete. Alongside them are editors
for the home and about page copy, plus `/admin/leads`, `/admin/settings` and an
in-app `/admin/guide`.

Sign-in is rate limited: five failures against one email inside fifteen minutes
locks that address out temporarily (`lib/login-security.js`).

Blog posts are authored as Markdown in the admin (`## heading`, blank line
between paragraphs, `- ` for bullets, `**bold**`) rather than the old
hand-coded `content/post-content.js` sections — the 3 original posts were
converted to this format automatically, so they're just as editable as anything
created from scratch.

Prefer a hosted CMS instead? Schemas matching the original JSON shapes are
still pre-built in `/sanity/schemas` with a guide in `/sanity/README.md` if you
ever want to swap the database-backed `lib/content.js` for Sanity.

## Editing content (legacy JSON reference)

`/content/*.json` reflects what the site looked like before the admin panel —
useful as a historical reference, but **not read at runtime** and not a safe
source to re-seed from: the live data diverged from those defaults long ago.
Content is edited through `/admin` (see above).

`data/gng.db` is likewise retired. It's the pre-Postgres SQLite database, kept
only because `scripts/db-migrate.mjs` and `scripts/db-verify.mjs` read it. Note
that it still holds the old `/uploads/...` paths from before the blob migration,
so re-running that migration against the hosted database would reinstate every
broken image — use `scripts/db-clone.mjs` to copy between environments instead.

## Real assets included (public/assets)

- `logo/gng-mark.png` — the new Global Nepal Group globe mark (transparent)
- `brands/hid.png`, `brands/yesmark.png` — partner logos (Zebra & Rynan render as text lockups; drop in logos to replace)
- `clients/*` — 10 real client logos (banks + government departments), shown in the trust marquee
- `solutions/*`, `hero/*` — solution and hero imagery carried over

Swap any image by replacing the file (keep the name) or by editing the record in
`/admin`.

## Lead capture & demo requests

The contact form (and every "Request a Demo"/"Book Live Demo" link, which adds
`?type=demo`) posts to `app/api/contact/route.js`, which saves the lead to the
database — visible at `/admin/leads`, newest first, tagged Contact or Demo.

To also get an email for each one, set both of these in `.env.local`:

```
RESEND_API_KEY=...        # from resend.com
LEADS_TO_EMAIL=you@yourcompany.com
```

**Note the inconsistency:** lead notifications require **Resend specifically**.
Unlike the rest of the app, `app/api/contact/route.js` calls Resend's HTTP API
directly instead of going through `lib/mailer.js`, so a Gmail-only setup captures
the lead but sends no email — silently. Worth routing through the mailer so both
providers work; until then, configure Resend if you want lead emails.

Either way leads are always saved and visible in `/admin/leads`.

## Accessibility & performance

Mobile-first, keyboard focus visible, `prefers-reduced-motion` respected.

Next.js image optimization is **on** (`next.config.mjs`), so images are served
resized and in AVIF/WebP rather than as multi-MB originals — the single biggest
mobile load-time win. Because optimization is on, remote image hosts have to be
allowlisted; the config currently permits any `https` source, since the admin
panel lets editors paste image URLs from anywhere. Tighten `remotePatterns` to
specific hostnames if you ever want to lock that down.

Files under `public/assets/` are served with a day of cache freshness plus a week
of stale-while-revalidate, so repeat visits don't re-download the hero video and
every logo. Deliberately not `immutable` — these filenames are stable and do get
overwritten, and `immutable` would strand visitors on an old copy indefinitely.
