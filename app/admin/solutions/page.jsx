import Link from 'next/link'
import { requireSession } from '@/lib/auth'
import { revalidateContent } from '@/lib/revalidate'
import { listSolutions, deleteSolution } from '@/lib/admin-data'
import DeleteButton from '../_components/DeleteButton'

export const metadata = { title: 'Solutions — Admin' }

export default async function AdminSolutionsPage() {
  const solutions = await listSolutions()

  async function remove(id) {
    'use server'
    await requireSession()
    await deleteSolution(id)
    revalidateContent('solutions', '/admin/solutions')
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-ocean text-2xl">Solutions</h1>
        <Link href="/admin/solutions/new" className="rounded-lg bg-ocean px-4 py-2.5 text-sm font-semibold text-white hover:bg-crimson transition-colors">+ New solution</Link>
      </div>

      <div className="mt-6 rounded-xl border border-cloud bg-white overflow-hidden">
        {solutions.length === 0 ? (
          <p className="p-6 text-sm text-steel">No solutions yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cloud text-left font-mono text-[11px] tracking-widest uppercase text-steel">
                <th className="p-4">Name</th>
                <th className="p-4">Tag</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {solutions.map((s) => (
                <tr key={s.id} className="border-b border-cloud last:border-0">
                  <td className="p-4 font-medium text-ocean">{s.name}</td>
                  <td className="p-4 text-steel">{s.tag}</td>
                  <td className="p-4 text-right whitespace-nowrap">
                    <Link href={`/admin/solutions/${s.id}/edit`} className="text-sm font-medium text-azure hover:text-ocean transition-colors mr-4">Edit</Link>
                    <DeleteButton action={remove.bind(null, s.id)} />
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
