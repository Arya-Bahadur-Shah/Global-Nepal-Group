import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createIndustrialSolution, slugify, parseBlockPairs, parseLines } from '@/lib/admin-data'
import { saveUpload } from '@/lib/upload'
import { Field, TextInput, TextArea, FileInput, Card, StickyActions } from '../../_components/fields'
import SubmitButton from '../../_components/SubmitButton'

export const metadata = { title: 'New industrial solution — Admin' }

export default async function NewIndustrialSolutionPage({ searchParams }) {
  async function create(formData) {
    'use server'
    const name = formData.get('name')?.toString().trim()
    const slug = slugify(name)

    const logo = await saveUpload(formData.get('logo'), 'industrial-solutions', 'image')
    const visualFile = await saveUpload(formData.get('visualFile'), 'industrial-solutions', 'image')
    const heroVideoFile = await saveUpload(formData.get('heroVideo'), 'industrial-solutions', 'video')
    const errs = [logo.error, visualFile.error, heroVideoFile.error].filter(Boolean)
    if (errs.length) redirect(`/admin/industrial-solutions/new?error=${encodeURIComponent(errs.join(' '))}`)

    const visualUrl = formData.get('visualUrl')?.toString().trim()
    const modulesText = formData.get('modules')?.toString().trim()

    const { ok, error } = await createIndustrialSolution({
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
      hardwareUsed: parseLines(formData.get('hardwareUsed')),
    })
    if (!ok) redirect(`/admin/industrial-solutions/new?error=${encodeURIComponent(error)}`)

    revalidatePath('/admin/industrial-solutions')
    revalidatePath('/industrial-solutions')
    redirect('/admin/industrial-solutions')
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-display font-bold text-ocean text-2xl">New industrial solution</h1>
      {searchParams?.error && <p className="mt-4 rounded-lg bg-rose px-3.5 py-2.5 text-sm text-crimsonDeep">{searchParams.error}</p>}

      <form action={create} className="mt-6 space-y-6 pb-2">
        <Card title="Basic info">
          <Field label="Name *" hint="e.g. Factory Traceability & Serialization"><TextInput name="name" required placeholder="e.g. Factory Traceability & Serialization" /></Field>
          <Field label="Tag" hint="e.g. Manufacturing & Batch Control"><TextInput name="tag" /></Field>
          <Field label="Summary" hint="Short — used on cards & homepage showcase"><TextArea name="summary" rows={2} /></Field>
        </Card>

        <Card title="Content">
          <Field label="Full description" hint="Used on detail page"><TextArea name="description" rows={5} /></Field>
          <Field label="Features" hint={'Blank-line-separated blocks: first line = title, rest = body'}>
            <TextArea name="features" rows={6} placeholder={'Direct Part Marking & Batch Codes\nHigh-resolution inkjet and laser serialization per item and outer carton.'} />
          </Field>
          <Field label="Modules (optional)" hint="Same format as Features">
            <TextArea name="modules" rows={4} />
          </Field>
          <Field label="Advantages" hint="One per line"><TextArea name="advantages" rows={3} /></Field>
          <Field label="Hardware used" hint="One product brand/name per line (e.g. Zebra, Rynan)"><TextArea name="hardwareUsed" rows={2} /></Field>
        </Card>

        <Card title="Media" description="Industrial solution banner graphic.">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Logo (optional)">
              <FileInput name="logo" accept="image/*" aspectHint="1:1 square transparent" />
            </Field>
            <Field label="Visual image (upload)">
              <FileInput name="visualFile" accept="image/*" aspectHint="3:2 ratio (1200×800 px)" />
            </Field>
          </div>
          <Field label="…or visual image URL" hint="Used if no file is uploaded"><TextInput name="visualUrl" placeholder="https://…" /></Field>
          <Field label="Header background video (upload)" hint="MP4 played behind the page title — leave blank to use the site default video.">
            <FileInput name="heroVideo" accept="video/*" locationHint="Background video loop on industrial solution hero header" aspectHint="MP4 video (1080p, max 15-20 MB)" />
          </Field>
          <Field label="…or hero video URL" hint="Used if no file is uploaded">
            <TextInput name="heroVideoUrl" placeholder="https://example.com/industrial-demo.mp4" />
          </Field>
        </Card>

        <StickyActions>
          <SubmitButton>Create industrial solution</SubmitButton>
        </StickyActions>
      </form>
    </div>
  )
}
