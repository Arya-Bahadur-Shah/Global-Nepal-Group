import Link from 'next/link'
import { requireSession } from '@/lib/auth'
import { revalidateContent } from '@/lib/revalidate'
import { listSolutions, deleteSolution } from '@/lib/admin-data'
import DeleteButton from '../_components/DeleteButton'
import DraggableTable from '../_components/DraggableTable'

export const metadata = { title: 'Solutions — Admin' }

export default async function AdminSolutionsPage() {
  const solutions = await listSolutions()

  async function remove(id) {
    'use server'
    await requireSession()
    await deleteSolution(id)
    revalidateContent('solutions', '/admin/solutions')
  }

  const rows = solutions.map((s) => ({
    id: s.id,
    cells: [
      <span className="font-medium text-ocean">{s.name}</span>,
      <span className="text-steel">{s.tag}</span>,
    ],
    actions: (
      <>
        <Link href={`/admin/solutions/${s.id}/edit`} className="text-sm font-medium text-azure hover:text-ocean transition-colors mr-4">
          Edit
        </Link>
        <DeleteButton action={remove.bind(null, s.id)} />
      </>
    ),
  }))

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-display font-bold text-ocean text-2xl">Solutions</h1>
        <Link href="/admin/solutions/new" className="rounded-lg bg-ocean px-4 py-2.5 text-sm font-semibold text-white hover:bg-crimson transition-colors">
          + New solution
        </Link>
      </div>

      <DraggableTable
        table="solutions"
        initialRows={rows}
        headers={['Name', 'Tag']}
      />
    </div>
  )
}
