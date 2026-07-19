import type { Distribution } from "@/types/metrics";
import { distributionScale } from "@/lib/metrics/format";

interface DistributionBarProps {
  label: string;
  distribution: Distribution;
  colorClass?: string;
  maxScale?: number;
  unit?: string;
}

export function DistributionBar({
  label,
  distribution,
  colorClass = "bg-sky-500",
  maxScale,
  unit = "",
}: DistributionBarProps) {
  const scale = maxScale ?? distributionScale([distribution]);
  const spreadStart = Math.max(0, ((distribution.median - distribution.spread) / scale) * 100);
  const spreadWidth = Math.min(100, ((distribution.spread * 2) / scale) * 100);
  const medianPos = Math.min(100, (distribution.median / scale) * 100);

  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between gap-2 text-xs">
        <span className="font-medium text-neutral-700">{label}</span>
        <span className="tabular-nums text-neutral-500">
          {distribution.median}
          {unit} ±{distribution.spread} · n={distribution.n}
        </span>
      </div>
      <div className="relative h-3 rounded-full bg-neutral-100">
        <div
          className={`absolute top-1/2 h-2 -translate-y-1/2 rounded-full opacity-40 ${colorClass}`}
          style={{ left: `${spreadStart}%`, width: `${spreadWidth}%` }}
        />
        <div
          className={`absolute top-0 h-3 w-0.5 rounded-full ${colorClass}`}
          style={{ left: `${medianPos}%` }}
          title={`Median ${distribution.median}${unit}`}
        />
      </div>
    </div>
  );
}

interface DistributionCompareProps {
  pre: Distribution;
  post?: Distribution;
  unit?: string;
}

export function DistributionCompare({ pre, post, unit = "" }: DistributionCompareProps) {
  const scale = distributionScale(post ? [pre, post] : [pre]);

  return (
    <div className="space-y-3">
      <DistributionBar label="Pre" distribution={pre} colorClass="bg-neutral-500" maxScale={scale} unit={unit} />
      {post ? (
        <DistributionBar label="Post" distribution={post} colorClass="bg-emerald-600" maxScale={scale} unit={unit} />
      ) : (
        <p className="text-xs text-neutral-400 italic">Post measurement pending</p>
      )}
    </div>
  );
}
