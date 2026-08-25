import './globals.css'
import { Sora, Inter, IBM_Plex_Mono } from 'next/font/google'
import SiteChrome from '@/components/SiteChrome'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import { getSite } from '@/lib/content'
import { siteUrl } from '@/lib/site-url'

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  weight: ['500', '600', '700', '800'],
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500', '600'],
  display: 'swap',
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  variable: '--font-ibm-plex-mono',
  weight: ['400', '500'],
  display: 'swap',
})

const SITE_NAME = 'Global Nepal Group'
const DESCRIPTION =
  "Track, Trace & Identity for Nepali industry. Global Nepal Group exports the world's leading coding, marking and RFID technology and builds one-click traceability software — supplied, installed and supported locally."

/* Root layout — wraps every page with the shared header + footer.

   ── Social cards ─────────────────────────────────────────────
   Without the openGraph block below, a link to this site pasted into
   LinkedIn, WhatsApp or Slack renders as a bare URL: no title, no
   image, no description. For a site whose job is to be shared, that is
   the difference between a link people click and one they scroll past.

   metadataBase is what makes the RELATIVE image path below resolve to
   an absolute URL — scrapers reject relative ones, and Next warns at
   build time when it is missing.

   openGraph.title and .description are deliberately omitted: Next
   fills them from each page's own title/description, so every product
   and post shares under its own name instead of the homepage's. For
   the same reason there is no openGraph.url — metadata is inherited by
   child pages, so a URL set here would claim every page is the
   homepage. Scrapers use the URL they fetched, which is always right. */
export const metadata = {
  metadataBase: new URL(siteUrl()),
  title: `${SITE_NAME} — Connecting Nepal to the World`,
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    siteName: SITE_NAME,
    type: 'website',
    locale: 'en_US',
    images: [
      {
        // The hero poster: already shipped, already compressed, and the
        // most recognisable single frame of the site.
        url: '/assets/video/hero-poster.jpg',
        width: 1600,
        height: 900,
        alt: `${SITE_NAME} — Track, Trace & Identity for Nepali industry`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/assets/video/hero-poster.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    // Let Google show a full-size thumbnail rather than cropping to a
    // postage stamp. /admin overrides this wholesale in its own layout.
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
}

export default async function RootLayout({ children }) {
  const site = await getSite()
  return (
    <html lang="en" className={`${sora.variable} ${inter.variable} ${ibmPlexMono.variable}`}>
      <body className="font-body">
        {/* SiteHeader and SiteFooter are Server Components — pass them as
            JSX props so the client SiteChrome never has to import them
            (which would try to bundle Node-only fs/sqlite on the client). */}
        <SiteChrome
          header={<SiteHeader />}
          footer={<SiteFooter site={site} />}
        >
          {children}
        </SiteChrome>
      </body>
    </html>
  )
}
