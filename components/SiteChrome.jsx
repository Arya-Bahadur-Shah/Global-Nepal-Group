'use client'
/* ============================================================
   SITE CHROME — CLIENT SHELL
   Uses usePathname to hide the public header/footer on /admin/*.
   SiteHeader and SiteFooter are passed in as props (rendered by
   the server layout), so this client component never imports
   server-only modules directly.
   ============================================================ */
import { usePathname } from 'next/navigation'

export default function SiteChrome({ header, footer, children }) {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith('/admin')

  if (isAdmin) return <>{children}</>

  return (
    <>
      {header}
      <main>{children}</main>
      {footer}
    </>
  )
}
