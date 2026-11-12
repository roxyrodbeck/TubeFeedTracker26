import { NodeSDK } from "@opentelemetry/sdk-node"
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace"
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto"
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-proto"
import { AggregationTemporality, PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics"
import { resourceFromAttributes } from "@opentelemetry/resources"

class SearchTraceExporter extends OTLPTraceExporter {
  export(...[spans, callback]: Parameters<OTLPTraceExporter["export"]>) {
    // Only these explicit spans are exported; framework URLs and payloads stay out.
    super.export(spans.filter((span) => span.instrumentationScope.name === "tubefeedtracker.search"), callback)
  }
}

const revision = process.env.VCS_REF_HEAD_REVISION
const repository = process.env.VCS_REPOSITORY_URL
const exportIntervalMillis = Number(process.env.OTEL_METRIC_EXPORT_INTERVAL) || 60000

const spanProcessor = new BatchSpanProcessor({ exporter: new SearchTraceExporter() })
const metricReader = new PeriodicExportingMetricReader({
  exporter: new OTLPMetricExporter({ temporalityPreference: AggregationTemporality.DELTA }),
  exportIntervalMillis,
  exportTimeoutMillis: Math.min(30000, exportIntervalMillis),
})

const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    ...(revision ? { "vcs.ref.head.revision": revision } : {}),
    ...(repository ? { "vcs.repository.url.full": repository } : {}),
  }),
  spanProcessors: [spanProcessor],
  metricReaders: [metricReader],
  logRecordProcessors: [],
})

sdk.start()

export async function flushTelemetry() {
  await Promise.allSettled([spanProcessor.forceFlush(), metricReader.forceFlush()])
}
