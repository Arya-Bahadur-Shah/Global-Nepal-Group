import Link from 'next/link'
import { requireSession } from '@/lib/auth'
import { revalidateContent } from '@/lib/revalidate'
import { listIndustries, deleteIndustry } from '@/lib/admin-data'
import DeleteButton from '../_components/DeleteButton'

export const metadata = { title: 'Industries — Admin' }

export default async function AdminIndustriesPage() {
  const industries = await listIndustries()

  async function remove(id) {
    'use server'
    await requireSession()
    await deleteIndustry(id)
    revalidateContent('industries', '/admin/industries')
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-ocean text-2xl">Industries</h1>
        <Link href="/admin/industries/new" className="rounded-lg bg-ocean px-4 py-2.5 text-sm font-semibold text-white hover:bg-crimson transition-colors">+ New industry</Link>
      </div>

      <div className="mt-6 rounded-xl border border-cloud bg-white overflow-hidden">
        {industries.length === 0 ? (
          <p className="p-6 text-sm text-steel">No industries yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cloud text-left font-mono text-[11px] tracking-widest uppercase text-steel">
                <th className="p-4">Name</th>
                <th className="p-4">Tag</th>
                <th className="p-4">Clients</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {industries.map((ind) => (
                <tr key={ind.id} className="border-b border-cloud last:border-0">
                  <td className="p-4 font-medium text-ocean">{ind.name}</td>
                  <td className="p-4 text-steel">{ind.tag}</td>
                  <td className="p-4 text-steel">{ind.clients?.length || 0}</td>
                  <td className="p-4 text-right whitespace-nowrap">
                    <Link href={`/admin/industries/${ind.id}/edit`} className="text-sm font-medium text-azure hover:text-ocean transition-colors mr-4">Edit</Link>
                    <DeleteButton action={remove.bind(null, ind.id)} />
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
