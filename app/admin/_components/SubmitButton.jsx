'use client'
import { useFormStatus } from 'react-dom'

export default function SubmitButton({ children = 'Save' }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="admin-btn-press inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-ocean to-marine px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-ocean/20 transition-all hover:from-crimson hover:to-crimsonBright hover:shadow-crimson/25 disabled:opacity-60"
    >
      {pending && <span className="admin-spinner h-3.5 w-3.5 rounded-full border-2 border-white/40 border-t-white" />}
      {pending ? 'Saving…' : children}
    </button>
  )
}
