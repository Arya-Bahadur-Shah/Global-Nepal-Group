<<<<<<< HEAD
# Global Nepal Group — Website

Storytelling corporate site for **Global Nepal Group** (Track, Trace & Identity —
coding, marking, RFID and traceability software; Kathmandu, Nepal).
Tagline: *Connecting Nepal to the World.*

**Stack:** Next.js 14 (App Router) + Tailwind CSS. Built-in admin panel (see
below) backed by SQLite — CMS-ready (Sanity.io) if you'd rather use a hosted CMS.
Feature inspiration: Clearpack (solutions tabs), Videojet (hardware grid & trust),
Rynan (hover motion), Domino (confident hero & icon language).

---

## Run it

Requires **Node.js 22.5+** (https://nodejs.org) — the admin database uses Node's
built-in `node:sqlite` module, which needs no native build step but does need
a recent Node version.

```bash
npm install      # first time only
npm run dev      # dev server -> http://localhost:3000
npm run build    # production build
npm run start    # serve the production build
```

Deploy: **not a fit for Vercel/serverless as-is** — the admin database
(`data/gng.db`) and uploaded files (`public/uploads/`) are written to local
disk, which serverless hosts reset on every deploy. Use any host with a
persistent filesystem: a VPS, a Docker container with a mounted volume, or
similar — `npm run build && npm run start`.

---

## Folder map (where everything lives)

```
app/
  layout.jsx            Root layout: fonts + <SiteHeader/> + <SiteFooter/>
  page.jsx              HOMEPAGE — assembles the 9 story "scenes" (documented in-file)
  about/  hardware/  solutions/  blog/  contact/   Inner pages
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

content/                EDITABLE CONTENT (see CMS section):
  site.json  brands.json  solutions.json  hardware.json  clients.json  posts.json
lib/content.js          Reads the JSON above (swap for Sanity later)
sanity/                 Ready-made CMS schemas + connection guide
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

**Before deploying**, consider compressing these — stock footage is often 15–20MB
per clip. A quick pass: `ffmpeg -i input.mp4 -vcodec libx264 -crf 28 -preset slow output.mp4`
typically cuts size by 60–80% with little visible quality loss for a background loop.

## Solutions (Brand -> Solutions -> Solution detail)

Two levels, driven by `content/solutions.json`:

1. **/solutions** — every platform (Cubix, Activ, Trackline, On Service) as a card.
2. **/solutions/[slug]** — full page: description, feature cards, modules (Cubix has
   5; others can add their own), advantages, and a **"Hardware used" section that
   cross-links to the real product pages** in `/hardware` (matched automatically
   by product name via `hardwareUsed` in the JSON — no manual linking needed).

The homepage keeps an interactive tab preview (Clearpack-style) that links out to
each solution's full page via "View full page".

### Add / edit a solution
Edit `content/solutions.json`. Fields: `slug`, `name`, `tag`, `summary` (short,
used on cards + homepage tabs), `description` (full, used on the detail page),
`features` ([title, body] pairs), `modules` (optional, same shape), `advantages`
(short tag strings), `hardwareUsed` (array of product **names** to cross-link),
`visual` (optional screenshot/mockup image).

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
  soon" state; add entries to `content/products.json` with `brandSlug: "yesmark"`
  (or `"oem"`) once that content is finalized — no code changes needed.

## Hardware catalog (Brand -> Products -> Product)

Three levels, all driven by `/content`:

1. **/hardware** — lists every brand (from `content/brands.json`) as a tile.
2. **/hardware/[brand]** — a brand's product grid (the card layout from the
   reference). One page auto-generated per brand.
3. **/hardware/[brand]/[product]** — full product detail with specs and a
   **spec-sheet PDF button that opens in a new tab**. One page per product.

### Add a product
Open `content/products.json`, copy a product object, and set:
- `brandSlug` — which brand it belongs to (must match a slug in `brands.json`)
- `slug`, `name`, `model`, `shortDescription`, `description`, `specs`
- `image` — a photo path in `/public/assets/products` (or an external URL); null = placeholder
- `specSheet` — the PDF: either a file you drop in `/public/assets/specsheets`
  (e.g. `/assets/specsheets/zt411.pdf`) or the brand's official PDF URL. null = "coming soon".

That's it — the brand page and a product detail page appear automatically on the next build.

### Add a brand
Add an object to `content/brands.json` (slug, name, logo, focus, blurb, heroImage).
A new brand page appears at `/hardware/<slug>`.

## Admin panel (`/admin`)

The site is no longer static: brands, products, solutions and blog posts live in
a local SQLite database (`data/gng.db`, seeded once from the original
`content/*.json` the first time the app runs) and can be added/edited/deleted
from a built-in admin panel — including uploading images, videos and
brochure/spec-sheet PDFs. `content/*.json` is now reference-only (what the
database was seeded from); it is not read at runtime.

**Set up admin access** (one-time):
```bash
node scripts/hash-password.js "your-chosen-password"   # prints a bcrypt hash
```
Copy `.env.local.example` to `.env.local` and fill in:
- `ADMIN_EMAIL` — the email you'll log in with
- `ADMIN_PASSWORD_HASH` — the hash printed above
- `ADMIN_SESSION_SECRET` — any long random string (e.g. `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)

Then sign in at `/admin`. There's one admin account (no self-serve signup) —
brands/products/solutions/posts each have a list, a "+ New" form, and an edit
form with delete. Uploaded files are saved under `public/uploads/`.

Blog posts are authored as Markdown in the admin (`## heading`, blank line
between paragraphs, `- ` for bullets, `**bold**`) rather than the old
hand-coded `content/post-content.js` sections — the 3 original posts were
converted to this format automatically during the first-run seed, so they're
just as editable as anything created from scratch.

Prefer a hosted CMS instead? Schemas matching the original JSON shapes are
still pre-built in `/sanity/schemas` with a guide in `/sanity/README.md` if you
ever want to swap the database-backed `lib/content.js` for Sanity.

## Editing content (legacy JSON reference)

`/content/*.json` reflects what the site looked like before the admin panel —
useful as a reference or for re-seeding, but no longer read at runtime (see
"Admin panel" above).

## Real assets included (public/assets)

- `logo/gng-mark.png` — the new Global Nepal Group globe mark (transparent)
- `brands/hid.png`, `brands/yesmark.png` — partner logos (Zebra & Rynan render as text lockups; drop in logos to replace)
- `clients/*` — 10 real client logos (banks + government departments), shown in the trust marquee
- `solutions/*`, `hero/*` — solution and hero imagery carried over

Swap any image by replacing the file (keep the name) or editing the path in the matching `/content/*.json`.

## Lead capture & demo requests

The contact form (and every "Request a Demo"/"Book Live Demo" link, which adds
`?type=demo`) posts to `app/api/contact/route.js`, which saves the lead to the
database — visible at `/admin/leads`, newest first, tagged Contact or Demo.

To also get an email for each one, add to `.env.local`:
```
RESEND_API_KEY=...      # from resend.com
LEADS_TO_EMAIL=you@yourcompany.com
```
Without those, leads are still captured and visible in `/admin/leads` — just no email is sent.

## Accessibility & performance

Mobile-first, keyboard focus visible, `prefers-reduced-motion` respected, images set to
`unoptimized` so they work on any static host without a build-time image service.
=======
# Global-Nepal-Group
Website for Global Nepal Group PVT. LTD. 
>>>>>>> d04f3b6b20d7e08167f0d9042eff0ae06f283297
