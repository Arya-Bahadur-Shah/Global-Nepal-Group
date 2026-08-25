import Link from 'next/link'
import { requireSession } from '@/lib/auth'
import { revalidateContent } from '@/lib/revalidate'
import { listBrands, deleteBrand } from '@/lib/admin-data'
import DeleteButton from '../_components/DeleteButton'

export const metadata = { title: 'Brands — Admin' }

export default async function AdminBrandsPage() {
  const brands = await listBrands()

  async function remove(id) {
    'use server'
    await requireSession()
    await deleteBrand(id)
    revalidateContent('brands', '/admin/brands')
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-ocean text-2xl">Brands</h1>
        <Link href="/admin/brands/new" className="rounded-lg bg-ocean px-4 py-2.5 text-sm font-semibold text-white hover:bg-crimson transition-colors">+ New brand</Link>
      </div>

      <div className="mt-6 rounded-xl border border-cloud bg-white overflow-hidden">
        {brands.length === 0 ? (
          <p className="p-6 text-sm text-steel">No brands yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cloud text-left font-mono text-[11px] tracking-widest uppercase text-steel">
                <th className="p-4">Name</th>
                <th className="p-4">Slug</th>
                <th className="p-4">Focus</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {brands.map((b) => (
                <tr key={b.id} className="border-b border-cloud last:border-0">
                  <td className="p-4 font-medium text-ocean">{b.name}</td>
                  <td className="p-4 text-steel font-mono text-xs">{b.slug}</td>
                  <td className="p-4 text-steel">{b.focus}</td>
                  <td className="p-4 text-right whitespace-nowrap">
                    <Link href={`/admin/brands/${b.id}/edit`} className="text-sm font-medium text-azure hover:text-ocean transition-colors mr-4">Edit</Link>
                    <DeleteButton action={remove.bind(null, b.id)} />
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
