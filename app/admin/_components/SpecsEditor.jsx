'use client'
import { useState } from 'react'

/* Row-based specs editor. Each row is a Property + Value pair, submitted as
   repeated `specKey` / `specValue` form fields — the server action zips them
   back into an object via parseSpecPairs(). No colon syntax to remember. */

const cell = 'admin-input-focus w-full rounded-xl border border-cloud bg-mist/60 px-3.5 py-2.5 text-[15px] text-ocean placeholder:text-steel/50'

export default function SpecsEditor({ initial = {} }) {
  const seed = Object.entries(initial || {}).map(([key, value]) => ({ key, value: String(value ?? '') }))
  const [rows, setRows] = useState(seed.length ? seed : [{ key: '', value: '' }])

  const update = (i, field, val) => setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, [field]: val } : r)))
  const addRow = () => setRows((rs) => [...rs, { key: '', value: '' }])
  const removeRow = (i) =>
    setRows((rs) => (rs.length === 1 ? [{ key: '', value: '' }] : rs.filter((_, idx) => idx !== i)))

  return (
    <div className="space-y-2.5">
      {rows.map((row, i) => (
        <div key={i} className="admin-fade-in flex items-center gap-2">
          <input
            name="specKey"
            value={row.key}
            onChange={(e) => update(i, 'key', e.target.value)}
            placeholder="Property (e.g. Print speed)"
            className={`${cell} sm:basis-2/5`}
          />
          <input
            name="specValue"
            value={row.value}
            onChange={(e) => update(i, 'value', e.target.value)}
            placeholder="Value (e.g. up to 14 in/s)"
            className={`${cell} flex-1`}
          />
          <button
            type="button"
            onClick={() => removeRow(i)}
            aria-label="Remove spec"
            className="admin-btn-press grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl border border-cloud text-steel transition-colors hover:border-crimson/40 hover:bg-rose hover:text-crimson"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addRow}
        className="admin-btn-press inline-flex items-center gap-1.5 rounded-xl border border-dashed border-cloud px-3.5 py-2 text-sm font-medium text-steel transition-colors hover:border-ocean/40 hover:bg-mist hover:text-ocean"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Add spec
      </button>
    </div>
  )
}
