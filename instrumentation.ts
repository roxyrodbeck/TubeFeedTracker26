declare global {
  var __tubeFeedTrackerFlush: (() => Promise<void>) | undefined
}

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" && process.env.OTEL_EXPORTER_OTLP_ENDPOINT) {
    const telemetry = await import("./instrumentation.node")
    globalThis.__tubeFeedTrackerFlush = telemetry.flushTelemetry
  }
}

export function flushTelemetry() {
  return globalThis.__tubeFeedTrackerFlush?.() ?? Promise.resolve()
}
