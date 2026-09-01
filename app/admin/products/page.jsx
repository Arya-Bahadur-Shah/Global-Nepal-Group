import Link from 'next/link'
import { requireSession } from '@/lib/auth'
import { revalidateContent } from '@/lib/revalidate'
import { listProducts, deleteProduct, listBrands, listIndustrialSolutions } from '@/lib/admin-data'
import DeleteButton from '../_components/DeleteButton'

export const metadata = { title: 'Products — Admin' }

export default async function AdminProductsPage({ searchParams }) {
  const products = await listProducts()
  const brands = await listBrands()
  const solutions = await listIndustrialSolutions()

  const selectedSolution = searchParams?.solution || null
  const selectedBrand = searchParams?.brand || null

  const filteredProducts = products.filter((p) => {
    if (selectedSolution && p.industrialSolutionSlug !== selectedSolution) return false
    if (selectedBrand && p.brandSlug !== selectedBrand) return false
    return true
  })

  function makeFilterUrl(brand, solution) {
    const params = new URLSearchParams()
    if (brand) params.set('brand', brand)
    if (solution) params.set('solution', solution)
    const qs = params.toString()
    return qs ? `/admin/products?${qs}` : '/admin/products'
  }

  async function remove(id) {
    'use server'
    await requireSession()
    await deleteProduct(id)
    revalidateContent('products', '/admin/products')
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-ocean text-2xl">Products</h1>
          <p className="text-sm text-steel mt-1">Manage equipment products across Brands &amp; Industrial Solutions.</p>
        </div>
        <Link
          href={selectedSolution ? `/admin/products/new?solution=${selectedSolution}` : '/admin/products/new'}
          className="rounded-lg bg-ocean px-4 py-2.5 text-sm font-semibold text-white hover:bg-crimson transition-colors"
        >
          + New product
        </Link>
      </div>

      {/* Filter controls */}
      <div className="mt-6 space-y-3 bg-white p-4 rounded-xl border border-cloud">
        {/* Filter by Industrial Solution */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono font-bold text-steel uppercase w-36 shrink-0">Filter by Solution:</span>
          <Link
            href={makeFilterUrl(selectedBrand, null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              !selectedSolution ? 'bg-ocean text-white' : 'bg-mist text-steel hover:text-ocean'
            }`}
          >
            All Solutions
          </Link>
          {solutions.map((s) => (
            <Link
              key={s.slug}
              href={makeFilterUrl(selectedBrand, s.slug)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedSolution === s.slug ? 'bg-ocean text-white' : 'bg-mist text-steel hover:text-ocean'
              }`}
            >
              {s.name}
            </Link>
          ))}
        </div>

        {/* Filter by Company / Brand */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-cloud/60">
          <span className="text-xs font-mono font-bold text-steel uppercase w-36 shrink-0">Filter by Company:</span>
          <Link
            href={makeFilterUrl(null, selectedSolution)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              !selectedBrand ? 'bg-ocean text-white' : 'bg-mist text-steel hover:text-ocean'
            }`}
          >
            All Companies
          </Link>
          {brands.map((b) => (
            <Link
              key={b.slug}
              href={makeFilterUrl(b.slug, selectedSolution)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedBrand === b.slug ? 'bg-ocean text-white' : 'bg-mist text-steel hover:text-ocean'
              }`}
            >
              {b.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="mt-4 rounded-xl border border-cloud bg-white overflow-hidden overflow-x-auto">
        {filteredProducts.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-steel">No products found matching your current filter selection.</p>
            <Link
              href="/admin/products"
              className="mt-3 inline-block text-xs font-semibold text-crimson hover:underline"
            >
              Clear filters
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cloud text-left font-mono text-[11px] tracking-widest uppercase text-steel">
                <th className="p-4">Name</th>
                <th className="p-4">Company (Brand)</th>
                <th className="p-4">Model</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => (
                <tr key={p.id} className="border-b border-cloud last:border-0 hover:bg-mist/30 transition-colors">
                  <td className="p-4 font-medium text-ocean">{p.name}</td>
                  <td className="p-4">
                    <span className="font-mono text-xs font-bold text-ocean bg-mist border border-cloud px-2.5 py-1 rounded-md uppercase">
                      {p.brandSlug}
                    </span>
                  </td>
                  <td className="p-4 text-steel">{p.model || '—'}</td>
                  <td className="p-4 text-right whitespace-nowrap">
                    <Link href={`/admin/products/${p.id}/edit`} className="text-sm font-medium text-azure hover:text-ocean transition-colors mr-4">Edit</Link>
                    <DeleteButton action={remove.bind(null, p.id)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
