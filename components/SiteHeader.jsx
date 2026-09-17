/* ============================================================
   SITE HEADER — SERVER COMPONENT
   Fetches live data from the DB and builds the dynamic nav items,
   then hands them to the SiteHeaderClient interactive shell.
   Adding / renaming a Software Solution, Industrial Solution, or
   Hardware brand in the admin panel will automatically appear here.
   ============================================================ */
import { getSolutions, getIndustrialSolutions, getBrands, getIndustries, getSite, getProducts, getProductsByIndustrialSolution } from '@/lib/content'
import SiteHeaderClient from './SiteHeaderClient'

export default async function SiteHeader() {
  const solutions = await getSolutions()
  const industrialSolutions = await getIndustrialSolutions()
  const brands = await getBrands()
  const industries = await getIndustries()
  const products = await getProducts()
  const site = await getSite()

  const brandsWithProducts = brands.map((b) => {
    const brandProds = products.filter((p) => p.brandSlug === b.slug)
    return {
      label: b.name,
      href: `/hardware/${b.slug}`,
      children: brandProds.map((p) => ({
        label: p.name || p.model,
        href: `/hardware/${b.slug}/${p.slug}`,
      })),
    }
  })

  const industrialSolutionsWithProducts = await Promise.all(
    industrialSolutions.map(async (s) => {
      const prods = await getProductsByIndustrialSolution(s.slug)
      return {
        label: s.name,
        href: `/industrial-solutions/${s.slug}`,
        children: (prods || []).map((p) => ({
          label: p.name || p.model,
          href: `/industrial-solutions/${s.slug}/${p.slug}`,
        })),
      }
    })
  )

  const navItems = [
    { label: 'Home', href: '/' },
    {
      label: 'Hardware',
      href: '/hardware',
      children: brandsWithProducts,
    },
    {
      label: 'Industrial Solutions',
      href: '/industrial-solutions',
      children: industrialSolutionsWithProducts,
    },
    {
      label: 'Software Solutions',
      href: '/software-solutions',
      children: solutions.map((s) => ({
        label: s.name,
        href: `/software-solutions/${s.slug}`,
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
