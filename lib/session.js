/* ============================================================
   SIGNED SESSION TOKEN (edge-safe)
   Uses only Web Crypto (crypto.subtle) + btoa/atob — no Node-only
   APIs — so this file can be imported from middleware.js, which
   runs on the Edge runtime, as well as from server actions.
   Token shape: base64url(JSON{email,expires}) + "." + hmacHex
   ============================================================ */

export const SESSION_COOKIE = 'gng_admin_session'
export const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7 // 7 days

function requireSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET
  if (!secret) throw new Error('ADMIN_SESSION_SECRET is not set (see .env.local.example)')
  return secret
}

function toBase64Url(str) {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
function fromBase64Url(str) {
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/')
  const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4))
  return atob(b64 + pad)
}
function toHex(buf) {
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('')
}
function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}
async function hmacHex(secret, message) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message))
  return toHex(sig)
}

export async function createSessionToken(email) {
  const secret = requireSecret()
  const expires = Date.now() + SESSION_TTL_MS
  const payload = toBase64Url(JSON.stringify({ email, expires }))
  const sig = await hmacHex(secret, payload)
  return `${payload}.${sig}`
}

export async function verifySessionToken(token) {
  if (!token) return null
  let secret
  try { secret = requireSecret() } catch { return null }

  const dot = token.lastIndexOf('.')
  if (dot < 0) return null
  const payload = token.slice(0, dot)
  const sig = token.slice(dot + 1)

  const expectedSig = await hmacHex(secret, payload)
  if (!timingSafeEqual(sig, expectedSig)) return null

  let data
  try { data = JSON.parse(fromBase64Url(payload)) } catch { return null }
  if (!data?.email || !data?.expires || Date.now() > data.expires) return null
  return { email: data.email }
}
