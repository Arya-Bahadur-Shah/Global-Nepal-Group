import { redirect, notFound } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getPostById, updatePost, deletePost, slugify } from '@/lib/admin-data'
import { saveUpload } from '@/lib/upload'
import { Field, TextInput, TextArea, FileInput, Card, StickyActions } from '../../../_components/fields'
import SubmitButton from '../../../_components/SubmitButton'
import DeleteButton from '../../../_components/DeleteButton'

export const metadata = { title: 'Edit post — Admin' }

export default async function EditPostPage({ params, searchParams }) {
  const id = Number(params.id)
  const post = await getPostById(id)
  if (!post) notFound()

  async function update(formData) {
    'use server'
    const existing = await getPostById(id)
    if (!existing) notFound()

    const title = formData.get('title')?.toString().trim()
    const slug = existing.slug || slugify(title)

    const image = await saveUpload(formData.get('image'), 'posts', 'image')
    if (image.error) redirect(`/admin/posts/${id}/edit?error=${encodeURIComponent(image.error)}`)

    const { ok, error } = await updatePost(id, {
      slug, title,
      category: formData.get('category')?.toString() || null,
      date: formData.get('date')?.toString() || existing.date,
      excerpt: formData.get('excerpt')?.toString() || null,
      image: image.path || existing.image,
      body: formData.get('body')?.toString() || '',
    })
    if (!ok) redirect(`/admin/posts/${id}/edit?error=${encodeURIComponent(error)}`)

    revalidatePath('/admin/posts')
    revalidatePath('/blog')
    redirect('/admin/posts')
  }

  async function remove() {
    'use server'
    await deletePost(id)
    revalidatePath('/admin/posts')
    revalidatePath('/blog')
    redirect('/admin/posts')
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-ocean text-2xl">Edit blog post</h1>
        <DeleteButton action={remove} />
      </div>
      {searchParams?.error && <p className="mt-4 rounded-lg bg-rose px-3.5 py-2.5 text-sm text-crimsonDeep">{searchParams.error}</p>}

      <form action={update} className="mt-6 space-y-6 pb-2">
        <Card title="Basic info">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Title *"><TextInput name="title" defaultValue={post.title} required /></Field>
            <Field label="Category"><TextInput name="category" defaultValue={post.category} /></Field>
          </div>
          <Field label="Date"><TextInput name="date" type="date" defaultValue={post.date} /></Field>
        </Card>

        <Card title="Content">
          <Field label="Excerpt"><TextArea name="excerpt" rows={2} defaultValue={post.excerpt} /></Field>
          <Field label="Body" hint={'Markdown: "## Heading" for headings, blank line between paragraphs, "- " for bullets, **bold** for emphasis'}>
            <TextArea name="body" rows={16} defaultValue={post.body} />
          </Field>
        </Card>

        <Card title="Media" description="Cover photo rendered on blog cards and post header.">
          <Field label="Cover image">
            <FileInput name="image" accept="image/*" current={post.image} locationHint="Shown on /blog listing card & post header" aspectHint="16:9 ratio (1200×675 px)" />
          </Field>
        </Card>

        <StickyActions>
          <SubmitButton>Save changes</SubmitButton>
        </StickyActions>
      </form>
    </div>
  )
}
