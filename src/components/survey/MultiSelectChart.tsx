interface MultiSelectChartProps {
  code: string;
  label: string;
  tallies: Record<string, number>;
  totalResponses: number;
}

export function MultiSelectChart({
  code,
  label,
  tallies,
  totalResponses,
}: MultiSelectChartProps) {
  const max = Math.max(...Object.values(tallies), 1);
  const entries = Object.entries(tallies).sort((a, b) => b[1] - a[1]);

  return (
    <article className="rounded-lg border border-neutral-100 bg-white p-3">
      <p className="text-sm leading-snug text-neutral-800">
        <span className="font-mono text-xs font-semibold text-neutral-400">{code}</span> {label}
      </p>
      <p className="mt-1 text-xs text-neutral-500">n={totalResponses} respondents</p>
      <div className="mt-3 space-y-2">
        {entries.map(([option, count]) => {
          const pct = Math.round((count / totalResponses) * 100);
          const width = (count / max) * 100;
          return (
            <div key={option} className="space-y-0.5">
              <div className="flex items-baseline justify-between gap-2 text-xs">
                <span className="text-neutral-700">{option}</span>
                <span className="tabular-nums text-neutral-500">
                  {count} ({pct}%)
                </span>
              </div>
              <div className="h-2 rounded-full bg-neutral-100">
                <div
                  className="h-2 rounded-full bg-neutral-500"
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}
