import { redirect } from 'next/navigation'
import { verifyCredentials, setSessionCookie, getSession } from '@/lib/auth'
import SubmitButton from '../_components/SubmitButton'

export const metadata = { title: 'Admin Login — Global Nepal Group', robots: { index: false, follow: false } }

export default async function AdminLoginPage({ searchParams }) {
  const existing = await getSession()
  if (existing) redirect(searchParams?.next || '/admin')

  const nextPath = searchParams?.next || '/admin'

  async function login(formData) {
    'use server'
    const email = formData.get('email')
    const password = formData.get('password')
    const next = formData.get('next') || '/admin'
    const ok = await verifyCredentials(email, password)
    if (!ok) {
      redirect(`/admin/login?error=1&next=${encodeURIComponent(next)}`)
    }
    await setSessionCookie(email)
    redirect(next)
  }

  return (
    <div className="min-h-screen grid place-items-center px-5">
      <div className="w-full max-w-sm rounded-2xl border border-cloud bg-white p-8 shadow-sm">
        <h1 className="font-display font-bold text-ocean text-xl">GNG Admin</h1>
        <p className="mt-1 text-sm text-steel">Sign in to manage content and leads.</p>

        {searchParams?.error && (
          <p className="mt-4 rounded-lg bg-rose px-3.5 py-2.5 text-sm text-crimsonDeep">Invalid email or password.</p>
        )}

        <form action={login} className="mt-6 space-y-4">
          <input type="hidden" name="next" value={nextPath} />
          <label className="block">
            <span className="font-mono text-[11px] tracking-widest uppercase text-steel">Email</span>
            <input name="email" type="email" required autoComplete="username" className="mt-1.5 w-full rounded-lg border border-cloud bg-white px-3.5 py-2.5 text-[15px]" />
          </label>
          <label className="block">
            <span className="font-mono text-[11px] tracking-widest uppercase text-steel">Password</span>
            <input name="password" type="password" required autoComplete="current-password" className="mt-1.5 w-full rounded-lg border border-cloud bg-white px-3.5 py-2.5 text-[15px]" />
          </label>
          <SubmitButton>Sign in</SubmitButton>
        </form>
      </div>
    </div>
  )
}
