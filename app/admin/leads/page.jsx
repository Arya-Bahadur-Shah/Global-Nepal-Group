import { revalidatePath } from 'next/cache'
import { listLeads, deleteLead } from '@/lib/admin-data'
import DeleteButton from '../_components/DeleteButton'

export const metadata = { title: 'Leads — Admin' }

export default async function AdminLeadsPage() {
  const leads = await listLeads()

  async function remove(id) {
    'use server'
    await deleteLead(id)
    revalidatePath('/admin/leads')
  }

  return (
    <div>
      <h1 className="font-display font-bold text-ocean text-2xl">Leads</h1>
      <p className="mt-1 text-sm text-steel">Contact form submissions and demo requests, newest first.</p>

      <div className="mt-6 rounded-xl border border-cloud bg-white overflow-hidden overflow-x-auto">
        {leads.length === 0 ? (
          <p className="p-6 text-sm text-steel">No leads yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cloud text-left font-mono text-[11px] tracking-widest uppercase text-steel">
                <th className="p-4">Type</th>
                <th className="p-4">Name</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Message</th>
                <th className="p-4">Received</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id} className="border-b border-cloud last:border-0 align-top">
                  <td className="p-4 whitespace-nowrap">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${l.type === 'demo' ? 'bg-rose text-crimsonDeep' : 'bg-mist text-steel'}`}>
                      {l.type === 'demo' ? 'Demo' : 'Contact'}
                    </span>
                  </td>
                  <td className="p-4 font-medium text-ocean whitespace-nowrap">{l.name}</td>
                  <td className="p-4 text-steel">
                    <div>{l.email}</div>
                    {l.phone && <div className="text-xs">{l.phone}</div>}
                  </td>
                  <td className="p-4 text-steel max-w-xs">{l.msg}</td>
                  <td className="p-4 text-steel whitespace-nowrap">{new Date(l.at).toLocaleString()}</td>
                  <td className="p-4 text-right whitespace-nowrap"><DeleteButton action={remove.bind(null, l.id)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
