import Link from 'next/link'
import { revalidateAdmin } from '@/lib/revalidate'
import { redirect } from 'next/navigation'
import { requireSession, getSession } from '@/lib/auth'
import { listAdmins, deleteAdmin } from '@/lib/admin-data'
import DeleteButton from '../_components/DeleteButton'

export const metadata = { title: 'Admin users — Admin' }

export default async function AdminSettingsPage({ searchParams }) {
  const session = await getSession()
  const admins = await listAdmins()

  async function remove(id) {
    'use server'
    const current = await requireSession()
    const all = await listAdmins()
    if (all.length <= 1) {
      redirect('/admin/settings?error=' + encodeURIComponent('At least one admin account must remain.'))
    }
    const target = all.find((a) => a.id === id)
    if (target && current?.email === target.email) {
      redirect('/admin/settings?error=' + encodeURIComponent('You can’t delete the account you’re signed in as.'))
    }
    await deleteAdmin(id)
    revalidateAdmin('/admin/settings')
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-ocean text-2xl">Admin users</h1>
          <p className="mt-1 text-sm text-steel">Everyone listed here can sign in and manage content.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/settings/password" className="admin-btn-press rounded-xl border border-cloud bg-white px-4 py-2.5 text-sm font-semibold text-ocean transition-colors hover:bg-mist">
            Change my password
          </Link>
          <Link href="/admin/settings/new" className="admin-btn-press rounded-xl bg-gradient-to-r from-ocean to-marine px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-ocean/20 transition-all hover:from-crimson hover:to-crimsonBright">
            + New admin
          </Link>
        </div>
      </div>

      {searchParams?.error && (
        <p className="mt-4 rounded-lg bg-rose px-3.5 py-2.5 text-sm text-crimsonDeep">{searchParams.error}</p>
      )}
      {searchParams?.success && (
        <p className="mt-4 rounded-lg bg-mist px-3.5 py-2.5 text-sm text-ocean">Password updated.</p>
      )}

      <div className="admin-fade-in mt-6 rounded-2xl border border-cloud bg-white overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-cloud text-left font-mono text-[11px] tracking-widest uppercase text-steel">
              <th className="p-4">Email</th>
              <th className="p-4">Created</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {admins.map((a) => (
              <tr key={a.id} className="border-b border-cloud last:border-0 transition-colors hover:bg-mist/60">
                <td className="p-4 font-medium text-ocean">
                  {a.email}
                  {session?.email === a.email && (
                    <span className="ml-2 inline-flex rounded-full bg-mist px-2 py-0.5 text-[11px] font-semibold text-steel">You</span>
                  )}
                </td>
                <td className="p-4 text-steel whitespace-nowrap">{new Date(a.created_at).toLocaleDateString()}</td>
                <td className="p-4 text-right">
                  <DeleteButton
                    label="Remove"
                    confirmTitle={`Remove ${a.email}?`}
                    confirmText="They will no longer be able to sign in to this admin panel."
                    confirmLabel="Yes, remove"
                    action={remove.bind(null, a.id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
