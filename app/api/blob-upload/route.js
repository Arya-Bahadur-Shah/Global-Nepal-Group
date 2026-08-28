/* ============================================================
   VERCEL BLOB — CLIENT-SIDE UPLOAD HANDLER
   POST /api/blob-upload

   The browser calls this endpoint to obtain a signed upload token,
   then POSTs the file directly to Vercel Blob storage. The file
   never passes through a server action, which means Vercel's 4.5 MB
   serverless-function body limit is completely bypassed.

   ── How the two-phase upload works ───────────────────────────
   Phase 1 (this file):
     Client sends   { pathname, contentType }
     Server returns { tokenPayload } (Vercel Blob signed token)

   Phase 2 (@vercel/blob/client, in BlobFileInput.jsx):
     Client POSTs the raw file bytes directly to Vercel Blob using
     the token. Blob returns the public URL.
     The client puts that URL in a hidden <input> so the server
     action only ever sees a short text string, not file bytes.

   ── Auth ─────────────────────────────────────────────────────
   Only admin sessions may generate tokens. The same session cookie
   checked by every admin server action is checked here.
   ============================================================ */
import { handleUpload } from '@vercel/blob/client'
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

const ALLOWED_CONTENT_TYPES = [
  'image/',
  'video/',
  'application/pdf',
]

async function adminAuthorised() {
  try {
    const session = await getSession()
    return Boolean(session)
  } catch {
    return false
  }
}

export async function POST(request) {
  if (!(await adminAuthorised())) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const body = await request.json()

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // Validate MIME type against our allowlist.
        const type = body.contentType || ''
        const ok = ALLOWED_CONTENT_TYPES.some((prefix) => type.startsWith(prefix))
        if (!ok) throw new Error(`File type not allowed: ${type}`)

        return {
          allowedContentTypes: ALLOWED_CONTENT_TYPES.flatMap((p) =>
            p.endsWith('/') ? [`${p}*`] : [p]
          ),
          // 500 MB absolute cap — individual field limits are enforced
          // in BlobFileInput before the token is even requested.
          maximumSizeInBytes: 500 * 1024 * 1024,
        }
      },
      onUploadCompleted: async ({ blob }) => {
        // Nothing to do server-side after upload — the client reads
        // the URL from the blob response and puts it in the form.
        void blob
      },
    })

    return NextResponse.json(jsonResponse)
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
