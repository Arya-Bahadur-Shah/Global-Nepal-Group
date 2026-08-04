import Link from 'next/link'
import { revalidatePath } from 'next/cache'
import { listPosts, deletePost } from '@/lib/admin-data'
import DeleteButton from '../_components/DeleteButton'

export const metadata = { title: 'Blog posts — Admin' }

export default function AdminPostsPage() {
  const posts = listPosts()

  async function remove(id) {
    'use server'
    deletePost(id)
    revalidatePath('/admin/posts')
    revalidatePath('/blog')
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-ocean text-2xl">Blog posts</h1>
        <Link href="/admin/posts/new" className="rounded-lg bg-ocean px-4 py-2.5 text-sm font-semibold text-white hover:bg-crimson transition-colors">+ New post</Link>
      </div>

      <div className="mt-6 rounded-xl border border-cloud bg-white overflow-hidden">
        {posts.length === 0 ? (
          <p className="p-6 text-sm text-steel">No posts yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cloud text-left font-mono text-[11px] tracking-widest uppercase text-steel">
                <th className="p-4">Title</th>
                <th className="p-4">Category</th>
                <th className="p-4">Date</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id} className="border-b border-cloud last:border-0">
                  <td className="p-4 font-medium text-ocean max-w-sm truncate">{p.title}</td>
                  <td className="p-4 text-steel">{p.category}</td>
                  <td className="p-4 text-steel whitespace-nowrap">{p.date}</td>
                  <td className="p-4 text-right whitespace-nowrap">
                    <Link href={`/admin/posts/${p.id}/edit`} className="text-sm font-medium text-azure hover:text-ocean transition-colors mr-4">Edit</Link>
                    <DeleteButton action={remove.bind(null, p.id)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
