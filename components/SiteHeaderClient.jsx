'use client'
/* ============================================================
   SITE HEADER — CLIENT SHELL
   Receives the dynamic nav items built by the server component
   (SiteHeader.jsx) so the DB is never touched on the client.
   Handles scroll state, mobile menu and accordion expand/collapse.
   ============================================================ */
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function SiteHeaderClient({ navItems }) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [openAccordion, setOpenAccordion] = useState(null)

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div
        className={`bg-navbar/95 backdrop-blur-xl transition-shadow duration-300 ${
          isScrolled ? 'shadow-[0_8px_24px_-14px_rgba(14,44,68,.35)] border-b border-cloud' : 'border-b border-white/40'
        }`}
      >
        <div className="mx-auto max-w-[1720px] px-5 sm:px-8 lg:px-12 xl:px-16 h-[72px] flex items-center justify-between">
          {/* Brand logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <Image src="/assets/logo/gng.png" alt="Global Nepal Group" width={150} height={45} className="h-10 w-auto object-contain" priority />
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            {navItems.map((item) =>
              item.children ? (
                <div key={item.label} className="nav-item relative">
                  <Link href={item.href} className="flex items-center gap-1 whitespace-nowrap text-[15px] font-medium text-ocean/90 hover:text-crimson transition-colors py-2">
                    {item.label}
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="opacity-60"><path d="M6 9l6 6 6-6" /></svg>
                  </Link>
                  <div className="nav-dropdown absolute left-1/2 -translate-x-1/2 top-full pt-1">
                    <div className="min-w-[210px] rounded-xl border border-cloud bg-white shadow-[0_24px_50px_-20px_rgba(14,44,68,.45)] py-1">
                      {item.children.map((child) => (
                        <Link key={child.label} href={child.href} className="block px-4 py-2.5 text-[15px] text-ocean hover:bg-mist hover:text-crimson transition-colors">
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Link key={item.label} href={item.href} className="relative whitespace-nowrap text-[15px] font-medium text-ocean/90 hover:text-crimson transition-colors group py-2">
                  {item.label}
                  <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-crimson transition-all duration-300 group-hover:w-full" />
                </Link>
              )
            )}
          </nav>

          {/* CTA + mobile toggle */}
          <div className="flex items-center gap-3">
            <Link href="/contact?type=demo" className="hidden sm:inline-flex items-center gap-2 whitespace-nowrap rounded-xl bg-crimson px-5 py-2.5 text-sm font-bold text-white hover:bg-crimsonD shadow-md shadow-crimson/30 hover:scale-105 transition-all">
              Request a Demo
            </Link>
            <button onClick={() => setIsMobileOpen((v) => !v)} className="lg:hidden grid place-items-center h-10 w-10 rounded-lg border border-cloud text-ocean" aria-label="Toggle menu">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={isMobileOpen ? 'M6 6l12 12M6 18L18 6' : 'M4 7h16M4 12h16M4 17h16'} /></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu (accordion) */}
      {isMobileOpen && (
        <div className="lg:hidden bg-navbar border-t border-cloud max-h-[75vh] overflow-auto">
          <div className="px-5 py-3">
            {navItems.map((item) =>
              item.children ? (
                <div key={item.label} className="border-b border-cloud">
                  <div className="w-full flex items-center justify-between py-3">
                    <Link href={item.href} onClick={() => setIsMobileOpen(false)} className="font-medium text-ocean hover:text-crimson text-[15px]">
                      {item.label}
                    </Link>
                    <button onClick={() => setOpenAccordion((v) => (v === item.label ? null : item.label))} className="p-1 text-ocean hover:text-crimson" aria-label={`Toggle ${item.label} menu`}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={openAccordion === item.label ? 'rotate-180 transition-transform' : 'transition-transform'}><path d="M6 9l6 6 6-6" /></svg>
                    </button>
                  </div>
                  {openAccordion === item.label && (
                    <div className="pb-2 pl-3">
                      {item.children.map((child) => (
                        <Link key={child.label} href={child.href} onClick={() => setIsMobileOpen(false)} className="block py-2 text-steel hover:text-crimson">{child.label}</Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link key={item.label} href={item.href} onClick={() => setIsMobileOpen(false)} className="block py-3 font-medium text-ocean border-b border-cloud">{item.label}</Link>
              )
            )}
            <Link href="/contact?type=demo" onClick={() => setIsMobileOpen(false)} className="mt-3 mb-2 block text-center rounded-lg bg-ocean py-3 font-semibold text-white hover:bg-crimson transition-colors">Request a Demo</Link>
          </div>
        </div>
      )}
    </header>
  )
}
