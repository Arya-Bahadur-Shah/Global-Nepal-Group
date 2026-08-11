/* ============================================================
   HOMEPAGE
   Assembles the "Connecting Nepal to the World" scroll story from
   the scene components in /components/home. Content is pulled once
   here from the content layer and passed down as props.

   Scroll order (the narrative):
     1. HeroConnect       — the promise (full-bleed video + tagline)
     2. TrustMarquee      — hardware capability chips + client logos
     3. PrinterShowcase   — hardware slideshow (Leibinger-style)
     4. StatsBand         — scale (animated counters)
     5. SolutionsTabs     — our software & service solutions
     6. JourneySteps      — the story spine (world → Nepal → traceable)
     7. HardwareGrid      — brand-level hardware catalog
     8. BrandsExport      — the global brands we bring in
     9. InsightsPreview   — thought leadership
    10. ContactCallout    — the ask
   ============================================================ */
import { getSite, getClients, getSolutions, getIndustrialSolutions, getBrands, getIndustries, getPosts } from '@/lib/content'
import HeroConnect from '@/components/home/HeroConnect'
import TrustMarquee from '@/components/home/TrustMarquee'
import PrinterShowcase from '@/components/home/PrinterShowcase'
import StatsBand from '@/components/home/StatsBand'
import JourneySteps from '@/components/home/JourneySteps'
import SolutionsTabs from '@/components/home/SolutionsTabs'
import IndustrialSolutionsShowcase from '@/components/home/IndustrialSolutionsShowcase'
import HardwareGrid from '@/components/home/HardwareGrid'
import BrandsExport from '@/components/home/BrandsExport'
import IndustriesShowcase from '@/components/home/IndustriesShowcase'
import InsightsPreview from '@/components/home/InsightsPreview'
import ContactCallout from '@/components/home/ContactCallout'

export default async function HomePage() {
  const site = await getSite()
  const clients = await getClients()
  const solutions = await getSolutions()
  const industrialSolutions = await getIndustrialSolutions()
  const brands = await getBrands()
  const industries = await getIndustries()
  const posts = (await getPosts()).slice(0, 3)

  return (
    <>
      {/* 1. Full-bleed video hero */}
      <HeroConnect site={site} />

      {/* 2. Hardware capability chips + client logos */}
      <TrustMarquee clients={clients} />

      {/* 3. Industrial hardware slideshow (printer showcase) */}
      <PrinterShowcase />

      {/* 4. Animated stats */}
      <StatsBand stats={site.stats} />

      {/* 5. Software Solution tabs */}
      <SolutionsTabs solutions={solutions} />

      {/* 6. Industrial Solutions topic showcase */}
      <IndustrialSolutionsShowcase industrialSolutions={industrialSolutions} />

      {/* 7. Journey / how-it-works */}
      <JourneySteps />

      {/* 8. Hardware brand grid */}
      <HardwareGrid brands={brands} />

      {/* 8. Global brand export tiles */}
      <BrandsExport brands={brands} />

      {/* 9. Industries we serve */}
      <IndustriesShowcase industries={industries} />

      {/* 10. Blog / insights */}
      <InsightsPreview posts={posts} />

      {/* 10. Contact CTA */}
      <ContactCallout site={site} />
    </>
  )
}
