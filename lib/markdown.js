/* ============================================================
   MINIMAL MARKDOWN PARSER
   Blog post bodies are authored in the admin as plain Markdown
   (## headings, blank-line paragraphs, "- " bullet lists, **bold**).
   This is intentionally small — just enough for the admin's blog
   editor — not a general-purpose Markdown engine.
   ============================================================ */

const BENEFIT_RE = /^\*\*(.+?)\*\*\s*(?:—|--|-)\s*(.+)$/

export function parseMarkdown(md) {
  if (!md) return []
  const blocks = md.replace(/\r\n/g, '\n').split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean)

  return blocks.map((block) => {
    if (block.startsWith('## ')) {
      return { type: 'heading', text: block.slice(3).trim() }
    }
    const lines = block.split('\n').map((l) => l.trim())
    if (lines.length && lines.every((l) => l.startsWith('- '))) {
      return { type: 'list', items: lines.map((l) => l.slice(2).trim()) }
    }
    return { type: 'paragraph', text: block }
  })
}

/* Split "**Title** — description" list items (used for benefit-style bullets)
   from plain bullet text. */
export function parseListItem(item) {
  const m = item.match(BENEFIT_RE)
  if (m) return { title: m[1], desc: m[2] }
  return null
}

/* Render inline **bold** segments as an array of strings/elements-ready parts.
   Consumers pass this to React; kept dependency-free (no dangerouslySetInnerHTML). */
export function splitInlineBold(text) {
  const parts = []
  let rest = text
  const re = /\*\*(.+?)\*\*/
  let match
  while ((match = re.exec(rest))) {
    if (match.index > 0) parts.push({ bold: false, text: rest.slice(0, match.index) })
    parts.push({ bold: true, text: match[1] })
    rest = rest.slice(match.index + match[0].length)
  }
  if (rest) parts.push({ bold: false, text: rest })
  return parts
}
