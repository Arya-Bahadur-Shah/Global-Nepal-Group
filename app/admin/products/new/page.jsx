import { redirect } from 'next/navigation'
import { requireSession } from '@/lib/auth'
import { revalidateContent } from '@/lib/revalidate'
import { createProduct, slugify, parseSpecPairs, listBrands } from '@/lib/admin-data'
import { saveUpload, saveUploads } from '@/lib/upload'
import { Field, TextInput, TextArea, Select, FileInput, Card, StickyActions } from '../../_components/fields'
import SubmitButton from '../../_components/SubmitButton'
import SpecsEditor from '../../_components/SpecsEditor'

export const metadata = { title: 'New product — Admin' }

export default async function NewProductPage({ searchParams }) {
  const brands = await listBrands()

  async function create(formData) {
    'use server'
    await requireSession()
    try {
      const name = formData.get('name')?.toString().trim()
      const slug = slugify(name)
      const brandSlug = formData.get('brandSlug')?.toString()

      if (!brandSlug) redirect('/admin/products/new?error=' + encodeURIComponent('Please choose a brand.'))
      if (!name) redirect('/admin/products/new?error=' + encodeURIComponent('Please enter a product name.'))

      const image = await saveUpload(formData.get('image'), 'products', 'image')
      const { paths: gallery, errors: galleryErrors } = await saveUploads(formData.getAll('gallery'), 'products', 'image')
      const specSheetFile = await saveUpload(formData.get('specSheetFile'), 'products', 'doc')
      const errs = [image.error, ...galleryErrors, specSheetFile.error].filter(Boolean)
      if (errs.length) redirect(`/admin/products/new?error=${encodeURIComponent(errs.join(' '))}`)

      const specSheetUrl = formData.get('specSheetUrl')?.toString().trim()

      const { ok, error } = await createProduct({
        brandSlug, slug, name,
        model: formData.get('model')?.toString() || null,
        shortDescription: formData.get('shortDescription')?.toString() || null,
        description: formData.get('description')?.toString() || null,
        image: image.path,
        gallery,
        specs: parseSpecPairs(formData.getAll('specKey'), formData.getAll('specValue')),
        specSheet: specSheetFile.path || specSheetUrl || null,
        specSheetVariants: null,
      })
      if (!ok) redirect(`/admin/products/new?error=${encodeURIComponent(error)}`)

      revalidateContent('products', '/admin/products')
    } catch (err) {
      if (err?.digest?.startsWith('NEXT_REDIRECT')) throw err
      redirect(`/admin/products/new?error=${encodeURIComponent(err?.message || 'Failed to create product.')}`)
    }
    redirect('/admin/products')
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-display font-bold text-ocean text-2xl">New product</h1>
      {searchParams?.error && <p className="mt-4 rounded-lg bg-rose px-3.5 py-2.5 text-sm text-crimsonDeep">{searchParams.error}</p>}

      <form action={create} className="mt-6 space-y-6 pb-2">
        <Card title="Basic info">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Brand *">
              <Select name="brandSlug" required defaultValue="">
                <option value="" disabled>Choose a brand</option>
                {brands.map((b) => <option key={b.slug} value={b.slug}>{b.name}</option>)}
              </Select>
            </Field>
            <Field label="Model" hint="e.g. Zebra ZT411"><TextInput name="model" /></Field>
          </div>
          <Field label="Name *" hint="e.g. Industrial Printer"><TextInput name="name" required placeholder="e.g. Zebra ZT411 Industrial Printer" /></Field>
        </Card>

        <Card title="Details">
          <Field label="Short description"><TextArea name="shortDescription" rows={2} /></Field>
          <Field label="Full description"><TextArea name="description" rows={5} /></Field>
          <Field label="Specs" hint="Add a row per spec — a property name and its value.">
            <SpecsEditor />
          </Field>
        </Card>

        <Card title="Media" description="Product photography, gallery thumbnails, and specification documents.">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Product image">
              <FileInput name="image" accept="image/*" locationHint="Main photo on /hardware grid & product detail" aspectHint="1:1 square (800×800 px)" />
            </Field>
            <Field label="Gallery images">
              <FileInput name="gallery" accept="image/*" multiple locationHint="Thumbnail slideshow gallery on product detail page" aspectHint="800×800 or 1200×800 px" />
            </Field>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 mt-3">
            <Field label="Spec sheet / brochure (PDF upload)">
              <FileInput name="specSheetFile" accept="application/pdf" locationHint="PDF Datasheet download button" aspectHint="Max 10 MB PDF" />
            </Field>
            <Field label="…or spec sheet URL" hint="Used if no file is uploaded"><TextInput name="specSheetUrl" placeholder="https://…" /></Field>
          </div>
        </Card>

        <StickyActions>
          <SubmitButton>Create product</SubmitButton>
        </StickyActions>
      </form>
    </div>
  )
}
