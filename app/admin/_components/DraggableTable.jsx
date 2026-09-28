'use client'
/**
 * DraggableTable
 * Wraps any admin list table and adds:
 *   – a drag handle column so rows can be reordered by dragging
 *   – ↑ / ↓ arrow buttons for keyboard-friendly reordering
 *
 * Props:
 *   table          {string}         – 'industrial-solutions' | 'industries' | 'solutions'
 *   initialRows    {Array<{id, cells: ReactNode[], actions: ReactNode}>}
 *                  rows must carry pre-rendered cell & action content so this
 *                  client component never has to call server-only code.
 *   headers        {string[]}       – column header labels
 */
import { useCallback, useRef, useState } from 'react'

export default function DraggableTable({ table, initialRows, headers }) {
  const [rows, setRows] = useState(initialRows)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState(null)

  /* drag state refs — no re-render needed */
  const dragIndex = useRef(null)
  const dragOverIndex = useRef(null)

  /* ---- persist new order to the API ---- */
  const persist = useCallback(
    async (newRows) => {
      setSaving(true)
      setSaved(false)
      setError(null)
      try {
        const res = await fetch('/api/admin/reorder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ table, ids: newRows.map((r) => r.id) }),
        })
        if (!res.ok) {
          const txt = await res.text()
          throw new Error(txt || `HTTP ${res.status}`)
        }
        setSaved(true)
        setTimeout(() => setSaved(false), 2200)
      } catch (e) {
        setError(e.message || 'Failed to save order')
      } finally {
        setSaving(false)
      }
    },
    [table]
  )

  /* ---- move a row from index `from` to index `to` ---- */
  const move = useCallback(
    (from, to) => {
      if (from === to) return
      const next = [...rows]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      setRows(next)
      persist(next)
    },
    [rows, persist]
  )

  const moveUp   = (i) => { if (i > 0)               move(i, i - 1) }
  const moveDown = (i) => { if (i < rows.length - 1) move(i, i + 1) }

  /* ---- drag-and-drop handlers ---- */
  const clearDropIndicators = () =>
    document.querySelectorAll('[data-drag-row]').forEach((el) =>
      el.classList.remove('border-t-2', 'border-t-ocean')
    )

  const onDragStart = (e, i) => {
    dragIndex.current = i
    e.dataTransfer.effectAllowed = 'move'
    e.currentTarget.classList.add('opacity-40')
  }
  const onDragEnd = (e) => {
    e.currentTarget.classList.remove('opacity-40')
    clearDropIndicators()
    dragIndex.current = null
    dragOverIndex.current = null
  }
  const onDragOver = (e, i) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragOverIndex.current !== i) {
      clearDropIndicators()
      dragOverIndex.current = i
      e.currentTarget.classList.add('border-t-2', 'border-t-ocean')
    }
  }
  const onDrop = (e, i) => {
    e.preventDefault()
    clearDropIndicators()
    const from = dragIndex.current
    if (from !== null && from !== i) move(from, i)
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-cloud bg-white overflow-hidden">
        <p className="p-6 text-sm text-steel">Nothing here yet.</p>
      </div>
    )
  }

  return (
    <div>
      {/* status strip */}
      <div className="h-6 mb-2 flex items-center gap-2 text-xs">
        {saving && (
          <span className="inline-flex items-center gap-1.5 text-steel">
            <span className="admin-spinner h-3 w-3 rounded-full border-2 border-ocean/30 border-t-ocean" />
            Saving order…
          </span>
        )}
        {saved && !saving && (
          <span className="text-emerald-600 font-medium flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Order saved
          </span>
        )}
        {error && !saving && (
          <span className="text-crimson">{error}</span>
        )}
      </div>

      <div className="rounded-xl border border-cloud bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-cloud text-left font-mono text-[11px] tracking-widest uppercase text-steel">
              {/* drag-handle header */}
              <th className="p-4 w-12">
                <svg className="w-4 h-4 text-cloud mx-auto" viewBox="0 0 20 20" fill="currentColor">
                  <circle cx="7" cy="5" r="1.4" /><circle cx="13" cy="5" r="1.4" />
                  <circle cx="7" cy="10" r="1.4" /><circle cx="13" cy="10" r="1.4" />
                  <circle cx="7" cy="15" r="1.4" /><circle cx="13" cy="15" r="1.4" />
                </svg>
              </th>
              {headers.map((h) => (
                <th key={h} className="p-4">{h}</th>
              ))}
              <th className="p-4" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row.id}
                data-drag-row
                draggable
                className="border-b border-cloud last:border-0 transition-colors hover:bg-mist/40"
                onDragStart={(e) => onDragStart(e, i)}
                onDragEnd={onDragEnd}
                onDragOver={(e) => onDragOver(e, i)}
                onDrop={(e) => onDrop(e, i)}
              >
                {/* drag handle + up/down arrows */}
                <td className="p-3 select-none">
                  <div className="flex flex-col items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => moveUp(i)}
                      disabled={i === 0}
                      title="Move up"
                      className="group p-0.5 rounded transition-colors hover:bg-ocean/10 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <svg className="w-3 h-3 text-steel group-hover:text-ocean" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                      </svg>
                    </button>

                    {/* six-dot grip */}
                    <span className="cursor-grab active:cursor-grabbing" title="Drag to reorder">
                      <svg className="w-4 h-4 text-steel/40" viewBox="0 0 20 20" fill="currentColor">
                        <circle cx="7" cy="7" r="1.3" /><circle cx="13" cy="7" r="1.3" />
                        <circle cx="7" cy="10" r="1.3" /><circle cx="13" cy="10" r="1.3" />
                        <circle cx="7" cy="13" r="1.3" /><circle cx="13" cy="13" r="1.3" />
                      </svg>
                    </span>

                    <button
                      type="button"
                      onClick={() => moveDown(i)}
                      disabled={i === rows.length - 1}
                      title="Move down"
                      className="group p-0.5 rounded transition-colors hover:bg-ocean/10 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <svg className="w-3 h-3 text-steel group-hover:text-ocean" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </td>

                {/* pre-rendered cell content from server */}
                {row.cells.map((cell, ci) => (
                  <td key={ci} className="p-4">{cell}</td>
                ))}

                {/* pre-rendered action buttons from server */}
                <td className="p-4 text-right whitespace-nowrap">{row.actions}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
