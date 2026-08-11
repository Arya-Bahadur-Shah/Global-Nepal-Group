import { redirect, notFound } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import {
  getSolutionById, updateSolution, deleteSolution, slugify,
  parseBlockPairs, blockPairsToText, parseLines, linesToText,
} from '@/lib/admin-data'
import { saveUpload } from '@/lib/upload'
import { Field, TextInput, TextArea, FileInput, Card, StickyActions } from '../../../_components/fields'
import SubmitButton from '../../../_components/SubmitButton'
import DeleteButton from '../../../_components/DeleteButton'

export const metadata = { title: 'Edit solution — Admin' }

export default async function EditSolutionPage({ params, searchParams }) {
  const id = Number(params.id)
  const solution = await getSolutionById(id)
  if (!solution) notFound()

  async function update(formData) {
    'use server'
    const existing = await getSolutionById(id)
    if (!existing) notFound()

    const name = formData.get('name')?.toString().trim()
    const slug = existing.slug || slugify(name)

    const logo = await saveUpload(formData.get('logo'), 'solutions', 'image')
    const visualFile = await saveUpload(formData.get('visualFile'), 'solutions', 'image')
    const heroVideoFile = await saveUpload(formData.get('heroVideo'), 'solutions', 'video')
    const errs = [logo.error, visualFile.error, heroVideoFile.error].filter(Boolean)
    if (errs.length) redirect(`/admin/solutions/${id}/edit?error=${encodeURIComponent(errs.join(' '))}`)

    const visualUrl = formData.get('visualUrl')?.toString().trim()
    const modulesText = formData.get('modules')?.toString().trim()

    const { ok, error } = await updateSolution(id, {
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
      hardwareUsed: parseLines(formData.get('hardwareUsed')),
    })
    if (!ok) redirect(`/admin/solutions/${id}/edit?error=${encodeURIComponent(error)}`)

    revalidatePath('/admin/solutions')
    revalidatePath('/solutions')
    redirect('/admin/solutions')
  }

  async function remove() {
    'use server'
    await deleteSolution(id)
    revalidatePath('/admin/solutions')
    revalidatePath('/solutions')
    redirect('/admin/solutions')
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-ocean text-2xl">Edit solution</h1>
        <DeleteButton action={remove} />
      </div>
      {searchParams?.error && <p className="mt-4 rounded-lg bg-rose px-3.5 py-2.5 text-sm text-crimsonDeep">{searchParams.error}</p>}

      <form action={update} className="mt-6 space-y-6 pb-2">
        <Card title="Basic info">
          <Field label="Name *"><TextInput name="name" defaultValue={solution.name} required /></Field>
          <Field label="Tag"><TextInput name="tag" defaultValue={solution.tag} /></Field>
          <Field label="Summary"><TextArea name="summary" rows={2} defaultValue={solution.summary} /></Field>
        </Card>

        <Card title="Content">
          <Field label="Full description"><TextArea name="description" rows={5} defaultValue={solution.description} /></Field>
          <Field label="Features" hint="Blank-line-separated blocks: first line = title, rest = body">
            <TextArea name="features" rows={6} defaultValue={blockPairsToText(solution.features)} />
          </Field>
          <Field label="Modules (optional)" hint="Same format as Features">
            <TextArea name="modules" rows={4} defaultValue={blockPairsToText(solution.modules)} />
          </Field>
          <Field label="Advantages" hint="One per line"><TextArea name="advantages" rows={3} defaultValue={linesToText(solution.advantages)} /></Field>
          <Field label="Hardware used" hint="One product name per line">
            <TextArea name="hardwareUsed" rows={2} defaultValue={linesToText(solution.hardwareUsed)} />
          </Field>
        </Card>

        <Card title="Media" description="Solution icon/logo and visual graphic banner.">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Logo">
              <FileInput name="logo" accept="image/*" current={solution.logo} locationHint="Displayed on home solution tab cards & solution header" aspectHint="1:1 square transparent (200×200 px)" />
            </Field>
            <Field label="Visual image (upload)">
              <FileInput name="visualFile" accept="image/*" current={solution.visual} currentLabel="Current visual" locationHint="Hero graphic banner on /solutions detail page" aspectHint="3:2 ratio (1200×800 px)" />
            </Field>
          </div>
          <Field label="…or visual image URL"><TextInput name="visualUrl" placeholder="https://…" /></Field>
          <Field label="Header background video (upload)" hint="MP4 played behind the page title — leave blank to keep the current video.">
            <FileInput name="heroVideo" accept="video/*" current={solution.heroVideo} locationHint="Background video loop on software solution hero header" aspectHint="MP4 video (1080p, max 15-20 MB)" />
          </Field>
          <Field label="…or hero video URL" hint="Used if no file is uploaded">
            <TextInput name="heroVideoUrl" placeholder="https://example.com/my-video.mp4" />
          </Field>
        </Card>

        <StickyActions>
          <SubmitButton>Save changes</SubmitButton>
        </StickyActions>
      </form>
    </div>
  )
}
