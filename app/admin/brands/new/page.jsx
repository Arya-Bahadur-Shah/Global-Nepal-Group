import { redirect } from 'next/navigation'
import { requireSession } from '@/lib/auth'
import { revalidateContent } from '@/lib/revalidate'
import { createBrand, slugify } from '@/lib/admin-data'
import { saveUpload } from '@/lib/upload'
import { Field, TextInput, TextArea, FileInput, Card, StickyActions } from '../../_components/fields'
import SubmitButton from '../../_components/SubmitButton'

export const metadata = { title: 'New brand — Admin' }

export default async function NewBrandPage({ searchParams }) {
  async function create(formData) {
    'use server'
    await requireSession()
    const name = formData.get('name')?.toString().trim()
    const slug = slugify(name)

    const logo = await saveUpload(formData.get('logo'), 'brands', 'image')
    const heroImage = await saveUpload(formData.get('heroImage'), 'brands', 'image')
    const heroVideo = await saveUpload(formData.get('heroVideo'), 'brands', 'video')
    const uploadError = logo.error || heroImage.error || heroVideo.error
    if (uploadError) redirect(`/admin/brands/new?error=${encodeURIComponent(uploadError)}`)

    const { ok, error } = await createBrand({
      slug, name,
      focus: formData.get('focus')?.toString() || null,
      blurb: formData.get('blurb')?.toString() || null,
      logo: logo.path,
      heroImage: heroImage.path,
      heroVideo: heroVideo.path,
    })
    if (!ok) redirect(`/admin/brands/new?error=${encodeURIComponent(error)}`)

    revalidateContent('brands', '/admin/brands')
    redirect('/admin/brands')
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-display font-bold text-ocean text-2xl">New brand</h1>
      {searchParams?.error && <p className="mt-4 rounded-lg bg-rose px-3.5 py-2.5 text-sm text-crimsonDeep">{searchParams.error}</p>}

      <form action={create} className="mt-6 space-y-6 pb-2">
        <Card title="Basic info">
          <Field label="Name *" hint="e.g. Zebra Technologies"><TextInput name="name" required placeholder="e.g. Zebra" /></Field>
          <Field label="Focus" hint="Short one-line description, e.g. 'Barcode printers, scanners & RFID'"><TextInput name="focus" /></Field>
          <Field label="Blurb"><TextArea name="blurb" rows={4} /></Field>
        </Card>

        <Card title="Media" description="Logo shown in listings, hero image/video shown on the brand's page.">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Logo image">
              <FileInput name="logo" accept="image/*" locationHint="Displayed on brand card listing & brand page header" aspectHint="4:3 / 1:1 transparent PNG (400×300 px)" />
            </Field>
            <Field label="Hero image">
              <FileInput name="heroImage" accept="image/*" locationHint="Background photo on brand detail hero (/hardware/[brand])" aspectHint="16:9 ratio (1920×1080 px)" />
            </Field>
          </div>
          <div className="mt-3">
            <Field label="Hero video (optional)">
              <FileInput name="heroVideo" accept="video/*" locationHint="Background video loop on brand detail hero header" aspectHint="MP4 video (1080p, max 15-20 MB)" />
            </Field>
          </div>
        </Card>

        <StickyActions>
          <SubmitButton>Create brand</SubmitButton>
        </StickyActions>
      </form>
    </div>
  )
}
