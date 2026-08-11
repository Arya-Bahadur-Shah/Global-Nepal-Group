import './globals.css'
import { Sora, Inter, IBM_Plex_Mono } from 'next/font/google'
import SiteChrome from '@/components/SiteChrome'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import { getSite } from '@/lib/content'

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

/* Root layout — wraps every page with the shared header + footer. */
export const metadata = {
  title: 'Global Nepal Group — Connecting Nepal to the World',
  description:
    "Track, Trace & Identity for Nepali industry. Global Nepal Group exports the world's leading coding, marking and RFID technology and builds one-click traceability software — supplied, installed and supported locally.",
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
