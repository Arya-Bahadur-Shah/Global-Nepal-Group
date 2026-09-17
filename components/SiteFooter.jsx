/* ============================================================
   SITE FOOTER
   Company summary, quick links, solutions/hardware columns and
   contact line. Reads contact details from the content layer.
   ============================================================ */
import Link from 'next/link'
import Image from 'next/image'
import { DEFAULT_FOOTER_COLUMNS } from '@/lib/content'

export default function SiteFooter({ site = {} }) {
  const companyName = site.company || 'GLOBAL NEPAL GROUP'
  const taglineText = site.tagline || "Track, Trace & Identity for Nepali industry — exporting the world's leading identification technology and building traceability software, supported locally."
  const contactDetails = [site.address, site.phone, site.email].filter(Boolean).join(' · ')
  const copyrightText = site.copyright || `© 2026 ${companyName}. ${site.tagline || ''}.`
  const footerColumns = Array.isArray(site.footerColumns) && site.footerColumns.length > 0 ? site.footerColumns : DEFAULT_FOOTER_COLUMNS

  return (
    <footer className="bg-abyss text-white/70">
      <div className="mx-auto max-w-content px-5 sm:px-8 py-16 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-10">
        <div className="col-span-2">
          <div className="flex items-center gap-3">
            <Image src={site.logo || '/assets/logo/gng.png'} alt={companyName} width={150} height={45} className="h-9 w-auto object-contain" />
            <span className="font-display font-extrabold text-white text-[15px] tracking-tight border-l border-white/20 pl-3 uppercase">{companyName}</span>
          </div>
          <p className="mt-4 text-sm max-w-xs leading-relaxed">
            {taglineText}
          </p>
          {contactDetails && <p className="mt-4 font-mono text-xs text-white/50">{contactDetails}</p>}
        </div>
        {footerColumns.map((col, idx) => (
          <div key={col.title || idx}>
            {col.href ? (
              <Link href={col.href} className="font-mono text-[11px] tracking-widest uppercase text-white/50 hover:text-gold transition-colors inline-block">{col.title}</Link>
            ) : (
              <div className="font-mono text-[11px] tracking-widest uppercase text-white/40">{col.title}</div>
            )}
            <ul className="mt-4 space-y-2.5">
              {(col.links || []).map((link, lIdx) => {
                const label = typeof link === 'object' && link !== null ? (Array.isArray(link) ? link[0] : link.label) : String(link)
                const href = typeof link === 'object' && link !== null ? (Array.isArray(link) ? link[1] : link.href) : '#'
                return (
                  <li key={label || lIdx}>
                    <Link href={href || '#'} className="text-sm hover:text-gold transition-colors">{label}</Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-content px-5 sm:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-mono text-xs text-white/40">{copyrightText}</p>
          <div className="flex gap-5">
            <Link href="#" className="text-xs text-white/40 hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="text-xs text-white/40 hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
