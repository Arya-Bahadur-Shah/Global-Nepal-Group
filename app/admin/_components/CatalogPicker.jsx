'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'

/* Multi-select catalog picker used in the industry editor for Clients and
   Products. Options come from a shared catalog (name + image); the chosen
   values are submitted as repeated hidden `name` fields, read back on the
   server with formData.getAll(name). Any pre-selected value that is no longer
   in the catalog is still shown (as a removable chip) so existing data is
   never silently dropped. */
export default function CatalogPicker({
  name,
  options = [],
  initial = [],
  addHref,
  addLabel = 'Add new',
  searchPlaceholder = 'Search…',
  emptyText = 'Nothing in the catalog yet.',
}) {
  const [selected, setSelected] = useState(() => initial.filter(Boolean))
  const [query, setQuery] = useState('')

  const toggle = (value) =>
    setSelected((s) => (s.includes(value) ? s.filter((v) => v !== value) : [...s, value]))

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter(
      (o) => o.label.toLowerCase().includes(q) || (o.sub || '').toLowerCase().includes(q)
    )
  }, [options, query])

  const optionByValue = useMemo(() => {
    const m = new Map()
    for (const o of options) m.set(o.value, o)
    return m
  }, [options])

  return (
    <div>
      {/* Submitted values */}
      {selected.map((v) => (
        <input key={v} type="hidden" name={name} value={v} />
      ))}

      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="mb-2.5 flex flex-wrap gap-1.5">
          {selected.map((v) => {
            const opt = optionByValue.get(v)
            return (
              <span
                key={v}
                className="inline-flex items-center gap-1.5 rounded-lg border border-cloud bg-mist px-2 py-1 text-xs text-ocean"
              >
                {opt?.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={opt.image} alt="" className="h-4 w-4 flex-shrink-0 object-contain" />
                )}
                <span className="max-w-[14rem] truncate">{v}</span>
                <button
                  type="button"
                  onClick={() => toggle(v)}
                  aria-label={`Remove ${v}`}
                  className="text-steel transition-colors hover:text-crimson"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </span>
            )
          })}
        </div>
      )}

      {/* Search + add-new */}
      <div className="mb-2.5 flex items-center gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={searchPlaceholder}
          className="admin-input-focus flex-1 rounded-xl border border-cloud bg-mist/60 px-3.5 py-2.5 text-sm text-ocean placeholder:text-steel/50"
        />
        {addHref && (
          <Link
            href={addHref}
            target="_blank"
            className="admin-btn-press inline-flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl border border-dashed border-cloud px-3 py-2.5 text-sm font-medium text-steel transition-colors hover:border-ocean/40 hover:bg-mist hover:text-ocean"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            {addLabel}
          </Link>
        )}
      </div>

      {/* Options list */}
      <div className="max-h-72 divide-y divide-cloud overflow-y-auto rounded-xl border border-cloud">
        {options.length === 0 ? (
          <p className="p-4 text-sm text-steel">{emptyText}</p>
        ) : filtered.length === 0 ? (
          <p className="p-4 text-sm text-steel">No matches for &ldquo;{query}&rdquo;.</p>
        ) : (
          filtered.map((o) => {
            const isSel = selected.includes(o.value)
            return (
              <button
                type="button"
                key={o.value}
                onClick={() => toggle(o.value)}
                className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors ${isSel ? 'bg-crimson/5' : 'hover:bg-mist'}`}
              >
                <span className={`grid h-5 w-5 flex-shrink-0 place-items-center rounded-md border transition-colors ${isSel ? 'border-crimson bg-crimson text-white' : 'border-cloud bg-white'}`}>
                  {isSel && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </span>
                <span className="grid h-9 w-9 flex-shrink-0 place-items-center overflow-hidden rounded-lg border border-cloud bg-white">
                  {o.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={o.image} alt="" className="h-full w-full object-contain p-0.5" />
                  ) : (
                    <span className="font-display text-xs font-bold text-steel">{o.label.charAt(0)}</span>
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-ocean">{o.label}</span>
                  {o.sub && <span className="block truncate text-[11px] text-steel">{o.sub}</span>}
                </span>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
