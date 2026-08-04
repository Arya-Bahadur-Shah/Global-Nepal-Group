/* ============================================================
   HOME SCENE 8 — INSIGHTS PREVIEW
   Latest three blog posts. Data from content/posts.json.
   ============================================================ */
import Image from 'next/image'
import Link from 'next/link'
import { Reveal, SectionKicker, ArrowIcon } from '@/components/ui'

export default function InsightsPreview({ posts }) {
  return (
    <section className="bg-mist py-24">
      <div className="mx-auto max-w-content px-5 sm:px-8">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-rose text-crimsonDeep border border-roseMid font-mono text-xs font-bold uppercase tracking-wider mb-2">
              Insights
            </div>
            <h2 className="mt-2 font-display font-extrabold text-ocean text-4xl sm:text-5xl tracking-tight">From the blog</h2>
          </div>
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-bold text-crimson hover:text-crimsonD transition-colors">All articles <ArrowIcon /></Link>
        </Reveal>
        <div className="mt-10 grid md:grid-cols-3 gap-6">
          {posts.map((post, i) => (
            <Reveal key={post.slug} delay={i * 0.07}>
              <Link
                href={`/blog/${post.slug}`}
                className="group block rounded-2xl bg-white border-2 border-cloud overflow-hidden hover:-translate-y-1.5 hover:border-crimson hover:shadow-xl transition-all duration-300 shadow-sm"
              >
                {/* BLOG IMAGE — from content layer */}
                <div className="relative aspect-[16/10] overflow-hidden bg-cloud">
                  <Image src={post.image} alt="" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 font-mono text-[11px] font-bold"><span className="text-crimson">{post.category}</span><span className="text-steel">·</span><span className="text-steel">{post.date}</span></div>
                  <h3 className="mt-2 font-display font-extrabold text-ocean text-lg leading-snug group-hover:text-crimson transition-colors">{post.title}</h3>
                  <p className="mt-2 text-sm text-steel leading-relaxed line-clamp-2 font-medium">{post.excerpt}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
