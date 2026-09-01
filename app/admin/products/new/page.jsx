import { redirect } from 'next/navigation'
import { requireSession } from '@/lib/auth'
import { revalidateContent } from '@/lib/revalidate'
import { createProduct, slugify, parseSpecPairs, listBrands, listIndustrialSolutions } from '@/lib/admin-data'
import { Field, TextInput, TextArea, Select, Card, StickyActions } from '../../_components/fields'
import BlobFileInput from '../../_components/BlobFileInput'
import SubmitButton from '../../_components/SubmitButton'
import SpecsEditor from '../../_components/SpecsEditor'

export const metadata = { title: 'New product — Admin' }

export default async function NewProductPage({ searchParams }) {
  const brands = await listBrands()
  const industrialSolutions = await listIndustrialSolutions()

  async function create(formData) {
    'use server'
    await requireSession()
    const name = formData.get('name')?.toString().trim()
    const slug = slugify(name)
    const brandSlug = formData.get('brandSlug')?.toString()
    const industrialSolutionSlug = formData.get('industrialSolutionSlug')?.toString() || null

    // Files are uploaded client-side by BlobFileInput before submit.
    // The hidden inputs carry the already-uploaded Blob URL (or '').  
    const imageUrl      = formData.get('image')?.toString().trim() || null
    const galleryUrls   = formData.getAll('gallery').map(u => u?.toString().trim()).filter(Boolean)
    const specSheetBlobUrl = formData.get('specSheetFile')?.toString().trim() || null
    const specSheetUrl  = formData.get('specSheetUrl')?.toString().trim() || null

    const { ok, error } = await createProduct({
      brandSlug, industrialSolutionSlug, slug, name,
      model: formData.get('model')?.toString() || null,
      shortDescription: formData.get('shortDescription')?.toString() || null,
      description: formData.get('description')?.toString() || null,
      image: imageUrl,
      gallery: galleryUrls,
      specs: parseSpecPairs(formData.getAll('specKey'), formData.getAll('specValue')),
      specSheet: specSheetBlobUrl || specSheetUrl || null,
      specSheetVariants: null,
    })
    if (!ok) redirect(`/admin/products/new?error=${encodeURIComponent(error)}`)

    revalidateContent('products', '/admin/products')
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
            <Field label="Industrial Solution (optional)">
              <Select name="industrialSolutionSlug" defaultValue={searchParams?.solution || ''}>
                <option value="">None (Standalone / Brand product)</option>
                {industrialSolutions.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
              </Select>
            </Field>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <Field label="Model" hint="e.g. Zebra ZT411"><TextInput name="model" /></Field>
            <Field label="Name *" hint="e.g. Industrial Printer"><TextInput name="name" required placeholder="e.g. Zebra ZT411 Industrial Printer" /></Field>
          </div>
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
              <BlobFileInput name="image" accept="image/*" kind="image" locationHint="Main photo on /hardware grid & product detail" aspectHint="1:1 square (800×800 px)" />
            </Field>
            <Field label="Gallery images">
              <BlobFileInput name="gallery" accept="image/*" kind="image" multiple locationHint="Thumbnail slideshow gallery on product detail page" aspectHint="800×800 or 1200×800 px" />
            </Field>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 mt-3">
            <Field label="Spec sheet / brochure (PDF upload)">
              <BlobFileInput name="specSheetFile" accept="application/pdf" kind="doc" locationHint="PDF Datasheet download button" aspectHint="Max 50 MB PDF" />
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
