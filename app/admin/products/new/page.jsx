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
  const productType = searchParams?.type === 'solution' ? 'solution' : 'hardware'

  async function create(formData) {
    'use server'
    await requireSession()
    const name = formData.get('name')?.toString().trim()
    const slug = slugify(name)
    const rawBrandSlug = formData.get('brandSlug')?.toString()?.trim()
    const brandSlug = rawBrandSlug || 'industrial'
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
    if (!ok) redirect(`/admin/products/new?type=${productType}&error=${encodeURIComponent(error)}`)

    revalidateContent('products', '/admin/products')
    redirect('/admin/products')
  }

  const isSolutionProduct = productType === 'solution'

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-ocean text-2xl">
            {isSolutionProduct ? 'New Industrial Solution Product' : 'New Hardware Product'}
          </h1>
          <p className="text-sm text-steel mt-0.5">
            {isSolutionProduct
              ? 'Add equipment directly assigned to an Industrial Solution (No Brand required).'
              : 'Add brand-specific equipment hardware.'}
          </p>
        </div>
      </div>

      {searchParams?.error && <p className="mt-4 rounded-lg bg-rose px-3.5 py-2.5 text-sm text-crimsonDeep">{searchParams.error}</p>}

      {/* Product Mode Selector Tabs */}
      <div className="mt-5 flex rounded-xl border border-cloud bg-mist p-1 gap-1">
        <a
          href="/admin/products/new?type=hardware"
          className={`flex-1 text-center py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
            !isSolutionProduct ? 'bg-white text-ocean shadow-sm' : 'text-steel hover:text-ocean'
          }`}
        >
          Hardware Product (Requires Brand)
        </a>
        <a
          href="/admin/products/new?type=solution"
          className={`flex-1 text-center py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
            isSolutionProduct ? 'bg-crimson text-white shadow-sm' : 'text-steel hover:text-ocean'
          }`}
        >
          Industrial Solution Product (No Brand Required)
        </a>
      </div>

      <form action={create} className="mt-6 space-y-6 pb-2">
        <Card title="Basic info">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field
              label={isSolutionProduct ? 'Industrial Solution *' : 'Industrial Solution (optional)'}
              hint={isSolutionProduct ? 'Select target solution category' : 'Optional categorization'}
            >
              <Select
                name="industrialSolutionSlug"
                required={isSolutionProduct}
                defaultValue={searchParams?.solution || ''}
              >
                <option value="" disabled={isSolutionProduct}>
                  {isSolutionProduct ? 'Choose an Industrial Solution' : 'None (Standalone / Brand product)'}
                </option>
                {industrialSolutions.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
              </Select>
            </Field>

            <Field
              label={isSolutionProduct ? 'Company / Brand (optional)' : 'Company / Brand *'}
              hint={isSolutionProduct ? 'Leave blank for non-brand solution product' : 'Select manufacturer brand'}
            >
              <Select name="brandSlug" required={!isSolutionProduct} defaultValue={searchParams?.brand || ''}>
                <option value="">
                  {isSolutionProduct ? 'None (Industrial Solution Product)' : 'Choose a brand'}
                </option>
                {brands.map((b) => <option key={b.slug} value={b.slug}>{b.name}</option>)}
              </Select>
            </Field>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <Field label="Model" hint="e.g. Wrap-Around Labeller"><TextInput name="model" placeholder="e.g. Wrap-Around Labeller" /></Field>
            <Field label="Name *" hint="e.g. Wrap around labelling machine"><TextInput name="name" required placeholder="e.g. Wrap around labelling machine" /></Field>
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
