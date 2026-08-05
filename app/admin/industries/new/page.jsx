import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createIndustry, slugify, parseBlockPairs, parseLines, cleanList, listClients, listProducts } from '@/lib/admin-data'
import { saveUpload } from '@/lib/upload'
import { Field, TextInput, TextArea, FileInput, Card, StickyActions } from '../../_components/fields'
import CatalogPicker from '../../_components/CatalogPicker'
import SubmitButton from '../../_components/SubmitButton'

export const metadata = { title: 'New industry — Admin' }

export default function NewIndustryPage({ searchParams }) {
  const clientOptions = listClients().map((c) => ({ value: c.name, label: c.name, image: c.logo }))
  const productOptions = listProducts()
    .map((p) => ({ value: p.name, label: p.name, image: p.image, sub: p.brandSlug }))
    .sort((a, b) => a.label.localeCompare(b.label))

  async function create(formData) {
    'use server'
    const name = formData.get('name')?.toString().trim()
    const slug = slugify(name)

    const logo = await saveUpload(formData.get('logo'), 'industries', 'image')
    const visualFile = await saveUpload(formData.get('visualFile'), 'industries', 'image')
    const heroVideoFile = await saveUpload(formData.get('heroVideo'), 'industries', 'video')
    const errs = [logo.error, visualFile.error, heroVideoFile.error].filter(Boolean)
    if (errs.length) redirect(`/admin/industries/new?error=${encodeURIComponent(errs.join(' '))}`)

    const visualUrl = formData.get('visualUrl')?.toString().trim()
    const modulesText = formData.get('modules')?.toString().trim()

    const { ok, error } = createIndustry({
      slug, name,
      tag: formData.get('tag')?.toString() || null,
      summary: formData.get('summary')?.toString() || null,
      description: formData.get('description')?.toString() || null,
      logo: logo.path,
      visual: visualFile.path || visualUrl || null,
      heroVideo: heroVideoFile.path || formData.get('heroVideoUrl')?.toString().trim() || null,
      features: parseBlockPairs(formData.get('features')),
      modules: modulesText ? parseBlockPairs(modulesText) : null,
      advantages: parseLines(formData.get('advantages')),
      hardwareUsed: cleanList(formData.getAll('hardwareUsed')),
      clients: cleanList(formData.getAll('clients')),
    })
    if (!ok) redirect(`/admin/industries/new?error=${encodeURIComponent(error)}`)

    revalidatePath('/admin/industries')
    revalidatePath('/industries')
    redirect('/admin/industries')
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-display font-bold text-ocean text-2xl">New industry</h1>
      {searchParams?.error && <p className="mt-4 rounded-lg bg-rose px-3.5 py-2.5 text-sm text-crimsonDeep">{searchParams.error}</p>}

      <form action={create} className="mt-6 space-y-6 pb-2">
        <Card title="Basic info">
          <Field label="Name *" hint="e.g. Banking & Finance"><TextInput name="name" required placeholder="e.g. Banking & Finance" /></Field>
          <Field label="Tag" hint="e.g. Secure Identity & Access"><TextInput name="tag" /></Field>
          <Field label="Summary" hint="Short — used on the industry cards"><TextArea name="summary" rows={2} /></Field>
        </Card>

        <Card title="Content">
          <Field label="Full description" hint="Used on the industry detail page hero"><TextArea name="description" rows={5} /></Field>
          <Field label="Applications" hint={'Blank-line-separated blocks: first line = title, rest = body'}>
            <TextArea name="features" rows={6} placeholder={'Biometric Customer Authentication\nMultispectral fingerprint capture for KYC, account opening, and transaction verification.'} />
          </Field>
          <Field label="Deployment modules (optional)" hint="Same format as Applications">
            <TextArea name="modules" rows={4} />
          </Field>
          <Field label="Business outcomes" hint="One per line"><TextArea name="advantages" rows={3} /></Field>
          <Field label="Products deployed" hint="Pick from the hardware catalog — each shows its product image on the industry page.">
            <CatalogPicker
              name="hardwareUsed"
              options={productOptions}
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
              addHref="/admin/clients/new"
              addLabel="New client"
              searchPlaceholder="Search clients…"
              emptyText="No clients in the catalog yet."
            />
          </Field>
        </Card>

        <Card title="Media" description="Industry banner graphic shown on cards and listing.">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Logo (optional)">
              <FileInput name="logo" accept="image/*" aspectHint="1:1 square transparent" />
            </Field>
            <Field label="Visual image (upload)">
              <FileInput name="visualFile" accept="image/*" aspectHint="16:9 ratio (1600×900 px)" />
            </Field>
          </div>
          <Field label="…or visual image URL" hint="Used if no file is uploaded"><TextInput name="visualUrl" placeholder="https://…" /></Field>
          <Field label="Header background video (upload)" hint="MP4 played behind the page title — leave blank to use the site default video.">
            <FileInput name="heroVideo" accept="video/*" locationHint="Background video loop on industry hero header" aspectHint="MP4 video (1080p, max 15-20 MB)" />
          </Field>
          <Field label="…or hero video URL" hint="Used if no file is uploaded">
            <TextInput name="heroVideoUrl" placeholder="https://example.com/industry.mp4" />
          </Field>
        </Card>

        <StickyActions>
          <SubmitButton>Create industry</SubmitButton>
        </StickyActions>
      </form>
    </div>
  )
}
