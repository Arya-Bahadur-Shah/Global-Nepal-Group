import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getSite } from '@/lib/content'
import { updateAboutSettings, parseBlockPairs, blockPairsToText, parseLines } from '@/lib/admin-data'
import { Field, TextInput, TextArea, Card, StickyActions } from '../_components/fields'
import SubmitButton from '../_components/SubmitButton'

export const metadata = { title: 'About Us — Admin' }

/* "value | label" per line  <->  [{ value, label }] */
function parseStatLines(text) {
  return parseLines(text).map((line) => {
    const i = line.indexOf('|')
    return i < 0
      ? { value: line.trim(), label: '' }
      : { value: line.slice(0, i).trim(), label: line.slice(i + 1).trim() }
  }).filter((s) => s.value || s.label)
}
const statsToText = (stats) => (stats || []).map((s) => `${s.value} | ${s.label}`).join('\n')

export default function AdminAboutPage({ searchParams }) {
  const site = getSite()

  async function save(formData) {
    'use server'
    const { ok, error } = updateAboutSettings({
      aboutHeadline: formData.get('aboutHeadline')?.toString().trim() || null,
      mission: formData.get('mission')?.toString().trim() || null,
      aboutValues: parseBlockPairs(formData.get('aboutValues')),
      aboutTimeline: parseBlockPairs(formData.get('aboutTimeline')),
      stats: parseStatLines(formData.get('stats')),
    })
    if (!ok) redirect(`/admin/about?error=${encodeURIComponent(error)}`)

    revalidatePath('/admin/about')
    revalidatePath('/about')
    revalidatePath('/')
    redirect('/admin/about?success=1')
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-display font-bold text-ocean text-2xl">About Us</h1>
      <p className="mt-1 text-sm text-steel">Edit the content of the public About page.</p>

      {searchParams?.error && <p className="mt-4 rounded-lg bg-rose px-3.5 py-2.5 text-sm text-crimsonDeep">{searchParams.error}</p>}
      {searchParams?.success && <p className="mt-4 rounded-lg bg-mist px-3.5 py-2.5 text-sm text-ocean">About page updated.</p>}

      <form action={save} className="mt-6 space-y-6 pb-2">
        <Card title="Header">
          <Field label="Headline" hint="Large title in the About hero"><TextInput name="aboutHeadline" defaultValue={site.aboutHeadline || ''} /></Field>
          <Field label="Intro paragraph" hint="Shown under the headline"><TextArea name="mission" rows={3} defaultValue={site.mission || ''} /></Field>
        </Card>

        <Card title="Stat strip" description="The red band of numbers.">
          <Field label="Stats" hint={'One per line, "value | label" — e.g. 10+ | Years serving Nepali industry'}>
            <TextArea name="stats" rows={4} defaultValue={statsToText(site.stats)} placeholder={'10+ | Years serving Nepali industry\n120+ | Deployments live'} />
          </Field>
        </Card>

        <Card title="Our values" description="Cards in the values grid.">
          <Field label="Values" hint="Blank-line-separated blocks: first line = title, the rest = body">
            <TextArea name="aboutValues" rows={8} defaultValue={blockPairsToText(site.aboutValues)} placeholder={'Digital transformation\nWe replace paper trails with systems that show the truth of an operation in real time.'} />
          </Field>
        </Card>

        <Card title="Journey timeline" description="The numbered milestones.">
          <Field label="Timeline" hint="Same format: first line = milestone label, the rest = body">
            <TextArea name="aboutTimeline" rows={8} defaultValue={blockPairsToText(site.aboutTimeline)} placeholder={'Founded\nGlobal Nepal Group begins bringing identification technology to Nepali industry.'} />
          </Field>
        </Card>

        <StickyActions>
          <SubmitButton>Save About page</SubmitButton>
        </StickyActions>
      </form>
    </div>
  )
}
