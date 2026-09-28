import Link from 'next/link'
import { requireSession } from '@/lib/auth'
import { revalidateContent } from '@/lib/revalidate'
import { listIndustrialSolutions, deleteIndustrialSolution, getProductsByIndustrialSolution } from '@/lib/admin-data'
import DeleteButton from '../_components/DeleteButton'
import DraggableTable from '../_components/DraggableTable'

export const metadata = { title: 'Industrial Solutions — Admin' }

export default async function AdminIndustrialSolutionsPage() {
  const solutions = await listIndustrialSolutions()
  const productCounts = Object.fromEntries(
    await Promise.all(
      solutions.map(async (s) => [s.slug, (await getProductsByIndustrialSolution(s.slug)).length])
    )
  )

  async function remove(id) {
    'use server'
    await requireSession()
    await deleteIndustrialSolution(id)
    revalidateContent('industrial-solutions', '/admin/industrial-solutions')
  }

  const rows = solutions.map((s) => {
    const count = productCounts[s.slug] || 0
    return {
      id: s.id,
      cells: [
        <span className="font-medium text-ocean">{s.name}</span>,
        <span className="text-steel">{s.tag}</span>,
        <span className="inline-flex items-center font-mono text-xs font-bold text-ocean bg-mist border border-cloud px-2.5 py-1 rounded-md">
          {count} {count === 1 ? 'product' : 'products'}
        </span>,
      ],
      actions: (
        <>
          <Link href={`/admin/products/new?solution=${s.slug}`} className="text-sm font-semibold text-crimson hover:text-ocean transition-colors mr-4">
            + Add product
          </Link>
          <Link href={`/admin/industrial-solutions/${s.id}/edit`} className="text-sm font-medium text-azure hover:text-ocean transition-colors mr-4">
            Edit
          </Link>
          <DeleteButton action={remove.bind(null, s.id)} />
        </>
      ),
    }
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-display font-bold text-ocean text-2xl">Industrial Solutions</h1>
        <Link href="/admin/industrial-solutions/new" className="rounded-lg bg-ocean px-4 py-2.5 text-sm font-semibold text-white hover:bg-crimson transition-colors">
          + New industrial solution
        </Link>
      </div>

      <DraggableTable
        table="industrial-solutions"
        initialRows={rows}
        headers={['Name', 'Tag', 'Products']}
      />
    </div>
  )
}
