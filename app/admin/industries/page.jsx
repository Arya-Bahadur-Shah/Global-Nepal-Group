import Link from 'next/link'
import { requireSession } from '@/lib/auth'
import { revalidateContent } from '@/lib/revalidate'
import { listIndustries, deleteIndustry } from '@/lib/admin-data'
import DeleteButton from '../_components/DeleteButton'
import DraggableTable from '../_components/DraggableTable'

export const metadata = { title: 'Industries — Admin' }

export default async function AdminIndustriesPage() {
  const industries = await listIndustries()

  async function remove(id) {
    'use server'
    await requireSession()
    await deleteIndustry(id)
    revalidateContent('industries', '/admin/industries')
  }

  const rows = industries.map((ind) => ({
    id: ind.id,
    cells: [
      <span key="name" className="font-medium text-ocean">{ind.name}</span>,
      <span key="tag" className="text-steel">{ind.tag}</span>,
      <span key="clients" className="text-steel">{ind.clients?.length || 0}</span>,
    ],
    actions: (
      <>
        <Link href={`/admin/industries/${ind.id}/edit`} className="text-sm font-medium text-azure hover:text-ocean transition-colors mr-4">
          Edit
        </Link>
        <DeleteButton action={remove.bind(null, ind.id)} />
      </>
    ),
  }))

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-display font-bold text-ocean text-2xl">Industries</h1>
        <Link href="/admin/industries/new" className="rounded-lg bg-ocean px-4 py-2.5 text-sm font-semibold text-white hover:bg-crimson transition-colors">
          + New industry
        </Link>
      </div>

      <DraggableTable
        table="industries"
        initialRows={rows}
        headers={['Name', 'Tag', 'Clients']}
      />
    </div>
  )
}
