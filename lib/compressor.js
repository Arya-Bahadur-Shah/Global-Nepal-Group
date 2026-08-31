/* ============================================================
   UNIVERSAL COMPRESSOR UTILITY (gng-website)
   Provides compression for Photos/Images, PDF documents,
   and Structured JSON/Data.

   Functions:
     - compressImage(file, options)
     - compressPdf(file, options)
     - compressData(data, options)
     - decompressData(compressedData, returnType)
     - compress(input, options)  (Unified Dispatcher)
     - formatBytes(bytes)
   ============================================================ */

/**
 * Format bytes into human-readable string (e.g. 1.2 MB, 450 KB)
 */
export function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes <= 0) return '0 B'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

/**
 * Calculate percentage savings between original and compressed size
 */
export function calculateSavings(originalSize, compressedSize) {
  if (!originalSize || originalSize <= 0 || !compressedSize) return 0
  if (compressedSize >= originalSize) return 0
  const saved = ((originalSize - compressedSize) / originalSize) * 100
  return Math.round(saved * 10) / 10
}

/**
 * Image / Photo Compressor (Client-side HTML Canvas API)
 *
 * Iteratively reduces size using two levers, in order:
 *   1. JPEG/WebP quality, down to a floor of 0.5
 *   2. Dimensions, shrunk in 15% steps (up to 8 steps, floor 320px)
 * This guarantees a much better shot at hitting maxSizeBytes than
 * quality reduction alone, while never dropping quality low enough
 * to look obviously bad.
 *
 * @param {File|Blob} file - Source image file or blob
 * @param {Object} options
 * @param {number} [options.maxWidth=1920] - Max width in pixels
 * @param {number} [options.maxHeight=1920] - Max height in pixels
 * @param {number} [options.quality=0.8] - Image compression quality (0.1 to 1.0)
 * @param {string} [options.mimeType='image/webp'] - Target format ('image/webp', 'image/jpeg', 'image/png')
 * @param {number} [options.maxSizeBytes] - Target max size limit in bytes (triggers iterative compression)
 * @param {boolean} [options.preserveAlpha=true] - Keep PNG transparency by using WebP or PNG
 */
export async function compressImage(file, options = {}) {
  if (typeof window === 'undefined') {
    // Server-side fallback: return untouched if Canvas unavailable
    return {
      file,
      blob: file,
      originalSize: file.size || 0,
      compressedSize: file.size || 0,
      savingsPercent: 0,
      mimeType: file.type || 'image/jpeg',
      name: file.name || 'image',
    }
  }

  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.8,
    mimeType: initialMimeType = 'image/webp',
    maxSizeBytes,
    preserveAlpha = true,
  } = options

  const originalSize = file.size || 0
  const fileName = file.name || 'compressed_photo'

  // Determine output MIME type
  let targetMimeType = initialMimeType
  if (file.type === 'image/png' && preserveAlpha && initialMimeType === 'image/jpeg') {
    targetMimeType = 'image/webp' // WebP supports transparency with high compression
  }

  // Load image into HTMLImageElement
  const image = await new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = (err) => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image for compression: ' + err))
    }
    img.src = url
  })

  // Calculate aspect ratio scaling
  let width = image.width
  let height = image.height
  if (width > maxWidth || height > maxHeight) {
    const ratio = Math.min(maxWidth / width, maxHeight / height)
    width = Math.round(width * ratio)
    height = Math.round(height * ratio)
  }

  // Render at a given size/quality onto a fresh canvas each time
  function renderAt(w, h, q) {
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d', { alpha: true })

    // Fill white background for JPEGs to prevent black alpha fill
    if (targetMimeType === 'image/jpeg') {
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, w, h)
    }

    ctx.drawImage(image, 0, 0, w, h)
    return new Promise((resolve) => canvas.toBlob(resolve, targetMimeType, q))
  }

  let currentQuality = quality
  let blob = await renderAt(width, height, currentQuality)

  if (maxSizeBytes && blob) {
    // Lever 1: reduce quality down to a 0.5 floor (below this looks noticeably worse)
    while (blob.size > maxSizeBytes && currentQuality > 0.5) {
      currentQuality -= 0.1
      blob = await renderAt(width, height, currentQuality)
    }

    // Lever 2: quality floor reached but still too big — shrink dimensions
    // in 15% steps, keeping quality at the floor. Stops at 320px or after
    // 8 steps to avoid producing a useless thumbnail.
    let safety = 0
    while (blob.size > maxSizeBytes && safety < 8 && (width > 320 || height > 320)) {
      width = Math.round(width * 0.85)
      height = Math.round(height * 0.85)
      blob = await renderAt(width, height, currentQuality)
      safety++
    }
    // If it still can't hit target after both levers, we keep the best
    // result achieved and continue — the upload should never be blocked.
  }

  // Fallback if compression resulted in larger file (e.g. tiny PNG converted to unoptimized format)
  if (!blob || (blob.size >= originalSize && originalSize > 0 && !maxSizeBytes && width === image.width && height === image.height)) {
    blob = file
  }

  // Determine file extension
  let ext = '.webp'
  if (targetMimeType === 'image/jpeg') ext = '.jpg'
  if (targetMimeType === 'image/png') ext = '.png'

  const baseName = fileName.substring(0, fileName.lastIndexOf('.')) || fileName
  const compressedFileName = `${baseName}_compressed${ext}`

  const compressedFile = new File([blob], compressedFileName, {
    type: targetMimeType,
    lastModified: Date.now(),
  })

  const compressedSize = compressedFile.size
  const savingsPercent = calculateSavings(originalSize, compressedSize)

  return {
    file: compressedFile,
    blob,
    originalSize,
    compressedSize,
    formattedOriginalSize: formatBytes(originalSize),
    formattedCompressedSize: formatBytes(compressedSize),
    savingsPercent,
    width,
    height,
    mimeType: targetMimeType,
    name: compressedFileName,
  }
}

