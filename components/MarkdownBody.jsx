/* ============================================================
   MARKDOWN BODY RENDERER
   Renders a blog post's Markdown `body` (see lib/markdown.js) with
   the same look the article page has always used: headings, prose
   paragraphs, and bullet lists — rendered as benefit-style cards
   when they match "**Title** — description".
   ============================================================ */
import { Reveal } from '@/components/ui'
import { parseMarkdown, parseListItem, splitInlineBold } from '@/lib/markdown'

function Bold({ text }) {
  return splitInlineBold(text).map((part, i) =>
    part.bold ? <strong key={i} className="font-semibold text-ocean">{part.text}</strong> : <span key={i}>{part.text}</span>
  )
}

export default function MarkdownBody({ body }) {
  const blocks = parseMarkdown(body)

  return (
    <>
      {blocks.map((block, i) => {
        if (block.type === 'heading') {
          return (
            <Reveal key={i}>
              <h2 className="font-display font-bold text-ocean text-2xl sm:text-3xl tracking-tight mt-12 mb-4 first:mt-0">
                {block.text}
              </h2>
            </Reveal>
          )
        }
        if (block.type === 'list') {
          const asBenefits = block.items.every((item) => parseListItem(item))
          return (
            <Reveal key={i} delay={0.05}>
              <div className="space-y-3 mb-6">
                {block.items.map((item, bi) => {
                  const benefit = asBenefits ? parseListItem(item) : null
                  if (benefit) {
                    return (
                      <div key={bi} className="flex gap-4 rounded-xl border border-cloud bg-white p-4 hover:border-azure/50 hover:shadow-sm transition-all duration-200">
                        <span className="mt-0.5 flex-shrink-0 h-5 w-5 rounded bg-gold/15 flex items-center justify-center">
                          <span className="block h-1.5 w-1.5 rounded-full bg-gold" />
                        </span>
                        <div>
                          <p className="font-semibold text-ocean text-sm"><Bold text={benefit.title} /></p>
                          <p className="text-steel text-sm leading-relaxed mt-0.5"><Bold text={benefit.desc} /></p>
                        </div>
                      </div>
                    )
                  }
                  return (
                    <div key={bi} className="flex gap-3">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-azure flex-shrink-0" />
                      <p className="text-steel text-base leading-relaxed"><Bold text={item} /></p>
                    </div>
                  )
                })}
              </div>
            </Reveal>
          )
        }
        return (
          <Reveal key={i}>
            <p className={i === 0
              ? 'text-base sm:text-lg text-ocean/90 leading-relaxed font-normal border-l-4 border-gold pl-5 mb-12'
              : 'text-steel text-base leading-relaxed mb-6'}>
              <Bold text={block.text} />
            </p>
          </Reveal>
        )
      })}
    </>
  )
}
