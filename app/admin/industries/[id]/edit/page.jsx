import { redirect, notFound } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import {
  getIndustryById, updateIndustry, deleteIndustry, slugify,
  parseBlockPairs, blockPairsToText, parseLines, linesToText, cleanList,
  listClients, listProducts,
} from '@/lib/admin-data'
import { saveUpload } from '@/lib/upload'
import { Field, TextInput, TextArea, FileInput, Card, StickyActions } from '../../../_components/fields'
import CatalogPicker from '../../../_components/CatalogPicker'
import SubmitButton from '../../../_components/SubmitButton'
import DeleteButton from '../../../_components/DeleteButton'

export const metadata = { title: 'Edit industry — Admin' }

export default async function EditIndustryPage({ params, searchParams }) {
  const id = Number(params.id)
  const industry = await getIndustryById(id)
  if (!industry) notFound()

  const clientOptions = (await listClients()).map((c) => ({ value: c.name, label: c.name, image: c.logo }))
  const productOptions = (await listProducts())
    .map((p) => ({ value: p.name, label: p.name, image: p.image, sub: p.brandSlug }))
    .sort((a, b) => a.label.localeCompare(b.label))

  async function update(formData) {
    'use server'
    const existing = await getIndustryById(id)
    if (!existing) notFound()

    const name = formData.get('name')?.toString().trim()
    const slug = existing.slug || slugify(name)

    const logo = await saveUpload(formData.get('logo'), 'industries', 'image')
    const visualFile = await saveUpload(formData.get('visualFile'), 'industries', 'image')
    const heroVideoFile = await saveUpload(formData.get('heroVideo'), 'industries', 'video')
    const errs = [logo.error, visualFile.error, heroVideoFile.error].filter(Boolean)
    if (errs.length) redirect(`/admin/industries/${id}/edit?error=${encodeURIComponent(errs.join(' '))}`)

    const visualUrl = formData.get('visualUrl')?.toString().trim()
    const modulesText = formData.get('modules')?.toString().trim()

    const { ok, error } = await updateIndustry(id, {
      slug, name,
      tag: formData.get('tag')?.toString() || null,
      summary: formData.get('summary')?.toString() || null,
      description: formData.get('description')?.toString() || null,
      logo: logo.path || existing.logo,
      visual: visualFile.path || visualUrl || existing.visual,
      heroVideo: heroVideoFile.path || formData.get('heroVideoUrl')?.toString().trim() || existing.heroVideo || null,
      features: parseBlockPairs(formData.get('features')),
      modules: modulesText ? parseBlockPairs(modulesText) : null,
      advantages: parseLines(formData.get('advantages')),
      hardwareUsed: cleanList(formData.getAll('hardwareUsed')),
      clients: cleanList(formData.getAll('clients')),
    })
    if (!ok) redirect(`/admin/industries/${id}/edit?error=${encodeURIComponent(error)}`)

    revalidatePath('/admin/industries')
    revalidatePath('/industries')
    redirect('/admin/industries')
  }

  async function remove() {
    'use server'
    await deleteIndustry(id)
    revalidatePath('/admin/industries')
    revalidatePath('/industries')
    redirect('/admin/industries')
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-ocean text-2xl">Edit industry</h1>
        <DeleteButton action={remove} />
      </div>
      {searchParams?.error && <p className="mt-4 rounded-lg bg-rose px-3.5 py-2.5 text-sm text-crimsonDeep">{searchParams.error}</p>}

      <form action={update} className="mt-6 space-y-6 pb-2">
        <Card title="Basic info">
          <Field label="Name *"><TextInput name="name" defaultValue={industry.name} required /></Field>
          <Field label="Tag"><TextInput name="tag" defaultValue={industry.tag} /></Field>
          <Field label="Summary"><TextArea name="summary" rows={2} defaultValue={industry.summary} /></Field>
        </Card>

        <Card title="Content">
          <Field label="Full description"><TextArea name="description" rows={5} defaultValue={industry.description} /></Field>
          <Field label="Applications" hint="Blank-line-separated blocks: first line = title, rest = body">
            <TextArea name="features" rows={6} defaultValue={blockPairsToText(industry.features)} />
          </Field>
          <Field label="Deployment modules (optional)" hint="Same format as Applications">
            <TextArea name="modules" rows={4} defaultValue={blockPairsToText(industry.modules)} />
          </Field>
          <Field label="Business outcomes" hint="One per line"><TextArea name="advantages" rows={3} defaultValue={linesToText(industry.advantages)} /></Field>
          <Field label="Products deployed" hint="Pick from the hardware catalog — each shows its product image on the industry page.">
            <CatalogPicker
              name="hardwareUsed"
              options={productOptions}
              initial={industry.hardwareUsed}
              addHref="/admin/products/new"
              addLabel="New product"
              searchPlaceholder="Search products…"
              emptyText="No products in the catalog yet."
            />
          </Field>
          <Field label="Clients" hint="Pick companies from the client catalog — each shows its logo. Add a new one and it appears here.">
            <CatalogPicker
              name="clients"
              options={clientOptions}
              initial={industry.clients}
              addHref="/admin/clients/new"
              addLabel="New client"
              searchPlaceholder="Search clients…"
              emptyText="No clients in the catalog yet."
            />
          </Field>
        </Card>

        <Card title="Media" description="Industry banner graphic shown on cards and listing.">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Logo">
              <FileInput name="logo" accept="image/*" current={industry.logo} aspectHint="1:1 square transparent" />
            </Field>
            <Field label="Visual image (upload)">
              <FileInput name="visualFile" accept="image/*" current={industry.visual} currentLabel="Current visual" aspectHint="16:9 ratio (1600×900 px)" />
            </Field>
          </div>
          <Field label="…or visual image URL"><TextInput name="visualUrl" placeholder="https://…" /></Field>
          <Field label="Header background video (upload)" hint="MP4 played behind the page title — leave blank to keep the current video.">
            <FileInput name="heroVideo" accept="video/*" current={industry.heroVideo} locationHint="Background video loop on industry hero header" aspectHint="MP4 video (1080p, max 15-20 MB)" />
          </Field>
          <Field label="…or hero video URL" hint="Used if no file is uploaded">
            <TextInput name="heroVideoUrl" placeholder="https://example.com/industry.mp4" />
          </Field>
        </Card>

        <StickyActions>
          <SubmitButton>Save changes</SubmitButton>
        </StickyActions>
      </form>
    </div>
  )
}
