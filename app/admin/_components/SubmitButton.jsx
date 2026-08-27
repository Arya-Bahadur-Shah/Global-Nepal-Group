'use client'
/* Save/create button with an optional confirmation popup.

   Confirmation is ON by default, because every save in this panel writes
   straight to the live public site. Pass confirm={false} where a popup
   would only get in the way (e.g. signing in). */
import { useRef, useState } from 'react'
import { useFormStatus } from 'react-dom'
import ConfirmDialog from './ConfirmDialog'

export default function SubmitButton({
  children = 'Save',
  confirm = true,
  confirmTitle,
  confirmMessage = 'Your changes will go live on the public website right away.',
  confirmLabel,
}) {
  const { pending } = useFormStatus()
  const btnRef = useRef(null)
  const [open, setOpen] = useState(false)

  /* Button labels are plain strings throughout the panel, so they make a
     good default dialog title ("Save changes" -> "Save changes?"). */
  const label = typeof children === 'string' ? children : 'Save'

  function handleClick(e) {
    const form = btnRef.current?.form
    if (form) {
      const isUploading = form.querySelector('[data-uploading="true"]')
      if (isUploading) {
        e.preventDefault()
        alert('Please wait for file upload to complete before saving.')
        return
      }
      /* Let the browser show its own "please fill this in" bubbles first —
         no point confirming a form that can't submit yet. */
      if (!form.checkValidity()) return
    }
    if (!confirm) return
    e.preventDefault()
    setOpen(true)
  }

  return (
    <>
      <button
        ref={btnRef}
        type="submit"
        disabled={pending}
        onClick={handleClick}
        className="admin-btn-press inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-ocean to-marine px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-ocean/20 transition-all hover:from-crimson hover:to-crimsonBright hover:shadow-crimson/25 disabled:opacity-60"
      >
        {pending && <span className="admin-spinner h-3.5 w-3.5 rounded-full border-2 border-white/40 border-t-white" />}
        {pending ? 'Saving…' : children}
      </button>

      <ConfirmDialog
        open={open}
        tone="primary"
        title={confirmTitle || `${label}?`}
        message={confirmMessage}
        confirmLabel={confirmLabel || label}
        cancelLabel="Go back"
        onCancel={() => setOpen(false)}
        onConfirm={() => {
          setOpen(false)
          /* No submitter argument: these forms have a single submit button
             and no formAction, and this avoids re-entering handleClick. */
          btnRef.current?.form?.requestSubmit()
        }}
      />
    </>
  )
}
