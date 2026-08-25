import { redirect, notFound } from 'next/navigation'
import { requireSession } from '@/lib/auth'
import { revalidateContent } from '@/lib/revalidate'
import {
  getProductById, updateProduct, deleteProduct, slugify,
  parseSpecPairs, listBrands,
} from '@/lib/admin-data'
import { saveUpload, saveUploads } from '@/lib/upload'
import { Field, TextInput, TextArea, Select, FileInput, Card, StickyActions } from '../../../_components/fields'
import SubmitButton from '../../../_components/SubmitButton'
import DeleteButton from '../../../_components/DeleteButton'
import SpecsEditor from '../../../_components/SpecsEditor'

export const metadata = { title: 'Edit product — Admin' }

export default async function EditProductPage({ params, searchParams }) {
  const id = Number(params.id)
  const product = await getProductById(id)
  if (!product) notFound()
  const brands = await listBrands()

  async function update(formData) {
    'use server'
    await requireSession()
    const existing = await getProductById(id)
    if (!existing) notFound()

    const name = formData.get('name')?.toString().trim()
    const slug = existing.slug || slugify(name)
    const brandSlug = formData.get('brandSlug')?.toString()

    const image = await saveUpload(formData.get('image'), 'products', 'image')
    const { paths: newGallery, errors: galleryErrors } = await saveUploads(formData.getAll('gallery'), 'products', 'image')
    const specSheetFile = await saveUpload(formData.get('specSheetFile'), 'products', 'doc')
    const errs = [image.error, ...galleryErrors, specSheetFile.error].filter(Boolean)
    if (errs.length) redirect(`/admin/products/${id}/edit?error=${encodeURIComponent(errs.join(' '))}`)

    const keptGallery = formData.getAll('keepGallery')
    const gallery = [...keptGallery, ...newGallery]
    const specSheetUrl = formData.get('specSheetUrl')?.toString().trim()

    const { ok, error } = await updateProduct(id, {
      brandSlug, slug, name,
      model: formData.get('model')?.toString() || null,
      shortDescription: formData.get('shortDescription')?.toString() || null,
      description: formData.get('description')?.toString() || null,
      image: formData.get('remove_image') ? null : (image.path || existing.image),
      gallery,
      specs: parseSpecPairs(formData.getAll('specKey'), formData.getAll('specValue')),
      specSheet: formData.get('remove_specSheetFile') ? null : (specSheetFile.path || specSheetUrl || existing.specSheet),
      specSheetVariants: existing.specSheetVariants,
    })
    if (!ok) redirect(`/admin/products/${id}/edit?error=${encodeURIComponent(error)}`)

    revalidateContent('products', '/admin/products')
    redirect('/admin/products')
  }

  async function remove() {
    'use server'
    await requireSession()
    await deleteProduct(id)
    revalidateContent('products', '/admin/products')
    redirect('/admin/products')
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-ocean text-2xl">Edit product</h1>
        <DeleteButton action={remove} />
      </div>
      {searchParams?.error && <p className="mt-4 rounded-lg bg-rose px-3.5 py-2.5 text-sm text-crimsonDeep">{searchParams.error}</p>}

      <form action={update} className="mt-6 space-y-6 pb-2">
        <Card title="Basic info">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Brand *">
              <Select name="brandSlug" required defaultValue={product.brandSlug}>
                {brands.map((b) => <option key={b.slug} value={b.slug}>{b.name}</option>)}
              </Select>
            </Field>
            <Field label="Model"><TextInput name="model" defaultValue={product.model} /></Field>
          </div>
          <Field label="Name *"><TextInput name="name" defaultValue={product.name} required /></Field>
        </Card>

        <Card title="Details">
          <Field label="Short description"><TextArea name="shortDescription" rows={2} defaultValue={product.shortDescription} /></Field>
          <Field label="Full description"><TextArea name="description" rows={5} defaultValue={product.description} /></Field>
          <Field label="Specs" hint="Add a row per spec — a property name and its value.">
            <SpecsEditor initial={product.specs} />
          </Field>
        </Card>

        <Card title="Media" description="Product photography, gallery thumbnails, and specification documents.">
          <Field label="Product image">
            <FileInput name="image" accept="image/*" current={product.image} locationHint="Main photo on /hardware grid & product detail" aspectHint="1:1 square (800×800 px)" />
          </Field>

          {product.gallery?.length > 0 && (
            <Field label="Existing gallery images" hint="Untick to remove">
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {product.gallery.map((src) => (
                  <label key={src} className="block">
                    {/* A plain <img>, not next/image, on purpose: these are
                        whatever URL the editor previously saved, and
                        next/image refuses any host not allowlisted in
                        next.config.mjs — which would turn an admin preview
                        into a broken image exactly when someone needs to see
                        what they are about to delete. Optimisation buys
                        nothing on a handful of admin-only thumbnails. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" loading="lazy" decoding="async" className="w-full aspect-square object-cover rounded-lg border border-cloud" />
                    <span className="mt-1 flex items-center gap-1.5 text-xs text-steel">
                      <input type="checkbox" name="keepGallery" value={src} defaultChecked /> keep
                    </span>
                  </label>
                ))}
              </div>
            </Field>
          )}
          <Field label="Add gallery images">
            <FileInput name="gallery" accept="image/*" multiple locationHint="Thumbnail slideshow gallery on product detail page" aspectHint="800×800 or 1200×800 px" />
          </Field>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Spec sheet / brochure (PDF upload)">
              <FileInput name="specSheetFile" accept="application/pdf" current={product.specSheet} currentLabel="Current spec sheet" locationHint="PDF Datasheet download button" aspectHint="Max 10 MB PDF" />
            </Field>
            <Field label="…or spec sheet URL" hint="Used if no file is uploaded"><TextInput name="specSheetUrl" placeholder="https://…" /></Field>
          </div>
        </Card>

        <StickyActions>
          <SubmitButton>Save changes</SubmitButton>
        </StickyActions>
      </form>
    </div>
  )
}
