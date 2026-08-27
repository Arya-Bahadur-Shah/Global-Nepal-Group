import { redirect, notFound } from 'next/navigation'
import { requireSession } from '@/lib/auth'
import { revalidateContent } from '@/lib/revalidate'
import { getBrandById, updateBrand, deleteBrand, slugify } from '@/lib/admin-data'
import { Field, TextInput, TextArea, Card, StickyActions } from '../../../_components/fields'
import BlobFileInput from '../../../_components/BlobFileInput'
import SubmitButton from '../../../_components/SubmitButton'
import DeleteButton from '../../../_components/DeleteButton'

export const metadata = { title: 'Edit brand — Admin' }

export default async function EditBrandPage({ params, searchParams }) {
  const brand = await getBrandById(Number(params.id))
  if (!brand) notFound()

  async function update(formData) {
    'use server'
    await requireSession()
    const id = Number(params.id)
    const existing = await getBrandById(id)
    if (!existing) notFound()

    const name = formData.get('name')?.toString().trim()
    const slug = existing.slug || slugify(name)

    const newLogoUrl      = formData.get('logo')?.toString().trim() || null
    const newHeroImageUrl = formData.get('heroImage')?.toString().trim() || null
    const newHeroVideoUrl = formData.get('heroVideo')?.toString().trim() || null

    const { ok, error } = await updateBrand(id, {
      slug, name,
      focus: formData.get('focus')?.toString() || null,
      blurb: formData.get('blurb')?.toString() || null,
      logo: formData.get('remove_logo') ? null : (newLogoUrl || existing.logo),
      heroImage: formData.get('remove_heroImage') ? null : (newHeroImageUrl || existing.heroImage),
      heroVideo: formData.get('remove_heroVideo') ? null : (newHeroVideoUrl || existing.heroVideo),
    })
    if (!ok) redirect(`/admin/brands/${id}/edit?error=${encodeURIComponent(error)}`)

    revalidateContent('brands', '/admin/brands')
    redirect('/admin/brands')
  }

  async function remove() {
    'use server'
    await requireSession()
    await deleteBrand(Number(params.id))
    revalidateContent('brands', '/admin/brands')
    redirect('/admin/brands')
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-ocean text-2xl">Edit brand</h1>
        <DeleteButton action={remove} />
      </div>
      {searchParams?.error && <p className="mt-4 rounded-lg bg-rose px-3.5 py-2.5 text-sm text-crimsonDeep">{searchParams.error}</p>}

      <form action={update} className="mt-6 space-y-6 pb-2">
        <Card title="Basic info">
          <Field label="Name *"><TextInput name="name" defaultValue={brand.name} required /></Field>
          <Field label="Focus"><TextInput name="focus" defaultValue={brand.focus} /></Field>
          <Field label="Blurb"><TextArea name="blurb" rows={4} defaultValue={brand.blurb} /></Field>
        </Card>

        <Card title="Media" description="Logo shown in listings, hero image/video shown on the brand's page.">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Logo image">
              <BlobFileInput name="logo" accept="image/*" kind="image" current={brand.logo} locationHint="Displayed on brand card listing & brand page header" aspectHint="4:3 / 1:1 transparent PNG (400×300 px)" />
            </Field>
            <Field label="Hero image">
              <BlobFileInput name="heroImage" accept="image/*" kind="image" current={brand.heroImage} locationHint="Background photo on brand detail hero (/hardware/[brand])" aspectHint="16:9 ratio (1920×1080 px)" />
            </Field>
          </div>
          <div className="mt-3">
            <Field label="Hero video (optional)">
              <BlobFileInput name="heroVideo" accept="video/*" kind="video" current={brand.heroVideo} locationHint="Background video loop on brand detail hero header" aspectHint="MP4 video (1080p)" />
            </Field>
          </div>
        </Card>

        <StickyActions>
          <SubmitButton>Save changes</SubmitButton>
        </StickyActions>
      </form>
    </div>
  )
}
