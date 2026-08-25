import { redirect } from 'next/navigation'
import { requireSession } from '@/lib/auth'
import { revalidateContent } from '@/lib/revalidate'
import { createPost, slugify } from '@/lib/admin-data'
import { saveUpload } from '@/lib/upload'
import { Field, TextInput, TextArea, FileInput, Card, StickyActions } from '../../_components/fields'
import SubmitButton from '../../_components/SubmitButton'

export const metadata = { title: 'New post — Admin' }

export default async function NewPostPage({ searchParams }) {
  async function create(formData) {
    'use server'
    await requireSession()
    const title = formData.get('title')?.toString().trim()
    const slug = slugify(title)

    const image = await saveUpload(formData.get('image'), 'posts', 'image')
    if (image.error) redirect(`/admin/posts/new?error=${encodeURIComponent(image.error)}`)

    const { ok, error } = await createPost({
      slug, title,
      category: formData.get('category')?.toString() || null,
      date: formData.get('date')?.toString() || new Date().toISOString().slice(0, 10),
      excerpt: formData.get('excerpt')?.toString() || null,
      image: image.path,
      body: formData.get('body')?.toString() || '',
    })
    if (!ok) redirect(`/admin/posts/new?error=${encodeURIComponent(error)}`)

    revalidateContent('posts', '/admin/posts')
    redirect('/admin/posts')
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-display font-bold text-ocean text-2xl">New blog post</h1>
      {searchParams?.error && <p className="mt-4 rounded-lg bg-rose px-3.5 py-2.5 text-sm text-crimsonDeep">{searchParams.error}</p>}

      <form action={create} className="mt-6 space-y-6 pb-2">
        <Card title="Basic info">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Title *"><TextInput name="title" required placeholder="Article title..." /></Field>
            <Field label="Category" hint="e.g. RFID, Software, Identity"><TextInput name="category" /></Field>
          </div>
          <Field label="Date"><TextInput name="date" type="date" /></Field>
        </Card>

        <Card title="Content">
          <Field label="Excerpt" hint="Short teaser shown on the blog listing"><TextArea name="excerpt" rows={2} /></Field>
          <Field label="Body" hint={'Markdown: "## Heading" for headings, blank line between paragraphs, "- " for bullets, **bold** for emphasis'}>
            <TextArea name="body" rows={16} />
          </Field>
        </Card>

        <Card title="Media" description="Cover photo rendered on blog cards and post header.">
          <Field label="Cover image">
            <FileInput name="image" accept="image/*" locationHint="Shown on /blog listing card & post header" aspectHint="16:9 ratio (1200×675 px)" />
          </Field>
        </Card>

        <StickyActions>
          <SubmitButton>Publish post</SubmitButton>
        </StickyActions>
      </form>
    </div>
  )
}
