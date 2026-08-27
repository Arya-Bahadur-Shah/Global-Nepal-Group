import { redirect } from 'next/navigation'
import { requireSession } from '@/lib/auth'
import { revalidateContent } from '@/lib/revalidate'
import { createSolution, slugify, parseBlockPairs, parseLines } from '@/lib/admin-data'
import { Field, TextInput, TextArea, Card, StickyActions } from '../../_components/fields'
import BlobFileInput from '../../_components/BlobFileInput'
import SubmitButton from '../../_components/SubmitButton'

export const metadata = { title: 'New solution — Admin' }

export default async function NewSolutionPage({ searchParams }) {
  async function create(formData) {
    'use server'
    await requireSession()
    const name = formData.get('name')?.toString().trim()
    const slug = slugify(name)

    const logoUrl      = formData.get('logo')?.toString().trim() || null
    const visualFileUrl = formData.get('visualFile')?.toString().trim() || null
    const heroVideoFileUrl = formData.get('heroVideo')?.toString().trim() || null
    const visualUrl    = formData.get('visualUrl')?.toString().trim() || null
    const heroVideoUrl = formData.get('heroVideoUrl')?.toString().trim() || null
    const modulesText  = formData.get('modules')?.toString().trim()

    const { ok, error } = await createSolution({
      slug, name,
      tag: formData.get('tag')?.toString() || null,
      summary: formData.get('summary')?.toString() || null,
      description: formData.get('description')?.toString() || null,
      logo: logoUrl,
      visual: visualFileUrl || visualUrl || null,
      heroVideo: heroVideoFileUrl || heroVideoUrl || null,
      features: parseBlockPairs(formData.get('features')),
      modules: modulesText ? parseBlockPairs(modulesText) : null,
      advantages: parseLines(formData.get('advantages')),
      hardwareUsed: parseLines(formData.get('hardwareUsed')),
    })
    if (!ok) redirect(`/admin/solutions/new?error=${encodeURIComponent(error)}`)

    revalidateContent('solutions', '/admin/solutions')
    redirect('/admin/solutions')
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-display font-bold text-ocean text-2xl">New solution</h1>
      {searchParams?.error && <p className="mt-4 rounded-lg bg-rose px-3.5 py-2.5 text-sm text-crimsonDeep">{searchParams.error}</p>}

      <form action={create} className="mt-6 space-y-6 pb-2">
        <Card title="Basic info">
          <Field label="Name *" hint="e.g. Cubix POS Solution"><TextInput name="name" required placeholder="e.g. Cubix POS Solution" /></Field>
          <Field label="Tag" hint="e.g. Warehouse management"><TextInput name="tag" /></Field>
          <Field label="Summary" hint="Short — used on cards + homepage tabs"><TextArea name="summary" rows={2} /></Field>
        </Card>

        <Card title="Content">
          <Field label="Full description" hint="Used on the solution's detail page"><TextArea name="description" rows={5} /></Field>
          <Field label="Features" hint={'Blank-line-separated blocks: first line = title, rest = body'}>
            <TextArea name="features" rows={6} placeholder={'Real-Time Inventory Management\nAccurate, instant stock tracking across warehouses.\n\nMulti Location\nSeamless inventory management across multiple stores.'} />
          </Field>
          <Field label="Modules (optional)" hint="Same format as Features">
            <TextArea name="modules" rows={4} />
          </Field>
          <Field label="Advantages" hint="One per line"><TextArea name="advantages" rows={3} /></Field>
          <Field label="Hardware used" hint="One product name per line — cross-links automatically to matching products">
            <TextArea name="hardwareUsed" rows={2} />
          </Field>
        </Card>

        <Card title="Media" description="Solution icon/logo and visual graphic banner.">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Logo">
              <BlobFileInput name="logo" accept="image/*" kind="image" locationHint="Displayed on home solution tab cards & solution header" aspectHint="1:1 square transparent (200×200 px)" />
            </Field>
            <Field label="Visual image (upload)">
              <BlobFileInput name="visualFile" accept="image/*" kind="image" locationHint="Hero graphic banner on /solutions detail page" aspectHint="3:2 ratio (1200×800 px)" />
            </Field>
          </div>
          <Field label="…or visual image URL" hint="Used if no file is uploaded"><TextInput name="visualUrl" placeholder="https://…" /></Field>
          <Field label="Header background video (upload)" hint="MP4 played behind the page title — leave blank to use the site default video.">
            <BlobFileInput name="heroVideo" accept="video/*" kind="video" locationHint="Background video loop on software solution hero header" aspectHint="MP4 video (1080p)" />
          </Field>
          <Field label="…or hero video URL" hint="Used if no file is uploaded">
            <TextInput name="heroVideoUrl" placeholder="https://example.com/my-video.mp4" />
          </Field>
        </Card>

        <StickyActions>
          <SubmitButton>Create solution</SubmitButton>
        </StickyActions>
      </form>
    </div>
  )
}
