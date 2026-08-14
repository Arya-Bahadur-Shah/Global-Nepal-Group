/* ============================================================
   SITE HEADER — SERVER COMPONENT
   Fetches live data from the DB and builds the dynamic nav items,
   then hands them to the SiteHeaderClient interactive shell.
   Adding / renaming a Software Solution, Industrial Solution, or
   Hardware brand in the admin panel will automatically appear here.
   ============================================================ */
import { getSolutions, getIndustrialSolutions, getBrands, getIndustries, getSite } from '@/lib/content'
import SiteHeaderClient from './SiteHeaderClient'

export default async function SiteHeader() {
  const solutions = await getSolutions()
  const industrialSolutions = await getIndustrialSolutions()
  const brands = await getBrands()
  const industries = await getIndustries()
  // getSite() falls back to the file in public/assets/logo/ when no
  // logo has been uploaded, so this is never empty.
  const site = await getSite()

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'About Us', href: '/about' },
    {
      label: 'Software Solutions',
      href: '/software-solutions',
      children: solutions.map((s) => ({
        label: s.name,
        href: `/software-solutions/${s.slug}`,
      })),
    },
    {
      label: 'Industrial Solutions',
      href: '/industrial-solutions',
      children: industrialSolutions.map((s) => ({
        label: s.name,
        href: `/industrial-solutions/${s.slug}`,
      })),
    },
    {
      label: 'Hardware',
      href: '/hardware',
      children: brands.map((b) => ({
        label: b.name,
        href: `/hardware/${b.slug}`,
      })),
    },
    {
      label: 'Industries',
      href: '/industries',
      children: industries.map((ind) => ({
        label: ind.name,
        href: `/industries/${ind.slug}`,
      })),
    },
    { label: 'Contact Us', href: '/contact' },
  ]

  return <SiteHeaderClient navItems={navItems} logo={site.logo} />
}
