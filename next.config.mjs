/** @type {import('next').NextConfig} */
const nextConfig = {
  // Serve /public images as-is (no server-side optimization needed for a static export).
  images: { unoptimized: true },
  reactStrictMode: true,
  poweredByHeader: false,
  swcMinify: true,
}
export default nextConfig

