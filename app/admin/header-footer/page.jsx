import { redirect } from 'next/navigation'
import { requireSession } from '@/lib/auth'
import { revalidateContent } from '@/lib/revalidate'
import { getSite } from '@/lib/content'
import { updateHeaderFooterSettings } from '@/lib/admin-data'
import { Field, TextInput, TextArea, Card, StickyActions } from '../_components/fields'
import BlobFileInput from '../_components/BlobFileInput'
import SubmitButton from '../_components/SubmitButton'

export const metadata = { title: 'Header & Footer — Admin' }

export default async function AdminHeaderFooterPage({ searchParams }) {
  const site = await getSite()

  async function saveHeaderFooter(formData) {
    'use server'
    await requireSession()

    const newLogoUrl = formData.get('logo')?.toString().trim() || null
    const newFaviconUrl = formData.get('favicon')?.toString().trim() || null

    const { ok, error } = await updateHeaderFooterSettings({
      company: formData.get('company')?.toString().trim() || null,
      tagline: formData.get('tagline')?.toString().trim() || null,
      address: formData.get('address')?.toString().trim() || null,
      phone: formData.get('phone')?.toString().trim() || null,
      email: formData.get('email')?.toString().trim() || null,
      copyright: formData.get('copyright')?.toString().trim() || null,
      logo: newLogoUrl,
      favicon: newFaviconUrl,
    })

    if (!ok) {
      redirect(`/admin/header-footer?error=${encodeURIComponent(error)}`)
    }

    revalidateContent('site', '/admin/header-footer')
    redirect('/admin/header-footer?success=1')
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-display font-bold text-ocean text-2xl">Header & Footer Settings</h1>
      <p className="mt-1 text-sm text-steel">Manage site logo, browser favicon, company name, contact info, and copyright notice.</p>

      {searchParams?.error && <p className="mt-4 rounded-lg bg-rose px-3.5 py-2.5 text-sm text-crimsonDeep">{searchParams.error}</p>}
      {searchParams?.success && <p className="mt-4 rounded-lg bg-mist px-3.5 py-2.5 text-sm text-ocean">Header and footer updated successfully.</p>}

      <form action={saveHeaderFooter} className="mt-6 space-y-6 pb-2">
        <Card title="Header & Branding" description="Set the website logo, browser favicon tab icon, and company name.">
          <div className="space-y-4">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-widest text-steel mb-2">Current Site Logo</p>
              <div className="flex items-center gap-4">
                <div className="rounded-xl border border-cloud bg-mist/50 p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={site.logo} alt="Site logo" className="h-10 w-auto object-contain" />
                </div>
                <p className="font-mono text-[11px] text-steel break-all">{site.logo}</p>
              </div>
            </div>

            <Field label="Replace Site Logo" hint="PNG with transparent background works best. Shows in header and footer.">
              <BlobFileInput name="logo" accept="image/*" kind="image" locationHint="Site Header & Footer" aspectHint="PNG, transparent, ~300×90" />
            </Field>

            <hr className="border-cloud my-4" />

            <div>
              <p className="font-mono text-[11px] uppercase tracking-widest text-steel mb-2">Current Browser Favicon Icon</p>
              <div className="flex items-center gap-4">
                <div className="rounded-xl border border-cloud bg-mist/50 p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={site.favicon} alt="Browser favicon" className="h-8 w-8 object-contain" />
                </div>
                <p className="font-mono text-[11px] text-steel break-all">{site.favicon}</p>
              </div>
            </div>

            <Field label="Replace Browser Favicon" hint="Upload a square icon (PNG, ICO, SVG or WebP). If left empty, site logo will be used as favicon automatically.">
              <BlobFileInput name="favicon" accept="image/*" kind="image" locationHint="Browser Tab Favicon & Apple Icon" aspectHint="Square 32x32 to 512x512" />
            </Field>

            <hr className="border-cloud my-4" />

            <Field label="Company Name" hint="Brand name shown in header and footer">
              <TextInput name="company" defaultValue={site.company || 'Global Nepal Group'} placeholder="Global Nepal Group" />
            </Field>
          </div>
        </Card>

        <Card title="Footer Contact & Information" description="Set contact details, tagline summary, and footer copyright text.">
          <Field label="Tagline / Summary" hint="Short paragraph shown under logo in footer">
            <TextArea name="tagline" rows={3} defaultValue={site.tagline || ''} placeholder="Track, Trace & Identity for Nepali industry..." />
          </Field>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Address">
              <TextInput name="address" defaultValue={site.address || ''} placeholder="Kathmandu, Nepal" />
            </Field>
            <Field label="Phone">
              <TextInput name="phone" defaultValue={site.phone || ''} placeholder="+977 1 4XXXXXX" />
            </Field>
          </div>

          <Field label="Email">
            <TextInput name="email" defaultValue={site.email || ''} placeholder="info@globalnepalgroup.com" />
          </Field>

          <Field label="Footer Copyright Notice" hint="Copyright line displayed at the bottom of every page">
            <TextInput name="copyright" defaultValue={site.copyright || ''} placeholder="© 2026 Global Nepal Group. All rights reserved." />
          </Field>
        </Card>

        <StickyActions>
          <SubmitButton>Save Header & Footer</SubmitButton>
        </StickyActions>
      </form>
    </div>
  )
}
