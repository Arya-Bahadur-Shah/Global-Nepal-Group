import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import {
  getPasswordResetByToken,
  markPasswordResetUsed,
  updateAdminPassword,
} from '@/lib/admin-data'
import { setSessionCookie } from '@/lib/auth'
import SubmitButton from '../../_components/SubmitButton'

export const metadata = {
  title: 'Set new password — Admin',
  robots: { index: false, follow: false },
}

/* Token is passed as a URL query param: /admin/login/reset-password?token=... */
export default async function ResetPasswordPage({ searchParams }) {
  const token = String(searchParams?.token || '').trim()

  /* ── Validate the token early so the form is never shown for an
     invalid/expired link. We do NOT consume it here — only after a
     successful password change. ── */
  let resetRow = null
  let tokenInvalid = false

  if (!token) {
    tokenInvalid = true
  } else {
    resetRow = await getPasswordResetByToken(token)
    if (
      !resetRow ||
      resetRow.used_at !== null ||
      new Date(resetRow.expires_at).getTime() < Date.now()
    ) {
      tokenInvalid = true
    }
  }

  async function setNewPassword(formData) {
    'use server'
    const rawToken = String(formData.get('token') || '').trim()
    const newPassword = String(formData.get('password') || '')
    const confirmPassword = String(formData.get('confirm') || '')

    // Re-validate token inside the action (the page render already
    // checked it, but the action is a separate request).
    const row = await getPasswordResetByToken(rawToken)
    if (
      !row ||
      row.used_at !== null ||
      new Date(row.expires_at).getTime() < Date.now()
    ) {
      redirect(
        `/admin/login/reset-password?token=${encodeURIComponent(rawToken)}&error=${encodeURIComponent('This reset link has expired or already been used. Please request a new one.')}`
      )
    }

    if (newPassword.length < 8) {
      redirect(
        `/admin/login/reset-password?token=${encodeURIComponent(rawToken)}&error=${encodeURIComponent('Password must be at least 8 characters.')}`
      )
    }

    if (newPassword !== confirmPassword) {
      redirect(
        `/admin/login/reset-password?token=${encodeURIComponent(rawToken)}&error=${encodeURIComponent('Passwords do not match.')}`
      )
    }

    const hash = await bcrypt.hash(newPassword, 10)
    await updateAdminPassword(row.email, hash)
    await markPasswordResetUsed(rawToken)

    // Sign the admin in automatically so they don't have to log in again.
    await setSessionCookie(row.email)
    redirect('/admin?reset=1')
  }

  /* ── Expired / invalid token ── */
  if (tokenInvalid) {
    return (
      <div className="min-h-screen grid place-items-center px-5">
        <div className="w-full max-w-sm rounded-2xl border border-cloud bg-white p-8 shadow-sm">
          <h1 className="font-display font-bold text-ocean text-xl">Link expired</h1>
          <p className="mt-3 text-sm text-steel leading-relaxed">
            This password-reset link is invalid or has already been used.
            Reset links expire after 1 hour.
          </p>
          <a
            href="/admin/login/forgot-password"
            className="mt-6 block rounded-xl bg-gradient-to-r from-ocean to-marine px-4 py-2.5 text-center text-sm font-semibold text-white shadow-md shadow-ocean/20"
          >
            Request a new link
          </a>
          <a
            href="/admin/login"
            className="mt-3 block text-center text-sm text-steel hover:underline"
          >
            ← Back to sign in
          </a>
        </div>
      </div>
    )
  }

  /* ── Valid token: show the new-password form ── */
  return (
    <div className="min-h-screen grid place-items-center px-5">
      <div className="w-full max-w-sm rounded-2xl border border-cloud bg-white p-8 shadow-sm">
        <h1 className="font-display font-bold text-ocean text-xl">Set new password</h1>
        <p className="mt-1 text-sm text-steel">
          Choose a new password for <span className="text-ocean font-medium">{resetRow.email}</span>.
        </p>

        {searchParams?.error && (
          <p className="mt-4 rounded-lg bg-rose px-3.5 py-2.5 text-sm text-crimsonDeep">
            {searchParams.error}
          </p>
        )}

        <form action={setNewPassword} className="mt-6 space-y-4">
          <input type="hidden" name="token" value={token} />

          <label className="block">
            <span className="font-mono text-[11px] tracking-widest uppercase text-steel">
              New password
            </span>
            <input
              name="password"
              type="password"
              required
              autoFocus
              autoComplete="new-password"
              minLength={8}
              className="mt-1.5 w-full rounded-lg border border-cloud bg-white px-3.5 py-2.5 text-[15px]"
            />
            <span className="mt-1 block text-[11px] text-steel">At least 8 characters</span>
          </label>

          <label className="block">
            <span className="font-mono text-[11px] tracking-widest uppercase text-steel">
              Confirm new password
            </span>
            <input
              name="confirm"
              type="password"
              required
              autoComplete="new-password"
              className="mt-1.5 w-full rounded-lg border border-cloud bg-white px-3.5 py-2.5 text-[15px]"
            />
          </label>

          <SubmitButton confirmMessage="This will update your password and sign you in.">
            Set new password
          </SubmitButton>
        </form>
      </div>
    </div>
  )
}
