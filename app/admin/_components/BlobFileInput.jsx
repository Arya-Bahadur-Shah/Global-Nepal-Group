'use client'
/* ============================================================
   BLOB FILE INPUT — client-side upload on file selection
   Replaces the plain <FileInput> for admin forms that run on Vercel,
   where the serverless-function body limit (4.5 MB) makes it
   impossible to POST large files through a Server Action.

   ── How it works ─────────────────────────────────────────────
   1. User picks a file in the browser.
   2. This component immediately POSTs it to Vercel Blob via the
      client-upload SDK (file bytes go direct to Blob, never through
      a Next.js function).
   3. On success, the returned public URL is stored in a hidden
      <input name={name}> so the parent Server Action sees just a
      short URL string — same shape as a pasted URL.
   4. The visible input is disabled while the upload runs and shows
      a status indicator to the editor.

   ── Props ────────────────────────────────────────────────────
   name          – hidden input name forwarded to the Server Action
   accept        – MIME filter passed to the file picker
   kind          – 'image' | 'video' | 'doc'  (enforces client-side size cap)
   current       – current file URL (shown as a link, replace-or-keep)
   currentLabel  – label prefix for the current URL ('Current logo' etc.)
   locationHint  – badge: where the file appears on the public site
   aspectHint    – badge: recommended dimensions / format
   multiple      – allow picking multiple files (gallery inputs)
   ============================================================ */
import { useState, useId, useRef } from 'react'
import { upload } from '@vercel/blob/client'

/* Per-kind client-side size caps — must stay under 500 MB absolute.
   These mirror the limits in lib/upload.js so error messages are
   consistent. */
const KIND_LIMITS = {
  image: 25 * 1024 * 1024,   // 25 MB
  video: 500 * 1024 * 1024,  // 500 MB
  doc:   50 * 1024 * 1024,   // 50 MB
}
const KIND_LABELS = { image: 'Image', video: 'Video', doc: 'Document' }

const fileInputClass =
  'admin-input-focus w-full rounded-xl border border-dashed border-cloud bg-mist px-4 py-3 text-sm text-steel ' +
  'file:mr-3 file:rounded-lg file:border-0 file:bg-white file:px-3 file:py-1.5 file:text-xs file:font-semibold ' +
  'file:text-ocean hover:file:bg-cloud/40 file:cursor-pointer cursor-pointer ' +
  'disabled:opacity-60 disabled:cursor-not-allowed'

export default function BlobFileInput({
  name,
  accept,
  kind = 'image',
  current,
  currentLabel,
  locationHint,
  aspectHint,
  multiple,
  ...rest
}) {
  const uid        = useId()
  const inputRef   = useRef(null)
  const maxBytes   = KIND_LIMITS[kind] ?? KIND_LIMITS.image
  const kindLabel  = KIND_LABELS[kind] ?? 'File'

  // urls: array of uploaded Blob URLs (one per file)
  const [urls, setUrls]       = useState([])
  const [status, setStatus]   = useState('idle')  // idle | uploading | done | error
  const [errorMsg, setErrMsg] = useState('')
  const [progress, setProgress] = useState(0)

  async function handleChange(e) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    // Client-side size validation
    for (const f of files) {
      if (f.size > maxBytes) {
        setStatus('error')
        setErrMsg(`${kindLabel} too large (${(f.size / 1024 / 1024).toFixed(1)} MB). Max ${Math.round(maxBytes / 1024 / 1024)} MB.`)
        if (inputRef.current) inputRef.current.value = ''
        return
      }
    }

    setStatus('uploading')
    setErrMsg('')
    setProgress(0)

    try {
      const uploaded = []
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const blob = await upload(file.name, file, {
          access: 'public',
          handleUploadUrl: '/api/blob-upload',
          contentType: file.type || undefined,
        })
        uploaded.push(blob.url)
        setProgress(Math.round(((i + 1) / files.length) * 100))
      }
      setUrls(uploaded)
      setStatus('done')
    } catch (err) {
      setStatus('error')
      setErrMsg(err?.message || 'Upload failed. Please try again.')
    } finally {
      // CRITICAL: Reset the DOM input value to empty string so the browser's
      // file picker element holds 0 binary files. This prevents any form submit
      // handler or FormData serializer from sending raw file bytes to the Server Action.
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    }
  }

  return (
    <div data-uploading={status === 'uploading' ? 'true' : 'false'}>
      {/* Current file link */}
      {current && (
        <p className="mb-1.5 text-xs text-steel truncate flex items-center gap-1.5">
          <span className="font-semibold text-ocean">{currentLabel || 'Current'}:</span>
          <a href={current} target="_blank" rel="noreferrer" className="text-azure hover:underline truncate">{current}</a>
        </p>
      )}

      {/* File picker (unnamed so FormData ignores it, value reset immediately after upload) */}
      <input
        ref={inputRef}
        id={uid}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={status === 'uploading'}
        onChange={handleChange}
        className={fileInputClass}
      />

      {/* Hidden inputs that carry the URL(s) to the Server Action */}
      {urls.length > 0
        ? urls.map((url, i) => (
            <input key={i} type="hidden" name={name} value={url} />
          ))
        : // No upload yet → pass an empty string so the server action
          // sees the field and keeps the existing value
          <input type="hidden" name={name} value="" />
      }

      {/* Remove checkbox (only when there's a current file and no new upload) */}
      {current && urls.length === 0 && name && (
        <label className="mt-2 flex items-center gap-2 text-xs text-steel cursor-pointer w-fit">
          <input type="checkbox" name={`remove_${name}`} value="1" className="accent-crimson" />
          Remove the current file
        </label>
      )}

      {/* Upload status */}
      {status === 'uploading' && (
        <div className="mt-2 flex items-center gap-2 text-xs text-steel">
          <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-ocean border-t-transparent" />
          Uploading… {progress > 0 && `${progress}%`}
        </div>
      )}
      {status === 'done' && (
        <p className="mt-2 text-xs text-emerald-600 font-medium flex items-center gap-1.5">
          <span>✓</span>
          {urls.length === 1 ? 'Uploaded — save the form to confirm.' : `${urls.length} files uploaded — save the form to confirm.`}
        </p>
      )}
      {status === 'error' && (
        <p className="mt-2 text-xs text-crimson font-medium">{errorMsg}</p>
      )}

      {/* Location / aspect hints */}
      {(locationHint || aspectHint) && (
        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px]">
          {locationHint && <span className="font-medium text-ocean bg-mist px-2 py-0.5 rounded-md border border-cloud">📍 {locationHint}</span>}
          {aspectHint   && <span className="font-mono text-[10px] text-steel bg-white px-2 py-0.5 rounded-md border border-cloud">📐 {aspectHint}</span>}
        </div>
      )}
    </div>
  )
}
