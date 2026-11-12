import { execSync } from "node:child_process"

function gitRevision() {
  if (process.env.VERCEL_GIT_COMMIT_SHA) return process.env.VERCEL_GIT_COMMIT_SHA
  try {
    return execSync("git rev-parse HEAD", { stdio: ["ignore", "pipe", "ignore"] }).toString().trim()
  } catch {
    return ""
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    VCS_REF_HEAD_REVISION: gitRevision(),
    VCS_REPOSITORY_URL: "https://github.com/roxyrodbeck/TubeFeedTracker26",
  },
  experimental: {
    instrumentationHook: true,
    serverComponentsExternalPackages: [
      "@opentelemetry/sdk-node",
      "@opentelemetry/sdk-trace",
      "@opentelemetry/exporter-trace-otlp-proto",
      "@opentelemetry/exporter-metrics-otlp-proto",
      "@opentelemetry/sdk-metrics",
      "@opentelemetry/resources",
    ],
  },
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
