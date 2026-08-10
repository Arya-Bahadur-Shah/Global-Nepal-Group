'use client'
/* ============================================================
   HOME SCENE 5 — SOLUTIONS SLIDESHOW & SHOWCASE
   Dynamic slideshow component with continuous autonomous auto-play,
   progress bars, manual prev/next navigation, sub-views,
   and crisp platform visuals for each solution.
   ============================================================ */
import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Reveal, SectionKicker, ArrowIcon } from '@/components/ui'

const SLIDE_DURATION = 6000 // 6 seconds per slide

export default function SolutionsTabs({ solutions = [] }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [direction, setDirection] = useState('right') // 'right' | 'left'
  const [subView, setSubView] = useState('overview') // 'overview' | 'modules' | 'hardware'
  const [activeFeature, setActiveFeature] = useState(null)
  const touchStartX = useRef(null)

  const count = solutions.length
  const active = solutions[activeIndex] || solutions[0]

  const goToSlide = useCallback((newIndex, dir = 'right') => {
    setDirection(dir)
    setActiveIndex(newIndex)
    setSubView('overview')
    setActiveFeature(null)
  }, [])

  const nextSlide = useCallback(() => {
    if (count === 0) return
    goToSlide((activeIndex + 1) % count, 'right')
  }, [activeIndex, count, goToSlide])

  const prevSlide = useCallback(() => {
    if (count === 0) return
    goToSlide((activeIndex - 1 + count) % count, 'left')
  }, [activeIndex, count, goToSlide])

  // Autonomous autoplay timer interval — ALWAYS ON
  useEffect(() => {
    if (count <= 1) return
    const timer = setInterval(() => {
      nextSlide()
    }, SLIDE_DURATION)
    return () => clearInterval(timer)
  }, [count, nextSlide])

  // Keyboard arrow keys navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') nextSlide()
      if (e.key === 'ArrowLeft') prevSlide()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [nextSlide, prevSlide])

  // Touch handlers for mobile swipe
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return
    const diffX = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(diffX) > 40) {
      if (diffX > 0) prevSlide()
      else nextSlide()
    }
    touchStartX.current = null
  }

  if (!solutions || solutions.length === 0) return null

  return (
    <section 
      id="solutions" 
      className="bg-mist py-20 lg:py-28 overflow-hidden relative select-none"
    >
      <div className="mx-auto max-w-content px-5 sm:px-8">
        
        {/* HEADER & SLIDESHOW CONTROLS */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <Reveal className="max-w-2xl">
            <SectionKicker>Software Solutions</SectionKicker>
            <h2 className="mt-3 font-display font-extrabold text-ocean text-4xl sm:text-5xl tracking-tight leading-tight">
              Software Solutions built for <span className="text-crimson">end-to-end traceability</span>
            </h2>
            <p className="mt-4 text-steel text-base sm:text-lg">
              The software platforms we build to identify, track, and manage assets across your entire supply chain.
            </p>
          </Reveal>

          {/* SLIDESHOW NAVIGATION CONTROLS */}
          <Reveal variant="right" className="flex items-center gap-4 shrink-0 self-start md:self-auto">
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur border border-cloud rounded-full px-4 py-2 shadow-sm text-xs font-mono font-bold text-ocean">
              <span className="text-crimson font-extrabold text-sm">0{activeIndex + 1}</span>
              <span className="text-cloud font-normal">/</span>
              <span>0{count}</span>
            </div>

            <div className="flex items-center gap-1.5 bg-white border border-cloud rounded-full p-1.5 shadow-sm">
              <button
                onClick={prevSlide}
                aria-label="Previous solution slide"
                className="w-10 h-10 rounded-full flex items-center justify-center text-ocean hover:bg-mist hover:text-crimson transition-all active:scale-95"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 19l-7-7 7-7"/></svg>
              </button>

              <button
                onClick={nextSlide}
                aria-label="Next solution slide"
                className="w-10 h-10 rounded-full flex items-center justify-center text-ocean hover:bg-mist hover:text-crimson transition-all active:scale-95"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 5l7 7-7 7"/></svg>
              </button>
            </div>
          </Reveal>
        </div>

        {/* SLIDE TAB SELECTOR STRIP WITH CONTINUOUS TIMED PROGRESS BARS */}
        <Reveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8" role="tablist">
            {solutions.map((sol, i) => {
              const isActive = i === activeIndex
              return (
                <button
                  key={sol.slug}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => goToSlide(i, i > activeIndex ? 'right' : 'left')}
                  className={`group relative text-left p-4 sm:p-5 rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
                    isActive 
                      ? 'bg-white border-crimson shadow-xl shadow-crimson/15 -translate-y-1' 
                      : 'bg-mist/80 hover:bg-white border-cloud hover:border-crimson/40 shadow-sm'
                  }`}
                >
                  {/* Active Slide Progress Line (Continuous loop) */}
                  {isActive && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-cloud/30 overflow-hidden">
                      <div 
                        key={activeIndex} 
                        className="h-full bg-gradient-to-r from-crimson to-crimsonBright"
                        style={{
                          animation: `gng-progress ${SLIDE_DURATION}ms linear infinite`
                        }}
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`font-mono text-xs font-extrabold ${isActive ? 'text-crimson' : 'text-steel'}`}>
                      0{i + 1}
                    </span>
                    <span className={`text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 rounded-full font-bold ${
                      isActive ? 'bg-rose text-crimsonDeep border border-roseMid' : 'bg-cloud/60 text-steel'
                    }`}>
                      {sol.tag?.split(' ')[0] || 'Platform'}
                    </span>
                  </div>

                  {sol.logo ? (
                    <div className="relative h-7 w-28 my-1">
                      <Image src={sol.logo} alt={sol.name} fill className="object-contain object-left" />
                    </div>
                  ) : (
                    <h3 className={`font-display font-extrabold text-lg sm:text-xl transition-colors ${
                      isActive ? 'text-ocean' : 'text-steel group-hover:text-ocean'
                    }`}>
                      {sol.name}
                    </h3>
                  )}

                  <p className="text-xs text-steel line-clamp-1 mt-1 font-medium">
                    {sol.tag}
                  </p>
                </button>
              )
            })}
          </div>
        </Reveal>

        {/* ACTIVE SLIDE DISPLAY PANEL WITH DIRECTIONAL ANIMATION */}
        <div 
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative min-h-[500px]"
        >
          <div 
            key={`${active.slug}-${direction}`}
            className={`rounded-3xl bg-white border-2 border-cloud shadow-2xl p-6 sm:p-10 lg:p-12 grid lg:grid-cols-12 gap-8 lg:gap-12 items-stretch ${
              direction === 'right' ? 'anim-slide-right' : 'anim-slide-left'
            }`}
          >
            {/* LEFT COLUMN: SOLUTION DETAILS & SUB-TABS (7 cols) */}
            <div className="lg:col-span-7 flex flex-col justify-between">
              <div>
                {/* SUB-VIEW NAVIGATION TOGGLES */}
                <div className="flex items-center gap-2 border-b border-cloud pb-4 mb-6">
                  <button
                    onClick={() => setSubView('overview')}
                    className={`px-4 py-2 rounded-xl font-mono text-xs uppercase tracking-wider font-bold transition-all ${
                      subView === 'overview' 
                        ? 'bg-crimson text-white shadow-md shadow-crimson/30 scale-105' 
                        : 'bg-mist text-ocean hover:bg-rose hover:text-crimson border border-cloud/60'
                    }`}
                  >
                    Overview
                  </button>
                  {active.modules && active.modules.length > 0 && (
                    <button
                      onClick={() => setSubView('modules')}
                      className={`px-4 py-2 rounded-xl font-mono text-xs uppercase tracking-wider font-bold transition-all flex items-center gap-1.5 ${
                        subView === 'modules' 
                          ? 'bg-crimson text-white shadow-md shadow-crimson/30 scale-105' 
                          : 'bg-mist text-ocean hover:bg-rose hover:text-crimson border border-cloud/60'
                      }`}
                    >
                      <span>Modules</span>
                      <span className="bg-rose text-crimsonDeep px-1.5 py-0.2 rounded font-mono text-[10px] font-bold">
                        {active.modules.length}
                      </span>
                    </button>
                  )}
                  {active.hardwareUsed && active.hardwareUsed.length > 0 && (
                    <button
                      onClick={() => setSubView('hardware')}
                      className={`px-4 py-2 rounded-xl font-mono text-xs uppercase tracking-wider font-bold transition-all ${
                        subView === 'hardware' 
                          ? 'bg-crimson text-white shadow-md shadow-crimson/30 scale-105' 
                          : 'bg-mist text-ocean hover:bg-rose hover:text-crimson border border-cloud/60'
                      }`}
                    >
                      Hardware Pairings
                    </button>
                  )}
                </div>

                {/* OVERVIEW CONTENT */}
                {subView === 'overview' && (
                  <div className="anim-fade-up">
                    <div className="flex items-center gap-3">
                      <span className="inline-block h-2.5 w-2.5 rounded-full bg-crimson anim-pulse" />
                      <span className="font-mono text-xs font-extrabold tracking-widest uppercase text-crimsonDeep bg-rose px-2.5 py-1 rounded-md border border-roseMid">
                        {active.tag}
                      </span>
                    </div>

                    <div className="mt-3">
                      {active.logo ? (
                        <div className="relative h-12 w-44 sm:h-14 sm:w-56 mb-2">
                          <Image src={active.logo} alt={active.name} fill className="object-contain object-left" priority />
                        </div>
                      ) : (
                        <h3 className="font-display font-extrabold text-ocean text-3xl sm:text-4xl">
                          {active.name} <span className="font-light text-steel text-2xl">Platform</span>
                        </h3>
                      )}
                    </div>

                    <p className="mt-4 text-steel text-base sm:text-lg leading-relaxed">
                      {active.summary || active.description}
                    </p>

                    {/* FEATURE HIGHLIGHTS */}
                    {active.features && active.features.length > 0 && (
                      <div className="mt-6">
                        <div className="text-xs font-mono text-steel uppercase tracking-wider font-bold mb-3">
                          Key Capabilities
                        </div>
                        <div className="space-y-3">
                          {active.features.map(([title, desc], idx) => {
                            const isSelected = activeFeature === idx
                            return (
                              <div
                                key={title}
                                onMouseEnter={() => setActiveFeature(idx)}
                                onMouseLeave={() => setActiveFeature(null)}
                                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                                  isSelected 
                                    ? 'bg-mist/80 border-gold shadow-sm translate-x-1' 
                                    : 'bg-white border-cloud/60 hover:border-ocean/30'
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <span className={`mt-0.5 flex items-center justify-center h-5 w-5 rounded-full shrink-0 font-mono text-xs ${
                                    isSelected ? 'bg-crimson text-white' : 'bg-gold/15 text-gold'
                                  }`}>
                                    ✓
                                  </span>
                                  <div>
                                    <div className="font-display font-bold text-ocean text-sm sm:text-base">
                                      {title}
                                    </div>
                                    {desc && (
                                      <p className="text-xs text-steel mt-0.5 leading-normal">
                                        {desc}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* MODULES CONTENT */}
                {subView === 'modules' && (
                  <div className="anim-fade-up space-y-3">
                    <div className="text-xs font-mono text-steel uppercase tracking-wider font-bold mb-3">
                      Integrated {active.name} Modules
                    </div>
                    {active.modules.map(([mName, mDesc]) => (
                      <div key={mName} className="p-4 rounded-xl border border-cloud bg-mist/40 hover:bg-white transition-all">
                        <div className="font-display font-extrabold text-ocean text-base flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-gold" />
                          {mName}
                        </div>
                        <p className="mt-1 text-xs sm:text-sm text-steel leading-relaxed">
                          {mDesc}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* HARDWARE PAIRINGS CONTENT */}
                {subView === 'hardware' && (
                  <div className="anim-fade-up">
                    <div className="text-xs font-mono text-steel uppercase tracking-wider font-bold mb-3">
                      Compatible Hardware & Tagging Systems
                    </div>
                    <p className="text-sm text-steel mb-4">
                      {active.name} seamlessly interfaces with industrial scanners, RFID readers, and high-speed printers:
                    </p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {active.hardwareUsed.map((hw) => (
                        <div key={hw} className="p-3.5 rounded-xl border border-cloud bg-mist/50 flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-ocean/10 text-ocean flex items-center justify-center font-bold text-xs">
                            HW
                          </div>
                          <span className="font-display font-bold text-ocean text-sm">{hw}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ACTION CALL-TO-ACTION BUTTONS */}
              <div className="mt-8 pt-6 border-t border-cloud flex flex-wrap items-center gap-4">
                <Link
                  href={`/software-solutions/${active.slug}`}
                  className="inline-flex items-center gap-2.5 rounded-xl bg-crimson px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-crimson/30 hover:bg-crimsonD hover:scale-[1.02] transition-all group"
                >
                  <span>Explore Full {active.name} Page</span>
                  <span className="group-hover:translate-x-1 transition-transform">
                    <ArrowIcon />
                  </span>
                </Link>

                <Link
                  href="/contact?type=demo"
                  className="inline-flex items-center gap-2 rounded-xl border-2 border-cloud bg-mist px-6 py-3.5 text-sm font-bold text-ocean hover:border-crimson hover:text-crimson hover:bg-rose transition-all shadow-sm"
                >
                  Book Live Demo
                </Link>
              </div>
            </div>

            {/* RIGHT COLUMN: PLATFORM VISUAL (5 cols) */}
            <div className="lg:col-span-5 flex flex-col justify-center">
              <div className="relative rounded-2xl overflow-hidden min-h-[380px] lg:min-h-[440px] border border-cloud/80 shadow-xl shadow-ocean/10 group bg-ocean">
                {active.visual ? (
                  <>
                    <Image
                      src={active.visual}
                      alt={active.name}
                      fill
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ocean/85 via-ocean/20 to-transparent" />
                    
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur border border-white/20 text-[11px] font-mono font-bold text-gold mb-2.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 anim-blink" />
                        {active.name} Platform Visual
                      </div>
                      <p className="text-xs sm:text-sm text-white/90 font-medium leading-relaxed">
                        {active.summary}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-ocean via-[#181a20] to-abyss p-6 text-white flex flex-col justify-between">
                    <div className="absolute inset-0 u-grid opacity-30 pointer-events-none" />
                    <div className="anim-scan pointer-events-none" />
                    <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-4">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-crimson/90 shadow-sm shadow-crimson" />
                        <span className="font-mono text-xs font-bold text-gold tracking-wider uppercase">
                          {active.name} PLATFORM
                        </span>
                      </div>
                    </div>
                    <div className="relative z-10 font-mono text-xs text-white/80">
                      <div className="text-gold font-bold">{active.tag}</div>
                      <p className="mt-2 text-white/70">{active.summary}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
