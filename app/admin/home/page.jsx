import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getSite } from '@/lib/content'
import { updateHomeSettings, parseLines } from '@/lib/admin-data'
import { saveUploads } from '@/lib/upload'
import { Field, TextInput, TextArea, FileInput, Card, StickyActions } from '../_components/fields'
import SubmitButton from '../_components/SubmitButton'

export const metadata = { title: 'Home page — Admin' }

export default async function AdminHomePage({ searchParams }) {
  const site = await getSite()
  const clips = site.heroVideos || []

  async function save(formData) {
    'use server'
    // New uploads are appended to the playlist, in the order chosen.
    const { paths: uploaded, errors } = await saveUploads(formData.getAll('newVideos'), 'home', 'video')
    if (errors.length) redirect(`/admin/home?error=${encodeURIComponent(errors.join(' '))}`)

    // The textarea is the source of truth for existing clips (edit / reorder / remove).
    const listed = parseLines(formData.get('videoList'))
    const heroVideos = [...listed, ...uploaded]

    const { ok, error } = await updateHomeSettings({
      heroSub: formData.get('heroSub')?.toString().trim() || null,
      ctaPrimary: formData.get('ctaPrimary')?.toString().trim() || null,
      ctaSecondary: formData.get('ctaSecondary')?.toString().trim() || null,
      heroVideos,
    })
    if (!ok) redirect(`/admin/home?error=${encodeURIComponent(error)}`)

    revalidatePath('/admin/home')
    revalidatePath('/')
    redirect('/admin/home?success=1')
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-display font-bold text-ocean text-2xl">Home page</h1>
      <p className="mt-1 text-sm text-steel">Manage the hero background video loop and the headline call-to-action copy.</p>

      {searchParams?.error && <p className="mt-4 rounded-lg bg-rose px-3.5 py-2.5 text-sm text-crimsonDeep">{searchParams.error}</p>}
      {searchParams?.success && <p className="mt-4 rounded-lg bg-mist px-3.5 py-2.5 text-sm text-ocean">Home page updated.</p>}

      <form action={save} className="mt-6 space-y-6 pb-2">
        <Card title="Hero video loop" description="These clips play back-to-back on an endless loop behind the hero. A single clip just loops on itself.">
          {clips.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {clips.map((src, i) => (
                <div key={src + i} className="rounded-xl border border-cloud bg-mist/50 p-2">
                  <div className="flex items-center justify-between px-1 pb-1.5">
                    <span className="font-mono text-[11px] font-bold text-steel">Clip {i + 1}</span>
                  </div>
                  <video src={src} muted playsInline preload="metadata" controls className="w-full aspect-video rounded-lg bg-black object-cover" />
                  <p className="mt-1.5 px-1 font-mono text-[10px] text-steel truncate">{src}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-steel">No clips set — the site default loop is being used.</p>
          )}

          <Field
            label="Playlist (one video path per line, in play order)"
            hint="Reorder by moving lines, remove a clip by deleting its line. Newly uploaded clips (below) are added to the end. Leave empty to use the site default."
          >
            <TextArea name="videoList" rows={Math.max(3, clips.length + 1)} defaultValue={clips.join('\n')} placeholder={'/assets/video/hero-loop-primary.mp4\n/assets/video/hero-loop-alt.mp4'} />
          </Field>

          <Field label="Add new video clip(s)" hint="MP4 recommended. Uploaded clips are appended to the playlist above.">
            <FileInput name="newVideos" accept="video/*" multiple locationHint="Home hero background loop" aspectHint="MP4, 1080p 16:9, short loop (≈15–20s, keep under ~15 MB)" />
          </Field>
        </Card>

        <Card title="Hero copy" description="Text shown over the hero video.">
          <Field label="Subtitle" hint="Paragraph under the main headline"><TextArea name="heroSub" rows={2} defaultValue={site.heroSub || ''} /></Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Primary button label"><TextInput name="ctaPrimary" defaultValue={site.ctaPrimary || ''} placeholder="Explore Solutions" /></Field>
            <Field label="Secondary button label"><TextInput name="ctaSecondary" defaultValue={site.ctaSecondary || ''} placeholder="Contact Us" /></Field>
          </div>
        </Card>

        <StickyActions>
          <SubmitButton>Save home page</SubmitButton>
        </StickyActions>
      </form>
    </div>
  )
}
