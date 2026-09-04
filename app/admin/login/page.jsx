import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import {
  verifyCredentials, setSessionCookie, getSession,
  setPendingCookie, clearPendingCookie, getPending,
} from '@/lib/auth'
import {
  loginStatus, recordAttempt, clearFailures,
  issueLoginCode, verifyLoginCode,
  MAX_FAILURES, CODE_TTL_MINUTES,
} from '@/lib/login-security'
import SubmitButton from '../_components/SubmitButton'

export const metadata = { title: 'Admin Login — Global Nepal Group', robots: { index: false, follow: false } }

/* Module scope, deliberately. Server actions are extracted into their
   own module at build time and can only close over SERIALIZABLE values
   from the component — a helper function isn't one, so defining this
   inside the component throws "clientIp is not defined" at runtime,
   after a successful build. */
function clientIp() {
  const h = headers()
  // Behind Vercel (or any proxy) the socket address is the proxy's, so
  // the forwarded header is the only view of the real client.
  return (h.get('x-forwarded-for') || '').split(',')[0].trim() || h.get('x-real-ip') || null
}

/* Signing in is two steps: password, then a code emailed to the same
   address. A stolen password alone is no longer enough.

   Step two is reached only with a SIGNED pending cookie, so nobody can
   jump straight to the code form for an arbitrary email and start
   guessing digits. */
export default async function AdminLoginPage({ searchParams }) {
  const existing = await getSession()
  if (existing) redirect(searchParams?.next || '/admin')

  const nextPath = searchParams?.next || '/admin'
  const pending = await getPending()

  /* ---- Step 1: email + password ---- */
  async function submitPassword(formData) {
    'use server'
    const email = String(formData.get('email') || '')
    const password = String(formData.get('password') || '')
    const next = formData.get('next') || '/admin'
    const ip = clientIp()

    // Checked BEFORE verifying the password: bcrypt is deliberately slow,
    // so answering a locked-out attempt without hashing also stops this
    // endpoint being used to burn CPU.
    const status = await loginStatus(email)
    if (status.locked) {
      redirect(
        `/admin/login?error=${encodeURIComponent(
          `Too many failed attempts. Try again in ${status.retryAfterMinutes} minute(s).`
        )}&next=${encodeURIComponent(next)}`
      )
    }

    const ok = await verifyCredentials(email, password)
    await recordAttempt(email, ok, ip)

    if (!ok) {
      const after = await loginStatus(email)
      const left = MAX_FAILURES - after.failures
      // Three cases, because the failure that TRIPS the lock should say
      // so rather than repeating the generic message and leaving you to
      // discover it on the next try.
      const message = after.locked
        ? `Too many failed attempts. Try again in ${after.retryAfterMinutes} minute(s).`
        : left <= 2
          ? `Invalid email or password. ${left} attempt(s) before lockout.`
          : 'Invalid email or password.'
      redirect(`/admin/login?error=${encodeURIComponent(message)}&next=${encodeURIComponent(next)}`)
    }

    // Password was right — issue the second factor. Note this happens
    // whether or not mail is configured; with no provider the mailer
    // prints the code to the server console so local dev still works.
    await issueLoginCode(email)
    await setPendingCookie(email)
    redirect(`/admin/login?step=code&next=${encodeURIComponent(next)}`)
  }

  /* ---- Step 2: emailed code ---- */
  async function submitCode(formData) {
    'use server'
    const session = await getPending()
    // Expired or forged: back to the start rather than leaking whether
    // the email exists.
    if (!session) {
      redirect(`/admin/login?error=${encodeURIComponent('That sign-in expired. Please start again.')}`)
    }

    const code = String(formData.get('code') || '')
    const next = formData.get('next') || '/admin'
    const result = await verifyLoginCode(session.email, code)

    if (!result.ok) {
      await recordAttempt(session.email, false, clientIp())
      redirect(`/admin/login?step=code&error=${encodeURIComponent(result.error)}&next=${encodeURIComponent(next)}`)
    }

    await clearFailures(session.email)
    await clearPendingCookie()
    await setSessionCookie(session.email)
    redirect(next)
  }

  async function resendCode() {
    'use server'
    const session = await getPending()
    if (!session) redirect('/admin/login')
    await issueLoginCode(session.email)
    redirect(`/admin/login?step=code&sent=1`)
  }

  async function startOver() {
    'use server'
    await clearPendingCookie()
    redirect('/admin/login')
  }

  const onCodeStep = searchParams?.step === 'code' && pending

  return (
    <div className="min-h-screen grid place-items-center px-5">
      <div className="w-full max-w-sm rounded-2xl border border-cloud bg-white p-8 shadow-sm">
        <h1 className="font-display font-bold text-ocean text-xl">GNG Admin</h1>

        {!onCodeStep ? (
          <>
            <p className="mt-1 text-sm text-steel">Sign in to manage content and leads.</p>

            {searchParams?.error && (
              <p className="mt-4 rounded-lg bg-rose px-3.5 py-2.5 text-sm text-crimsonDeep">{searchParams.error}</p>
            )}

            <form action={submitPassword} className="mt-6 space-y-4">
              <input type="hidden" name="next" value={nextPath} />
              <label className="block">
                <span className="font-mono text-[11px] tracking-widest uppercase text-steel">Email</span>
                <input name="email" type="email" required autoComplete="username" className="mt-1.5 w-full rounded-lg border border-cloud bg-white px-3.5 py-2.5 text-[15px]" />
              </label>
              <label className="block">
                <span className="font-mono text-[11px] tracking-widest uppercase text-steel">Password</span>
                <input name="password" type="password" required autoComplete="current-password" className="mt-1.5 w-full rounded-lg border border-cloud bg-white px-3.5 py-2.5 text-[15px]" />
              </label>
              <SubmitButton confirm={false}>Continue</SubmitButton>
            </form>

            <div className="mt-4 text-center">
              <a
                href="/admin/login/forgot-password"
                className="text-sm text-steel hover:underline"
              >
                Forgot your password?
              </a>
            </div>
          </>
        ) : (
          <>
            <p className="mt-1 text-sm text-steel">
              We emailed a {CODE_TTL_MINUTES}-minute code to <span className="text-ocean font-medium">{pending.email}</span>.
            </p>

            {searchParams?.sent && (
              <p className="mt-4 rounded-lg bg-mist border border-cloud px-3.5 py-2.5 text-sm text-ocean">A new code is on its way.</p>
            )}
            {searchParams?.error && (
              <p className="mt-4 rounded-lg bg-rose px-3.5 py-2.5 text-sm text-crimsonDeep">{searchParams.error}</p>
            )}

            <form action={submitCode} className="mt-6 space-y-4">
              <input type="hidden" name="next" value={nextPath} />
              <label className="block">
                <span className="font-mono text-[11px] tracking-widest uppercase text-steel">6-digit code</span>
                <input
                  name="code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]*"
                  maxLength={6}
                  required
                  autoFocus
                  className="mt-1.5 w-full rounded-lg border border-cloud bg-white px-3.5 py-2.5 text-[19px] tracking-[0.4em] font-mono text-center"
                />
              </label>
              <SubmitButton confirm={false}>Sign in</SubmitButton>
            </form>

            <div className="mt-4 flex items-center justify-between text-sm">
              <form action={resendCode}>
                <button type="submit" className="text-crimson hover:underline">Send a new code</button>
              </form>
              <form action={startOver}>
                <button type="submit" className="text-steel hover:underline">Use a different account</button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