/**
 * PDF Document Compressor / Stream Optimizer
 *
 * NOTE: this pass currently only scans the PDF byte stream for
 * `stream` markers and does not re-encode embedded images, so on
 * most real-world PDFs it returns the file effectively unchanged.
 * Real size reduction for PDFs (recompressing embedded images,
 * removing unused objects) requires a proper PDF library such as
 * pdf-lib — worth adding as a follow-up if PDF size becomes a
 * problem in practice.
 *
 * @param {File|Blob} file - Source PDF document
 * @param {Object} options
 * @param {number} [options.targetQuality=0.8] - Compression aggressiveness level
 */
export async function compressPdf(file, options = {}) {
  const originalSize = file.size || 0
  const fileName = file.name || 'document.pdf'

  try {
    const arrayBuffer = await file.arrayBuffer()
    const bytes = new Uint8Array(arrayBuffer)

    // PDF Optimization Pass:
    // 1. Remove duplicate trailing whitespace and unused trailer objects
    // 2. Compress uncompressed streams inside the PDF binary buffer
    let modified = false
    const outputBuffer = []

    let i = 0
    while (i < bytes.length) {
      // Look for stream markers: "stream\r\n" or "stream\n"
      if (
        i + 6 < bytes.length &&
        bytes[i] === 115 && // s
        bytes[i + 1] === 116 && // t
        bytes[i + 2] === 114 && // r
        bytes[i + 3] === 101 && // e
        bytes[i + 4] === 97 && // a
        bytes[i + 5] === 109 // m
      ) {
        // Keep header
        for (let k = 0; k < 6; k++) outputBuffer.push(bytes[i + k])
        i += 6

        // Check newline after stream token
        if (bytes[i] === 13 && bytes[i + 1] === 10) {
          outputBuffer.push(13)
          outputBuffer.push(10)
          i += 2
        } else if (bytes[i] === 10) {
          outputBuffer.push(10)
          i += 1
        }
      } else {
        outputBuffer.push(bytes[i])
        i++
      }
    }

    const resultBuffer = modified ? new Uint8Array(outputBuffer) : bytes
    const blob = new Blob([resultBuffer], { type: 'application/pdf' })

    const baseName = fileName.substring(0, fileName.lastIndexOf('.')) || fileName
    const compressedFileName = `${baseName}_optimized.pdf`

    const compressedFile = new File([blob], compressedFileName, {
      type: 'application/pdf',
      lastModified: Date.now(),
    })

    const compressedSize = compressedFile.size
    const savingsPercent = calculateSavings(originalSize, compressedSize)

    return {
      file: compressedFile,
      blob,
      originalSize,
      compressedSize,
      formattedOriginalSize: formatBytes(originalSize),
      formattedCompressedSize: formatBytes(compressedSize),
      savingsPercent,
      mimeType: 'application/pdf',
      name: compressedFileName,
    }
  } catch (err) {
    // If stream pass fails, return original file safely
    return {
      file,
      blob: file,
      originalSize,
      compressedSize: originalSize,
      formattedOriginalSize: formatBytes(originalSize),
      formattedCompressedSize: formatBytes(originalSize),
      savingsPercent: 0,
      mimeType: 'application/pdf',
      name: fileName,
      error: err.message,
    }
  }
}

/**
 * Data & JSON Compressor using browser standard CompressionStream ('gzip')
 *
 * @param {Object|string|Uint8Array} data - Data to compress
 * @param {Object} options
 * @param {string} [options.format='blob'] - Output format ('blob' | 'uint8' | 'base64')
 */
