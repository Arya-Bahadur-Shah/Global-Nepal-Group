import Link from 'next/link'
import { getPosts } from '@/lib/content'
import { Reveal, SectionKicker } from '@/components/ui'

export const metadata = { title: 'Insights — Global Nepal Group' }

/* Blog listing — posts come from the CMS layer (content/posts.json today,
   the Sanity `post` schema later: rich text, featured image, categories,
   tags and SEO fields all editable there). */
export default function Blog() {
  const posts = getPosts()
  return (
    <>
      <section className="relative bg-white pt-[68px] overflow-hidden">
        <div className="absolute inset-0 gridlines" />
        <div className="relative mx-auto max-w-content px-5 sm:px-8 py-20">
          <Reveal className="max-w-2xl">
            <SectionKicker>Insights</SectionKicker>
            <h1 className="mt-4 font-display font-extrabold text-ocean text-5xl sm:text-6xl tracking-tight">Blog</h1>
            <p className="mt-5 text-lg text-steel">Company updates and articles on industrial automation and RFID in Nepal.</p>
          </Reveal>
        </div>
      </section>
      <section className="bg-mist py-16">
        <div className="mx-auto max-w-content px-5 sm:px-8 grid md:grid-cols-3 gap-6">
          {posts.map((p, i) => (
            <Reveal key={p.slug} delay={(i % 3) * 0.06}>
              <Link
                href={`/blog/${p.slug}`}
                className="group block h-full rounded-2xl bg-white border border-cloud overflow-hidden hover:-translate-y-1.5 hover:shadow-[0_30px_60px_-30px_rgba(10,37,64,.4)] transition-all duration-300"
              >
                {/* ===== BLOG IMAGE ===== featured image from the CMS layer */}
                <div className="aspect-[16/10] overflow-hidden bg-cloud">
                  <img src={p.image} alt={p.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 font-mono text-[11px] text-steel"><span className="text-azure">{p.category}</span><span>·</span><span>{p.date}</span></div>
                  <h2 className="mt-2 font-display font-bold text-ocean text-lg leading-snug group-hover:text-crimson transition-colors">{p.title}</h2>
                  <p className="mt-2 text-sm text-steel leading-relaxed">{p.excerpt}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  )
}
