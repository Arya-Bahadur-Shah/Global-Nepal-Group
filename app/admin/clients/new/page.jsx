import { redirect } from 'next/navigation'
import { requireSession } from '@/lib/auth'
import { revalidateContent } from '@/lib/revalidate'
import { createClient } from '@/lib/admin-data'
import { Field, TextInput, Card, StickyActions } from '../../_components/fields'
import BlobFileInput from '../../_components/BlobFileInput'
import SubmitButton from '../../_components/SubmitButton'

export const metadata = { title: 'New client — Admin' }

export default async function NewClientPage({ searchParams }) {
  async function create(formData) {
    'use server'
    await requireSession()
    const name = formData.get('name')?.toString().trim()
    if (!name) redirect('/admin/clients/new?error=' + encodeURIComponent('Name is required.'))

    const logoUrl = formData.get('logo')?.toString().trim() || null

    const { ok, error } = await createClient({ name, logo: logoUrl })
    if (!ok) redirect('/admin/clients/new?error=' + encodeURIComponent(error))

    revalidateContent('clients', '/admin/clients')
    redirect('/admin/clients')
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-display font-bold text-ocean text-2xl">New client</h1>
      {searchParams?.error && <p className="mt-4 rounded-lg bg-rose px-3.5 py-2.5 text-sm text-crimsonDeep">{searchParams.error}</p>}

      <form action={create} className="mt-6 space-y-6 pb-2">
        <Card title="Client">
          <Field label="Name *" hint="e.g. NMB Bank"><TextInput name="name" required placeholder="e.g. NMB Bank" /></Field>
          <Field label="Logo" hint="Shown on industry pages — transparent PNG works best">
            <BlobFileInput name="logo" accept="image/*" kind="image" aspectHint="Transparent PNG, ~320×160 px" />
          </Field>
        </Card>

        <StickyActions>
          <SubmitButton>Create client</SubmitButton>
        </StickyActions>
      </form>
    </div>
  )
}
