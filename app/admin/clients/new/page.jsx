import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/admin-data'
import { saveUpload } from '@/lib/upload'
import { Field, TextInput, FileInput, Card, StickyActions } from '../../_components/fields'
import SubmitButton from '../../_components/SubmitButton'

export const metadata = { title: 'New client — Admin' }

export default function NewClientPage({ searchParams }) {
  async function create(formData) {
    'use server'
    const name = formData.get('name')?.toString().trim()
    if (!name) redirect('/admin/clients/new?error=' + encodeURIComponent('Name is required.'))

    const logo = await saveUpload(formData.get('logo'), 'clients', 'image')
    if (logo.error) redirect('/admin/clients/new?error=' + encodeURIComponent(logo.error))

    const { ok, error } = createClient({ name, logo: logo.path })
    if (!ok) redirect('/admin/clients/new?error=' + encodeURIComponent(error))

    revalidatePath('/admin/clients')
    revalidatePath('/industries')
    revalidatePath('/') // homepage client-logo marquee (TrustMarquee)
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
            <FileInput name="logo" accept="image/*" aspectHint="Transparent PNG, ~320×160 px" />
          </Field>
        </Card>

        <StickyActions>
          <SubmitButton>Create client</SubmitButton>
        </StickyActions>
      </form>
    </div>
  )
}
