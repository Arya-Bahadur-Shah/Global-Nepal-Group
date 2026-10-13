'use client'
import { useState } from 'react'

export default function PhoneNumbersEditor({ initialPhones = [] }) {
  const [phones, setPhones] = useState(
    Array.isArray(initialPhones) && initialPhones.length > 0
      ? initialPhones
      : ['']
  )

  const handleAdd = () => setPhones((prev) => [...prev, ''])

  const handleChange = (idx, val) =>
    setPhones((prev) => prev.map((p, i) => (i === idx ? val : p)))

  const handleRemove = (idx) =>
    setPhones((prev) => prev.filter((_, i) => i !== idx))

  const handleMove = (idx, dir) => {
    setPhones((prev) => {
      const target = idx + dir
      if (target < 0 || target >= prev.length) return prev
      const updated = [...prev]
      ;[updated[idx], updated[target]] = [updated[target], updated[idx]]
      return updated
    })
  }

  return (
    <div className="space-y-3">
      {/* Hidden payload */}
      <input type="hidden" name="phones" value={JSON.stringify(phones.filter(Boolean))} />

      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-widest text-steel">
          Phone Numbers ({phones.length})
        </span>
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-1.5 rounded-lg bg-mist hover:bg-cloud px-3 py-1.5 text-xs font-semibold text-ocean transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add Number
        </button>
      </div>

      <div className="space-y-2">
        {phones.map((phone, idx) => (
          <div key={idx} className="flex items-center gap-2">
            {/* Move buttons */}
            <div className="flex flex-col gap-0.5">
              <button
                type="button"
                onClick={() => handleMove(idx, -1)}
                disabled={idx === 0}
                className="p-0.5 text-steel hover:text-ocean disabled:opacity-25 disabled:pointer-events-none"
                title="Move Up"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 15l-6-6-6 6" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => handleMove(idx, 1)}
                disabled={idx === phones.length - 1}
                className="p-0.5 text-steel hover:text-ocean disabled:opacity-25 disabled:pointer-events-none"
                title="Move Down"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
            </div>

            <input
              type="tel"
              value={phone}
              onChange={(e) => handleChange(idx, e.target.value)}
              placeholder="+977 1 4XXXXXX"
              className="admin-input-focus flex-1 rounded-xl border border-cloud bg-mist/60 px-4 py-3 text-[15px] text-ocean placeholder:text-steel/50"
            />

            <button
              type="button"
              onClick={() => handleRemove(idx)}
              disabled={phones.length === 1}
              className="p-2 text-steel hover:text-crimson transition-colors disabled:opacity-25 disabled:pointer-events-none"
              title="Remove"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M6 6l12 12M6 18L18 6" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
