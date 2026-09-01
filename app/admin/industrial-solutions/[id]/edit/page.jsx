import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { requireSession } from '@/lib/auth'
import { revalidateContent } from '@/lib/revalidate'
import {
  getIndustrialSolutionById, updateIndustrialSolution, deleteIndustrialSolution, slugify,
  parseBlockPairs, blockPairsToText, parseLines, linesToText, getProductsByIndustrialSolution,
} from '@/lib/admin-data'
import { Field, TextInput, TextArea, Card, StickyActions } from '../../../_components/fields'
import BlobFileInput from '../../../_components/BlobFileInput'
import SubmitButton from '../../../_components/SubmitButton'
import DeleteButton from '../../../_components/DeleteButton'

export const metadata = { title: 'Edit industrial solution — Admin' }

export default async function EditIndustrialSolutionPage({ params, searchParams }) {
  const id = Number(params.id)
  const solution = await getIndustrialSolutionById(id)
  if (!solution) notFound()
  const assignedProducts = await getProductsByIndustrialSolution(solution.slug)

  async function update(formData) {
    'use server'
    await requireSession()
    const existing = await getIndustrialSolutionById(id)
    if (!existing) notFound()

    const name = formData.get('name')?.toString().trim()
    const slug = existing.slug || slugify(name)

    const newLogoUrl       = formData.get('logo')?.toString().trim() || null
    const newVisualFileUrl = formData.get('visualFile')?.toString().trim() || null
    const newHeroVideoUrl  = formData.get('heroVideo')?.toString().trim() || null
    const visualUrl        = formData.get('visualUrl')?.toString().trim() || null
    const heroVideoUrlField = formData.get('heroVideoUrl')?.toString().trim() || null
    const modulesText      = formData.get('modules')?.toString().trim()

    const { ok, error } = await updateIndustrialSolution(id, {
      slug, name,
      tag: formData.get('tag')?.toString() || null,
      summary: formData.get('summary')?.toString() || null,
      description: formData.get('description')?.toString() || null,
      logo: formData.get('remove_logo') ? null : (newLogoUrl || existing.logo),
      visual: formData.get('remove_visualFile') ? null : (newVisualFileUrl || visualUrl || existing.visual),
      heroVideo: formData.get('remove_heroVideo') ? null : (newHeroVideoUrl || heroVideoUrlField || existing.heroVideo || null),
      features: parseBlockPairs(formData.get('features')),
      modules: modulesText ? parseBlockPairs(modulesText) : null,
      advantages: parseLines(formData.get('advantages')),
      hardwareUsed: parseLines(formData.get('hardwareUsed')),
    })
    if (!ok) redirect(`/admin/industrial-solutions/${id}/edit?error=${encodeURIComponent(error)}`)

    revalidateContent('industrial-solutions', '/admin/industrial-solutions')
    redirect('/admin/industrial-solutions')
  }

  async function remove() {
    'use server'
    await requireSession()
    await deleteIndustrialSolution(id)
    revalidateContent('industrial-solutions', '/admin/industrial-solutions')
    redirect('/admin/industrial-solutions')
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-ocean text-2xl">Edit industrial solution</h1>
        <DeleteButton action={remove} />
      </div>
      {searchParams?.error && <p className="mt-4 rounded-lg bg-rose px-3.5 py-2.5 text-sm text-crimsonDeep">{searchParams.error}</p>}

      <form action={update} className="mt-6 space-y-6 pb-2">
        <Card title="Basic info">
          <Field label="Name *"><TextInput name="name" defaultValue={solution.name} required /></Field>
          <Field label="Tag"><TextInput name="tag" defaultValue={solution.tag} /></Field>
          <Field label="Summary"><TextArea name="summary" rows={2} defaultValue={solution.summary} /></Field>
        </Card>

        {/* Assigned Solution Products */}
        <Card title="Solution Products" description={`Equipment products listed under ${solution.name}.`}>
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-xs text-steel">
              {assignedProducts.length} {assignedProducts.length === 1 ? 'product' : 'products'} assigned
            </span>
            <Link
              href={`/admin/products/new?solution=${solution.slug}`}
              className="rounded-md bg-ocean px-3 py-1.5 text-xs font-semibold text-white hover:bg-crimson transition-colors"
            >
              + Add product for this solution
            </Link>
          </div>

          {assignedProducts.length === 0 ? (
            <p className="text-xs text-steel border border-dashed border-cloud rounded-lg p-4 text-center">
              No products assigned to this solution yet. Click above to add one.
            </p>
          ) : (
            <div className="space-y-3">
              {assignedProducts.map((p) => (
                <div key={p.id || p.slug} className="flex items-center justify-between p-3 rounded-lg border border-cloud bg-mist/50">
                  <div className="flex items-center gap-3">
                    {p.image ? (
                      <div className="relative h-10 w-10 rounded bg-white border border-cloud overflow-hidden shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.image} alt={p.name} className="h-full w-full object-contain p-1" />
                      </div>
                    ) : (
                      <div className="h-10 w-10 rounded bg-mist border border-cloud grid place-items-center text-steel text-xs font-bold shrink-0">
                        PROD
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-ocean text-sm">{p.name}</div>
                      <div className="font-mono text-[11px] text-steel">{p.model || p.slug}</div>
                    </div>
                  </div>
                  {p.id && (
                    <Link href={`/admin/products/${p.id}/edit`} className="text-xs font-semibold text-azure hover:text-ocean transition-colors">
                      Edit Product →
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
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

        <Card title="Media" description="Industrial solution banner graphic.">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Logo">
              <BlobFileInput name="logo" accept="image/*" kind="image" current={solution.logo} aspectHint="1:1 square transparent" />
            </Field>
            <Field label="Visual image (upload)">
              <BlobFileInput name="visualFile" accept="image/*" kind="image" current={solution.visual} currentLabel="Current visual" aspectHint="3:2 ratio (1200×800 px)" />
            </Field>
          </div>
          <Field label="…or visual image URL"><TextInput name="visualUrl" placeholder="https://…" /></Field>
          <Field label="Header background video (upload)" hint="MP4 played behind the page title — leave blank to keep the current video.">
            <BlobFileInput name="heroVideo" accept="video/*" kind="video" current={solution.heroVideo} locationHint="Background video loop on industrial solution hero header" aspectHint="MP4 video (1080p)" />
          </Field>
          <Field label="…or hero video URL" hint="Used if no file is uploaded">
            <TextInput name="heroVideoUrl" placeholder="https://example.com/industrial-demo.mp4" />
          </Field>
        </Card>

        <StickyActions>
          <SubmitButton>Save changes</SubmitButton>
        </StickyActions>
      </form>
    </div>
  )
}
