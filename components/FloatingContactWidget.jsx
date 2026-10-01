'use client'
import Link from 'next/link'

export default function FloatingContactWidget() {
  return (
    <aside aria-label="Quick contact">
      {/* Mobile: Sleek Floating Action Button at bottom-right */}
      <div className="fixed bottom-5 right-5 z-40 sm:hidden">
        <Link
          href="/contact"
          className="group flex items-center justify-center bg-crimson hover:bg-crimsonD text-white h-13 w-13 rounded-full shadow-2xl shadow-crimson/50 border-2 border-white/30 active:scale-95 transition-all p-3"
          title="Contact Us"
        >
          <div className="relative flex items-center justify-center">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
            </span>
          </div>
        </Link>
      </div>

      {/* Desktop / Tablet: Side Tab */}
      <div className="hidden sm:flex fixed right-0 top-1/2 -translate-y-1/2 z-40 flex-col gap-1 items-end shadow-2xl">
        <Link
          href="/contact"
          className="group flex flex-col items-center justify-center bg-crimson hover:bg-crimsonD text-white sm:w-20 sm:h-24 rounded-l-2xl shadow-lg shadow-crimson/30 hover:w-24 transition-all duration-300 px-2 py-3"
          title="Contact Us"
        >
          <div className="relative">
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="group-hover:scale-110 transition-transform duration-300"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
          </div>
          <span className="mt-1 text-xs font-bold tracking-wide uppercase text-white group-hover:tracking-wider transition-all">
            Contact
          </span>
        </Link>
      </div>
    </aside>
  )
}
