/* ============================================================
   INDUSTRIAL SOLUTION CARD  (matches the reference screenshot layout)
   Image on top (contained in aspect-[4/3] bg-mist box), solution name,
   short description summary, "Read More ->".
   Used in the Industrial Solutions catalog grid. Links to detail page.
   ============================================================ */
import Image from 'next/image'
import Link from 'next/link'
import { ArrowIcon } from '@/components/ui'

export default function IndustrialSolutionCard({ solution }) {
  const href = `/industrial-solutions/${solution.slug}`
  const imageSrc = solution.visual || solution.image

  return (
    <Link href={href} className="group flex flex-col h-full">
      {/* Image well — matches Hardware ProductCard */}
      <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-mist border border-cloud">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={solution.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
            className="object-contain p-6 group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-steel/40">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="M3 15l5-4 4 3 3-2 6 5" />
              <circle cx="8.5" cy="9.5" r="1.5" />
            </svg>
          </div>
        )}
      </div>

      {/* Text */}
      <h3 className="mt-5 font-display font-bold text-ocean text-2xl group-hover:text-crimson transition-colors">
        {solution.name}
      </h3>
      <p className="mt-3 text-steel leading-relaxed line-clamp-2 flex-1 font-medium">
        {solution.summary || solution.description}
      </p>
      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-crimson group-hover:gap-2.5 transition-all">
        Read More <ArrowIcon />
      </span>
    </Link>
  )
}
