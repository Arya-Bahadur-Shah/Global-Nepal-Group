import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'
import { createAdmin } from '@/lib/admin-data'
import { Field, TextInput } from '../../_components/fields'
import SubmitButton from '../../_components/SubmitButton'

export const metadata = { title: 'New admin — Admin' }

export default async function NewAdminPage({ searchParams }) {
  async function create(formData) {
    'use server'
    const email = formData.get('email')?.toString().trim().toLowerCase()
    const password = formData.get('password')?.toString() || ''
    const confirm = formData.get('confirm')?.toString() || ''

    if (!email) redirect(`/admin/settings/new?error=${encodeURIComponent('Email is required.')}`)
    if (password.length < 8) redirect(`/admin/settings/new?error=${encodeURIComponent('Password must be at least 8 characters.')}`)
    if (password !== confirm) redirect(`/admin/settings/new?error=${encodeURIComponent('Passwords do not match.')}`)

    const hash = await bcrypt.hash(password, 10)
    const { ok, error } = await createAdmin(email, hash)
    if (!ok) {
      const message = String(error || '').includes('UNIQUE') ? 'That email is already an admin.' : error
      redirect(`/admin/settings/new?error=${encodeURIComponent(message)}`)
    }

    revalidatePath('/admin/settings')
    redirect('/admin/settings')
  }

  return (
    <div className="max-w-md">
      <h1 className="font-display font-bold text-ocean text-2xl">New admin</h1>
      <p className="mt-1 text-sm text-steel">They&rsquo;ll be able to sign in immediately with the password you set below.</p>
      {searchParams?.error && <p className="mt-4 rounded-lg bg-rose px-3.5 py-2.5 text-sm text-crimsonDeep">{searchParams.error}</p>}

      <form action={create} className="mt-6 space-y-5">
        <Field label="Email *"><TextInput name="email" type="email" required autoComplete="off" /></Field>
        <Field label="Password *" hint="At least 8 characters"><TextInput name="password" type="password" required autoComplete="new-password" /></Field>
        <Field label="Confirm password *"><TextInput name="confirm" type="password" required autoComplete="new-password" /></Field>
        <SubmitButton>Create admin</SubmitButton>
      </form>
    </div>
  )
}
