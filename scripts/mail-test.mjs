/* ============================================================
   Sends one test email so you can confirm delivery without going
   through the whole sign-in flow.

   Usage: node scripts/mail-test.mjs you@example.com

   Reports which provider was used and the real error if it fails —
   the app deliberately swallows send failures so a mail outage can't
   break a login, which makes them invisible without this.
   ============================================================ */
import nextEnv from '@next/env'

nextEnv.loadEnvConfig(process.cwd())

const to = process.argv[2]
if (!to) {
  console.error('Usage: node scripts/mail-test.mjs <recipient@example.com>')
  process.exit(1)
}

// Imported after env is loaded — the module reads the variables to pick
// a provider, so importing first would see none of them.
const { sendMail, mailProvider } = await import('../lib/mailer.js')

console.log(`provider : ${mailProvider()}`)
console.log(`from     : ${process.env.MAIL_FROM || process.env.GMAIL_USER || '(default)'}`)
console.log(`to       : ${to}\n`)

const res = await sendMail({
  to,
  subject: 'Test email from the Global Nepal Group site',
  text:
    'If you can read this, outgoing email is working.\n\n' +
    'Admin sign-in codes will arrive the same way.',
})

if (res.ok) {
  console.log(`SENT via ${res.provider} — check the inbox (and the spam folder).`)
} else if (res.provider === 'console') {
  console.log('No provider configured, so nothing was sent — see the printout above.')
} else {
  console.log(`FAILED via ${res.provider}: ${res.reason}`)
  if (/Invalid login|Username and Password not accepted/i.test(String(res.reason))) {
    console.log(
      '\nGmail rejected the credentials. Almost always one of:\n' +
        '  - using the normal account password instead of an App Password\n' +
        '  - 2-Step Verification not enabled (App Passwords need it)\n' +
        '  - spaces left in the App Password'
    )
  }
  process.exitCode = 1
}
