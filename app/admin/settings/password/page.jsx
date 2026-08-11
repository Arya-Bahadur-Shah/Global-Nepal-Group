import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { getSession, verifyCredentials } from '@/lib/auth'
import { updateAdminPassword } from '@/lib/admin-data'
import { Field, TextInput } from '../../_components/fields'
import SubmitButton from '../../_components/SubmitButton'

export const metadata = { title: 'Change password — Admin' }

export default async function ChangePasswordPage({ searchParams }) {
  const session = await getSession()

  async function change(formData) {
    'use server'
    const session = await getSession()
    const current = formData.get('current')?.toString() || ''
    const next = formData.get('next')?.toString() || ''
    const confirm = formData.get('confirm')?.toString() || ''

    const validCurrent = await verifyCredentials(session.email, current)
    if (!validCurrent) redirect(`/admin/settings/password?error=${encodeURIComponent('Current password is incorrect.')}`)
    if (next.length < 8) redirect(`/admin/settings/password?error=${encodeURIComponent('New password must be at least 8 characters.')}`)
    if (next !== confirm) redirect(`/admin/settings/password?error=${encodeURIComponent('New passwords do not match.')}`)

    const hash = await bcrypt.hash(next, 10)
    await updateAdminPassword(session.email, hash)
    redirect('/admin/settings?success=1')
  }

  return (
    <div className="max-w-md">
      <h1 className="font-display font-bold text-ocean text-2xl">Change your password</h1>
      <p className="mt-1 text-sm text-steel">Signed in as {session?.email}.</p>
      {searchParams?.error && <p className="mt-4 rounded-lg bg-rose px-3.5 py-2.5 text-sm text-crimsonDeep">{searchParams.error}</p>}

      <form action={change} className="mt-6 space-y-5">
        <Field label="Current password *"><TextInput name="current" type="password" required autoComplete="current-password" /></Field>
        <Field label="New password *" hint="At least 8 characters"><TextInput name="next" type="password" required autoComplete="new-password" /></Field>
        <Field label="Confirm new password *"><TextInput name="confirm" type="password" required autoComplete="new-password" /></Field>
        <SubmitButton>Update password</SubmitButton>
      </form>
    </div>
  )
}
