'use client'
import { useState } from 'react'

export default function FooterColumnsEditor({ initialColumns = [] }) {
  const [columns, setColumns] = useState(
    Array.isArray(initialColumns) && initialColumns.length > 0
      ? initialColumns
      : [
          {
            title: 'Software Solutions',
            href: '/software-solutions',
            links: [
              { label: 'Cubix', href: '/software-solutions/cubix' },
              { label: 'Activ', href: '/software-solutions/activ' },
            ],
          },
        ]
  )

  const handleAddColumn = () => {
    setColumns((prev) => [
      ...prev,
      {
        title: 'New Section',
        href: '',
        links: [{ label: 'Sample Link', href: '#' }],
      },
    ])
  }

  const handleRemoveColumn = (colIdx) => {
    setColumns((prev) => prev.filter((_, idx) => idx !== colIdx))
  }

  const handleMoveColumn = (colIdx, dir) => {
    setColumns((prev) => {
      const target = colIdx + dir
      if (target < 0 || target >= prev.length) return prev
      const updated = [...prev]
      const temp = updated[colIdx]
      updated[colIdx] = updated[target]
      updated[target] = temp
      return updated
    })
  }

  const handleUpdateColumnField = (colIdx, field, val) => {
    setColumns((prev) => {
      const updated = [...prev]
      updated[colIdx] = { ...updated[colIdx], [field]: val }
      return updated
    })
  }

  const handleAddLink = (colIdx) => {
    setColumns((prev) => {
      const updated = [...prev]
      const links = [...(updated[colIdx].links || []), { label: 'New Link', href: '#' }]
      updated[colIdx] = { ...updated[colIdx], links }
      return updated
    })
  }

  const handleUpdateLink = (colIdx, linkIdx, field, val) => {
    setColumns((prev) => {
      const updated = [...prev]
      const links = [...updated[colIdx].links]
      links[linkIdx] = { ...links[linkIdx], [field]: val }
      updated[colIdx] = { ...updated[colIdx], links }
      return updated
    })
  }

  const handleRemoveLink = (colIdx, linkIdx) => {
    setColumns((prev) => {
      const updated = [...prev]
      const links = updated[colIdx].links.filter((_, idx) => idx !== linkIdx)
      updated[colIdx] = { ...updated[colIdx], links }
      return updated
    })
  }

  return (
    <div className="space-y-6">
      {/* Hidden payload sent with form submit */}
      <input type="hidden" name="footerColumns" value={JSON.stringify(columns)} />

      <div className="flex items-center justify-between">
        <div>
          <p className="font-display font-bold text-ocean text-base">Footer Columns & Topics</p>
          <p className="text-xs text-steel mt-0.5">Add custom section titles (topics) and links that appear in the public site footer.</p>
        </div>
        <button
          type="button"
          onClick={handleAddColumn}
          className="inline-flex items-center gap-1.5 rounded-lg bg-mist hover:bg-cloud px-3 py-1.5 text-xs font-semibold text-ocean transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
          Add Topic / Column
        </button>
      </div>

      <div className="space-y-4">
        {columns.map((col, colIdx) => (
          <div key={colIdx} className="rounded-xl border border-cloud bg-mist/30 p-4 space-y-3">
            {/* Column Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cloud pb-3">
              <span className="font-mono text-xs font-bold text-crimson uppercase tracking-wider">
                Topic #{colIdx + 1}: {col.title || 'Untitled'}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleMoveColumn(colIdx, -1)}
                  disabled={colIdx === 0}
                  className="p-1 text-steel hover:text-ocean disabled:opacity-30 disabled:pointer-events-none"
                  title="Move Up"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 15l-6-6-6 6" /></svg>
                </button>
                <button
                  type="button"
                  onClick={() => handleMoveColumn(colIdx, 1)}
                  disabled={colIdx === columns.length - 1}
                  className="p-1 text-steel hover:text-ocean disabled:opacity-30 disabled:pointer-events-none"
                  title="Move Down"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6" /></svg>
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveColumn(colIdx)}
                  className="p-1 text-roseD hover:text-crimson transition-colors"
                  title="Remove Column"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 6l12 12M6 18L18 6" /></svg>
                </button>
              </div>
            </div>

            {/* Title & URL inputs */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-steel mb-1">Column Title (Topic Name)</label>
                <input
                  type="text"
                  value={col.title}
                  onChange={(e) => handleUpdateColumnField(colIdx, 'title', e.target.value)}
                  placeholder="e.g. Software Solutions"
                  className="w-full rounded-lg border border-cloud bg-white px-3 py-1.5 text-sm text-ocean focus:border-crimson focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-steel mb-1">Header Link (Optional URL)</label>
                <input
                  type="text"
                  value={col.href || ''}
                  onChange={(e) => handleUpdateColumnField(colIdx, 'href', e.target.value)}
                  placeholder="e.g. /software-solutions (leave empty if plain title)"
                  className="w-full rounded-lg border border-cloud bg-white px-3 py-1.5 text-sm text-ocean focus:border-crimson focus:outline-none"
                />
              </div>
            </div>

            {/* Links list inside column */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[11px] uppercase tracking-wider text-steel">Topic Links ({col.links?.length || 0})</span>
                <button
                  type="button"
                  onClick={() => handleAddLink(colIdx)}
                  className="text-xs text-crimson font-medium hover:underline flex items-center gap-1"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
                  Add Link
                </button>
              </div>

              <div className="space-y-2">
                {(col.links || []).map((link, linkIdx) => (
                  <div key={linkIdx} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-cloud">
                    <input
                      type="text"
                      value={link.label}
                      onChange={(e) => handleUpdateLink(colIdx, linkIdx, 'label', e.target.value)}
                      placeholder="Link Label"
                      className="w-1/2 rounded border border-cloud/70 px-2.5 py-1 text-xs text-ocean focus:border-crimson focus:outline-none"
                    />
                    <input
                      type="text"
                      value={link.href}
                      onChange={(e) => handleUpdateLink(colIdx, linkIdx, 'href', e.target.value)}
                      placeholder="Link URL (e.g. /about)"
                      className="w-1/2 rounded border border-cloud/70 px-2.5 py-1 text-xs text-ocean focus:border-crimson focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveLink(colIdx, linkIdx)}
                      className="p-1 text-steel hover:text-crimson shrink-0"
                      title="Remove Link"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 6l12 12M6 18L18 6" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
