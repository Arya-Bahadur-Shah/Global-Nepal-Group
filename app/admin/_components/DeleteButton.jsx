'use client'

export default function DeleteButton({ action, confirmText = 'Delete this? This cannot be undone.' }) {
  return (
    <form
      action={action}
      className="inline"
      onSubmit={(e) => { if (!confirm(confirmText)) e.preventDefault() }}
    >
      <button
        type="submit"
        className="admin-btn-press rounded-lg px-3 py-1.5 text-sm font-medium text-crimson transition-colors hover:bg-rose hover:text-crimsonD"
      >
        Delete
      </button>
    </form>
  )
}
