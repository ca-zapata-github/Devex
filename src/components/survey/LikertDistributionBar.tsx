import type { LikertDistribution } from "@/types/survey";

interface LikertDistributionBarProps {
  code: string;
  label: string;
  distribution: LikertDistribution;
  reverseCoded?: boolean;
}

const SEGMENT_COLORS = [
  "bg-neutral-300",
  "bg-neutral-400",
  "bg-neutral-500",
  "bg-sky-400",
  "bg-sky-600",
] as const;

export function LikertDistributionBar({
  code,
  label,
  distribution,
  reverseCoded = false,
}: LikertDistributionBarProps) {
  const buckets = ["1", "2", "3", "4", "5"] as const;
  const total = buckets.reduce((sum, k) => sum + (distribution.counts[k] ?? 0), 0);

  return (
    <article className="rounded-lg border border-neutral-100 bg-white p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="min-w-0 flex-1 text-sm leading-snug text-neutral-800">
          <span className="font-mono text-xs font-semibold text-neutral-400">{code}</span>{" "}
          {label}
          {reverseCoded ? (
            <span className="ml-1.5 text-[10px] font-normal text-neutral-400">(reverse-coded)</span>
          ) : null}
        </p>
        {distribution.median != null ? (
          <span className="shrink-0 text-xs tabular-nums text-neutral-500">
            median {distribution.median.toFixed(1)}
            {distribution.spread != null ? ` ±${distribution.spread.toFixed(1)}` : ""} · n=
            {distribution.n}
          </span>
        ) : (
          <span className="shrink-0 text-xs text-neutral-400">n={distribution.n}</span>
        )}
      </div>

      {total > 0 ? (
        <>
          <div className="mt-3 flex h-7 w-full overflow-hidden rounded-md">
            {buckets.map((k, i) => {
              const count = distribution.counts[k] ?? 0;
              const pct = (count / total) * 100;
              if (pct === 0) return null;
              return (
                <div
                  key={k}
                  className={`relative flex items-center justify-center ${SEGMENT_COLORS[i]}`}
                  style={{ width: `${pct}%` }}
                  title={`${k}: ${count} (${pct.toFixed(0)}%)`}
                >
                  {pct >= 12 ? (
                    <span className="text-[10px] font-medium text-white drop-shadow-sm">{count}</span>
                  ) : null}
                </div>
              );
            })}
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-neutral-400">
            <span>1 · Strongly disagree</span>
            <span>5 · Strongly agree</span>
          </div>
        </>
      ) : (
        <p className="mt-2 text-xs text-neutral-400 italic">No numeric responses</p>
      )}

      {(distribution.counts.na ?? 0) > 0 ? (
        <p className="mt-1 text-[10px] text-neutral-400">N/A: {distribution.counts.na}</p>
      ) : null}
    </article>
  );
}
