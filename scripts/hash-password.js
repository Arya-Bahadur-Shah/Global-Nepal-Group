#!/usr/bin/env node
/* Usage: node scripts/hash-password.js <password>
   Prints a bcrypt hash to put in .env.local as ADMIN_PASSWORD_HASH. */
const bcrypt = require('bcryptjs')

const password = process.argv[2]
if (!password) {
  console.error('Usage: node scripts/hash-password.js <password>')
  process.exit(1)
}

const hash = bcrypt.hashSync(password, 10)
// Next.js expands `$` in .env files (dotenv-expand), which would otherwise
// mangle a bcrypt hash — escape every `$` so it's safe to paste as-is.
console.log(hash.replace(/\$/g, '\\$'))
