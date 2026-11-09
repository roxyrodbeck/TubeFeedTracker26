/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  async headers() {
    return ["/analytics/:path*", "/dev-tools/:path*", "/auth/:path*", "/offline"].map((source) => ({
      source,
      headers: [{ key: "X-Robots-Tag", value: "noindex, follow" }],
    }))
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
