import type { Distribution, MetricDirection, MetricSnapshot } from "@/types/metrics";
import { METRIC_LABELS } from "@/types/metrics";

export function directionGlyph(direction: MetricDirection): string {
  switch (direction) {
    case "up":
      return "↑";
    case "down":
      return "↓";
    case "flat":
      return "→";
    default:
      return "—";
  }
}

export function directionCaption(direction: MetricDirection, collecting: boolean): string {
  if (collecting) {
    if (direction === "unknown") return "Collecting";
    return `Collecting · ${directionGlyph(direction)} ${direction}`;
  }
  if (direction === "unknown") return "Established";
  return `${directionGlyph(direction)} ${direction}`;
}

export function buildNorthStarNote(metrics: MetricSnapshot[]): string {
  const value = metrics.find((m) => m.metricKey === "value_vs_overhead");
  const dx = metrics.filter((m) => m.metricKey.startsWith("dx_"));

  const valueLine = value
    ? `Value vs Overhead: ${value.headlineValue ?? "—"} (${value.baselineStatus === "collecting" ? "baseline collecting" : "established"})`
    : "Value vs Overhead: not recorded";

  const dxLine = dx
    .map((m) => `${METRIC_LABELS[m.metricKey]} ${directionCaption(m.direction, m.baselineStatus === "collecting")}`)
    .join(" · ");

  return `${valueLine}. DX Core 4: ${dxLine}. Detail in Scorecard app (G3: no targets until baseline established).`;
}

export function distributionScale(values: Distribution[]): number {
  const max = values.reduce((acc, d) => Math.max(acc, d.median + d.spread), 0);
  return max > 0 ? max * 1.15 : 100;
}

export function formatDistribution(d: Distribution, unit = ""): string {
  return `median ${d.median}${unit} ±${d.spread} (n=${d.n})`;
}
