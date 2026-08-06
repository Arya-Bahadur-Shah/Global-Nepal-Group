/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image Optimization is ON (this app runs on Vercel, not a static export),
  // so Next/Vercel serve resized, modern-format (AVIF/WebP) images instead of
  // the multi-MB originals — the biggest mobile load-time win.
  images: {
    formats: ['image/avif', 'image/webp'],
    // Trimmed device widths so phones don't fetch desktop-sized images.
    deviceSizes: [360, 420, 640, 768, 1024, 1280, 1600, 1920],
    imageSizes: [64, 96, 128, 200, 300, 420],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    // The admin panel lets editors paste image URLs from any host (Unsplash,
    // manufacturer CDNs, etc.). With optimization on, next/image requires
    // remote hosts to be allowlisted, so we permit any https image source.
    // (Tighten to specific hostnames here if you ever want to lock this down.)
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
  reactStrictMode: true,
  poweredByHeader: false,
  swcMinify: true,
}
export default nextConfig
