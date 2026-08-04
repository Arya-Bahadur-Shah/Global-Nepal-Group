import { redirect } from 'next/navigation'
import { getSession, clearSessionCookie } from '@/lib/auth'
import AdminNav from './_components/AdminNav'

export const metadata = { title: 'Admin — Global Nepal Group', robots: { index: false, follow: false } }

export default async function AdminLayout({ children }) {
  const session = await getSession()

  // Unauthenticated (i.e. /admin/login — middleware already gates every
  // other /admin/* route) gets a bare canvas, no sidebar.
  if (!session) {
    return <div className="min-h-screen bg-paper">{children}</div>
  }

  async function logout() {
    'use server'
    await clearSessionCookie()
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen bg-paper flex">
      <AdminNav email={session.email} logout={logout} />
      <main className="flex-1 min-w-0 p-6 sm:p-10">{children}</main>
    </div>
  )
}
