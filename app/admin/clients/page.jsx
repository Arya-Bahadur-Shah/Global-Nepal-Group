import Link from 'next/link'
import { requireSession } from '@/lib/auth'
import { revalidateContent } from '@/lib/revalidate'
import { listClients, deleteClient } from '@/lib/admin-data'
import DeleteButton from '../_components/DeleteButton'

export const metadata = { title: 'Clients — Admin' }

export default async function AdminClientsPage() {
  const clients = await listClients()

  async function remove(id) {
    'use server'
    await requireSession()
    await deleteClient(id)
    revalidateContent('clients', '/admin/clients')
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-ocean text-2xl">Clients</h1>
          <p className="mt-1 text-sm text-steel">Company logos shown on industry pages. Add a client once here, then attach it to any industry.</p>
        </div>
        <Link href="/admin/clients/new" className="rounded-lg bg-ocean px-4 py-2.5 text-sm font-semibold text-white hover:bg-crimson transition-colors whitespace-nowrap">+ New client</Link>
      </div>

      <div className="mt-6 rounded-xl border border-cloud bg-white overflow-hidden">
        {clients.length === 0 ? (
          <p className="p-6 text-sm text-steel">No clients yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cloud text-left font-mono text-[11px] tracking-widest uppercase text-steel">
                <th className="p-4">Logo</th>
                <th className="p-4">Name</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id} className="border-b border-cloud last:border-0">
                  <td className="p-4">
                    <span className="grid h-12 w-16 place-items-center overflow-hidden rounded-lg border border-cloud bg-white">
                      {c.logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.logo} alt={c.name || ''} className="h-full w-full object-contain p-1" />
                      ) : (
                        <span className="font-display text-sm font-bold text-steel">{(c.name || '?').charAt(0)}</span>
                      )}
                    </span>
                  </td>
                  <td className="p-4 font-medium text-ocean">{c.name}</td>
                  <td className="p-4 text-right whitespace-nowrap">
                    <Link href={`/admin/clients/${c.id}/edit`} className="text-sm font-medium text-azure hover:text-ocean transition-colors mr-4">Edit</Link>
                    <DeleteButton action={remove.bind(null, c.id)} />
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
