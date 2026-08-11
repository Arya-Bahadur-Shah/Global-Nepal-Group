/* ============================================================
   BLOG POST DETAIL PAGE  /blog/[slug]
   Renders a full, rich article page for each post.
   ============================================================ */
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getPosts, getPost } from '@/lib/content'
import { Reveal, SectionKicker } from '@/components/ui'
import MarkdownBody from '@/components/MarkdownBody'

export async function generateStaticParams() {
  return (await getPosts()).map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }) {
  const post = (await getPosts()).find((p) => p.slug === params.slug)
  return { title: post ? `${post.title} — Global Nepal Group` : 'Insights' }
}

export default async function BlogPost({ params }) {
  const post = await getPost(params.slug)
  if (!post) notFound()

  return (
    <>
      {/* ── Hero Banner ── */}
      <section className="relative bg-abyss overflow-hidden" style={{ minHeight: '340px' }}>
        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src={post.image}
            alt={post.title}
            fill
            sizes="100vw"
            className="object-cover"
            style={{ filter: 'brightness(0.45) saturate(1.2)' }}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-abyss/90 via-abyss/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-abyss/60 via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="relative mx-auto max-w-content px-5 sm:px-8 pt-[100px] pb-14 flex flex-col justify-end min-h-[340px]">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 font-mono text-[11px] text-white/50 mb-5">
            <Link href="/" className="hover:text-gold transition-colors">Home</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-gold transition-colors">Insights</Link>
            <span>/</span>
            <span className="text-white/80 truncate max-w-[200px]">{post.title}</span>
          </nav>
          <Reveal>
            <span className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.26em] uppercase text-gold mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-crimson" />
              {post.category}
            </span>
            <h1 className="font-display font-extrabold text-white text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-tight max-w-3xl">
              {post.title}
            </h1>
            <p className="mt-4 font-mono text-xs text-white/50">{post.date}</p>
          </Reveal>
        </div>
      </section>

      {/* ── Article Body ── */}
      <section className="bg-paper py-16 lg:py-24">
        <div className="mx-auto max-w-content px-5 sm:px-8">
          <div className="grid lg:grid-cols-[1fr_300px] gap-12 items-start">

            {/* ── Main Content ── */}
            <article>
              <MarkdownBody body={post.body} />

              {/* Back link */}
              <Reveal>
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-azure hover:text-ocean transition-colors mt-4"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                    <path d="M19 12H5M11 6l-6 6 6 6" />
                  </svg>
                  Back to all articles
                </Link>
              </Reveal>
            </article>

            {/* ── Sidebar ── */}
            <aside className="space-y-6 lg:sticky lg:top-24">

              {/* CTA card */}
              <Reveal>
                <div className="rounded-2xl bg-ocean text-white p-7 shadow-xl">
                  <h3 className="font-display font-bold text-lg leading-snug mb-3">
                    Ready to trace every unit?
                  </h3>
                  <p className="text-white/75 text-sm leading-relaxed mb-5">
                    Tell us about your operation and we&rsquo;ll recommend the right mix of hardware and software.
                  </p>
                  <Link
                    href="/contact?type=demo"
                    className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-gold text-abyss text-sm font-bold py-3 px-5 hover:bg-yellow-400 transition-colors"
                  >
                    Request a Demo
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </Link>
                </div>
              </Reveal>

              {/* Article meta */}
              <Reveal delay={0.05}>
                <div className="rounded-2xl border border-cloud bg-white p-6">
                  <p className="font-mono text-[11px] tracking-widest uppercase text-steel mb-4">Article Info</p>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-steel">Category</span>
                      <span className="font-semibold text-azure">{post.category}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-steel">Published</span>
                      <span className="font-semibold text-ocean">{post.date}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-steel">Author</span>
                      <span className="font-semibold text-ocean">GNG Editorial</span>
                    </div>
                  </div>
                </div>
              </Reveal>

              {/* Other articles */}
              <Reveal delay={0.1}>
                <div className="rounded-2xl border border-cloud bg-white p-6">
                  <p className="font-mono text-[11px] tracking-widest uppercase text-steel mb-4">More Articles</p>
                  <div className="space-y-4">
                    {(await getPosts())
                      .filter((p) => p.slug !== params.slug)
                      .map((p) => (
                        <Link
                          key={p.slug}
                          href={`/blog/${p.slug}`}
                          className="group flex gap-3 items-start hover:opacity-80 transition-opacity"
                        >
                          <div className="relative flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-cloud">
                            <Image src={p.image} alt={p.title} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover" />
                          </div>
                          <div>
                            <p className="text-xs font-mono text-azure">{p.category}</p>
                            <p className="text-sm font-semibold text-ocean group-hover:text-crimson transition-colors leading-tight mt-0.5 line-clamp-2">
                              {p.title}
                            </p>
                          </div>
                        </Link>
                      ))}
                  </div>
                </div>
              </Reveal>
            </aside>
          </div>
        </div>
      </section>
    </>
  )
}
