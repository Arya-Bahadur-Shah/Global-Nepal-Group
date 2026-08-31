/* ============================================================
   VERCEL BLOB — CLIENT-SIDE UPLOAD HANDLER
   POST /api/blob-upload

   The browser calls this endpoint to obtain a signed upload token,
   then POSTs the file directly to Vercel Blob storage. The file
   never passes through a server action, which means Vercel's 4.5 MB
   serverless-function body limit is completely bypassed.

   ── How the two-phase upload works ───────────────────────────
   Phase 1 (this file):
     Client sends   { pathname, ... }
     Server returns { tokenPayload } (Vercel Blob signed token)

   Phase 2 (@vercel/blob/client, in BlobFileInput.jsx):
     Client POSTs the raw file bytes directly to Vercel Blob using
     the token. Blob returns the public URL.
     The client puts that URL in a hidden <input> so the server
     action only ever sees a short text string, not file bytes.

   ── Auth ─────────────────────────────────────────────────────
   Only admin sessions may generate tokens. The same session cookie
   checked by every admin server action is checked here.

   ── File-type validation ────────────────────────────────────
   IMPORTANT: handleUpload's onBeforeGenerateToken callback does
   NOT receive a flat `contentType` field on body — that was the
   bug. Validate by the pathname's extension instead. Vercel Blob
   itself still double-checks the real MIME type against
   allowedContentTypes during the actual upload, so this keeps
   the same security guarantee.
   ============================================================ */
import { handleUpload } from '@vercel/blob/client'
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

const IMAGE_EXT = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'svg']
const VIDEO_EXT = ['mp4', 'mov', 'webm', 'avi', 'mkv']
const DOC_EXT   = ['pdf']
const ALL_EXT   = [...IMAGE_EXT, ...VIDEO_EXT, ...DOC_EXT]

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

  // Temporary debug logging — safe to remove once uploads are confirmed working.
  console.log('BLOB TOKEN PRESENT:', Boolean(process.env.BLOB_READ_WRITE_TOKEN))
  console.log('BLOB TOKEN LENGTH:', process.env.BLOB_READ_WRITE_TOKEN?.length)
  console.log('BLOB TOKEN START:', process.env.BLOB_READ_WRITE_TOKEN?.slice(0, 20))

  const body = await request.json()

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const ext = (pathname.split('.').pop() || '').toLowerCase()
        const ok = ALL_EXT.includes(ext)
        if (!ok) throw new Error(`File type not allowed: .${ext}`)

        return {
          allowedContentTypes: ['image/*', 'video/*', 'application/pdf'],
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
    console.log('BLOB UPLOAD ERROR:', err.message)
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