export async function compressData(data, options = {}) {
  const { format = 'blob' } = options

  // Standardize input to UTF-8 Uint8Array bytes
  let inputBytes
  let originalStr = ''

  if (typeof data === 'object' && !(data instanceof Uint8Array)) {
    originalStr = JSON.stringify(data)
    inputBytes = new TextEncoder().encode(originalStr)
  } else if (typeof data === 'string') {
    originalStr = data
    inputBytes = new TextEncoder().encode(data)
  } else if (data instanceof Uint8Array) {
    inputBytes = data
  } else {
    throw new Error('Unsupported data type for compression')
  }

  const originalSize = inputBytes.byteLength

  // Use CompressionStream if supported
  if (typeof CompressionStream !== 'undefined') {
    const cs = new CompressionStream('gzip')
    const writer = cs.writable.getWriter()
    writer.write(inputBytes)
    writer.close()

    const chunks = []
    const reader = cs.readable.getReader()
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      chunks.push(value)
    }

    // Concatenate chunks
    const totalLen = chunks.reduce((acc, c) => acc + c.length, 0)
    const compressedBytes = new Uint8Array(totalLen)
    let offset = 0
    for (const chunk of chunks) {
      compressedBytes.set(chunk, offset)
      offset += chunk.length
    }

    const compressedSize = compressedBytes.byteLength
    const savingsPercent = calculateSavings(originalSize, compressedSize)
    const blob = new Blob([compressedBytes], { type: 'application/gzip' })

    let result = blob
    if (format === 'uint8') result = compressedBytes
    if (format === 'base64') {
      let binary = ''
      for (let i = 0; i < compressedBytes.byteLength; i++) {
        binary += String.fromCharCode(compressedBytes[i])
      }
      result = btoa(binary)
    }

    return {
      result,
      blob,
      compressedBytes,
      originalSize,
      compressedSize,
      formattedOriginalSize: formatBytes(originalSize),
      formattedCompressedSize: formatBytes(compressedSize),
      savingsPercent,
      mimeType: 'application/gzip',
    }
  } else {
    // Fallback if CompressionStream is not available
    const blob = new Blob([inputBytes], { type: 'application/json' })
    return {
      result: blob,
      blob,
      compressedBytes: inputBytes,
      originalSize,
      compressedSize: originalSize,
      formattedOriginalSize: formatBytes(originalSize),
      formattedCompressedSize: formatBytes(originalSize),
      savingsPercent: 0,
      mimeType: 'application/json',
    }
  }
}

/**
 * Decompress Gzip data back to text / JSON
 *
 * @param {Blob|Uint8Array|string} compressedData - Gzip data (Blob, Uint8Array, or Base64 string)
 * @param {string} [returnType='json'] - 'json' | 'text' | 'bytes'
 */
export async function decompressData(compressedData, returnType = 'json') {
  let bytes

  if (typeof compressedData === 'string') {
    // Base64 string
    const binary = atob(compressedData)
    bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
  } else if (compressedData instanceof Blob) {
    const ab = await compressedData.arrayBuffer()
    bytes = new Uint8Array(ab)
  } else if (compressedData instanceof Uint8Array) {
    bytes = compressedData
  } else {
    throw new Error('Unsupported compressed data input type')
  }

  if (typeof DecompressionStream !== 'undefined') {
    const ds = new DecompressionStream('gzip')
    const writer = ds.writable.getWriter()
    writer.write(bytes)
    writer.close()

    const chunks = []
    const reader = ds.readable.getReader()
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      chunks.push(value)
    }

    const totalLen = chunks.reduce((acc, c) => acc + c.length, 0)
    const decompressedBytes = new Uint8Array(totalLen)
    let offset = 0
    for (const chunk of chunks) {
      decompressedBytes.set(chunk, offset)
      offset += chunk.length
    }

    const text = new TextDecoder().decode(decompressedBytes)

    if (returnType === 'json') {
      try {
        return JSON.parse(text)
      } catch {
        return text
      }
    }
    if (returnType === 'bytes') return decompressedBytes
    return text
  } else {
    const text = new TextDecoder().decode(bytes)
    if (returnType === 'json') {
      try {
        return JSON.parse(text)
      } catch {
        return text
      }
    }
    return text
  }
}

/**
 * Master Unified Auto-Compressor
 * Automatically detects whether input is an Image file, PDF document, or Data object.
 *
 * @param {File|Blob|Object|string} input - Input item to compress
 * @param {Object} options - Compression options
 */
export async function compress(input, options = {}) {
  if (!input) throw new Error('No input provided to compress function')

  // Case 1: File or Blob
  if (typeof File !== 'undefined' && (input instanceof File || input instanceof Blob)) {
    const mimeType = input.type || ''

    // Images / Photos
    if (mimeType.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(input.name || '')) {
      return await compressImage(input, options)
    }

    // PDF Documents
    if (mimeType === 'application/pdf' || /\.pdf$/i.test(input.name || '')) {
      return await compressPdf(input, options)
    }

    // JSON / Text File
    if (mimeType === 'application/json' || mimeType.startsWith('text/')) {
      const text = await input.text()
      const dataRes = await compressData(text, options)
      const compressedFile = new File([dataRes.blob], `${input.name || 'data'}.gz`, {
        type: 'application/gzip',
      })
      return {
        ...dataRes,
        file: compressedFile,
        name: compressedFile.name,
      }
    }

    // Fallback for unrecognized file types
    return {
      file: input,
      blob: input,
      originalSize: input.size || 0,
      compressedSize: input.size || 0,
      formattedOriginalSize: formatBytes(input.size || 0),
      formattedCompressedSize: formatBytes(input.size || 0),
      savingsPercent: 0,
      mimeType: mimeType || 'application/octet-stream',
      name: input.name || 'file',
    }
  }

  // Case 2: Data object or string
  return await compressData(input, options)
}

export default compress