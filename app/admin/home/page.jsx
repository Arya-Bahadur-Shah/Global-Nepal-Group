import { redirect } from 'next/navigation'
import { requireSession } from '@/lib/auth'
import { revalidateContent } from '@/lib/revalidate'
import { getSite } from '@/lib/content'
import { updateHomeSettings, parseLines } from '@/lib/admin-data'
import { Field, TextInput, TextArea, Card, StickyActions } from '../_components/fields'
import BlobFileInput from '../_components/BlobFileInput'
import SubmitButton from '../_components/SubmitButton'

export const metadata = { title: 'Home page — Admin' }

export default async function AdminHomePage({ searchParams }) {
  const site = await getSite()
  const clips = site.heroVideos || []

  async function save(formData) {
    'use server'
    await requireSession()
    // BlobFileInput: files are uploaded direct from browser to Blob before submit.
    const newUploadedClips = formData.getAll('newVideos').map(u => u?.toString().trim()).filter(Boolean)
    const listed = parseLines(formData.get('videoList'))
    const heroVideos = [...listed, ...newUploadedClips]

    const newLogoUrl = formData.get('logo')?.toString().trim() || null

    const { ok, error } = await updateHomeSettings({
      heroSub: formData.get('heroSub')?.toString().trim() || null,
      ctaPrimary: formData.get('ctaPrimary')?.toString().trim() || null,
      ctaSecondary: formData.get('ctaSecondary')?.toString().trim() || null,
      heroVideos,
      logo: newLogoUrl,
    })
    if (!ok) redirect(`/admin/home?error=${encodeURIComponent(error)}`)

    revalidateContent('site', '/admin/home')
    redirect('/admin/home?success=1')
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-display font-bold text-ocean text-2xl">Home page</h1>
      <p className="mt-1 text-sm text-steel">Manage the hero background video loop and the headline call-to-action copy.</p>

      {searchParams?.error && <p className="mt-4 rounded-lg bg-rose px-3.5 py-2.5 text-sm text-crimsonDeep">{searchParams.error}</p>}
      {searchParams?.success && <p className="mt-4 rounded-lg bg-mist px-3.5 py-2.5 text-sm text-ocean">Home page updated.</p>}

      <form action={save} className="mt-6 space-y-6 pb-2">
        <Card title="Site logo" description="Shown in the header and footer on every page. Leave empty to keep the current one.">
          <div className="flex items-center gap-5">
            <div className="rounded-xl border border-cloud bg-mist/50 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element --
                  a plain <img> here on purpose: next/image caches an
                  optimised copy for 30 days (see next.config.mjs), so a
                  freshly uploaded logo would keep showing the old one in
                  this preview. */}
              <img src={site.logo} alt="Current logo" className="h-12 w-auto object-contain" />
            </div>
            <p className="font-mono text-[11px] text-steel break-all">{site.logo}</p>
          </div>

          <Field label="Replace logo" hint="PNG with a transparent background works best. Around 300×90 or wider; it renders about 40px tall.">
            <BlobFileInput name="logo" accept="image/*" kind="image" locationHint="Header and footer" aspectHint="PNG, transparent, roughly 300×90" />
          </Field>
        </Card>

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
            <BlobFileInput name="newVideos" accept="video/*" kind="video" multiple locationHint="Home hero background loop" aspectHint="MP4, 1080p 16:9, short loop" />
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
