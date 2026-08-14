/* ============================================================
   SITE FOOTER
   Company summary, quick links, solutions/hardware columns and
   contact line. Reads contact details from the content layer.
   ============================================================ */
import Link from 'next/link'
import Image from 'next/image'

const FOOTER_COLUMNS = [
  { title: 'Software Solutions', href: '/software-solutions', links: [['Cubix', '/software-solutions/cubix'], ['Activ', '/software-solutions/activ'], ['Trackline', '/software-solutions/trackline'], ['On Service', '/software-solutions/on-service']] },
  { title: 'Industrial Solutions', href: '/industrial-solutions', links: [['Factory Traceability', '/industrial-solutions/factory-traceability'], ['Vision & Quality', '/industrial-solutions/industrial-vision-systems'], ['Machinery Fleet IoT', '/industrial-solutions/machinery-fleet-iot'], ['Smart Warehouse', '/industrial-solutions/smart-warehouse-automation']] },
  { title: 'Hardware', href: '/hardware', links: [['Zebra', '/hardware/zebra'], ['Rynan', '/hardware/rynan'], ['HID', '/hardware/hid'], ['Yesmark', '/hardware/yesmark']] },
  { title: 'Industries', href: '/industries', links: [['Banking & Finance', '/industries/banking-finance'], ['Government', '/industries/government-public-sector'], ['FMCG & Food', '/industries/fmcg-food-beverage'], ['Pharmaceuticals', '/industries/pharmaceuticals'], ['Manufacturing', '/industries/manufacturing-cement-steel']] },
  { title: 'Company', href: null, links: [['About Us', '/about'], ['Contact Us', '/contact']] },
]

export default function SiteFooter({ site = {} }) {
  return (
    <footer className="bg-abyss text-white/70">
      <div className="mx-auto max-w-content px-5 sm:px-8 py-16 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-10">
        <div className="col-span-2">
          <div className="flex items-center gap-3">
            <Image src={site.logo || '/assets/logo/gng.png'} alt="Global Nepal Group" width={150} height={45} className="h-9 w-auto object-contain" />
            <span className="font-display font-extrabold text-white text-[15px] tracking-tight border-l border-white/20 pl-3">GLOBAL NEPAL GROUP</span>
          </div>
          <p className="mt-4 text-sm max-w-xs leading-relaxed">
            Track, Trace &amp; Identity for Nepali industry — exporting the world&rsquo;s leading identification technology and building traceability software, supported locally.
          </p>
          <p className="mt-4 font-mono text-xs text-white/50">{site.address} · {site.phone}</p>
        </div>
        {FOOTER_COLUMNS.map((col) => (
          <div key={col.title}>
            {col.href ? (
              <Link href={col.href} className="font-mono text-[11px] tracking-widest uppercase text-white/50 hover:text-gold transition-colors inline-block">{col.title}</Link>
            ) : (
              <div className="font-mono text-[11px] tracking-widest uppercase text-white/40">{col.title}</div>
            )}
            <ul className="mt-4 space-y-2.5">
              {col.links.map(([label, href]) => (
                <li key={label}><Link href={href} className="text-sm hover:text-gold transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-content px-5 sm:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-mono text-xs text-white/40">© 2026 {site.company}. {site.tagline}.</p>
          <div className="flex gap-5">
            <Link href="#" className="text-xs text-white/40 hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="text-xs text-white/40 hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
