'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

// Inline SVG icons — no extra dependency needed
const Icons = {
  dashboard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/>
      <rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>
    </svg>
  ),
  brands: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
    </svg>
  ),
  products: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  ),
  solutions: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07M8.46 8.46a5 5 0 0 0 0 7.07"/>
    </svg>
  ),
  industries: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18"/><path d="M5 21V7l7-4v18"/><path d="M19 21V11l-7-4"/>
      <path d="M9 9v.01"/><path d="M9 13v.01"/><path d="M9 17v.01"/>
    </svg>
  ),
  posts: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
      <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
      <line x1="10" y1="9" x2="8" y2="9"/>
    </svg>
  ),
  leads: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  clients: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  settings: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14M19.07 4.93L12 12M4.93 4.93L12 12"/>
      <path d="M12 2v2m0 16v2M2 12h2m16 0h2"/>
    </svg>
  ),
  guide: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      <line x1="9" y1="7" x2="15" y2="7"/>
      <line x1="9" y1="11" x2="15" y2="11"/>
    </svg>
  ),
  home: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>
    </svg>
  ),
  about: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
    </svg>
  ),
  viewSite: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
      <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
    </svg>
  ),
  logout: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
}

const LINKS = [
  { href: '/admin',                      label: 'Dashboard',             icon: Icons.dashboard,  exact: true },
  { href: '/admin/guide',                label: 'User Manual',            icon: Icons.guide },
  { href: '/admin/home',                 label: 'Home Page',              icon: Icons.home },
  { href: '/admin/about',                label: 'About Us',               icon: Icons.about },
  { href: '/admin/brands',               label: 'Brands',                 icon: Icons.brands },
  { href: '/admin/products',             label: 'Products',               icon: Icons.products },
  { href: '/admin/solutions',            label: 'Software Solutions',     icon: Icons.solutions },
  { href: '/admin/industrial-solutions', label: 'Industrial Solutions',   icon: Icons.solutions },
  { href: '/admin/industries',           label: 'Industries',             icon: Icons.industries },
  { href: '/admin/clients',              label: 'Clients',                icon: Icons.clients },
  { href: '/admin/posts',                label: 'Blog Posts',             icon: Icons.posts },
  { href: '/admin/leads',                label: 'Leads',                  icon: Icons.leads },
  { href: '/admin/settings',             label: 'Admin Users',            icon: Icons.settings },
]

function NavLink({ href, label, icon, exact }) {
  const pathname = usePathname()
  const isActive = exact ? pathname === href : pathname.startsWith(href)

  return (
    <Link
      href={href}
      className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150
        ${isActive
          ? 'bg-gradient-to-r from-crimson to-crimsonBright text-white shadow-md shadow-crimson/25'
          : 'text-steel hover:bg-mist hover:text-ocean'
        }`}
    >
      <span className={`flex-shrink-0 transition-transform duration-150 group-hover:scale-110 ${isActive ? 'text-white' : ''}`}>
        {icon}
      </span>
      <span>{label}</span>
      {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70" />}
    </Link>
  )
}

export default function AdminNav({ email, logout }) {
  const initial = email?.[0]?.toUpperCase() ?? 'A'

  return (
    <aside className="w-64 flex-shrink-0 border-r border-cloud bg-white h-screen sticky top-0 flex flex-col shadow-sm">
      {/* Logo / Brand */}
      <div className="px-5 py-6 border-b border-cloud">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-crimson to-crimsonBright flex items-center justify-center shadow-md shadow-crimson/30 flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/>
            </svg>
          </div>
          <div>
            <p className="font-display font-bold text-ocean text-[15px] leading-none">GNG Admin</p>
            <p className="mt-1 text-[11px] text-steel">Control Panel</p>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-3 mb-2 text-[10px] font-bold tracking-widest uppercase text-steel/60">Menu</p>
        {LINKS.map((l) => (
          <NavLink key={l.href} {...l} />
        ))}
      </nav>

      {/* Footer: user avatar + quick actions */}
      <div className="px-3 pb-4 pt-3 border-t border-cloud space-y-1">
        {/* Logged-in user pill */}
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-mist mb-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-ocean to-marine flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {initial}
          </div>
          <p className="text-xs text-steel truncate flex-1">{email}</p>
        </div>

        <Link href="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-steel hover:bg-mist hover:text-ocean transition-all">
          {Icons.viewSite}
          <span>View Site</span>
        </Link>
        <form action={logout}>
          <button type="submit" className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-crimson hover:bg-rose hover:text-crimsonD transition-all">
            {Icons.logout}
            <span>Log Out</span>
          </button>
        </form>
      </div>
    </aside>
  )
}
