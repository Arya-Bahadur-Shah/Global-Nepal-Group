'use client'
/* ============================================================
   SITE HEADER — CLIENT SHELL
   Receives the dynamic nav items built by the server component
   (SiteHeader.jsx) so the DB is never touched on the client.
   Handles scroll state, multi-level dropdowns, mobile menu and accordion.
   ============================================================ */
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function SiteHeaderClient({ navItems, logo = '/assets/logo/gng.png' }) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [openAccordion, setOpenAccordion] = useState(null)
  const [openSubAccordion, setOpenSubAccordion] = useState(null)

  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileOpen])

  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div
        className={`bg-navbar/95 backdrop-blur-xl transition-shadow duration-300 ${
          isScrolled ? 'shadow-[0_8px_24px_-14px_rgba(14,44,68,.35)] border-b border-cloud' : 'border-b border-white/40'
        }`}
      >
        <div className="mx-auto max-w-[1720px] px-3 sm:px-6 lg:px-10 xl:px-14 h-18 sm:h-[84px] lg:h-[88px] flex items-center justify-between">
          {/* Left group: Logo + Navigation links */}
          <div className="flex items-center gap-4 lg:gap-6 xl:gap-10 min-w-0">
            <Link href="/" onClick={() => setIsMobileOpen(false)} className="flex items-center gap-3 shrink-0 py-1.5 overflow-visible">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logo || '/assets/logo/gng.png'}
                alt="Global Nepal Group"
                className="h-11 sm:h-13 lg:h-15 w-auto max-h-15 max-w-[240px] sm:max-w-[340px] object-contain origin-left scale-110 sm:scale-115 transition-all duration-200"
              />
            </Link>

            {/* Desktop navigation */}
            <nav className="hidden lg:flex items-center gap-3.5 xl:gap-6">
              {navItems.map((item) =>
                item.children ? (
                  <div key={item.label} className="nav-item relative">
                    <Link href={item.href} className="flex items-center gap-1 whitespace-nowrap text-[13px] xl:text-[14px] font-bold tracking-wide uppercase text-ocean/90 hover:text-crimson transition-colors py-2">
                      {item.label}
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="opacity-60"><path d="M6 9l6 6 6-6" /></svg>
                    </Link>
                    <div className="nav-dropdown absolute left-0 top-full pt-1">
                      <div className="min-w-[230px] rounded-xl border border-cloud bg-white shadow-[0_24px_50px_-20px_rgba(14,44,68,.45)] py-1">
                        {item.children.map((child) =>
                          child.children && child.children.length > 0 ? (
                            <div key={child.label} className="sub-nav-item relative group/sub">
                              <Link href={child.href} className="flex items-center justify-between px-4 py-2.5 text-[14px] text-ocean hover:bg-mist hover:text-crimson transition-colors w-full font-medium">
                                <span>{child.label}</span>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="opacity-50 group-hover/sub:translate-x-0.5 transition-transform"><path d="M9 18l6-6-6-6" /></svg>
                              </Link>
                              {/* Level 3 Flyout Menu */}
                              <div className="sub-nav-dropdown absolute left-full top-0 ml-1 pt-0">
                                <div className="min-w-[240px] max-h-[70vh] overflow-y-auto rounded-xl border border-cloud bg-white shadow-[0_24px_50px_-20px_rgba(14,44,68,.45)] py-1">
                                  {child.children.map((grandChild) => (
                                    <Link key={grandChild.label} href={grandChild.href} className="block px-4 py-2 text-xs xl:text-sm text-ocean/90 hover:bg-mist hover:text-crimson transition-colors font-normal">
                                      {grandChild.label}
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <Link key={child.label} href={child.href} className="block px-4 py-2.5 text-[14px] text-ocean hover:bg-mist hover:text-crimson transition-colors font-medium">
                              {child.label}
                            </Link>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link key={item.label} href={item.href} className="relative whitespace-nowrap text-[13px] xl:text-[14px] font-bold tracking-wide uppercase text-ocean/90 hover:text-crimson transition-colors group py-2">
                    {item.label}
                    <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-crimson transition-all duration-300 group-hover:w-full" />
                  </Link>
                )
              )}
            </nav>
          </div>

          {/* CTA + mobile toggle */}
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/blog" className="hidden sm:inline-flex items-center gap-2 whitespace-nowrap rounded-xl bg-crimson px-5 py-2 text-sm font-bold text-white hover:bg-crimsonD shadow-md shadow-crimson/30 hover:scale-105 transition-all">
              Blog
            </Link>
            <button onClick={() => setIsMobileOpen((v) => !v)} className="lg:hidden grid place-items-center h-10 w-10 rounded-xl border border-cloud bg-white text-ocean hover:text-crimson shadow-sm active:scale-95 transition-all" aria-label="Toggle menu">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d={isMobileOpen ? 'M6 6l12 12M6 18L18 6' : 'M4 7h16M4 12h16M4 17h16'} /></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Backdrop & Drawer Menu */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 top-[72px] sm:top-[84px] z-40 flex flex-col justify-start">
          {/* Backdrop mask */}
          <div 
            className="absolute inset-0 bg-ocean/60 backdrop-blur-md transition-opacity duration-300" 
            onClick={() => setIsMobileOpen(false)} 
          />

          {/* Mobile drawer panel */}
          <div className="relative bg-white border-b border-cloud shadow-2xl rounded-b-3xl max-h-[82vh] overflow-y-auto z-10 animate-slideIn">
            <div className="px-5 py-4 space-y-1">
              {navItems.map((item) =>
                item.children ? (
                  <div key={item.label} className="border-b border-cloud/60 py-1">
                    <div className="w-full flex items-center justify-between py-2.5">
                      <Link href={item.href} onClick={() => setIsMobileOpen(false)} className="font-display font-extrabold text-ocean hover:text-crimson text-base">
                        {item.label}
                      </Link>
                      <button onClick={() => setOpenAccordion((v) => (v === item.label ? null : item.label))} className="p-2 rounded-lg bg-mist/80 text-ocean hover:text-crimson transition-colors" aria-label={`Toggle ${item.label} menu`}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={openAccordion === item.label ? 'rotate-180 transition-transform' : 'transition-transform'}><path d="M6 9l6 6 6-6" /></svg>
                      </button>
                    </div>
                    {openAccordion === item.label && (
                      <div className="pb-3 pl-3 pr-1 space-y-1.5 anim-fade-up">
                        {item.children.map((child) =>
                          child.children && child.children.length > 0 ? (
                            <div key={child.label} className="border-l-2 border-crimson/30 pl-3 my-2">
                              <div className="flex items-center justify-between py-1.5">
                                <Link href={child.href} onClick={() => setIsMobileOpen(false)} className="text-sm font-bold text-ocean hover:text-crimson">
                                  {child.label}
                                </Link>
                                <button onClick={() => setOpenSubAccordion((v) => (v === child.label ? null : child.label))} className="p-1 text-steel hover:text-crimson">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={openSubAccordion === child.label ? 'rotate-180 transition-transform' : 'transition-transform'}><path d="M6 9l6 6 6-6" /></svg>
                                </button>
                              </div>
                              {openSubAccordion === child.label && (
                                <div className="pl-3 py-1 space-y-1 border-l border-cloud">
                                  {child.children.map((grandChild) => (
                                    <Link key={grandChild.label} href={grandChild.href} onClick={() => setIsMobileOpen(false)} className="block text-xs text-steel hover:text-crimson py-1 font-medium">
                                      {grandChild.label}
                                    </Link>
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : (
                            <Link key={child.label} href={child.href} onClick={() => setIsMobileOpen(false)} className="block py-2 px-2 rounded-lg text-steel hover:bg-mist hover:text-crimson text-sm font-medium transition-colors">{child.label}</Link>
                          )
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link key={item.label} href={item.href} onClick={() => setIsMobileOpen(false)} className="block py-3 font-display font-extrabold text-ocean hover:text-crimson text-base border-b border-cloud/60 transition-colors">{item.label}</Link>
                )
              )}

              {/* Mobile CTAs */}
              <div className="pt-4 pb-2 space-y-2.5">
                <Link href="/blog" onClick={() => setIsMobileOpen(false)} className="block w-full text-center rounded-xl bg-crimson py-3.5 font-bold text-white shadow-lg shadow-crimson/25 hover:bg-crimsonD transition-all">
                  Visit Blog &amp; Insights
                </Link>
                <Link href="/contact" onClick={() => setIsMobileOpen(false)} className="block w-full text-center rounded-xl border-2 border-cloud bg-mist py-3.5 font-bold text-ocean hover:border-crimson hover:text-crimson transition-all">
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
