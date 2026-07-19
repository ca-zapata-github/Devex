import type { MetricSnapshot } from "@/types/metrics";
import { METRIC_LABELS } from "@/types/metrics";
import { directionCaption } from "@/lib/metrics/format";

interface NorthStarStripProps {
  metrics: MetricSnapshot[];
  scorecardUrl?: string;
  compact?: boolean;
}

export function NorthStarStrip({ metrics, scorecardUrl, compact = false }: NorthStarStripProps) {
  const valueMetric = metrics.find((m) => m.metricKey === "value_vs_overhead");
  const dxMetrics = metrics.filter((m) => m.metricKey.startsWith("dx_"));

  return (
    <section className={compact ? "space-y-3" : "space-y-4"}>
      {!compact ? (
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">North-star strip</h2>
            <p className="mt-1 text-sm text-neutral-500">
              Value vs Overhead + DX Core 4 summary · baseline-first (G3)
            </p>
          </div>
          {scorecardUrl ? (
            <a
              href={scorecardUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-neutral-600 underline-offset-2 hover:text-neutral-900 hover:underline"
            >
              Open Scorecard app →
            </a>
          ) : (
            <span className="text-xs text-neutral-400">Scorecard link TBD</span>
          )}
        </div>
      ) : null}

      <div className={`grid gap-3 ${compact ? "sm:grid-cols-2 lg:grid-cols-5" : "sm:grid-cols-2 lg:grid-cols-5"}`}>
        {valueMetric ? (
          <div
            className={`rounded-lg border p-3 ${
              valueMetric.baselineStatus === "collecting"
                ? "border-neutral-200 bg-neutral-50 text-neutral-600"
                : "border-neutral-300 bg-white"
            }`}
          >
            <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
              {METRIC_LABELS.value_vs_overhead}
            </p>
            <p className="mt-1 text-lg font-bold tabular-nums">
              {valueMetric.headlineValue ?? "—"}
            </p>
            <p className="mt-1 text-xs">
              {directionCaption(valueMetric.direction, valueMetric.baselineStatus === "collecting")}
            </p>
          </div>
        ) : null}

        {dxMetrics.map((m) => {
          const collecting = m.baselineStatus === "collecting";
          return (
            <div
              key={m.metricKey}
              className={`rounded-lg border p-3 ${
                collecting
                  ? "border-neutral-200 bg-neutral-50 text-neutral-600"
                  : "border-neutral-300 bg-white"
              }`}
            >
              <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
                {METRIC_LABELS[m.metricKey]}
              </p>
              <p className="mt-2 text-sm font-semibold">
                {collecting ? "Collecting" : "Established"}
              </p>
              <p className="mt-1 text-xs">{directionCaption(m.direction, collecting)}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
