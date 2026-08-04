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
import { createSessionToken, verifySessionToken, SESSION_COOKIE, SESSION_TTL_MS } from '@/lib/session'
import { getAdminByEmail } from '@/lib/admin-data'

export async function verifyCredentials(email, password) {
  if (!email || !password) return false
  const admin = getAdminByEmail(email)
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
