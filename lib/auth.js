/* ============================================================
   ADMIN AUTH (Node-only)
   Credentials are stored in the `admins` SQLite table (seeded on
   first run from .env.local via lib/db.js). This file handles
   password verification, session cookie read/write, and logout.
   The edge-safe token verify used by middleware.js lives in
   lib/session.js.
   ============================================================ */
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import {
  createSessionToken, verifySessionToken, SESSION_COOKIE, SESSION_TTL_MS,
  createPendingToken, verifyPendingToken, PENDING_COOKIE, PENDING_TTL_MS,
} from '@/lib/session'
import { getAdminByEmail } from '@/lib/admin-data'

export async function verifyCredentials(email, password) {
  if (!email || !password) return false
  const admin = await getAdminByEmail(email)
  if (!admin) return false
  return bcrypt.compare(password, admin.password_hash)
}

export async function setSessionCookie(email) {
  const token = await createSessionToken(email)
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  })
}

export async function clearSessionCookie() {
  cookies().set(SESSION_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 })
}

export async function getSession() {
  const token = cookies().get(SESSION_COOKIE)?.value
  return verifySessionToken(token)
}

/* ---- Pending sign-in (password done, emailed code outstanding) ---- */

export async function setPendingCookie(email) {
  const token = await createPendingToken(email)
  cookies().set(PENDING_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: Math.floor(PENDING_TTL_MS / 1000),
  })
}

export async function clearPendingCookie() {
  cookies().set(PENDING_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 })
}

export async function getPending() {
  const token = cookies().get(PENDING_COOKIE)?.value
  return verifyPendingToken(token)
}

/* ---- Defence in depth for admin server actions ---- */

/**
 * Asserts a signed-in admin, redirecting to the login screen if not.
 * Call it as the FIRST line of every admin server action.
 *
 * middleware.js already gates /admin/:path*, and a server action POSTs
 * to the URL of the page it was rendered on — so an action reached
 * through the UI has always passed that check. This is a second lock on
 * the same door, and it is here because the first one is the kind that
 * has been picked before: CVE-2025-29927 let a crafted request skip
 * Next's middleware entirely, and every mutation in the admin panel sat
 * behind nothing else. Checking inside the action puts the decision in
 * the same process as the write it protects.
 *
 * Cheap enough to call unconditionally: verifying the cookie is one
 * HMAC over a short string, with no database round trip.
 */
export async function requireSession() {
  const session = await getSession()
  if (!session) redirect('/admin/login')
  return session
}