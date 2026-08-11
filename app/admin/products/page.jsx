import Link from 'next/link'
import { revalidatePath } from 'next/cache'
import { listProducts, deleteProduct } from '@/lib/admin-data'
import DeleteButton from '../_components/DeleteButton'

export const metadata = { title: 'Products — Admin' }

export default async function AdminProductsPage() {
  const products = await listProducts()

  async function remove(id) {
    'use server'
    await deleteProduct(id)
    revalidatePath('/admin/products')
    revalidatePath('/hardware')
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-ocean text-2xl">Products</h1>
        <Link href="/admin/products/new" className="rounded-lg bg-ocean px-4 py-2.5 text-sm font-semibold text-white hover:bg-crimson transition-colors">+ New product</Link>
      </div>

      <div className="mt-6 rounded-xl border border-cloud bg-white overflow-hidden overflow-x-auto">
        {products.length === 0 ? (
          <p className="p-6 text-sm text-steel">No products yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cloud text-left font-mono text-[11px] tracking-widest uppercase text-steel">
                <th className="p-4">Name</th>
                <th className="p-4">Brand</th>
                <th className="p-4">Model</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-cloud last:border-0">
                  <td className="p-4 font-medium text-ocean">{p.name}</td>
                  <td className="p-4 text-steel font-mono text-xs">{p.brandSlug}</td>
                  <td className="p-4 text-steel">{p.model}</td>
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
