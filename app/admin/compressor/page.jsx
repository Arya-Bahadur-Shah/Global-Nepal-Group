'use client'

import { useState, useRef } from 'react'
import { compress, compressImage, compressPdf, compressData, decompressData, formatBytes } from '@/lib/compressor'

export default function CompressorPage() {
  const [activeTab, setActiveTab] = useState('image') // 'image' | 'pdf' | 'data'

  // Image tab state
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [compressedImage, setCompressedImage] = useState(null)
  const [compressedImagePreview, setCompressedImagePreview] = useState(null)
  const [imageQuality, setImageQuality] = useState(80)
  const [maxWidth, setMaxWidth] = useState(1920)
  const [maxHeight, setMaxHeight] = useState(1920)
  const [imageFormat, setImageFormat] = useState('image/webp')
  const [imageCompressing, setImageCompressing] = useState(false)
  const [imageStats, setImageStats] = useState(null)
  const imageInputRef = useRef(null)

  // PDF tab state
  const [selectedPdf, setSelectedPdf] = useState(null)
  const [compressedPdf, setCompressedPdf] = useState(null)
  const [pdfCompressing, setPdfCompressing] = useState(false)
  const [pdfStats, setPdfStats] = useState(null)
  const pdfInputRef = useRef(null)

  // Data tab state
  const [rawText, setRawText] = useState('{\n  "company": "Global Nepal Group",\n  "status": "Active",\n  "data": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],\n  "message": "Compress any JSON payload or unstructured text into Gzip format"\n}')
  const [compressedDataResult, setCompressedDataResult] = useState(null)
  const [decompressedResult, setDecompressedResult] = useState('')
  const [dataStats, setDataStats] = useState(null)
  const [dataCompressing, setDataCompressing] = useState(false)

  // ------------------ IMAGE COMPRESSION HANDLERS ------------------
  async function handleImageSelect(e) {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedImage(file)
    setImagePreview(URL.createObjectURL(file))
    setCompressedImage(null)
    setCompressedImagePreview(null)
    setImageStats(null)

    await processImageCompression(file, imageQuality, maxWidth, maxHeight, imageFormat)
  }

  async function processImageCompression(file, quality, maxW, maxH, fmt) {
    if (!file) return
    setImageCompressing(true)
    try {
      const result = await compressImage(file, {
        quality: quality / 100,
        maxWidth: parseInt(maxW, 10) || 1920,
        maxHeight: parseInt(maxH, 10) || 1920,
        mimeType: fmt,
      })

      setCompressedImage(result.file)
      setCompressedImagePreview(URL.createObjectURL(result.blob))
      setImageStats(result)
    } catch (err) {
      alert('Error compressing image: ' + err.message)
    } finally {
      setImageCompressing(false)
    }
  }

  function handleQualityChange(e) {
    const newQ = parseInt(e.target.value, 10)
    setImageQuality(newQ)
    if (selectedImage) {
      processImageCompression(selectedImage, newQ, maxWidth, maxHeight, imageFormat)
    }
  }

  function handleFormatChange(e) {
    const newFmt = e.target.value
    setImageFormat(newFmt)
    if (selectedImage) {
      processImageCompression(selectedImage, imageQuality, maxWidth, maxHeight, newFmt)
    }
  }

  function downloadCompressedImage() {
    if (!compressedImage || !compressedImagePreview) return
    const a = document.createElement('a')
    a.href = compressedImagePreview
    a.download = compressedImage.name
    a.click()
  }

  // ------------------ PDF COMPRESSION HANDLERS ------------------
  async function handlePdfSelect(e) {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedPdf(file)
    setPdfCompressing(true)

    try {
      const result = await compressPdf(file)
      setCompressedPdf(result.file)
      setPdfStats(result)
    } catch (err) {
      alert('Error optimizing PDF: ' + err.message)
    } finally {
      setPdfCompressing(false)
    }
  }

  function downloadCompressedPdf() {
    if (!compressedPdf) return
    const url = URL.createObjectURL(compressedPdf)
    const a = document.createElement('a')
    a.href = url
    a.download = compressedPdf.name
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 10000)
  }

  // ------------------ DATA COMPRESSION HANDLERS ------------------
  async function handleCompressData() {
    if (!rawText.trim()) return
    setDataCompressing(true)

    try {
      const res = await compressData(rawText, { format: 'base64' })
      setCompressedDataResult(res.result)
      setDataStats(res)

      // Automatically test decompression
      const decomp = await decompressData(res.result, 'text')
      setDecompressedResult(decomp)
    } catch (err) {
      alert('Error compressing data: ' + err.message)
    } finally {
      setDataCompressing(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cloud pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-crimson to-ocean flex items-center justify-center text-white shadow-md shadow-crimson/20">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/>
                <path d="M12 12v9"/><path d="m8 17 4 4 4-4"/>
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-ocean font-display">Media & Data Compressor</h1>
              <p className="text-xs text-steel">Optimize photos, PDF datasheets, and JSON payloads with instant size reduction</p>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-mist p-1 rounded-xl border border-cloud">
          <button
            onClick={() => setActiveTab('image')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'image'
                ? 'bg-white text-ocean shadow-sm border border-cloud/60'
                : 'text-steel hover:text-ocean'
            }`}
          >
            🖼️ Photo / Image
          </button>
          <button
            onClick={() => setActiveTab('pdf')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'pdf'
                ? 'bg-white text-ocean shadow-sm border border-cloud/60'
                : 'text-steel hover:text-ocean'
            }`}
          >
            📄 PDF Datasheet
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'data'
                ? 'bg-white text-ocean shadow-sm border border-cloud/60'
                : 'text-steel hover:text-ocean'
            }`}
          >
            📦 Data / JSON Gzip
          </button>
        </div>
      </div>

      {/* TAB 1: PHOTO / IMAGE COMPRESSOR */}
      {activeTab === 'image' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Control Panel */}
            <div className="bg-white p-6 rounded-2xl border border-cloud shadow-sm space-y-5">
              <h2 className="text-sm font-bold text-ocean uppercase tracking-wider">Compressor Settings</h2>

              {/* Upload Dropzone */}
              <div>
                <label className="block text-xs font-medium text-steel mb-2">Select Image File</label>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-cloud hover:border-ocean/40 bg-mist hover:bg-cloud/20 transition-all rounded-xl p-5 text-center flex flex-col items-center gap-2 group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-ocean group-hover:scale-110 transition-transform shadow-xs">
                    📁
                  </div>
                  <span className="text-xs font-semibold text-ocean">
                    {selectedImage ? selectedImage.name : 'Choose or Drop Photo'}
                  </span>
                  <span className="text-[11px] text-steel">PNG, JPG, WebP, GIF, BMP</span>
                </button>
              </div>

              {/* Quality Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-semibold text-steel">Quality Quality ({imageQuality}%)</label>
                  <span className="font-mono text-ocean bg-mist px-2 py-0.5 rounded border border-cloud">
                    {imageQuality}%
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={imageQuality}
                  onChange={handleQualityChange}
                  className="w-full accent-crimson cursor-pointer"
                />
              </div>

              {/* Output Format */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-steel">Target Output Format</label>
                <select
                  value={imageFormat}
                  onChange={handleFormatChange}
                  className="w-full rounded-xl border border-cloud bg-mist px-3 py-2 text-xs font-medium text-ocean focus:outline-none focus:ring-2 focus:ring-crimson/20"
                >
                  <option value="image/webp">WebP (Recommended - Best Compression)</option>
                  <option value="image/jpeg">JPEG (Standard Photo)</option>
                  <option value="image/png">PNG (Lossless / Transparent)</option>
                </select>
              </div>

              {/* Max Dimensions */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-steel mb-1">Max Width (px)</label>
                  <input
                    type="number"
                    value={maxWidth}
                    onChange={(e) => {
                      setMaxWidth(e.target.value)
                      if (selectedImage) processImageCompression(selectedImage, imageQuality, e.target.value, maxHeight, imageFormat)
                    }}
                    className="w-full rounded-xl border border-cloud bg-mist px-3 py-2 text-xs font-mono text-ocean"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-steel mb-1">Max Height (px)</label>
                  <input
                    type="number"
                    value={maxHeight}
                    onChange={(e) => {
                      setMaxHeight(e.target.value)
                      if (selectedImage) processImageCompression(selectedImage, imageQuality, maxWidth, e.target.value, imageFormat)
                    }}
                    className="w-full rounded-xl border border-cloud bg-mist px-3 py-2 text-xs font-mono text-ocean"
                  />
                </div>
              </div>

              {/* Compression Metrics Card */}
              {imageStats && (
                <div className="bg-gradient-to-br from-mist to-cloud/20 p-4 rounded-xl border border-cloud space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-steel font-medium">Original File:</span>
                    <span className="font-mono text-steel">{imageStats.formattedOriginalSize}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-steel font-medium">Compressed File:</span>
                    <span className="font-mono font-bold text-emerald-700">{imageStats.formattedCompressedSize}</span>
                  </div>
                  <div className="pt-2 border-t border-cloud flex items-center justify-between">
                    <span className="text-xs font-bold text-ocean">Size Saved:</span>
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-bold font-mono px-2.5 py-1 rounded-full border border-emerald-300">
                      ⚡ -{imageStats.savingsPercent}% saved
                    </span>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button
                disabled={!compressedImage || imageCompressing}
                onClick={downloadCompressedImage}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-crimson to-crimsonBright text-white font-semibold text-xs shadow-md shadow-crimson/25 hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                <span>⬇️ Download Compressed Photo</span>
              </button>
            </div>

            {/* Preview Section */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-cloud shadow-sm flex flex-col">
              <h2 className="text-sm font-bold text-ocean uppercase tracking-wider mb-4">Visual Side-by-Side Comparison</h2>

              {!selectedImage ? (
                <div className="flex-1 flex flex-col items-center justify-center min-h-[300px] border-2 border-dashed border-cloud rounded-xl p-8 text-center text-steel bg-mist/50">
                  <span className="text-4xl mb-2">🖼️</span>
                  <p className="text-sm font-medium text-ocean">No photo selected</p>
                  <p className="text-xs text-steel mt-1">Upload a photo to see live side-by-side compression previews</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                  {/* Original Image Card */}
                  <div className="border border-cloud rounded-xl p-3 bg-mist/30 flex flex-col">
                    <div className="flex justify-between items-center mb-2 text-xs">
                      <span className="font-semibold text-steel">Original Photo</span>
                      <span className="font-mono text-[11px] text-steel bg-white px-2 py-0.5 rounded border border-cloud">
                        {imageStats?.formattedOriginalSize || formatBytes(selectedImage.size)}
                      </span>
                    </div>
                    <div className="flex-1 min-h-[220px] rounded-lg bg-white border border-cloud/60 overflow-hidden flex items-center justify-center p-2 relative">
                      <img src={imagePreview} alt="Original" className="max-h-[300px] w-auto object-contain rounded" />
                    </div>
                  </div>

                  {/* Compressed Image Card */}
                  <div className="border border-cloud rounded-xl p-3 bg-mist/30 flex flex-col">
                    <div className="flex justify-between items-center mb-2 text-xs">
                      <span className="font-semibold text-ocean flex items-center gap-1">
                        <span>Compressed Output</span>
                        {imageCompressing && <span className="animate-spin text-crimson">⌛</span>}
                      </span>
                      {imageStats && (
                        <span className="font-mono text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                          {imageStats.formattedCompressedSize} ({imageStats.width}×{imageStats.height}px)
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-h-[220px] rounded-lg bg-white border border-cloud/60 overflow-hidden flex items-center justify-center p-2 relative">
                      {compressedImagePreview ? (
                        <img src={compressedImagePreview} alt="Compressed" className="max-h-[300px] w-auto object-contain rounded" />
                      ) : (
                        <div className="text-xs text-steel animate-pulse">Compressing image…</div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PDF DOCUMENT COMPRESSOR */}
      {activeTab === 'pdf' && (
        <div className="bg-white p-6 rounded-2xl border border-cloud shadow-sm space-y-6">
          <div>
            <h2 className="text-sm font-bold text-ocean uppercase tracking-wider">PDF Datasheet & Document Optimizer</h2>
            <p className="text-xs text-steel mt-1">Optimize streams and binary structure of PDF brochures and technical specifications</p>
          </div>

          {/* Upload Dropzone */}
          <div className="max-w-xl mx-auto">
            <input
              ref={pdfInputRef}
              type="file"
              accept="application/pdf"
              onChange={handlePdfSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => pdfInputRef.current?.click()}
              className="w-full border-2 border-dashed border-cloud hover:border-ocean/40 bg-mist hover:bg-cloud/20 transition-all rounded-2xl p-8 text-center flex flex-col items-center gap-3 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-ocean group-hover:scale-110 transition-transform shadow-sm">
                📄
              </div>
              <span className="text-sm font-semibold text-ocean">
                {selectedPdf ? selectedPdf.name : 'Select or Drop PDF File'}
              </span>
              <span className="text-xs text-steel">Max size 50 MB (Datasheets, product specifications, catalog guides)</span>
            </button>
          </div>

          {/* PDF Compression Result */}
          {pdfCompressing && (
            <div className="text-center py-6 text-xs text-ocean font-medium space-y-2">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-crimson border-t-transparent" />
              <p>Optimizing PDF streams & binary structure…</p>
            </div>
          )}

          {pdfStats && !pdfCompressing && (
            <div className="max-w-xl mx-auto bg-mist p-6 rounded-2xl border border-cloud space-y-4">
              <div className="flex justify-between items-center text-sm border-b border-cloud/60 pb-3">
                <span className="text-steel font-medium">Original PDF Size:</span>
                <span className="font-mono text-steel">{pdfStats.formattedOriginalSize}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-cloud/60 pb-3">
                <span className="text-steel font-medium">Optimized PDF Size:</span>
                <span className="font-mono font-bold text-emerald-700">{pdfStats.formattedCompressedSize}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold text-ocean">Compression Reduction:</span>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold font-mono px-3 py-1 rounded-full border border-emerald-300">
                  ⚡ -{pdfStats.savingsPercent}% saved
                </span>
              </div>

              <button
                onClick={downloadCompressedPdf}
                className="w-full mt-4 py-3 px-4 rounded-xl bg-gradient-to-r from-ocean to-marine text-white font-semibold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <span>⬇️ Download Optimized PDF</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: DATA / JSON GZIP COMPRESSOR */}
      {activeTab === 'data' && (
        <div className="bg-white p-6 rounded-2xl border border-cloud shadow-sm space-y-6">
          <div>
            <h2 className="text-sm font-bold text-ocean uppercase tracking-wider">JSON Data & Text Gzip Stream Compressor</h2>
            <p className="text-xs text-steel mt-1">Test browser Gzip stream compression (`CompressionStream`) and round-trip decompression</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Raw Input */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-steel">Raw Input Data (JSON or Plain Text)</label>
              <textarea
                rows="10"
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                className="w-full rounded-xl border border-cloud bg-mist p-3 font-mono text-xs text-ocean focus:outline-none focus:ring-2 focus:ring-crimson/20"
              />
              <button
                onClick={handleCompressData}
                disabled={dataCompressing}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-crimson to-crimsonBright text-white font-semibold text-xs shadow-md shadow-crimson/25 hover:shadow-lg disabled:opacity-50 transition-all"
              >
                {dataCompressing ? 'Compressing…' : '⚡ Compress Data with Gzip'}
              </button>
            </div>

            {/* Compressed Base64 Output */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-steel">Gzip Compressed Output (Base64)</label>
              <textarea
                rows="10"
                readOnly
                value={compressedDataResult || ''}
                placeholder="Compressed Gzip payload will appear here…"
                className="w-full rounded-xl border border-cloud bg-mist p-3 font-mono text-xs text-emerald-800 focus:outline-none"
              />

              {dataStats && (
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center justify-between text-xs text-emerald-900">
                  <span>Raw: <strong>{dataStats.formattedOriginalSize}</strong> ➔ Compressed: <strong>{dataStats.formattedCompressedSize}</strong></span>
                  <span className="font-mono font-bold bg-emerald-200 px-2 py-0.5 rounded text-emerald-950">
                    -{dataStats.savingsPercent}% saved
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Decompressed Test Verification */}
          {decompressedResult && (
            <div className="pt-4 border-t border-cloud space-y-2">
              <h3 className="text-xs font-bold text-ocean flex items-center gap-1.5">
                <span>✓ Decompression Verification (`DecompressionStream` Round-Trip)</span>
              </h3>
              <pre className="p-3 bg-mist rounded-xl border border-cloud font-mono text-xs text-steel overflow-x-auto">
                {decompressedResult}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
