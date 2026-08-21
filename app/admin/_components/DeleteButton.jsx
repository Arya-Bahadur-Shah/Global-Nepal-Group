'use client'
/* Delete trigger + confirmation popup. The server action still runs via a
   real form submit, so it works exactly as before — the dialog just gates
   it. `confirmText` is the dialog body, kept as the prop name so existing
   callers don't change. */
import { useRef, useState } from 'react'
import { useFormStatus } from 'react-dom'
import ConfirmDialog from './ConfirmDialog'

/* Lives inside the <form> so useFormStatus() can report the pending
   server action and the button can show it. */
function Trigger({ label, onRequest }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="button"
      disabled={pending}
      onClick={onRequest}
      className="admin-btn-press inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-crimson transition-colors hover:bg-rose hover:text-crimsonD disabled:opacity-60"
    >
      {pending && <span className="admin-spinner h-3 w-3 rounded-full border-2 border-crimson/30 border-t-crimson" />}
      {pending ? 'Deleting…' : label}
    </button>
  )
}

export default function DeleteButton({
  action,
  label = 'Delete',
  confirmTitle = 'Delete this permanently?',
  confirmText = 'This removes it from the live website and cannot be undone.',
  confirmLabel = 'Yes, delete',
}) {
  const formRef = useRef(null)
  const [open, setOpen] = useState(false)

  return (
    <>
      <form ref={formRef} action={action} className="inline">
        <Trigger label={label} onRequest={() => setOpen(true)} />
      </form>

      <ConfirmDialog
        open={open}
        tone="danger"
        title={confirmTitle}
        message={confirmText}
        confirmLabel={confirmLabel}
        cancelLabel="Keep it"
        onCancel={() => setOpen(false)}
        onConfirm={() => {
          setOpen(false)
          /* requestSubmit() fires the submit event directly rather than
             clicking the trigger, so this can't loop back into the dialog. */
          formRef.current?.requestSubmit()
        }}
      />
    </>
  )
}
