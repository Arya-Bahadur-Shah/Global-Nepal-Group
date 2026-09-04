import { redirect } from 'next/navigation'
import { getAdminByEmail, createPasswordResetToken } from '@/lib/admin-data'
import { sendMail } from '@/lib/mailer'
import { siteUrl } from '@/lib/site-url'
import SubmitButton from '../../_components/SubmitButton'

export const metadata = {
  title: 'Forgot password — Admin',
  robots: { index: false, follow: false },
}

export default async function ForgotPasswordPage({ searchParams }) {
  async function requestReset(formData) {
    'use server'
    const email = String(formData.get('email') || '').trim().toLowerCase()

    // Always redirect to the same "check your email" message regardless
    // of whether the address exists — prevents email-enumeration attacks.
    const admin = await getAdminByEmail(email)
    if (admin) {
      const rawToken = await createPasswordResetToken(email)
      const resetUrl = `${siteUrl()}/admin/login/reset-password?token=${rawToken}`

      await sendMail({
        to: email,
        subject: 'Reset your Global Nepal Group admin password',
        text:
          `Someone (hopefully you) requested a password reset for this admin account.\n\n` +
          `Click the link below to choose a new password. It expires in 1 hour.\n\n` +
          `${resetUrl}\n\n` +
          `If you didn't request this, you can safely ignore this email.`,
      })
    }

    redirect('/admin/login/forgot-password?sent=1')
  }

  return (
    <div className="min-h-screen grid place-items-center px-5">
      <div className="w-full max-w-sm rounded-2xl border border-cloud bg-white p-8 shadow-sm">
        <h1 className="font-display font-bold text-ocean text-xl">Reset your password</h1>

        {searchParams?.sent ? (
          <>
            <p className="mt-3 text-sm text-steel leading-relaxed">
              If that email belongs to an admin account, a reset link is on its way.
              Check your inbox (and spam folder) — the link expires in&nbsp;1&nbsp;hour.
            </p>
            <a
              href="/admin/login"
              className="mt-6 block text-center text-sm text-ocean hover:underline"
            >
              ← Back to sign in
            </a>
          </>
        ) : (
          <>
            <p className="mt-1 text-sm text-steel">
              Enter your admin email address and we will send you a link to reset your password.
            </p>

            <form action={requestReset} className="mt-6 space-y-4">
              <label className="block">
                <span className="font-mono text-[11px] tracking-widest uppercase text-steel">
                  Email
                </span>
                <input
                  name="email"
                  type="email"
                  required
                  autoFocus
                  autoComplete="email"
                  className="mt-1.5 w-full rounded-lg border border-cloud bg-white px-3.5 py-2.5 text-[15px]"
                />
              </label>
              <SubmitButton confirm={false}>Send reset link</SubmitButton>
            </form>

            <a
              href="/admin/login"
              className="mt-4 block text-center text-sm text-steel hover:underline"
            >
              ← Back to sign in
            </a>
          </>
        )}
      </div>
    </div>
  )
}
