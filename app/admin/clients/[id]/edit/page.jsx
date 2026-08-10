import { redirect, notFound } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getClientById, updateClient, deleteClient } from '@/lib/admin-data'
import { saveUpload } from '@/lib/upload'
import { Field, TextInput, FileInput, Card, StickyActions } from '../../../_components/fields'
import SubmitButton from '../../../_components/SubmitButton'
import DeleteButton from '../../../_components/DeleteButton'

export const metadata = { title: 'Edit client — Admin' }

export default function EditClientPage({ params, searchParams }) {
  const id = Number(params.id)
  const client = getClientById(id)
  if (!client) notFound()

  async function update(formData) {
    'use server'
    const existing = getClientById(id)
    if (!existing) notFound()

    const name = formData.get('name')?.toString().trim()
    if (!name) redirect(`/admin/clients/${id}/edit?error=` + encodeURIComponent('Name is required.'))

    const logo = await saveUpload(formData.get('logo'), 'clients', 'image')
    if (logo.error) redirect(`/admin/clients/${id}/edit?error=` + encodeURIComponent(logo.error))

    const { ok, error } = updateClient(id, { name, logo: logo.path || existing.logo })
    if (!ok) redirect(`/admin/clients/${id}/edit?error=` + encodeURIComponent(error))

    revalidatePath('/admin/clients')
    revalidatePath('/industries')
    revalidatePath('/') // homepage client-logo marquee (TrustMarquee)
    redirect('/admin/clients')
  }

  async function remove() {
    'use server'
    deleteClient(id)
    revalidatePath('/admin/clients')
    revalidatePath('/industries')
    revalidatePath('/') // homepage client-logo marquee (TrustMarquee)
    redirect('/admin/clients')
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-ocean text-2xl">Edit client</h1>
        <DeleteButton action={remove} />
      </div>
      {searchParams?.error && <p className="mt-4 rounded-lg bg-rose px-3.5 py-2.5 text-sm text-crimsonDeep">{searchParams.error}</p>}

      <form action={update} className="mt-6 space-y-6 pb-2">
        <Card title="Client">
          <Field label="Name *"><TextInput name="name" defaultValue={client.name} required /></Field>
          <Field label="Logo" hint="Leave blank to keep the current logo">
            <FileInput name="logo" accept="image/*" current={client.logo} currentLabel="Current logo" aspectHint="Transparent PNG, ~320×160 px" />
          </Field>
        </Card>

        <StickyActions>
          <SubmitButton>Save changes</SubmitButton>
        </StickyActions>
      </form>
    </div>
  )
}
