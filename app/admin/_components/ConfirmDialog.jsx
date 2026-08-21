'use client'
/* ============================================================
   CONFIRM DIALOG — the shared admin confirmation popup.

   Replaces the browser's native confirm() so every destructive or
   publishing action in /admin asks the same way, in brand styling.
   Purely presentational: the caller owns `open` and decides what
   onConfirm actually does.

   Accessibility: rendered as a focus-trapped alertdialog, Escape and
   the overlay both cancel, focus starts on Cancel (the safe action)
   and returns to the trigger on close. Background scroll is locked
   while it is open.
   ============================================================ */
import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const TONES = {
  /* Irreversible — deletes. */
  danger: {
    badge: 'bg-rose text-crimson',
    action: 'bg-gradient-to-r from-crimson to-crimsonBright shadow-crimson/25 hover:from-crimsonD hover:to-crimson',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  /* Reversible but public — saves, publishes, sign-out. */
  primary: {
    badge: 'bg-mist text-ocean',
    action: 'bg-gradient-to-r from-ocean to-marine shadow-ocean/20 hover:from-crimson hover:to-crimsonBright',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
}

export default function ConfirmDialog({
  open,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'primary',
  onConfirm,
  onCancel,
}) {
  /* Portals need `document`, which doesn't exist during SSR. */
  const [mounted, setMounted] = useState(false)
  const panelRef = useRef(null)
  const cancelRef = useRef(null)
  const restoreRef = useRef(null)
  const id = useId()

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!open) return
    restoreRef.current = document.activeElement
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    cancelRef.current?.focus()
    return () => {
      document.body.style.overflow = prevOverflow
      /* Put focus back on the button that opened the dialog. */
      restoreRef.current?.focus?.()
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKeyDown(e) {
      if (e.key === 'Escape') {
        e.preventDefault()
        onCancel?.()
        return
      }
      if (e.key !== 'Tab') return
      /* Keep Tab inside the panel — the two buttons are the only stops. */
      const stops = panelRef.current?.querySelectorAll('button:not([disabled])')
      if (!stops?.length) return
      const first = stops[0]
      const last = stops[stops.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onCancel])

  if (!mounted || !open) return null
  const t = TONES[tone] ?? TONES.primary

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="admin-modal-overlay absolute inset-0 bg-abyss/50 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        aria-describedby={message ? `${id}-message` : undefined}
        className="admin-modal-panel relative w-full max-w-md rounded-2xl border border-cloud bg-white p-6 shadow-2xl shadow-abyss/25"
      >
        <div className="flex gap-4">
          <span className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${t.badge}`}>
            {t.icon}
          </span>
          <div className="min-w-0 pt-0.5">
            <h2 id={`${id}-title`} className="font-display text-base font-bold text-ocean">
              {title}
            </h2>
            {message && (
              <p id={`${id}-message`} className="mt-1.5 text-sm leading-relaxed text-steel">
                {message}
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className="admin-btn-press rounded-xl border border-cloud bg-white px-4 py-2.5 text-sm font-semibold text-ocean transition-colors hover:bg-mist"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`admin-btn-press rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all ${t.action}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
